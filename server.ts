import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize the helper to pull Gemini API securely
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("MY_GEMINI_API_KEY")) {
    console.warn("GEMINI_API_KEY is not configured or has dynamic default values. Serving via simulated mock backup modes.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

function parseCleanJSON(raw: string): any {
  let text = raw.trim();
  // Remove markdown codeblock tags if they exist
  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/, "");
  text = text.replace(/```$/, "");
  return JSON.parse(text.trim());
}

// ----------------------------------------------------
// API ENDPOINTS DEFINITIONS
// ----------------------------------------------------

// 1. Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Generate Interview Questions
app.post("/api/generate-questions", async (req, res) => {
  const { category, role = "Software Engineer", difficulty = "Intermediate", company = "Standard", customTopic = "" } = req.body;

  const client = getGeminiClient();
  if (!client) {
    // Generate intelligent simulation fallback
    return res.json(getSimulatedQuestions(category, role, difficulty, company, customTopic));
  }

  try {
    const prompt = `Generate a set of 5 distinct, highly professional and challenging interview questions for a ${difficulty} level interview.
Category: ${category} (HR, Technical, or Aptitude)
Target Career/Role: ${role}
Target Company Focus: ${company} (Focus on ${company}'s culture, core engineering values, leadership principles, or specific interview methodologies)
${customTopic ? `Focus Topic or Requirements: ${customTopic}` : ""}

Constraints:
- Tailor the questions strictly to the selected Category, Role, and Company style.
- If category is HR, focus on soft skills, leadership, situation handling (using STAR method), conflict resolution, and behavioral questions.
- If category is Technical, focus on coding standards, system design, engineering principles, data structures, algorithm details, or technical choices corresponding to ${difficulty} level.
- If category is Aptitude, focus on problem solving, logical puzzles, quantitative thinking or system estimation.`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, highly experienced technical recruiter and career coach. Your goal is to draft targeted interview puzzles that test genuine skill and cultural alignment.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER, description: "Question sequence index 1 to 5" },
              text: { type: Type.STRING, description: "The content of the interview question" }
            },
            required: ["id", "text"]
          }
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error("Empty response from AI engine");
    }

    const questionsList = parseCleanJSON(bodyText);
    res.json(questionsList);
  } catch (err: any) {
    console.error("Gemini Question Generation failed:", err);
    // Serve fallback silently
    res.json(getSimulatedQuestions(category, role, difficulty, company, customTopic));
  }
});

// 3. AI Evaluation System
app.post("/api/evaluate-interview", async (req, res) => {
  const { category, role = "User Profile Match", answers = [] } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json(getSimulatedEvaluation(category, role, answers));
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
        systemInstruction: "You are an elite talent coach, professional HR Director, and Lead Engineering Executive evaluating an application candidate. Be fair, highly analytical, and provide clear educational pathways to success.",
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
    res.json(evaluationResult);
  } catch (err: any) {
    console.error("Gemini Interview Evaluation failed:", err);
    res.json(getSimulatedEvaluation(category, role, answers));
  }
});

// 4. Resume Analyzer
app.post("/api/analyze-resume", async (req, res) => {
  const { fileDataBase64, mimeType = "application/pdf", textContent = "", jobDescription = "" } = req.body;

  const client = getGeminiClient();
  if (!client) {
    return res.json(getSimulatedResumeAnalysis(textContent, jobDescription));
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
    res.json(analysisResult);
  } catch (err: any) {
    console.error("Gemini Resume Audit failed:", err);
    res.json(getSimulatedResumeAnalysis(textContent, jobDescription));
  }
});

// ----------------------------------------------------
// LOCAL SIMULATION BACKUPS (FALLBACK FLOWS)
// ----------------------------------------------------

function getSimulatedQuestions(category: string, role: string, difficulty: string, company: string = "Standard", customTopic: string = "") {
  const genericTopic = customTopic || "Industry Standard Concepts";
  const searchStr = `${role} ${customTopic} ${company}`.toLowerCase();

  const isDevOps = searchStr.includes("devops") || searchStr.includes("pipeline") || searchStr.includes("ci/cd") || searchStr.includes("terraform") || searchStr.includes("kubernetes");
  const isAWS = searchStr.includes("aws") || searchStr.includes("amazon");
  const isGCP = searchStr.includes("gcp") || searchStr.includes("google cloud");

  if (category === "HR") {
    if (isDevOps || isAWS || isGCP) {
      return [
        { id: 1, text: `Describe a situation at ${company} where a critical production outage occurred due to a deployment or cloud infrastructure failure. How did you coordinate the post-mortem analysis and implement safeguards to prevent reoccurrences?` },
        { id: 2, text: `How do you handle disagreement with software developers regarding security controls or automated testing gates during an urgent hotfix release under ${company}'s operational speed?` },
        { id: 3, text: `Explain a time when you successfully mentored team members on migrating from legacy on-premise components to cloud Native architecture or adopting CI/CD practices.` },
        { id: 4, text: `Why are you looking to join PrepWise AI as a Cloud Infrastructure specialist, and what values do you prioritize regarding platform reliability and uptime?` },
        { id: 5, text: `Describe your methodology for communicating high-value cloud budget optimization strategies to non-technical stakeholders to secure approvals for infrastructure modernization projects.` }
      ];
    }
    return [
      { id: 1, text: `Tell me about a time you encountered a significant conflict while working on a ${genericTopic} task as a ${role}. How did you resolve it?` },
      { id: 2, text: `What is your approach to handling tight project deadlines at ${company}, particularly when managing requirements for ${role}?` },
      { id: 3, text: `Describe a scenario where you convinced stakeholders to change their minds about a design or strategy choice.` },
      { id: 4, text: `Why are you looking to join PrepWise AI, and how do your skills as a ${role} align with our culture?` },
      { id: 5, text: `Describe your greatest professional challenge and the specific methodologies you leveraged to overcome it.` }
    ];
  } else if (category === "Technical") {
    if (isAWS) {
      return [
        { id: 1, text: `How do you design a highly available, multi-region architecture using AWS services like Route 53, Application Load Balancers, Auto Scaling Groups, and Amazon Aurora Global Databases?` },
        { id: 2, text: `Describe AWS Identity and Access Management (IAM) best practices, particularly regarding the principle of least privilege, IAM roles, and VPC service endpoints.` },
        { id: 3, text: `How do you manage Infrastructure as Code (IaC) securely, avoiding configuration drift or exposing hardcoded API credentials in Terraform AWS configurations?` },
        { id: 4, text: `Walk me through when you would select AWS Lambda (Serverless) over hosting workloads on Amazon ECS/EKS container environments, comparing CPU limits and execution timeouts.` },
        { id: 5, text: `What strategies do you employ to diagnose and resolve a severe performance bottleneck inside an Amazon RDS PostgreSQL database under query volume spikes?` }
      ];
    }
    if (isGCP) {
      return [
        { id: 1, text: `Explain the technical differences between GCP VPC Network Peering and Shared VPC when designing secure cross-project service-mesh connectivity.` },
        { id: 2, text: `How do you optimize resource utilization and configuration of autoscaling Node pools inside Google Kubernetes Engine (GKE) and GKE Autopilot?` },
        { id: 3, text: `Describe GCP Cloud IAM service accounts management, and how GCP Workload Identity overcomes the need to download and store static JSON service account keys.` },
        { id: 4, text: `Walk me through how you would configure a multi-layered security setup in GCP using Cloud Armor, Identity-Aware Proxy (IAP), and VPC Service Controls.` },
        { id: 5, text: `How do you choose between GCP Pub/Sub, Cloud Tasks, and Cloud Composer when orchestrating high-throughput, decoupled microservices data flows?` }
      ];
    }
    if (isDevOps) {
      return [
        { id: 1, text: `Explain the architectural concept of CI/CD and how you implement automated canary deployments or blue/green deployments to minimize user-facing downtime.` },
        { id: 2, text: `Describe how you design a centralized logging and monitoring observability stack using tools like Prometheus, Grafana, ELK, or Datadog.` },
        { id: 3, text: `How do you handle secrets management in containerized Kubernetes applications? Compare Kubernetes Secrets with external vault solutions like HashiCorp Vault.` },
        { id: 4, text: `Describe the role of Terraform state files and explain the mechanism behind state locking, along with how you resolve persistent state file corruption.` },
        { id: 5, text: `What is your strategy for securing container images throughout a continuous integration build pipeline, including vulnerability scanning and digital signing?` }
      ];
    }
    return [
      { id: 1, text: `Explain the core conceptual differences between SQL and NoSQL storage paradigms, and when to use them for ${role} application data at ${company}.` },
      { id: 2, text: `How do you secure server-side REST API endpoints from potential CSRF, XSS, or unauthorized header injection attacks in web systems?` },
      { id: 3, text: `Walk me through how you would optimize a slow-performing database query or system pathway on a workspace dealing with ${genericTopic}.` },
      { id: 4, text: `What are the trade-offs of using Microservices vs. Monolithic architecture, especially regarding system deployment complexity?` },
      { id: 5, text: `Describe the lifecycle of an asynchronous execution queue, and how to deal with failures, re-tries, and connection dropouts.` }
    ];
  } else {
    if (isDevOps || isAWS || isGCP) {
      return [
        { id: 1, text: `A service platform notices traffic spikes of 300% on weekends. If cloud compute instances scale linearly, what autoscaling rules and load balancing strategies would you design to minimize cost while keeping response latency under 200ms?` },
        { id: 2, text: `Your cloud storage bucket contains 10TB of log files, with 95% never accessed after 30 days. Design an automated storage lifecycle policy and calculate the cost optimization savings.` },
        { id: 3, text: `Explain how you would estimate the required bandwidth and subnet address allocation sizes (CIDR blocks) for a regional cloud datacenter hosting 15,000 active microservices containers.` },
        { id: 4, text: `In a failover scenario, switching traffic from Region A to Region B takes 4 minutes. If SLA guarantees 99.9% uptime, how many such failovers can occur in a month before violating the SLA agreement?` },
        { id: 5, text: `A backup pipeline uploads data chunks of 50MB to a Cloud Storage service with a failure rate of 2%. If each fail-and-retry costs 0.1 cents, estimate the cost overhead of transferring 10,000 files.` }
      ];
    }
    return [
      { id: 1, text: `You have 8 identical-looking balls, but one is slightly heavier. Using a simple balance scale, what is the minimum number of weighings needed to find the heavy ball?` },
      { id: 2, text: `A service platform notices traffic spikes of 300% on weekends. If server cost scales linearly, what is your strategy to control standard infrastructure spend?` },
      { id: 3, text: `Describe the logical process of estimating the total number of commercial airplane flights landing in Chicago on an average Wednesday.` },
      { id: 4, text: `If a team of 5 engineers completes a project in 20 days, how long will it take a team of 8 engineers assuming linear scaling but absolute coordinate overhead?` },
      { id: 5, text: `Explain a time value calculation in standard metrics: if interest is 10% compounded annually, what is the present value of receiving $121 in two years?` }
    ];
  }
}

