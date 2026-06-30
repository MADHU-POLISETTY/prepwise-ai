import { Type } from "@google/genai";
import {
  getGeminiClient,
  getSimulatedEvaluation,
  parseCleanJSON
} from "../_utils.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { category, role = "User Profile Match", answers = [] } = req.body;
  const client = getGeminiClient();

  if (!client) {
    return res.status(200).json(getSimulatedEvaluation(category, role, answers));
  }

  try {
    const formattedAnswers = answers.map((ans: any) => {
      return `Q${ans.questionId}: [${ans.questionText}]\nUser Answer: "${ans.answerText || '[No answer submitted]'}"`;
    }).join("\n\n");

    const prompt = `Review and evaluate the user's answers for a ${category} interview as a ${role}.

Here are the questions and user answers:
${formattedAnswers}

Please perform an in-depth, rigorous analysis of the answers. Provide:
1. An overall composite score (0 to 100).
2. Communication Score (0-100) - Evaluating articulation, coherence, grammar, list structures, and brevity.
3. Technical Score (0-100) - Evaluating terminology accuracy, context depth, conceptual correctness, logic.
4. Confidence Score (0-100) - Evaluating assertive phrasing, lack of hesitation indicators, active verbs.
5. Problem Solving Score (0-100) - Evaluating structural approach, analytical frameworks, and result outcomes.
6. Clarity Score (0-100) - Evaluating formatting, readability, and delivery.
7. In-depth textual feedback in raw Markdown format. Write this in an elegant, inspiring, objective, and constructive style. Make sure to structure it using exactly these Markdown headings:
   - ### Core Strengths: (Detailed review of what they nailed)
   - ### Areas for Improvement: (Constructive criticism of missed marks, logic flaws, or superficial explanations)
   - ### 4-Week Personalized Improvement Plan: (Provide a week-by-week step-by-step custom actionable schedule)
   - ### Perfect Sample Answers: Provide 1-2 examples of high-performing model answers for the questions they struggled with.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite talent coach, professional HR Director, and Lead Engineering Executive evaluating an application candidate. Be fair, highly analytical, and provide clear educational pathways to success. CRITICAL SCORING COMPLIANCE REQUIREMENT: You must evaluate strictly and factually. If the user submits incorrect, superficial, single-sentence, blank, or nonsensical answers (such as simple repeated test letters like 'asdf'), you MUST award extremely low score metrics (e.g. 5 to 40) for those sections and penalize the overall composite score heavily. Only award scores above 80% for high-quality, conceptually accurate, and detailed responses that directly solve or correctly address the questions with strong structural logic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "Calculated composite scoring metric (0-100)" },
            communicationScore: { type: Type.INTEGER, description: "Communication excellence score (0-100)" },
            technicalScore: { type: Type.INTEGER, description: "Technical correctness and factual precision score (0-100)" },
            confidenceScore: { type: Type.INTEGER, description: "Confidence and assertion layout score (0-100)" },
            problemSolvingScore: { type: Type.INTEGER, description: "Analytical logic and framework thinking score (0-100)" },
            clarityScore: { type: Type.INTEGER, description: "Syntactic structure, brevity, and articulation score (0-100)" },
            feedback: { type: Type.STRING, description: "Exhaustive personalized commentary, strengths/weaknesses and week-by-week plan in standard Markdown format" }
          },
          required: ["score", "communicationScore", "technicalScore", "confidenceScore", "problemSolvingScore", "clarityScore", "feedback"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No evaluation response text returned from model");
    }

    const evaluationResult = parseCleanJSON(bodyText);

    // Calculate factual mathematical average of individual question scores to ground the score
    const individualScoresSum = answers.reduce((sum: number, ans: any) => {
      const val = typeof ans.score === 'number' ? ans.score : parseInt(ans.score as any) || 0;
      return sum + val;
    }, 0);
    const maxScorePossible = answers.length * 10;
    const mathAvgScorePercent = maxScorePossible > 0 ? Math.round((individualScoresSum / maxScorePossible) * 100) : 0;

    evaluationResult.score = mathAvgScorePercent;

    // Align other metrics consistently with actual performance
    const clampSubScore = (subScore: any) => {
      if (mathAvgScorePercent === 0) return 0;
      const parsedSub = typeof subScore === 'number' ? subScore : parseInt(subScore) || 50;
      return Math.min(100, Math.max(0, Math.min(parsedSub, mathAvgScorePercent + 10)));
    };

    evaluationResult.communicationScore = clampSubScore(evaluationResult.communicationScore);
    evaluationResult.technicalScore = clampSubScore(evaluationResult.technicalScore);
    evaluationResult.confidenceScore = clampSubScore(evaluationResult.confidenceScore);
    evaluationResult.problemSolvingScore = clampSubScore(evaluationResult.problemSolvingScore);
    evaluationResult.clarityScore = clampSubScore(evaluationResult.clarityScore);

    return res.status(200).json(evaluationResult);
  } catch (err: any) {
    console.warn("Gemini Interview Evaluation rate limit or API error (gracefully falling back to local simulation):", err?.message || err);
    const fallbackResult = getSimulatedEvaluation(category, role, answers);
    const isQuotaError = err?.message?.includes("quota") || err?.toString()?.includes("quota") || err?.message?.includes("429") || err?.toString()?.includes("429");
    const warningPrefix = isQuotaError 
      ? "> ⚠️ **[API QUOTA EXCEEDED - OFFLINE AGENT FALLBACK]** Your current live Gemini API daily rate limit has been exceeded, but your overall performance has been compiled using our local scoring rules.\n\n" 
      : "> ⚠️ **[API OFFLINE - OFFLINE AGENT FALLBACK]** Could not reach the live Gemini server, but your overall performance has been compiled using our local scoring rules.\n\n";
    fallbackResult.feedback = warningPrefix + fallbackResult.feedback;
    return res.status(200).json(fallbackResult);
  }
}
