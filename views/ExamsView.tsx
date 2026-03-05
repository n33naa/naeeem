
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Loader2, CheckCircle2, XCircle, 
  Brain, Target, ShieldCheck, 
  RotateCcw, AlertTriangle, BookOpen, Star, Zap,
  Volume2, Info, ChevronRight, Activity, Sparkles, MessageSquare,
  Cpu, Fingerprint, Shield, Radio, ShieldAlert
} from 'lucide-react';
import { generateExam, analyzeExamPerformance } from '../services/geminiService';
import { Flashcard, ExamQuestion, NeuralFeedback } from '../types';

interface ExamsViewProps {
  flashcards: Flashcard[];
  predefinedWords?: string[];
  onExamPassed: (score: number, wordStats: {word: string, correct: boolean}[]) => void;
  onNavigate: (view: any) => void;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const ExamsView: React.FC<ExamsViewProps> = ({ flashcards, predefinedWords, onExamPassed, onNavigate }) => {
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [results, setResults] = useState<{word: string, correct: boolean}[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [preparing, setPreparing] = useState(true);
  const [neuralFeedback, setNeuralFeedback] = useState<NeuralFeedback | null>(null);
  const [analyzingFeedback, setAnalyzingFeedback] = useState(false);

  const shuffledOptions = useMemo(() => {
    if (!questions[currentIndex]) return [];
    return shuffleArray(questions[currentIndex].options);
  }, [questions, currentIndex]);

  const startExam = async () => {
    setLoading(true);
    setNeuralFeedback(null);
    try {
      // Pick up to 20 words for the exam
      const wordsToTest = predefinedWords && predefinedWords.length > 0
        ? predefinedWords.sort(() => 0.5 - Math.random()).slice(0, 20)
        : flashcards.sort(() => 0.5 - Math.random()).slice(0, 20).map(c => c.word);
      
      if (wordsToTest.length < 3 && !predefinedWords) {
        setLoading(false);
        setPreparing(false);
        return;
      }

      const examData = await generateExam(wordsToTest);
      setQuestions(examData);
      setCurrentIndex(0);
      setResults([]);
      setShowResult(false);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false);
      setPreparing(false);
    }
  };

  useEffect(() => {
    startExam();
  }, []);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleOptionSelect = async (option: string) => {
    if (isAnswering) return;
    setSelectedOption(option);
    setIsAnswering(true);
    
    const currentQ = questions[currentIndex];
    const isCorrect = option === currentQ.correctAnswer;
    const currentResult = { word: currentQ.targetWord, correct: isCorrect };
    
    const updatedResults = [...results, currentResult];
    setResults(updatedResults);

    if (isCorrect) speak("Correct Analysis");
    else speak("Sync Error");

    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsAnswering(false);
      } else {
        const score = (updatedResults.filter(r => r.correct).length / questions.length) * 100;
        onExamPassed(score, updatedResults);
        setShowResult(true);
        
        setAnalyzingFeedback(true);
        try {
          const feedback = await analyzeExamPerformance(updatedResults);
          setNeuralFeedback(feedback);
        } catch (e) { console.error(e); } finally { setAnalyzingFeedback(false); }
      }
    }, 1800);
  };

  if (preparing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12 animate-in fade-in duration-1000">
        <div className="relative">
           <div className="absolute -inset-24 bg-indigo-500/10 blur-[120px] animate-pulse rounded-full"></div>
           <div className="w-32 h-32 glass border border-white/20 rounded-[3rem] flex items-center justify-center relative z-10 shadow-2xl">
              <Cpu className="w-16 h-16 text-cyan-400 animate-spin-slow" />
           </div>
        </div>
        <div className="text-center space-y-4">
          <h3 className="luxury-text text-5xl font-black text-white uppercase tracking-tighter">Syncing Matrix (20 Nodes)</h3>
          <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Establishing Intermediate Neural Link</p>
        </div>
        <style>{`.animate-spin-slow { animation: spin 8s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-10">
        <div className="w-24 h-24 border-[10px] border-white/5 border-t-cyan-500 rounded-full animate-spin shadow-[0_0_40px_rgba(6,182,212,0.2)]"></div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-cyan-400 animate-pulse">Syncing Adaptive Matrix...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center glass rounded-[4rem] border border-white/10 space-y-8">
        <ShieldAlert className="w-20 h-20 text-red-500 mx-auto" />
        <h2 className="text-4xl font-black luxury-text text-white uppercase">Insufficient Nodes</h2>
        <p className="text-white/40 font-bold">You need at least 3 saved words to start a full intermediate exam.</p>
        <button onClick={() => onNavigate('dashboard')} className="px-10 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all">Return to Dashboard</button>
      </div>
    );
  }

  if (showResult) {
    const score = (results.filter(r => r.correct).length / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto py-12 animate-in zoom-in-95 duration-700 space-y-8 pb-32">
        <div className="glass rounded-[4rem] p-12 md:p-20 border border-white/10 text-center space-y-12 shadow-2xl relative overflow-hidden">
           <div className="absolute -top-24 -right-24 w-80 h-80 bg-cyan-500/5 blur-[100px]"></div>
           <div className={`w-32 h-32 rounded-[3rem] mx-auto flex items-center justify-center shadow-2xl ${score >= 70 ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'} transition-all duration-1000`}>
              <Trophy className="w-16 h-16 text-black" />
           </div>
           
           <div className="space-y-4">
              <h2 className="luxury-text text-7xl font-black text-white uppercase tracking-tighter">Sync Integrity</h2>
              <div className="text-[12rem] font-black brand-gradient tabular-nums drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] leading-none">{Math.round(score)}%</div>
           </div>

           <div className="bg-white/5 rounded-[3.5rem] p-12 border border-white/10 text-left space-y-8 relative group">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.5em] flex items-center gap-3">
                   <Brain className="w-6 h-6" /> Neural Analysis (Intermediate)
                </h4>
                {analyzingFeedback && <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />}
              </div>
              
              {neuralFeedback ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4">
                   <p className="text-2xl font-bold text-white leading-relaxed italic">"{neuralFeedback.summary}"</p>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 glass rounded-[2.5rem] border border-white/5 space-y-4">
                         <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                            <Target className="w-4 h-4" /> Strategic Drill
                         </p>
                         <p className="text-sm font-bold text-white/60 leading-relaxed">{neuralFeedback.improvementTip}</p>
                      </div>

                      {neuralFeedback.weakWords.length > 0 && (
                        <div className="p-8 glass rounded-[2.5rem] border border-red-500/10 space-y-4">
                           <p className="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" /> Fragmented Links
                           </p>
                           <div className="flex flex-wrap gap-2">
                              {neuralFeedback.weakWords.map((w, i) => (
                                <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase">{w}</span>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                </div>
              ) : !analyzingFeedback && (
                <p className="text-white/20 text-xs italic">Decrypting matrix results...</p>
              )}
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8">
              <button onClick={startExam} className="py-8 glass rounded-[3rem] font-black uppercase text-[12px] tracking-widest border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-3 group active:scale-95">
                 <RotateCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" /> Refresh 20 Nodes
              </button>
              <button onClick={() => onNavigate('dashboard')} className="py-8 bg-white text-black rounded-[3rem] font-black uppercase text-[12px] tracking-widest hover:bg-cyan-400 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl">
                 Commit to Memory <ChevronRight className="w-6 h-6" />
              </button>
           </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-10 animate-in fade-in duration-500 pb-40">
       <div className="flex flex-col md:flex-row justify-between items-center px-8 gap-6">
          <div className="flex items-center gap-8 w-full md:w-auto">
             <div className="w-20 h-20 glass border border-white/10 rounded-3xl flex items-center justify-center text-cyan-400 shadow-xl">
                <Target className="w-10 h-10" />
             </div>
             <div className="flex flex-col flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em]">Neural Progress: {currentIndex + 1} / {questions.length}</span>
                  <span className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.4em]">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                </div>
                <div className="w-full md:w-72 h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                   <div className="h-full bg-cyan-500 shadow-[0_0_25px_cyan] transition-all duration-1000 rounded-full" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="px-6 py-3 glass rounded-2xl border border-white/10 text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-3">
                <Activity className="w-4 h-4 animate-pulse" /> Signal Stability: {Math.max(20, 100 - (currentIndex * 2))}%
             </div>
          </div>
       </div>

       <div className="glass rounded-[4.5rem] p-12 md:p-24 border border-white/10 shadow-3xl space-y-20 relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] pointer-events-none"></div>
          
          <div className="space-y-10 relative z-10">
             <div className="flex items-center gap-6">
                <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-3 ${
                  currentQ?.type === 'context' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                  currentQ?.type === 'synonym' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                  'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}>
                   {currentQ?.type === 'context' ? <MessageSquare className="w-4 h-4" /> : currentQ?.type === 'synonym' ? <Sparkles className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                   {currentQ?.type === 'context' ? 'Intermediate Context' : currentQ?.type === 'synonym' ? 'Lexical Matching' : 'Node Identification'}
                </div>
                <div className="h-px flex-1 bg-white/5"></div>
             </div>
             
             <h3 className="text-4xl md:text-6xl font-black luxury-text text-white leading-tight tracking-tight selection:bg-cyan-500">
                {currentQ?.type === 'context' ? (
                  currentQ.question.split('_____').map((part, i) => (
                    <React.Fragment key={i}>
                      {part}
                      {i === 0 && <span className="text-cyan-400 underline decoration-cyan-500/50 underline-offset-[12px] decoration-4">_____</span>}
                    </React.Fragment>
                  ))
                ) : currentQ?.question}
             </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
             {shuffledOptions.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrect = isAnswering && opt === currentQ.correctAnswer;
                const isWrong = isAnswering && isSelected && opt !== currentQ.correctAnswer;
                const labels = ['A', 'B', 'C', 'D'];
                
                return (
                  <button 
                    key={`${currentIndex}-${opt}`} 
                    onClick={() => handleOptionSelect(opt)}
                    className={`p-10 md:p-12 rounded-[3.5rem] text-left border transition-all duration-500 relative overflow-hidden group active:scale-95 ${
                      isCorrect ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
                      isWrong ? 'bg-red-500/20 border-red-500 text-red-500' :
                      isSelected ? 'bg-white text-black shadow-3xl scale-[1.02]' :
                      'glass border-white/10 text-white/50 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                     <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-8">
                           <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-xl font-black transition-colors ${
                              isCorrect ? 'bg-emerald-500 text-black border-emerald-500' :
                              isWrong ? 'bg-red-500 text-black border-red-500' :
                              isSelected ? 'bg-black text-white border-black' :
                              'bg-white/5 text-white/30 border-white/10 group-hover:border-white/40 group-hover:text-white'
                           }`}>
                              {labels[i]}
                           </div>
                           <span className="text-2xl md:text-3xl font-black tracking-tight">{opt}</span>
                        </div>
                        {isCorrect && <CheckCircle2 className="w-10 h-10" />}
                        {isWrong && <XCircle className="w-10 h-10" />}
                     </div>
                  </button>
                );
             })}
          </div>

          {isAnswering && (
            <div className="animate-in slide-in-from-top-12 duration-1000 p-12 bg-white/5 backdrop-blur-2xl rounded-[4rem] border border-white/10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative z-10">
               <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0 border border-cyan-500/20">
                  <Fingerprint className="w-8 h-8" />
               </div>
               <div className="space-y-3">
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">Intermediate Decryption</p>
                  <p className="text-xl font-bold text-white leading-relaxed italic">"{currentQ?.explanation}"</p>
               </div>
            </div>
          )}
       </div>

       <div className="flex justify-center gap-4 opacity-30 px-8">
          <Shield className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Anti-Bias Protocol: High Shuffling Mode</span>
       </div>
    </div>
  );
};

export default ExamsView;
