import React from 'react';
import { Play, History, Sparkles, AlertCircle, Trash2, HelpCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InterviewCategory, InterviewResult } from '../types';

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
  
  const totalInterviews = interviews.length;
  
  // Calculate performance metrics dynamically
  const averageScore = totalInterviews > 0 
    ? Math.round(interviews.reduce((acc, curr) => acc + curr.score, 0) / totalInterviews) 
    : 0;
  
  const lastScore = totalInterviews > 0 ? interviews[0].score : null;
  
  // Real metric averages for communication and technical correctness
  const avgTech = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.technicalScore || 0), 0) / totalInterviews)
    : 0;
  const avgComm = totalInterviews > 0
    ? Math.round(interviews.reduce((acc, curr) => acc + (curr.communicationScore || 0), 0) / totalInterviews)
    : 0;

  const username = userEmail.split('@')[0] || 'Member';

  return (
    <div id="dashboard-root" className="space-y-16 max-w-5xl mx-auto py-6 font-sans text-left selection:bg-white selection:text-black">
      
      {/* PWA App Download Prompt */}
      {isInstallable && (
        <div id="pwa-download-pill" className="border border-white/10 rounded-xl p-5 bg-[#0e0e11] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-semibold">Standalone Launcher</span>
            <p className="text-xs text-[#CBD5E1] font-light leading-relaxed">
              Install the desktop application client for standalone launching and optimized audio verbal input tracking.
            </p>
          </div>
          <button
            onClick={onInstall}
            className="px-4 py-2 bg-[#F8FAFC] hover:bg-[#CBD5E1] text-[#050505] text-[11px] font-bold uppercase tracking-wider transition-all rounded shadow-md shrink-0 focus:ring-2 focus:ring-offset-2 focus:ring-white active:scale-95 cursor-pointer"
          >
            Install Standalone
          </button>
        </div>
      )}

      {/* Hero Welcome & Primary Action Center */}
      <div className="border border-white/10 bg-gradient-to-br from-[#0c0c0e] to-[#121215] rounded-2xl p-8 sm:p-14 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366f1]/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center space-x-2 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-indigo-300 font-semibold block">PrepWise AI Workspace</span>
          </div>
          
          <h1 className="text-3.5xl sm:text-5xl font-sans font-bold tracking-tight text-[#F8FAFC] leading-[1.12]">
            Review performance.<br />Calibrate narrative.
          </h1>
          
          <p className="text-[#CBD5E1] font-light text-sm sm:text-base leading-relaxed">
            Welcome, <span className="font-semibold text-white">{username}</span>. Select a specialized track to trigger realistic, Gemini-authored behavioral and design queries. Dictate responses or utilize text plans to retrieve instant vector scores.
          </p>

          <div className="pt-6">
            <button
              id="btn-primary-start-interview"
              onClick={() => onNavigate('interview-config')}
              className="px-6 py-4 bg-[#6366f1] hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center space-x-2.5 rounded-lg shadow-lg hover:shadow-indigo-500/25 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Key Performance Indicators Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="border border-white/10 rounded-xl p-7 space-y-4 bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block">Completeness</span>
          <div className="space-y-1">
            <p className="text-5xl font-semibold tracking-tight text-[#F8FAFC] font-mono">{totalInterviews}</p>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Practice sessions completed</p>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-7 space-y-4 bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">Average Score</span>
          <div className="space-y-1">
            <p className="text-5xl font-semibold tracking-tight text-[#6366f1] font-mono">{averageScore}%</p>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Across all assessment items</p>
          </div>
        </div>

        <div className="border border-white/10 rounded-xl p-7 space-y-4 bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8] font-bold block">Latest Performance</span>
          <div className="space-y-1">
            <p className="text-5xl font-semibold tracking-tight text-[#F8FAFC] font-mono">
              {lastScore !== null ? `${lastScore}%` : '—'}
            </p>
            <p className="text-xs text-[#94A3B8] font-medium mt-1">Accuracy of last session</p>
          </div>
        </div>

      </div>

      {/* Split Focus Grid for Adaptive Recommendations */}
      {totalInterviews > 0 && (
        <div className="p-7 border border-indigo-500/30 bg-indigo-950/15 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold block">Calibration Hint</span>
            <h4 className="text-base font-bold text-[#F8FAFC]">
              {avgComm < avgTech ? 'Refining STAR Structural Presentation' : 'Technical Concept Verification'}
            </h4>
            <p className="text-sm text-[#CBD5E1] font-light leading-relaxed">
              {avgComm < avgTech 
                ? "Your verbal flow and situation layout require additional framing. Highlight quantitative actions and outcomes in behavioral interviews." 
                : "Your precision when describing architectural details was highlighted as an area of growth. Make sure to specify indices, sharding, and exact configurations."
              }
            </p>
          </div>
          <button
            onClick={() => onNavigate('interview-config')}
            className="px-5 py-3 border border-indigo-400 hover:border-white hover:bg-[#6366f1] text-indigo-300 hover:text-white text-xs font-semibold uppercase tracking-wider transition-all duration-250 shrink-0 rounded active:scale-95 cursor-pointer"
          >
            Calibrate Specifics
          </button>
        </div>
      )}

      {/* Curriculum tracks panel */}
      <div id="selection-curriculum" className="space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Curriculum Modules</span>
          <h2 className="text-2xl sm:text-3xl font-sans font-bold tracking-tight text-[#F8FAFC]">Core Assessment Lanes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="border border-white/10 rounded-2xl p-7 flex flex-col justify-between bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-indigo-400 bg-indigo-950/45 px-2 py-1 rounded">Track 01</span>
              <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC]">Behavioral & Case</h3>
              <p className="text-[#CBD5E1] text-sm font-light leading-relaxed">
                Covers leadership alignment, high-pressure communication clarity, and STAR story structuring templates.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('HR')}
              className="mt-8 py-3.5 border border-white/10 hover:border-white text-[#F8FAFC] hover:bg-white hover:text-black transition-all text-xs font-semibold uppercase tracking-wider w-full rounded active:scale-[0.98] cursor-pointer"
            >
              Launch behavioral track
            </button>
          </div>

          <div className="border border-white/10 rounded-2xl p-7 flex flex-col justify-between bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-[#0D9488] bg-[#0D9488]/10 px-2 py-1 rounded">Track 02</span>
              <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC]">Technical Architectures</h3>
              <p className="text-[#CBD5E1] text-sm font-light leading-relaxed">
                Covers algorithm parameters correctness, memory caching indices guidelines, and design complexity metrics.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('Technical')}
              className="mt-8 py-3.5 border border-white/10 hover:border-white text-[#F8FAFC] hover:bg-white hover:text-black transition-all text-xs font-semibold uppercase tracking-wider w-full rounded active:scale-[0.98] cursor-pointer"
            >
              Launch engineering track
            </button>
          </div>

          <div className="border border-white/10 rounded-2xl p-7 flex flex-col justify-between bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 shadow-md">
            <div className="space-y-4">
              <span className="inline-block text-[10px] font-mono uppercase tracking-widest text-purple-400 bg-purple-950/45 px-2 py-1 rounded">Track 03</span>
              <h3 className="text-lg font-bold tracking-tight text-[#F8FAFC]">Quantitative Analytics</h3>
              <p className="text-[#CBD5E1] text-sm font-light leading-relaxed">
                Covers math puzzles, backend estimations, scale modeling calculations, and quantitative logic baselines.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('Aptitude')}
              className="mt-8 py-3.5 border border-white/10 hover:border-white text-[#F8FAFC] hover:bg-white hover:text-black transition-all text-xs font-semibold uppercase tracking-wider w-full rounded active:scale-[0.98] cursor-pointer"
            >
              Launch analytical track
            </button>
          </div>

        </div>
      </div>

      {/* Historic assessment logs table */}
      <div id="historic-evaluations" className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#F8FAFC]">Evaluation Records</h3>
          </div>
          <span className="text-xs font-mono text-[#94A3B8] font-medium">{totalInterviews} sessions tracked</span>
        </div>

        {totalInterviews > 0 ? (
          <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0c0c0e] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/15 uppercase font-bold text-[10px] tracking-wider text-[#94A3B8] bg-white/[0.02]">
                    <th className="p-4 sm:p-5">Track Type</th>
                    <th className="p-4 sm:p-5">Target Role</th>
                    <th className="p-4 sm:p-5">Completed</th>
                    <th className="p-4 sm:p-5">Final Score</th>
                    <th className="p-4 sm:p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {interviews.map((record) => (
                    <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 sm:p-5">
                        <span className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wide border rounded-sm ${
                          record.category === 'HR' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                          record.category === 'Technical' ? 'border-teal-500/30 text-teal-400 bg-teal-500/10' :
                          'border-purple-500/30 text-purple-400 bg-purple-500/10'
                        }`}>
                          {record.category}
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-[#F8FAFC] font-medium">{record.role}</td>
                      <td className="p-4 sm:p-5 text-[#CBD5E1] font-mono text-[11px]">
                        {new Date(record.completedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 sm:p-5 font-bold text-[#F8FAFC]">
                        <span className={record.score >= 80 ? 'text-teal-400 font-bold' : 'text-indigo-400'}>
                          {record.score}%
                        </span>
                      </td>
                      <td className="p-4 sm:p-5 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => onViewResult(record)}
                            className="px-3.5 py-2 border border-white/10 hover:border-white text-white bg-[#050505] hover:bg-white hover:text-black text-[11px] font-bold uppercase tracking-wider transition-all rounded active:scale-95 cursor-pointer"
                          >
                            View Report
                          </button>
                          <button
                            id={`btn-delete-${record.id}`}
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-2 border border-white/5 hover:border-red-500/30 text-[#94A3B8] hover:text-red-400 transition-all rounded-sm active:scale-95 cursor-pointer bg-transparent"
                            title="Purge session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center bg-[#0c0c0e] space-y-4">
            <HelpCircle className="w-8 h-8 text-indigo-400 mx-auto" />
            <div className="space-y-1">
              <span className="text-sm font-bold text-[#F8FAFC] block uppercase tracking-wider">No evaluations recorded</span>
              <p className="text-xs sm:text-sm text-[#94A3B8] max-w-sm mx-auto font-light leading-relaxed">
                Complete a mock scenario track to populate evaluation compliance cards and feedback roadmaps.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
