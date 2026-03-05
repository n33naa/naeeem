
import React, { useState, useEffect, useRef } from 'react';
import { 
  PenTool, Loader2, CheckCircle2, Sparkles, 
  ArrowRight, Clipboard, BookTemplate, X, Mail, FileText, 
  Briefcase, Check, ShieldCheck, Target, Zap, 
  TrendingUp, Volume2, Mic, Trash2, 
  Smile, Share2, Quote, AlertCircle, Download, Wand2, Maximize2, Ghost,
  Layers, MessageSquare, ListCheck, Activity, BarChart3, Languages, History, Diff
} from 'lucide-react';
import { correctWriting, rephraseSentence, generateWritingPrompt } from '../services/geminiService';
import { WritingCorrection, WritingPrompt, RephraseResult } from '../types';

interface WritingTemplate {
  id: string; title: string; description: string; icon: any; category: string; content: string;
}

const WRITING_TEMPLATES: WritingTemplate[] = [
  { id: 'formal-email', title: 'Formal Email', description: 'Business communication.', icon: Mail, category: 'Business', content: `Subject: Project Update\n\nDear [Name],\n\nI hope you are well. I am writing to update you on the current progress of our collaboration...` },
  { id: 'job-application', title: 'Cover Letter', description: 'Job seeker intro.', icon: Briefcase, category: 'Career', content: `Dear Hiring Manager,\n\nI am writing to express my enthusiastic interest in the position...` },
  { id: 'essay', title: 'Academic Essay', description: 'Standard academic structure.', icon: FileText, category: 'Academic', content: `Introduction\n\nThe complex interplay between [Topic A] and [Topic B] has long been a subject of critical analysis...` },
  { id: 'creative-story', title: 'Short Story', description: 'Creative narrative.', icon: Sparkles, category: 'Creative', content: `The sun began to set behind the jagged mountains, casting long, purple shadows across the valley. Elara stood at the edge of the cliff, holding the ancient map...` },
  { id: 'tech-report', title: 'Technical Report', description: 'Formal technical analysis.', icon: Activity, category: 'Technical', content: `Executive Summary\n\nThis report analyzes the performance metrics of the new system architecture implemented in Q3...` },
  { id: 'social-post', title: 'Social Media', description: 'Engaging short content.', icon: Share2, category: 'Marketing', content: `🚀 Big news! We're thrilled to announce the launch of our latest feature. Check it out and let us know what you think! #Innovation #TechUpdate` }
];

