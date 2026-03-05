
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Brain, MessageSquareQuote, ChevronRight, ChevronLeft, 
  Volume2, Target, Rocket, Sparkles, 
  Timer, Flame, Crown, Shield, Users, Info, TrendingUp, MapPin,
  Activity, Globe, ShieldCheck, Heart, Share2, BarChart, AlertTriangle, RefreshCw,
  LayoutGrid, Key
} from 'lucide-react';
import { fetchSlangMatrix } from '../services/geminiService';
import { SlangWord } from '../types';

interface SlangViewProps {
  onStartExam: (phrases: string[]) => void;
}

const SlangView: React.FC<SlangViewProps> = ({ onStartExam }) => {
  const [level, setLevel] = useState<'Rookie' | 'Hustler' | 'OG'>('Rookie');
  const [phrases, setPhrases] = useState<SlangWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const levelInfo = {
    Rookie: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: Rocket, label: 'Street Rookie' },
    Hustler: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Flame, label: 'Urban Hustler' },
    OG: { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Crown, label: 'Linguistic OG' }
  };

  const loadSlangPack = async () => {
    setLoading(true);
    setError(null);
    if ((window as any).setStarSpeed) (window as any).setStarSpeed(35);

    try {
      const data = await fetchSlangMatrix(level);
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error("EMPTY_DATA");
      }
      setPhrases(data);
      setCurrentIndex(0);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("QUOTA")) {
        setError("QUOTA EXHAUSTED: Please wait or switch your API key.");
      } else {
        setError("NEURAL LINK FAILURE: Try refreshing the matrix.");
      }
    } finally {
      setLoading(false);
      if ((window as any).setStarSpeed) (window as any).setStarSpeed(4);
    }
  };

  useEffect(() => { loadSlangPack(); }, [level]);

  const speak = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
        <div className="relative">
           <div className={`w-28 h-28 border-8 border-white/5 rounded-full animate-spin ${levelInfo[level].color.replace('text', 'border-t')}`}></div>
           <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white/10 animate-pulse" />
        </div>
        <div className="text-center space-y-4">
          <h3 className={`mono-text font-black uppercase text-lg tracking-[0.5em] animate-pulse ${levelInfo[level].color}`}>Syncing {level}...</h3>
        </div>
      </div>
    );
  }

  if (error || phrases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 glass rounded-[3rem] border border-red-500/20 p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500" />
        <h3 className="text-xl font-black text-white uppercase">Matrix Disconnected</h3>
        <p className="text-white/40 text-[10px] uppercase font-black">{error || "No data found."}</p>
        <button onClick={() => loadSlangPack()} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all">Restart Sync</button>
      </div>
    );
  }

  const currentPhrase = phrases[currentIndex] || phrases[0];
  const InfoBox = levelInfo[level];

  // Logic to determine font size based on phrase length for the single-line requirement
  const phraseLength = currentPhrase?.phrase?.length || 0;
  const fontSizeClass = phraseLength > 15 
    ? "text-3xl md:text-4xl" 
    : phraseLength > 10 
    ? "text-4xl md:text-5xl" 
    : "text-5xl md:text-6xl";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-32 px-4 pt-4"
    >
      
      {/* Level Picker */}
      <div className="flex justify-center">
        <div className="bg-slate-900/50 p-1.5 rounded-2xl flex gap-1 border border-white/10 w-full max-w-sm">
          {(['Rookie', 'Hustler', 'OG'] as const).map(lvl => (
            <button 
              key={lvl} 
              onClick={() => setLevel(lvl)} 
              className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${level === lvl ? 'bg-white text-black shadow-lg' : 'text-white/30 hover:text-white'}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${level}-${currentIndex}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
             {/* Hero Section */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Term Column */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-[3rem] p-8 md:p-12 border border-white/10 flex flex-col justify-center space-y-6 relative overflow-hidden shadow-2xl"
                >
                   <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${InfoBox.border} ${InfoBox.bg} ${InfoBox.color}`}>
                         Street Pack
                      </span>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">ID: {currentIndex + 1}/10</span>
                   </div>

                   {/* Constraint: Single line, smaller size */}
                   <div className="overflow-hidden">
                      <h3 className={`font-black text-white tracking-tighter brand-gradient leading-tight whitespace-nowrap overflow-hidden text-ellipsis ${fontSizeClass}`}>
                        {currentPhrase?.phrase || "Loading..."}
                      </h3>
                   </div>

                   <div className="flex items-center gap-4">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={() => speak(currentPhrase?.phrase)} 
                        className={`p-4 glass rounded-xl border transition-all ${InfoBox.color} ${InfoBox.border}`}
                      >
                         <Volume2 className="w-6 h-6" />
                      </motion.button>
                      <div className="space-y-0.5">
                        <p className="text-white/20 font-black uppercase tracking-widest text-[8px]">Origin</p>
                        <p className="text-white font-bold text-sm opacity-80">{currentPhrase?.origin || "Street Wisdom"}</p>
                      </div>
                   </div>
                </motion.div>

                {/* Translation Column */}
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  className="glass rounded-[3rem] p-8 md:p-12 border border-white/10 flex flex-col justify-center text-right space-y-4 shadow-2xl relative overflow-hidden bg-white/5"
                >
                   <div className="space-y-2">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">الترجمة الدارجة</span>
                      <p className="text-4xl md:text-6xl font-black text-white brand-gradient leading-tight truncate" dir="rtl">
                        {currentPhrase?.arabicEquivalent || "..."}
                      </p>
                   </div>
                   <div className="flex items-center justify-end gap-2 text-[8px] font-black text-white/30 uppercase tracking-widest">
                      Verified Link <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   </div>
                </motion.div>
             </div>

             {/* Detail Cards */}
             <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="md:col-span-7 glass rounded-[2.5rem] p-8 border border-white/10 space-y-6"
                >
                   <div className="space-y-4">
                      <p className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${InfoBox.color}`}>
                         <Brain className="w-4 h-4" /> Meaning
                      </p>
                      <p className="text-lg md:text-xl font-bold text-white/90 leading-relaxed italic">
                         "{currentPhrase?.meaning || "Decrypting..."}"
                      </p>
                   </div>
                   
                   <div className="space-y-4 pt-4 border-t border-white/5">
                      <p className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2 text-emerald-400">
                         <Target className="w-4 h-4" /> Street Usage
                      </p>
                      <div className="space-y-4">
                         {currentPhrase?.examples?.slice(0, 2).map((ex: any, i: number) => (
                            <div key={i} className="pl-4 border-l-2 border-emerald-500/30 py-1 space-y-1">
                               <p className="text-sm md:text-base font-bold text-white italic">"{ex?.english}"</p>
                               <p className="text-[10px] text-white/30 text-right" dir="rtl">{ex?.arabic}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="md:col-span-5 flex flex-col gap-6"
                >
                   <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4 flex-1 flex flex-col justify-center text-center">
                      <motion.div 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-4xl font-black text-white mono-text"
                      >
                        {(currentIndex + 1) * 10}%
                      </motion.div>
                      <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Neural Mastery</p>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                         <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentIndex + 1) * 10}%` }}
                          className="h-full bg-cyan-500 shadow-[0_0_8px_cyan]"
                         ></motion.div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => speak(currentPhrase?.phrase)} 
                        className="py-5 glass rounded-2xl flex flex-col items-center justify-center gap-2 text-white/40 hover:text-cyan-400 border border-white/5 transition-all"
                      >
                         <Volume2 className="w-5 h-5" />
                         <span className="text-[7px] font-black uppercase">Pronounce</span>
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onStartExam(phrases.map(p => p.phrase))} 
                        className="py-5 bg-white text-black rounded-2xl flex flex-col items-center justify-center gap-2 font-black shadow-xl transition-all"
                      >
                         <Target className="w-5 h-5" />
                         <span className="text-[7px] font-black uppercase">Test Pack</span>
                      </motion.button>
                   </div>
                </motion.div>
             </div>

             {/* Navigation Controls */}
             <div className="flex gap-4 pt-4">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} 
                  className="p-6 glass border border-white/10 rounded-2xl text-white/20 hover:text-white transition-all"
                >
                  <ChevronLeft className="w-8 h-8" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    if(currentIndex < phrases.length - 1) setCurrentIndex(currentIndex + 1); 
                    else onStartExam(phrases.map(p => p.phrase)); 
                  }}
                  className="flex-1 py-6 bg-slate-950 text-white rounded-3xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 transition-all keep-white border border-white/10"
                >
                   <Zap className={`w-5 h-5 fill-current ${InfoBox.color}`} /> 
                   {currentIndex === phrases.length - 1 ? 'Unlock Exam' : 'Next Node'}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentIndex(Math.min(phrases.length - 1, currentIndex + 1))} 
                  className="p-6 glass border border-white/10 rounded-2xl text-white/20 hover:text-white transition-all"
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.button>
             </div>
        </motion.div>
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

export default SlangView;
