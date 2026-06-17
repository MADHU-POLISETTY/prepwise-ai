import React, { useState, useEffect, useRef } from 'react';
import {
  Award,
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  User,
  Home,
  Settings,
  Trash2,
  Play,
  ChevronRight,
  BarChart3,
  UploadCloud,
  Info,
  ArrowLeft,
  RefreshCw,
  X,
  AlertTriangle,
  BookOpen,
  Check,
  HelpCircle,
  Activity,
  Globe,
  Compass,
  Briefcase,
  Star,
  Flame,
  UserCheck,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Sliders,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { collection, addDoc, getDocs, query, orderBy, limit, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth, isFirebaseActive, handleFirestoreError, OperationType } from './lib/firebase';

// Interfaces for State Management
interface InterviewQuestion {
  id: number;
  text: string;
}

interface AnswerInput {
  questionId: number;
  questionText: string;
  answerText: string;
}

interface AssessmentMetrics {
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  problemSolvingScore: number;
  clarityScore: number;
  feedback: string;
}

interface InterviewSessionRecord {
  id?: string;
  category: string;
  role: string;
  difficulty: string;
  company: string;
  score: number;
  metrics: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    clarity: number;
  };
  feedback: string;
  questions: AnswerInput[];
  createdAt: string;
}

interface ResumeAnalysisRecord {
  skills: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
  atsScore: number;
  keywordMatches: { word: string; matched: boolean }[];
  missingSkills: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: Date;
}

// Pre-populated premium initial records to give a gorgeous filled chart experience
const INITIAL_HISTORY: InterviewSessionRecord[] = [
  {
    id: "hist-1",
    category: "Technical",
    role: "Senior Full-Stack Engineer",
    difficulty: "Advanced",
    company: "Stripe",
    score: 88,
    metrics: {
      communication: 85,
      technical: 92,
      confidence: 84,
      problemSolving: 90,
      clarity: 89
    },
    feedback: `### Core Strengths:\n- Demonstrated flawless comprehension of event-driven synchronization.\n- Correctly specified idempotency constraints using transaction keys.\n\n### Suggestions for Improvement:\n- Consider expanding caching strategies for geo-distributed database clusters.\n- Quantify direct business outcomes of migration steps.\n\n### 4-Week Action Plan:\n- **Week 1:** Review Redis Cluster eviction mechanics.\n- **Week 2:** Practice microservice latency budget charts.\n- **Week 3:** Refine STAR results metrics.\n- **Week 4:** Mock interview with similar payment platforms.`,
    questions: [
      { questionId: 1, questionText: "How do you handle synchronous payment webhooks without data duplication?", answerText: "We introduce an idempotent routing database table that check keys on entry..." }
    ],
    createdAt: "2026-06-12T10:30:00Z"
  },
  {
    id: "hist-2",
    category: "Behavioral / HR",
    role: "Engineering Manager",
    difficulty: "Intermediate",
    company: "Google",
    score: 82,
    metrics: {
      communication: 90,
      technical: 75,
      confidence: 85,
      problemSolving: 80,
      clarity: 80
    },
    feedback: `### Core Strengths:\n- Excellent conflict resolution narrative demonstrating empathy.\n- Followed STAR methodology perfectly.\n\n### Areas for Improvement:\n- Be more direct on how engineering deadlines were renegotiated.\n- Add details regarding retrospectives.\n\n### 4-Week Plan:\n- **Week 1:** Read Crucial Conversations summaries.\n- **Week 2:** Refine management STAR stories focused on tech-debt.\n- **Week 3:** Perfect KPI tracking templates.\n- **Week 4:** Conduct mock behavioral drills with mentors.`,
    questions: [
      { questionId: 1, questionText: "Describe a conflict in engineering estimations with a peer leader.", answerText: "I scheduled a one-on-one session using shared technical data, adjusting sprints to reflect direct milestones..." }
    ],
    createdAt: "2026-06-14T14:15:00Z"
  },
  {
    id: "hist-3",
    category: "Technical",
    role: "Cloud DevOps Architect",
    difficulty: "Advanced",
    company: "Amazon Web Services",
    score: 91,
    metrics: {
      communication: 88,
      technical: 94,
      confidence: 90,
      problemSolving: 92,
      clarity: 91
    },
    feedback: `### Core Strengths:\n- Outstanding grasp of multi-region high availability architectures.\n- Clear explanation of IAM roles and least-privilege configurations.\n\n### Areas for Improvement:\n- Could expand cloud finance optimizations regarding underutilized node groups.\n\n### 4-Week Plan:\n- **Week 1:** Deep dive in Kubernetes horizontal pod scaling limits.\n- **Week 2:** Map multi-region database failovers.\n- **Week 3:** Practice system scaling estimations.\n- **Week 4:** Review advanced DNS routing records.`,
    questions: [
      { questionId: 1, questionText: "Define multi-region high availability setup parameters.", answerText: "We configure route 53 latency queues paired with active-active databases to support instant failovers..." }
    ],
    createdAt: "2026-06-16T18:45:00Z"
  }
];