const WritingView: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [correction, setCorrection] = useState<WritingCorrection | null>(null);
  const [rephraseResult, setRephraseResult] = useState<RephraseResult | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<WritingPrompt | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'correction' | 'comparison' | 'insights' | 'vocabulary' | 'advanced' | 'rephrase'>('correction');
  const [writingTone, setWritingTone] = useState('Professional');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [rephrasing, setRephrasing] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  useEffect(() => {
    const saved = localStorage.getItem('elx_draft');
    if (saved) setText(saved);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText(prev => prev + ' ' + event.results[i][0].transcript);
          }
        }
      };
      
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('elx_draft', text);
  }, [text]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || text.length < 5) return;
    setLoading(true);
    try {
      const result = await correctWriting(`[Tone: ${writingTone}] ${text}`);
      setCorrection(result);
      setActiveTab('correction');
      if (window.innerWidth < 1024) {
         setTimeout(() => {
            const el = document.getElementById('analysis-results');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
         }, 300);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRephrase = async () => {
    if (!text.trim()) return;
    setRephrasing(true);
    setActiveTab('rephrase');
    try {
      const result = await rephraseSentence(text);
      setRephraseResult(result);
    } catch (error) {
      console.error(error);
    } finally {
      setRephrasing(false);
    }
  };

  const handleGetPrompt = async (category?: string) => {
    setPromptLoading(true);
    setShowPrompts(true);
    try {
      const prompt = await generateWritingPrompt(category);
      setCurrentPrompt(prompt);
    } catch (error) {
      console.error(error);
    } finally {
      setPromptLoading(false);
    }
  };

  const applyUpgrade = (original: string, upgrade: string) => {
    const escaped = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    setText(prev => prev.replace(regex, upgrade));
  };

  const speak = (content: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (content?: string) => {
    const textToCopy = content || correction?.corrected || text;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getFontSize = (txt: string = "") => {
    if (txt.length > 500) return "text-sm md:text-base";
    if (txt.length > 200) return "text-base md:text-lg";
    if (txt.length > 100) return "text-lg md:text-xl";
    if (txt.length > 50) return "text-xl md:text-2xl";
    return "text-2xl md:text-3xl";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32 pt-2 px-2">
      
      {!isFocusMode && (
        <div className="text-center space-y-4 px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900/40 text-cyan-400 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
             <Zap className="w-3 h-3 fill-current" /> Galactic Draft Console
          </div>
          <h2 className="luxury-text text-3xl md:text-7xl brand-gradient font-black tracking-tighter uppercase leading-none">The Refiner</h2>
          <div className="flex flex-wrap justify-center gap-3 md:gap-6 text-white/30 mono-text text-[7px] md:text-[8px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">Words: <span className="text-cyan-400">{wordCount}</span></span>
            <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">Chars: <span className="text-purple-400">{charCount}</span></span>
          </div>
        </div>
      )}

      {showTemplates && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="glass w-full max-w-4xl rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-2xl md:text-3xl font-black luxury-text text-white">Linguistic Blueprints</h3>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1">Select structural base</p>
               </div>
               <button onClick={() => setShowTemplates(false)} className="p-3 md:p-4 glass rounded-2xl text-white/40 hover:text-white transition-all"><X /></button>
            </div>
            <div className="p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 overflow-y-auto custom-scrollbar">
              {WRITING_TEMPLATES.map(tpl => (
                <button key={tpl.id} onClick={() => { setText(tpl.content); setShowTemplates(false); }} className="group p-6 md:p-8 glass rounded-[2rem] text-left hover:bg-white/5 transition-all border border-white/5 hover:border-cyan-500/30">
                   <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                      <tpl.icon className="w-6 h-6" />
                   </div>
                   <h4 className="text-lg md:text-xl font-black mb-1 text-white uppercase">{tpl.title}</h4>
                   <p className="text-[8px] text-white/40 font-black uppercase tracking-widest mb-3">{tpl.category}</p>
                   <p className="text-[10px] md:text-xs text-white/20 font-medium leading-relaxed line-clamp-3">{tpl.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">
        
        {/* Editor Area */}
        <div className={`lg:col-span-6 space-y-6 ${isFocusMode ? 'lg:col-span-12' : ''} transition-all duration-700`}>
          <div className="glass rounded-[2rem] md:rounded-[4rem] p-5 md:p-10 shadow-2xl border border-white/10 space-y-6 md:space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px] pointer-events-none"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowTemplates(true)} className="p-3 md:p-4 glass text-white/60 rounded-xl md:rounded-2xl hover:bg-white/5 active:scale-90 transition-all border border-white/5" title="Templates"><BookTemplate className="w-5 h-5" /></button>
                <button onClick={() => handleGetPrompt()} className="p-3 md:p-4 glass text-cyan-400 rounded-xl md:rounded-2xl hover:bg-cyan-500/10 active:scale-90 transition-all border border-cyan-500/20" title="Writing Prompts"><Target className="w-5 h-5" /></button>
                <button onClick={toggleListening} className={`p-3 md:p-4 glass rounded-xl md:rounded-2xl active:scale-90 transition-all border border-white/5 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse border-red-500/30' : 'text-white/60 hover:bg-white/5'}`} title="Voice Dictation"><Mic className="w-5 h-5" /></button>
                <button onClick={handleRephrase} disabled={rephrasing || !text.trim()} className="p-3 md:p-4 glass text-purple-400 rounded-xl md:rounded-2xl hover:bg-purple-500/10 active:scale-90 transition-all border border-purple-500/20 disabled:opacity-20" title="Rephrase Sentence"><Languages className="w-5 h-5" /></button>
                <button onClick={() => setText('')} className="p-3 md:p-4 glass text-white/60 rounded-xl md:rounded-2xl hover:bg-red-500/10 hover:text-red-500 active:scale-90 transition-all border border-white/5" title="Clear All"><Trash2 className="w-5 h-5" /></button>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-[calc(100vw-60px)] md:max-w-none">
                {['Professional', 'Casual', 'Academic'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setWritingTone(t)}
                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${writingTone === t ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/30 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-[1.5rem] md:rounded-[2.5rem] blur opacity-5 group-focus-within:opacity-20 transition-all"></div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Start typing your English draft..."
                className="relative w-full h-[300px] md:h-[500px] bg-slate-900/50 rounded-[1.5rem] md:rounded-[2.5rem] p-6 md:p-12 text-lg md:text-2xl font-bold outline-none border border-white/5 focus:border-cyan-500/30 transition-all resize-none text-white custom-scrollbar"
              />
              <button onClick={() => setIsFocusMode(!isFocusMode)} className="absolute bottom-4 right-4 md:bottom-6 md:right-6 p-3 md:p-4 glass rounded-xl md:rounded-2xl text-white/20 hover:text-cyan-400 transition-all">
                {isFocusMode ? <Maximize2 className="w-5 h-5" /> : <Ghost className="w-5 h-5" />}
              </button>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading || text.length < 5}
              className="w-full py-6 md:py-10 bg-white text-black rounded-[1.5rem] md:rounded-[3rem] font-black uppercase text-[10px] md:text-xs tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4 disabled:opacity-20 hover:bg-cyan-400"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5 md:w-6 md:h-6" /> : <Wand2 className="w-5 h-5 md:w-6 md:h-6" />}
              Refine Language
            </button>
          </div>
        </div>

        {/* AI Analysis Area */}
        {!isFocusMode && (
          <div id="analysis-results" className="lg:col-span-6 flex flex-col space-y-6 md:space-y-8 h-full min-h-[500px] lg:min-h-0 transition-all duration-700">
            <div className="glass rounded-[2rem] md:rounded-[4rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden h-full">
                
                <div className="flex bg-white/5 border-b border-white/5 p-1.5 md:p-2 overflow-x-auto no-scrollbar scroll-smooth">
                  {[
                    { id: 'correction', label: 'Master', icon: CheckCircle2 },
                    { id: 'comparison', label: 'Matrix', icon: Diff },
                    { id: 'rephrase', label: 'Styles', icon: Languages },
                    { id: 'insights', label: 'Logic', icon: AlertCircle },
                    { id: 'vocabulary', label: 'Upgrades', icon: TrendingUp },
                    { id: 'advanced', label: 'Profile', icon: Activity }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 min-w-[70px] md:min-w-[90px] py-4 md:py-5 flex flex-col items-center justify-center gap-1.5 md:gap-2 text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all rounded-xl md:rounded-2xl ${activeTab === tab.id ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white'}`}
                    >
                      <tab.icon className="w-4 h-4 md:w-5 md:h-5" /> {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 p-6 md:p-14 overflow-y-auto custom-scrollbar">
                  {!correction && !loading ? (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 md:py-20 space-y-6 md:space-y-10">
                        <div className="relative">
                           <div className="absolute -inset-8 md:-inset-10 bg-cyan-500/10 blur-3xl rounded-full"></div>
                           <PenTool className="w-16 h-16 md:w-20 md:h-20 text-white/5 relative" />
                        </div>
                        <div className="space-y-2">
                           <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Analysis Chamber Ready</p>
                           <p className="text-[10px] md:text-xs font-bold text-white/10">Input text to sync feedback</p>
                        </div>
                      </div>
                  ) : loading ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-8 md:space-y-10 py-12 md:py-20">
                        <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
                        <div className="text-center space-y-2">
                           <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 animate-pulse">Computing Matrix...</p>
                        </div>
                      </div>
                  ) : (
                      <div className="animate-in fade-in duration-500 space-y-8 md:space-y-10">
                        
                        {activeTab === 'rephrase' && (
                          <div className="space-y-6">
                            <div className="bg-purple-500/5 border border-purple-500/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-center">
                               <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Style Variations</p>
                               <p className="text-[9px] md:text-[10px] text-white/30 mt-1 uppercase">Rephrasing your current draft</p>
                            </div>
                            {rephrasing ? (
                              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                <p className="text-[8px] font-black uppercase tracking-widest text-purple-400">Morphing Text...</p>
                              </div>
                            ) : !rephraseResult ? (
                              <div className="py-20 text-center text-white/20 italic text-xs">Click the rephrase icon in the editor to see variations.</div>
                            ) : (
                              <div className="grid grid-cols-1 gap-4">
                                {rephraseResult.variations.map((v, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => setText(v.text)}
                                    className="w-full text-left glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 hover:bg-white/5 transition-all group"
                                  >
                                    <div className="flex justify-between items-center mb-3">
                                      <span className="px-3 py-1 bg-white/5 rounded-full text-[7px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/20">{v.tone}</span>
                                      <ArrowRight className="w-4 h-4 text-white/10 group-hover:text-purple-400 transition-all" />
                                    </div>
                                    <p className="text-sm md:text-base font-bold text-white leading-relaxed">{v.text}</p>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'correction' && (
                          <div className="space-y-6 md:space-y-8">
                              <div className="flex justify-between items-center">
                                <span className="flex items-center gap-2 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                   <ShieldCheck className="w-3.5 h-3.5" /> Final Refinement
                                </span>
                                <div className="flex gap-2">
                                    <button onClick={() => speak(correction.corrected)} className="p-3 md:p-4 glass rounded-xl md:rounded-2xl text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all border border-white/5"><Volume2 className="w-5 h-5" /></button>
                                    <button onClick={() => copyToClipboard()} className="p-3 md:p-4 glass rounded-xl md:rounded-2xl text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all border border-white/5">
                                      {copied ? <Check className="w-5 h-5" /> : <Clipboard className="w-5 h-5" />}
                                    </button>
                                </div>
                              </div>
                              <div className="p-8 md:p-10 bg-white/5 text-white rounded-[2rem] md:rounded-[3rem] shadow-2xl relative border border-white/10">
                                <Quote className="absolute -top-3 -left-3 md:-top-4 md:-left-4 w-10 h-10 md:w-12 md:h-12 text-cyan-500 opacity-20" />
                                <p className={`font-bold leading-relaxed relative z-10 ${getFontSize(correction.corrected)}`}>{correction.corrected}</p>
                              </div>
                              <div className="p-6 md:p-8 glass rounded-[1.5rem] md:rounded-[2rem] border border-cyan-500/10">
                                <p className="text-[7px] md:text-[8px] font-black text-cyan-400 uppercase tracking-[0.3em] mb-2 flex items-center gap-2"><Activity className="w-3 h-3" /> Linguistic Flow</p>
                                <p className="text-xs md:text-sm font-bold text-white/60 leading-relaxed italic">"{correction.flowFeedback}"</p>
                              </div>
                          </div>
                        )}

                        {activeTab === 'comparison' && (
                          <div className="space-y-10 md:space-y-12 animate-in slide-in-from-bottom-5">
                             <div className="space-y-4">
                                <h5 className="text-[10px] md:text-[12px] font-black text-white/20 uppercase tracking-[0.5em] ml-3">Original Protocol (Draft)</h5>
                                <div className="p-10 md:p-16 glass bg-red-500/5 border border-red-500/10 rounded-[2.5rem] md:rounded-[4rem] opacity-60">
                                   <p className={`font-bold line-through text-white/60 whitespace-pre-wrap leading-relaxed ${getFontSize(correction.original)}`}>{correction.original}</p>
                                </div>
                             </div>
                             
                             <div className="flex justify-center relative">
                                <div className="absolute inset-0 flex items-center"><div className="w-full h-px bg-white/5"></div></div>
                                <div className="w-14 h-14 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-black shadow-2xl relative z-10 border-4 border-slate-950">
                                   <ArrowRight className="w-8 h-8 md:w-10 md:h-10 rotate-90" />
                                </div>
                             </div>

                             <div className="space-y-4">
                                <h5 className="text-[10px] md:text-[12px] font-black text-emerald-400 uppercase tracking-[0.5em] ml-3">Optimized Link (Basic Fixes)</h5>
                                <div className="p-10 md:p-16 glass bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] md:rounded-[4rem]">
                                   <p className={`font-black text-white whitespace-pre-wrap leading-relaxed ${getFontSize(correction.basicCorrection)}`}>{correction.basicCorrection}</p>
                                </div>
                             </div>
                          </div>
                        )}

                        {activeTab === 'insights' && (
                          <div className="space-y-4 md:space-y-6">
                              {(!correction.errors || correction.errors.length === 0) ? (
                                <div className="p-10 text-center space-y-4">
                                   <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />
                                   <p className="text-xs font-black uppercase text-white/40 tracking-widest">Perfect Protocol - No Errors Detected</p>
                                </div>
                              ) : (
                                correction.errors.map((err, i) => (
                                  <div key={i} className="glass border border-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem]">
                                    <div className="flex justify-between items-start mb-4 md:mb-6">
                                        <div className="space-y-1">
                                           <p className="text-red-400 font-black text-lg md:text-xl line-through opacity-40 italic">"{err.error}"</p>
                                           <span className="px-2.5 py-0.5 bg-red-500/10 text-red-500 rounded-full text-[6px] md:text-[7px] font-black uppercase tracking-widest border border-red-500/20">{err.type}</span>
                                        </div>
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 shrink-0">
                                           <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />
                                        </div>
                                    </div>
                                    <p className="text-xs md:text-sm text-white/70 font-bold leading-relaxed">{err.explanation}</p>
                                  </div>
                                ))
                              )}
                          </div>
                        )}

                        {activeTab === 'vocabulary' && (
                          <div className="space-y-4 md:space-y-6">
                              <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 md:p-6 rounded-xl md:rounded-2xl text-center">
                                 <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest">Lexical Upgrades</p>
                                 <p className="text-[9px] md:text-[10px] text-white/30 mt-1 uppercase">Click suggestion to replace word</p>
                              </div>
                              {(!correction.vocabularyUpgrades || correction.vocabularyUpgrades.length === 0) ? (
                                <div className="p-10 text-center text-white/20 italic text-xs">No advanced upgrades suggested.</div>
                              ) : (
                                correction.vocabularyUpgrades.map((upg, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => applyUpgrade(upg.original, upg.upgrade)}
                                    className="w-full text-left glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 flex items-center justify-between gap-4 hover:bg-white/5 transition-all active:scale-[0.98] group"
                                  >
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <span className="text-white/20 line-through font-bold text-xs md:text-sm truncate">{upg.original}</span>
                                            <ArrowRight className="w-3 h-3 text-white/10" />
                                            <span className="text-xl md:text-2xl font-black text-cyan-400 group-hover:scale-105 transition-all">{upg.upgrade}</span>
                                        </div>
                                        <p className="text-[9px] md:text-[10px] text-white/40 font-bold leading-relaxed">{upg.reason}</p>
                                      </div>
                                      <Zap className="w-4 h-4 text-cyan-500 shrink-0 opacity-20 group-hover:opacity-100 transition-all" />
                                  </button>
                                ))
                              )}
                          </div>
                        )}

                        {activeTab === 'advanced' && (
                          <div className="space-y-6 md:space-y-8">
                             <div className="p-8 md:p-10 glass bg-white/5 rounded-[2rem] md:rounded-[3rem] border border-white/10 space-y-8 relative overflow-hidden">
                                <h4 className="text-xl md:text-2xl font-black luxury-text text-white uppercase tracking-tight flex items-center gap-3"><BarChart3 className="text-cyan-400" /> Linguistic Stats</h4>
                                
                                <div className="space-y-6">
                                   <div className="space-y-2">
                                      <div className="flex justify-between text-[8px] md:text-[9px] font-black text-white/30 uppercase tracking-widest">
                                         <span>CEFR Level</span>
                                         <span className="text-cyan-400">{correction.cefrLevel}</span>
                                      </div>
                                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5">
                                         <div className="h-full bg-cyan-500 rounded-full" style={{ width: correction.cefrLevel.includes('C') ? '90%' : correction.cefrLevel.includes('B') ? '60%' : '30%' }}></div>
                                      </div>
                                   </div>

                                   <div className="grid grid-cols-2 gap-4">
                                      <div className="p-4 md:p-6 glass rounded-2xl border border-white/5 text-center space-y-1">
                                         <p className="text-[7px] md:text-[8px] font-black text-white/20 uppercase">Atmosphere</p>
                                         <p className="text-sm md:text-lg font-black text-purple-400 uppercase">{correction.tone || writingTone}</p>
                                      </div>
                                      <div className="p-4 md:p-6 glass rounded-2xl border border-white/5 text-center space-y-1">
                                         <p className="text-[7px] md:text-[8px] font-black text-white/20 uppercase">Complexity</p>
                                         <p className="text-sm md:text-lg font-black text-emerald-400 uppercase">Optimal</p>
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button onClick={() => copyToClipboard(correction.corrected)} className="py-5 md:py-6 glass rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 border border-white/5 hover:bg-white/5 transition-all">
                                   <Share2 className="w-5 h-5 text-cyan-400" />
                                   <span className="text-[7px] md:text-[8px] font-black uppercase text-white/40 tracking-widest">Share Sync</span>
                                </button>
                                <button onClick={() => window.print()} className="py-5 md:py-6 glass rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 border border-white/5 hover:bg-white/5 transition-all">
                                   <Download className="w-5 h-5 text-purple-400" />
                                   <span className="text-[7px] md:text-[8px] font-black uppercase text-white/40 tracking-widest">Print PDF</span>
                                </button>
                             </div>
                          </div>
                        )}
                      </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>

      {showPrompts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="glass w-full max-w-2xl rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 md:p-10 border-b border-white/5 flex items-center justify-between shrink-0">
               <div>
                  <h3 className="text-2xl md:text-3xl font-black luxury-text text-white">Creative Spark</h3>
                  <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mt-1">Writing Prompts & Challenges</p>
               </div>
               <button onClick={() => setShowPrompts(false)} className="p-3 md:p-4 glass rounded-2xl text-white/40 hover:text-white transition-all"><X /></button>
            </div>
            <div className="p-8 md:p-14 space-y-8">
              {promptLoading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-6">
                  <div className="w-12 h-12 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-cyan-400">Summoning Inspiration...</p>
                </div>
              ) : currentPrompt ? (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-[7px] font-black uppercase tracking-widest border border-cyan-500/20">{currentPrompt.category}</span>
                      <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-[7px] font-black uppercase tracking-widest border border-purple-500/20">{currentPrompt.difficulty}</span>
                    </div>
                    <h4 className="text-2xl md:text-4xl font-black text-white leading-tight">{currentPrompt.title}</h4>
                    <p className="text-sm md:text-lg text-white/60 font-medium leading-relaxed">{currentPrompt.description}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => { setText(`Prompt: ${currentPrompt.title}\n\n`); setShowPrompts(false); }}
                      className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all"
                    >
                      Accept Challenge
                    </button>
                    <button 
                      onClick={() => handleGetPrompt()}
                      className="p-5 glass text-white/60 rounded-2xl hover:bg-white/5 transition-all"
                    >
                      <History className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center space-y-6">
                  <Target className="w-16 h-16 text-white/5 mx-auto" />
                  <button onClick={() => handleGetPrompt()} className="px-8 py-4 glass text-cyan-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 hover:text-black transition-all">Generate New Prompt</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { scroll-behavior: smooth; }
      `}</style>
    </div>
  );
};

export default WritingView;
