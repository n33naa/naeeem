
import React, { useState, useEffect } from 'react';
import { 
  Volume2, CheckCircle2, ChevronRight, ChevronLeft, 
  Zap, Trophy, RefreshCw, EyeOff, Eye, Brain, Rocket, Target, Star, AlertTriangle,
  Languages, Quote, BookOpen, Layers, History, Sparkles, Activity, Timer
} from 'lucide-react';
import { DailyWord, CefrLevel, Flashcard } from '../types';
import { fetchMasteryMatrix } from '../services/geminiService';
import { motion, AnimatePresence } from 'motion/react';

interface DailyWordsViewProps {
  onCompleteWord: (word: string, isMastered: boolean) => void;
  onFinishChallenge: (wordsLearned: string[]) => void;
  learnedWords: Flashcard[];
}

const levelCache: Record<string, DailyWord[]> = {};

const DailyWordsView: React.FC<DailyWordsViewProps> = ({ onCompleteWord, onFinishChallenge, learnedWords }) => {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [selectedCefr, setSelectedCefr] = useState<CefrLevel>('A2');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState(false); // Ensured false for immediate visibility
  const [showDetails, setShowDetails] = useState(false);

  const loadWords = async () => {
    if (levelCache[selectedCefr]) {
      setWords(levelCache[selectedCefr]);
      setCurrentIndex(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    if ((window as any).setStarSpeed) (window as any).setStarSpeed(40);

    try {
      const now = Date.now();
      const dueForReview = learnedWords
        .filter(card => card.nextReview <= now)
        .sort((a, b) => a.level - b.level)
        .slice(0, 5);
      
      const wordsToReviewNames = dueForReview.map(f => f.word);
      const newCount = 20 - wordsToReviewNames.length;
      const excludeList = learnedWords.map(f => f.word);

      const finalWords = await fetchMasteryMatrix(selectedCefr, newCount, wordsToReviewNames, excludeList);
      const shuffled = finalWords.sort(() => 0.5 - Math.random());
      levelCache[selectedCefr] = shuffled;
      
      setWords(shuffled);
      setCurrentIndex(0);
    } catch (e) { 
      console.error(e);
      setError("NEURAL BRIDGE FAILED: Connectivity unstable.");
    } finally { 
      setLoading(false); 
      if ((window as any).setStarSpeed) (window as any).setStarSpeed(4);
    }
  };

  useEffect(() => {
    loadWords();
  }, [selectedCefr]);

  const currentWord = words[currentIndex];
  const flashcardData = learnedWords.find(f => f.word.toLowerCase() === currentWord?.word.toLowerCase());
  const masteryLevel = flashcardData?.level || 0;

  useEffect(() => {
    setShowDetails(false);
  }, [currentIndex]);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleFinish = () => {
    onFinishChallenge(words.map(w => w.word));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-12">
        <div className="relative">
           <div className="w-32 h-32 border-8 border-white/5 border-t-cyan-500 rounded-full animate-spin"></div>
           <Timer className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-cyan-400 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="mono-text text-cyan-400 font-black uppercase text-xl tracking-[0.6em] animate-pulse">Accelerating Sync...</h3>
        </div>
      </div>
    );
  }

  if (error || !currentWord) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 glass rounded-[3rem] border border-red-500/20 p-10 md:p-20 text-center">
        <AlertTriangle className="w-16 h-16 md:w-20 md:h-20 text-red-500 animate-bounce" />
        <h3 className="text-2xl md:text-3xl font-black text-white luxury-text uppercase">Link Interrupted</h3>
        <button onClick={loadWords} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all">Retry Link</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-28 px-2 md:px-4 pt-4 md:pt-6"
    >
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 items-center justify-between glass p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/10 shadow-2xl">
        <div className="flex flex-wrap justify-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 w-full lg:w-auto">
          {['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => (
            <button key={lvl} onClick={() => setSelectedCefr(lvl as CefrLevel)} className={`flex-1 lg:flex-none px-4 md:px-5 py-3 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${selectedCefr === lvl ? 'bg-cyan-500 text-slate-950 shadow-lg keep-white' : 'text-white/40 hover:text-white'}`}>{lvl}</button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
           <button onClick={() => setQuizMode(!quizMode)} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest glass border-white/10 transition-all ${quizMode ? 'text-cyan-400 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-cyan-950/20' : 'text-white/30'}`}>
              {quizMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {quizMode ? 'CHALLENGE ACTIVE' : 'Practice'}
           </button>
           <div className="flex items-center justify-center gap-4 bg-slate-950 px-8 py-3 rounded-2xl text-white border border-white/10 keep-white w-full sm:w-auto">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="mono-text text-[9px] md:text-[10px] font-black tracking-widest text-white">{currentIndex + 1} / 20</span>
           </div>
        </div>
      </div>

      <div className="w-full">
         <AnimatePresence mode="wait">
           <motion.div 
            key={`${selectedCefr}-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="glass rounded-[2.5rem] md:rounded-[4rem] border border-white/10 p-4 md:p-14 lg:p-20 flex flex-col min-h-auto md:min-h-[650px] shadow-2xl relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-cyan-500/5 blur-[80px] md:blur-[120px] pointer-events-none"></div>
              
              <div className="space-y-12 md:space-y-16 relative z-10 flex-1 flex flex-col justify-center">
                 <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8 md:gap-12">
                    <div className="space-y-6 md:space-y-8 flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-4">
                          {flashcardData ? (
                             <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[8px] font-black uppercase tracking-widest"
                             >
                                <History className="w-3 h-3" /> Reinforcement
                             </motion.div>
                          ) : (
                             <motion.div 
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full text-[8px] font-black uppercase tracking-widest"
                             >
                                <Sparkles className="w-3 h-3" /> New Node
                             </motion.div>
                          )}
                          <div className="h-1.5 w-24 md:w-32 bg-white/5 rounded-full overflow-hidden p-0.5">
                             <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${flashcardData ? (masteryLevel + 1) * 20 : 10}%` }}
                              className="h-full bg-cyan-500 rounded-full shadow-[0_0_10px_cyan] transition-all duration-1000"
                             ></motion.div>
                          </div>
                       </div>

                       <motion.h3 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-[clamp(1.5rem,13vw,6rem)] sm:text-6xl md:text-7xl lg:text-8xl font-black luxury-text text-white uppercase tracking-tighter brand-gradient leading-tight whitespace-nowrap overflow-hidden text-ellipsis"
                       >
                         {currentWord.word}
                       </motion.h3>
                       
                       <motion.div 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 md:gap-6"
                       >
                          <span className="mono-text text-lg md:text-2xl font-black text-white/30 uppercase tracking-[0.3em]">{currentWord.phonetic}</span>
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => speak(currentWord.word)} 
                            className="p-4 md:p-5 glass rounded-xl md:rounded-[1.5rem] text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500 hover:text-black transition-all"
                          >
                             <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
                          </motion.button>
                       </motion.div>
                    </div>

                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 md:p-14 bg-white/5 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 text-right w-full lg:w-auto lg:min-w-[280px] relative shadow-2xl group overflow-hidden"
                    >
                       {quizMode && !showDetails ? (
                         <button onClick={() => setShowDetails(true)} className="absolute inset-[-4px] z-50 flex flex-col items-center justify-center bg-slate-950 backdrop-blur-[100px] rounded-[2.5rem] md:rounded-[3.5rem] border-[2px] border-cyan-500 group transition-all duration-300 keep-white">
                            <Brain className="w-12 h-12 md:w-20 h-20 text-white animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] mt-4">DECRYPT</span>
                         </button>
                       ) : null}
                       <p className="text-[clamp(1.75rem,8vw,4rem)] sm:text-5xl md:text-7xl font-black text-white brand-gradient leading-tight whitespace-pre-wrap" dir="rtl">{currentWord.translation}</p>
                       <span className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mt-4 block">Semantic Bridge</span>
                    </motion.div>
                 </div>

                 <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 pt-6 transition-all duration-700 ${quizMode && !showDetails ? 'opacity-0 blur-[50px] scale-95 pointer-events-none' : 'opacity-100 blur-0 scale-100'}`}
                 >
                    <div className="space-y-8">
                       <div className="space-y-3">
                          <p className="text-[10px] md:text-[11px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3"><Quote className="w-4 h-4" /> Concept</p>
                          <p className="text-white/80 font-bold leading-relaxed text-lg md:text-2xl">{currentWord.definition}</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <p className="text-[10px] md:text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-3"><Activity className="w-4 h-4" /> Usage</p>
                       <div className="space-y-4">
                          {currentWord.examples?.slice(0, 1).map((ex, i) => (
                             <motion.div 
                              key={i} 
                              whileHover={{ scale: 1.02 }}
                              className="p-6 md:p-8 bg-white/5 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all relative overflow-hidden"
                             >
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/20"></div>
                                <p className="text-lg md:text-2xl font-bold text-white italic leading-relaxed">"{ex.english}"</p>
                                <p className="text-base md:text-lg text-white/40 text-right mt-3 font-medium" dir="rtl">{ex.arabic}</p>
                             </motion.div>
                          ))}
                       </div>
                    </div>
                 </motion.div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-10 md:pt-16 relative z-10">
                 <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} className="flex-1 sm:flex-none p-6 md:p-8 glass border border-white/10 rounded-2xl md:rounded-[2.5rem] text-white/20 hover:text-white transition-all"><ChevronLeft className="w-8 h-8 md:w-10 md:h-10" /></motion.button>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCurrentIndex(Math.min(words.length-1, currentIndex + 1))} className="flex-1 sm:flex-none p-6 md:p-8 glass border border-white/10 rounded-2xl md:rounded-[2.5rem] text-white/20 hover:text-white transition-all"><ChevronRight className="w-8 h-8 md:w-10 md:h-10" /></motion.button>
                 </div>
                 <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { 
                    onCompleteWord(currentWord.word, true); 
                    if(currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1); 
                    else handleFinish(); 
                  }}
                  className="flex-1 py-6 md:py-8 rounded-2xl md:rounded-[3rem] font-black uppercase text-[10px] tracking-[0.4em] shadow-3xl flex items-center justify-center gap-3 bg-slate-950 text-white hover:bg-cyan-600 transition-all keep-white"
                 >
                    <Zap className="w-4 h-4 md:w-6 md:h-6 fill-current text-cyan-400" /> 
                    {currentIndex === words.length - 1 ? 'Start Exam' : 'Mastered'}
                 </motion.button>
              </div>
           </motion.div>
         </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default DailyWordsView;
