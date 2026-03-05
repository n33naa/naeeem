
import React, { useState, useEffect } from 'react';
import { Lock, Crown, ArrowRight, ShieldCheck, UserPlus, LogIn, AlertCircle, Fingerprint, Cpu } from 'lucide-react';
import { SecurityService } from '../services/securityService';
import { motion, AnimatePresence } from 'motion/react';

interface AuthViewProps {
  onLogin: (key: string) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [key, setKey] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [identities, setIdentities] = useState<string[]>([]);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // RECOVERY PROTOCOL: Scan all localStorage keys to find existing identities
    const scanIdentities = () => {
      const found: string[] = [];
      const registryStr = localStorage.getItem('elite_identities_registry');
      if (registryStr) {
        try {
          const registry = JSON.parse(registryStr);
          if (Array.isArray(registry)) found.push(...registry);
        } catch (e) { console.error("Registry corrupted", e); }
      }

      // Deep scan: find data chunks that aren't in the registry
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('elite_identity_')) {
          const hashedId = k.replace('elite_identity_', '');
          if (!found.includes(hashedId)) found.push(hashedId);
        }
      }

      // Auto-heal the registry
      localStorage.setItem('elite_identities_registry', JSON.stringify(found));
      setIdentities(found);
      
      if (found.length === 0) setMode('register');
      setChecking(false);
    };

    scanIdentities();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (key.length < 4) {
      setError("الرمز يجب أن يكون 4 أرقام على الأقل");
      return;
    }

    const hashedKey = SecurityService.hashKey(key);
    
    // Check if data exists physically for this key
    const hasExistingData = localStorage.getItem(`elite_identity_${hashedKey}`) !== null;
    const isInRegistry = identities.includes(hashedKey);

    if (mode === 'register') {
      if (hasExistingData || isInRegistry) {
        setError("هذا الرمز مسجل بالفعل، يرجى تسجيل الدخول");
        setMode('login');
        return;
      }
      // New Registration
      const updated = [...identities, hashedKey];
      localStorage.setItem('elite_identities_registry', JSON.stringify(updated));
      onLogin(key);
    } else {
      // Login - Be lenient: if they have the data, let them in even if registry failed before
      if (hasExistingData || isInRegistry) {
        if (!isInRegistry) {
           const updated = [...identities, hashedKey];
           localStorage.setItem('elite_identities_registry', JSON.stringify(updated));
        }
        onLogin(key);
      } else {
        setError("رمز الدخول غير معترف به في قاعدة البيانات");
      }
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md w-full glass p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center space-y-8 mb-12">
          <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Fingerprint className={`w-10 h-10 relative z-10 ${mode === 'register' ? 'text-cyan-400' : 'text-purple-400'}`} />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="luxury-text text-4xl font-black text-white uppercase tracking-tighter">
              {mode === 'register' ? 'هوية جديدة' : 'تأكيد الهوية'}
            </h1>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
              نظام الحماية العصبي المستمر
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest text-center block">
              أدخل رمز الوصول الخاص بك (سيتم حفظه للأبد)
            </label>
            <div className="relative group">
              <input
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError(null);
                }}
                placeholder="••••"
                className={`w-full bg-white/5 border rounded-3xl py-6 px-10 text-center text-3xl tracking-[0.5em] text-white outline-none transition-all ${error ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'}`}
              />
            </div>
            {error && (
              <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest animate-pulse">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={key.length < 4}
            className={`w-full py-6 rounded-3xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl keep-white ${mode === 'register' ? 'bg-cyan-500 text-black' : 'bg-white text-black hover:bg-purple-500 hover:text-white'}`}
          >
            {mode === 'register' ? 'إنشاء الهوية' : 'دخول آمن'} 
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-6">
          <button 
            onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(null); }}
            className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors"
          >
            {mode === 'register' ? 'لديك هوية بالفعل؟ سجل دخول' : 'مستخدم جديد؟ أنشئ هويتك هنا'}
          </button>

          <div className="pt-8 border-t border-white/5 w-full flex items-center justify-center gap-4 opacity-30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[7px] font-black uppercase tracking-widest text-white">Identity Persistence Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthView;
