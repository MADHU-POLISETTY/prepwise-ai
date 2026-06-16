import React from 'react';
import { Play, TrendingUp, History, BrainCircuit, Star, Award, AwardIcon, Compass, Sparkles, AlertCircle } from 'lucide-react';
import { InterviewCategory } from '../types';

interface DashboardProps {
  userEmail: string;
  totalInterviews: number;
  averageScore: number;
  lastScore: number | null;
  onNavigate: (tab: string) => void;
  onStartInterview: (category: InterviewCategory) => void;
}

export default function Dashboard({
  userEmail,
  totalInterviews,
  averageScore,
  lastScore,
  onNavigate,
  onStartInterview,
}: DashboardProps) {
  return (
    <div id="dashboard-container" className="space-y-10 max-w-7xl mx-auto selection:bg-white selection:text-black">
      
      {/* Header section with welcome banner */}
      <div id="dashboard-welcome" className="relative border border-white/10 bg-white/[0.01] p-8 overflow-hidden rounded-none">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-sans font-bold text-white tracking-tight -ml-0.5">
              Welcome, {userEmail.split('@')[0]}
            </h1>
            <p className="text-white/60 font-light text-base max-w-xl">
              Your career preparation matrix is ready. Choose an active interview track, practice adaptive questions, and review detailed AI scoring breakdowns instantly.
            </p>
          </div>
          <button
            id="btn-fast-prep"
            onClick={() => onNavigate('interview-config')}
            className="px-6 py-3.5 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition duration-300 flex items-center space-x-2 shrink-0 rounded-none border border-white"
          >
            <Sparkles className="w-4 h-4 text-black" />
            <span>Launch Coach</span>
          </button>
        </div>
      </div>

      {/* KPI stats banner */}
      <div id="kpi-banner-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* KPI 1 */}
        <div id="kpi-total" className="border border-white/10 p-6 flex flex-col justify-between aspect-square bg-[#050505] transition-all hover:border-white/20">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Total Practices</p>
          <p className="text-6xl font-sans font-extrabold text-white">
            {totalInterviews}
          </p>
        </div>

        {/* KPI 2 */}
        <div id="kpi-average" className="border border-white/10 p-6 flex flex-col justify-between aspect-square bg-[#050505] transition-all hover:border-white/20">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Average Accuracy</p>
          <p className="text-6xl font-sans font-extrabold text-white">
            {averageScore}<span className="text-lg opacity-40 ml-1 font-sans">%</span>
          </p>
        </div>

        {/* KPI 3 */}
        <div id="kpi-latest" className="border border-white/10 p-6 flex flex-col justify-between aspect-square bg-white text-black transition-all">
          <p className="text-[10px] uppercase tracking-[0.2em] text-black/60 font-semibold">Last Round Score</p>
          <p className="text-6xl font-sans font-extrabold text-black">
            {lastScore !== null ? `${lastScore}` : '—'}
            {lastScore !== null && <span className="text-lg opacity-50 ml-1 font-sans">%</span>}
          </p>
        </div>

      </div>

      {/* Primary Category Tracks selection */}
      <div id="selection-tracks" className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-semibold">Curriculum</p>
          <h2 className="text-2xl font-sans font-bold text-white">Active Interview Tracks</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Track 1: HR */}
          <div id="track-hr-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-white/20 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-orange-400 font-bold mb-4">Core Track 01</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">Behavioral & HR</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Evaluates situational integrity, values alignment, STAR method compliance, team collaboration, and communication skills.
              </p>
            </div>
            <button
              id="btn-start-hr"
              onClick={() => onStartInterview('HR')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3.5 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Launch HR Prep</span>
            </button>
          </div>

          {/* Track 2: Technical */}
          <div id="track-technical-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-white/20 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-teal-400 font-bold mb-4">Core Track 02</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">System Design & Technical</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Evaluates algorithmic architecture, conceptual design patterns, coding semantics, and standard engineering reasoning.
              </p>
            </div>
            <button
              id="btn-start-technical"
              onClick={() => onStartInterview('Technical')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3.5 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Launch Technical Prep</span>
            </button>
          </div>

          {/* Track 3: Aptitude */}
          <div id="track-aptitude-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-white/20 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold mb-4">Core Track 03</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">Analytical & Aptitude</h3>
              <p className="text-white/60 text-sm font-light leading-relaxed">
                Evaluates quantitative estimations, logic puzzles, optimization variables, and systematic numerical reasoning methodologies.
              </p>
            </div>
            <button
              id="btn-start-aptitude"
              onClick={() => onStartInterview('Aptitude')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3.5 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Launch Aptitude Prep</span>
            </button>
          </div>

        </div>
      </div>

      {/* Helpful Tips Section */}
      <div id="dashboard-tips" className="border border-white/10 p-8 bg-[#111]/40 rounded-none">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-semibold">Active Guidelines</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/60 font-light">
          <li className="flex items-start space-x-3">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-sans text-white shrink-0 mt-0.5">1</span>
            <span><strong>Answer Fully:</strong> AI parses terminology accuracy. Try to extend your thoughts across 2-3 logical sentences to maximize compliance.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-sans text-white shrink-0 mt-0.5">2</span>
            <span><strong>Manage Clock:</strong> Each question contains an active countdown timer. Stay concise, calm, and structurally direct.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-sans text-white shrink-0 mt-0.5">3</span>
            <span><strong>Upload Resumes:</strong> The built-in Analyzer module extracts matching parameters automatically to customize question setups.</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-sans text-white shrink-0 mt-0.5">4</span>
            <span><strong>Immutable History:</strong> Previous sessions sync securely to persistent databases for complete analytics monitoring.</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
