import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { generateTextWithFallback } from "../ai/generateWithFallback.js";
import { InterviewResult } from "../models/InterviewResult.js";
import { Application } from "../models/Application.js";
import { Job } from "../models/Jobs.js";

export const aiInterviewRouter = Router();

type Role = "ai" | "candidate";
type Msg = { role: Role; content: string; ts: number };

type InterviewSession = {
  id: string;
  userId: string;
  applicationId?: string;
  jobId?: string;

  jobTitle: string;
  company: string;
  totalQuestions: number;
  currentQuestion: number;
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

function clampScore(x: any) {
  const n = Number(x);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

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

function shouldEnd(session: InterviewSession) {
  const asked = session.transcript.filter((m) => m.role === "ai").length;
  return asked >= session.totalQuestions;
}

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
  "overallScore": number,
  "feedback": "string summary",
  "skills": [
    { "skill": "string", "score": number }
  ],
  "strengths": [
    { "title": "string", "description": "string" }
  ],
  "improvements": [
    { "title": "string", "description": "string" }
  ]
}
`.trim();
}

aiInterviewRouter.post(
  "/interview/start",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const applicationId = safeTrim(req.body?.applicationId);

    let jobTitle = safeTrim(req.body?.jobTitle);
    let company = safeTrim(req.body?.company);

    const totalQuestionsRaw = Number(req.body?.totalQuestions ?? 12);
    const totalQuestions = Number.isFinite(totalQuestionsRaw)
      ? Math.min(Math.max(totalQuestionsRaw, 5), 25)
      : 12;

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";

    let jobId: string | undefined;

    if (applicationId) {
      const app = await Application.findOne({ _id: applicationId, candidateId: userId }).lean();
      if (!app) return res.status(404).json({ message: "Application not found" });

      jobId = String((app as any).jobId);

      const job = await Job.findById((app as any).jobId).lean();
      if (job) {
        jobTitle = jobTitle || (job as any).title || "Interview";
        company =
          company ||
          (job as any).company ||
          (job as any).companyName ||
          (job as any).employerName ||
          "Company";
      }

      await Application.updateOne(
        { _id: applicationId, candidateId: userId, interviewStatus: { $ne: "COMPLETED" } },
        { $set: { interviewStatus: "IN_PROGRESS" } }
      );
    }

    if (!jobTitle) return badRequest(res, "jobTitle is required");
    if (!company) return badRequest(res, "company is required");

    const session: InterviewSession = {
      id: newId(),
      userId,
      applicationId: applicationId || undefined,
      jobId,
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
        applicationId: session.applicationId,
      });
    } catch (e: any) {
      return res.status(500).json({
        message: e?.message || "AI interview start failed",
        providerErrors: e?.providerErrors || [],
      });
    }
  }
);


aiInterviewRouter.post(
  "/interview/next",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const sessionId = safeTrim(req.body?.sessionId);
    const answer = safeTrim(req.body?.answer);

    if (!sessionId) return badRequest(res, "sessionId is required");
    if (!answer) return badRequest(res, "answer is required");

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";
    if (session.userId !== userId) return res.status(403).json({ message: "Forbidden" });

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

aiInterviewRouter.get(
  "/interview/analytics",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const results = await InterviewResult.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return res.json({ results });
    } catch {
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);

aiInterviewRouter.get(
  "/interview/:sessionId",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const sessionId = String(req.params.sessionId || "").trim();
    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";
    if (session.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    return res.json({
      sessionId: session.id,
      jobTitle: session.jobTitle,
      company: session.company,
      totalQuestions: session.totalQuestions,
      transcript: session.transcript,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      applicationId: session.applicationId,
    });
  }
);


aiInterviewRouter.post(
  "/interview/end",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const sessionId = safeTrim(req.body?.sessionId);
    if (!sessionId) return badRequest(res, "sessionId is required");

    const session = sessions.get(sessionId);
    if (!session) return res.status(404).json({ message: "Interview session not found" });

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";
    if (session.userId !== userId) return res.status(403).json({ message: "Forbidden" });

    const candidateAnswers = session.transcript.filter((m) => m.role === "candidate");
    const MIN_ANSWERS = 3;

    let analysis: any = null;

    if (candidateAnswers.length < MIN_ANSWERS) {
      analysis = {
        overallScore: 0,
        feedback: `Interview marked incomplete because only ${candidateAnswers.length} answer(s) were provided.`,
        skills: [],
        strengths: [],
        improvements: [],
      };
    } else {
      const prompt = buildAnalysisPrompt(session);
      try {
        const out = await generateTextWithFallback(prompt, ["gemini", "groq", "ollama"]);
        const jsonText = out.text.replace(/```json/g, "").replace(/```/g, "").trim();
        analysis = JSON.parse(jsonText);
      } catch {
        analysis = {
          overallScore: 0,
          feedback: "Could not generate analysis due to an error.",
          skills: [],
          strengths: [],
          improvements: [],
        };
      }
    }

    const overallScore = clampScore(analysis?.overallScore);

    if (session.userId && session.userId !== "unknown") {
      await InterviewResult.create({
        userId: session.userId,
        applicationId: session.applicationId || undefined,
        jobId: session.jobId || undefined,
        jobTitle: session.jobTitle,
        company: session.company,
        overallScore,
        feedback: analysis?.feedback || "",
        skills: analysis?.skills || [],
        strengths: analysis?.strengths || [],
        improvements: analysis?.improvements || [],
        transcript: session.transcript,
      });
    }

    if (session.applicationId) {
      await Application.updateOne(
        { _id: session.applicationId, candidateId: session.userId },
        { $set: { interviewStatus: "COMPLETED", overallScore } }
      );
    }

    sessions.delete(sessionId);
    return res.json({
      ok: true,
      applicationId: session.applicationId,
      analysis: { ...analysis, overallScore },
    });
  }
);


aiInterviewRouter.get(
  "/interview/result/:applicationId",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const applicationId = String(req.params.applicationId || "").trim();
    if (!applicationId) return badRequest(res, "applicationId is required");

    const userId =
      (req as any).user?.id ||
      (req as any).userId ||
      (req as any).auth?.userId ||
      "unknown";

    const app = await Application.findOne({ _id: applicationId, candidateId: userId }).lean();
    if (!app) return res.status(404).json({ message: "Application not found" });

    const result = await InterviewResult.findOne({ userId, applicationId })
      .sort({ createdAt: -1 })
      .lean();

    if (!result) return res.status(404).json({ message: "No interview result found" });

    return res.json(result);
  }
);


aiInterviewRouter.get(
  "/analytics",
  requireAuth,
  requireRole(["candidate", "employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const userId = (req as any).user?.id || (req as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    try {
      const results = await InterviewResult.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      return res.json({ results });
    } catch {
      return res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);
