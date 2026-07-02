import { getQuestionBankPool, getGeminiClient, parseCleanJSON } from "../_utils.js";
import { Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  try {
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
      try {
        const mod = await import("./docker.js");
        questionsPool = mod.dockerQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import docker questions, falling back:", err);
      }
    } else if (trimmedDomain === "linux" || trimmedDomain.includes("linux")) {
      try {
        const mod = await import("./linux.js");
        questionsPool = mod.linuxQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import linux questions, falling back:", err);
      }
    } else if (trimmedDomain === "git" || trimmedDomain.includes("git")) {
      try {
        const mod = await import("./git.js");
        questionsPool = mod.gitQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import git questions, falling back:", err);
      }
    } else if (trimmedDomain === "aws" || trimmedDomain.includes("aws")) {
      try {
        const mod = await import("./aws.js");
        questionsPool = mod.awsQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import aws questions, falling back:", err);
      }
    } else if (trimmedDomain === "kubernetes" || trimmedDomain === "k8s" || trimmedDomain.includes("kubernetes") || trimmedDomain.includes("k8s")) {
      try {
        const mod = await import("./kubernetes.js");
        questionsPool = mod.kubernetesQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import kubernetes questions, falling back:", err);
      }
    } else if (trimmedDomain === "terraform" || trimmedDomain.includes("terraform")) {
      try {
        const mod = await import("./terraform.js");
        questionsPool = mod.terraformQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import terraform questions, falling back:", err);
      }
    } else if (trimmedDomain === "jenkins" || trimmedDomain.includes("jenkins")) {
      try {
        const mod = await import("./jenkins.js");
        questionsPool = mod.jenkinsQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import jenkins questions, falling back:", err);
      }
    } else if (trimmedDomain === "networking" || trimmedDomain.includes("networking")) {
      try {
        const mod = await import("./networking.js");
        questionsPool = mod.networkingQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import networking questions, falling back:", err);
      }
    } else if (trimmedDomain === "security" || trimmedDomain.includes("security") || trimmedDomain.includes("cloud security")) {
      try {
        const mod = await import("./cloud-security.js");
        questionsPool = mod.cloudSecurityQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import cloud security questions, falling back:", err);
      }
    } else if (trimmedDomain === "gcp" || trimmedDomain.includes("gcp") || trimmedDomain.includes("google cloud")) {
      try {
        const mod = await import("./gcp.js");
        questionsPool = mod.gcpQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import gcp questions, falling back:", err);
      }
    } else if (trimmedDomain === "azure" || trimmedDomain.includes("azure") || trimmedDomain.includes("microsoft azure") || trimmedDomain.includes("azzure")) {
      try {
        const mod = await import("./azure.js");
        questionsPool = mod.azureQuestions || [];
      } catch (err) {
        console.warn("Failed to dynamically import azure questions, falling back:", err);
      }
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

    // If matched a curated static question bank and questions are found
    if (questionsPool && questionsPool.length > 0) {
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

  } catch (err: any) {
    console.error("Top-level error caught in question-bank handler:", err);
    // Absolute robust fallback: Never return 500 error!
    try {
      const domain = req.query?.domain || req.body?.domain || "Technical";
      const count = parseInt(req.query?.count || req.body?.count || "5", 10) || 5;
      const pool = getQuestionBankPool(String(domain), "Software Engineer", "Medium", "Standard", "");
      const selected = pool.slice(0, count);
      return res.status(200).json({
        domain: String(domain),
        questions: selected.map((text, idx) => ({
          id: idx + 1,
          question: text,
          text: text,
          answer: "To answer this, share your experience with this technology, highlighting best practices and common pitfalls."
        }))
      });
    } catch (fallbackErr) {
      return res.status(200).json({
        domain: "Technical",
        questions: [
          {
            id: 1,
            question: "Explain your experience with cloud and DevOps platforms.",
            text: "Explain your experience with cloud and DevOps platforms.",
            answer: "To answer this, share your experience with this technology, highlighting best practices and common pitfalls."
          }
        ]
      });
    }
  }
}

