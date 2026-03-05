
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView } from '../types';
import { 
  Languages, 
  Mic2, 
  Layers, 
  PenTool, 
  Settings,
  Crown,
  LayoutDashboard,
  Sun,
  Moon,
  Zap,
  Palette,
  MessageSquareQuote,
  BookOpen,
  Book
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  theme: 'space' | 'light';
  onToggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, theme, onToggleTheme }) => {
  const navItems = [
    { id: AppView.DASHBOARD, icon: LayoutDashboard, label: 'HUB' },
    { id: AppView.TRANSLATE, icon: Languages, label: 'SCAN' },
    { id: AppView.CONVERSATION, icon: Mic2, label: 'SPEAK' },
    { id: AppView.SLANG, icon: MessageSquareQuote, label: 'STREET' },
    { id: AppView.FLASHCARDS, icon: Layers, label: 'DECK' },
    { id: AppView.READING_LAB, icon: BookOpen, label: 'LAB' },
    { id: AppView.WRITING, icon: PenTool, label: 'DRAFT' },
  ];

  return (
    <div className={`min-h-screen bg-transparent flex flex-col overflow-x-hidden relative ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      <header className={`backdrop-blur-3xl sticky top-0 z-[60] pt-safe transition-all duration-700 ${
        theme === 'light' 
          ? 'bg-white/70 border-b border-black/5' 
          : 'bg-slate-950/40 border-b border-white/5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <div className={`w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg transition-all duration-500 ${theme === 'light' ? 'bg-black shadow-black/10' : 'bg-gradient-to-br from-cyan-500 to-indigo-600 shadow-cyan-500/20'}`}>
              <Crown className="text-white w-4 h-4 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
              <h1 className={`luxury-text text-sm md:text-xl font-black tracking-tight leading-none uppercase ${theme === 'light' ? 'text-black' : 'text-white'}`}>Elite English AI</h1>
              <span className={`mono-text text-[5px] md:text-[7px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mt-0.5 transition-colors duration-500 ${theme === 'light' ? 'text-black/50' : 'text-cyan-400'}`}>
                {theme === 'light' ? 'SUNSET MODE' : 'HYPER-SPEED ACTIVE'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={onToggleTheme}
              className={`p-1.5 md:p-2.5 glass rounded-lg md:rounded-xl border active:scale-95 transition-all flex items-center gap-2 ${theme === 'light' ? 'text-black border-white/20' : 'text-cyan-400 border-white/5'}`}
            >
              {theme === 'light' ? <Palette className="w-4 h-4 md:w-5 md:h-5" /> : <Zap className="w-4 h-4 md:w-5 md:h-5" />}
              <span className="hidden sm:inline mono-text text-[7px] font-black uppercase tracking-widest">Toggle Reality</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-8 pt-4 pb-24 md:pb-12 overflow-y-auto overflow-x-hidden scroll-smooth">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-[60] px-2 pb-safe pointer-events-none mb-2">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className={`glass rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-around h-14 md:h-20 px-1 transition-all duration-700 ${
            theme === 'light' 
              ? 'bg-white/90 border-black/10 shadow-[0_15px_40px_rgba(0,0,0,0.05)]' 
              : 'bg-slate-900/70 border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.4)]'
          }`}>
            {navItems.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => onViewChange(id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all w-full h-full active:scale-90 ${
                  activeView === id 
                    ? (theme === 'light' ? 'text-black' : 'text-cyan-400') 
                    : (theme === 'light' ? 'text-black/30' : 'text-slate-500')
                }`}
              >
                {activeView === id && (
                  <div className={`absolute -top-1 w-3 md:w-6 h-1 rounded-full transition-colors duration-500 ${theme === 'light' ? 'bg-black' : 'bg-cyan-400'}`}></div>
                )}
                <Icon className={`w-4 h-4 md:w-6 md:h-6 transition-all ${activeView === id ? 'scale-110' : 'opacity-60'}`} />
                <span className="mono-text text-[4px] md:text-[6px] uppercase tracking-[0.1em] md:tracking-widest font-black mt-0.5 md:mt-1">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
