
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, RotateCcw, Brain, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink, Flame, Zap, Star } from 'lucide-react';
import { Flashcard } from '../types';

// Removed non-existent import getGoogleImagesUrl which caused a compilation error.

interface FlashcardsViewProps {
  cards: Flashcard[];
  onUpdateCard: (card: Flashcard) => void;
}

const FlashcardsView: React.FC<FlashcardsViewProps> = ({ cards, onUpdateCard }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = cards[currentIndex];

  const handleFlip = () => setIsFlipped(!isFlipped);
  
  const handleNext = () => { 
    setIsFlipped(false); 
    setCurrentIndex((prev) => (prev + 1) % cards.length); 
  };
  
  const handlePrev = () => { 
    setIsFlipped(false); 
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length); 
  };

  const handleDifficulty = (difficulty: 'hard' | 'mastered') => {
    if (!currentCard) return;
    
    // Spaced Repetition Logic: 
    // Mastered -> Next review in days based on level.
    // Hard -> Next review in 1 hour.
    const nextReview = difficulty === 'mastered' 
      ? Date.now() + 86400000 * (currentCard.level + 2) 
      : Date.now() + 3600000;

    onUpdateCard({
      ...currentCard,
      level: difficulty === 'mastered' ? currentCard.level + 1 : Math.max(0, currentCard.level - 1),
      nextReview
    });
    
    // Auto-advance with transition delay
    setTimeout(handleNext, 300);
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[75vh] text-center px-6 animate-in fade-in zoom-in duration-1000">
        <div className="relative mb-12">
          <div className="absolute -inset-16 bg-indigo-50 rounded-full blur-[100px] animate-pulse"></div>
          <div className="relative w-40 h-40 bg-white border border-indigo-50 rounded-[4rem] flex items-center justify-center shadow-2xl">
            <Layers className="w-20 h-20 text-indigo-600" />
          </div>
        </div>
        <h3 className="text-5xl font-black luxury-text brand-gradient mb-6 tracking-tight">Deck Synchronized</h3>
        <p className="text-slate-400 font-bold max-w-sm mx-auto text-xl">Search and save new linguistic nodes to start neural training.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto space-y-12 pb-28 pt-8 px-4"
    >
      <div className="flex justify-between items-end gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">
             <Zap className="w-3 h-3 fill-current" /> Tactical Mastery
          </div>
          <h2 className="luxury-text text-5xl brand-gradient font-black tracking-tighter uppercase">Memory Lab</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
            <span className="text-[11px] font-black text-slate-400 tabular-nums">{currentIndex + 1} / {cards.length}</span>
            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  className="h-full bg-indigo-600 transition-all duration-500"
                ></motion.div>
            </div>
        </div>
      </div>

      <div className="relative aspect-[3/4] w-full max-w-md mx-auto perspective-2000">
        <motion.div 
          onClick={handleFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-full h-full cursor-pointer"
        >
          {/* Front Side */}
          <div className="absolute inset-0 backface-hidden bg-white border border-slate-50 rounded-[4.5rem] p-5 shadow-2xl">
            <div className="relative w-full h-full bg-slate-50 rounded-[3.5rem] overflow-hidden flex flex-col items-center justify-center p-8 space-y-10 shadow-inner">
               <div className="w-full aspect-square bg-white rounded-[3rem] overflow-hidden shadow-sm flex items-center justify-center">
                  {currentCard.imageUrl ? (
                    <img src={currentCard.imageUrl} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-indigo-100" />
                  )}
               </div>
               <div className="text-center space-y-3">
                  <h3 className="text-5xl font-black luxury-text text-slate-900 tracking-tighter uppercase leading-none">{currentCard.word}</h3>
                  <div className="flex justify-center gap-1">
                    {[...Array(Math.min(5, currentCard.level))].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
               </div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Tap to de-encrypt bridge</p>
            </div>
          </div>

          {/* Back Side */}
          <div 
            className="absolute inset-0 backface-hidden bg-slate-950 border-[10px] border-white/5 rounded-[4.5rem] p-12 flex flex-col justify-between shadow-2xl"
            style={{ transform: "rotateY(180deg)" }}
          >
             <div className="flex-1 flex flex-col justify-center text-center space-y-10">
                <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">Neural Bridge Data</span>
                <p className="text-6xl font-black text-white brand-gradient tracking-tight" dir="rtl">{currentCard.meaning}</p>
                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 italic text-white/80 text-xl leading-relaxed">
                   "{currentCard.examples[0] || 'Awaiting contextual data...'}"
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); handleDifficulty('hard'); }} 
                  className="py-6 bg-white/5 text-white/40 rounded-3xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/10 hover:text-white transition-all"
                >
                  Hard
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); handleDifficulty('mastered'); }} 
                  className="py-6 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all"
                >
                  Mastered
                </motion.button>
             </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center items-center gap-6 max-w-sm mx-auto pt-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={handlePrev} className="p-6 bg-white border border-slate-100 rounded-[2rem] text-slate-300 hover:text-indigo-600 shadow-xl transition-all">
          <ChevronLeft className="w-8 h-8" />
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFlip} className="flex-1 py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl flex items-center justify-center gap-3 transition-all border border-white/5">
           <RotateCcw className="w-5 h-5" /> Invert View
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={handleNext} className="p-6 bg-white border border-slate-100 rounded-[2rem] text-slate-300 hover:text-indigo-600 shadow-xl transition-all">
          <ChevronRight className="w-8 h-8" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default FlashcardsView;
