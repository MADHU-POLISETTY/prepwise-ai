import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  FolderOpen,
  Code2,
  Copy,
  Check,
  Play,
  FileText,
  BarChart3,
  User as UserIcon,
  Home,
  CheckCircle,
  FileCode,
  Sliders,
  Send,
  Info,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

// Pre-populated pristine Dart Flutter source files to view inside the workspace
const FLUTTER_FILES: Record<string, { label: string; code: string; lang: string }> = {
  'pubspec.yaml': {
    label: 'pubspec.yaml',
    lang: 'yaml',
    code: `name: prepwise_ai
description: A premium Flutter mobile-first application for AI-powered career coaching, smart technical mock interviews, and detailed ATS resume optimization.
version: 1.0.0+1

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.6
  google_generative_ai: ^0.4.0
  provider: ^6.1.2
  shared_preferences: ^2.2.3
  intl: ^0.19.0

flutter:
  uses-material-design: true`
  },
  'main.dart': {
    label: 'main.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/interview_screen.dart';
import 'screens/resume_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const PrepWiseApp());
}

class PrepWiseApp extends StatelessWidget {
  const PrepWiseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PrepWise AI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050505),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
        ),
      ),
      home: const AuthOrNavigationWrapper(),
    );
  }`
  },
  'home_screen.dart': {
    label: 'home_screen.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('GOOD MORNING', style: TextStyle(fontFamily: 'monospace', fontSize: 10, color: Colors.blue)),
          const Text('Candidate', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          // Interactive mock tracks and workspace cards...
        ],
      ),
    );
  }`
  },
  'interview_screen.dart': {
    label: 'interview_screen.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';
import '../services/gemini_service.dart';

class InterviewScreen extends StatefulWidget {
  const InterviewScreen({Key? key}) : super(key: key);

  @override
  State<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends State<InterviewScreen> {
  // Conversational evaluation state...
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Technical & Behavioral Mock Assistant')),
    );
  }`
  },
  'resume_screen.dart': {
    label: 'resume_screen.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';

class ResumeScreen extends StatelessWidget {
  const ResumeScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Text('ATS Resume Optimization Scanner'),
    );
  }`
  },
  'dashboard_screen.dart': {
    label: 'dashboard_screen.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Metrics Logs & Performance Analytics'));
  }`
  },
  'profile_screen.dart': {
    label: 'profile_screen.dart',
    lang: 'dart',
    code: `import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(child: Text('Candidate Profile Settings & Database Reset'));
  }`
  },
  'gemini_service.dart': {
    label: 'services/gemini_service.dart',
    lang: 'dart',
    code: `import 'dart:convert';
import 'package:google_generative_ai/google_generative_ai.dart';

class GeminiService {
  final String apiKey;
  GeminiService({required this.apiKey});

  Future<Map<String, dynamic>> evaluateInterview(List<Map<String, String>> transcript) async {
    // Generates sessional score assessments...
    return {'score': 85, 'feedback': 'Brilliant responses.'};
  }
}`
  },
  'AndroidManifest.xml': {
    label: 'AndroidManifest.xml',
    lang: 'xml',
    code: `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
