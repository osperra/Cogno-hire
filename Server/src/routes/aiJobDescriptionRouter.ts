import { Router } from "express";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";
import { generateTextWithFallback } from "../ai/generateWithFallback.js";

export const aiJobDescriptionRouter = Router();

type JDRequest = {
  jobTitle: string;
  experienceLevel: string;
  employmentType: string;
  keySkills: string;
  location?: string;
  salaryRange?: string;
  additionalRequirements?: string;
};

function badRequest(res: any, message: string) {
  return res.status(400).json({ message });
}

function buildPrompt(input: JDRequest) {
  const skills = input.keySkills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return `
You are an expert HR recruiter and technical hiring manager.
Generate a professional, compelling job description.

Return ONLY plain text (no markdown fences).

Job Details:
- Job Title: ${input.jobTitle}
- Experience Level: ${input.experienceLevel}
- Employment Type: ${input.employmentType}
- Key Skills: ${skills.join(", ")}
- Location: ${input.location || "Not specified"}
- Salary Range: ${input.salaryRange || "Not specified"}
- Additional Requirements: ${input.additionalRequirements || "None"}

Output format (use these headings, keep it readable):
<JOB TITLE>

About the Role:
...

Key Responsibilities:
• ...

Required Qualifications:
• ...

Preferred Qualifications:
• ...

What We Offer:
• ...

Application Process:
...
`.trim();
}

aiJobDescriptionRouter.post(
  "/job-description",
  requireAuth,
  requireRole(["employer", "hr"]),
  async (req: AuthedRequest, res) => {
    const body = (req.body || {}) as Partial<JDRequest>;

    if (!body.jobTitle?.trim()) return badRequest(res, "jobTitle is required");
    if (!body.experienceLevel?.trim())
      return badRequest(res, "experienceLevel is required");
    if (!body.employmentType?.trim())
      return badRequest(res, "employmentType is required");
    if (!body.keySkills?.trim()) return badRequest(res, "keySkills is required");

    const prompt = buildPrompt({
      jobTitle: body.jobTitle.trim(),
      experienceLevel: body.experienceLevel.trim(),
      employmentType: body.employmentType.trim(),
      keySkills: body.keySkills.trim(),
      location: body.location?.trim(),
      salaryRange: body.salaryRange?.trim(),
      additionalRequirements: body.additionalRequirements?.trim(),
    });

    try {
      const out = await generateTextWithFallback(prompt, [
        "gemini",
        "groq",
        "ollama",
      ]);

      res.json({ text: out.text, provider: out.provider });
    } catch (e: any) {
      res.status(500).json({
        message: e?.message || "AI generation failed",
        providerErrors: e?.providerErrors || [],
      });
    }

  }
);
