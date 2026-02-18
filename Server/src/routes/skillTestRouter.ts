import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { generateTextWithFallback } from "../ai/generateWithFallback.js";

const skillTestRouter = Router();

const generateSchema = z.object({
    skill: z.string().min(1).max(50),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
});

skillTestRouter.post("/generate", requireAuth, async (req: AuthedRequest, res) => {
    try {
        const parsed = generateSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid input", issues: parsed.error.issues });
        }

        const { skill, level } = parsed.data;

        const prompt = `
      Generate a multiple-choice skill test for "${skill}" at "${level}" level.
      Create exactly 5 questions.
      Return ONLY a JSON array of objects. Do not include markdown formatting like \`\`\`json.
      Each object must have:
      - "id": number (1-5)
      - "question": string
      - "options": array of 4 strings
      - "correctAnswer": string (must be one of the options)
      
      Example format:
      [
        {
          "id": 1,
          "question": "What is 2+2?",
          "options": ["3", "4", "5", "6"],
          "correctAnswer": "4"
        }
      ]
    `;

        const { text } = await generateTextWithFallback(prompt);

        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const questions = JSON.parse(cleanText);

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Invalid AI response format");
        }

        return res.json({ questions });

    } catch (e) {
        console.error("GENERATE_TEST_ERROR:", e);
        return res.status(500).json({ message: "Failed to generate test. Please try again." });
    }
});

export default skillTestRouter;
