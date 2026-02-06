// Server/src/routes/aiInterviewRouter.ts
import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { generateTextWithFallback } from "../ai/generateWithFallback.js";
import { InterviewResult } from "../models/InterviewResult.js";

export const aiInterviewRouter = Router();

/**
 * In-memory sessions (OK for dev). Replace with Mongo/Redis later.
 */
type Role = "ai" | "candidate";
type Msg = { role: Role; content: string; ts: number };

type InterviewSession = {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  totalQuestions: number;
  currentQuestion: number; // 1-based (next question number to ask)
  createdAt: number;
  updatedAt: number;
  transcript: Msg[];
};

const sessions = new Map<string, InterviewSession>();

function now() {
  return Date.now();
}

function newId() {
  return `${now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function badRequest(res: any, message: string) {
  return res.status(400).json({ message });
}

function safeTrim(v?: string) {
  const t = (v ?? "").trim();
  return t || undefined;
}

/**
 * Prompt builder: asks AI to behave as interviewer.
 * Keeps output short (important for interview turn latency).
 */
function buildInterviewerSystemPrompt(jobTitle: string, company: string) {
  return `
You are an AI interviewer conducting a structured interview.

Rules:
- Return ONLY plain text (no markdown fences).
- Ask exactly ONE question per turn.
- Keep questions concise (max 2-3 sentences).
- Mix: intro, experience, technical, behavioral, scenario, and role-specific questions.
- Adapt based on the candidate's last answer.
- Do NOT output analysis, scoring, or meta commentary.
- If the candidate says they want to stop, acknowledge and end politely.

Context:
- Job Title: ${jobTitle}
- Company: ${company}
`.trim();
}

function buildNextQuestionPrompt(session: InterviewSession, candidateAnswer?: string) {
  const system = buildInterviewerSystemPrompt(session.jobTitle, session.company);

  const askedSoFar = session.transcript.filter((m) => m.role === "ai").length;
  const remaining = Math.max(0, session.totalQuestions - askedSoFar);

  const lastMessages = session.transcript.slice(-10).map((m) => {
    const who = m.role === "ai" ? "Interviewer" : "Candidate";
    return `${who}: ${m.content}`;
  });

  const candidatePart = candidateAnswer
    ? `Candidate just answered: "${candidateAnswer}"`
    : `Start the interview with a brief welcome and the first question.`;

  return `
${system}

Interview progress:
- Total questions: ${session.totalQuestions}
- Asked so far: ${askedSoFar}
- Remaining: ${remaining}

Recent transcript:
${lastMessages.length ? lastMessages.join("\n") : "(none yet)"}

Now:
${candidatePart}

Your output:
- Ask the next single question.
`.trim();
}

/**
 * Decide if we should end session (basic)
 */
function shouldEnd(session: InterviewSession) {
  const asked = session.transcript.filter((m) => m.role === "ai").length;
  return asked >= session.totalQuestions;
}

/**
 * Start interview
 * POST /api/ai/interview/start
 * body: { jobTitle, company, totalQuestions? }
 */
aiInterviewRouter.post(
  "/interview/start",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]), // adjust as you want
  async (req: AuthedRequest, res) => {
    const jobTitle = safeTrim(req.body?.jobTitle);
    const company = safeTrim(req.body?.company);
    const totalQuestionsRaw = Number(req.body?.totalQuestions ?? 12);
    const totalQuestions = Number.isFinite(totalQuestionsRaw) ? Math.min(Math.max(totalQuestionsRaw, 5), 25) : 12;

    if (!jobTitle) return badRequest(res, "jobTitle is required");
    if (!company) return badRequest(res, "company is required");

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";

    const session: InterviewSession = {
      id: newId(),
      userId,
      jobTitle,
      company,
      totalQuestions,
      currentQuestion: 1,
      createdAt: now(),
      updatedAt: now(),
      transcript: [],
    };

    const prompt = buildNextQuestionPrompt(session);

    try {
      // Keep interview turns short
      const out = await generateTextWithFallback(prompt, ["gemini", "groq", "ollama"]);

      session.transcript.push({ role: "ai", content: out.text.trim(), ts: now() });
      session.updatedAt = now();
      sessions.set(session.id, session);

      return res.json({
        sessionId: session.id,
        provider: out.provider,
        questionNumber: 1,
        totalQuestions: session.totalQuestions,
        aiMessage: out.text,
      });
    } catch (e: any) {
      return res.status(500).json({
        message: e?.message || "AI interview start failed",
        providerErrors: e?.providerErrors || [],
      });
    }
  }
);

/**
 * Next turn (candidate answers)
 * POST /api/ai/interview/next
 * body: { sessionId, answer }
 */
aiInterviewRouter.post(
  "/interview/next",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]), // adjust as you want
  async (req: AuthedRequest, res) => {
    const sessionId = safeTrim(req.body?.sessionId);
    const answer = safeTrim(req.body?.answer);

    if (!sessionId) return badRequest(res, "sessionId is required");
    if (!answer) return badRequest(res, "answer is required");

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    // store candidate answer
    session.transcript.push({ role: "candidate", content: answer, ts: now() });
    session.updatedAt = now();

    if (shouldEnd(session)) {
      sessions.set(session.id, session);
      return res.json({
        sessionId: session.id,
        done: true,
        message: "Interview completed",
        transcript: session.transcript,
      });
    }

    const prompt = buildNextQuestionPrompt(session, answer);

    try {
      const out = await generateTextWithFallback(prompt, ["gemini", "groq", "ollama"]);

      session.transcript.push({ role: "ai", content: out.text.trim(), ts: now() });
      session.updatedAt = now();

      // update question number based on ai messages count
      const aiCount = session.transcript.filter((m) => m.role === "ai").length;

      sessions.set(session.id, session);

      return res.json({
        sessionId: session.id,
        provider: out.provider,
        questionNumber: aiCount,
        totalQuestions: session.totalQuestions,
        aiMessage: out.text,
        done: shouldEnd(session),
      });
    } catch (e: any) {
      sessions.set(session.id, session);
      return res.status(500).json({
        message: e?.message || "AI interview next failed",
        providerErrors: e?.providerErrors || [],
      });
    }
  }
);

/**
 * Get transcript
 * GET /api/ai/interview/:sessionId
 */
aiInterviewRouter.get(
  "/interview/:sessionId",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const sessionId = String(req.params.sessionId || "").trim();
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    return res.json({
      sessionId: session.id,
      jobTitle: session.jobTitle,
      company: session.company,
      totalQuestions: session.totalQuestions,
      transcript: session.transcript,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    });
  }
);

/**
 * End interview
 * POST /api/ai/interview/end
 * body: { sessionId }
 */
// Helper to build analysis prompt
function buildAnalysisPrompt(session: InterviewSession) {
  const transcriptText = session.transcript
    .map((m) => `${m.role === "ai" ? "Interviewer" : "Candidate"}: ${m.content}`)
    .join("\n");

  return `
You are an expert interviewer. Analyze the following interview transcript and provide a structured evaluation.

Context:
- Job: ${session.jobTitle}
- Company: ${session.company}

Transcript:
${transcriptText}

Output strictly valid JSON (no markdown fences) with this structure:
{
  "overallScore": number, // 0-100
  "feedback": "string summary",
  "skills": [
    { "skill": "string", "score": number } // extract top 5 relevant skills
  ],
  "strengths": [
    { "title": "string", "description": "string" } // max 3
  ],
  "improvements": [
    { "title": "string", "description": "string" } // max 3
  ]
}
`.trim();
}

/**
 * End interview & Generate Analysis
 * POST /api/ai/interview/end
 * body: { sessionId }
 */
aiInterviewRouter.post(
  "/interview/end",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const sessionId = safeTrim(req.body?.sessionId);
    if (!sessionId) return badRequest(res, "sessionId is required");

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    // Generate analysis
    const prompt = buildAnalysisPrompt(session);
    let analysis = {};

    try {
      // Use a "smart" model if possible, here defaulting to any available
      const out = await generateTextWithFallback(prompt, ["gemini", "groq", "ollama"]);
      const jsonText = out.text.replace(/```json/g, "").replace(/```/g, "").trim();
      analysis = JSON.parse(jsonText);

      // Persist result
      // Try to resolve userId from session.userId. If it's "unknown", you might want to handle it or skip.
      // Assuming session.userId is a valid string ID if authenticated. 
      // Ensure we catch errors if userId is invalid ObjectID or not found.
      if (session.userId && session.userId !== "unknown") {
        await InterviewResult.create({
          userId: session.userId,
          jobTitle: session.jobTitle,
          company: session.company,
          overallScore: (analysis as any).overallScore || 0,
          feedback: (analysis as any).feedback || "",
          skills: (analysis as any).skills || [],
          strengths: (analysis as any).strengths || [],
          improvements: (analysis as any).improvements || [],
          transcript: session.transcript,
        });
      }

    } catch (e) {
      console.error("Failed to generate/save analysis", e);
      analysis = {
        overallScore: 0,
        feedback: "Could not generate analysis due to an error.",
        skills: [],
        strengths: [],
        improvements: []
      };
    }

    sessions.delete(sessionId);
    return res.json({ ok: true, analysis });
  }
);

/**
 * Get Analytics (Latest Result)
 * GET /api/ai/analytics
 */
aiInterviewRouter.get(
  "/analytics",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      // For now, just return the latest one.
      // In a real app, you might want to list all or filter by job.
      const result = await InterviewResult.findOne({ userId }).sort({ createdAt: -1 });

      if (!result) {
        return res.status(404).json({ message: "No analytics found" });
      }

      return res.json(result);
    } catch (e) {
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);
