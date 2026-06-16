import React, { useState } from 'react';
import { Target, Shield, BookOpen, BrainCircuit, BarChart3, ChevronRight, FileText, Download, Check, HelpCircle, MessageSquare, Briefcase, Award, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onSignIn: () => void;
  onRegister: () => void;
  onInstall: () => void;
  isInstallable: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export default function LandingPage({ onSignIn, onRegister, onInstall, isInstallable, theme, toggleTheme }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const testimonials = [
    {
      quote: "The company-specific practice modes are spooky accurate. The design questions I generated for Netflix matched my actual panel prompt almost exactly.",
      name: "Darian K.",
      role: "Senior Full Stack Dev at Netflix (formerly Stripe)",
      avatarPath: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    },
    {
      quote: "The instant granular scoring highlighted that while my technical answers were exact, my communication clarity suffered when solving under pressure. Best $19 I've ever spent.",
      name: "Marcus Chen",
      role: "Product Manager at Google",
      avatarPath: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120"
    },
    {
      quote: "Before PrepWise, my resume was a wall of passive text. The ATS Auditor's keyword recommendation and JD matcher directly doubled my interview response rates.",
      name: "Aisha Vance",
      role: "Infrastructure Lead at Robinhood",
      avatarPath: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
    }
  ];

  const faqs = [
    {
      question: "How does the AI evaluate my interview responses?",
      answer: "We employ the state-of-the-art Gemini Large Language Models. When you submit your transcript, it is processed across five custom grading vectors: Communication style, Technical correctness, Confidence cues, Problem Solving structure, and general Clarity. It then models a customized 4-Week Actionable Plan."
    },
    {
      question: "Are the generated questions tailored to specific companies?",
      answer: "Yes. PrepWise scans candidate goals to tailor question banks specifically for companies like Google, AWS, Stripe, Netflix, and Meta. This means we focus questions directly on their unique cultural values, core leadership philosophies, and design standards."
    },
    {
      question: "How does the ATS Resume Analyzer calculate my score?",
      answer: "Our ATS Engine compares your uploaded PDF or pasted credentials text directly against your target role or pasted job description. It runs a competitive index analysis, extracts structural suggestions, identifies keyword deficits, and highlights skills that recruiters look for."
    },
    {
      question: "Does the platform support real audio or voice-based answering?",
      answer: "Absolutely. PrepWise integrates automated Web Speech Recognition, allowing you to click 'Voice Answering' to speak your thoughts aloud. It transcribes your audio stream live into the chat panel for realistic, hands-free verbal sessions."
    }
  ];

  const featuresList = [
    {
      num: "01",
      icon: <BrainCircuit className="w-5 h-5 text-white" />,
      title: "Company-Customized Arenas",
      desc: "Practice with targeted HR, Technical, and Aptitude scenarios optimized for top-tier giants like Google, Amazon, Stripe, and Netflix."
    },
    {
      num: "02",
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      title: "Dynamic 5-Vector Grading",
      desc: "Receive rigorous instant scorecards examining your Communication, Technical Precision, confidence, Problem Solving structure, and Clarity."
    },
    {
      num: "03",
      icon: <Zap className="w-5 h-5 text-white" />,
      title: "Interactive Voice Dictation",
      desc: "Enable hands-free practice with advanced built-in speech recognition that captures and transcribes spoken responses live."
    },
    {
      num: "04",
      icon: <FileText className="w-5 h-5 text-white" />,
      title: "Applicant Tracking Auditor",
      desc: "Upload your PDF resume or paste custom JDs to compute match levels, extract high-demand skills, and highlight keyword matrices."
    },
    {
      num: "05",
      icon: <Award className="w-5 h-5 text-white" />,
      title: "Gamified Learning Paths",
      desc: "Earn XP, maintain daily streaks, unlock custom talent badges, and track your metrics over time via our elegant dashboard."
    },
    {
      num: "06",
      icon: <BookOpen className="w-5 h-5 text-white" />,
      title: "Personalized Study Roadmaps",
      desc: "Get an actionable 4-Week Improvement Schedule tailored instantly by generative AI to rectify the specific weaknesses highlighted in your results."
    }
  ];

  return (
    <div id="landing-page-container" className={`min-h-screen flex flex-col selection:bg-white selection:text-black overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[#050505] text-[#F5F5F5]' : 'bg-[#FAFAFA] text-[#171717]'}`}>
      
      {/* Editorial Decorative Grid Background */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-80 pointer-events-none ${theme === 'light' ? 'invert opacity-40' : ''}`} />

      {/* Top Banner Navigation */}
      <header id="landing-header" className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between border-b ${theme === 'dark' ? 'border-white/10 bg-[#050505]/40' : 'border-neutral-200 bg-[#FAFAFA]/40'} backdrop-blur-md`}>
        <div id="brand-logo" className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-sans font-bold tracking-tight">
            PrepWise <span className={`not-italic font-sans font-bold text-[10px] sm:text-xs px-2.5 py-0.5 ml-1 select-none ${theme === 'dark' ? 'bg-white text-black' : 'bg-black text-white'}`}>AI</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Subtle Dark/Light Mode Switcher */}
          <button
            id="theme-toggler"
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-colors ${theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-[#F5F5F5]' : 'border-neutral-200 hover:bg-neutral-100 text-[#171717]'}`}
            title="Toggle Light/Dark Workspace"
          >
            {theme === 'dark' ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>

          {isInstallable && (
            <button
              id="btn-header-install"
              onClick={onInstall}
              className={`hidden sm:flex px-4 py-2 border text-xs font-bold uppercase tracking-widest transition duration-300 items-center space-x-2 ${theme === 'dark' ? 'border-white/20 hover:bg-white/5 text-white/90' : 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'}`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
          
          <button
            id="btn-header-register"
            onClick={onSignIn}
            className={`hidden sm:inline-block px-4 py-2 text-xs font-bold uppercase tracking-widest transition duration-300 ${theme === 'dark' ? 'text-white/70 hover:text-white' : 'text-neutral-600 hover:text-black'}`}
          >
            Sign In
          </button>
          
          <button
            id="btn-header-login"
            onClick={onRegister}
            className={`px-5 py-2 text-xs font-bold uppercase tracking-widest transition duration-300 border ${theme === 'dark' ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'}`}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Editorial Corporate Hero */}
      <section id="hero-section" className="relative z-10 w-full max-w-5xl mx-auto px-6 sm:px-8 pt-20 sm:pt-28 pb-20 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 border text-[10px] font-semibold uppercase tracking-[0.2em] mb-8 sm:mb-10 rounded-full ${theme === 'dark' ? 'border-white/10 bg-white/5 text-white/60' : 'border-neutral-200 bg-black/5 text-neutral-600'}`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span>Next-Generation Career Sandbox</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold leading-tight tracking-tight max-w-4xl mb-6"
        >
          Master the interview with <span className={`underline decoration-indigo-500 underline-offset-8 decoration-wavy`}>Generative AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`text-base sm:text-lg font-light max-w-2xl mb-12 leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-neutral-600'}`}
        >
          PrepWise AI builds hyper-realistic technical, PM, and HR interview rounds tailored to target companies, transcripts oral responses live, and audits resumes for ATS compliance instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4 max-w-md"
        >
          <button
            id="btn-hero-primary"
            onClick={onRegister}
            className={`px-8 py-4 font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center space-x-2 border shadow-lg ${theme === 'dark' ? 'bg-white text-black border-white hover:bg-neutral-200' : 'bg-black text-white border-black hover:bg-neutral-800'}`}
          >
            <span>Launch Free Arena</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>

          <button
            id="btn-hero-login-secondary"
            onClick={onSignIn}
            className={`px-8 py-4 border font-bold text-xs uppercase tracking-[0.15em] transition flex items-center justify-center ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/5' : 'border-neutral-300 text-neutral-800 hover:bg-black/5'}`}
          >
            <span>Sign In Account</span>
          </button>
        </motion.div>

        {/* Floating Screen Graphic Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full mt-16 max-w-4xl relative"
        >
          <div className={`p-1.5 rounded-xl border ${theme === 'dark' ? 'border-white/10 bg-[#111]' : 'border-neutral-200 bg-white'} shadow-2xl relative`}>
            {/* Window control details */}
            <div className="flex items-center space-x-2 px-4 py-2 border-b border-neutral-800 relative z-20">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              <span className="mx-auto text-[10px] font-mono text-neutral-500">PREPWISE WORKSPACE SECURE_SERVER://CLIENT@3000</span>
            </div>
            {/* Dummy workspace layout graphic */}
            <div className={`p-4 sm:p-8 rounded-b-lg text-left ${theme === 'dark' ? 'bg-[#080808]' : 'bg-neutral-50'} min-h-[220px] font-sans flex flex-col justify-between`}>
              <div className="space-y-4">
                <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 font-mono font-bold uppercase rounded pr-2">ACTIVE ARENA // SECTION 02: TECHNICAL DEBATE</span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">"How would you optimize a high-traffic SQL database query that frequently causes CPU alert spikes?"</h3>
                <p className="text-xs text-neutral-400 font-light max-w-xl">
                  Answered via: <span className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">WebSpeech Voice Transcribe</span> - "I would analyze the query plan, locate slow table scans, add composite indices corresponding to columns used in JOIN and WHERE structures, and implement Redis caches..."
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-neutral-800 pt-4 mt-6">
                <span className="text-[10px] font-mono text-neutral-400 tracking-wider">SPECTRUM DETECTOR: 94% CONFIDENCE RATIO</span>
                <span className="text-[10px] px-3 py-1 bg-white text-black font-semibold uppercase tracking-widest cursor-not-allowed">ANALYZING TRANSCRIPT...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof Quote Sections */}
      <section id="social-proof" className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t ${theme === 'dark' ? 'border-white/10 bg-[#080808]/40' : 'border-neutral-200 bg-neutral-100/50'}`}>
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#A3A3A3] mb-8 font-bold text-center">Engineers at elite institutions prep with PrepWise</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, index) => (
              <div key={index} className={`flex flex-col justify-between p-6 border ${theme === 'dark' ? 'border-white/5 bg-[#111]/30' : 'border-neutral-200 bg-white'} relative`}>
                <p className={`text-xs italic leading-relaxed mb-6 ${theme === 'dark' ? 'text-white/80' : 'text-neutral-700'}`}>"{test.quote}"</p>
                <div className="flex items-center space-x-3 border-t pt-4 border-neutral-800">
                  <img src={test.avatarPath} alt={test.name} referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs font-bold truncate">{test.name}</span>
                    <span className="block text-[9.5px] opacity-40 truncate">{test.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento Layout */}
      <section id="features-section" className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t ${theme === 'dark' ? 'border-white/10' : 'border-neutral-200'}`}>
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 mb-3 font-semibold">THE BENCHMARK</p>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight">Structured Performance Coaching</h2>
          <p className="max-w-md mx-auto text-xs opacity-50 mt-2">Skip simulated placeholders. Our system connects precise semantic evaluation algorithms to mock interview metrics.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresList.map((item, idx) => (
            <div key={idx} className={`p-8 border hover:border-indigo-500/40 transition duration-300 relative group overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-white/[0.01]' : 'border-neutral-200 bg-white shadow-sm'}`}>
              <div className="flex items-center justify-between mb-8">
                <div className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded transition-transform group-hover:scale-105">
                  {item.icon}
                </div>
                <span className="text-xs font-mono font-bold opacity-20">{item.num}</span>
              </div>
              <h3 className="text-lg font-sans font-semibold mb-2">{item.title}</h3>
              <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-neutral-600'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Comparison Matrices */}
      <section id="pricing-plans-section" className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t ${theme === 'dark' ? 'border-white/10' : 'border-neutral-200'}`}>
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 mb-3 font-semibold">MEMBERSHIP PLANS</p>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight">Zero Contract Pricing</h2>
          <p className="max-w-md mx-auto text-xs opacity-50 mt-2">Practice freely Offline/Simulated, or access premium Gemini models on demand.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className={`p-8 sm:p-10 border flex flex-col justify-between ${theme === 'dark' ? 'border-white/10 bg-white/[0.01]' : 'border-neutral-200 bg-white shadow-sm'}`}>
            <div>
              <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold block mb-2">Sandbox Tier</span>
              <h3 className="text-3xl font-sans font-bold">Standard Free</h3>
              <p className="text-xs opacity-50 mt-3 mb-8">Ideal for testing components, offline exercises, and offline simulations.</p>
              
              <div className="flex items-baseline space-x-1.5 border-b border-white/5 pb-6 mb-8">
                <span className="text-4xl font-extrabold font-sans">$0</span>
                <span className="text-xs opacity-40">forever</span>
              </div>

              <ul className="space-y-4 mb-10 text-xs">
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Sandbox Play Sessions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard 3-Topic Tracks</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Offline Simulations</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>No Customized Target Companies</span>
                </li>
                <li className="flex items-center space-x-3 opacity-30">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>No ATS Resume Score PDF Exports</span>
                </li>
              </ul>
            </div>

            <button
              id="pricing-button-free"
              onClick={onRegister}
              className={`w-full py-3 text-xs font-bold uppercase tracking-widest border transition ${theme === 'dark' ? 'border-white/20 hover:border-white text-white hover:bg-white/5' : 'border-neutral-300 hover:border-black text-neutral-800'}`}
            >
              Sign Up Free
            </button>
          </div>

          {/* Pro Tier */}
          <div className={`p-8 sm:p-10 border relative overflow-hidden flex flex-col justify-between ${theme === 'dark' ? 'border-indigo-500 bg-indigo-950/10' : 'border-indigo-600 bg-indigo-500/5 shadow'}`}>
            <span className="absolute top-4 right-4 bg-indigo-600 text-white font-mono text-[9px] font-bold uppercase px-2.5 py-1 tracking-widest rounded-full">POPULAR CHOICE</span>
            
            <div>
              <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold block mb-2">Accelerator Tier</span>
              <h3 className="text-3xl font-sans font-bold">Prep Pro Plan</h3>
              <p className="text-xs opacity-50 mt-3 mb-8">Our core subscription featuring active API pipelines, ATS matches, and detailed roadmaps.</p>
              
              <div className="flex items-baseline space-x-1.5 border-b border-white/5 pb-6 mb-8">
                <span className="text-4xl font-extrabold font-sans">$19</span>
                <span className="text-xs opacity-40">/ monthly</span>
              </div>

              <ul className="space-y-4 mb-10 text-xs">
                <li className="flex items-center space-x-3 text-indigo-400 font-medium">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Priority Gemini-3.5-Flash Evaluation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Uncapped Resume Upload Matches</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Google, Amazon, Stripe Target Arenas</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Microphone Voice-Based Transcription</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Downloadable Score PDF Certificates</span>
                </li>
              </ul>
            </div>

            <button
              id="pricing-button-pro"
              onClick={onRegister}
              className="w-full py-3 text-xs font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white transition border border-indigo-600"
            >
              Unlock Pro Now
            </button>
          </div>
        </div>
      </section>

      {/* Accordion FAQ block */}
      <section id="faq-section" className={`relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-20 border-t ${theme === 'dark' ? 'border-white/10' : 'border-neutral-200'}`}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 mb-3 font-semibold">FREQUENTLY ASKED QUESTIONS</p>
            <h2 className="text-3xl sm:text-4xl font-sans font-bold tracking-tight">Got Questions? We have Answers.</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                id={`faq-item-${idx}`}
                className={`border transition-all ${theme === 'dark' ? 'border-white/10 hover:border-white/20' : 'border-neutral-200 hover:border-neutral-300'}`}
              >
                <button
                  id={`btn-faq-trigger-${idx}`}
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-sans font-semibold text-sm sm:text-base transition"
                >
                  <span>{faq.question}</span>
                  <HelpCircle className={`w-4 h-4 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-indigo-500' : 'opacity-40'}`} />
                </button>
                
                {activeFaq === idx && (
                  <div className={`px-6 pb-6 text-xs sm:text-sm font-light leading-relaxed border-t pt-4 ${theme === 'dark' ? 'text-white/60 border-white/5' : 'text-neutral-600 border-neutral-100'}`}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section id="cta-section" className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className={`border rounded-none p-12 sm:p-20 text-center overflow-hidden relative ${theme === 'dark' ? 'border-white/10 bg-[#111]' : 'border-neutral-200 bg-white shadow-lg'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.01)_0%,transparent_100%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight mb-6">Ready to land your dream offer?</h2>
          <p className="text-xs sm:text-sm max-w-md mx-auto mb-10 opacity-60 font-light">Join over 12,000 candidates mastering cloud systems, algorithmic boards, and HR frameworks cleanly.</p>
          <button
            id="btn-cta-action"
            onClick={onRegister}
            className={`px-10 py-5 font-bold uppercase text-xs tracking-[0.2em] transition duration-300 ${theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200 border border-white' : 'bg-black text-white hover:bg-neutral-800 border border-black'}`}
          >
            Get Started Instantly
          </button>
        </div>
      </section>

      {/* Organized Sitemap Footer */}
      <footer id="landing-footer" className={`relative z-10 w-full border-t mt-auto py-16 bg-[#050505] text-[#FAFAFA]`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">Product Capabilities</h4>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li className="hover:text-white cursor-pointer transition">Company Mock Engines</li>
              <li className="hover:text-white cursor-pointer transition">ATS Competency Scanner</li>
              <li className="hover:text-white cursor-pointer transition">Dynamic 5-Track Score</li>
              <li className="hover:text-white cursor-pointer transition">WebSpeech Verbal Sandbox</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">Target Company Modes</h4>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li className="hover:text-white cursor-pointer transition">Google (L4/L5 benchmarks)</li>
              <li className="hover:text-white cursor-pointer transition">Stripe Design Protocols</li>
              <li className="hover:text-white cursor-pointer transition">Amazon Leadership Principles</li>
              <li className="hover:text-white cursor-pointer transition">Meta System Architectures</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">SaaS Framework</h4>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li className="hover:text-white cursor-pointer transition">Standard Sandbox (Free)</li>
              <li className="hover:text-white cursor-pointer transition">Prep Pro ($19/monthly)</li>
              <li className="hover:text-white cursor-pointer transition">Developer Enterprise</li>
              <li className="hover:text-white cursor-pointer transition">Interactive API Reference</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">Corporate Support</h4>
            <ul className="space-y-2 text-[11px] text-white/40">
              <li>Feel free to reach us:</li>
              <li className="font-mono text-white/80 select-all underline">support@prepwiseai.com</li>
              <li>User ID: p.jmanoj378@gmail.com</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/40">
          <span>&copy; {new Date().getFullYear()} PrepWise AI. DeepMind Antigravity Workspace Node. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-medium">
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="text-indigo-400 font-bold uppercase tracking-widest">GEMINI PRO CLOUD ENGAGES</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
