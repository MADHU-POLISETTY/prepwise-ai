import React from 'react';
import { Download, Sparkles, Award, FileText, ArrowLeft, RefreshCw, BarChart3, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PolarGrid, Radar, RadarChart, PolarAngleAxis } from 'recharts';
import { InterviewResult } from '../types';
import Markdown from 'react-markdown';
import { jsPDF } from 'jspdf';

interface ResultsViewProps {
  result: InterviewResult;
  onDone: () => void;
}

export default function ResultsView({ result, onDone }: ResultsViewProps) {
  // Chart structured formatting
  const chartData = [
    { name: 'Technical Depth', value: result.technicalScore, color: '#FFFFFF' },
    { name: 'Communication', value: result.communicationScore, color: '#A3A3A3' },
    { name: 'Confidence/Tone', value: result.confidenceScore, color: '#525252' },
  ];

  // Download printable PDF summary via jsPDF as requested
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      let cursorY = 20;

      // Header Banner
      doc.setFillColor(5, 5, 5); // black
      doc.rect(0, 0, 210, 45, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('times', 'italic');
      doc.setFontSize(24);
      doc.text("PREPWISE AI EVALUATION REPORT", 15, 22);
      
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Candidate: ${result.userId.includes('@') ? result.userId : 'PrepWise User'}`, 15, 32);
      doc.text(`Category: ${result.category} Practise Module`, 15, 37);
      doc.text(`Completed: ${new Date(result.completedAt).toLocaleString()}`, 15, 42);

      cursorY = 55;

      // Overview Score Card
      doc.setFillColor(250, 250, 250); // neutral surface
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(15, cursorY, 180, 40, 0, 0, 'FD');

      doc.setTextColor(0, 0, 0);
      doc.setFont('times', 'bolditalic');
      doc.setFontSize(14);
      doc.text("PERFORMANCE EXECUTIVE SUMMARY", 20, cursorY + 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Overall Composite Score:        ${result.score} / 100`, 20, cursorY + 22);
      doc.text(`Technical correctness:  ${result.technicalScore}/100`, 20, cursorY + 30);
      doc.text(`Communication & flow:   ${result.communicationScore}/100`, 85, cursorY + 30);
      doc.text(`Assertiveness/Confidence: ${result.confidenceScore}/100`, 145, cursorY + 30);

      cursorY + 50 > 270 ? (doc.addPage(), cursorY = 20) : cursorY += 50;

      // Question-Answer transcripts Section
      doc.setTextColor(5, 5, 5);
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.text("INTERVIEW SESSION TRANSCRIPTS", 15, cursorY);
      cursorY += 8;

      result.answers.forEach((ans, idx) => {
        if (cursorY + 35 > 270) {
          doc.addPage();
          cursorY = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const qLines = doc.splitTextToSize(`Q${ans.questionId}: ${ans.questionText}`, 175);
        doc.text(qLines, 15, cursorY);
        cursorY += qLines.length * 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const ansLines = doc.splitTextToSize(`Response: "${ans.answerText}"`, 175);
        doc.text(ansLines, 15, cursorY);
        cursorY += ansLines.length * 4.5 + 4;
      });

      // AI feedback section
      if (cursorY + 50 > 270) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.text("DETAILED EVALUATIVE COACHING ASSESSMENT", 15, cursorY);
      cursorY += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      
      // Split the feedback markdown text safely to size
      const cleanFeedback = result.feedback
          .replace(/#/g, '')
          .replace(/\*/g, '')
          .trim();

      const fbLines = doc.splitTextToSize(cleanFeedback, 175);
      
      fbLines.forEach((line: string) => {
        if (cursorY + 6 > 270) {
          doc.addPage();
          cursorY = 20;
        }
        doc.text(line, 15, cursorY);
        cursorY += 5.5;
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Evaluation Summary</p>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight -ml-0.5">Practice Assessment Result</h1>
        </div>
        <div className="flex space-x-3 shrink-0">
          <button
            id="btn-results-pdf"
            onClick={exportPDF}
            className="px-5 py-3 border border-white/20 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition rounded-none"
          >
            <Download className="w-4 h-4" />
            <span>Download Report</span>
          </button>
          <button
            id="btn-results-close"
            onClick={onDone}
            className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-neutral-200 transition rounded-none border border-white"
          >
            <ArrowLeft className="w-4 h-4 text-black" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>

      {/* Main Score bento boxes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Metric 1: Main Gauge Card */}
        <div className="lg:col-span-4 border border-white/10 rounded-none bg-[#111] p-8 text-center flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl" />
          
          <div className="w-10 h-10 border border-white/20 text-white/85 flex items-center justify-center mb-6">
            <Award className="w-5 h-5" />
          </div>

          <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-4">Overall Score</span>
          
          <div className="relative my-6 flex items-center justify-center">
            <svg className="w-36 h-36 transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="64"
                className="text-white/5"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                className="text-white transition-all duration-1000 ease-out"
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={2 * Math.PI * 64 * (1 - result.score / 100)}
                strokeLinecap="square"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-4xl font-sans font-extrabold text-white">{result.score}%</span>
          </div>

          <p className="text-white/40 text-xs font-light">
            Calculated accuracy aggregate across candidate task transcripts.
          </p>
        </div>

        {/* Metric 2: Detailed Domain Stats Charts */}
        <div className="lg:col-span-8 border border-white/10 rounded-none bg-[#050505] p-8 flex flex-col justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-4 font-semibold">Track Performance</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {chartData.map((d) => (
                <div key={d.name} className="border border-white/10 p-5 rounded-none bg-white/[0.01]">
                   <span className="block text-[10px] uppercase tracking-widest text-[#F5F5F5]/40 font-bold mb-2">{d.name}</span>
                  <div className="flex items-baseline space-x-1 font-sans text-2xl font-bold text-white">
                    <span>{d.value}</span>
                    <span className="text-xs text-white/30 font-sans">/ 100</span>
                  </div>
                  <div className="w-full bg-white/5 h-1 rounded-none overflow-hidden mt-3">
                    <div className="h-full rounded-none transition-all duration-1000" style={{ width: `${d.value}%`, backgroundColor: d.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recharts Analytics Bar */}
          <div className="h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#525252" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.015)' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                  labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]} maxBarSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Dynamic Feedback block */}
      <div className="border border-white/10 rounded-none bg-[#111] p-8 space-y-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-1">Detailed Analysis</p>
        <h2 className="text-2xl font-sans font-bold text-white flex items-center space-x-2">
          <span>AI Coaching Report Summary</span>
        </h2>
        
        <div className="markdown-body text-white/80 text-sm leading-relaxed space-y-4 prose prose-invert max-w-none font-light">
          <Markdown>{result.feedback}</Markdown>
        </div>
      </div>

    </div>
  );
}