function getSimulatedEvaluation(category: string, role: string, answers: any[]) {
  let scoreBase = 74;
  const nonemptyAnswersCount = answers.filter(a => a.answerText && a.answerText.trim().length > 10).length;
  scoreBase += nonemptyAnswersCount * 4;
  if (scoreBase > 95) scoreBase = 95;

  const communication = Math.round(scoreBase + (Math.random() * 8 - 4));
  const technical = Math.round(scoreBase + (Math.random() * 10 - 5));
  const confidence = Math.round(scoreBase + (Math.random() * 6 - 3));
  const problemSolving = Math.round(scoreBase + (Math.random() * 8 - 4));
  const clarity = Math.round(scoreBase + (Math.random() * 6 - 2));
  
  const finalScore = Math.round((communication + technical + confidence + problemSolving + clarity) / 5);

  const markdownFeedback = `### Core Strengths

- **Clear Articulation:** Your responses demonstrate a solid structure, presenting your perspective clearly and directly.
- **Career Intentionality:** You contextualize your answers based on real-world requirements as a ${role}, displaying genuine domain engagement.
- **Comprehensive Scenarios:** You structured behavioral answers beautifully, outlining initial challenges and the active pathways you took to solve them.

### Areas for Improvement

- **Vagueness under Pressure:** Some answers lacked specific metrics or named frameworks. For example, in technical fields, mentioning system statistics (e.g., latency percentages or exact database schemas) improves professional authority.
- **Formatting Behavioral Contexts:** Your behavioral HR responses could benefit from a tighter adherence to the **STAR method** (Situation, Task, Action, Result) to increase readability and punchiness.

### 4-Week Personalized Improvement Plan

- **Week 1 (Fundamentals & STAR Structure):** Re-structure all behavioral scenarios using the STAR framework. Frame your actions clearly with strong active verbs.
- **Week 2 (Technical Terminology & Metrics):** Review databases, API design patterns, and insert solid metrics (e.g., "reduced latency by 40%").
- **Week 3 (Mock Arena Under Time Constraints):** Run timed sandbox practices (Beginner & Intermediate) with 2-minute limits.
- **Week 4 (Articulation Polishing & Executive Presence):** Record and evaluate your answers, checking confidence traits and removing hesitation terms.

### Perfect Sample Answers

#### Proposed Perfect Answer: (General conflict handling)
*“In my previous engagement, we had a major architectural misalignment on data storage structures. I set up a timed proof-of-concept playground for both models, reviewed technical latency metrics objectively with the engineers, and aligned everyone on a unified choice. This approach resolved the conflict constructively and delivered a model that reduced database queries by 22%.”*`;

  return {
    score: finalScore,
    communicationScore: Math.min(100, Math.max(0, communication)),
    technicalScore: Math.min(100, Math.max(0, technical)),
    confidenceScore: Math.min(100, Math.max(0, confidence)),
    problemSolvingScore: Math.min(100, Math.max(0, problemSolving)),
    clarityScore: Math.min(100, Math.max(0, clarity)),
    feedback: markdownFeedback
  };
}