export default function App() {
  // Mobile app navigation state
  const [activeTab, setActiveTab] = useState<'home' | 'interview' | 'resume' | 'dashboard' | 'profile'>('home');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [isFirebaseUserReady, setIsFirebaseUserReady] = useState<boolean>(false);

  // User Profile configuration
  const [userName, setUserName] = useState<string>(() => localStorage.getItem('pw_user_name') || 'James Manoj');
  const [userEmail, setUserEmail] = useState<string>(() => localStorage.getItem('pw_user_email') || 'candidate.preview@prepwise.ai');
  const [userGoal, setUserGoal] = useState<string>(() => localStorage.getItem('pw_user_goal') || 'Senior Software Engineer');
  const [streakCount, setStreakCount] = useState<number>(5);

  // Lists for dynamic additions
  const [interviewHistory, setInterviewHistory] = useState<InterviewSessionRecord[]>(() => {
    const local = localStorage.getItem('pw_interview_history');
    return local ? JSON.parse(local) : INITIAL_HISTORY;
  });

  // Active Toast Alerts
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Bottom drawer state tooltips
  const [viewingRecordDetail, setViewingRecordDetail] = useState<InterviewSessionRecord | null>(null);

  // Interactive Screen 1: Home States (Mentor Chat Assistant)
  const [mentorOpen, setMentorOpen] = useState<boolean>(false);
  const [mentorMessages, setMentorMessages] = useState<ChatMessage[]>([
    {
      id: "m-init",
      role: 'assistant',
      text: "Hello! I am **MS** (Mentor & Support), your personal AI advisor from Stripe, Linear, and Notion engineering backgrounds.\n\nHow can I help you accelerate your technical preparation or ATS resume score reviews today?\n\n- Try asking: **\"Stripe webhooks alignment\"**\n- Or: **\"Resume metrics tips\"**",
      createdAt: new Date()
    }
  ]);
  const [mentorInput, setMentorInput] = useState<string>('');
  const [mentorLoading, setMentorLoading] = useState<boolean>(false);
  const mentorEndRef = useRef<HTMLDivElement>(null);

  // Interactive Screen 2: Interview Tool Suite states
  const [interviewStep, setInterviewStep] = useState<'setup' | 'loading' | 'active_question' | 'evaluating' | 'completed'>('setup');
  const [mockCategory, setMockCategory] = useState<'Technical' | 'HR' | 'Aptitude'>('Technical');
  const [mockRole, setMockRole] = useState<string>(userGoal);
  const [mockDifficulty, setMockDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [mockCompany, setMockCompany] = useState<string>('Google');
  const [mockFocusTopic, setMockFocusTopic] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<AnswerInput[]>([]);
  const [currentAnswerText, setCurrentAnswerText] = useState<string>('');
  const [latestEvaluation, setLatestEvaluation] = useState<InterviewSessionRecord | null>(null);
  const [isDictatingSimulated, setIsDictatingSimulated] = useState<boolean>(false);

  // Interactive Screen 3: Resume Scan states
  const [resumeText, setResumeText] = useState<string>(() => localStorage.getItem('pw_resume_text') || '');
  const [targetJobDesc, setTargetJobDesc] = useState<string>(() => localStorage.getItem('pw_resume_target_jd') || '');
  const [isScanningResume, setIsScanningResume] = useState<boolean>(false);
  const [activeResumeAnalysis, setActiveResumeAnalysis] = useState<ResumeAnalysisRecord | null>(() => {
    const local = localStorage.getItem('pw_resume_analysis');
    return local ? JSON.parse(local) : null;
  });

  // Pre-load Firebase Anonymous Auth for cloud writing rules alignment
  useEffect(() => {
    if (isFirebaseActive && auth) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setIsFirebaseUserReady(true);
          console.log("[PrepWise UI] Dynamic Auth initialized:", user.uid);
          // Sync existing records to Cloud Firestore if connected
          loadHistoryFromCloud();
        } else {
          signInAnonymously(auth).then(() => {
            setIsFirebaseUserReady(true);
          }).catch((err) => {
            console.error("Firebase auth failed: ", err);
          });
        }
      });
    }
  }, []);

  // Set Default State from User Goals
  useEffect(() => {
    setMockRole(userGoal);
  }, [userGoal]);

  // Scroll to latest Mentor dialogue
  useEffect(() => {
    mentorEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mentorMessages, mentorOpen]);

  // Sync to localstorage helper
  const syncHistoryLocal = (updated: InterviewSessionRecord[]) => {
    setInterviewHistory(updated);
    localStorage.setItem('pw_interview_history', JSON.stringify(updated));
  };

  // Toast dispatch helper
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load History from Cloud Firestore
  const loadHistoryFromCloud = async () => {
    if (!isFirebaseActive || !db || !auth?.currentUser) return;
    try {
      const colRef = collection(db, "interviews");
      // Since security rules might restrict queries or require index setup,
      // load all entries safely.
      const snapshot = await getDocs(colRef);
      const items: InterviewSessionRecord[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Map document structure
        items.push({
          id: doc.id,
          category: data.category || 'Technical',
          role: data.role || 'Software Engineer',
          difficulty: data.difficulty || 'Intermediate',
          company: data.company || 'Standard',
          score: data.score || 0,
          metrics: data.metrics || { communication: 50, technical: 50, confidence: 50, problemSolving: 50, clarity: 50 },
          feedback: data.feedback || '',
          questions: data.questions || [],
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      if (items.length > 0) {
        // Merge with initial records to ensure no blank charts
        const merged = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setInterviewHistory(merged);
        console.log("[PrepWise UI] Firestore Database results successfully synchronized.");
      }
    } catch (err) {
      console.warn("Could not query Firestore, continuing with local storage fallback state.", err);
    }
  };

  // Profile Save
  const handleSaveProfile = () => {
    localStorage.setItem('pw_user_name', userName);
    localStorage.setItem('pw_user_email', userEmail);
    localStorage.setItem('pw_user_goal', userGoal);
    showToast("Profile credentials synchronized globally", "success");
  };

  // Profile Reset
  const handleResetSystemCache = () => {
    localStorage.removeItem('pw_user_name');
    localStorage.removeItem('pw_user_email');
    localStorage.removeItem('pw_user_goal');
    localStorage.removeItem('pw_interview_history');
    localStorage.removeItem('pw_resume_text');
    localStorage.removeItem('pw_resume_target_jd');
    localStorage.removeItem('pw_resume_analysis');

    setUserName('James Manoj');
    setUserEmail('candidate.preview@prepwise.ai');
    setUserGoal('Senior Software Engineer');
    setInterviewHistory(INITIAL_HISTORY);
    setActiveResumeAnalysis(null);
    setResumeText('');
    setTargetJobDesc('');
    setStreakCount(1);
    showToast("App workspace and local database caches cleared", "info");
  };

  // "Ask MS" Chat Core API Integration
  const handleSendMentorMessage = async () => {
    if (!mentorInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `m-usr-${Date.now()}`,
      role: 'user',
      text: mentorInput,
      createdAt: new Date()
    };

    setMentorMessages(prev => [...prev, userMsg]);
    const payloadQuery = mentorInput;
    setMentorInput('');
    setMentorLoading(true);

    try {
      // Gather last 3 messages as prompt dialogue chain
      const historyPayload = [...mentorMessages.slice(-4), userMsg].map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch("/api/ask-ms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyPayload })
      });

      if (!res.ok) {
        throw new Error("Direct advisor node response was not 200 OK");
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `m-ai-${Date.now()}`,
        role: 'assistant',
        text: data.text || "I was unable to formulate a constructive insight. Please verify your internet connection.",
        createdAt: new Date()
      };
      setMentorMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Ask MS request failed:", err);
      // Client-side fallback if offline
      let mockReply = "Hello! My internal system modules are offline, or API keys are missing. Here is basic advice: prioritize practicing your STAR method logs!";
      if (payloadQuery.toLowerCase().includes("stripe")) {
        mockReply = "### Stripe System Interview Principles\n\nStripe targets technical depth:\n1. **Metrics First:** Detail real-time latency optimization, data sharding, or queue handling.\n2. **Clean APIs:** Propose exact query payloads before system layouts.\n3. **Idempotency:** Implement event check keys to eliminate duplicate transactions under heavy load.";
      } else if (payloadQuery.toLowerCase().includes("resume") || payloadQuery.toLowerCase().includes("cv")) {
        mockReply = "### Premium ATS Alignment Strategy\n\nTo raise your score:\n- Eliminate descriptive text and inject metrics. (e.g. \"Increased deployment throughput speed by 28%\")\n- List explicit technical nouns like TypeScript, Kubernetes, and Docker in single-column format.";
      }
      setMentorMessages(prev => [
        ...prev,
        {
          id: `m-ai-fallback-${Date.now()}`,
          role: 'assistant',
          text: mockReply,
          createdAt: new Date()
        }
      ]);
    } finally {
      setMentorLoading(false);
    }
  };

  // Launch pre-formulated templates for mentor
  const launchMentorSuggestion = (text: string) => {
    setMentorInput(text);
  };

  // Screen 2: INTERVIEW SETUP - Call Questions API
  const handleStartInterviewQuestions = async () => {
    setInterviewStep('loading');
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: mockCategory,
          role: mockRole,
          difficulty: mockDifficulty,
          company: mockCompany,
          customTopic: mockFocusTopic
        })
      });

      if (!res.ok) throw new Error("Could not download customized questions list");
      const list: InterviewQuestion[] = await res.json();
      setGeneratedQuestions(list);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setCurrentAnswerText('');
      setInterviewStep('active_question');
      showToast("Questions compiled successfully!", "success");
    } catch (err) {
      console.error(err);
      // Fallback
      setGeneratedQuestions([
        { id: 1, text: `As a ${mockRole}, how do you evaluate and optimize technical system latency transitions at ${mockCompany}?` },
        { id: 2, text: `Describe a scenario at ${mockCompany} where security permissions broke on production. How did you restore trust?` },
        { id: 3, text: `What parameters and database storage engines do you choose for scalable, read-heavy dashboards?` },
        { id: 4, text: `How do you convey high-stake architectural refactoring to non-technical stakeholders?` },
        { id: 5, text: `Explain your strategy for maintaining high standards under sharp team friction.` }
      ]);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setCurrentAnswerText('');
      setInterviewStep('active_question');
      showToast("Questions compiled (Simulation Mode)", "info");
    }
  };

  // Next Question flow
  const handleNextQuestion = () => {
    // Save current step answer
    const currentQ = generatedQuestions[currentQuestionIndex];
    const newAnswer: AnswerInput = {
      questionId: currentQ.id,
      questionText: currentQ.text,
      answerText: currentAnswerText.trim() || "[No details provided]"
    };

    const updatedAnswers = [...userAnswers, newAnswer];
    setUserAnswers(updatedAnswers);
    setCurrentAnswerText('');

    if (currentQuestionIndex < generatedQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Evaluate session
      triggerInterviewEvaluation(updatedAnswers);
    }
  };

  // Evaluate full interview via Gemini
  const triggerInterviewEvaluation = async (finalAnswers: AnswerInput[]) => {
    setInterviewStep('evaluating');
    try {
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: mockCategory,
          role: mockRole,
          answers: finalAnswers
        })
      });

      if (!res.ok) throw new Error("Evaluation appraisal failed");
      const results: AssessmentMetrics = await res.json();

      const newRecord: InterviewSessionRecord = {
        category: mockCategory,
        role: mockRole,
        difficulty: mockDifficulty,
        company: mockCompany,
        score: results.score,
        metrics: {
          communication: results.communicationScore,
          technical: results.technicalScore,
          confidence: results.confidenceScore,
          problemSolving: results.problemSolvingScore,
          clarity: results.clarityScore
        },
        feedback: results.feedback,
        questions: finalAnswers,
        createdAt: new Date().toISOString()
      };

      // Firestore cloud storage connection logic matching strict handleFirestoreError patterns
      if (isFirebaseActive && db) {
        try {
          await addDoc(collection(db, "interviews"), {
            ...newRecord,
            uid: auth?.currentUser?.uid || "anon-guest"
          });
          console.log("[Firestore] Interview score committed securely to database.");
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, "interviews");
        }
      }

      const nextHist = [...interviewHistory, newRecord];
      syncHistoryLocal(nextHist);
      setLatestEvaluation(newRecord);
      setInterviewStep('completed');
      setStreakCount(prev => prev + 1);
      showToast("Evaluation complete! Analytical scores saved.", "success");
    } catch (err) {
      console.error(err);
      // Fallback calculations representation
      const simulatedResult: InterviewSessionRecord = {
        category: mockCategory,
        role: mockRole,
        difficulty: mockDifficulty,
        company: mockCompany,
        score: Math.floor(Math.random() * 20) + 75,
        metrics: {
          communication: 80,
          technical: 84,
          confidence: 76,
          problemSolving: 82,
          clarity: 88
        },
        feedback: `### Core Strengths:\n- Demonstrated highly structured presentation metrics for standard development blocks.\n- Strong conceptual depth under STAR rules.\n\n### Areas for Improvement:\n- Need explicit metrics quantification in task targets.\n- Ensure database layouts are clearly diagrammed with concrete APIs.\n\n### 4-Week Custom Plan:\n- **Week 1:** Master cache eviction parameters.\n- **Week 2:** Practice mock scaling questions with peers.\n- **Week 3:** Perfect quantified metrics in standard interview profiles.\n- **Week 4:** Practice speed assessments.`,
        questions: finalAnswers,
        createdAt: new Date().toISOString()
      };

      const nextHist = [...interviewHistory, simulatedResult];
      syncHistoryLocal(nextHist);
      setLatestEvaluation(simulatedResult);
      setInterviewStep('completed');
      showToast("Evaluation synchronized in trial mode.", "info");
    }
  };

  // Inject beautiful premade sample STAR response
  const injectSTARResponseDemo = () => {
    switch (mockCategory) {
      case 'Technical':
        setCurrentAnswerText("At scale, we integrated premium distributed Redis nodes utilizing memory compaction pipelines. This optimization directly minimized database query latency thresholds by 38% and supported 10k additional transactional logs per minute without system degradation.");
        break;
      case 'HR':
        setCurrentAnswerText("S: A severe integration conflict occurred last winter when we had to restructure checkout flows under a critical launch gate.\nT: My clear accountability was to align team targets and prevent pipeline blockages.\nA: I led diagnostic architecture reviews, establishing clear REST parameters and sharding steps to resolve disputes.\nR: We met our deadlines smoothly, achieving an impressive 100% deployment uptime metric.");
        break;
      case 'Aptitude':
        setCurrentAnswerText("We analyze the workload metrics. We isolate read and write requirements, predicting roughly 115 continuous requests per second with a peak multiplier of 5x. We plan memory allocations using small clustered nodes to avoid excessive sizing budgets.");
        break;
    }
    showToast("Precision STAR response template injected", "info");
  };

  // Screen 3: RESUME SCANNERS
  const handleScanResumeATS = async () => {
    if (!resumeText.trim()) {
      showToast("Please provide CV draft text contents first.", "error");
      return;
    }
    setIsScanningResume(true);
    localStorage.setItem('pw_resume_text', resumeText);
    localStorage.setItem('pw_resume_target_jd', targetJobDesc);

    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textContent: resumeText,
          jobDescription: targetJobDesc || "Standard Tech Industry Parameters"
        })
      });

      if (!res.ok) throw new Error("ATS score scanner returned failure code");
      const analysis: ResumeAnalysisRecord = await res.json();
      setActiveResumeAnalysis(analysis);
      localStorage.setItem('pw_resume_analysis', JSON.stringify(analysis));
      showToast("ATS compliance scan accomplished!", "success");
    } catch (err) {
      console.error(err);
      // Fallback
      const fallbackAnalysis: ResumeAnalysisRecord = {
        skills: ["TypeScript", "React", "Node.js", "Express", "System Design", "Git", "Jest"],
        strengths: [
          "Demonstrates robust technical leading capacities.",
          "Solid history implementing asynchronous microservice pipelines."
        ],
        improvements: [
          "Format experiences strictly chronologically in single-column outlines.",
          "Avoid passive vocabulary like 'responsible for code checks', substitute with active metrics."
        ],
        summary: "An experienced, highly competent application builder with solid skills in full-stack setups, though resume formatting needs quantified impact parameters.",
        atsScore: 78,
        keywordMatches: [
          { word: "TypeScript", matched: true },
          { word: "Redis", matched: false },
          { word: "Kubernetes", matched: false },
          { word: "Idempotency", matched: true },
          { word: "System Design", matched: true },
          { word: "Kafka", matched: false }
        ],
        missingSkills: ["Redis Caching", "Docker Pipelines", "AWS IAM Policy setup"]
      };
      setActiveResumeAnalysis(fallbackAnalysis);
      localStorage.setItem('pw_resume_analysis', JSON.stringify(fallbackAnalysis));
      showToast("ATS scan accomplished (Simulation Mode)", "info");
    } finally {
      setIsScanningResume(false);
    }
  };

  // Pre-load demo resumes for client scanning
  const loadDemoResume = (type: 'senior' | 'junior' | 'marketing') => {
    let text = "";
    let jd = "";

    if (type === 'senior') {
      text = `Manoj P\nSenior Software Architect\n\nEXPERIENCE:\n- Worked with complex payment architectures, coordinating high-performance Stripe integration APIs across multi-region server clusters.\n- Implemented strict concurrency rules, reducing payload bottlenecks by 42%.\n- Mentored 12 back-end engineers on REST specs and relational database synchronization.\n\nSKILLS:\nJavaScript, TypeScript, Express, PostgreSQL, Redis, Docker, System Design, Unit Testing.`;
      jd = `Senior Level Tech Developer\nRequirements: Must have strong system design capabilities, experience with payment gateway APIs, cluster scaling orchestration, and a background in microservice caching systems.`;
    } else if (type === 'junior') {
      text = `John Doe\nJunior Web Enthusiast\n\nEXPERIENCE:\n- Responsible for checking bugs and helping with styled UI screens.\n- Maintained project tasks and made coffee.\n- Did minor front-end changes occasionally.\n\nSKILLS:\nHTML, Basic CSS, JS, React, Tailwind, Microsoft Word.`;
      jd = `Software Developer - Advanced full-stack engineer with expertise in database scaling, security protocols, AWS Cloud Architecture, and Docker deployments.`;
    }

    setResumeText(text);
    setTargetJobDesc(jd);
    showToast("Template demo uploaded successfully", "info");
  };

  return (
    <div className={`min-h-screen bg-[#07090e] text-white font-sans selection:bg-indigo-500/80 antialiased ${themeMode === 'light' ? 'bg-neutral-50 text-neutral-900' : ''}`}>
      
      {/* Decorative ambient blurred grid background logic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none" />
      <div className="absolute top-[20%] left-[10%] w-[350px] height-[350px] rounded-full bg-emerald-500/[0.02] filter blur-3xl pointer-events-none" />

      {/* Floating System Assessment Logs Toast Notification */}
      {toastMessage && (
        <div id="pw-global-toast" className={`fixed top-4 right-4 z-[9999] p-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-transform animate-bounce text-sm max-w-sm ${
          toastMessage.type === 'success' ? 'bg-[#10B981] text-white' :
          toastMessage.type === 'error' ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 flex-shrink-0" />}
          <span className="font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Dual Layout Toggle controls for desktop preview comfort */}
      <div className="hidden md:flex justify-between items-center px-8 py-3 bg-[#0a0d14]/75 border-b border-indigo-950/20 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2 rounded-xl text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
              PrepWise AI Mobile Core <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">v2.1 Production</span>
            </h1>
            <p className="text-[10px] text-zinc-400">High-Fidelity Candidate Mock Interview & Resume Optimization Shell</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="text-[11px] font-mono py-1.5 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/50 hover:text-white transition-all flex items-center gap-1.5"
          >
            {isFullscreen ? "Device View Simulator" : "Max Full Screen Layout"}
          </button>
          
          <button
            onClick={() => setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')}
            className="text-xs bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/50 p-2 rounded-xl transition"
            title="Toggle theme mode"
          >
            {themeMode === 'dark' ? "☀️ Light UI" : "🌙 Dark UI"}
          </button>
        </div>
      </div>

      {/* Primary Simulator Workspace Grid system */}
      <main className="w-full max-w-[1700px] mx-auto p-4 md:p-8 flex items-center justify-center">

        <div className={`w-full transition-all duration-300 ${isFullscreen ? 'max-w-7xl' : 'max-w-md'}`}>
          <div className={`bg-black rounded-[40px] shadow-[0_32px_80px_rgba(0,0,0,0.85)] border-[8px] border-zinc-800 relative flex flex-col overflow-hidden aspect-[9/19] select-none ${
            isFullscreen ? 'aspect-auto min-h-[85vh] rounded-[24px] border-0 shadow-none' : ''
          }`}>
            
            {/* Phone Camera Notch (Hidden in full screen mode) */}
            {!isFullscreen && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-3xl z-50 flex items-center justify-center">
                <span className="w-12 h-1 bg-zinc-850 rounded-full" />
                <span className="w-2.5 h-2.5 bg-indigo-950 rounded-full ml-3 border border-zinc-900" />
              </div>
            )}

            {/* Simulated Virtual Status Navigation Bar */}
            <div className={`flex items-center justify-between px-6 pt-10 pb-2 bg-[#080b11] text-[10px] font-mono text-zinc-400 select-none shrink-0 z-45 border-b border-indigo-950/20 ${isFullscreen ? 'hidden' : ''}`}>
              <div className="flex items-center space-x-1 font-bold">
                <span>9:41</span>
                <Globe className="w-2.5 h-2.5 text-zinc-500" />
              </div>
              <div className="flex items-center space-x-1">
                <span>5G</span>
                <span className="h-2 w-3.5 bg-emerald-500 rounded-xs border border-zinc-850" />
              </div>
            </div>

            {/* DYNAMIC VIEW CONTAINER */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 text-left relative bg-[#090b11] ${themeMode === 'light' ? 'bg-[#f8f9fc]' : ''}`} style={{ scrollbarWidth: 'none' }}>
              
              {/* SCREEN 1: HOME PANEL */}
              {activeTab === 'home' && (
                <div className="space-y-5 pb-24 animate-fade-in">
                  
                  {/* Top Header Identity */}
                  <div className="flex justify-between items-center bg-indigo-950/15 p-4 rounded-3xl border border-indigo-900/20">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest block">Candidate Account</span>
                      <h2 className="text-xl font-bold tracking-tight text-white">{userName}</h2>
                      <div className="flex items-center space-x-1.5 pt-1">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-mono px-2 py-0.5 rounded-full border border-indigo-500/20 font-bold">{userGoal}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center bg-indigo-950/40 p-2.5 rounded-2xl border border-indigo-500/10 min-w-[65px]">
                      <Flame className="w-5 h-5 text-orange-400 animate-pulse fill-orange-400" />
                      <span className="text-xs font-bold text-orange-400 mt-1">{streakCount} Days</span>
                      <span className="text-[7.5px] font-mono text-zinc-500 uppercase">Streak</span>
                    </div>
                  </div>

                  {/* Comprehensive Stats Dashboard Summary */}
                  <div className="bg-gradient-to-br from-indigo-900/30 to-[#0c0f18] border border-indigo-900/20 p-4 rounded-3xl space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-center border-b border-indigo-950/40 pb-2">
                      <h3 className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Progress Metrics
                      </h3>
                      <span className="text-[10px] text-zinc-400">Current Rating</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-black/25 p-3 rounded-2xl border border-zinc-800/10">
                        <span className="text-[9px] text-zinc-500 block">Mock Session Index</span>
                        <span className="text-2xl font-black text-white">{interviewHistory.length}</span>
                        <span className="text-[8px] text-emerald-400 font-mono block mt-0.5">Ready to drill</span>
                      </div>
                      <div className="bg-black/25 p-3 rounded-2xl border border-zinc-800/10">
                        <span className="text-[9px] text-zinc-500 block">Avg Appraisal Rating</span>
                        <span className="text-2xl font-black text-indigo-400">
                          {interviewHistory.length > 0
                            ? `${Math.round(interviewHistory.reduce((sum, item) => sum + item.score, 0) / interviewHistory.length)}%`
                            : "0%"}
                        </span>
                        <span className="text-[8px] text-zinc-400 font-mono block mt-0.5">Target: 85%+</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>ATS Resume Score Ready</span>
                        <span className="font-mono text-indigo-400 font-bold">{activeResumeAnalysis ? `${activeResumeAnalysis.atsScore}%` : "Not scanned yet"}</span>
                      </div>
                      <div className="h-1 text-zinc-800 rounded bg-zinc-800">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded transition-all duration-500" style={{ width: activeResumeAnalysis ? `${activeResumeAnalysis.atsScore}%` : '5%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Launch actions */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-serif tracking-widest uppercase text-zinc-500 font-bold block">Start Preparation Units</span>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setActiveTab('interview')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-white/10 p-2 rounded-2xl self-start">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform">Interactive Mock Drills</h4>
                          <span className="text-[10px] text-indigo-200">5-question comprehensive scoring</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setActiveTab('resume')}
                        className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 text-white rounded-3xl p-4 text-left transition-all duration-200 cursor-pointer hover:bg-zinc-850/80 group flex flex-col justify-between min-h-[110px]"
                      >
                        <div className="bg-zinc-800 p-2 rounded-2xl self-start">
                          <UploadCloud className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block mb-0.5 group-hover:translate-x-1 transition-transform font-sans">ATS Resume Scanner</h4>
                          <span className="text-[10px] text-zinc-400">Optimize keywords and compliance</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Ask MS Assistant Trigger Banner */}
                  <div
                    onClick={() => setMentorOpen(true)}
                    className="bg-gradient-to-r from-indigo-950/40 via-[#101424]/60 to-[#0e1222] border border-indigo-500/20 p-4 rounded-3xl cursor-pointer hover:border-indigo-500/40 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <div className="relative">
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-400 rounded-full border border-black animate-ping" />
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 rounded-full border border-black" />
                        <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/20 text-indigo-400 flex items-center justify-center font-black">
                          MS
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white flex items-center gap-1">
                          Talk with Lead Coach <Sparkles className="w-3 h-3 text-indigo-400" />
                        </h4>
                        <p className="text-[10px] text-zinc-400 leading-normal">Get instant technical reviews and interview checklists.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-500" />
                  </div>

                  {/* Recent activities tracker summary list */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] tracking-widest uppercase font-mono text-zinc-500">
                      <span>Recent Activity Feeds</span>
                      <span className="text-indigo-400 text-[9px] cursor-pointer" onClick={() => setActiveTab('dashboard')}>View Logs</span>
                    </div>

                    <div className="space-y-2">
                      {interviewHistory.slice(-3).map((item, index) => (
                        <div
                          key={item.id || index}
                          onClick={() => setViewingRecordDetail(item)}
                          className="p-3 bg-zinc-900/60 border border-zinc-800/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-850/80 hover:border-indigo-500/10 transition-all"
                        >
                          <div className="flex items-center space-x-3 text-left">
                            <div className="bg-[#111] p-2 rounded-xl text-zinc-400 border border-zinc-800 text-[10px] font-mono tracking-wider">
                              {item.category.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{item.role}</h4>
                              <span className="text-[10px] text-zinc-400">{item.company} • {item.difficulty}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-black font-mono px-2 py-1 rounded-lg ${
                              item.score >= 80 ? 'bg-emerald-500/10 text-emerald-400' :
                              item.score >= 60 ? 'bg-orange-500/10 text-orange-400' : 'bg-red-500/10 text-red-500'
                            }`}>{item.score}%</span>
                            <ChevronRight className="w-4 h-4 text-zinc-600" />
                          </div>
                        </div>
                      ))}

                      {interviewHistory.length === 0 && (
                        <div className="bg-zinc-900/10 border border-zinc-800/10 rounded-2xl p-6 text-center">
                          <p className="text-xs text-zinc-500">No mock history saved yet. Begin your first session below.</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN 2: INTERVIEW WORKSPACE */}
              {activeTab === 'interview' && (
                <div className="space-y-5 pb-24 animate-fade-in text-left">
                  
                  {/* SELECTION SETUP STATE */}
                  {interviewStep === 'setup' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Simulation Studio</span>
                        <h2 className="text-xl font-bold tracking-tight text-white font-sans">Mock Interview Setup</h2>
                        <p className="text-[11px] text-zinc-400">Tailor your evaluation. Gemini will render customized professional queries.</p>
                      </div>

                      {/* Select Category Multi Choice layout */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-zinc-550 block font-bold">Session Focus domain</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'Technical', title: 'Tech Core' },
                            { id: 'HR', title: 'STAR Behavioral' },
                            { id: 'Aptitude', title: 'Aptitude' }
                          ].map((cat) => {
                            const active = mockCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                onClick={() => setMockCategory(cat.id as any)}
                                className={`p-3 rounded-2xl text-[11px] border text-center transition-all cursor-pointer font-bold ${
                                  active
                                    ? 'bg-[#1e1a4a] text-indigo-300 border-indigo-500 shadow-md scale-[1.02]'
                                    : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-850'
                                }`}
                              >
                                {cat.title}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Input Role form fields */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target professional role</label>
                          <input
                            type="text"
                            value={mockRole}
                            onChange={(e) => setMockRole(e.target.value)}
                            placeholder="e.g. Senior Backend Engineer"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white uppercase font-sans focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target company standard focus</label>
                          <input
                            type="text"
                            value={mockCompany}
                            onChange={(e) => setMockCompany(e.target.value)}
                            placeholder="e.g. Stripe, Netflix, Google"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {/* select Difficulty level */}
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Appraisal intensity level</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                              const active = mockDifficulty === lvl;
                              return (
                                <button
                                  key={lvl}
                                  onClick={() => setMockDifficulty(lvl as any)}
                                  className={`p-2 rounded-xl text-[10.5px] text-center border transition-all cursor-pointer ${
                                    active
                                      ? 'bg-zinc-850 text-white border-zinc-500 font-bold'
                                      : 'bg-zinc-900 text-zinc-500 border-transparent hover:bg-zinc-850'
                                  }`}
                                >
                                  {lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Optional Topic details */}
                        <div>
                          <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Focus Topics / Key Skills (Optional)</label>
                          <input
                            type="text"
                            value={mockFocusTopic}
                            onChange={(e) => setMockFocusTopic(e.target.value)}
                            placeholder="e.g. Concurrency pipelines, system design"
                            className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Launch Trigger Button */}
                      <button
                        onClick={handleStartInterviewQuestions}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-3xl text-sm font-extrabold cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Compile Prep Session</span>
                      </button>
                    </div>
                  )}

                  {/* LOADING INTENSIFY PULSE WINDOW */}
                  {interviewStep === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="relative">
                        <span className="absolute inset-0 h-16 w-16 bg-indigo-500/20 rounded-full animate-ping" />
                        <div className="w-16 h-16 bg-indigo-600/10 border border-indigo-500 text-indigo-400 flex items-center justify-center rounded-full animate-spin">
                          <RefreshCw className="w-6 h-6 animate-spin" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white">Deconstructing Recruiting Patterns</h3>
                        <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mx-auto">Gemini is drafting 5 tailored questions referencing {mockCompany} culture styles...</p>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE QUESTION COMPONENT */}
                  {interviewStep === 'active_question' && generatedQuestions.length > 0 && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Session progress line */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-zinc-400">
                          <span>{mockCategory} Coaching • {mockDifficulty}</span>
                          <span className="font-bold">Progress: {currentQuestionIndex + 1} / {generatedQuestions.length}</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded bg-zinc-805">
                          <div className="h-full bg-indigo-500 rounded transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / generatedQuestions.length) * 100}%` }} />
                        </div>
                      </div>

                      {/* Question panel Card */}
                      <div className="bg-zinc-900/80 border border-zinc-800/15 p-5 rounded-3xl text-left space-y-1 relative overflow-hidden">
                        <span className="text-[10px] font-mono text-indigo-400 font-extrabold">QUESTION CORE</span>
                        <p className="text-sm font-bold text-white leading-normal pt-1">{generatedQuestions[currentQuestionIndex].text}</p>
                      </div>

                      {/* Answer layout */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block font-bold">Your responses details</label>
                          
                          <button
                            onClick={injectSTARResponseDemo}
                            className="bg-indigo-950/40 text-indigo-400 text-[9px] font-mono hover:bg-indigo-900/35 border border-indigo-500/15 p-1 px-2.5 rounded-lg transition"
                          >
                            Demo STAR Draft
                          </button>
                        </div>

                        <textarea
                          rows={4}
                          value={currentAnswerText}
                          onChange={(e) => setCurrentAnswerText(e.target.value)}
                          placeholder="Type your response here. For behavioral questions, remember to frame your narrative using the Situation, Task, Action, and Result (STAR) structure."
                          className="w-full bg-zinc-900/80 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Simulate dictation or helper voice indicators */}
                      <div className="bg-zinc-950/45 p-3 rounded-2xl flex items-center justify-between border border-zinc-850/50">
                        <div className="flex items-center space-x-2.5">
                          <span className={`h-2 w-2.5 rounded-full ${isDictatingSimulated ? 'bg-red-400 animate-pulse' : 'bg-indigo-400'}`} />
                          <span className="text-[10px] text-zinc-400">Oral Practice voice dictation simulation:</span>
                        </div>
                        <button
                          onClick={() => {
                            setIsDictatingSimulated(p => !p);
                            if(!isDictatingSimulated) {
                              setCurrentAnswerText("At Netflix, our core database nodes reached CPU bottlenecks. I orchestrated partitioning of table logs based on tenant hashes. This result prevented data lockouts, sustaining our processing metrics by 99% during launch campaigns.");
                              showToast("Vocal synthesis input simulated completed", "success");
                            }
                          }}
                          className="bg-zinc-850 hover:bg-zinc-800 text-[10px] py-1 px-2 text-white border border-zinc-700/50 rounded-xl"
                        >
                          {isDictatingSimulated ? "Stop Mic" : "Start Mic"}
                        </button>
                      </div>

                      {/* Action trigger Next / Submit */}
                      <button
                        onClick={handleNextQuestion}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-3 px-4 text-sm font-extrabold cursor-pointer transition flex items-center justify-center space-x-2"
                      >
                        <span>
                          {currentQuestionIndex === generatedQuestions.length - 1
                            ? "Compile Appraisal Scores"
                            : "Save & Continue Mock"}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* EVALUATING WAITING VIEW */}
                  {interviewStep === 'evaluating' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center animate-pulse">
                      <div className="relative">
                        <span className="absolute inset-0 h-16 w-16 bg-emerald-500/20 rounded-full animate-ping" />
                        <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500 text-emerald-400 flex items-center justify-center rounded-full animate-bounce">
                          <Award className="w-8 h-8 animate-pulse" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-extrabold text-white">Synthesizing Appraisal Assessment</h3>
                        <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed mx-auto">Evaluating communication brevity, conceptual depth, and technical coherence templates...</p>
                      </div>
                    </div>
                  )}

                  {/* COMPLETED APPRAISAL STATE */}
                  {interviewStep === 'completed' && latestEvaluation && (
                    <div className="space-y-5 animate-fade-in">
                      
                      {/* Score circle badge */}
                      <div className="bg-gradient-to-tr from-indigo-950/40 via-[#121629] to-black border border-indigo-500/20 p-5 rounded-3xl text-center space-y-3 relative overflow-hidden">
                        
                        <div className="inline-flex items-center justify-center bg-indigo-600/10 border border-indigo-500/30 p-2.5 rounded-2xl mb-1 text-indigo-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-[10px] font-mono tracking-widest uppercase font-bold ml-1">EVALUATION FINISHED</span>
                        </div>

                        <div className="space-y-0.5">
                          <h3 className="text-4xl font-black text-white">{latestEvaluation.score}%</h3>
                          <span className="text-xs text-zinc-400">{mockRole} Mock Session Rating</span>
                        </div>

                        {/* Quick rating gauge bars */}
                        <div className="grid grid-cols-5 gap-1.5 pt-2">
                          {[
                            { label: 'COM', val: latestEvaluation.metrics.communication, color: 'bg-indigo-500' },
                            { label: 'TEC', val: latestEvaluation.metrics.technical, color: 'bg-emerald-500' },
                            { label: 'CON', val: latestEvaluation.metrics.confidence, color: 'bg-amber-400' },
                            { label: 'SOL', val: latestEvaluation.metrics.problemSolving, color: 'bg-pink-500' },
                            { label: 'CLA', val: latestEvaluation.metrics.clarity, color: 'bg-sky-500' }
                          ].map((b) => (
                            <div key={b.label} className="bg-black/40 p-1.5 rounded-lg border border-zinc-800/10 text-center">
                              <span className="text-[7.5px] text-zinc-500 block">{b.label}</span>
                              <span className="text-[10px] font-bold text-white font-mono">{b.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Feedback in raw markdown format */}
                      <div className="bg-[#0b0c10] border border-zinc-800/30 p-4 rounded-3xl space-y-3 max-h-[350px] overflow-y-auto leading-relaxed markdown-container" style={{ scrollbarWidth: 'none' }}>
                        <span className="text-[11px] font-mono text-zinc-400 block pb-1 border-b border-zinc-800 uppercase tracking-widest">Coaching Commentary Details</span>
                        <div className="text-xs text-zinc-300 space-y-3 prose prose-invert">
                          <ReactMarkdown>{latestEvaluation.feedback}</ReactMarkdown>
                        </div>
                      </div>

                      {/* Back button */}
                      <button
                        onClick={() => setInterviewStep('setup')}
                        className="w-full bg-zinc-850 hover:bg-zinc-800 text-white rounded-3xl py-3 px-4 text-xs font-bold transition border border-zinc-700/50"
                      >
                        Start Next Prep Session
                      </button>

                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 3: RESUME SCANS */}
              {activeTab === 'resume' && (
                <div className="space-y-4 pb-24 animate-fade-in text-left">
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">Candidate Optimization</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Resume ATS Auditor</h2>
                    <p className="text-[11px] text-zinc-400">Upload your CV to identify optimization gaps and compute target job keyword alignments.</p>
                  </div>

                  {/* File Mock Trigger button layouts */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-zinc-450 block font-bold">Fast-track Demo CV Uplink</label>
                    <div className="grid grid-cols-2 gap-2 pb-1 bg-[#101321] p-2 rounded-2xl border border-indigo-900/10">
                      <button
                        onClick={() => loadDemoResume('senior')}
                        className="text-[10.5px] p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:text-indigo-300 hover:border-indigo-500/20 transition cursor-pointer"
                      >
                        📄 Preload Senior CV
                      </button>
                      <button
                        onClick={() => loadDemoResume('junior')}
                        className="text-[10.5px] p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:text-indigo-300 hover:border-indigo-500/20 transition cursor-pointer"
                      >
                        📄 Preload Junior CV
                      </button>
                    </div>
                  </div>

                  {/* Input areas */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Paste Resume/CV Text</label>
                      <textarea
                        rows={5}
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste plain text content of your resume/CV here..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-zinc-400 block font-bold mb-1">Target Job Description</label>
                      <textarea
                        rows={3}
                        value={targetJobDesc}
                        onChange={(e) => setTargetJobDesc(e.target.value)}
                        placeholder="Provide the target job description to verify index alignments..."
                        className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Submit scan */}
                    <button
                      onClick={handleScanResumeATS}
                      disabled={isScanningResume}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-3xl text-sm font-extrabold cursor-pointer transition flex items-center justify-center space-x-2 shadow-lg"
                    >
                      {isScanningResume ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Auditing Profile Compliance...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Scan Resume ATS Score</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* SCAN RESULTS ACTIVE */}
                  {activeResumeAnalysis && !isScanningResume && (
                    <div className="space-y-4 pt-3 border-t border-indigo-950/20 animate-fade-in text-left">
                      
                      {/* Circle compliance dial */}
                      <div className="bg-gradient-to-tr from-indigo-950/30 via-zinc-900 to-[#101423] border border-indigo-900/15 p-4 rounded-3xl flex items-center justify-between">
                        <div className="space-y-1 text-left max-w-[210px]">
                          <span className="text-[9px] font-mono text-emerald-400 font-extrabold tracking-widest block uppercase">SCAN SCORE RESULTS</span>
                          <h4 className="text-sm font-bold text-white">Target ATS Match: {activeResumeAnalysis.atsScore}%</h4>
                          <p className="text-[10.5px] text-zinc-400 leading-normal">{activeResumeAnalysis.summary}</p>
                        </div>

                        {/* Simple SVG circle loader */}
                        <div className="relative h-16 w-16 shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="#1f2937" strokeWidth="4.5" fill="transparent" />
                            <circle cx="32" cy="32" r="26" stroke="#4f46e5" strokeWidth="4.5" fill="transparent"
                              strokeDasharray={2 * Math.PI * 26}
                              strokeDashoffset={2 * Math.PI * 26 * (1 - activeResumeAnalysis.atsScore / 100)}
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-black font-mono">
                            {activeResumeAnalysis.atsScore}%
                          </div>
                        </div>
                      </div>

                      {/* Keywords match check grids */}
                      <div className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-850/40 space-y-2">
                        <h4 className="text-[10.5px] uppercase font-mono tracking-wider text-zinc-500 font-bold">Keyword Optimization matches</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {activeResumeAnalysis.keywordMatches.map((kw, i) => (
                            <div key={i} className="flex items-center space-x-2 text-[10px] bg-black/25 p-1.5 px-3 rounded-lg border border-zinc-850/20">
                              {kw.matched ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              )}
                              <span className={`truncate ${kw.matched ? 'text-zinc-300' : 'text-zinc-500 line-through'}`}>{kw.word}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Missing skills */}
                      {activeResumeAnalysis.missingSkills.length > 0 && (
                        <div className="p-3 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-1.5">
                          <h4 className="text-[10px] uppercase font-mono tracking-wider text-orange-400 font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Missing industry keywords
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {activeResumeAnalysis.missingSkills.map((sk, i) => (
                              <span key={i} className="text-[9px] bg-orange-500/10 text-orange-300 font-mono p-1 px-2.5 rounded-lg border border-orange-500/15">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations split layout info panels */}
                      <div className="space-y-2">
                        <h4 className="text-[10.5px] uppercase font-mono text-zinc-450 block font-bold">Recommendations Details</h4>
                        
                        <div className="space-y-1.5">
                          {activeResumeAnalysis.improvements.map((str, i) => (
                            <div key={i} className="p-2.5 bg-[#0b0c10] border border-zinc-850/60 rounded-xl flex items-start space-x-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                              <p className="text-[10.5px] text-zinc-350 leading-normal">{str}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* SCREEN 4: DASHBOARDS */}
              {activeTab === 'dashboard' && (
                <div className="space-y-5 pb-24 animate-fade-in text-left">
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block font-sans">Analytics Hub</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Appraisal Dashboard</h2>
                    <p className="text-[11px] text-zinc-450">Track historical performance dimensions and simulated STAR index trends.</p>
                  </div>

                  {/* Historical progress analytics chart */}
                  <div className="bg-gradient-to-b from-[#101423] to-[#04060b] border border-indigo-900/15 p-4 rounded-3xl space-y-3">
                    <h4 className="text-[10px] uppercase font-mono tracking-widest text-[#818CF8] font-black">Performance Progression Curve</h4>
                    
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={interviewHistory.map((item, i) => ({
                            name: `T-${i + 1}`,
                            score: item.score
                          }))}
                          margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={9} tickLine={false} />
                          <YAxis stroke="#52525b" fontSize={9} domain={[50, 100]} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', fontSize: 10 }} />
                          <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Areas for focus lists */}
                  <div className="bg-[#0c0f18] border border-indigo-950/20 p-4 rounded-3xl space-y-3">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 font-bold block">Aggregated Weakness Targets</span>
                    
                    <div className="space-y-2">
                      {[
                        { title: 'Convoluted Project STAR Results', desc: 'Missing active metrics quantifiers like runtime margins or cost parameters.' },
                        { title: 'Superficial Caching Definitions', desc: 'Verify knowledge of eviction policies under high concurrency patterns.' },
                        { title: 'Cluttered Resume Core layout', desc: 'Ensure strict chronological patterns without multi-column graphical dividers.' }
                      ].map((weak, idx) => (
                        <div key={idx} className="p-3 bg-black/30 border border-zinc-800/10 rounded-2xl">
                          <h4 className="text-xs font-bold text-white mb-0.5">{weak.title}</h4>
                          <span className="text-[10px] text-zinc-450 leading-relaxed block">{weak.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Full list of assessments */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest block font-serif">Historical Sessions Files</span>
                    
                    <div className="space-y-2">
                      {interviewHistory.map((item, index) => (
                        <div
                          key={item.id || index}
                          onClick={() => setViewingRecordDetail(item)}
                          className="p-3 bg-zinc-900/60 border border-zinc-800/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-zinc-850/80 transition"
                        >
                          <div className="flex items-center space-x-3 text-left">
                            <div className="bg-[#111] p-2 rounded-xl text-zinc-400 font-mono text-[9px]">
                              {item.category.slice(0, 3).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white truncate max-w-[190px]">{item.role}</h4>
                              <span className="text-[10px] text-zinc-450 block">{item.company} • {item.difficulty}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1">
                            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 p-1 px-2 rounded-xl">{item.score}%</span>
                            <ChevronRight className="w-4 h-4 text-zinc-650" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SCREEN 5: WORKSPACE PROFILE EDITORS */}
              {activeTab === 'profile' && (
                <div className="space-y-4 pb-24 animate-fade-in text-left">
                  
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest block">System Identity</span>
                    <h2 className="text-xl font-bold tracking-tight text-white font-sans">Set Profile Settings</h2>
                    <p className="text-[11px] text-zinc-450">Track default profile structures customizable globally across interviews.</p>
                  </div>

                  {/* Avatar info */}
                  <div className="bg-zinc-900/80 p-4 border border-zinc-850 rounded-3xl flex items-center space-x-3 text-left">
                    <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center font-black rounded-2xl text-lg shadow-md">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{userName}</h4>
                      <span className="text-[10px] text-zinc-400 block">{userEmail}</span>
                    </div>
                  </div>

                  {/* Config settings */}
                  <div className="space-y-3 bg-zinc-900/30 p-4 border border-zinc-850/50 rounded-3xl">
                    <span className="text-[9.5px] uppercase font-mono tracking-widest text-zinc-500 font-extrabold block mb-2">Configure Parameters</span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Your Display Name</label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Target Role Target</label>
                        <input
                          type="text"
                          value={userGoal}
                          onChange={(e) => setUserGoal(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Your Email</label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black py-2 rounded-xl mt-3 px-4 font-mono uppercase transition cursor-pointer shrink-0"
                    >
                      Save Profile Parameters
                    </button>
                  </div>

                  {/* Reset indicators */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-zinc-550 block font-bold">System Maintenance</span>
                    
                    <button
                      onClick={handleResetSystemCache}
                      className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Purge Local System Memory</span>
                    </button>
                  </div>

                </div>
              )}

            </div>

            {/* FLOATING GLASS INDIGO ASSISTANT DRAWER PANEL */}
            {mentorOpen && (
              <div className="absolute inset-x-0 bottom-0 top-16 bg-black/95 backdrop-blur-xl z-50 flex flex-col justify-between transition-all duration-300">
                
                {/* Drawer header */}
                <div className="bg-indigo-950/20 p-4 border-b border-zinc-850/60 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Ask MS System Coach
                      </h4>
                      <span className="text-[9px] text-emerald-400 font-mono tracking-widest uppercase">● Online</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setMentorOpen(false)}
                    className="p-1 px-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                  >
                    Close Dialog
                  </button>
                </div>

                {/* Live Message listings space */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 text-left" style={{ scrollbarWidth: 'none' }}>
                  {mentorMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`p-3 max-w-[85%] rounded-3xl text-xs leading-relaxed space-y-1.5 ${
                        msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-900/90 text-zinc-200 border border-zinc-850'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                        <span className="text-[7.5px] font-mono text-zinc-500 block text-right">
                          {msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {mentorLoading && (
                    <div className="p-2.5 bg-zinc-900 border border-zinc-850/50 rounded-2xl text-xs text-zinc-400 inline-flex items-center space-x-2">
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-100" />
                      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce delay-200" />
                      <span>Synthesizing coaching checklist...</span>
                    </div>
                  )}
                  <div ref={mentorEndRef} />
                </div>

                {/* Suggestion items */}
                <div className="p-3 bg-zinc-950 border-t border-zinc-850/50 flex flex-nowrap gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {[
                    "Stripe webhooks alignment",
                    "Resume metrics checklist",
                    "STAR behavioral layout example"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => launchMentorSuggestion(sug)}
                      className="text-[10px] bg-zinc-900 hover:bg-zinc-850 text-indigo-300 border border-indigo-500/20 p-1.5 px-3 rounded-full whitespace-nowrap cursor-pointer transition shrink-0"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Input block */}
                <div className="p-4 bg-zinc-950 border-t border-zinc-850/50 flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMentorMessage()}
                    placeholder="Ask MS advice on scaling or behavioralSTAR..."
                    className="flex-1 bg-zinc-900 rounded-2xl text-xs p-3 border border-zinc-850/80 text-white focus:outline-none"
                  />
                  <button
                    onClick={handleSendMentorMessage}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}

            {/* FULL HISTORIC MODAL DETAIL OVERLAYS */}
            {viewingRecordDetail && (
              <div className="absolute inset-0 bg-black/95 z-50 flex flex-col justify-between transition-all duration-300">
                
                {/* Detail header */}
                <div className="bg-[#101423] p-4 border-b border-zinc-850 flex items-center justify-between text-left">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-xl text-xs font-mono font-bold uppercase tracking-widest">
                      {viewingRecordDetail.category.slice(0, 3)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[170px]">{viewingRecordDetail.role}</h4>
                      <span className="text-[10px] text-zinc-455">{viewingRecordDetail.company} • {viewingRecordDetail.difficulty}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingRecordDetail(null)}
                    className="p-1 px-2 bg-zinc-800 text-zinc-200 text-xs rounded-lg"
                  >
                    Close Details
                  </button>
                </div>

                {/* Detail scrolling metrics body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left" style={{ scrollbarWidth: 'none' }}>
                  
                  {/* Score breakdown bar */}
                  <div className="bg-zinc-900 p-4 rounded-3xl border border-zinc-800 text-center space-y-2">
                    <span className="text-[9px] font-mono text-indigo-400 block tracking-widest uppercase">COMPOSITE RATING</span>
                    <h3 className="text-3xl font-black text-white">{viewingRecordDetail.score}%</h3>
                    <div className="grid grid-cols-5 gap-1.5 pt-2 border-t border-zinc-850/40">
                      {[
                        { label: 'COM', val: viewingRecordDetail.metrics.communication },
                        { label: 'TEC', val: viewingRecordDetail.metrics.technical },
                        { label: 'CON', val: viewingRecordDetail.metrics.confidence },
                        { label: 'SOL', val: viewingRecordDetail.metrics.problemSolving },
                        { label: 'CLA', val: viewingRecordDetail.metrics.clarity }
                      ].map((bar) => (
                        <div key={bar.label} className="bg-black/30 p-1 rounded-md text-center">
                          <span className="text-[8px] text-zinc-500 block">{bar.label}</span>
                          <span className="text-[9.5px] font-bold text-white">{bar.val}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback texts */}
                  <div className="bg-[#0b0c10] border border-zinc-850 p-4 rounded-3xl space-y-3 prose prose-invert overflow-auto text-xs text-zinc-300">
                    <ReactMarkdown>{viewingRecordDetail.feedback}</ReactMarkdown>
                  </div>

                  {/* Question & Answers logs */}
                  {viewingRecordDetail.questions && viewingRecordDetail.questions.length > 0 && (
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 font-bold block">Interview Transcript logs</span>
                      
                      <div className="space-y-3">
                        {viewingRecordDetail.questions.map((q, idx) => (
                          <div key={idx} className="bg-zinc-900/60 p-3.5 rounded-2xl border border-zinc-850/60 text-xs space-y-1.5">
                            <span className="text-[9.5px] font-mono font-bold text-indigo-400">Q{idx + 1}: {q.questionText}</span>
                            <p className="text-zinc-350 bg-black/35 p-2 rounded-xl border border-zinc-850/50 leading-relaxed font-sans">{q.answerText}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                <div className="p-4 bg-zinc-950 border-t border-zinc-850">
                  <button
                    onClick={() => setViewingRecordDetail(null)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-3xl py-2 px-4 text-xs font-bold transition"
                  >
                    Dismiss Session logs
                  </button>
                </div>

              </div>
            )}

            {/* Simulated Glassmorphism Bottom Navigation Dock inside Phone Chassis */}
            <nav className="absolute bottom-4 left-4 right-4 bg-black/85 backdrop-blur-md border border-zinc-800 rounded-3xl py-2 px-3 flex items-center justify-between select-none z-40 shadow-2xl">
              {[
                { id: 'home', label: 'Home', icon: Home },
                { id: 'interview', label: 'Interview', icon: Play },
                { id: 'resume', label: 'Resume', icon: FileText },
                { id: 'dashboard', label: 'Metrics', icon: BarChart3 },
                { id: 'profile', label: 'Profile', icon: User }
              ].map((navTab) => {
                const isActive = activeTab === navTab.id;
                const IconComp = navTab.icon;
                return (
                  <button
                    key={navTab.id}
                    onClick={() => {
                      setActiveTab(navTab.id as any);
                    }}
                    className={`flex flex-col items-center flex-1 cursor-pointer transition-transform py-1 group ${
                      isActive ? 'text-indigo-400 font-bold scale-105' : 'text-zinc-500 hover:text-white/60'
                    }`}
                  >
                    <IconComp className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-400 fill-indigo-500/10' : ''}`} />
                    <span className="text-[8px] mt-0.5">{navTab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Apple Home Indicator Bar */}
            <div className="absolute bottom-1 right-1/2 translate-x-1/2 w-28 h-1 bg-zinc-850 rounded-full z-50 pointer-events-none" />

          </div>
        </div>

      </main>

      {/* High-contrast beautiful display footer links */}
      <footer className="py-6 px-10 text-center text-zinc-550 border-t border-indigo-950/20 text-xs font-mono relative z-10">
        PrepWise AI Core Framework Workspace &copy; 2026. Powered by Google AI Studio Gemini 3.5.
      </footer>
    </div>
  );
}
