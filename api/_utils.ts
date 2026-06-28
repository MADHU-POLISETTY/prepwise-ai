import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";



if (!process.env.VERCEL) {
  dotenv.config();
}

console.log("Gemini API Key exists:", !!process.env.GEMINI_API_KEY);

let aiInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
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

export function parseCleanJSON(raw: string): any {
  let text = raw.trim();
  text = text.replace(/^```json\s*/i, "");
  text = text.replace(/^```\s*/, "");
  text = text.replace(/```$/, "");
  return JSON.parse(text.trim());
}

export async function getEmbedding(client: GoogleGenAI, text: string): Promise<number[]> {
  try {
    const result = await client.models.embedContent({
      model: "text-embedding-004",
      contents: text,
    });
    if (result.embeddings && result.embeddings[0] && result.embeddings[0].values) {
      return result.embeddings[0].values;
    }
    throw new Error("Unable to extract embedding values from Gemini API response.");
  } catch (err) {
    console.error("Failed to get embedding:", err);
    throw err;
  }
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }
  if (vecA.length !== vecB.length) {
    console.warn(`Embedding vectors length mismatch: ${vecA.length} vs ${vecB.length}`);
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function isGibberishOrInvalid(text: string): boolean {
  const clean = text.trim().toLowerCase();
  if (!clean) return true;
  if (clean.length < 5) return true;
  
  const lettersCount = (clean.match(/[a-z]/g) || []).length;
  if (lettersCount < clean.length * 0.3) return true;

  if (/^(.)\1{3,}$/.test(clean.replace(/\s+/g, ''))) return true;

  if (clean.length >= 8) {
    const half = clean.substring(0, clean.length / 2);
    if (clean === half + half) return true;
    const third = clean.substring(0, clean.length / 3);
    if (clean === third + third + third) return true;
  }

  const lazyWords = ["idk", "skip", "none", "nothing", "no idea", "asdf", "asdfgh", "qwer", "qwerty", "test", "hello", "hi", "placeholder"];
  if (lazyWords.includes(clean)) return true;

  if (/^[bcdfghjklmnpqrstvwxyz\s]{5,}$/.test(clean)) return true;
  if (/^[aeiou\s]{5,}$/.test(clean)) return true;

  return false;
}

export function generateFallbackIdealAnswer(question: string): string {
  const q = question.toLowerCase();
  
  if (q.includes("highly available") || q.includes("scalable") || q.includes("scalability") || q.includes("load balancer")) {
    return "I would use a microservices architecture so that different parts of the system can scale independently.\n\nSome important tools and technologies are:\n* Load balancers to distribute traffic.\n* Kubernetes for container orchestration.\n* Redis for caching frequently used data.\n* Cloud databases with replication for high availability.\n* Monitoring tools like Prometheus and Grafana.\n* Message queues such as Kafka for asynchronous processing.\n\nThese tools help the system remain fast, reliable, and available even when millions of users access it at the same time.";
  }
  
  if (q.includes("java") || q.includes("jvm") || q.includes("collection") || q.includes("multithreading")) {
    return "In Java, standard professional practices involve proper garbage collection tuning, memory management, and using modern concurrency utilities like virtual threads or ExecutorService. We should prioritize solid object-oriented design patterns, write clean JUnit test suites, use custom exceptions for robust error handling, and leverage modern stream APIs for elegant and efficient collection processing.";
  }
  
  if (q.includes("python") || q.includes("decorator") || q.includes("generator") || q.includes("django") || q.includes("flask")) {
    return "For Python applications, we typically choose list comprehensions and generators for memory-efficient iteration, use typing hints for clarity, structure packages with virtual environments, and leverage robust frameworks like FastAPI or Django. For performance-critical blocks, async programming or multiprocessing can bypass the GIL and significantly boost processing speed.";
  }
  
  if (q.includes("aws") || q.includes("s3") || q.includes("ec2") || q.includes("vpc") || q.includes("iam")) {
    return "AWS system designs typically rely on Amazon EC2 for computing, Amazon RDS or Aurora for reliable database management with multi-AZ replication, and Amazon S3 for durable object storage. Implementing auto-scaling groups, application load balancers, and CloudFront CDN ensures high availability, low latency, and automatic traffic management globally.";
  }
  
  if (q.includes("devops") || q.includes("docker") || q.includes("kubernetes") || q.includes("terraform") || q.includes("jenkins") || q.includes("ci/cd")) {
    return "A modern DevOps pipeline uses Docker to containerize applications, Kubernetes to orchestrate deployment and scaling, and GitHub Actions or Jenkins for automated continuous integration. Monitoring with Prometheus and Grafana helps identify resource bottlenecks early, ensuring robust, predictable, and zero-downtime infrastructure updates.";
  }

  if (q.includes("dbms") || q.includes("database") || q.includes("sql") || q.includes("nosql")) {
    return "Database optimizations focus on appropriate indexing (e.g., B-Tree or Hash indexes), normalizing tables to reduce redundancy, and using connection pooling to handle heavy user traffic. We also implement read replicas to offload query processing and design query execution plans carefully to avoid slow full-table scans.";
  }

  if (q.includes("dsa") || q.includes("array") || q.includes("string") || q.includes("tree") || q.includes("graph")) {
    return "To optimize algorithms, we analyze time and space complexity using Big O notation. Choosing the right data structure (such as a Hash Map for O(1) lookups or a Trie for efficient prefix searching) avoids redundant computations. Standard approaches include using the two-pointer technique, slide window, dynamic programming, or BFS/DFS for graph traversals.";
  }

  if (q.includes("ai") || q.includes("ml") || q.includes("model") || q.includes("gradient") || q.includes("overfitting") || q.includes("learning")) {
    return "Developing scalable AI/ML systems involves choosing proper evaluation metrics, preventing overfitting with regularization, and designing pipelines with robust feature engineering. Standard architectures use deep neural networks optimized via Adam or SGD with gradient descent, coupled with efficient batching and parallel GPU computation.";
  }

  if (q.includes("hr") || q.includes("behavioral") || q.includes("experience") || q.includes("challenge") || q.includes("conflict")) {
    return "To answer this professionally, we use the STAR (Situation, Task, Action, Result) methodology. We describe a specific challenge in a project, explain our exact actions (debugging, researching, collaborating, or testing), and highlight the measurable positive results, such as resolving a critical bug or completing a project before the deadline.";
  }

  if (q.includes("profit") || q.includes("clock") || q.includes("workers") || q.includes("train") || q.includes("series") || q.includes("pointing") || q.includes("apple") || q.includes("code") || q.includes("angle") || q.includes("percentage")) {
    return "To solve this aptitude question, we carefully analyze the given conditions. We extract the relevant numbers, apply the appropriate mathematical formulas (e.g. profit/cost ratios, relative speed summation, or clock hand position differences), perform step-by-step arithmetic, and select the correct corresponding choice from the multiple-choice options.";
  }

  return `To answer this question, focus on describing the exact technical configurations, tools, and operational workflows required for this scenario. Give a direct answer detailing how you would implement the solution in a production environment.`;
}

export function getSimulatedSingleAnswerEvaluation(question: string, answer: string) {
  const clean = answer.trim();
  const lowercaseAns = clean.toLowerCase();

  let isMeaningful = true;
  let isRelevant = true;
  let isTechnicallyCorrect = true;
  let score = 5;
  let feedback = "Decent start, but the response is too brief to show full professional mastery.";
  let improvements = "Detail the exact actions you took and the toolsets utilized (e.g., specifying Docker, AWS RDS, or JVM garbage collectors).";

  if (!clean) {
    isMeaningful = false;
    isRelevant = false;
    isTechnicallyCorrect = false;
    score = 0;
    feedback = "No answer provided.";
    improvements = "Please write a response to receive feedback and suggestions.";
  } else {
    const isObviousGibberish = 
      lowercaseAns.length < 15 && (
        /^[a-z\s]{1,3}$/.test(lowercaseAns) || 
        /^(.)\1+$/.test(lowercaseAns.replace(/\s+/g, '')) || 
        /^[bcdfghjklmnpqrstvwxyz\s]+$/.test(lowercaseAns) || 
        lowercaseAns === "asdf" ||
        lowercaseAns === "asdfgh" ||
        lowercaseAns === "ghg hhg" ||
        lowercaseAns === "abc xyz" ||
        lowercaseAns === "idk" ||
        lowercaseAns === "skip" ||
        lowercaseAns === "none"
      );

    if (isObviousGibberish) {
      isMeaningful = false;
    } else if (lowercaseAns.includes("cricket") && question.toLowerCase().includes("gradient descent")) {
      isRelevant = false;
    }

    if (!isMeaningful) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isRelevant = false;
      isTechnicallyCorrect = false;
      improvements = "Please write a meaningful professional response related to the question.";
    } else if (!isRelevant) {
      score = 0;
      feedback = "The answer is invalid, meaningless, or unrelated to the question.";
      isTechnicallyCorrect = false;
      improvements = "Please write a response that directly addresses the question asked.";
    } else {
      if (clean.length > 120) {
        score = 8;
        feedback = "This is a strong answer that shows structured context and relevant terminology. Good job explaining the workflow.";
        improvements = "To make this answer perfect, include a direct business metric or quantitative result (e.g. 'reduced latency by 20%').";
      } else if (clean.length > 50) {
        score = 6;
        feedback = "You have a decent outline, but the conceptual depth is moderate. You mentioned the target keywords correctly.";
        improvements = "Detail the exact actions you took and the toolsets utilized (e.g., specifying Docker, AWS RDS, or JVM garbage collectors).";
      } else {
        score = 3;
        feedback = "The answer is quite brief and lacks specific details or structured metrics.";
        improvements = "Expand your response with precise technical terms. Use the STAR (Situation, Task, Action, Result) methodology.";
        isTechnicallyCorrect = false;
      }
    }
  }

  return {
    isMeaningful,
    isRelevant,
    isTechnicallyCorrect,
    score,
    feedback,
    improvements,
    idealAnswer: generateFallbackIdealAnswer(question)
  };
}

export function getSimulatedEvaluation(category: string, role: string, answers: any[]) {
  let scoreBase = 10;
  let totalLength = 0;
  let validAnswersCount = 0;

  answers.forEach(a => {
    const text = (a.answerText || "").trim();
    if (text.length > 0) {
      totalLength += text.length;
      
      const isRepeated = /(.)\1{3,}/.test(text);
      const isGibberish = text.length < 10 && (
        /asdf/i.test(text) || 
        /test/i.test(text) || 
        /none/i.test(text) || 
        /idk/i.test(text) || 
        /don't know/i.test(text) ||
        /skip/i.test(text) ||
        /hello/i.test(text)
      );

      if (!isRepeated && !isGibberish && text.length >= 10) {
        validAnswersCount++;
        if (text.length > 150) {
          scoreBase += 16;
        } else if (text.length > 60) {
          scoreBase += 12;
        } else {
          scoreBase += 6;
        }
      }
    }
  });

  if (answers.length === 0) {
    scoreBase = 0;
  } else if (validAnswersCount === 0) {
    scoreBase = Math.min(15, scoreBase);
  }

  const rawScore = Math.min(96, Math.max(5, scoreBase));
  const communication = Math.round(rawScore + (Math.random() * 4 - 2));
  const technical = Math.round(rawScore + (Math.random() * 6 - 3));
  const confidence = Math.round(rawScore + (Math.random() * 4 - 2));
  const problemSolving = Math.round(rawScore + (Math.random() * 6 - 2));
  const clarity = Math.round(rawScore + (Math.random() * 4 - 2));
  
  const finalScore = Math.round((communication + technical + confidence + problemSolving + clarity) / 5);

  let feedbackIntro = "";
  if (finalScore < 45) {
    feedbackIntro = `### Performance Warning: Superficial or Empty Submission\n\nYour session received a lower score of **${finalScore}%** because the submitted answers were either exceptionally brief, skipped, or contained inadequate technical substance. To qualify for senior or mid-level recruitment standards, answers must display structured analytical thinking, contextual key terms, and detailed STAR examples.`;
  } else {
    feedbackIntro = `### Core Strengths\n\n- **Consistent Response Structures:** Your answers show deliberate planning and effort.\n- **Refined Articulation:** You correctly incorporated relevant context as a ${role}, utilizing industry-appropriate definitions.`;
  }

  const markdownFeedback = `${feedbackIntro}

### Areas for Improvement

- **Framing with Real metrics:** Ensure every answer highlights measurable quantitative outputs (e.g. 'reduced processing overhead by 25%'). 
- **Structure and Sequence:** Use structural frameworks (like the **STAR framework** for behavioral tracks) to avoid jumping straight to solutions without specifying the constraints and tasks first.

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

export function getSimulatedResumeAnalysis(text: string, jobDescription: string = "") {
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
      atsScore = 74;
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

export function getSimulatedAskMS(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("system") || q.includes("architecture") || q.includes("stripe") || q.includes("notion") || q.includes("scale")) {
    return `### Mastering System Design: Prime Checklist

As your Career Mentor, here is how you stand out when detailing architectures:

1. **Explicit API Specs First:** Never jump into sharding or caching layers. Draft the target REST or gRPC endpoint schemes explicitly.
2. **Back-of-the-Envelope Math:** Quantify the scale index. For instance, "10 million daily active users means roughly 115 requests per second average, peaking at 500."
3. **Database Paradigms:** Do not just say 'SQL'. Contrast write-heavy indexes vs. read-heavy caching with exact configurations (e.g., leveraging Redis clusters or partitioned tables).
4. **Resilience & Backpressure:** Highlight failover patterns, message queues (like Kafka or Pub/Sub), and token-bucket rate limiting.

Would you like to run a mock Technical Session right now to practice this?`;
  }
  if (q.includes("star") || q.includes("behavioral") || q.includes("hr")) {
    return `### The STAR Presentation Formula

To sound like a senior specialist at elite teams, format your narratives exactly like this:

- **S / Situation:** Highlight a specific, complex operational failure, tight timeline, or team alignment challenge (1-2 sentences).
- **T / Task:** State the core conflict or high-value deliverable you were directly accountable for.
- **A / Action:** Use strong active verbs. Mention *your* distinct engineering step, communication resolve, or metric evaluation.
- **R / Result:** Conclude with *quantifiable metrics* (e.g., "reduced latency by 24%", "increased container utilization by 15%").

How is your star story directory looking? Paste a draft here and let is analyze it.`;
  }
  if (q.includes("resume") || q.includes("cv") || q.includes("ats")) {
    return `### ATS Alignment Best Practices

To make your resume look like a perfect fit:

- **Context-Agnostic Vocabulary:** ATS scanners look for literal technology nouns matching the job posting (e.g., "TypeScript", "Docker", "Redux State").
- **Metrics, Not Actions:** Move away from vague claims like "responsible for system upgrades". Lead with the impact: *"Modernized core CI/CD pipelines, saving developers 12 minutes per pull request sequence."*
- **Layout Precision:** Avoid multi-column color designs which can break parsing engines. Stick to single-column, clean chronological structure.

You can upload your profile PDF into our **Resume Analyzer** workspace tab for a real-time compliance score.`;
  }
  
  return `### Hello! I am MS, your career mentor.

I am configured to act as your personalized system architect and narrative talent coach.

How can I help you accelerate your interview readiness today?

- **"STAR behavioral examples"**: How to structure soft-skill conflict questions.
- **"Stripe System Design framework"**: Best practices for scalable APIs.
- **"Resume keyword tips"**: Optimizing your CV for recruiter pipelines.
- **"Microservices trade-offs"**: Assessing state, storage, and synchronization.

Specify a topic, and let's craft your high-impact technical portfolio.`;
}

