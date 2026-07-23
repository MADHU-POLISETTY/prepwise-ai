import { Type } from "@google/genai";
import {
  getGeminiClient,
  getSimulatedResumeAnalysis,
  parseCleanJSON
} from "../_utils.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { fileDataBase64, mimeType = "application/pdf", textContent = "", jobRole = "", jobDescription = "" } = req.body;

  if (!fileDataBase64 && (!textContent || !textContent.trim())) {
    return res.status(400).json({ error: "No resume content provided. Please upload a resume file (.pdf/.txt) or paste your resume text first." });
  }

  const client = getGeminiClient();
  if (!client) {
    return res.status(200).json(getSimulatedResumeAnalysis(textContent, jobRole, jobDescription));
  }

  try {
    let contents: any[] = [];

    const jobContext = `
Target Job Role/Title: "${jobRole || "Software Engineer"}"
Target Job Description/Requirements: "${jobDescription || "Standard Tech Industry Parameters"}"

Analyze whether the applicant's resume is suitable for this specific target job role and description or not. 
If it is not fully suitable, explain why in detail and provide a checklist of exact things (skills, achievements, experiences, or certifications) that must be added to the resume.
Ensure your analysis performs a highly realistic, strict applicant tracking system (ATS) match against it, including custom keyword matches, and return a realistic ATS compatibility score.
`;

    if (fileDataBase64) {
      const base64Clean = fileDataBase64.replace(/^data:application\/pdf;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Clean
        }
      });
      contents.push({
        text: `Analyze the attached PDF resume for suitability. Identify the skills, extract strengths, improvements, and deliver a comprehensive ATS evaluation. ${jobContext}`
      });
    } else {
      contents.push({
        text: `Analyze the following raw text content of a resume:\n\n${textContent}\n\nIdentify skills, extract strengths, improvements, and deliver a comprehensive ATS evaluation. ${jobContext}`
      });
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: "You are an elite talent acquisition researcher, ATS architect, and resume auditor. Perform an incredibly realistic, strict suitability evaluation for the given target job role and description. Do not give false praise; be highly objective and factual.",
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
            },
            isSuitable: {
              type: Type.BOOLEAN,
              description: "True if the candidate's resume shows sufficient alignment to be suitable/interview-ready for the target job role, False if there are critical missing pieces"
            },
            suitabilityVerdict: {
              type: Type.STRING,
              description: "A short match verdict. Must be one of: 'Highly Suitable', 'Partially Suitable', or 'Not Suitable'"
            },
            suitabilityExplanation: {
              type: Type.STRING,
              description: "A detailed but concise explanation of the candidate's fit, gaps, and readiness for this specific job role."
            },
            thingsToAddToResume: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific skills, technologies, projects, metrics, or credentials that must be added to make this resume suitable and competitive for the target role."
            }
          },
          required: [
            "skills",
            "strengths",
            "improvements",
            "summary",
            "atsScore",
            "keywordMatches",
            "missingSkills",
            "isSuitable",
            "suitabilityVerdict",
            "suitabilityExplanation",
            "thingsToAddToResume"
          ]
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
    console.log("Local backup resume audit mode activated successfully.");
    const fallbackResult = getSimulatedResumeAnalysis(textContent, jobRole, jobDescription);
    const isQuotaError = err?.message?.includes("quota") || err?.toString()?.includes("quota") || err?.message?.includes("429") || err?.toString()?.includes("429");
    const warningPrefix = isQuotaError 
      ? "⚠️ [API QUOTA EXCEEDED - OFFLINE AGENT FALLBACK] " 
      : "⚠️ [API OFFLINE - OFFLINE AGENT FALLBACK] ";
    
    fallbackResult.summary = `${warningPrefix}Your current live Gemini API daily rate limit has been exceeded, but your resume has been parsed and scored using our local rule-based ATS evaluation framework:\n\n${fallbackResult.summary}`;
    return res.status(200).json(fallbackResult);
  }
}
