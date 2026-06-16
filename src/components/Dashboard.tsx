import React from 'react';
import { Play, TrendingUp, History, BrainCircuit, Star, Award, Compass, Sparkles, AlertCircle, Download, Flame, Trophy, Layers, CheckCircle2, ChevronRight, Trash2, Calendar, Target, HelpCircle } from 'lucide-react';
import { InterviewCategory, InterviewResult, UserStats, LeaderboardUser } from '../types';

interface DashboardProps {
  userEmail: string;
  interviews: InterviewResult[];
  onNavigate: (tab: string) => void;
  onStartInterview: (category: InterviewCategory) => void;
  onViewResult: (result: InterviewResult) => void;
  onDeleteRecord: (id: string) => void;
  onInstall: () => void;
  isInstallable: boolean;
}

export default function Dashboard({
  userEmail,
  interviews,
  onNavigate,
  onStartInterview,
  onViewResult,
  onDeleteRecord,
  onInstall,
  isInstallable,
}: DashboardProps) {
  
  // Calculate dynamic stats based on actual interviews
  const totalInterviews = interviews.length;
  const averageScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews) 
    : 0;
  
  const lastScore = totalInterviews > 0 ? interviews[0].score : null;

  // Derive granular metrics averages
  const avgTech = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.technicalScore || 0), 0) / totalInterviews)
    : 0;
  const avgComm = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.communicationScore || 0), 0) / totalInterviews)
    : 0;
  const avgConf = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.confidenceScore || 0), 0) / totalInterviews)
    : 0;

  // Gamification properties
  const calculatedStreak = totalInterviews > 0 ? Math.min(totalInterviews * 2 + 1, 14) : 0;
  const calculatedXP = totalInterviews * 150 + (averageScore * 10);
  const currentLevel = Math.floor(calculatedXP / 500) + 1;
  const progressToNextLevel = Math.round(((calculatedXP % 500) / 500) * 100);

  // Milestone check for custom badges
  const badgesList = [
    { id: 'first_prep', title: 'First Prep', desc: 'Completed first session', icon: '🎯', unlocked: totalInterviews >= 1 },
    { id: 'rising_star', title: 'STAR Padawan', desc: 'Scored 80% or higher', icon: '⭐️', unlocked: interviews.some(i => i.score >= 80) },
    { id: 'elite_eval', title: 'Perfect Form', desc: 'Achieved 90%+ confidence', icon: '⚡️', unlocked: interviews.some(i => i.confidenceScore >= 90) },
    { id: 'streaker', title: 'Daily Grind', desc: 'Reached 3+ practice rounds', icon: '🔥', unlocked: totalInterviews >= 3 }
  ];

  // Community Leaderboard (with active user injected dynamically)
  const mockLeaderboard: LeaderboardUser[] = [
    { rank: 1, name: 'Sven Lindqvist (Google L5 Prep)', xp: 4850, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80' },
    { rank: 2, name: 'Aisha V. (Senior PM Target)', xp: 3900, avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80' },
    { rank: 3, name: `${userEmail.split('@')[0]} (You)`, xp: calculatedXP, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80', isCurrentUser: true },
    { rank: 4, name: 'Tariq Al-Mansoori (Backend Lead)', xp: 1200, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80' },
    { rank: 5, name: 'Sofia Rodriguez (HR Track)', xp: 850, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80' }
  ].sort((a, b) => b.xp - a.xp);

  // Re-map ranks based on current sorted order
  mockLeaderboard.forEach((user, index) => {
    user.rank = index + 1;
  });

  // Adaptive Recommendation Engine based on lowest average grade
  const getAdaptiveRecommendation = () => {
    if (totalInterviews === 0) {
      return {
        focus: "Introductory Onboarding",
        title: "Beginner Technical & Case Sandboxes",
        desc: "You haven't run any mock interview sessions yet. We recommend starting with a simple Beginner behavioral session to baseline your grades.",
        resource: "Launch HR Track"
      };
    }
    
    const minScore = Math.min(avgTech, avgComm, avgConf);
    if (minScore === avgTech) {
      return {
        focus: "Technical Depth Defense",
        title: "System Indexes & Database Sharding Models",
        desc: "Your conceptual terminology accuracy average is slightly lower. Try drafting structured system design plans highlighting sharding partitions and database structures.",
        resource: "Train Technical Track"
      };
    } else if (minScore === avgComm) {
      return {
        focus: "Communication STAR Method",
        title: "Completing Answers with Structured Actions",
        desc: "Recruiters flagged your brief response layouts. Structure behavioral HR answers with the standard STAR context to increase clarity.",
        resource: "Train HR Track"
      };
    } else {
      return {
        focus: "Assertiveness & Presence Cues",
        title: "Verbal Assertion & Hesitation Training",
        desc: "Your confidence parameters suffer when responding. Enable 'Speech Recognition' and focus on removing pause fillers like 'um' and 'like'.",
        resource: "Configure Voice Mode"
      };
    }
  };

  const recommendation = getAdaptiveRecommendation();

  return (
    <div id="dashboard-container" className="space-y-10 max-w-7xl mx-auto selection:bg-white selection:text-black">
      
      {/* PWA App Download Prompt */}
      {isInstallable && (
        <div id="pwa-install-banner" className="border border-white p-6 bg-white text-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in relative z-25">
          <div className="space-y-1">
            <h4 className="font-sans font-bold uppercase tracking-widest text-[11px] flex items-center gap-2 text-black">
              <Download className="w-4 h-4 shrink-0 text-black fill-current animate-pulse" />
              Download Offline App
            </h4>
            <p className="text-xs text-black/70 font-normal max-w-2xl">
              Install PrepWise AI directly to your mobile homescreen or desktop workstation for standard standalone launching, local cache optimizations, and streamlined prep sessions.
            </p>
          </div>
          <button
            onClick={onInstall}
            className="px-6 py-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition duration-300 flex items-center space-x-2 shrink-0 border border-black"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Standalone</span>
          </button>
        </div>
      )}

      {/* Header section with welcome banner */}
      <div id="dashboard-welcome" className="relative border border-white/10 bg-[#0c0c0c] p-8 overflow-hidden rounded-none">
        <div id="glow-mesh-overlay" className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold font-mono">WORKSPACE ACTIVATED</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-white tracking-tight -ml-0.5">
              Welcome, {userEmail.split('@')[0]}
            </h1>
            <p className="text-white/60 font-light text-sm max-w-2xl leading-relaxed">
              Your career preparation metrics are operational. Pick an active interview track, practice adaptive questions with verbal recognition, and review detailed grading vectors instantly.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              id="btn-fast-prep"
              onClick={() => onNavigate('interview-config')}
              className="px-6 py-3.5 bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition duration-300 flex items-center space-x-2 shrink-0 rounded-none border border-indigo-600"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Configure Mock Track</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gamification Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Core Stats Bento Block & Leveling progression */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Stat 1: Completed Tracks */}
            <div className="border border-white/10 p-6 flex flex-col justify-between rounded-none bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-4 block">Practice Rounds</span>
              <div>
                <p className="text-5xl font-sans font-extrabold text-white">{totalInterviews}</p>
                <span className="text-[9.5px] text-white/40 font-mono mt-1 block">Completed Sessions</span>
              </div>
            </div>

            {/* Stat 2: Score Accuracy */}
            <div className="border border-white/10 p-6 flex flex-col justify-between rounded-none bg-white/[0.01]">
              <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-4 block">Average Score</span>
              <div>
                <p className="text-5xl font-sans font-extrabold text-indigo-400">
                  {averageScore}%
                </p>
                <span className="text-[9.5px] text-white/40 font-mono mt-1 block">Accuracy Median</span>
              </div>
            </div>

            {/* Stat 3: Streak Multiplier */}
            <div className="border border-white/10 p-6 flex flex-col justify-between rounded-none bg-indigo-950/20 border-indigo-500/20">
              <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-bold mb-4 block flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-indigo-400 fill-current" />
                Active Streak
              </span>
              <div>
                <p className="text-5xl font-sans font-extrabold text-white flex items-baseline">
                  {calculatedStreak}
                  <span className="text-base text-indigo-300 font-bold font-mono ml-1">Days</span>
                </p>
                <span className="text-[9.5px] text-indigo-300/65 font-mono mt-1 block">Maintaining Streak</span>
              </div>
            </div>

          </div>

          {/* XP Progress Slider */}
          <div className="border border-white/10 p-6 rounded-none bg-white/[0.01] flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Level Progress</span>
              </div>
              <span className="text-xs font-mono text-indigo-400 font-bold">Level {currentLevel} • {calculatedXP} XP</span>
            </div>
            
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-white transition-all duration-800"
                style={{ width: `${progressToNextLevel}%` }} 
              />
            </div>
            
            <div className="flex justify-between text-[10px] text-white/40">
              <span>Next Level: {500 - (calculatedXP % 500)} XP remaining</span>
              <span>XP multiplier standard: 1.0x</span>
            </div>
          </div>

          {/* Badges Milestones Grid */}
          <div className="border border-white/10 p-6 rounded-none bg-[#0a0a0a]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Unlocked Achievement Badges</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {badgesList.map(badge => (
                <div 
                  key={badge.id}
                  className={`p-4 border text-center transition ${badge.unlocked ? 'border-white/15 bg-white/[0.02]' : 'border-white/5 opacity-25'}`}
                >
                  <span className="text-2xl block mb-2">{badge.icon}</span>
                  <p className="text-xs font-bold text-white truncate">{badge.title}</p>
                  <p className="text-[9.5px] text-white/40 mt-1 truncate">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Global Leaderboard Mockup & Recommendation */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Adaptive Recommendation Panel */}
          <div className="border border-indigo-500/30 p-6 rounded-none bg-indigo-950/10 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-400">
              <Compass className="w-4 h-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AI RECOMMENDATION ENGINE</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] px-2 py-0.5 bg-indigo-500/15 text-indigo-400 font-bold font-mono">FOCUS: {recommendation.focus}</span>
              <h4 className="text-sm font-bold text-white pt-1">{recommendation.title}</h4>
              <p className="text-xs text-white/60 leading-relaxed font-light">{recommendation.desc}</p>
            </div>
            <button
              onClick={() => onNavigate('interview-config')}
              className="w-full py-2 bg-indigo-600 hover:bg-slate-800 hover:text-white text-white text-[10px] font-bold uppercase tracking-widest transition flex items-center justify-center space-x-1"
            >
              <span>{recommendation.resource}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Social Community Leaderboard */}
          <div className="border border-white/10 p-6 rounded-none bg-white/[0.01]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Weekly Leadership board</h3>
              <span className="text-[9px] font-mono text-indigo-400 font-bold">MIL MILESTONES</span>
            </div>
            <div className="space-y-3.5">
              {mockLeaderboard.map((user) => (
                <div 
                  key={user.rank}
                  className={`flex items-center justify-between p-2 rounded ${user.isCurrentUser ? 'bg-indigo-950/30 border border-indigo-500/20' : ''}`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-white/50 w-4">{user.rank}</span>
                    <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-7 h-7 rounded-full object-cover shrink-0" />
                    <span className={`text-xs truncate ${user.isCurrentUser ? 'text-white font-bold' : 'text-white/80 font-normal'}`}>
                      {user.name}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-indigo-400 font-bold shrink-0">{user.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Curriculum tracks panel */}
      <div id="selection-tracks" className="space-y-6 pt-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-2 font-semibold">Curriculum</p>
          <h2 className="text-2xl font-sans font-bold text-white">Active Practice Sandboxes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* HR */}
          <div id="track-hr-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-[#orange]/30 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#EA580C] font-bold mb-4 font-mono">Module 01</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">Behavioral & HR</h3>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Evaluates values cohesion, STAR method structuring, and general behavioral alignment with leading company principles.
              </p>
            </div>
            <button
              id="btn-start-hr"
              onClick={() => onStartInterview('HR')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              <span>Launch HR Suite</span>
            </button>
          </div>

          {/* Technical */}
          <div id="track-technical-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-[#teal]/30 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#0D9488] font-bold mb-4 font-mono">Module 02</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">Technical Systems</h3>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Evaluates structural logic, algorithmic frameworks, indices complexity guidelines, and terminology factual correct answers.
              </p>
            </div>
            <button
              id="btn-start-technical"
              onClick={() => onStartInterview('Technical')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              <span>Launch Technical</span>
            </button>
          </div>

          {/* Aptitude */}
          <div id="track-aptitude-card" className="border border-white/10 p-8 flex flex-col justify-between bg-white/[0.01] hover:border-[#purple]/30 transition rounded-none">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#7C3AED] font-bold mb-4 font-mono">Module 03</p>
              <h3 className="text-2xl font-sans font-bold text-white mb-3">Quantitative Analytical</h3>
              <p className="text-white/60 text-xs font-light leading-relaxed">
                Evaluates systematic logic puzzles, estimation formulas, optimization variables, and quantitative engineering estimates.
              </p>
            </div>
            <button
              id="btn-start-aptitude"
              onClick={() => onStartInterview('Aptitude')}
              className="mt-8 flex items-center justify-center space-x-2 w-full py-3 border border-white/20 text-white/80 hover:text-white hover:bg-white/5 transition text-xs font-bold uppercase tracking-widest rounded-none bg-transparent"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              <span>Launch Analytical</span>
            </button>
          </div>

        </div>
      </div>

      {/* Historic query tables */}
      <div id="historic-records" className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-white" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#F5F5F5]">Historic Assessment Records</h3>
          </div>
          <span className="text-[10px] font-mono text-white/40">{totalInterviews} sessions tracked</span>
        </div>

        {totalInterviews > 0 ? (
          <div id="table-wrapper" className="border border-white/10 rounded-none bg-[#050505] overflow-x-auto">
            <table className="w-full text-left text-xs font-sans min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10 opacity-40 uppercase font-bold text-[9px] tracking-wider text-white">
                  <th className="p-4">Track Type</th>
                  <th className="p-4">Calculated Target Role</th>
                  <th className="p-4">Completed Date</th>
                  <th className="p-4">Composite Rating</th>
                  <th className="p-4 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {interviews.map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-4 font-bold text-white">
                      <span className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase ${
                        record.category === 'HR' ? 'bg-[#EA580C]/10 text-[#EA580C]' :
                        record.category === 'Technical' ? 'bg-[#0D9488]/10 text-[#0D9488]' :
                        'bg-[#7C3AED]/10 text-[#7C3AED]'
                      }`}>
                        {record.category}
                      </span>
                    </td>
                    <td className="p-4 text-white/80 font-light font-sans">{record.role}</td>
                    <td className="p-4 text-white/40 font-mono text-[10.5px]">
                      {new Date(record.completedAt).toLocaleDateString()} at {new Date(record.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-bold">
                      <span className={`text-sm ${
                        record.score >= 85 ? 'text-emerald-400' :
                        record.score >= 70 ? 'text-indigo-400' :
                        'text-yellow-500'
                      }`}>
                        {record.score}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewResult(record)}
                          className="px-3.5 py-1.5 border border-white/15 text-white bg-white/5 hover:bg-white text-[10px] font-bold uppercase tracking-widest text-black hover:text-black transition"
                        >
                          View Report
                        </button>
                        <button
                          id={`btn-delete-${record.id}`}
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1.5 border border-white/5 hover:border-red-500/40 text-white/30 hover:text-red-500 transition"
                          title="Purge session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div id="no-history-alert" className="border border-white/10 p-12 text-center bg-[#0d0d0d] space-y-4">
            <HelpCircle className="w-8 h-8 text-neutral-600 mx-auto" />
            <div className="space-y-1">
              <span className="text-xs font-bold text-white block uppercase tracking-wider">No historic sessions found</span>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto font-light">Complete a mock practice session using our configuration suites to track scores, view ratios, and download report summaries.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
