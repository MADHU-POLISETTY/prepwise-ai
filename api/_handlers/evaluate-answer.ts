import { Type } from "@google/genai";
import {
  getGeminiClient,
  getSimulatedSingleAnswerEvaluation,
  parseCleanJSON,
  getEmbedding,
  cosineSimilarity,
  isGibberishOrInvalid
} from "../_utils.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { question, answer } = req.body;
  const cleanAnswer = (answer || "").trim();
  const client = getGeminiClient();

  if (!client) {
    return res.status(200).json(getSimulatedSingleAnswerEvaluation(question, cleanAnswer));
  }

  try {
    // STEP 1: Generate an ideal answer using Gemini 3.5 Flash
    const idealPrompt = `Question:
"${question}"`;

    const idealResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: idealPrompt,
      config: {
        systemInstruction: `You are an expert interview coach for students and freshers.

Generate ONLY the actual correct answer for the given question.

Rules:

* Simple English.
* Maximum 150 words.
* No generic templates.
* No placeholders.
* No instructions about how to answer.
* Directly answer the question.
* Use bullet points if useful.

Return ONLY JSON:

{
"idealAnswer": ""
}`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            idealAnswer: { type: Type.STRING, description: "Direct and technically correct perfect model answer" }
          },
          required: ["idealAnswer"]
        }
      }
    });

    const idealBodyText = idealResponse.text;
    if (!idealBodyText) {
      throw new Error("No ideal answer returned from Gemini API");
    }
    const idealResult = parseCleanJSON(idealBodyText);
    const idealAnswer = idealResult.idealAnswer || "";

    // Check for empty or spaces only first
    if (!cleanAnswer) {
      return res.status(200).json({
        isMeaningful: false,
        isRelevant: false,
        isTechnicallyCorrect: false,
        score: 0,
        feedback: "No answer provided.",
        improvements: "Please write a response to receive feedback and suggestions.",
        idealAnswer
      });
    }

    if (isGibberishOrInvalid(cleanAnswer)) {
      return res.status(200).json({
        isMeaningful: false,
        isRelevant: false,
        isTechnicallyCorrect: false,
        score: 0,
        feedback: "The answer is invalid, meaningless, or unrelated to the question.",
        improvements: "Please provide a valid, structured answer with professional depth.",
        idealAnswer
      });
    }

    // STEP 2 & 3: Convert to embeddings and calculate cosine similarity
    let similarity = 0;
    try {
      const [userEmbedding, idealEmbedding] = await Promise.all([
        getEmbedding(client, cleanAnswer),
        getEmbedding(client, idealAnswer)
      ]);
      similarity = cosineSimilarity(userEmbedding, idealEmbedding);
    } catch (embedErr) {
      console.log("Using standard similarity metric backup.");
      similarity = 0.5;
    }

    // STEP 4: Call Gemini 3.5 Flash to generate feedback, clamped to scoring rules
    const evaluationPrompt = `You are an elite, highly professional technical interviewer. Evaluate the candidate's answer based on the question and the ideal answer, given a pre-calculated semantic cosine similarity score.

Question:
"${question}"

Ideal Answer:
"${idealAnswer}"

Candidate Answer:
"${cleanAnswer}"

Calculated Cosine Similarity: ${similarity.toFixed(4)}

Strict Scoring Constraints:
- Since Cosine Similarity is ${similarity.toFixed(4)}:
  ${similarity < 0.30 ? `- The Cosine Similarity is less than 0.30. You MUST score this answer exactly 0/10. Feedback should state that the answer is unrelated, meaningless, or incorrect.` : ""}
  ${similarity >= 0.30 && similarity < 0.50 ? `- The Cosine Similarity is between 0.30 and 0.50. You MUST score this answer strictly between 1 and 3 out of 10.` : ""}
  ${similarity >= 0.50 && similarity < 0.70 ? `- The Cosine Similarity is between 0.50 and 0.70. You MUST score this answer strictly between 4 and 6 out of 10.` : ""}
  ${similarity >= 0.70 && similarity < 0.85 ? `- The Cosine Similarity is between 0.70 and 0.85. You MUST score this answer strictly between 7 and 8 out of 10.` : ""}
  ${similarity >= 0.85 ? `- The Cosine Similarity is greater than 0.85. You MUST score this answer strictly between 9 and 10 out of 10.` : ""}

Your task:
1. Determine if the answer is completely meaningless, off-topic, gibberish, or keyboard mashing. If so, return a score of 0 and feedback of "The answer is invalid, meaningless, or unrelated to the question."
2. Assess correctness, completeness, and clarity.
3. Provide professional feedback and actionable concrete improvements.
4. Provide a precise integer score matching the strict similarity constraint above.

Return your evaluation inside a valid JSON object matching this schema:
{
  "isMeaningful": true,
  "isRelevant": true,
  "isTechnicallyCorrect": true,
  "score": 0,
  "feedback": "Detailed professional feedback here",
  "improvements": "Actionable improvements here"
}`;

    const evalResponse = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: evaluationPrompt,
      config: {
        systemInstruction: "You are an elite technical lead evaluating candidates with high precision and fairness.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMeaningful: { type: Type.BOOLEAN, description: "True if the answer is meaningful, false if it is gibberish or keyboard mashing" },
            isRelevant: { type: Type.BOOLEAN, description: "True if relevant, false if completely off-topic" },
            isTechnicallyCorrect: { type: Type.BOOLEAN, description: "True if correct, false if contains major errors" },
            score: { type: Type.INTEGER, description: "Score out of 10 matching the strict cosine similarity bounds" },
            feedback: { type: Type.STRING, description: "Comprehensive, structured professional feedback" },
            improvements: { type: Type.STRING, description: "Actionable constructive guidelines" }
          },
          required: ["isMeaningful", "isRelevant", "isTechnicallyCorrect", "score", "feedback", "improvements"]
        }
      }
    });

    const evalBodyText = evalResponse.text;
    if (!evalBodyText) {
      throw new Error("No evaluation details returned from Gemini API");
    }

    const evalResult = parseCleanJSON(evalBodyText);

    let isMeaningful = evalResult.isMeaningful !== false;
    let isRelevant = evalResult.isRelevant !== false;
    let isTechnicallyCorrect = evalResult.isTechnicallyCorrect === true;
    let score = typeof evalResult.score === "number" ? evalResult.score : parseInt(evalResult.score) || 0;
    let feedback = evalResult.feedback || "";
    let improvements = evalResult.improvements || "";

    // Double check for invalid/gibberish answers
    if (!isMeaningful || !isRelevant) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isTechnicallyCorrect = false;
    }

    // Programmatic override to guarantee 100% adherence to strict similarity-based scoring rules
    if (similarity < 0.30) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isMeaningful = false;
      isRelevant = false;
      isTechnicallyCorrect = false;
    } else if (similarity >= 0.30 && similarity < 0.50) {
      score = Math.max(1, Math.min(3, score));
    } else if (similarity >= 0.50 && similarity < 0.70) {
      score = Math.max(4, Math.min(6, score));
    } else if (similarity >= 0.70 && similarity < 0.85) {
      score = Math.max(7, Math.min(8, score));
    } else if (similarity >= 0.85) {
      score = Math.max(9, Math.min(10, score));
    }

    return res.status(200).json({
      isMeaningful,
      isRelevant,
      isTechnicallyCorrect,
      score,
      feedback,
      improvements,
      idealAnswer
    });
  } catch (err: any) {
    console.log("Local backup evaluation mode activated successfully.");
    const fallbackResult = getSimulatedSingleAnswerEvaluation(question, cleanAnswer);
    const isQuotaError = err?.message?.includes("quota") || err?.toString()?.includes("quota") || err?.message?.includes("429") || err?.toString()?.includes("429");
    const warningPrefix = isQuotaError 
      ? "⚠️ [API QUOTA EXCEEDED - OFFLINE AGENT FALLBACK]\n" 
      : "⚠️ [API OFFLINE - OFFLINE AGENT FALLBACK]\n";
    fallbackResult.feedback = warningPrefix + fallbackResult.feedback;
    return res.status(200).json(fallbackResult);
  }
}
