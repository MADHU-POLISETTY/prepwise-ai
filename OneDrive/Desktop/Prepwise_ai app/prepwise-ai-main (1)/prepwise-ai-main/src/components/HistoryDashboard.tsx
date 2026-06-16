import React, { useState } from 'react';
import { History, Calendar, Trash2, Eye, ArrowRight, Sparkles, Award, FileText, CheckCircle2 } from 'lucide-react';
import { InterviewResult } from '../types';

interface HistoryDashboardProps {
  interviewsList: InterviewResult[];
  onDeleteRecord: (id: string) => Promise<void>;
  onSelectRecord: (record: InterviewResult) => void;
}

export default function HistoryDashboard({
  interviewsList,
  onDeleteRecord,
  onSelectRecord,
}: HistoryDashboardProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent clicking card row trigger select
    if (confirm("Are you sure you want to permanently delete this interview practice record? This action cannot be undone.")) {
      setDeletingId(id);
      try {
        await onDeleteRecord(id);
      } catch (err) {
        console.error("Failed to delete interview record:", err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div id="history-container" className="space-y-8 max-w-7xl mx-auto selection:bg-white selection:text-black">
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Track Logs</p>
        <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight -ml-0.5">Interview History</h1>
        <p className="text-white/60 text-sm font-light">Review your past evaluations, track performance improvements, and view full transcript logs.</p>
      </div>

      {interviewsList.length === 0 ? (
        <div id="history-empty" className="border border-white/10 rounded-none bg-[#111] p-12 text-center space-y-4">
          <History className="w-10 h-10 text-white/20 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-white font-sans font-semibold text-lg">No Practice Sessions Found</h3>
            <p className="text-white/40 text-xs font-light max-w-sm mx-auto">You haven't completed any dynamic mock rounds yet. Setup your first practice track to begin analyzing trends!</p>
          </div>
        </div>
      ) : (
        <div id="history-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviewsList.map((record) => {
            const dateStr = new Date(record.completedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={record.id}
                id={`history-item-${record.id}`}
                onClick={() => onSelectRecord(record)}
                className="group relative border border-white/10 rounded-none bg-[#050505] hover:border-white/20 p-6 transition duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Upper Details */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 border border-white/20 text-white font-bold tracking-widest text-[9px] uppercase rounded-none">
                      {record.category === 'HR' ? 'Behavioral' : record.category}
                    </span>
                    
                    <div className="flex items-center text-[10px] uppercase tracking-widest font-semibold text-white/40">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white font-sans font-bold text-xl group-hover:text-white transition">
                      {record.role || "General Career Interview"}
                    </h3>
                    <p className="text-white/40 text-[11px] uppercase tracking-widest font-semibold">
                      {record.answers.length} questions completed
                    </p>
                  </div>
                </div>

                {/* Score panel & Delete */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-white/80" />
                    <div>
                      <span className="block text-[8px] uppercase tracking-widest text-white/40 font-bold">Score Metric</span>
                      <span className="text-lg font-sans font-bold text-[#FFF]">{record.score}%</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-history-delete-${record.id}`}
                      type="button"
                      onClick={(e) => handleDelete(e, record.id)}
                      disabled={deletingId === record.id}
                      className="p-2 border border-white/10 hover:border-red-500 hover:bg-red-500/5 text-white/40 hover:text-red-400 transition rounded-none bg-transparent"
                      title="Delete practice record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      id={`btn-history-view-${record.id}`}
                      type="button"
                      className="p-2 border border-white/10 hover:border-white hover:bg-white/5 text-white/60 hover:text-white transition rounded-none bg-transparent"
                      title="Inspect full performance reports"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
