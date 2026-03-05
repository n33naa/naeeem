
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Loader2, Volume2, 
  Camera, ArrowRight, Scan, ChevronLeft, ChevronRight, Layers, Target,
  Zap, Brain, BookOpen, MessageSquare, Quote, Info, CheckCircle, Star, X, Clipboard,
  Box, Eye, Sparkles, Activity, PlusCircle
} from 'lucide-react';
import { translateWord, analyzeImage } from '../services/geminiService';
import { Flashcard } from '../types';

interface TranslateViewProps {
  onSaveToFlashcards: (card: Flashcard) => void;
}

const TranslateView: React.FC<TranslateViewProps> = ({ onSaveToFlashcards }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'text' | 'image'>('text');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const data = await translateWord(query.trim());
      setResults({ type: 'text', data });
    } catch (err) { 
      setError("Analysis interrupted. Please try again."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setResults(null);
    setError(null);
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const fullBase64 = reader.result as string;
      setImagePreview(fullBase64);
      const base64 = fullBase64.split(',')[1];
      try {
        const data = await analyzeImage(base64);
        setResults({ type: 'image', data });
      } catch (err) { 
        setError("Neural vision processing failed."); 
      } finally { 
        setLoading(false); 
      }
    };
    reader.readAsDataURL(file);
  };

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveObject = (obj: any) => {
    onSaveToFlashcards({ 
      id: Date.now().toString() + Math.random(), 
      word: obj.name, 
      meaning: obj.arabic, 
      examples: [obj.example?.english || ''], 
      level: 0, 
      nextReview: Date.now() 
    });
  };

  const handleSave = (item: any) => {
    if (!item) return;
    onSaveToFlashcards({ 
      id: Date.now().toString() + Math.random(), 
      word: item.word || query, 
      meaning: item.arabicMeaning || item.arabic || 'Unknown', 
      examples: Array.isArray(item.examples) ? item.examples.map((ex: any) => typeof ex === 'string' ? ex : ex.english) : [], 
      level: 0, 
      nextReview: Date.now() 
    });
  };

  const getFontSize = (word: string = "", isVision: boolean = false) => {
    const len = word.length;
    if (len > 15) return isVision ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl";
    if (len > 10) return isVision ? "text-3xl md:text-4xl" : "text-4xl md:text-5xl";
    return isVision ? "text-4xl md:text-5xl" : "text-5xl md:text-6xl";
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6 md:space-y-10 pb-32 pt-2 px-4"
    >
      
      {/* Search Input Section */}
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-center">
           <div className="bg-slate-900/50 theme-light:bg-black/5 p-1.5 rounded-2xl flex gap-1 border border-white/10 theme-light:border-black/5 w-full max-w-sm">
              <button onClick={() => { setViewMode('text'); setResults(null); }} className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'text' ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' : 'text-white/30 theme-light:text-black/30 hover:text-white theme-light:hover:text-black'}`}>
                 <Search className="w-4 h-4" /> Text
              </button>
              <button onClick={() => { setViewMode('image'); setResults(null); }} className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'image' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/30 theme-light:text-black/30 hover:text-white theme-light:hover:text-black'}`}>
                 <Scan className="w-4 h-4" /> Vision
              </button>
           </div>
        </div>

        {viewMode === 'text' ? (
          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onSubmit={handleTranslate} 
            className="relative group"
          >
            <div className="relative flex items-center glass border-white/10 theme-light:border-black/5 rounded-[2.5rem] p-2.5 shadow-2xl focus-within:border-cyan-500 transition-all">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full bg-transparent py-5 px-8 text-xl md:text-3xl outline-none text-white theme-light:text-black font-bold placeholder:text-white/5 theme-light:placeholder:text-black/5"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading} 
                className="p-5 bg-cyan-500 text-black rounded-2xl hover:bg-cyan-400 transition-all shrink-0"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
              </motion.button>
            </div>
          </motion.form>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={() => fileInputRef.current?.click()} 
            className="glass border-2 border-dashed border-white/5 theme-light:border-black/10 rounded-[3.5rem] p-16 text-center space-y-4 hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden group shadow-xl theme-light:shadow-black/5"
          >
             <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
             <div className="w-20 h-20 bg-indigo-600/20 theme-light:bg-indigo-600/10 text-indigo-400 theme-light:text-indigo-600 rounded-3xl flex items-center justify-center mx-auto relative z-10"><Camera className="w-10 h-10" /></div>
             <p className="text-[10px] font-black text-white/20 theme-light:text-black/20 uppercase tracking-[0.4em] relative z-10">Neural Vision Scan</p>
          </motion.div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-6"
          >
             <div className="w-14 h-14 border-4 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
             <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] animate-pulse">Syncing Matrix...</p>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md mx-auto p-10 glass rounded-3xl border border-red-500/20 text-center space-y-4"
          >
             <Info className="w-10 h-10 text-red-500 mx-auto" />
             <p className="text-white/60 font-bold">{error}</p>
          </motion.div>
        )}

        {/* Vision Result Mode */}
        {results && results.type === 'image' && results.data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Image Preview Area */}
                <div className="lg:col-span-5">
                   <div className="glass rounded-[3.5rem] p-4 border border-white/10 shadow-3xl sticky top-24">
                      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden">
                         <img src={imagePreview!} alt="Scan Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                         <div className="absolute top-6 left-6 flex items-center gap-3">
                            <div className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2">
                               <Scan className="w-4 h-4" /> Analyzed Context
                            </div>
                         </div>
                         <div className="absolute bottom-8 left-8 right-8 text-center space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Vision Metadata</p>
                            <p className="text-white font-bold text-xs uppercase opacity-80">{results.data.objects?.length || 0} Neural Entities Identified</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Identified Objects List */}
                <div className="lg:col-span-7 space-y-8">
                   <div className="space-y-2 mb-8">
                      <h2 className="luxury-text text-4xl md:text-5xl font-black text-white uppercase tracking-tighter brand-gradient">Scanned Nodes</h2>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Linguistic analysis of physical entities</p>
                   </div>

                   <div className="grid gap-6">
                      {results.data.objects?.map((obj: any, idx: number) => (
                         <motion.div 
                          key={idx} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-2xl"
                         >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 relative z-10">
                               <div className="space-y-4 flex-1">
                                  <div className="flex items-center gap-4">
                                     <span className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-400 flex items-center justify-center text-[10px] font-black border border-indigo-500/20">{idx + 1}</span>
                                     <div className="h-px w-12 bg-white/5"></div>
                                     <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{obj.phonetic}</span>
                                  </div>
                                  
                                  <div className="space-y-1 overflow-hidden">
                                     <h3 className={`font-black text-white uppercase tracking-tighter brand-gradient leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(obj.name, true)}`}>
                                        {obj.name}
                                     </h3>
                                     <p className="text-2xl md:text-3xl font-black text-indigo-400/60 text-right leading-none" dir="rtl">{obj.arabic}</p>
                                  </div>

                                  <p className="text-xs md:text-sm font-bold text-white/40 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4 py-1">
                                     "{obj.description}"
                                  </p>
                               </div>

                               <div className="flex md:flex-col gap-3 shrink-0">
                                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => speak(obj.name)} className="flex-1 md:flex-none p-5 glass rounded-2xl text-white/30 hover:text-indigo-400 hover:border-indigo-500/20 transition-all border border-white/5">
                                     <Volume2 className="w-6 h-6" />
                                  </motion.button>
                                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSaveObject(obj)} className="flex-1 md:flex-none p-5 bg-white text-black rounded-2xl hover:bg-indigo-400 transition-all shadow-lg">
                                     <PlusCircle className="w-6 h-6" />
                                  </motion.button>
                               </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                               <div className="flex items-center gap-3">
                                  <Activity className="w-4 h-4 text-emerald-400" />
                                  <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">In-Context Usage</span>
                               </div>
                               <div className="p-6 bg-slate-900/40 theme-light:bg-black/5 rounded-2xl border border-white/5 theme-light:border-black/5 space-y-2">
                                  <p className="text-sm md:text-base font-bold text-white theme-light:text-black italic leading-relaxed">"{obj.example?.english}"</p>
                                  <p className="text-[10px] text-white/20 theme-light:text-black/40 text-right" dir="rtl">{obj.example?.arabic}</p>
                               </div>
                            </div>
                         </motion.div>
                      ))}
                   </div>
                </div>
             </div>
          </motion.div>
        )}

        {/* Text Result Mode */}
        {results && results.type === 'text' && results.data && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
             {/* Summary Sidebar */}
             <div className="lg:col-span-4">
                <div className="glass rounded-[3.5rem] p-8 md:p-10 border border-white/10 flex flex-col justify-between min-h-[400px] shadow-3xl overflow-hidden">
                   <div className="space-y-8">
                      <div className="flex justify-between items-center">
                         <span className="px-4 py-1.5 bg-white/5 rounded-full text-[9px] font-black text-cyan-400 border border-white/10 uppercase tracking-widest">{results.data.cefrLevel || 'A1'}</span>
                         <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{results.data.partOfSpeech || 'Word'}</span>
                      </div>
                      <div className="space-y-3 overflow-hidden">
                         <h3 className={`font-black text-white uppercase tracking-tighter brand-gradient leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(results.data.word)}`}>
                           {results.data.word}
                         </h3>
                         <p className="mono-text text-white/40 text-xl tracking-widest truncate">{results.data.phonetic}</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => speak(results.data.word)} className="py-5 bg-white/5 text-cyan-400 rounded-2xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                         <Volume2 className="w-6 h-6" /> <span className="text-[9px] font-black uppercase">Listen</span>
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSave(results.data)} className="py-5 bg-cyan-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-400 transition-all">
                         Save Node
                      </motion.button>
                   </div>
                </div>
             </div>

             {/* Main Meaning & Examples */}
             <div className="lg:col-span-8 space-y-8">
                <div className="glass rounded-[3.5rem] p-12 md:p-16 border border-white/10 shadow-3xl space-y-12">
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] mb-4">Linguistic Bridge (Arabic)</p>
                     <div className="bg-white/5 theme-light:bg-black/5 p-10 rounded-[2.5rem] border border-white/5 theme-light:border-black/5 shadow-inner">
                        <p className="text-6xl md:text-8xl font-black text-white theme-light:text-black text-right leading-tight" dir="rtl">
                           {results.data.arabicMeaning || "Undefined Meaning"}
                        </p>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="flex items-center gap-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Practical Context</p>
                        <div className="h-px flex-1 bg-white/5"></div>
                     </div>
                     <div className="grid gap-6">
                        {results.data.examples && results.data.examples.length > 0 ? (
                          results.data.examples.map((ex: any, i: number) => (
                             <motion.div 
                              key={i} 
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="p-8 bg-slate-900/40 theme-light:bg-black/5 rounded-[2.5rem] border border-white/5 theme-light:border-black/5 group hover:bg-slate-900/60 theme-light:hover:bg-black/10 transition-all"
                             >
                                <div className="flex justify-between items-start gap-6 mb-6">
                                   <p className="text-2xl font-bold text-white theme-light:text-black italic leading-relaxed">"{ex.english}"</p>
                                   <motion.button whileTap={{ scale: 0.9 }} onClick={() => speak(ex.english)} className="p-4 glass rounded-2xl text-white/20 theme-light:text-black/20 hover:text-cyan-400 transition-all shrink-0 border border-white/5 theme-light:border-black/5"><Volume2 className="w-5 h-5" /></motion.button>
                                </div>
                                <p className="text-lg md:text-xl text-white/40 theme-light:text-black/60 text-right font-medium" dir="rtl">{ex.arabic}</p>
                             </motion.div>
                          ))
                        ) : (
                          <p className="text-white/20 text-xs italic">No examples found for this neural path.</p>
                        )}
                     </div>
                  </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .brand-gradient {
            background: linear-gradient(135deg, #22d3ee 0%, #a855f7 50%, #f472b6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </motion.div>
  );
};

export default TranslateView;
