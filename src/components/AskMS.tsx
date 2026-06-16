import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ArrowRight, Sparkles, BrainCircuit, User, Loader2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { db, isFirebaseActive, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs, addDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';

interface Message {
  id?: string;
  userId: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}

interface AskMSProps {
  userId: string;
  userEmail: string;
}

export default function AskMS({ userId, userEmail }: AskMSProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { label: "Design Stripe API Scale", text: "Explain Stripe system design guidelines and how to design a high-availability API rate limiter." },
    { label: "STAR Story Audit", text: "Analyze a behavioral response regarding an engineering server outage. How can I map it to the STAR format?" },
    { label: "Resume ATS Keywords", text: "How do I optimize my resume for ATS tracking systems? What keywords are recruiters looking for in Cloud/Front-end roles?" },
    { label: "Technical Mock Prep", text: "Give me a mock technical coding interview scenario to analyze. What step-by-step algorithms procedure should I follow?" }
  ];

  // Load chat history
  useEffect(() => {
    async function loadChatMessages() {
      setLoadingHistory(true);
      if (isFirebaseActive && db && userId) {
        const path = 'ask_ms_chats';
        try {
          const q = query(
            collection(db, path),
            where('userId', '==', userId)
          );
          const snap = await getDocs(q);
          const loaded: Message[] = [];
          snap.forEach((docItem) => {
            const data = docItem.data();
            loaded.push({
              id: docItem.id,
              userId: data.userId,
              role: data.role,
              text: data.text,
              createdAt: data.createdAt
            });
          });
          // Sort client-side by createdAt asc to avoid index requirements
          loaded.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setMessages(loaded);
          // Sync to local storage as high-robustness backup cache
          localStorage.setItem(`ask_ms_chats_${userId}`, JSON.stringify(loaded));
        } catch (err) {
          console.error("Failed to load Ask MS chats from Firestore, rolling back to client cache:", err);
          loadFromLocalStorage();
        } finally {
          setLoadingHistory(false);
        }
      } else {
        loadFromLocalStorage();
        setLoadingHistory(false);
      }
    }

    loadChatMessages();
  }, [userId]);

  const loadFromLocalStorage = () => {
    const localData = localStorage.getItem(`ask_ms_chats_${userId}`);
    if (localData) {
      try {
        setMessages(JSON.parse(localData));
      } catch {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const saveMessage = async (msg: Omit<Message, 'id'>) => {
    if (isFirebaseActive && db) {
      const path = 'ask_ms_chats';
      try {
        const docRef = await addDoc(collection(db, path), msg);
        return { ...msg, id: docRef.id };
      } catch (err) {
        console.error("Failed to add Ask MS chat doc in Firestore:", err);
        // Fall back to local saving
        return saveToLocal(msg);
      }
    } else {
      return saveToLocal(msg);
    }
  };

  const saveToLocal = (msg: Omit<Message, 'id'>) => {
    const newMsg = { ...msg, id: Math.random().toString(36).substr(2, 9) };
    const list = [...messages, newMsg];
    localStorage.setItem(`ask_ms_chats_${userId}`, JSON.stringify(list));
    return newMsg;
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      userId,
      role: 'user',
      text: textToSend.trim(),
      createdAt: new Date().toISOString()
    };

    setInputText('');
    setLoading(true);

    // Save user message in state and storage
    const savedUserMsg = await saveMessage(userMsg);
    setMessages(prev => [...prev, savedUserMsg]);

    const activeHistory = [...messages, savedUserMsg];

    try {
      const payloadMessages = activeHistory.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/ask-ms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: payloadMessages })
      });

      const data = await res.json();
      
      const modelMsg: Message = {
        userId,
        role: 'model',
        text: data.text || "I was unable to analyze that query. Please rephrase your topic.",
        createdAt: new Date().toISOString()
      };

      const savedModelMsg = await saveMessage(modelMsg);
      setMessages(prev => [...prev, savedModelMsg]);
      
      // Update local storage representation for robust persistence fallback
      localStorage.setItem(`ask_ms_chats_${userId}`, JSON.stringify([...activeHistory, savedModelMsg]));

    } catch (err) {
      console.error("Failed to fetch response from Ask MS endpoint:", err);
      const errorMsg: Message = {
        userId,
        role: 'model',
        text: "My neural system encountered a connection lag. Let me simulate a brief check: please verify your internet parameters or reload.",
        createdAt: new Date().toISOString()
      };
      const savedErrorMsg = await saveMessage(errorMsg);
      setMessages(prev => [...prev, savedErrorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearConversation = async () => {
    if (messages.length === 0) return;
    if (!confirm("Are you sure you want to clear your current conversation history with Ask MS?")) return;

    setLoading(true);
    if (isFirebaseActive && db) {
      const path = 'ask_ms_chats';
      try {
        const q = query(collection(db, path), where('userId', '==', userId));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.forEach((docItem) => {
          batch.delete(docItem.ref);
        });
        await batch.commit();
      } catch (err) {
        console.error("Failed to hard empty Firestore Ask MS conversation:", err);
      }
    }
    
    // Clear local storage regardless
    localStorage.removeItem(`ask_ms_chats_${userId}`);
    setMessages([]);
    setLoading(false);
  };

  return (
    <div id="ask-ms-root" className="max-w-4xl mx-auto space-y-8 font-sans text-left selection:bg-white selection:text-black">
      
      {/* Decorative Editorial Header */}
      <div className="border border-white/10 bg-[#0c0c0e] p-8 relative overflow-hidden rounded-2xl shadow-xl">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BrainCircuit className="w-24 h-24 text-white" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#6366f1] font-mono font-bold block">PrepWise Conversational Advisor</span>
            <span className="text-[9px] bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30 font-mono font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Ask MS</span>
          </div>
          <h2 className="text-2xl sm:text-3.5xl font-sans font-extrabold tracking-tight text-[#F8FAFC]">
            Ask MS &mdash; Career & Technical Mentor
          </h2>
          <p className="text-[#CBD5E1] font-light text-xs max-w-xl leading-relaxed">
            Get instant strategic alignment audits. Contrast system design models, calibrate your technical language precision, parse behavior stories, or resolve mock strategy dilemmas in real-time.
          </p>
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Suggestion Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border border-white/10 p-5 space-y-4 rounded-2xl bg-[#0c0c0e] shadow-md">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#F8FAFC]">Quick Inquiries</span>
            </div>
            <p className="text-[10px] text-[#94A3B8] leading-relaxed font-light">
              Submit pre-validated analytical requests to train your response flow:
            </p>
            <div className="space-y-2 pt-2">
              {suggestionChips.map((chip, i) => (
                <button
                  key={i}
                  id={`chip-suggestion-${i}`}
                  onClick={() => handleSendMessage(chip.text)}
                  disabled={loading}
                  className="w-full text-left p-3.5 bg-white/[0.01] hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all rounded-xl text-[11px] leading-snug text-[#CBD5E1] shrink-0 select-none block cursor-pointer"
                >
                  <span className="font-bold block text-white mb-1 truncate">{chip.label}</span>
                  <span className="text-[#94A3B8] text-[9.5px] line-clamp-2 leading-relaxed">{chip.text}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-clear-conversation"
            onClick={clearConversation}
            disabled={messages.length === 0 || loading}
            className="w-full py-3 px-4 bg-transparent border border-red-500/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/5 transition text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-2 rounded-xl cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Chat Board</span>
          </button>
        </div>

        {/* Chat Feed Area */}
        <div className="lg:col-span-3 border border-white/10 bg-[#0c0c0e] flex flex-col h-[560px] rounded-2xl relative overflow-hidden shadow-2xl">
          
          {/* Feed Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#121216]">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6366f1] animate-pulse"></span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#94A3B8]">Ask MS Intelligence Loop</span>
            </div>
            {messages.length > 0 && (
              <span className="text-[9px] font-mono text-[#94A3B8]/60">{messages.length} messages</span>
            )}
          </div>

          {/* Loading Indicator or empty banner */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
            {loadingHistory ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#94A3B8]">Syncing chat ledger...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center rounded-xl text-indigo-500">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold tracking-tight text-white uppercase">Initialize Advisory Board</h4>
                  <p className="text-xs text-[#94A3B8] max-w-sm font-light">
                    Ask any query regarding architecture scale trade-offs, STAR formatting metrics, or career trajectory positioning. Select a chip to start.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role !== 'user' && (
                        <div className="w-8 h-8 rounded-lg border border-indigo-500/30 bg-[#6366f1]/10 flex items-center justify-center text-[10.5px] font-bold text-[#6366f1] shrink-0 font-mono shadow-inner">
                          MS
                        </div>
                      )}

                      <div className={`max-w-[85%] rounded-2xl p-5 shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-[#6366f1] text-white border border-indigo-600'
                          : 'bg-white/[0.03] border border-white/10 text-[#F8FAFC]'
                      }`}>
                        
                        {/* Author info header */}
                        <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest leading-none mb-2.5 border-b pb-1.5 opacity-60 border-white/5">
                          <span>{msg.role === 'user' ? 'Applicant Profile' : 'Mentor (Ask MS)'}</span>
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>

                        {/* Text / Markdown Render */}
                        {msg.role === 'user' ? (
                          <p className="text-xs font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div className="markdown-body text-xs font-light leading-relaxed space-y-3 prose prose-invert max-w-none text-[#CBD5E1] select-text">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        )}

                      </div>

                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-[10px] font-bold text-[#94A3B8] shrink-0 font-mono shadow-inner">
                          PC
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {loading && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-lg border border-indigo-500/30 bg-[#6366f1]/10 flex items-center justify-center text-[10.5px] font-bold text-[#6366f1] shrink-0 font-mono">
                      MS
                    </div>
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 max-w-[85%] flex items-center space-x-3 shadow-md">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#94A3B8]">Synthesizing narrative path...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Feed Input Area */}
          <div className="p-4 border-t border-white/10 bg-[#0e0e11]">
            <form
              id="ask-ms-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              className="flex items-center space-x-3"
            >
              <input
                id="ask-ms-input"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading || loadingHistory}
                className="flex-1 bg-black border border-white/10 focus:border-white pl-4 pr-4 py-3 text-xs focus:outline-none transition-all text-[#F8FAFC] placeholder-white/20 rounded-lg h-11"
                placeholder={loading ? "Waiting for response..." : "Ask MS about STAR format, system design, Amazon, Stripe guidelines..."}
                required
              />
              <button
                id="btn-ask-ms-submit"
                type="submit"
                disabled={loading || loadingHistory || !inputText.trim()}
                className="px-4 py-3 bg-[#6366f1] hover:bg-indigo-555 disabled:bg-[#6366f1]/40 text-white font-bold transition flex items-center justify-center space-x-1.5 h-11 shrink-0 rounded-lg cursor-pointer active:scale-95"
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
