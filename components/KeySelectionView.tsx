
import React from 'react';
import { Crown, ShieldCheck, Zap, Lock, ExternalLink, ArrowRight } from 'lucide-react';

interface KeySelectionViewProps {
  onSelected: () => void;
}

const KeySelectionView: React.FC<KeySelectionViewProps> = ({ onSelected }) => {
  const handleOpenKeySelector = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    onSelected();
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-10 text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-indigo-200 animate-float">
            <Crown className="text-white w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h1 className="luxury-text text-5xl font-black brand-gradient tracking-tighter">Access Setup</h1>
            <p className="text-slate-400 font-bold text-lg">Personal API Configuration Required</p>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
          
          <div className="space-y-6 text-left">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                To provide ultra-high-definition <span className="text-indigo-600 font-bold">Pro Images</span> and zero-latency voice, you must use your own API key.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                This prevents "Resource Exhausted" errors and ensures your immersion session remains uninterrupted.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              Select Your Key <ArrowRight className="w-5 h-5" />
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Billing Documentation
            </a>
          </div>
        </div>

        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 flex items-center justify-center gap-3">
          <Lock className="w-3 h-3" /> Secure End-to-End Encryption
        </p>
      </div>
    </div>
  );
};

export default KeySelectionView;
