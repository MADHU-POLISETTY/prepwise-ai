import React from 'react';
import { Target, Shield, BookOpen, BrainCircuit, BarChart3, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div id="landing-page-container" className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col selection:bg-white selection:text-black overflow-hidden relative">
      
      {/* Editorial Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-80 pointer-events-none" />

      {/* Header Bar */}
      <header id="landing-header" className="relative z-10 w-full max-w-7xl mx-auto px-8 py-8 flex items-center justify-between border-b border-white/10 bg-[#050505]/40 backdrop-blur-sm">
        <div id="brand-logo" className="flex items-center space-x-3">
          <h1 className="text-2xl font-sans font-bold tracking-tight text-[#F5F5F5]">
            PrepWise <span className="not-italic font-sans font-bold text-xs bg-white text-black px-2.5 py-0.5 ml-1 select-none">AI</span>
          </h1>
        </div>
        <button
          id="btn-header-login"
          onClick={onGetStarted}
          className="px-6 py-2 border border-white/20 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition duration-300"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section id="hero-section" className="relative z-10 w-full max-w-5xl mx-auto px-8 pt-24 pb-28 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 border border-white/10 bg-white/5 text-white/50 text-[10px] font-semibold uppercase tracking-[0.2em] mb-10"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
          </span>
          <span>Next-Gen Career Interview Accelerator</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-5xl sm:text-7xl font-sans font-extrabold leading-tight text-white max-w-4xl mb-8 tracking-tight"
        >
          Master your next interview with <span className="underline decoration-white/20 underline-offset-8">Intelligent AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-lg font-light text-white/60 max-w-2xl mb-12 leading-relaxed"
        >
          PrepWise AI generates tailored HR, Technical, and Aptitude practice rounds, evaluates transcripts on custom indicators, and audits resumes dynamically using state-of-the-art models.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4"
        >
          <button
            id="btn-hero-primary"
            onClick={onGetStarted}
            className="px-8 py-4 bg-[#F5F5F5] font-bold text-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-md flex items-center justify-center space-x-2 border border-white"
          >
            <span>Start Practice Free</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          </button>
          <a
            href="#features-section"
            className="px-8 py-4 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition flex items-center justify-center"
          >
            Explore Features
          </a>
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section id="features-section" className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20 border-t border-white/10">
        <div className="text-center mb-20">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-3 font-semibold">Methodology</p>
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-white">Precision Engineered Coaching</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature Card 1 */}
          <div id="feature-card-1" className="border border-white/10 p-8 hover:border-white/30 transition duration-300 relative group overflow-hidden bg-white/[0.01]">
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/80 mb-8 group-hover:scale-105 transition-transform">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3">Module I</p>
            <h3 className="text-xl font-sans font-semibold text-white mb-4">Dynamic Question Generation</h3>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Generate fully customized lists of 5 interview questions targeting your designated role, level of expertise, and technical specialties.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div id="feature-card-2" className="border border-white/10 p-8 hover:border-white/30 transition duration-300 relative group overflow-hidden bg-white/5 text-black">
            <div className="w-10 h-10 border border-black/20 flex items-center justify-center text-black mb-8 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-black/40 mb-3">Module II</p>
            <h3 className="text-xl font-sans font-semibold text-black mb-4">Tri-Domain Evaluation</h3>
            <p className="text-black/70 text-sm font-light leading-relaxed">
              Get evaluated instantly on separate performance tracks: Communication, Core Domain Knowledge, and Executive Presence/Confidence.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div id="feature-card-3" className="border border-white/10 p-8 hover:border-white/30 transition duration-300 relative group overflow-hidden bg-white/[0.01]">
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/80 mb-8 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <p className="text-[10px] uppercase tracking-widest opacity-40 mb-3">Module III</p>
            <h3 className="text-xl font-sans font-semibold text-white mb-4">Interactive Resume Analytics</h3>
            <p className="text-white/60 text-sm font-light leading-relaxed">
              Upload your PDF resume to extract key competency tags, highlight hidden strengths, and generate structured improvement guidelines.
            </p>
          </div>

        </div>
      </section>

      {/* CTA section */}
      <section id="cta-section" className="relative z-10 w-full max-w-7xl mx-auto px-8 py-20">
        <div className="border border-white/10 rounded-none p-12 sm:p-20 text-center overflow-hidden relative bg-[#111]/80">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none" />
          <h2 className="text-3xl sm:text-5xl font-sans font-bold text-white mb-6">Ready to accelerate your career?</h2>
          <p className="text-white/60 font-light text-base max-w-md mx-auto mb-10">Access instant AI coaching feedback and track your practice session scores over time securely.</p>
          <button
            id="btn-cta-action"
            onClick={onGetStarted}
            className="px-10 py-5 bg-white text-black font-bold uppercase text-xs tracking-[0.2em] hover:bg-neutral-200 transition duration-300"
          >
            Get Started Instantly
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="landing-footer" className="relative z-10 w-full border-t border-white/10 mt-auto py-10 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} PrepWise AI. All rights reserved.</span>
          <div className="flex space-x-6 mt-4 sm:mt-0 font-medium">
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="text-white/30 uppercase tracking-widest font-bold">Powered by Gemini AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
