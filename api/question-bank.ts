import { getQuestionBankPool, getGeminiClient, parseCleanJSON } from "./_utils.js";
import { Type } from "@google/genai";
import { dockerQuestions } from "./docker.js";
import { linuxQuestions } from "./linux.js";
import { gitQuestions } from "./git.js";
import { awsQuestions } from "./aws.js";
import { kubernetesQuestions } from "./kubernetes.js";
import { terraformQuestions } from "./terraform.js";
import { jenkinsQuestions } from "./jenkins.js";
import { networkingQuestions } from "./networking.js";
import { cloudSecurityQuestions } from "./cloud-security.js";
import { azureQuestions } from "./azure.js";
import { gcpQuestions } from "./gcp.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Handle parameters from query (GET) or body (POST) to be extremely resilient
  const domain = req.query?.domain || req.body?.domain || "Technical";
  const customTopic = req.query?.customTopic || req.body?.customTopic || "";

  const actualDomain = String(domain);
  const actualCustomTopic = String(customTopic);

  // Parse target quantity/count
  let count = parseInt(req.query?.count || req.query?.limit || req.body?.count || req.body?.limit || "");
  if (isNaN(count)) {
    const counts = [3, 5, 10];
    count = counts[Math.floor(Math.random() * counts.length)];
  }

  const trimmedDomain = actualDomain.trim().toLowerCase();
  let questionsPool: any[] = [];

  const cloudDomains = ["kubernetes", "k8s", "terraform", "jenkins", "networking", "security", "cloud security", "git & github", "git", "jenkins", "cloud computing", "gcp", "azure", "google cloud", "microsoft azure", "azzure"];
  const isCloudDomain = cloudDomains.some(d => trimmedDomain.includes(d));

  if (trimmedDomain === "docker" || trimmedDomain.includes("docker")) {
    questionsPool = dockerQuestions;
  } else if (trimmedDomain === "linux" || trimmedDomain.includes("linux")) {
    questionsPool = linuxQuestions;
  } else if (trimmedDomain === "git" || trimmedDomain.includes("git")) {
    questionsPool = gitQuestions;
  } else if (trimmedDomain === "aws" || trimmedDomain.includes("aws")) {
    questionsPool = awsQuestions;
  } else if (trimmedDomain === "kubernetes" || trimmedDomain === "k8s" || trimmedDomain.includes("kubernetes") || trimmedDomain.includes("k8s")) {
    questionsPool = kubernetesQuestions;
  } else if (trimmedDomain === "terraform" || trimmedDomain.includes("terraform")) {
    questionsPool = terraformQuestions;
  } else if (trimmedDomain === "jenkins" || trimmedDomain.includes("jenkins")) {
    questionsPool = jenkinsQuestions;
  } else if (trimmedDomain === "networking" || trimmedDomain.includes("networking")) {
    questionsPool = networkingQuestions;
  } else if (trimmedDomain === "security" || trimmedDomain.includes("security") || trimmedDomain.includes("cloud security")) {
    questionsPool = cloudSecurityQuestions;
  } else if (trimmedDomain === "gcp" || trimmedDomain.includes("gcp") || trimmedDomain.includes("google cloud")) {
    questionsPool = gcpQuestions;
  } else if (trimmedDomain === "azure" || trimmedDomain.includes("azure") || trimmedDomain.includes("microsoft azure") || trimmedDomain.includes("azzure")) {
    questionsPool = azureQuestions;
  } else if (trimmedDomain === "cloud computing" || trimmedDomain.includes("cloud computing") || trimmedDomain === "cloud") {
    const list = getQuestionBankPool("cloud computing", "Cloud Engineer", "Medium");
    questionsPool = list.map((q, i) => ({
      id: i + 1,
      question: q,
      answer: "A production-grade cloud solution requires high availability, secure VPC subnets, and automated recovery mechanisms."
    }));
  } else if (isCloudDomain) {
    const list = getQuestionBankPool(trimmedDomain, "Cloud DevOps Engineer", "Medium");
    questionsPool = list.map((q, i) => ({
      id: i + 1,
      question: q,
      answer: `To excel in this domain, highlight high-availability design, secure IAM policies, and robust automation pipelines using ${actualDomain}.`
    }));
  }

  console.log(`Question bank called for: ${actualDomain} (Count requested/decided: ${count})`);

  // If matched a curated static question bank
  if (questionsPool.length > 0) {
    const shuffled = [...questionsPool].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    const questions = selected.map((q, idx) => ({
      id: q.id || (idx + 1),
      question: q.question,
      text: q.question, // Backwards compatibility for frontend map((q) => q.text)
      answer: q.answer
    }));

    return res.status(200).json({
      domain: actualDomain,
      questions
    });
  }

  // Fallback: If domain not in static bank, check for Gemini client, else use simulated pool
  const client = getGeminiClient();
  if (client) {
    try {
      const prompt = `Generate a set of exactly ${count} distinct, beginner-friendly interview questions with answers for the domain/technology: "${actualDomain}".
${actualCustomTopic ? `Focus topics: "${actualCustomTopic}".` : ""}
Ensure the questions are clear, practical, and beginner-friendly, and the answers are simple, clear, and educational.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite developer and interviewer. Generate beginner-friendly, highly accurate interview questions and answers for the requested technology/domain in clean JSON format.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "Sequential question ID" },
                question: { type: Type.STRING, description: "The interview question content" },
                answer: { type: Type.STRING, description: "The beginner-friendly answer" }
              },
              required: ["id", "question", "answer"]
            }
          }
        }
      });

      const bodyText = response.text;
      if (bodyText) {
        const aiQuestions = parseCleanJSON(bodyText);
        if (Array.isArray(aiQuestions) && aiQuestions.length > 0) {
          return res.status(200).json({
            domain: actualDomain,
            questions: aiQuestions.slice(0, count).map((q, idx) => ({
              id: q.id || (idx + 1),
              question: q.question,
              text: q.question,
              answer: q.answer
            }))
          });
        }
      }
    } catch (err: any) {
      console.warn("Gemini fallback failed in question-bank, falling back to simulated pool (quota or API error):", err?.message || err);
    }
  }

  // Simulated fallback using getQuestionBankPool from _utils.ts
  const pool = getQuestionBankPool(actualDomain, "Software Engineer", "Medium", "Standard", actualCustomTopic);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  return res.status(200).json({
    domain: actualDomain,
    questions: selected.map((text, idx) => ({
      id: idx + 1,
      question: text,
      text: text,
      answer: "To answer this, share your experience with this technology, highlighting best practices and common pitfalls."
    }))
  });
}