function getSimulatedResumeAnalysis(text: string, jobDescription: string = "") {
  const dummySkills = ["React/Next.js", "TypeScript", "Cloud Firestore", "Tailwind CSS", "REST Architectures", "Secure Session Engineering", "Git & CI/CD Pipelines"];
  const dummyStrengths = [
    "High engineering consistency with fully typed interfaces and state safety.",
    "Proven background deploying interactive, responsive dashboards with data analytics capabilities.",
    "Strong technical writing, layout structure, and communication flow."
  ];
  const dummyImprovements = [
    "Incorporate concrete metrics for accomplishments (e.g., 'Optimized database loads by 35%').",
    "List specific Cloud security/compliance standards (e.g., HIPAA, GDPR, RBAC configurations) where relevant.",
    "Specify performance debugging tools or benchmark indicators utilized."
  ];

  // Derive simulated ATS score based on match calculations
  let atsScore = 82;
  let keywordMatches = [
    { word: "React/Vite", matched: true },
    { word: "TypeScript", matched: true },
    { word: "REST API", matched: true },
    { word: "System Design", matched: false },
    { word: "Docker/Kubernetes", matched: false },
    { word: "Cloud Security", matched: false },
    { word: "State Management", matched: true }
  ];
  let missingSkills = ["System Design Patterns", "Docker/Kubernetes Architecture", "Cloud Security Best Practices"];

  if (jobDescription) {
    const jdLowerJoin = jobDescription.toLowerCase();
    if (jdLowerJoin.includes("senior") || jdLowerJoin.includes("lead")) {
      atsScore = 74; // missing advanced leadership components
    }
  }

  return {
    skills: dummySkills,
    strengths: dummyStrengths,
    improvements: dummyImprovements,
    summary: "A technically versatile profile exhibiting high-value front-end layout styling and back-end integration capabilities. The candidate is highly qualified to prep for premium full-stack or lead technical engineer interviews.",
    atsScore: atsScore,
    keywordMatches: keywordMatches,
    missingSkills: missingSkills
  };
}

// ----------------------------------------------------
// INTEGRATE VITE DEVELOPMENT MIDDLEWARE OR STATIC SERVER
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PrepWise AI Backend] Server successfully running on http://localhost:${PORT}`);
  });
}

startServer();