</manifest>`
  },
  'Info.plist': {
    label: 'Info.plist',
    lang: 'xml',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
<dict>
  <key>NSMicrophoneUsageDescription</key>
  <string>PrepWise AI needs voice recording access to evaluate candidate STAR formats.</string>
</dict>
</plist>`
  }
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string>('main.dart');
  const [copied, setCopied] = useState<boolean>(false);
  const [simulatedTab, setSimulatedTab] = useState<'home' | 'coach' | 'resume' | 'metrics' | 'profile'>('home');
  const [authEmail, setAuthEmail] = useState<string>('candidate.preview@prepwise.ai');
  const [isLogged, setIsLogged] = useState<boolean>(true);
  
  // Interactive Simulator States
  const [cvText, setCvText] = useState<string>('');
  const [cvScore, setCvScore] = useState<number | null>(null);
  const [evalLoading, setEvalLoading] = useState<boolean>(false);
  
  // Conversation states
  const [chatMessages, setChatMessages] = useState<Array<{ r: string; t: string }>>([
    { r: 'ai', t: 'Welcome to your PrepWise appraisal context. Tell me about your strategy for load pacing.' }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [showAssessmentModal, setShowAssessmentModal] = useState<boolean>(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FLUTTER_FILES[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runCvAudit = () => {
    if (!cvText.trim()) return;
    setEvalLoading(true);
    setTimeout(() => {
      setCvScore(86);
      setEvalLoading(false);
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!userInput.trim()) return;
    const nextArr = [...chatMessages, { r: 'user', t: userInput }];
    setChatMessages(nextArr);
    setUserInput('');
    
    // AI simulation response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { r: 'ai', t: 'Excellent descriptions. We recorded your response and analyzed the database footprint metrics. Let us proceed to the score summary.' }
      ]);
      setTimeout(() => {
        setShowAssessmentModal(true);
      }, 1000);
    }, 1200);
  };

  return (
    <div id="flutter-migration-workspace" className="min-h-screen bg-[#07070a] text-white flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Editorial Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-white/10 bg-[#0a0a0f] py-4 px-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">PrepWise AI</h1>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-[#818CF8] font-bold uppercase tracking-widest">NATIVE FLUTTER FLIGHT SHELL</span>
              <span className="text-[8px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono px-1 rounded uppercase font-bold">iOS + Android</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-white/40 font-mono">Build Target: Flutter 3.x SDK / Material 3</span>
          <a
            href="https://pub.dev"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#818CF8] hover:underline font-semibold font-mono"
          >
            pub.dev Packages
          </a>
        </div>
      </header>

      {/* Dual Workspace body */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 relative z-10 max-w-[1700px] w-full mx-auto overflow-hidden">
        
        {/* LEFT COMPONENT: HIGH-FIDELITY MOBILE PHONE VISUAL COMPENSATED SIMULATOR */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <div className="w-full max-w-[380px] aspect-[9/18.5] bg-[#000000] rounded-[48px] border-[5px] border-neutral-800 shadow-[0_24px_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden transition-all duration-300">
            
            {/* Camera notch / dynamic island */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-3xl z-50 flex items-center justify-center">
              <span className="w-10 h-0.5 bg-neutral-800 rounded-full" />
            </div>

            {/* Mobile virtual status bar */}
            <div className="flex items-center justify-between px-6 pt-11 pb-2 bg-black text-[10px] font-mono text-white/85 select-none shrink-0 z-45">
              <span>98% 5G</span>
              <span>12:45 PM</span>
              <div className="w-4 h-2 border border-white/30 rounded-sm bg-emerald-400" />
            </div>

            {/* Simulator Content Screen */}
            <div className="flex-1 overflow-y-auto bg-[#050508] p-4 text-left relative" style={{ scrollbarWidth: 'none' }}>
              
              {!isLogged ? (
                // Authentication View Simulation
                <div className="h-full flex flex-col justify-center px-4">
                  <div className="text-center space-y-2 mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500 text-indigo-400 flex items-center justify-center rounded-xl mx-auto">
                      <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Bootstrap Session</h3>
                    <p className="text-[10px] text-white/50">Enter credentials to test Flutter model states</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[9px] font-mono uppercase text-white/40 font-bold block mb-1">Email address</label>
                      <input 
                        type="text" 
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono uppercase text-white/40 font-bold block mb-1">Password</label>
                      <input 
                        type="password" 
                        value="••••••••••••" 
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white" 
                      />
                    </div>
                    
                    <button 
                      onClick={() => setIsLogged(true)}
                      className="w-full bg-[#6366F1] text-xs font-bold py-2.5 rounded-lg text-white mt-4"
                    >
                      CONNECT SIMULATOR
                    </button>
                  </div>
                </div>
              ) : (
                // Inside Application Visual states
                <div className="space-y-4 pb-16">
                  
                  {/* SIM HOME TAB */}
                  {simulatedTab === 'home' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-indigo-400 tracking-wider">GOOD MORNING</span>
                        <h2 className="text-xl font-black text-white">Candidate</h2>
                      </div>

                      {/* Promotion board */}
                      <div className="bg-[#100f1e] border border-indigo-500/20 rounded-2xl p-4 space-y-2">
                        <span className="text-[7px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-1.5 py-0.5 rounded">EXPERIENCE EXP</span>
                        <h3 className="text-xs font-bold text-white leading-normal">Master mock career evaluation sessions</h3>
                        <p className="text-[9px] text-[#A5B4FC]/70">Triggers responsive Gemini evaluation algorithms customizable to Stripe or backend domains.</p>
                        <button 
                          onClick={() => setSimulatedTab('coach')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-[9px] font-bold py-2 rounded-lg text-white"
                        >
                          LAUNCH INTERVIEW COACH
                        </button>
                      </div>

                      {/* Action blocks */}
                      <span className="text-[8px] font-mono text-white/40 block tracking-widest uppercase mt-4">INTERACTIVE WORKSPACE</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div 
                          onClick={() => setSimulatedTab('coach')}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition"
                        >
                          <Play className="w-4 h-4 text-orange-400 mb-2" />
                          <h4 className="text-[11px] font-bold text-white">AI Coach</h4>
                          <span className="text-[8.5px] text-white/40 block">Vocal mock evaluation</span>
                        </div>
                        <div 
                          onClick={() => setSimulatedTab('resume')}
                          className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition"
                        >
                          <FileText className="w-4 h-4 text-teal-400 mb-2" />
                          <h4 className="text-[11px] font-bold text-white">Resume ATS</h4>
                          <span className="text-[8.5px] text-white/40 block">Optimize draft CVs</span>
                        </div>
                      </div>

                      {/* Lane assessment highlights */}
                      <span className="text-[8px] font-mono text-white/40 block tracking-widest uppercase mt-4">ACTIVE ASSESSMENT LANES</span>
                      <div className="space-y-2">
                        <div 
                          onClick={() => setSimulatedTab('coach')}
                          className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5"
                        >
                          <div>
                            <span className="text-[8px] font-mono text-orange-400">Track 01</span>
                            <h4 className="text-[11px] font-bold text-white">Behavioral Alignment</h4>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                        </div>
                        <div 
                          onClick={() => setSimulatedTab('coach')}
                          className="bg-white/[0.02] border border-white/5 p-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/5"
                        >
                          <div>
                            <span className="text-[8px] font-mono text-teal-400">Track 02</span>
                            <h4 className="text-[11px] font-bold text-white">Architecture & Cache Sizing</h4>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-white/30" />
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SIM COACH TAB */}
                  {simulatedTab === 'coach' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-[#818CF8] tracking-widest">COACH SIMULATOR</span>
                        <h2 className="text-xl font-bold text-white">Technical Appraisal</h2>
                      </div>

                      {/* Conversation log panel */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-3">
                        <div className="h-44 overflow-y-auto space-y-2 text-[10px] p-1" style={{ scrollbarWidth: 'none' }}>
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={`p-2 rounded-lg ${msg.r === 'ai' ? 'bg-white/5 border-l-2 border-indigo-500' : 'bg-indigo-600/20 text-right ml-8'}`}>
                              <span className="text-[7px] font-mono text-white/40 block mb-0.5">{msg.r === 'ai' ? "AI Coach" : "Candidate Response"}</span>
                              <span>{msg.t}</span>
                            </div>
                          ))}
                        </div>

                        {/* Dialogue actions */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-white/5">
                          <input 
                            type="text" 
                            placeholder="Type STAR alignment response..." 
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="bg-white/5 text-[10px] p-2 rounded-lg flex-1 border border-white/10 text-white"
                          />
                          <button 
                            onClick={handleSendMessage}
                            className="bg-indigo-600 p-2 rounded-lg text-white"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Mock Mic trigger */}
                      <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                        <h4 className="text-[10.5px] font-bold text-white mb-1">Simulate Vocal input</h4>
                        <p className="text-[9px] text-white/40 mb-2">Tap below to inject a premium pre-formulated caching response.</p>
                        <button 
                          onClick={() => setUserInput("At scale, we integrated Redis nodes optimized with memory compaction pipelines, reducing target round-trip thresholds by 38%.")}
                          className="bg-white/10 p-1 px-3 text-[8.5px] font-mono uppercase text-white hover:bg-white/20 rounded"
                        >
                          Inject Caching Response
                        </button>
                      </div>

                      {/* Simulated Result Appraisal dialog overlay inside phone */}
                      {showAssessmentModal && (
                        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col justify-center p-4">
                          <div className="bg-[#100f1e] border border-indigo-500/40 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center space-x-2 text-emerald-400">
                              <CheckCircle className="w-5 h-5" />
                              <h3 className="text-xs font-bold uppercase tracking-wider">APPRAISAL COMPLETED</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                <span className="text-[7.5px] text-white/40 block">TECHNICAL</span>
                                <span className="text-sm font-bold text-white">88%</span>
                              </div>
                              <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                                <span className="text-[7.5px] text-white/40 block">ALIGNMENT</span>
                                <span className="text-sm font-bold text-white">82%</span>
                              </div>
                            </div>

                            <p className="text-[9.5px] text-white/70 leading-normal">
                              "Excellent response patterns. You clearly defined cache coherence metrics. Expand sizing estimates during scale transitions."
                            </p>

                            <button 
                              onClick={() => setShowAssessmentModal(false)}
                              className="w-full bg-[#6366F1] text-[10px] font-bold py-2 rounded-lg text-white"
                            >
                              DISMISS ASSESSMENT REPORT
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* SIM RESUME TAB */}
                  {simulatedTab === 'resume' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-teal-400 tracking-widest">RESUME ATS</span>
                        <h2 className="text-xl font-bold text-white">CV Draft Scanner</h2>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <textarea 
                          rows={3}
                          value={cvText}
                          onChange={(e) => setCvText(e.target.value)}
                          placeholder="Paste or draft technical CV text summary block..."
                          className="w-full bg-black/45 border border-white/10 text-[10px] rounded-lg p-2 text-white"
                        />
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => {
                              setCvText(`James Smith\nSenior Full-Stack Developer\n- Spearheaded team of 8 engineers\n- Restructured database throughput caching by 45%`);
                            }}
                            className="bg-white/5 text-[8.5px] font-mono p-1 px-2 text-white/70 border border-white/10 rounded hover:bg-white/10"
                          >
                            Use Demo CV Draft
                          </button>
                          <button 
                            onClick={runCvAudit}
                            disabled={evalLoading}
                            className="bg-teal-600 text-[10px] py-1.5 px-4 font-bold rounded-lg text-white flex-1"
                          >
                            {evalLoading ? 'Processing...' : 'Audit Scan CV'}
                          </button>
                        </div>
                      </div>

                      {cvScore !== null && (
                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-emerald-400 tracking-widest font-mono">ATS SCORE: {cvScore}%</span>
                            <span className="text-[7.5px] bg-emerald-500/20 text-emerald-300 font-mono px-1 rounded">PASS</span>
                          </div>
                          <p className="text-[9px] text-white/75 height-relaxed">
                            "Excellent chronological presentation. Suggestions: explicitly detail cache coherence limits under experience headings."
                          </p>
                        </div>
                      )}

                    </div>
                  )}

                  {/* SIM METRICS TAB */}
                  {simulatedTab === 'metrics' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-indigo-400 tracking-widest">TELEMENTRY LOGS</span>
                        <h2 className="text-xl font-bold text-white">Performance KPIs</h2>
                      </div>

                      {/* Progress grid */}
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                          <span className="text-[8px] text-white/30 block">SESSIONS</span>
                          <span className="text-xl font-bold text-white">12</span>
                        </div>
                        <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl">
                          <span className="text-[8px] text-white/30 block">XP LEVEL</span>
                          <span className="text-xl font-bold text-white">2.4k</span>
                        </div>
                      </div>

                      {/* Visual metric channels */}
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-[9px] text-white/60 mb-1">
                            <span>STAR Framework Compliance</span>
                            <span className="font-bold">88%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded">
                            <div className="h-full bg-indigo-500 rounded" style={{ width: '88%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[9px] text-white/60 mb-1">
                            <span>Technical Optimization Vocabulary</span>
                            <span className="font-bold">76%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded">
                            <div className="h-full bg-teal-500 rounded" style={{ width: '76%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[9px] text-white/60 mb-1">
                            <span>Capacity Sizing Sizing Calculations</span>
                            <span className="font-bold">82%</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/10 rounded">
                            <div className="h-full bg-orange-500 rounded" style={{ width: '82%' }} />
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* SIM PROFILE TAB */}
                  {simulatedTab === 'profile' && (
                    <div className="space-y-4 animate-fade-in text-left">
                      <div>
                        <span className="text-[8px] font-mono font-bold text-white/30 tracking-widest">DEVICE PARAMETERS</span>
                        <h2 className="text-xl font-bold text-white">Profile & Config</h2>
                      </div>

                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center space-x-3">
                          <CircleAvatarMock char="C" />
                          <div>
                            <h4 className="text-xs font-bold text-white">Candidate Workspace</h4>
                            <span className="text-[9px] text-white/40 block">candidate.preview@prepwise.ai</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            setIsLogged(false);
                            setChatMessages([{ r: 'ai', t: 'Welcome template reset. Launch interviewer prep to begin.' }]);
                          }}
                          className="w-full bg-red-500/10 border border-red-500/20 text-red-400 py-2 rounded-xl text-xs font-semibold"
                        >
                          RESET SYSTEM CACHE
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Simulated Glassmorphism Bottom Navigation Dock inside Phone Chassis */}
            {isLogged && (
              <nav className="absolute bottom-5 left-4 right-4 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl py-2 px-3 flex items-center justify-between select-none z-40">
                <button 
                  onClick={() => setSimulatedTab('home')}
                  className={`flex flex-col items-center flex-1 ${simulatedTab === 'home' ? 'text-indigo-400 scale-105' : 'text-white/40'}`}
                >
                  <Home className="w-4 h-4" />
                  <span className="text-[8px] mt-0.5">Home</span>
                </button>
                <button 
                  onClick={() => setSimulatedTab('coach')}
                  className={`flex flex-col items-center flex-1 ${simulatedTab === 'coach' ? 'text-indigo-400 scale-105' : 'text-white/40'}`}
                >
                  <Play className="w-4 h-4" />
                  <span className="text-[8px] mt-0.5">Coach</span>
                </button>
                <button 
                  onClick={() => setSimulatedTab('resume')}
                  className={`flex flex-col items-center flex-1 ${simulatedTab === 'resume' ? 'text-indigo-400 scale-105' : 'text-white/40'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-[8px] mt-0.5">Resume</span>
                </button>
                <button 
                  onClick={() => setSimulatedTab('metrics')}
                  className={`flex flex-col items-center flex-1 ${simulatedTab === 'metrics' ? 'text-indigo-400 scale-105' : 'text-white/40'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-[8px] mt-0.5">Metrics</span>
                </button>
                <button 
                  onClick={() => setSimulatedTab('profile')}
                  className={`flex flex-col items-center flex-1 ${simulatedTab === 'profile' ? 'text-indigo-400 scale-105' : 'text-white/40'}`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[8px] mt-0.5">Profile</span>
                </button>
              </nav>
            )}

            {/* Apple Home Indicator Bar */}
            <div className="absolute bottom-1 right-1/2 translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-50 pointer-events-none" />

          </div>
        </div>

        {/* RIGHT COMPONENT: METICULOUS NATIVE FLUTTER CODE EXPLORER & COMPLIANCE PANEL */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="bg-[#0b0b0e] border border-white/10 rounded-3xl p-6 flex-1 flex flex-col relative overflow-hidden">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/15 pb-4 mb-4 gap-4">
              <div className="flex items-center space-x-2">
                <FolderOpen className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Flutter Project Files Explorer</h3>
                  <span className="text-[10px] text-white/40 block font-mono">Prised native directories & Dart class maps</span>
                </div>
              </div>
              
              {/* Copy file button */}
              <button
                onClick={handleCopyCode}
                className="bg-white/5 border border-white/15 hover:border-white text-white font-mono text-[10.5px] p-2 px-4 rounded-xl flex items-center space-x-2 shrink-0 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied code!' : 'Copy active Code'}</span>
              </button>
            </div>

            {/* Directory file selector row */}
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(FLUTTER_FILES).map((fName) => {
                const isActive = selectedFile === fName;
                return (
                  <button
                    key={fName}
                    onClick={() => setSelectedFile(fName)}
                    className={`text-[9.5px] font-mono p-1.5 px-3 rounded-lg flex items-center space-x-1.5 transition ${
                      isActive 
                        ? 'bg-[#1e1b4b] text-indigo-300 border border-indigo-500/30 font-bold'
                        : 'bg-white/5 text-white/50 border border-transparent hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <FileCode className="w-3 h-3 text-white/40" />
                    <span>{fName}</span>
                  </button>
                );
              })}
            </div>

            {/* Live editor highlighted viewer block */}
            <div className="flex-1 bg-[#020205] border border-white/5 rounded-2xl p-4 text-left font-mono text-xs overflow-y-auto leading-relaxed max-h-[480px]">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-400 block mb-3 border-b border-white/5 pb-2">
                PATH Reference: /lib/{FLUTTER_FILES[selectedFile].label}
              </span>
              <pre className="text-[11px] text-white/80 selection:bg-indigo-600/40">
                <code>{FLUTTER_FILES[selectedFile].code}</code>
              </pre>
            </div>

            {/* APK / iOS Local system terminal prompts info box */}
            <div className="mt-4 bg-[#111] border border-white/5 p-4 rounded-2xl flex items-start space-x-3 text-left">
              <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">How do I compile this locally?</h4>
                <p className="text-[10px] text-white/50 leading-relaxed">
                  Export the files from the main project workspace. Inside your terminal root, run:
                </p>
                <div className="bg-black/60 p-2 rounded-xl text-[9.5px] text-emerald-400 font-mono mt-2 selection:bg-emerald-900/60 leading-normal">
                  $ flutter pub get<br />
                  $ flutter run -d device_id<br />
                  $ flutter build apk --release  # Android target<br />
                  $ flutter build ipa            # iOS target
                </div>
              </div>
            </div>

          </div>
        </div>

      </main>

      {/* Decorative clean footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-[10.5px] text-white/40 font-mono relative z-10 bg-[#0a0a0f]">
        PrepWise AI Flutter Native Compliance Workspace © 2026. All mock configurations synced.
      </footer>
    </div>
  );
}

// Inline custom mock views for subcomponents
function CircleAvatarMock({ char }: { char: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-white text-black font-bold flex items-center justify-center text-xs">
      {char}
    </div>
  );
}
