import { Type } from "@google/genai";
import {
  getGeminiClient,
  getSimulatedQuestions,
  parseCleanJSON
} from "../_utils.js";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { 
      category, 
      domain, 
      difficulty = "Medium", 
      numQuestions: rawNumQuestions = 5, 
      role = "Software Engineer", 
      company = "Standard", 
      customTopic = "",
      previousQuestions = [],
      questionMode = "hybrid", // "ai" | "bank" | "hybrid"
      pinnedQuestions = [] // Specific question texts selected by the user to be included
    } = req.body || {};

  const numQuestions = parseInt(rawNumQuestions as any, 10) || 5;

  // Sanitize arrays to prevent null, non-string, or invalid item properties from crashing the server
  const cleanPreviousQuestions: string[] = Array.isArray(previousQuestions)
    ? previousQuestions
        .map((q: any) => {
          if (!q) return "";
          if (typeof q === "string") return q.trim();
          if (typeof q === "object") {
            return (q.text || q.questionText || q.question || "").trim();
          }
          return "";
        })
        .filter((q: string) => q.length > 0)
    : [];

  const cleanPinnedQuestions: string[] = Array.isArray(pinnedQuestions)
    ? pinnedQuestions
        .map((q: any) => {
          if (!q) return "";
          if (typeof q === "string") return q.trim();
          if (typeof q === "object") {
            return (q.text || q.questionText || q.question || "").trim();
          }
          return "";
        })
        .filter((q: string) => q.length > 0)
    : [];

  // Align domain and category
  const selectedDomain = domain || category || "Technical";
  const domainLower = selectedDomain.toLowerCase();

  let domainScope = "";
  if (domainLower.includes("java")) {
    domainScope = `
Target Domain is strictly JAVA.
Allowed topics to generate:
- OOP concepts
- Collections
- Multithreading
- Exception Handling
- JDBC
- Spring Boot
- JVM
- Memory Management
- Java 8 Features
- Design Patterns

CRITICAL PRECLUSION: Do NOT include AWS, DevOps, Aptitude, or System Design concepts in any of the questions. All questions must focus on core Java ecosystem and software development using Java.
`;
  } else if (domainLower.includes("python")) {
    domainScope = `
Target Domain is strictly PYTHON.
Allowed topics to generate:
- OOP in Python
- Decorators
- Generators
- List Comprehensions
- NumPy
- Pandas
- Flask
- Django
- Exception Handling
- Python Interview Questions

CRITICAL PRECLUSION: Do NOT include Java, DevOps, Aptitude, AWS, or unrelated system architectures. All questions must focus on core Python.
`;
  } else if (domainLower.includes("devops")) {
    domainScope = `
Target Domain is strictly DEVOPS.
Allowed topics to generate:
- CI/CD
- Jenkins
- Docker
- Kubernetes
- Terraform
- Git
- Linux
- Monitoring
- Ansible
- Infrastructure as Code

CRITICAL PRECLUSION: Do NOT mix other technologies, general software code development, programming languages, or aptitude. Focus strictly on DevOps.
`;
  } else if (domainLower.includes("aws")) {
    domainScope = `
Target Domain is strictly AWS (Amazon Web Services).
Allowed topics to generate:
- EC2
- S3
- VPC
- IAM
- RDS
- Route 53
- ELB
- Auto Scaling
- Lambda
- CloudWatch

CRITICAL PRECLUSION: Do NOT include other cloud providers (like GCP, Azure) or generic DevOps/programming topics not directly tied to AWS services.
`;
  } else if (domainLower.includes("cloud computing")) {
    domainScope = `
Target Domain is strictly CLOUD COMPUTING.
Allowed topics to generate:
- IaaS
- PaaS
- SaaS
- Virtualization
- Public Cloud
- Private Cloud
- Hybrid Cloud
- Cloud Security
- Cloud Architecture

CRITICAL PRECLUSION: Keep this at a conceptual and cloud architecture level. Do NOT mix with low-level Java/Python code or non-cloud DevOps tools.
`;
  } else if (domainLower.includes("ai") || domainLower.includes("ml") || domainLower.includes("machine") || domainLower.includes("deep")) {
    domainScope = `
Target Domain is strictly AI/ML (Artificial Intelligence & Machine Learning).
Allowed topics to generate:
- Machine Learning
- Deep Learning
- CNN
- RNN
- NLP
- LLMs
- Gradient Descent
- Overfitting
- Feature Engineering
- Model Evaluation

CRITICAL PRECLUSION: Do NOT include any general software engineering, AWS services, or Aptitude questions. Focus strictly on AI/ML math and models.
`;
  } else if (domainLower.includes("aptitude") || domainLower.includes("quant") || domainLower.includes("logical") || domainLower.includes("verbal")) {
    domainScope = `
Target Domain is strictly APTITUDE.
Allowed topics to generate:
- Quantitative Aptitude (Profit and Loss, Percentages, Time and Work, Time Speed Distance, Probability, Ratio and Proportion, Ages, Number Systems)
- Logical Reasoning (Blood Relations, Coding-Decoding, Series, Puzzles, Seating Arrangements)
- Verbal Ability (Synonyms, Antonyms, Grammar, Reading Comprehension)

CRITICAL PRECLUSION RULES:
- Use Multiple Choice Question (MCQ) format whenever possible. Include 4 clear choices (A, B, C, D) directly in the text field of the question.
- ABSOLUTELY NO: System Design, Google Production Systems, Software Architecture, Security Permissions, Technical Engineering Questions, or code snippets of any kind.
`;
  } else if (domainLower.includes("behavioral") || domainLower.includes("star") || domainLower.includes("hr")) {
    domainScope = `
Target Domain is strictly STAR BEHAVIORAL questions.
Allowed topics to generate:
- Behavioral questions using STAR (Situation, Task, Action, Result) format.
Examples:
- "Tell me about a challenge you faced."
- "Describe a conflict in your team."
- "Explain a time when you showed leadership."
- "Describe a project failure and what you learned."

CRITICAL PRECLUSION: Do NOT ask any system design, code, math, or technical domain questions. Focus purely on career behavior and team situations.
`;
  } else if (domainLower.includes("system design") || domainLower.includes("architecture")) {
    domainScope = `
Target Domain is strictly SYSTEM DESIGN.
Allowed topics to generate:
- Scalability
- Load Balancers
- Databases
- Caching
- CAP Theorem
- Microservices
- Message Queues
- API Gateways
- Monitoring
- High Availability

CRITICAL PRECLUSION: Do NOT ask for specific programming language details (such as Java JVM options or Python decorators).
`;
  } else if (customTopic) {
    domainScope = `
Target Domain is strictly CUSTOM: ${customTopic}.
Generate questions strictly from this custom topic and do not include or mix other unrelated domains.
`;
  } else {
    domainScope = `
Target Domain is strictly ${selectedDomain}.
Generate questions strictly from this category and do not include or mix other unrelated domains.
`;
  }

  const client = getGeminiClient();

  const getBankQuestionsWithPinned = (): { id: number; text: string }[] => {
    const list: string[] = [...cleanPinnedQuestions];
    if (list.length < numQuestions) {
      // First pass: select from mock pool excluding already seen previous questions
      const poolSimulated = getSimulatedQuestions(selectedDomain, role, difficulty, company, customTopic, numQuestions + 10);
      for (const simQ of poolSimulated) {
        if (list.length >= numQuestions) break;
        const alreadyInList = list.some(item => item.toLowerCase().trim() === simQ.text.toLowerCase().trim());
        const inPrevious = cleanPreviousQuestions.some((pq: string) => pq.toLowerCase().trim() === simQ.text.toLowerCase().trim());
        if (!alreadyInList && !inPrevious) {
          list.push(simQ.text);
        }
      }

      // Second pass: if we need more questions, relax previous questions check but keep list items unique
      if (list.length < numQuestions) {
        for (const simQ of poolSimulated) {
          if (list.length >= numQuestions) break;
          const alreadyInList = list.some(item => item.toLowerCase().trim() === simQ.text.toLowerCase().trim());
          if (!alreadyInList) {
            list.push(simQ.text);
          }
        }
      }
    }
    // If we still need more, append default safe ones but vary them to prevent duplicates
    const fallbackTemplates = [
      `As a ${role} focusing on ${selectedDomain}, how do you ensure scalability and quality under tight deadlines?`,
      `Can you discuss a complex architectural challenge you faced in ${selectedDomain} and how you resolved it?`,
      `How do you keep up with the latest advancements, library updates, and security patches in the ${selectedDomain} ecosystem?`,
      `Explain your typical testing and debugging strategy when working with ${selectedDomain} applications.`,
      `Describe how you manage performance profiling and memory optimizations in a high-throughput ${selectedDomain} environment.`
    ];
    let templateIdx = 0;
    while (list.length < numQuestions) {
      const fallbackQ = fallbackTemplates[templateIdx % fallbackTemplates.length];
      if (!list.includes(fallbackQ)) {
        list.push(fallbackQ);
      } else {
        list.push(`${fallbackQ} (Focus: Part ${Math.floor(templateIdx / fallbackTemplates.length) + 1})`);
      }
      templateIdx++;
    }
    return list.slice(0, numQuestions).map((text, idx) => ({ id: idx + 1, text }));
  };

  // 1. BANK ONLY MODE
  if (questionMode === "bank" || !client) {
    return res.status(200).json(getBankQuestionsWithPinned());
  }

  // 2. AI ONLY MODE
  if (questionMode === "ai") {
    try {
      const aiCount = numQuestions - cleanPinnedQuestions.length;
      if (aiCount <= 0) {
        return res.status(200).json(cleanPinnedQuestions.slice(0, numQuestions).map((text: string, idx: number) => ({ id: idx + 1, text })));
      }

      const seed = Math.random().toString(36).substring(7);
      const prompt = `Generate a set of exactly ${aiCount} distinct, highly professional and challenging interview questions for a ${difficulty} level interview.
Target Domain/Technology: ${selectedDomain}
Target Career/Role: ${role}
Target Company Focus: ${company}

Domain Scope Rules:
${domainScope}

Constraints:
- Generate EXACTLY ${aiCount} questions.
- Tailor the questions strictly to the selected Domain, Difficulty level (${difficulty}), and Role.
- Ensure the questions are highly distinct, practical, and test genuine real-world capabilities.
- DO NOT MIX domains. A Java question must not talk about DevOps. An Aptitude question must not talk about AWS/System Design.
- Use a diverse set of topics from the allowed list. Do not repeat the same concepts.
- Random session seed: ${seed} (Use this to vary your selections and generate completely different questions from previous requests).
${cleanPreviousQuestions && cleanPreviousQuestions.length > 0 ? `- CRITICAL: Do NOT generate or repeat any of the following previous questions:\n${cleanPreviousQuestions.map((q: string) => `- ${q}`).join('\n')}` : ""}
${cleanPinnedQuestions && cleanPinnedQuestions.length > 0 ? `- CRITICAL: Do NOT generate or repeat any of the following questions already selected in this session:\n${cleanPinnedQuestions.map((q: string) => `- ${q}`).join('\n')}` : ""}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite, highly experienced technical recruiter and career coach. Your goal is to draft targeted interview puzzles that test genuine skill and cultural alignment. You strictly enforce domain boundaries and never mix unrelated topics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.INTEGER, description: "Question sequence index starting from 1" },
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

      const aiQuestions = parseCleanJSON(bodyText);
      const combined = [
        ...cleanPinnedQuestions.map((text: string) => ({ text })),
        ...aiQuestions
      ];

      const finalQuestions = combined.slice(0, numQuestions).map((q, index) => ({
        id: index + 1,
        text: q.text
      }));

      return res.status(200).json(finalQuestions);
    } catch (err: any) {
      console.warn("Gemini AI-Only generation failed, falling back to bank (quota or API error):", err?.message || err);
      return res.status(200).json(getBankQuestionsWithPinned());
    }
  }

  // 3. HYBRID MODE (Smart Mix of Curated and Dynamic AI)
  try {
    const bankCount = Math.ceil(numQuestions / 2);
    const aiCount = numQuestions - bankCount;

    const curatedList: string[] = [...cleanPinnedQuestions];
    if (curatedList.length < bankCount) {
      const poolSimulated = getSimulatedQuestions(selectedDomain, role, difficulty, company, customTopic, bankCount + 10);
      for (const simQ of poolSimulated) {
        if (curatedList.length >= bankCount) break;
        const alreadyInList = curatedList.some(item => item.toLowerCase().trim() === simQ.text.toLowerCase().trim());
        const inPrevious = cleanPreviousQuestions.some((pq: string) => pq.toLowerCase().trim() === simQ.text.toLowerCase().trim());
        if (!alreadyInList && !inPrevious) {
          curatedList.push(simQ.text);
        }
      }
    }

    const finalCurated = curatedList.slice(0, bankCount);

    if (aiCount <= 0) {
      return res.status(200).json(finalCurated.map((text, idx) => ({ id: idx + 1, text })));
    }

    const seed = Math.random().toString(36).substring(7);
    const prompt = `We have retrieved ${finalCurated.length} premium, curated questions from our secure question bank:
${finalCurated.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Generate exactly ${aiCount} additional distinct, highly personalized and complementary questions that are NOT redundant or repetitive.
Target Domain/Technology: ${selectedDomain}
Target Career/Role: ${role}
Target Company Focus: ${company}
Target Difficulty: ${difficulty}

Domain Scope Rules:
${domainScope}

Constraints:
- Generate EXACTLY ${aiCount} questions in JSON format.
- Ensure they complement and build upon the curated questions above without repeating topics.
- Tailor strictly to the ${difficulty} difficulty level for a ${role} position.
- Random session seed: ${seed}
${cleanPreviousQuestions && cleanPreviousQuestions.length > 0 ? `- CRITICAL: Do NOT repeat any of the following previous questions:\n${cleanPreviousQuestions.map((q: string) => `- ${q}`).join('\n')}` : ""}
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite technical recruiter. You are tasked with generating unique complementary questions to go with existing curated questions. Avoid any duplicate concepts.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              text: { type: Type.STRING }
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

    const aiQuestions = parseCleanJSON(bodyText);
    const combined = [
      ...finalCurated.map((text) => ({ text })),
      ...aiQuestions
    ];

    const finalQuestions = combined.slice(0, numQuestions).map((q, index) => ({
      id: index + 1,
      text: q.text
    }));

    return res.status(200).json(finalQuestions);
  } catch (err: any) {
    console.warn("Gemini Hybrid generation failed, falling back to full bank (quota or API error):", err?.message || err);
    return res.status(200).json(getBankQuestionsWithPinned());
  }
  } catch (err: any) {
    console.error("Top-level error caught in generate-questions handler:", err);
    try {
      const selectedDomain = req.body?.domain || req.body?.category || "Technical";
      const count = parseInt(req.body?.numQuestions || "5", 10) || 5;
      const pool = getSimulatedQuestions(selectedDomain, "Software Engineer", "Medium", "Standard", "", count);
      return res.status(200).json(pool.slice(0, count));
    } catch (fallbackErr) {
      return res.status(200).json([
        { id: 1, text: "Explain your experience with cloud and DevOps platforms." }
      ]);
    }
  }
}
