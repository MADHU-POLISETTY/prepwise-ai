import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Home,
  Play,
  FileText,
  History,
  User as UserIcon,
  LogOut,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Subcomponents
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import InterviewSession from './components/InterviewSession';
import ResultsView from './components/ResultsView';
import HistoryDashboard from './components/HistoryDashboard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import ProfileView from './components/ProfileView';

// Firebase client definitions
import { auth, db, isFirebaseActive, handleFirestoreError, OperationType } from './lib/firebase';
import { Question, Answer, InterviewResult, User } from './types';

export default function App() {
  // Navigation tabs: 'landing', 'auth', 'dashboard', 'session', 'results', 'history', 'resume', 'profile'
  const [activeTab, setActiveTab] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auth States
  const [user, setUser] = useState<{ email: string; uid: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('p.jmanoj378@gmail.com'); // Defaulted to user email from metadata
  const [passwordInput, setPasswordInput] = useState('password123');
  const [authError, setAuthError] = useState('');
  const [authActionLoading, setAuthActionLoading] = useState(false);

  // Firestore/Session States
  const [interviews, setInterviews] = useState<InterviewResult[]>([]);
  const [activeResult, setActiveResult] = useState<InterviewResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  // Monitor Auth Changes
  useEffect(() => {
    let unsubscribe = () => {};

    if (isFirebaseActive && auth) {
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser && firebaseUser.email) {
          setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
          setActiveTab('dashboard');
        } else {
          setUser(null);
          setActiveTab('landing');
        }
        setAuthLoading(false);
      });
    } else {
      // Simulate local session check
      const localSession = localStorage.getItem('prepwise_session');
      if (localSession) {
        try {
          const parsed = JSON.parse(localSession);
          setUser({ email: parsed.email, uid: parsed.uid });
          setActiveTab('dashboard');
        } catch {
          setUser(null);
        }
      }
      setAuthLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // Fetch past evaluations whenever the user or tab updates
  useEffect(() => {
    if (!user) return;
    loadInterviews();
  }, [user, activeTab]);

  const loadInterviews = async () => {
    if (!user) return;

    if (isFirebaseActive && db) {
      const pathForGet = 'interviews';
      try {
        const q = query(
          collection(db, pathForGet),
          where('userId', '==', user.uid),
          orderBy('completedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const loaded: InterviewResult[] = [];
        querySnapshot.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            userId: data.userId,
            category: data.category,
            role: data.role,
            answers: data.answers || [],
            score: data.score || 0,
            communicationScore: data.communicationScore || 0,
            technicalScore: data.technicalScore || 0,
            confidenceScore: data.confidenceScore || 0,
            feedback: data.feedback || '',
            completedAt: data.completedAt || '',
          });
        });
        setInterviews(loaded);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, pathForGet);
      }
    } else {
      // Offline localstorage fetch
      const localJson = localStorage.getItem('prepwise_interviews');
      if (localJson) {
        try {
          const parsed = JSON.parse(localJson);
          const filtered = parsed.filter((item: any) => item.userId === user.uid);
          // sort descending by completedAt
          filtered.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
          setInterviews(filtered);
        } catch {
          setInterviews([]);
        }
      }
    }
  };

  // Auth Submissions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setAuthError('Please fill in all standard credentials fields.');
      return;
    }
    
    setAuthError('');
    setAuthActionLoading(true);

    if (isFirebaseActive && auth) {
      try {
        if (authMode === 'login') {
          await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        } else {
          await createUserWithEmailAndPassword(auth, emailInput, passwordInput);
        }
        // Auth observer handles tab redirection and state loading
      } catch (err: any) {
        console.error("Auth action failed:", err);
        if (err.code === 'auth/operation-not-allowed' || (err.message && err.message.includes('operation-not-allowed'))) {
          setAuthError('Email/Password provider is disabled in your Firebase console. Please go to Authentication -> Sign-in method and enable "Email/Password". Alternatively, use instant "Sign in with Google" below.');
        } else {
          setAuthError(err.message || 'Authentication unsuccessful. Use secure password rules.');
        }
      } finally {
        setAuthActionLoading(false);
      }
    } else {
      // Simulate local registration / login
      setTimeout(() => {
        const mockUid = `sim_user_${emailInput.replace(/[^a-zA-Z0-9]/g, '')}`;
        const mockUserObj = { email: emailInput, uid: mockUid };
        localStorage.setItem('prepwise_session', JSON.stringify(mockUserObj));
        setUser(mockUserObj);
        setActiveTab('dashboard');
        setAuthActionLoading(false);
      }, 800);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthActionLoading(true);
    if (isFirebaseActive && auth) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      } catch (err: any) {
        console.error("Google Authentication action failed:", err);
        setAuthError(err.message || 'Google Authentication unsuccessful.');
      } finally {
        setAuthActionLoading(false);
      }
    } else {
      // Simulate Google auth in local playground mode
      setAuthActionLoading(true);
      setTimeout(() => {
        const mockUid = `sim_user_google`;
        const mockUserObj = { email: 'p.jmanoj378@gmail.com', uid: mockUid };
        localStorage.setItem('prepwise_session', JSON.stringify(mockUserObj));
        setUser(mockUserObj);
        setActiveTab('dashboard');
        setAuthActionLoading(false);
      }, 800);
    }
  };

  const handleSignOut = async () => {
    if (isFirebaseActive && auth) {
      try {
        await signOut(auth);
        setActiveTab('landing');
      } catch (err) {
        console.error("Firebase SignOut error:", err);
      }
    } else {
      localStorage.removeItem('prepwise_session');
      setUser(null);
      setActiveTab('landing');
    }
    setMobileMenuOpen(false);
  };

  // Complete an interview session and submit results to evaluator proxy
  const handleInterviewSubmit = async (category: any, role: string, questions: Question[], answers: Answer[]) => {
    if (!user) return;

    try {
      const response = await fetch('/api/evaluate-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, role, answers }),
      });
      const data = await response.json();

      const newRecord: Omit<InterviewResult, 'id'> = {
        userId: user.uid,
        category,
        role,
        answers,
        score: data.score,
        communicationScore: data.communicationScore,
        technicalScore: data.technicalScore,
        confidenceScore: data.confidenceScore,
        feedback: data.feedback,
        completedAt: new Date().toISOString(),
      };

      if (isFirebaseActive && db) {
        const pathForAdd = 'interviews';
        try {
          const docRef = await addDoc(collection(db, pathForAdd), newRecord);
          const completeRecord: InterviewResult = {
            id: docRef.id,
            ...newRecord,
          };
          setActiveResult(completeRecord);
          // Seed active interviews state list
          setInterviews((prev) => [completeRecord, ...prev]);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, pathForAdd);
        }
      } else {
        // Local simulation storage
        const localId = `sim_val_${Date.now()}`;
        const completeRecord: InterviewResult = {
          id: localId,
          ...newRecord,
        };
        const currentLocal = localStorage.getItem('prepwise_interviews');
        const list = currentLocal ? JSON.parse(currentLocal) : [];
        list.push(completeRecord);
        localStorage.setItem('prepwise_interviews', JSON.stringify(list));
        
        setActiveResult(completeRecord);
        setInterviews((prev) => [completeRecord, ...prev]);
      }

      setActiveTab('results');
    } catch (err) {
      console.error("Evaluation response compilation failure:", err);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (isFirebaseActive && db) {
      const pathForDelete = `interviews/${id}`;
      try {
        await deleteDoc(doc(db, 'interviews', id));
        setInterviews((prev) => prev.filter((item) => item.id !== id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, pathForDelete);
      }
    } else {
      const currentLocal = localStorage.getItem('prepwise_interviews');
      if (currentLocal) {
        const list = JSON.parse(currentLocal);
        const filtered = list.filter((item: any) => item.id !== id);
        localStorage.setItem('prepwise_interviews', JSON.stringify(filtered));
        setInterviews((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  // Navigations hooks
  const startPrepFromCard = (category: any) => {
    setSelectedCategory(category);
    setActiveTab('session');
  };

  // Global Stat computations
  const totalPracticeCount = interviews.length;
  const aggregateScoreAvg = totalPracticeCount > 0
    ? Math.round(interviews.reduce((sum, item) => sum + item.score, 0) / totalPracticeCount)
    : 0;
  const lastPractisedScore = totalPracticeCount > 0 ? interviews[0].score : null;

  // Render auth loading spinner
  if (authLoading) {
    return (
      <div id="auth-loading-screen" className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center space-y-4 selection:bg-white selection:text-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">Loading digital workspace...</span>
      </div>
    );
  }

  // 1. LANDING PAGE
  if (activeTab === 'landing' && !user) {
    return <LandingPage onGetStarted={() => { setAuthMode('login'); setActiveTab('auth'); }} />;
  }

  // 2. AUTHENTICATION PAGES (LOGIN / REGISTRATION OVERLAYS)
  if (activeTab === 'auth' && !user) {
    return (
      <div id="auth-fullscreen-container" className="min-h-screen bg-[#050505] text-[#F5F5F5] flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="w-full max-w-md border border-white/10 rounded-none bg-[#111] p-8 space-y-8 relative z-10">
          
          <div className="text-center space-y-3">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-white">
              PrepWise <span className="font-sans font-bold text-xs bg-white text-black px-2.5 py-0.5 ml-1">AI</span>
            </h1>
            
            <h2 className="text-lg font-sans font-semibold text-white/80 pt-2">
              {authMode === 'login' ? 'Sign in to your Coach' : 'Create Practice Account'}
            </h2>
            <p className="text-white/50 text-[11px] font-sans">
              {authMode === 'login' ? "Access your saved interviews and resume analytical index." : "Register standard details to initialize personalized AI question generators."}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-5 pt-2">
            
            {/* Email Form */}
            <div>
              <label htmlFor="auth-email-id" className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Workspace Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                <input
                  id="auth-email-id"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 focus:border-white rounded-none pl-10 pr-4 py-3 text-sm font-sans focus:outline-none transition text-white placeholder-white/20"
                  placeholder="e.g., mail@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Form */}
            <div>
              <label htmlFor="auth-password-id" className="block text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-2">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
                <input
                  id="auth-password-id"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 focus:border-white rounded-none pl-10 pr-4 py-3 text-sm font-sans focus:outline-none transition text-white placeholder-white/20"
                  placeholder="Password (Min 6 chars)"
                  required
                />
              </div>
            </div>

            {authError && (
              <div id="auth-error-card" className="p-3 bg-red-550/10 border border-red-500/20 text-red-400 text-xs rounded-none flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={authActionLoading}
              className="w-full py-3.5 bg-white text-black font-bold uppercase tracking-[0.2em] text-xs hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2 rounded-none"
            >
              {authActionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <span>{authMode === 'login' ? 'Authenticate' : 'Initialize'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center justify-between my-4 pt-1">
            <span className="w-1/3 border-b border-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2">OR</span>
            <span className="w-1/3 border-b border-white/10" />
          </div>

          {/* Google Authentication */}
          <button
            id="btn-google-auth"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authActionLoading}
            className="w-full py-3.5 border border-white/20 hover:border-white text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-white/5 transition-all flex items-center justify-center space-x-2.5 rounded-none"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {/* Mode Switch triggers */}
          <div className="text-center pt-2 space-y-3">
            <div>
              <button
                id="btn-switch-auth-mode"
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                }}
                className="text-xs text-white/50 hover:text-white font-medium transition italic border-b border-white/15 pb-0.5"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>

            <div>
              <button
                id="btn-auth-back"
                type="button"
                onClick={() => setActiveTab('landing')}
                className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest transition"
              >
                Back to Homepage
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // APP WORKSPACE FOR SIGNED IN USERS (DASHBOARD GRID)
  return (
    <div id="prepwise-applet-container" className="min-h-screen bg-[#050505] text-[#F5F5F5] font-sans flex flex-col md:flex-row relative selection:bg-white selection:text-black">
      
      {/* Decorative Editorial Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:6rem_6rem] pointer-events-none" />

      {/* MOBILE HEADER RESPONSIVE TOGGLES */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#050505] relative z-30 w-full shrink-0">
        <div className="flex items-center space-x-3">
          <h1 className="text-lg font-sans font-bold tracking-tight text-white">
            PrepWise <span className="font-sans font-bold text-[10px] bg-white text-black px-1.5 py-0.5 ml-1">AI</span>
          </h1>
        </div>
        
        <button
          id="btn-toggle-mobile-menu"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 border border-white/20 text-white hover:bg-white hover:text-black transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* CORE SIDEBAR VIEWPORT */}
      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#050505] border-r border-white/10 shrink-0 z-20 transition-transform duration-300 transform md:transform-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between`}
      >
        <div className="space-y-12 p-8">
          
          {/* Logo brand */}
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-sans font-bold tracking-tight text-white">
              PrepWise <span className="font-sans font-bold text-xs bg-white text-black px-2 py-0.5 ml-1 select-none">AI</span>
            </h1>
          </div>

          {/* Navigation link sets */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-6 font-semibold">Principal</p>
            <nav className="space-y-5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Home },
                { id: 'interview-config', label: 'Interview Coach', icon: Play },
                { id: 'history', label: 'Histories & Logs', icon: History },
                { id: 'resume', label: 'Resume Analyzer', icon: FileText },
                { id: 'profile', label: 'Candidate Analytics', icon: UserIcon },
              ].map((link) => {
                const isSelected = activeTab === link.id || (link.id === 'interview-config' && activeTab === 'session');
                
                return (
                  <button
                    key={link.id}
                    id={`nav-link-${link.id}`}
                    onClick={() => {
                      setActiveTab(link.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-3 w-full text-left transition-all text-sm font-sans ${
                      isSelected
                        ? 'text-white translate-x-1 font-sans font-bold'
                        : 'text-white/50 hover:text-white hover:translate-x-1 font-sans font-medium'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white ml-auto"></span>}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Account panel bottom */}
        <div className="p-8 border-t border-white/5 space-y-5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-none bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white uppercase font-sans">
              {user?.email.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-0.5 truncate flex-1">
              <span className="block text-xs font-medium text-white truncate font-sans">{user?.email.split('@')[0]}</span>
              <span className="block text-[10px] text-white/40 truncate font-sans">{user?.email}</span>
            </div>
          </div>

          <button
            id="btn-sidebar-signout"
            onClick={handleSignOut}
            className="flex items-center justify-center space-x-2 w-full mt-2 py-2 px-3 border border-white/15 hover:border-white text-[10px] font-bold uppercase tracking-widest text-[#F5F5F5]/60 hover:text-white transition duration-300 rounded-none bg-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>

      {/* MAIN LAYOUT CANVAS CONTAINER */}
      <main id="app-canvas-container" className="flex-1 w-full p-8 sm:p-10 md:p-12 relative z-10 overflow-x-hidden min-h-screen">
        
        {/* Render pages depending on active navigation state */}
        <div className="animate-fade-in">
          
          {activeTab === 'dashboard' && user && (
            <Dashboard
              userEmail={user.email}
              totalInterviews={totalPracticeCount}
              averageScore={aggregateScoreAvg}
              lastScore={lastPractisedScore}
              onNavigate={setActiveTab}
              onStartInterview={startPrepFromCard}
            />
          )}

          {activeTab === 'interview-config' && user && (
            <InterviewSession
              initialCategory={null}
              onCancel={() => setActiveTab('dashboard')}
              onSubmit={handleInterviewSubmit}
            />
          )}

          {activeTab === 'session' && user && (
            <InterviewSession
              initialCategory={selectedCategory}
              onCancel={() => {
                setSelectedCategory(null);
                setActiveTab('dashboard');
              }}
              onSubmit={handleInterviewSubmit}
            />
          )}

          {activeTab === 'results' && activeResult && user && (
            <ResultsView
              result={activeResult}
              onDone={() => {
                setActiveResult(null);
                setSelectedCategory(null);
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'history' && user && (
            <HistoryDashboard
              interviewsList={interviews}
              onDeleteRecord={handleDeleteRecord}
              onSelectRecord={(record) => {
                setActiveResult(record);
                setActiveTab('results');
              }}
            />
          )}

          {activeTab === 'resume' && user && <ResumeAnalyzer />}

          {activeTab === 'profile' && user && (
            <ProfileView userEmail={user.email} interviewsList={interviews} />
          )}

        </div>

      </main>

    </div>
  );
}