export function getQuestionBankPool(categoryOrDomain: string, role: string, difficulty: string, company: string = "Standard", customTopic: string = ""): string[] {
  const domain = (categoryOrDomain || "Technical").toLowerCase();
  const searchStr = `${domain} ${role} ${customTopic} ${company}`.toLowerCase();
  
  let pool: string[] = [];
  
  if (searchStr.includes("java")) {
    pool = [
      `What are the core pillars of OOP (Object-Oriented Programming) in Java, and how does encapsulation improve maintainability?`,
      `Explain the differences between List, Set, and Map in the Java Collections Framework. When would you choose a HashMap over a TreeMap?`,
      `How do volatile variables and synchronized blocks coordinate multithreading memory visibility in Java?`,
      `Explain Java's modern Exception Handling. What is the difference between checked and unchecked exceptions?`,
      `What is JDBC and how does connection pooling optimize database read/write latency in Java applications?`,
      `How does Spring Boot simplify dependency injection and configuration for enterprise Java services?`,
      `Explain the components of the JVM (Java Virtual Machine) and how the Garbage Collector recovers unused memory.`,
      `How is memory allocated in Java's Heap vs. Stack? How do you prevent OutOfMemoryError?`,
      `What are the major Java 8 features? Explain functional interfaces, lambda expressions, and the Streams API.`,
      `Describe how the Singleton or Factory Design Pattern is typically implemented and utilized in Java projects.`
    ];
  } else if (searchStr.includes("python")) {
    pool = [
      `Explain the concept of OOP (Object-Oriented Programming) in Python, including inheritance and polymorphism.`,
      `What are decorators in Python, and how do you write a custom decorator to measure function execution time?`,
      `How do Python generators work, and why are they highly memory-efficient compared to normal list returns?`,
      `Write a list comprehension in Python to filter and square even numbers from a collection, and explain its performance advantages.`,
      `How do you perform vector operations and matrix multiplications using NumPy array structures?`,
      `What are Pandas DataFrames, and how do you handle missing values or perform groupings on a dataset?`,
      `How do you design a simple REST API endpoint using the Flask framework in Python?`,
      `Explain the core architecture of Django, specifically focusing on the MVT (Model-View-Template) pattern.`,
      `How do you implement robust exception handling in Python using try-except-finally blocks, and what are custom exceptions?`,
      `What is the difference between deep copy and shallow copy in Python, and how does python manage references?`
    ];
  } else if (searchStr.includes("aws") || searchStr.includes("amazon")) {
    pool = [
      `How does Amazon EC2 provide resizable compute capacity, and what are the main differences between On-Demand and Spot instances?`,
      `What is Amazon S3, and how do you configure bucket policies, versioning, and lifecycle rules for storage optimization?`,
      `How do you securely configure a VPC with public and private subnets, NAT gateways, and internet gateways on AWS?`,
      `Explain IAM roles, users, and policies. How do you apply the principle of least privilege in AWS?`,
      `What are the advantages of using Amazon RDS (Relational Database Service) with multi-AZ replication for automated failover?`,
      `How does AWS Route 53 manage global DNS resolution and failover routing policies?`,
      `Explain the role of Application Load Balancers (ELB) in distributing incoming application traffic across target groups.`,
      `How does AWS Auto Scaling automatically adjust EC2 capacity based on dynamic demand metrics?`,
      `What is serverless computing on AWS? Explain how AWS Lambda operates and scales based on incoming events.`,
      `How do you monitor infrastructure metrics and set up custom alarms using Amazon CloudWatch?`
    ];
  } else if (searchStr.includes("devops") || searchStr.includes("pipeline") || searchStr.includes("terraform") || searchStr.includes("docker")) {
    pool = [
      `What is CI/CD, and why is it crucial for continuous automated software delivery pipelines?`,
      `Explain how Jenkins compiles, tests, and deploys applications securely using scripted or declarative Pipelines.`,
      `Explain the difference between a Docker image and a running Docker container, and how layers optimize caching.`,
      `What is Kubernetes? Explain the roles of Pods, Deployments, and Services in orchestrating containerized apps.`,
      `What is Terraform, and how does it manage infrastructure state locking to prevent deployment conflicts?`,
      `Explain the Git branching strategies (e.g. GitFlow or trunk-based development) used in professional engineering teams.`,
      `What are some essential Linux commands for diagnosing high CPU usage, memory bottlenecks, or open file descriptors?`,
      `Why is proactive infrastructure monitoring critical, and what are the roles of tools like Prometheus and Grafana?`,
      `Explain how Ansible provides agentless configuration management and automated playbook execution.`,
      `What are the core benefits of Infrastructure as Code (IaC) over manual environment configuration?`
    ];
  } else if (searchStr.includes("cloud computing") || searchStr.includes("gcp") || searchStr.includes("azure")) {
    pool = [
      `What are the key architectural differences and use cases for IaaS, PaaS, and SaaS cloud delivery models?`,
      `Explain the role of virtualization in cloud computing and how hypervisors enable multiple operating systems on physical hardware.`,
      `Compare Public Cloud, Private Cloud, and Hybrid Cloud architectures in terms of cost, security, and control.`,
      `What are standard cloud security best practices for protecting data at rest and in transit?`,
      `How does a multi-region cloud architecture provide high availability and geographical disaster recovery?`,
      `Explain the Shared Responsibility Model in cloud environments. Who is responsible for patching guest operating systems?`,
      `What is horizontal scaling vs vertical scaling in a cloud environment, and when is each appropriate?`,
      `How do Content Delivery Networks (CDNs) leverage edge caching to improve global latency?`,
      `What is cloud tenant isolation, and how do public cloud providers ensure secure multi-tenancy?`
    ];
  } else if (searchStr.includes("ai") || searchStr.includes("ml") || searchStr.includes("machine learning") || searchStr.includes("deep learning")) {
    pool = [
      `What is the difference between supervised, unsupervised, and reinforcement learning in Machine Learning?`,
      `Explain Deep Learning. How do multi-layer artificial neural networks learn complex hierarchical representations?`,
      `What is a Convolutional Neural Network (CNN), and how do convolutional layers extract local spatial features from images?`,
      `How do Recurrent Neural Networks (RNN) process sequential data, and how do LSTMs mitigate vanishing gradients?`,
      `What is Natural Language Processing (NLP), and what are the common tokenization and embedding steps?`,
      `Explain Large Language Models (LLMs) and the foundational self-attention mechanism in the Transformer architecture.`,
      `What is Gradient Descent, and how do learning rates determine the convergence speed of model optimization?`,
      `Explain overfitting. How do you prevent a model from overfitting using regularization, dropout, or early stopping?`,
      `What is Feature Engineering, and why is selecting the correct input representations crucial for model success?`,
      `How do you evaluate Machine Learning models using metrics like accuracy, precision, recall, and F1-score?`
    ];
  } else if (searchStr.includes("aptitude") || searchStr.includes("puzzle") || searchStr.includes("math")) {
    pool = [
      `If a laptop is bought for $800 and sold for $1000, what is the profit percentage?\nA) 15%\nB) 20%\nC) 25%\nD) 30%`,
      `A clock shows exactly 3:15. What is the angle in degrees between the hour hand and the minute hand?\nA) 0 degrees\nB) 7.5 degrees\nC) 30 degrees\nD) 90 degrees`,
      `If 5 workers can build a wall in 12 days, how many days will it take 6 workers to build the same wall, assuming the same efficiency?\nA) 8 days\nB) 10 days\nC) 12 days\nD) 15 days`,
      `A train travels at a speed of 60 mph. How far will it travel in 2.5 hours?\nA) 120 miles\nB) 150 miles\nC) 180 miles\nD) 200 miles`,
      `What is the next number in the logical series: 2, 6, 12, 20, 30, ...?\nA) 36\nB) 40\nC) 42\nD) 48`,
      `Pointing to a photograph, Amit said, "Her father is the only son of my grandfather." Whose photograph was Amit looking at?\nA) His sister's\nB) His daughter's\nC) His mother's\nD) His niece's`,
      `Find the odd one out from the following list:\nA) Apple\nB) Banana\nC) Carrot\nD) Grape`,
      `In a certain code language, "APPLE" is written as "EPPLA". How is "GRAPE" written in that language?\nA) ERAPG\nB) EPAQG\nC) ERPGA\nD) GEPAR`
    ];
  } else if (searchStr.includes("hr") || searchStr.includes("behavioral") || searchStr.includes("soft skills") || searchStr.includes("star")) {
    pool = [
      `Tell me about a challenge you faced during a project. What actions did you take to resolve it, and what was the outcome?`,
      `Describe a conflict in your team or group project. How did you handle the situation, and what did you learn?`,
      `Explain a time when you showed leadership. How did you guide others toward a successful project delivery?`,
      `Describe a project failure you experienced. What did you learn from it, and how did you apply that learning later?`,
      `Tell me about a time when you had to adapt quickly to changing requirements. How did you manage your tasks?`
    ];
  } else if (searchStr.includes("system design") || searchStr.includes("architecture")) {
    pool = [
      `What is system scalability, and what are the trade-offs between horizontal scaling and vertical scaling?`,
      `Explain how load balancers distribute traffic across a pool of servers, and describe round-robin routing.`,
      `How do relational databases differ from NoSQL databases in terms of schema flexibility and scalability?`,
      `What is database caching, and how do in-memory caches like Redis or Memcached speed up query performance?`,
      `Explain the CAP Theorem and how databases choose between Consistency, Availability, and Partition Tolerance.`,
      `What are microservices, and what are the benefits of decoupling applications into independent services?`,
      `How do asynchronous message queues like RabbitMQ or Kafka handle high-throughput communication between services?`,
      `Explain the role of an API Gateway in modern microservice architectures, including authentication and rate limiting.`,
      `Why is system monitoring and alerting critical, and how do dashboards help developers identify bottlenecks?`,
      `How do you achieve high availability and eliminate single points of failure in cloud-native applications?`
    ];
  } else if (customTopic) {
    pool = [
      `Explain the core concepts and principles of ${customTopic} that every software developer should know.`,
      `What are the common industry best practices and standards when implementing solutions using ${customTopic}?`,
      `Describe a typical challenge or error encountered when working with ${customTopic}, and how to debug it.`,
      `How does ${customTopic} integrate with existing modern software architectures and cloud services?`,
      `Compare ${customTopic} with its main alternatives. What are the key trade-offs in performance and ease of use?`
    ];
  } else {
    pool = [
      `Explain the core conceptual differences between SQL and NoSQL storage paradigms, and when to use them.`,
      `How do you secure server-side REST API endpoints from potential security threats and unauthorized access?`,
      `Walk me through how you would optimize a slow-performing database query or bottlenecked system pathway.`,
      `What are the trade-offs of using Microservices vs. Monolithic architecture, especially regarding deployment complexity?`,
      `Describe the lifecycle of an asynchronous execution queue, and how to deal with failures and retries.`
    ];
  }

  return pool;
}

