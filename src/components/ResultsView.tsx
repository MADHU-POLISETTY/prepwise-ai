import React from 'react';
import { Download, Sparkles, Award, FileText, ArrowLeft, RefreshCw, BarChart3, AlertCircle, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { InterviewResult } from '../types';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface ResultsViewProps {
  result: InterviewResult;
  onDone: () => void;
}

export default function ResultsView({ result, onDone }: ResultsViewProps) {
  
  // Chart structured formatting supporting 5 dimensions
  const chartData = [
    { name: 'Technical Depth', value: result.technicalScore || 80, color: '#FFFFFF' },
    { name: 'Communication', value: result.communicationScore || 75, color: '#A3A3A3' },
    { name: 'Confidence/Tone', value: result.confidenceScore || 78, color: '#737373' },
    { name: 'Problem Solving', value: (result as any).problemSolvingScore || 82, color: '#D4D4D4' },
    { name: 'Clarity & Flow', value: (result as any).clarityScore || 80, color: '#404040' }
  ];

  // Upgraded printable PDF summary via jsPDF covering all five parameters
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      let cursorY = 20;

      // Header Banner
      doc.setFillColor(15, 15, 20); // Deep slate background
      doc.rect(0, 0, 210, 48, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'bold');
      doc.setFontSize(22);
      doc.text("PREPWISE AI CANDIDATE EVALUATION", 15, 22);
      
      doc.setTextColor(190, 190, 210);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Candidate Registry ID: ${result.userId}`, 15, 32);
      doc.text(`Interview Domain: ${result.category} Assessment`, 15, 37);
      doc.text(`Calculated Role Benchmark: ${result.role}`, 15, 42);

      cursorY = 56;

      // Performance Summary Bento Grid
      doc.setFillColor(248, 249, 250); 
      doc.setDrawColor(220, 225, 230);
      doc.roundedRect(15, cursorY, 180, 48, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("PERFORMANCE EXECUTIVE RATINGS Matrix", 20, cursorY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text(`Overall Composite Accuracy:   ${result.score}%`, 20, cursorY + 22);
      doc.text(`Technical Precision Score:      ${result.technicalScore || 80}%`, 20, cursorY + 28);
      doc.text(`Communication & Articulation:  ${result.communicationScore || 75}%`, 20, cursorY + 34);
      doc.text(`Confidence Level Indicators:     ${result.confidenceScore || 78}%`, 20, cursorY + 40);

      doc.text(`Analytical Logic Score:  ${(result as any).problemSolvingScore || 82}%`, 110, cursorY + 28);
      doc.text(`Syntax & Clarity Rating:  ${(result as any).clarityScore || 80}%`, 110, cursorY + 34);
      doc.text(`Record Timestamp:       ${new Date(result.completedAt).toLocaleDateString()}`, 110, cursorY + 40);

      cursorY += 60;

      // Question-Answer transcripts Section
      doc.setTextColor(15, 23, 42);
      doc.setFont('times', 'italic');
      doc.setFontSize(13);
      doc.text("SESSION Q&A TRANSCRIPTS & CHAT LOGS", 15, cursorY);
      cursorY += 8;

      result.answers.forEach((ans, idx) => {
        if (cursorY + 40 > 275) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const qLines = doc.splitTextToSize(`Q${ans.questionId}: ${ans.questionText}`, 175);
        doc.text(qLines, 15, cursorY);
        cursorY += qLines.length * 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(70, 75, 85);
        const ansLines = doc.splitTextToSize(`Response submitted: "${ans.answerText}"`, 175);
        doc.text(ansLines, 15, cursorY);
        cursorY += ansLines.length * 4.5 + 4;
        doc.setTextColor(15, 23, 42); // Restore
      });

      // AI feedback section
      if (cursorY + 60 > 275) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont('times', 'italic');
      doc.setFontSize(13);
      doc.text("DETAILED EVALUATIVE COACHING ASSESSMENT & PLAN", 15, cursorY);
      cursorY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      const cleanFeedback = result.feedback
          .replace(/#/g, '')
          .replace(/\*/g, '')
          .trim();

      const fbLines = doc.splitTextToSize(cleanFeedback, 175);
      
      fbLines.forEach((line: string) => {
        if (cursorY + 6 > 275) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, 15, cursorY);
        cursorY += 5;
      });

      // Save PDF output
      doc.save(`PrepWise_Report_${result.category}_${result.score}.pdf`);
    } catch (err) {
      console.error("PDF packaging failure:", err);
    }
  };

  return (
    <div id="results-view-container" className="space-y-10 max-w-5xl mx-auto selection:bg-white selection:text-black">
      
      {/* Upper Action banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] px-2.5 py-1 bg-indigo-500/15 text-indigo-400 font-mono font-bold uppercase rounded-none">GRADED SANDBOX</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">• Performance Metric Report</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight -ml-0.5">Session Overview</h1>
        </div>
        <div className="flex space-x-3 shrink-0 w-full sm:w-auto">
          <button
            id="btn-results-pdf"
            onClick={exportPDF}
            className="flex-1 sm:flex-initial px-5 py-3 border border-white/20 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition rounded-none flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Score Report</span>
          </button>
          <button
            id="btn-results-close"
            onClick={onDone}
            className="flex-1 sm:flex-initial px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-200 transition rounded-none border border-white flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Score bento boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Metric 1: Composite Score Dial */}
        <div className="lg:col-span-4 border border-white/10 rounded-none bg-[#111] p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-10 h-10 border border-white/15 text-white/85 flex items-center justify-center mb-6">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>

          <span className="block text-[10px] uppercase tracking-[0.2em] text-[#FAFAFA]/40 font-bold mb-4">COMPOSITE ACCURACY</span>
          
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="text-white/5"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="text-indigo-500 transition-all duration-1000 ease-out"
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - result.score / 100)}
                strokeLinecap="square"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-3xl font-mono font-bold text-white">{result.score}%</span>
          </div>

          <p className="text-[#A3A3A3] text-[11px] leading-relaxed font-light">
            Calculated as an aggregate ratio of technical depth compliance, terminology precision, and articulation brevity.
          </p>
        </div>

        {/* Metric 2: Detailed 5-Track Score Indicators */}
        <div className="lg:col-span-8 border border-white/10 rounded-none bg-[#050505] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#FAFAFA]/40 mb-6 font-bold">5-TRACK PERFORMANCE BREAKDOWN</p>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
              {chartData.map((d) => (
                <div key={d.name} className="border border-white/10 p-4 rounded-none bg-white/[0.01]">
                  <span className="block text-[9px] uppercase tracking-widest text-[#F5F5F5]/40 font-bold mb-2 truncate" title={d.name}>{d.name}</span>
                  <div className="flex items-baseline space-x-0.5 font-mono text-xl font-bold text-white">
                    <span>{d.value}</span>
                    <span className="text-[10px] text-white/30">/100</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-none overflow-hidden mt-3">
                    <div className="h-full rounded-none transition-all duration-1000" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recharts Analytics Bar visualizer */}
          <div className="h-44 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -25, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#525252" fontSize={9} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={9} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={30}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Structured report review markdown */}
      <div className="border border-white/10 rounded-none bg-[#111] p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
          <FileText className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider font-sans">
            AI Recruiter Feedback & 4-Week Plan
          </h2>
        </div>
        
        <div className="markdown-body text-white/80 text-xs sm:text-sm leading-relaxed space-y-4 prose prose-invert max-w-none font-light">
          <Markdown>{result.feedback}</Markdown>
        </div>
      </div>

    </div>
  );
}
