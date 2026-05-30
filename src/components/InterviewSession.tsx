import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Loader2, Sparkles, Send } from 'lucide-react';
import { InterviewCategory, Question, Answer } from '../types';

interface InterviewSessionProps {
  initialCategory: InterviewCategory | null;
  onCancel: () => void;
  onSubmit: (category: InterviewCategory, role: string, questions: Question[], answers: Answer[]) => Promise<void>;
}

export default function InterviewSession({
  initialCategory,
  onCancel,
  onSubmit,
}: InterviewSessionProps) {
  // Config state
  const [configActive, setConfigActive] = useState(true);
  const [category, setCategory] = useState<InterviewCategory>(initialCategory || 'Technical');
  const [role, setRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [customTopic, setCustomTopic] = useState('');

  // Practice state
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Initializing Core Trainer...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  // Per-question countdown state (seconds)
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic loading messages cycling
  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Drafting cognitive target schemas...',
      'Reviewing competitive recruiter datasets...',
      'Synthesizing realistic situational prompts...',
      'Checking logical complexity metrics...',
      'Publishing questions into sandbox session...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  // Handle setting Category if passed as prop
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Individual countdown clock controller
  useEffect(() => {
    if (configActive || loading || questions.length === 0) return;

    // Reset timer on question change
    setTimeLeft(120);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired! Capture current state, auto-submit or auto-forward
          clearInterval(timerRef.current!);
          handleAutoTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIdx, questions, configActive, loading]);

  const handleAutoTimeOut = () => {
    // Save an empty placeholder if literally blank
    const questionId = questions[currentQuestionIdx].id;
    if (!userAnswers[questionId]) {
      setUserAnswers(prev => ({ ...prev, [questionId]: "[No response provided within 2-minute timer limit]" }));
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(current => current + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const startSession = async () => {
    setLoading(true);
    setLoadingMessage('Consulting Gemini AI engine for questions...');

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, role, difficulty, customTopic }),
      });
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // Map elements into formal Question interfaces
        const formattedQuestions: Question[] = data.map((q: any) => ({
          id: q.id,
          text: q.text,
          category,
        }));
        setQuestions(formattedQuestions);
        setConfigActive(false);
      } else {
        throw new Error('Incomplete data returned back from question server');
      }
    } catch (err) {
      console.error('Session questions preparation unsuccessful:', err);
      // Client layout fallback
      setQuestions([
        { id: 1, text: `Describe your direct engineering methodologies regarding ${customTopic || role} architecture.`, category },
        { id: 2, text: `Walk me through a high-stakes scenario where details were crucial to project success.`, category },
        { id: 3, text: `How do you approach debugging performance bottlenecks on workspace designs?`, category },
        { id: 4, text: `Explain technical trade-offs between speed and consistency in data pipelines.`, category },
        { id: 5, text: `Why are communication skills critical when integrating features within cross-functional teams?`, category }
      ]);
      setConfigActive(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const questionId = questions[currentQuestionIdx].id;
    setUserAnswers({ ...userAnswers, [questionId]: e.target.value });
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    setLoading(true);
    setLoadingMessage('Synthesizing responses & computing score metrics...');

    const finalStructuredAnswers: Answer[] = questions.map((q) => ({
      questionId: q.id,
      questionText: q.text,
      answerText: userAnswers[q.id] || '[No response provided]',
    }));

    try {
      await onSubmit(category, role, questions, finalStructuredAnswers);
    } catch (err) {
      console.error('Submission processing was unsuccessful:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pre-configuration layout
  if (configActive) {
    return (
      <div id="session-config-card" className="max-w-xl mx-auto border border-white/10 rounded-none bg-[#111] p-8 space-y-8 relative overflow-hidden selection:bg-white selection:text-black">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl" />
        
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1 font-semibold">Workspace Configuration</p>
          <h2 className="text-2xl font-sans font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Customize Session</span>
          </h2>
          <p className="text-xs text-white/50 font-light mt-1 font-sans">Configure your mock profile to let the AI adaptively generate the target questions.</p>
        </div>

        <div className="space-y-6">
          
          {/* Category Select */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Interview Domain</label>
            <div className="grid grid-cols-3 gap-3">
              {(['HR', 'Technical', 'Aptitude'] as InterviewCategory[]).map((cat) => (
                <button
                  key={cat}
                  id={`config-cat-${cat}`}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-3 rounded-none text-[10px] uppercase tracking-widest font-bold border transition duration-350 ${
                    category === cat
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {cat === 'HR' ? 'Behavioral' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Role Config */}
          <div>
            <label htmlFor="config-role" className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Target Career / Role</label>
            <input
              id="config-role"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 text-white rounded-none px-4 py-3 text-sm focus:outline-none focus:border-white transition"
              placeholder="e.g., Software Architect, Product Coordinator"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[9px] uppercase tracking-wider text-white/30 font-semibold self-center mr-1">Quick Presets:</span>
              {[
                { title: 'DevOps Engineer', spec: 'CI/CD Pipelines, Infrastructure as Code, Kubernetes' },
                { title: 'AWS Cloud Architect', spec: 'Amazon Web Services, Highly Available Scalable Architecture' },
                { title: 'GCP Cloud Engineer', spec: 'Google Cloud Platform, GKE, IAM Workload Identity' }
              ].map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => {
                    setRole(preset.title);
                    setCustomTopic(preset.spec);
                  }}
                  className={`text-[10px] px-2.5 py-1.5 border transition-all rounded-none font-sans font-medium ${
                    role === preset.title
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 text-white/70 border-white/10 hover:border-white/20 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {preset.title.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Config */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-3">Expertise Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['Entry', 'Intermediate', 'Senior', 'Lead/Expert'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2.5 rounded-none text-[10px] uppercase tracking-wider font-bold border transition duration-350 ${
                    difficulty === lvl
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {lvl.split('/')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Custom specifications */}
          <div>
            <label htmlFor="config-custom" className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Focus Specialty or Company (Optional)</label>
            <input
              id="config-custom"
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full bg-white/[0.02] border border-white/10 text-white rounded-none px-4 py-3 text-sm focus:outline-none focus:border-white transition"
              placeholder="e.g., Stripe React guidelines, high system scalability"
            />
          </div>

        </div>

        <div className="flex space-x-4 pt-6 border-t border-white/10">
          <button
            id="btn-config-cancel"
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 border border-white/25 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition rounded-none"
          >
            Cancel
          </button>
          <button
            id="btn-config-start"
            type="button"
            onClick={startSession}
            disabled={loading}
            className="flex-1 py-3.5 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-200 transition flex items-center justify-center space-x-2 rounded-none border border-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <span>Launch Room</span>}
          </button>
        </div>
      </div>
    );
  }

  // Loading screen inside Room
  if (loading) {
    return (
      <div id="loading-session" className="max-w-md mx-auto text-center space-y-6 py-20 border border-white/10 bg-[#111] p-8 rounded-none selection:bg-white selection:text-black">
        <Loader2 className="w-8 h-8 text-white animate-spin mx-auto" />
        <div className="space-y-4 font-sans">
          <h3 className="text-white font-sans font-semibold text-xl">Connecting Evaluator...</h3>
          <p className="text-white/40 text-xs mt-1 animate-pulse uppercase tracking-widest font-semibold">
            "{loadingMessage}"
          </p>
        </div>
      </div>
    );
  }

  // Active QA Exam Room View
  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIdx];
    const answerVal = userAnswers[currentQuestion.id] || '';

    return (
      <div id="active-session-board" className="max-w-3xl mx-auto border border-white/10 bg-[#111] p-8 space-y-8 shadow-2xl relative rounded-none selection:bg-white selection:text-black">
        
        {/* Board Header details */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">{category} practice round</span>
            <h2 className="text-2xl font-sans text-white font-semibold">
              Role Focus: <span className="text-white font-bold">{role}</span>
            </h2>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center space-x-2 px-4 py-2 border border-white/10 bg-[#050505] rounded-none">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-white/50'}`} />
            <span className={`text-[13px] font-semibold font-mono ${timeLeft < 30 ? 'text-red-400 font-bold' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress Tracker dots */}
        <div className="flex items-center justify-between text-xs text-white/40 uppercase tracking-widest font-semibold">
          <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
          <div className="flex space-x-3">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 transition-all duration-300 rounded-none ${
                  idx === currentQuestionIdx
                    ? 'w-6 bg-white'
                    : idx < currentQuestionIdx
                    ? 'w-2 bg-white/40'
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* The Question Text Area */}
        <div className="min-h-[120px] flex flex-col justify-center bg-white/[0.01] border border-white/10 p-8 rounded-none">
          <p className="text-white font-sans text-lg sm:text-xl leading-relaxed">
            "{currentQuestion.text}"
          </p>
        </div>

        {/* Answer input container */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-semibold">
            <label htmlFor="answer-input" className="block text-white/40">Your Response Transcript</label>
            <span className="font-mono text-white/30">{answerVal.length} characters</span>
          </div>
          <textarea
            id="answer-input"
            rows={5}
            value={answerVal}
            onChange={handleTextChange}
            className="w-full bg-[#050505] border border-white/10 text-white rounded-none p-4 text-sm focus:outline-none focus:border-white transition resize-none placeholder-white/20 font-light"
            placeholder="Type your response thoroughly here... Be detailed and try to provide structured examples."
          />
        </div>

        {/* Room Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <button
            id="btn-board-prev"
            type="button"
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
            className="px-5 py-3 border border-white/10 hover:border-white hover:bg-white/5 transition flex items-center space-x-2 text-white/60 hover:text-white disabled:opacity-20 disabled:pointer-events-none text-xs font-bold uppercase tracking-widest rounded-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            id="btn-board-next"
            type="button"
            onClick={handleNext}
            className={`px-6 py-3 transition flex items-center space-x-2 text-xs font-bold uppercase tracking-widest border rounded-none ${
              currentQuestionIdx === questions.length - 1
                ? 'bg-white text-black border-white hover:bg-[#F5F5F5]'
                : 'bg-transparent text-white border-white/20 hover:border-white hover:bg-white/5'
            }`}
          >
            <span>{currentQuestionIdx === questions.length - 1 ? 'Evaluate' : 'Next'}</span>
            {currentQuestionIdx === questions.length - 1 ? (
              <CheckCircle className="w-4 h-4 text-black shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 shrink-0" />
            )}
          </button>
        </div>

      </div>
    );
  }

  return null;
}
