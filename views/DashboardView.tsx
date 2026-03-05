
import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Flame, Star, Zap, Rocket, PenTool, Mic2, Award, Camera, Sparkles, Target, BookOpen, Fingerprint, MessageSquareQuote, Book } from 'lucide-react';
import { UserStats, AppView } from '../types';

interface DashboardViewProps {
  stats: UserStats;
  onNavigate: (view: AppView) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ stats, onNavigate }) => {
  const levelProgress = (stats.xp % 1000) / 10;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6 md:space-y-8 pb-10"
    >
      
      {/* Profile Header */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        <div className="lg:col-span-8 glass p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/5 blur-[100px]"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-10 text-center sm:text-left">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl glass border border-cyan-400/30 flex items-center justify-center shadow-xl shrink-0"
            >
               <span className="text-3xl md:text-4xl font-black luxury-text brand-gradient">L{stats.level}</span>
            </motion.div>
            <div className="flex-1 space-y-3 w-full">
               <h2 className="luxury-text text-3xl md:text-6xl font-black tracking-tighter text-white uppercase italic">Commander</h2>
               <div className="pt-1 space-y-2">
                  <div className="w-full h-1.5 md:h-2 bg-white/5 rounded-full overflow-hidden p-0.5">
                     <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgress}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full shadow-[0_0_10px_cyan]" 
                     ></motion.div>
                  </div>
                  <div className="flex justify-between mono-text text-[6px] md:text-[7px] font-black text-white/30 uppercase tracking-widest">
                     <span>{stats.xp} XP</span>
                     <span>SYNC: {1000 - (stats.xp % 1000)} XP</span>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
           <motion.div whileHover={{ y: -5 }} className="glass p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mb-1.5" />
              <p className="text-xl md:text-2xl font-black text-white">{stats.streakDays}</p>
              <p className="text-[6px] md:text-[7px] font-black text-white/20 uppercase tracking-widest">Streak</p>
           </motion.div>
           <motion.div whileHover={{ y: -5 }} className="glass p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex flex-col items-center justify-center border border-white/5">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 mb-1.5" />
              <p className="text-xl md:text-2xl font-black text-white">{stats.wordsLearned}</p>
              <p className="text-[6px] md:text-[7px] font-black text-white/20 uppercase tracking-widest">Nodes</p>
           </motion.div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Mastery */}
        <motion.button 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(AppView.DAILY_WORDS)}
          className="group glass p-1 rounded-[3.5rem] border border-cyan-500/20 hover:border-cyan-500 transition-all shadow-2xl overflow-hidden relative"
        >
           <div className="bg-slate-900/50 rounded-[3.4rem] p-8 md:p-10 flex items-center gap-8 border border-white/5 h-full">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center relative shrink-0">
                 <BookOpen className="w-10 h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 text-left space-y-2">
                 <h3 className="text-2xl font-black luxury-text text-white uppercase tracking-tighter italic leading-none">Daily Mastery Matrix</h3>
                 <p className="text-white/40 font-bold text-xs">Synchronize 20 curated words.</p>
              </div>
           </div>
        </motion.button>

        {/* Street Mode */}
        <motion.button 
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate(AppView.SLANG)}
          className="group glass p-1 rounded-[3.5rem] border border-yellow-500/20 hover:border-yellow-500 transition-all shadow-2xl overflow-hidden relative"
        >
           <div className="bg-slate-900/50 rounded-[3.4rem] p-8 md:p-10 flex items-center gap-8 border border-white/5 h-full">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center relative shrink-0">
                 <MessageSquareQuote className="w-10 h-10 text-yellow-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 text-left space-y-2">
                 <h3 className="text-2xl font-black luxury-text text-white uppercase tracking-tighter italic leading-none">Street Wisdom</h3>
                 <p className="text-white/40 font-bold text-xs">American Slang & Cultural Idioms.</p>
              </div>
           </div>
        </motion.button>
      </div>

      <motion.div variants={item} className="grid grid-cols-1 gap-6">
        {/* Reading Lab */}
        <motion.button 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onNavigate(AppView.READING_LAB)}
          className="group glass p-1 rounded-[3.5rem] border border-indigo-500/20 hover:border-indigo-500 transition-all shadow-2xl overflow-hidden relative"
        >
           <div className="bg-slate-900/50 rounded-[3.4rem] p-8 md:p-10 flex items-center gap-8 border border-white/5 h-full">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center relative shrink-0">
                 <BookOpen className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 text-left space-y-2">
                 <h3 className="text-2xl font-black luxury-text text-white uppercase tracking-tighter italic leading-none">Neural Reading Lab</h3>
                 <p className="text-white/40 font-bold text-xs">Analyze any text for deep insights.</p>
              </div>
           </div>
        </motion.button>
      </motion.div>

      {/* Main Feature Launchpad */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
         <motion.button whileHover={{ y: -5 }} onClick={() => onNavigate(AppView.TRANSLATE)} className="group glass p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-5 hover:bg-cyan-500/10 active:scale-95 transition-all text-left">
            <div className="w-12 h-12 bg-cyan-500 text-black rounded-xl flex items-center justify-center shadow-lg"><Camera className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-black text-white luxury-text uppercase">Vision Scan</h3><p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Identify & Link</p></div>
         </motion.button>
         <motion.button whileHover={{ y: -5 }} onClick={() => onNavigate(AppView.CONVERSATION)} className="group glass p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-5 hover:bg-indigo-500/10 active:scale-95 transition-all text-left">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><Mic2 className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-black text-white luxury-text uppercase">Neural Speak</h3><p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Live Audio Link</p></div>
         </motion.button>
         <motion.button whileHover={{ y: -5 }} onClick={() => onNavigate(AppView.WRITING)} className="group glass p-6 rounded-[2.5rem] border border-white/10 flex items-center gap-5 hover:bg-purple-500/10 active:scale-95 transition-all text-left">
            <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center shadow-lg"><PenTool className="w-6 h-6" /></div>
            <div><h3 className="text-lg font-black text-white luxury-text uppercase">Draft Refiner</h3><p className="text-[7px] font-bold text-white/30 uppercase tracking-widest">Master Writing</p></div>
         </motion.button>
      </motion.div>

      {/* Dashboard Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
         {[
           { label: 'Exams Passed', val: stats.examsPassed, icon: Trophy, color: 'text-yellow-400' },
           { label: 'Avg Accuracy', val: `${stats.avgScore}%`, icon: Sparkles, color: 'text-indigo-400' },
           { label: 'Identity Status', val: 'Verified', icon: Fingerprint, color: 'text-cyan-400' },
           { label: 'Rank', val: 'Elite', icon: Award, color: 'text-emerald-400' },
         ].map((stat, i) => (
           <motion.div 
            key={i} 
            whileHover={{ scale: 1.05 }}
            className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 border border-white/5"
           >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center ${stat.color} shrink-0`}><stat.icon className="w-4 h-4 md:w-5 md:h-5" /></div>
              <div className="min-w-0">
                 <p className="text-sm md:text-lg font-black text-white leading-none truncate">{stat.val}</p>
                 <p className="mono-text text-[5px] md:text-[6px] font-black uppercase tracking-widest text-white/20 mt-1">{stat.label}</p>
              </div>
           </motion.div>
         ))}
      </motion.div>
    </motion.div>
  );
};

export default DashboardView;
