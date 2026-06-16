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
  
  // Calculate real performance metrics dynamically
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
    <div id="dashboard-root" className="space-y-12 max-w-5xl mx-auto font-sans selection:bg-white selection:text-black text-left">
      
      {/* PWA App Download Prompt */}
      {isInstallable && (
        <div id="pwa-download-pill" className="border border-neutral-200 dark:border-white/10 p-4 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-500 dark:text-white/60 font-light">
            Install the desktop application client for standalone launching and optimized audio verbal input tracking.
          </p>
          <button
            onClick={onInstall}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-850 dark:bg-white text-white dark:text-black text-[10px] font-semibold uppercase tracking-wider transition-colors shrink-0"
          >
            Install Standalone
          </button>
        </div>
      )}

      {/* Hero Welcome & Primary Action Center */}
      <div className="border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-[#0c0c0e] p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-indigo-500 font-bold block">PrepWise AI Workspace</span>
          <h1 className="text-3xl sm:text-4.5xl font-sans font-semibold tracking-tight text-neutral-900 dark:text-white leading-tight">
            Review performance. Calibrate narrative.
          </h1>
          <p className="text-neutral-500 dark:text-white/40 font-light text-xs sm:text-sm leading-relaxed">
            Welcome, <span className="font-medium text-neutral-800 dark:text-neutral-300">{username}</span>. Select a specialized track to trigger realistic, Gemini-authored behavioral and design queries. Dictate responses or utilize text plans to retrieve instant vector scores.
          </p>

          <div className="pt-4">
            <button
              id="btn-primary-start-interview"
              onClick={() => onNavigate('interview-config')}
              className="px-5 py-3.5 bg-[#6366f1] hover:bg-indigo-650 text-white font-semibold text-xs uppercase tracking-wider transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Mock Interview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Key Performance Indicators Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        <div className="border border-neutral-200 dark:border-white/5 p-6 space-y-4 bg-white/[0.01]">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#71717a] dark:text-white/40 block">Completeness</span>
          <div>
            <p className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">{totalInterviews}</p>
            <p className="text-[10px] text-neutral-400 dark:text-white/30 font-mono mt-1">Practice sessions completed</p>
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-white/5 p-6 space-y-4 bg-white/[0.01]">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#71717a] dark:text-white/40 block">Averages Score</span>
          <div>
            <p className="text-4xl font-semibold tracking-tight text-indigo-500">{averageScore}%</p>
            <p className="text-[10px] text-neutral-400 dark:text-white/30 font-mono mt-1">Across all assessment items</p>
          </div>
        </div>

        <div className="border border-neutral-200 dark:border-white/5 p-6 space-y-4 bg-white/[0.01]">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#71717a] dark:text-white/40 block">Latest Performance</span>
          <div>
            <p className="text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {lastScore !== null ? `${lastScore}%` : '—'}
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-white/30 font-mono mt-1">Accuracy of last session</p>
          </div>
        </div>

      </div>

      {/* Split Focus Grid for Adaptive Recommendations */}
      {totalInterviews > 0 && (
        <div className="p-6 border border-indigo-500/10 bg-indigo-950/5 flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="text-[9px] font-mono uppercase tracking-widest text-indigo-400 font-bold">Calibration Hint</span>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {avgComm < avgTech ? 'Refining STAR Structural Presentation' : 'Technical Concept Verification'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-white/60 font-light leading-relaxed">
              {avgComm < avgTech 
                ? "Your verbal flow and situation layout require additional framing. Highlight quantitative actions and outcomes in behavioral interviews." 
                : "Your precision when describing architectural details was highlighted as an area of growth. Make sure to specify indices, sharding, and exact configurations."
              }
            </p>
          </div>
          <button
            onClick={() => onNavigate('interview-config')}
            className="px-4 py-2 border border-indigo-500/20 hover:border-indigo-500 text-indigo-500 hover:bg-indigo-500/5 text-[10px] font-semibold uppercase tracking-wider transition duration-150 shrink-0"
          >
            Calibrate Specifics
          </button>
        </div>
      )}

      {/* Curriculum tracks panel */}
      <div id="selection-curriculum" className="space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717a] dark:text-white/30">Paths</span>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">Core Assessment Modules</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="border border-neutral-200 dark:border-white/5 p-6 flex flex-col justify-between bg-white/[0.01]">
            <div className="space-y-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Track 01</span>
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Behavioral & Case</h3>
              <p className="text-neutral-500 dark:text-white/50 text-xs font-light leading-relaxed">
                Covers leadership alignment, high-pressure communication clarity, and Star story structuring templates.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('HR')}
              className="mt-6 py-2 border border-neutral-300 dark:border-white/10 hover:border-neutral-500 dark:hover:border-white/30 text-neutral-700 dark:text-white/80 transition text-[10px] font-semibold uppercase tracking-wider w-full"
            >
              Launch behavioral track
            </button>
          </div>

          <div className="border border-neutral-200 dark:border-white/5 p-6 flex flex-col justify-between bg-white/[0.01]">
            <div className="space-y-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Track 02</span>
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Technical Architectures</h3>
              <p className="text-neutral-500 dark:text-white/50 text-xs font-light leading-relaxed">
                Covers algorithm parameters correctness, memory caching indices guidelines, and design complexity metrics.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('Technical')}
              className="mt-6 py-2 border border-neutral-300 dark:border-white/10 hover:border-neutral-500 dark:hover:border-white/30 text-neutral-700 dark:text-white/80 transition text-[10px] font-semibold uppercase tracking-wider w-full"
            >
              Launch engineering track
            </button>
          </div>

          <div className="border border-neutral-200 dark:border-white/5 p-6 flex flex-col justify-between bg-white/[0.01]">
            <div className="space-y-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Track 03</span>
              <h3 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-white">Quantitative Analytics</h3>
              <p className="text-neutral-500 dark:text-white/50 text-xs font-light leading-relaxed">
                Covers math puzzles, backend estimations, scale modeling calculations, and quantitative logic baselines.
              </p>
            </div>
            <button
              onClick={() => onStartInterview('Aptitude')}
              className="mt-6 py-2 border border-neutral-300 dark:border-white/10 hover:border-neutral-500 dark:hover:border-white/30 text-neutral-700 dark:text-white/80 transition text-[10px] font-semibold uppercase tracking-wider w-full"
            >
              Launch analytical track
            </button>
          </div>

        </div>
      </div>

      {/* Historic assessment logs table */}
      <div id="historic-evaluations" className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-white/5 pb-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-800 dark:text-white">Evaluation Logs</h3>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 dark:text-white/30">{totalInterviews} sessions tracked</span>
        </div>

        {totalInterviews > 0 ? (
          <div className="border border-neutral-200 dark:border-white/5 overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-white/10 opacity-40 uppercase font-semibold text-[9px] tracking-wider text-neutral-800 dark:text-white bg-neutral-100/50 dark:bg-white/[0.01]">
                  <th className="p-4">Track Type</th>
                  <th className="p-4">Target Role</th>
                  <th className="p-4">Completed</th>
                  <th className="p-4">Final Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-white/5">
                {interviews.map((record) => (
                  <tr key={record.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                        record.category === 'HR' ? 'border-orange-500/20 text-[#ea580c] bg-orange-500/5' :
                        record.category === 'Technical' ? 'border-[#0D9488]/20 text-[#0d9488] bg-[#0d9488]/5' :
                        'border-purple-500/20 text-[#7c3aed] bg-purple-500/5'
                      }`}>
                        {record.category}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-800 dark:text-white/85 font-light">{record.role}</td>
                    <td className="p-4 text-neutral-400 dark:text-white/40 font-mono text-[10.5px]">
                      {new Date(record.completedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-semibold text-neutral-900 dark:text-white">
                      <span className={record.score >= 80 ? 'text-[#0d9488] font-bold' : 'text-indigo-500'}>
                        {record.score}%
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onViewResult(record)}
                          className="px-3 py-1.5 border border-neutral-300 dark:border-white/10 text-neutral-800 dark:text-white bg-white dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-white/5 text-[10px] font-semibold uppercase tracking-wider transition"
                        >
                          View Report
                        </button>
                        <button
                          id={`btn-delete-${record.id}`}
                          onClick={() => onDeleteRecord(record.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition"
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
        ) : (
          <div className="border border-neutral-200 dark:border-white/5 p-12 text-center bg-neutral-50 dark:bg-transparent space-y-3">
            <HelpCircle className="w-6 h-6 text-neutral-400 dark:text-white/20 mx-auto" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block uppercase tracking-wider">No evaluations recorded</span>
              <p className="text-xs text-neutral-500 dark:text-white/40 max-w-sm mx-auto font-light">Complete a mock scenario track to populate evaluation compliance cards and feedback roadmaps.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
