import { Type } from "@google/genai";
import {
  getGeminiClient,
  getSimulatedResumeAnalysis,
  parseCleanJSON
} from "./_utils.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { fileDataBase64, mimeType = "application/pdf", textContent = "", jobDescription = "" } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.status(200).json(getSimulatedResumeAnalysis(textContent, jobDescription));
  }

  try {
    let contents: any[] = [];

    const jobContext = jobDescription ? `Here is the target job description the applicant is aiming for: "${jobDescription}". Ensure your analysis performs a highly realistic applicant tracking system (ATS) match against it, including custom keyword matches.` : "Standard Industry-Wide parameters.";

    if (fileDataBase64) {
      const base64Clean = fileDataBase64.replace(/^data:application\/pdf;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Clean
        }
      });
      contents.push({
        text: `Analyze the attached PDF resume. Identify the skills listed, extract professional strengths, outline areas for improvement, and deliver a concise executive summary of this applicant's competitive profile. ${jobContext}`
      });
    } else {
      contents.push({
        text: `Analyze the following raw text content of a resume:\n\n${textContent}\n\nIdentify skills listed, extract professional strengths, outline direct areas for improvement, and deliver a concise executive summary. ${jobContext}`
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an elite talent acquisition researcher, ATS architect, and resume auditor. Extract precision, factual data.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of hard/soft skills identified on the resume"
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of key competitive professional accomplishments or core strengths"
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Clear actionable recommendations to optimize the resume stand-out factor"
            },
            summary: {
              type: Type.STRING,
              description: "Professional executive summary of candidate portfolio (2-3 sentences)"
            },
            atsScore: {
              type: Type.INTEGER,
              description: "Calculated ATS compliance level from 0 to 100 based on structural quality and relevance"
            },
            keywordMatches: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "A high-leverage industry key term relevant to their role" },
                  matched: { type: Type.BOOLEAN, description: "Whether this keyword exists in their resume transcript" }
                },
                required: ["word", "matched"]
              },
              description: "List of 5-8 relevant keyword matches found or missing"
            },
            missingSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of high-demand technical skills missing from the resume based on target directions"
            }
          },
          required: ["skills", "strengths", "improvements", "summary", "atsScore", "keywordMatches", "missingSkills"]
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("No evaluation returned for the resume upload");
    }

    const analysisResult = parseCleanJSON(bodyText);
    return res.status(200).json(analysisResult);
  } catch (err: any) {
    console.error("Gemini Resume Audit failed:", err);
    return res.status(200).json(getSimulatedResumeAnalysis(textContent, jobDescription));
  }
}