export function getSimulatedQuestions(categoryOrDomain: string, role: string, difficulty: string, company: string = "Standard", customTopic: string = "", numQuestions: number = 5) {
  const domain = (categoryOrDomain || "Technical").toLowerCase();
  const searchStr = `${domain} ${role} ${customTopic} ${company}`.toLowerCase();
  
  let pool = getQuestionBankPool(categoryOrDomain, role, difficulty, company, customTopic);
  
  pool = [...pool].sort(() => Math.random() - 0.5);
  
  const selectedQuestions = pool.slice(0, numQuestions);
  
  while (selectedQuestions.length < numQuestions) {
    if (searchStr.includes("aptitude")) {
      selectedQuestions.push(`Solve this problem: If 3 books cost $15, how much do 6 books cost?\nA) $20\nB) $25\nC) $30\nD) $35`);
    } else if (searchStr.includes("hr") || searchStr.includes("behavioral")) {
      selectedQuestions.push(`Tell me about a situation where you had to work with a teammate whose working style was different from yours.`);
    } else {
      selectedQuestions.push(`As a ${role} working at ${company}, how do you ensure code quality, performance, and robustness for a ${difficulty} level feature?`);
    }
  }
  
  return selectedQuestions.map((text, index) => ({
    id: index + 1,
    text: text
  }));
}
