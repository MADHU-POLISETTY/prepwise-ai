import React from 'react';
import { Award, Mail, BrainCircuit, BarChart3, Clock, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { InterviewResult } from '../types';

interface ProfileViewProps {
  userEmail: string;
  interviewsList: InterviewResult[];
}

export default function ProfileView({ userEmail, interviewsList }: ProfileViewProps) {
  // Compute key statistics
  const total = interviewsList.length;
  
  const average = total > 0 
    ? Math.round(interviewsList.reduce((sum, item) => sum + item.score, 0) / total) 
    : 0;

  const highest = total > 0 
    ? Math.max(...interviewsList.map(item => item.score)) 
    : 0;

  // Calculate average scores per category
  const hrMins = interviewsList.filter(item => item.category === 'HR');
  const techMins = interviewsList.filter(item => item.category === 'Technical');
  const aptMins = interviewsList.filter(item => item.category === 'Aptitude');

  const hrAvg = hrMins.length > 0 ? Math.round(hrMins.reduce((s, x) => s + x.score, 0) / hrMins.length) : 0;
  const techAvg = techMins.length > 0 ? Math.round(techMins.reduce((s, x) => s + x.score, 0) / techMins.length) : 0;
  const aptAvg = aptMins.length > 0 ? Math.round(aptMins.reduce((s, x) => s + x.score, 0) / aptMins.length) : 0;

  // Radar chart data modeling
  const radarData = [
    { subject: 'HR & Behavioral', A: hrAvg, fullMark: 100 },
    { subject: 'Technical Domain', A: techAvg, fullMark: 100 },
    { subject: 'Logical Aptitude', A: aptAvg, fullMark: 100 },
  ];

  // Category statistics
  const categoryStats = [
    { title: 'HR & Behavioral', count: hrMins.length, avg: hrAvg, color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { title: 'Technical Design', count: techMins.length, avg: techAvg, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { title: 'Logical Aptitude', count: aptMins.length, avg: aptAvg, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div id="profile-container" className="space-y-10 max-w-5xl mx-auto selection:bg-white selection:text-black">
      
      {/* Upper header section */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Analytics Portal</p>
        <h1 className="text-3xl sm:text-5xl font-sans font-bold text-white tracking-tight -ml-0.5">Candidate Profile</h1>
        <p className="text-white/60 text-sm font-light">Review career competence metrics, total practice logs, and analytical spider focus charts.</p>
      </div>

      {/* Profile Overview card */}
      <div id="profile-card-details" className="border border-white/10 bg-[#111] rounded-none p-8 flex flex-col sm:flex-row items-center sm:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full blur-2xl" />
        
        <div className="flex flex-col sm:flex-row items-center space-x-0 sm:space-x-5 text-center sm:text-left gap-4 relative z-10">
          <div className="w-12 h-12 border border-white bg-white text-black flex items-center justify-center font-sans font-bold text-xl rounded-none">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-sans font-semibold text-white">{userEmail.split('@')[0]}</h2>
            <div className="flex items-center text-white/50 text-xs justify-center sm:justify-start font-light font-sans">
              <Mail className="w-4 h-4 mr-1.5" />
              <span>{userEmail}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-4 py-2 bg-[#050505] border border-white/10 rounded-none text-[9px] uppercase tracking-widest font-semibold text-white/80 relative z-10">
          <ShieldCheck className="w-4 h-4 text-white hover:text-neutral-300 mr-1" />
          <span>PrepWise Core Elite</span>
        </div>
      </div>

      {/* Tri-stats cards */}
      <div id="profile-stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Stat 1 */}
        <div id="stat-profile-total" className="border border-white/10 rounded-none bg-[#050505] p-6 flex flex-col justify-between aspect-square transition hover:border-white/25">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Sessions Run</span>
          <span className="block text-6xl font-sans font-extrabold text-white mt-4">{total}</span>
        </div>

        {/* Stat 2 */}
        <div id="stat-profile-avg" className="border border-white/10 rounded-none bg-[#050505] p-6 flex flex-col justify-between aspect-square transition hover:border-white/25">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold">Accredited Score</span>
          <span className="block text-6xl font-sans font-extrabold text-white mt-4">{average}<span className="text-lg opacity-40 ml-1 font-sans">%</span></span>
        </div>

        {/* Stat 3 */}
        <div id="stat-profile-high" className="border border-white/10 rounded-none bg-white text-black p-6 flex flex-col justify-between aspect-square transition">
          <span className="block text-[10px] uppercase tracking-[0.2em] text-black/60 font-semibold">Top Record</span>
          <span className="block text-6xl font-sans font-extrabold text-black mt-4">{highest}<span className="text-lg opacity-50 ml-1 font-sans">%</span></span>
        </div>

      </div>

      {/* Competence Charts and split category average boxes */}
      <div id="profile-charts-section" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Category table details */}
        <div className="lg:col-span-5 border border-white/10 rounded-none bg-[#111] p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-4">Category Proficiency Rates</h3>
            <div className="space-y-4 pt-2">
              {categoryStats.map((cat) => (
                <div key={cat.title} className="p-4 bg-[#050505] border border-white/10 rounded-none flex items-center justify-between">
                  <div>
                    <span className="block font-sans font-semibold text-white text-base">{cat.title}</span>
                    <span className="block text-[9px] uppercase tracking-widest text-white/30 font-semibold">{cat.count} rounds total</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] uppercase tracking-wider text-white/40 font-bold">AVG</span>
                    <span className="block font-sans font-bold text-lg text-white">{cat.avg}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-[11px] font-light leading-relaxed mt-8">
            Proficiencies are evaluated dynamically based on historical transcripts compiled within your user workspace database.
          </p>
        </div>

        {/* Recharts radar proficiency plot */}
        <div className="lg:col-span-7 border border-white/10 rounded-none bg-[#050505] p-8 flex flex-col items-center justify-between">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold self-start mb-6">Competence Analysis Map</h3>
          
          {total === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-white/40 text-xs space-y-2 uppercase tracking-wide font-light">
              <span>Run a practice track to render competence curves.</span>
            </div>
          ) : (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#262626" />
                  <PolarAngleAxis dataKey="subject" stroke="#737373" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#262626" tick={false} />
                  <Radar name="Proficiency %" dataKey="A" stroke="#FFFFFF" fill="#FFFFFF" fillOpacity={0.15} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0px' }}
                    labelStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
