import React from 'react';
import { ChevronRight, Download, BrainCircuit, BarChart3, Zap, FileText, Check, ArrowRight } from 'lucide-react';
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
  
  const featuresList = [
    {
      icon: <BrainCircuit className="w-4 h-4 text-white" />,
      title: "Targeted Company Architectures",
      desc: "Simulate exact question sets and leadership guidelines matching Netflix, Google, Stripe, and Meta interviews."
    },
    {
      icon: <BarChart3 className="w-4 h-4 text-white" />,
      title: "Vector Performance Indexing",
      desc: "Analyze communication clarity, technical correctness, and verbal confidence with premium multidimensional scorecards."
    },
    {
      icon: <Zap className="w-4 h-4 text-white" />,
      title: "WebSpeech Verbal Engine",
      desc: "Practice vocal responses under pressure using advanced, hands-free browser transcription."
    },
    {
      icon: <FileText className="w-4 h-4 text-white" />,
      title: "ATS Credential Auditing",
      desc: "Compare your resume directly with active job specs to diagnose matching deficits and missing vocabulary keys."
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Configure Session Framework",
      desc: "Choose a Behavioral, Systems, or Analytical track, and supply your target company profile or JD parameters."
    },
    {
      step: "02",
      title: "Complete Interactive Mock",
      desc: "Participate in realistic prompt inquiries. Dictate responses via real voice transcribing or type your layout plans."
    },
    {
      step: "03",
      title: "Obtain Actionable Grading",
      desc: "Review custom scores on communication coherence, technical vocabulary correctness, and a personalized 4-week roadmap."
    }
  ];

  return (
    <div id="landing-page-root" className={`min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-white selection:text-black ${
      theme === 'dark' ? 'bg-[#09090b] text-[#f4f4f5]' : 'bg-[#fafafa] text-[#18181b]'
    }`}>
      
      {/* Absolute Minimal Header */}
      <header id="landing-main-header" className={`relative z-50 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b ${
        theme === 'dark' ? 'border-[#e4e4e7]/10' : 'border-[#e4e4e7]'
      }`}>
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${theme === 'dark' ? 'bg-white' : 'bg-black'}`}></span>
          <span className="text-sm font-semibold tracking-tight">PrepWise AI</span>
        </div>

        <div className="flex items-center space-x-6">
          <button
            id="theme-toggler"
            onClick={toggleTheme}
            className={`p-1.5 rounded-full border transition-colors ${
              theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-[#f4f4f5]' : 'border-neutral-200 hover:bg-neutral-100/80 text-black'
            }`}
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <button
            id="btn-header-signin"
            onClick={onSignIn}
            className="text-xs font-medium opacity-60 hover:opacity-100 transition duration-150"
          >
            Sign In
          </button>

          <button
            id="btn-header-get-started"
            onClick={onRegister}
            className={`px-3 py-1.5 text-xs font-semibold tracking-tight transition duration-150 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="hero-section" className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-24 pb-20 text-center flex flex-col items-center">
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`inline-flex items-center space-x-2 px-3 py-1 border text-[10px] font-medium tracking-wider uppercase mb-8 ${
            theme === 'dark' ? 'border-[#e4e4e7]/15 bg-white/[0.02] text-white/50' : 'border-[#e4e4e7] bg-black/[0.02] text-neutral-600'
          }`}
        >
          <span>Intelligent Interview Pipeline</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-sans font-semibold tracking-tight leading-[1.1] max-w-3xl mb-6"
        >
          High-fidelity interview prep for engineers
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`text-sm sm:text-base font-light max-w-xl mb-10 leading-relaxed ${
            theme === 'dark' ? 'text-white/60' : 'text-neutral-600'
          }`}
        >
          Build hyper-realistic technical, PM, and systemic interview modules customized for elite tech giants. Transcribe voice responses live, audit PDF resumes for ATS keywords, and identify preparation deficits instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-sm"
        >
          <button
            id="btn-hero-register"
            onClick={onRegister}
            className={`px-5 py-3 text-xs font-semibold tracking-tight transition duration-150 shadow-sm flex items-center justify-center space-x-2 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-[#18181b]'
            }`}
          >
            <span>Start Preparing Now</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>

          <button
            id="btn-hero-signin-fallback"
            onClick={onSignIn}
            className={`px-5 py-3 text-xs font-semibold tracking-tight transition duration-150 border ${
              theme === 'dark' ? 'border-white/10 hover:bg-white/5 text-white' : 'border-neutral-200 text-black hover:bg-neutral-50'
            }`}
          >
            Sign In Account
          </button>
        </motion.div>
      </section>

      {/* 2. Features Section */}
      <section id="features-section" className={`w-full max-w-5xl mx-auto px-6 py-24 border-t ${
        theme === 'dark' ? 'border-[#e4e4e7]/10' : 'border-[#e4e4e7]'
      }`}>
        <div className="max-w-2xl text-left mb-16 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6366f1] font-bold">Capabilities</span>
          <h2 className="text-2xl sm:text-3.5xl font-sans font-semibold tracking-tight">
            Engineered feedback to polish your delivery
          </h2>
          <p className={`text-xs sm:text-sm font-light leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-neutral-500'}`}>
            Skip the generic advice. PrepWise evaluates candidate transcripts across specialized vector diagnostics to replicate real recruiting rubrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuresList.map((feature, i) => (
            <div
              key={i}
              className={`p-6 border transition duration-150 flex flex-col justify-between ${
                theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-[#e4e4e7] bg-white'
              }`}
            >
              <div className="space-y-4">
                <div className={`w-8 h-8 flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 border border-white/10' : 'bg-neutral-100 border border-neutral-200'}`}>
                  {theme === 'dark' ? feature.icon : React.cloneElement(feature.icon, { className: "w-4 h-4 text-black" })}
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{feature.title}</h3>
                <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-neutral-500'}`}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works-section" className={`w-full max-w-5xl mx-auto px-6 py-24 border-t ${
        theme === 'dark' ? 'border-[#e4e4e7]/10' : 'border-[#e4e4e7]'
      }`}>
        <div className="max-w-2xl text-left mb-16 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#6366f1] font-bold">The Protocol</span>
          <h2 className="text-2xl sm:text-3.5xl font-sans font-semibold tracking-tight">
            How PrepWise AI calibrates your capability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((item, i) => (
            <div key={i} className="space-y-4">
              <span className="font-mono text-3xl font-light text-indigo-500/30 font-bold block">{item.step}</span>
              <h3 className="text-sm font-semibold tracking-tight">{item.title}</h3>
              <p className={`text-xs font-light leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-[#71717a]'}`}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA Section */}
      <section id="cta-section" className="w-full max-w-5xl mx-auto px-6 py-12">
        <div className={`p-10 sm:p-16 text-center border overflow-hidden relative ${
          theme === 'dark' ? 'border-white/10 bg-white/[0.01]' : 'border-[#e4e4e7] bg-white shadow-sm'
        }`}>
          <h2 className="text-2xl sm:text-4xl font-sans font-semibold tracking-tight mb-4">
            Master your narrative. Get hired.
          </h2>
          <p className={`text-xs max-w-md mx-auto mb-8 font-light ${theme === 'dark' ? 'text-white/50' : 'text-neutral-500'}`}>
            Join candidate tracks practicing structured systems design, high-tempo case problems, and behavioral values integration.
          </p>
          <button
            id="btn-cta-action"
            onClick={onRegister}
            className={`px-6 py-3 text-xs font-semibold tracking-tight transition duration-150 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'
            }`}
          >
            Start Preparing Now
          </button>
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer id="landing-footer" className={`w-full border-t mt-auto py-12 ${
        theme === 'dark' ? 'border-[#e4e4e7]/10 bg-[#09090b]' : 'border-[#e4e4e7] bg-[#fafafa]'
      }`}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between text-[11px] opacity-40 gap-4">
          <span>&copy; {new Date().getFullYear()} PrepWise AI. Modern Career Sandbox system. All rights reserved.</span>
          <div className="flex space-x-6">
            <span>support@prepwiseai.com</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
