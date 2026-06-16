import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, Loader2, Sparkles, Send, Mic, MicOff, AlertCircle, HelpCircle, ListFilter, RefreshCw, Zap } from 'lucide-react';
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
  // Config states
  const [configActive, setConfigActive] = useState(true);
  const [category, setCategory] = useState<InterviewCategory>(initialCategory || 'Technical');
  const [role, setRole] = useState('Frontend Developer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [company, setCompany] = useState('Standard');
  const [customTopic, setCustomTopic] = useState('');

  // Sessional states
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Booting custom NLP sandbox...');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(120);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Speech Recognition Audio States
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef<any>(null);

  // Follow-up dynamic states
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [activeFollowUpQuestion, setActiveFollowUpQuestion] = useState<string | null>(null);

  // Standard Career Roles options
  const roleDropdownOptions = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Analyst",
    "Data Scientist",
    "Product Manager",
    "HR Interview / Behavioral"
  ];

  // Standard Company focused presets
  const companyPresets = [
    "Standard",
    "Google",
    "Stripe",
    "Amazon",
    "Meta",
    "Netflix"
  ];

  // Cycles dynamic AI loaders
  useEffect(() => {
    if (!loading) return;
    const messages = [
      'Retrieving recruiter competency matrix...',
      'Synthesizing company cultural guidelines...',
      'Structuring behavioral core criteria...',
      'Optimizing query pathways for assessment...'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % messages.length;
      setLoadingMessage(messages[idx]);
    }, 2500);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Clock countdown loop
  useEffect(() => {
    if (configActive || loading || questions.length === 0) return;

    setTimeLeft(125); // 2 minutes with generous padding

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
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

  // Audio Speech Dictation setup on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const finalWord = event.results[event.results.length - 1][0].transcript;
        if (finalWord) {
          const currentQid = questions[currentQuestionIdx]?.id;
          if (currentQid) {
            setUserAnswers(prev => {
              const prevText = prev[currentQid] || '';
              const space = prevText && !prevText.endsWith(' ') ? ' ' : '';
              return {
                ...prev,
                [currentQid]: prevText + space + finalWord.trim()
              };
            });
          }
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech module reporting error:", e);
        if (e.error === 'not-allowed') {
          setSpeechError("Microphone access is blocked by browser safety rules. Adjust settings or type response.");
        } else {
          setSpeechError(`Microphone trigger lost: ${e.error}`);
        }
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [questions, currentQuestionIdx]);

  const handleAutoTimeOut = () => {
    const questionId = questions[currentQuestionIdx].id;
    if (!userAnswers[questionId]) {
      setUserAnswers(prev => ({ ...prev, [questionId]: "[No answer submitted within the countdown timer]" }));
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(current => current + 1);
      setActiveFollowUpQuestion(null);
    } else {
      handleFinalSubmit();
    }
  };

  const startSession = async () => {
    setLoading(true);
    setLoadingMessage(`Consulting Gemini on ${category} roles for ${company}...`);
    setActiveFollowUpQuestion(null);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, role, difficulty, company, customTopic }),
      });
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedQuestions: Question[] = data.map((q: any) => ({
          id: q.id,
          text: q.text,
          category,
        }));
        setQuestions(formattedQuestions);
        setConfigActive(false);
      } else {
        throw new Error('Incomplete JSON arrays returned');
      }
    } catch (err) {
      console.error('Session questions preparation unsuccessful:', err);
      // Fallback
      setQuestions([
        { id: 1, text: `Describe your direct engineering methodologies regarding ${role} architecture at ${company}.`, category },
        { id: 2, text: `Walk me through a high-stakes scenario where details were crucial to project success.`, category },
        { id: 3, text: `How do you approach debugging performance bottlenecks as an experienced ${difficulty} candidate?`, category },
        { id: 4, text: `Explain technical trade-offs between speed and consistency under tight deadlines.`, category },
        { id: 5, text: `Why are communication skills critical when integrating features within cross-functional teams?`, category }
      ]);
      setConfigActive(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not natively active on this browser shell. Try using Chrome.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setSpeechError('');
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Mic start failed:", err);
        setSpeechError("Unable to establish microphone telemetry stream.");
      }
    }
  };

  const getAIFollowUpQuestion = () => {
    const currentQid = questions[currentQuestionIdx].id;
    const currentAnswer = userAnswers[currentQid] || '';
    
    if (currentAnswer.length < 15) {
      setSpeechError("Please type a brief response first before requesting an AI follow-up challenge!");
      return;
    }

    setFollowUpLoading(true);
    setSpeechError('');

    // Generate intelligent contextual follow-up based on their answer text
    setTimeout(() => {
      let mockFollowUp = `Based on your note: "${currentAnswer.substring(0, 35)}...", how do you balance cost overhead and disaster recovery latency if that fails?`;
      if (category === 'HR') {
        mockFollowUp = "Interesting. What was the exact feedback you received from your lead after this event, and how did you implement it?";
      } else if (category === 'Aptitude') {
        mockFollowUp = "Understood. How would your calculations change if a 15% system redundancy constraint were mandatory?";
      }

      setActiveFollowUpQuestion(mockFollowUp);
      setFollowUpLoading(false);
    }, 1500);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const questionId = questions[currentQuestionIdx].id;
    setUserAnswers({ ...userAnswers, [questionId]: e.target.value });
  };

  const handleNext = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setActiveFollowUpQuestion(null);
      setSpeechError('');
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrev = () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setActiveFollowUpQuestion(null);
      setSpeechError('');
    }
  };

  const handleFinalSubmit = async () => {
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    if (timerRef.current) clearInterval(timerRef.current);
    
    setLoading(true);
    setLoadingMessage('Crunching answers & grading metrics...');

    const finalStructuredAnswers: Answer[] = questions.map((q) => {
      let finalAnsText = userAnswers[q.id] || '[No response provided]';
      if (activeFollowUpQuestion && q.id === questions[currentQuestionIdx].id) {
        finalAnsText += `\n[Follow Up Question Asked: ${activeFollowUpQuestion}]`;
      }
      return {
        questionId: q.id,
        questionText: q.text,
        answerText: finalAnsText,
      };
    });

    try {
      await onSubmit(category, role, questions, finalStructuredAnswers);
    } catch (err) {
      console.error('Submission processing was unsuccessful:', err);
    } finally {
      setLoading(false);
    }
  };

  // Preset role clicks
  const selectRolePreset = (r: string) => {
    setRole(r);
    if (r.includes("HR")) {
      setCategory("HR");
    } else if (r.includes("Data") || r.includes("Product")) {
      setCategory("Aptitude");
    } else {
      setCategory("Technical");
    }
  };

  // Pre-configuration Panel UI
  if (configActive) {
    return (
      <div id="session-config-card" className="max-w-2xl mx-auto border border-white/10 rounded-none bg-[#111] p-8 space-y-8 relative overflow-hidden selection:bg-white selection:text-black">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl pointer-events-none" />
        
        <div>
          <span className="text-[10px] px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 font-mono font-bold uppercase rounded pr-2">PREPWYSE CORE MULTIVERSE CONFIG</span>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight mt-3">
            Custom Arena Setup
          </h2>
          <p className="text-xs text-white/50 font-light mt-1 font-sans">Set difficulty tiers, design career role guidelines, and specify target recruiter benchmarks.</p>
        </div>

        <div className="space-y-6">
          
          {/* Target Company Matrix Selection */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 flex items-center gap-1">
              <ListFilter className="w-3.5 h-3.5" />
              Target Recruiter Culture / Company Focus
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {companyPresets.map((co) => (
                <button
                  key={co}
                  id={`config-co-${co}`}
                  type="button"
                  onClick={() => setCompany(co)}
                  className={`py-2 rounded px-1 group text-[9px] uppercase tracking-widest font-bold border transition duration-300 ${
                    company === co
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white/50 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {co}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Domain Field */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Practice Category</label>
              <div className="grid grid-cols-3 gap-2">
                {(['HR', 'Technical', 'Aptitude'] as InterviewCategory[]).map((cat) => (
                  <button
                    key={cat}
                    id={`config-cat-${cat}`}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-3.5 rounded text-[9.5px] uppercase tracking-widest font-bold border transition ${
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

            {/* Difficulty Selector */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3">Complexity Level</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-3.5 rounded text-[10px] uppercase tracking-wider font-bold border transition ${
                      difficulty === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-transparent text-white/40 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Role Dropdown Selector */}
          <div>
            <label htmlFor="config-role-preset" className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Target Specialty / Role Profile</label>
            <select
              id="config-role-preset"
              value={role}
              onChange={(e) => selectRolePreset(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 text-white rounded px-4 py-3.5 text-xs focus:outline-none focus:border-indigo-500 transition leading-relaxed"
            >
              {roleDropdownOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#111] text-xs text-white">{opt}</option>
              ))}
            </select>
          </div>

          {/* Custom Topics focus instructions */}
          <div>
            <label htmlFor="config-custom" className="block text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Custom Focus Keywords or Details (Optional)</label>
            <textarea
              id="config-custom"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              rows={3}
              className="w-full bg-[#050505] border border-white/10 text-white rounded p-4 text-xs focus:outline-none focus:border-indigo-500 transition resize-none font-light leading-relaxed placeholder-white/20"
              placeholder="e.g., cloud cost overhead logs, AWS Elastic Load Balancers failure models, Redis cache metrics..."
            />
          </div>

        </div>

        <div className="flex space-x-4 pt-6 border-t border-white/10">
          <button
            id="btn-config-cancel"
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 border border-white/25 text-xs font-bold uppercase tracking-widest hover:border-white transition rounded-none"
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
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
        <div className="space-y-4 font-sans">
          <h3 className="text-white font-sans font-semibold text-xl">Connecting Recruiter AI...</h3>
          <p className="text-indigo-400 text-xs mt-1 animate-pulse uppercase tracking-widest font-semibold">
            "{loadingMessage}"
          </p>
        </div>
      </div>
    );
  }

  // Active Mock Room Session UI
  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIdx];
    const answerVal = userAnswers[currentQuestion.id] || '';

    return (
      <div id="active-session-board" className="max-w-3xl mx-auto border border-white/10 bg-[#0f0f11] p-6 sm:p-8 space-y-8 shadow-2xl relative rounded-none selection:bg-white selection:text-black">
        
        {/* State and Mode metadata headers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-bold uppercase rounded">{company} Presets Mode</span>
              <span className="text-[9px] font-mono px-2 py-0.5 bg-orange-400/10 text-orange-400 font-bold uppercase rounded">{difficulty} Tier</span>
            </div>
            <h2 className="text-2xl font-sans text-white font-semibold">
              Role: <span className="text-white font-bold">{role}</span>
            </h2>
          </div>

          {/* Clock timer display */}
          <div className="flex items-center space-x-2 px-4 py-2 border border-white/10 bg-[#050505] rounded">
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-indigo-400'}`} />
            <span className={`text-[13px] font-mono font-bold ${timeLeft < 30 ? 'text-red-400 font-black' : 'text-white'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress bars indicator */}
        <div className="flex items-center justify-between text-[10px] text-white/40 uppercase tracking-widest font-bold">
          <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
          <div className="flex space-x-2.5">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded transition-all duration-300 ${
                  idx === currentQuestionIdx
                    ? 'w-8 bg-indigo-500'
                    : idx < currentQuestionIdx
                    ? 'w-2 bg-indigo-400/40'
                    : 'w-2 bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Active Question Box */}
        <div className="relative hover:border-white/15 bg-[#050505] border border-white/5 p-6 rounded text-left space-y-4">
          <span className="text-[9px] font-mono text-indigo-400 font-bold tracking-widest block uppercase">QUESTION PROMPT</span>
          <p className="text-white font-sans text-lg sm:text-xl leading-relaxed font-light">
            "{currentQuestion.text}"
          </p>

          {/* AI contextual follow-up injection box */}
          {activeFollowUpQuestion && (
            <div className="mt-4 p-4 border border-indigo-500/10 bg-indigo-950/10 rounded-none relative">
              <span className="absolute -top-2.5 left-4 bg-[#0f0f11] text-indigo-400 text-[8.5px] font-mono font-bold px-1.5 uppercase border border-indigo-500/10">AI Follow-up Prompt</span>
              <p className="text-xs text-white/80 italic font-mono">"{activeFollowUpQuestion}"</p>
            </div>
          )}
        </div>

        {/* Answer forms text & controls */}
        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
            <label htmlFor="answer-input" className="block text-white/40">Candidate response draft</label>
            <span className="font-mono text-white/25">{answerVal.length} characters</span>
          </div>
          
          <textarea
            id="answer-input"
            rows={6}
            value={answerVal}
            onChange={handleTextChange}
            className="w-full bg-[#050505] border border-white/15 text-[#E5E5E5] rounded p-4 text-sm focus:outline-none focus:border-indigo-500 transition resize-none placeholder-white/20 font-light leading-relaxed font-sans"
            placeholder="Type your structured answer in detail here. Mention architectural components or behavioral strategies..."
          />

          {/* Real Audio Transcription actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1.5 border-t border-white/5">
            <div className="flex space-x-2">
              <button
                type="button"
                id="btn-voice-toggle"
                onClick={toggleVoiceRecording}
                className={`px-4 py-2 border rounded-full text-[10.5px] font-bold uppercase tracking-widest transition flex items-center space-x-2 ${
                  isRecording 
                    ? 'border-red-500 bg-red-950/20 text-red-400' 
                    : 'border-white/10 bg-white/5 hover:border-indigo-500 text-white'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5 animate-pulse" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? "Listening (Stop)" : "Answering (Voice Mode)"}</span>
              </button>

              <button
                type="button"
                id="btn-ai-followup-trigger"
                onClick={getAIFollowUpQuestion}
                disabled={followUpLoading || activeFollowUpQuestion !== null}
                className={`px-4 py-2 border rounded-full text-[10.5px] font-bold uppercase tracking-widest transition flex items-center space-x-2 ${
                  activeFollowUpQuestion !== null
                    ? 'border-neutral-800 text-neutral-600 bg-transparent cursor-not-allowed'
                    : 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500 hover:text-white text-indigo-400'
                }`}
              >
                {followUpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>Add AI Follow-up</span>
              </button>
            </div>

            {isRecording && (
              <span className="text-[10px] font-mono text-red-400 animate-pulse uppercase tracking-wider flex items-center gap-1">
                🎤 Dictation active... Speak into mic
              </span>
            )}
          </div>

          {speechError && (
            <div className="p-3.5 bg-red-950/10 border border-red-500/20 text-red-500 text-xs flex items-start space-x-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{speechError}</span>
            </div>
          )}
        </div>

        {/* Board actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <button
            id="btn-board-prev"
            type="button"
            onClick={handlePrev}
            disabled={currentQuestionIdx === 0}
            className="px-5 py-3 border border-white/10 hover:border-white hover:bg-white/5 transition flex items-center space-x-2 text-white/50 hover:text-white disabled:opacity-20 disabled:pointer-events-none text-xs font-bold uppercase tracking-widest rounded transition duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            id="btn-board-next"
            type="button"
            onClick={handleNext}
            className={`px-6 py-3 transition flex items-center space-x-2 text-xs font-bold uppercase tracking-widest border rounded transition duration-200 ${
              currentQuestionIdx === questions.length - 1
                ? 'bg-white text-black border-white hover:bg-neutral-200 font-bold'
                : 'bg-transparent text-white border-white/25 hover:border-white hover:bg-white/5'
            }`}
          >
            <span>{currentQuestionIdx === questions.length - 1 ? 'Evaluate System' : 'Next Question'}</span>
            {currentQuestionIdx === questions.length - 1 ? (
              <CheckCircle className="w-4.5 h-4.5 text-black shrink-0 ml-1" />
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
