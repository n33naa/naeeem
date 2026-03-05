
import React, { useState } from 'react';
import { 
  Zap, 
  Brain, 
  Target, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Sparkles,
  Book,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Lightbulb,
  Search
} from 'lucide-react';
import { generateGrammarLesson } from '../services/geminiService';

const GRAMMAR_TOPICS = [
  { id: 1, topic: "Present Perfect vs Past Simple", category: "Core", difficulty: "Intermediate" },
  { id: 2, topic: "Conditionals (Zero, 1st, 2nd, 3rd)", category: "Core", difficulty: "Intermediate" },
  { id: 3, topic: "Passive Voice", category: "Core", difficulty: "Intermediate" },
  { id: 4, topic: "Relative Clauses", category: "Core", difficulty: "Intermediate" },
  { id: 5, topic: "Modal Verbs of Deduction", category: "Advanced", difficulty: "Hard" },
  { id: 6, topic: "Reported Speech", category: "Core", difficulty: "Intermediate" },
  { id: 7, topic: "Gerunds and Infinitives", category: "Core", difficulty: "Intermediate" },
  { id: 8, topic: "Articles (A, An, The, Zero)", category: "Core", difficulty: "Beginner" },
  { id: 9, topic: "Mixed Conditionals", category: "Advanced", difficulty: "Hard" },
  { id: 10, topic: "Inversion for Emphasis", category: "Mastery", difficulty: "Expert" },
  { id: 11, topic: "Cleft Sentences", category: "Advanced", difficulty: "Hard" },
  { id: 12, topic: "Subjunctive Mood", category: "Mastery", difficulty: "Expert" },
  { id: 13, topic: "Participle Clauses", category: "Advanced", difficulty: "Hard" },
  { id: 14, topic: "Advanced Punctuation", category: "Advanced", difficulty: "Hard" },
  { id: 15, topic: "Parallel Structure", category: "Advanced", difficulty: "Intermediate" },
  { id: 16, topic: "Phrasal Verbs: Advanced", category: "Mastery", difficulty: "Expert" },
];

const GrammarMatrixView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [currentStep, setCurrentStep] = useState<'rules' | 'mistakes' | 'quiz'>('rules');

  const categories = ["All", "Core", "Advanced", "Mastery"];

  const filteredTopics = GRAMMAR_TOPICS.filter(t => {
    const matchesSearch = t.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || t.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStartLesson = async (topic: string) => {
    setSelectedTopic(topic);
    setIsLoading(true);
    setCurrentStep('rules');
    try {
      const result = await generateGrammarLesson(topic);
      setLesson(result);
      setQuizAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error("Lesson generation failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedTopic) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-6 animate-in fade-in duration-700 pb-32">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-purple-500/10 text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
             <Brain className="w-4 h-4" /> Neural Grammar Matrix
          </div>
          <h2 className="luxury-text text-6xl md:text-9xl brand-gradient font-black tracking-tighter uppercase italic leading-none">Grammar Matrix</h2>
          <p className="text-slate-400 font-bold text-lg max-w-2xl mx-auto">Master the structural architecture of the English language through neural simulations.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="flex gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'text-white/40 hover:text-white'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search neural nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-white/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredTopics.map((t) => (
            <button
              key={t.id}
              onClick={() => handleStartLesson(t.topic)}
              className="group glass rounded-[2.5rem] p-8 border border-white/10 text-left hover:border-purple-500/50 transition-all hover:-translate-y-2 shadow-xl relative overflow-hidden flex flex-col h-[320px]"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-all"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-all shadow-lg">
                  <Book className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Difficulty</p>
                  <p className="text-[10px] font-black text-purple-400 uppercase">{t.difficulty}</p>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <p className="text-[9px] font-black text-purple-400/50 uppercase tracking-widest">{t.category}</p>
                <h3 className="text-2xl font-black text-white uppercase leading-tight group-hover:text-purple-400 transition-colors">{t.topic}</h3>
              </div>

              <div className="mt-auto flex items-center justify-between w-full pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest">
                  Mastery: <span className="text-white/40">0%</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  Sync <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-8">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/20 rounded-full animate-ping"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className="w-12 h-12 text-purple-500 animate-pulse" />
          </div>
        </div>
        <p className="text-purple-400 font-black uppercase tracking-[0.5em] text-xs animate-pulse">Downloading Grammar Rules...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-12 animate-in slide-in-from-bottom-10 duration-700 pb-32">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => setSelectedTopic(null)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-black transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Back to Matrix
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Active Simulation</p>
            <p className="text-xs font-black text-purple-400 uppercase">{selectedTopic}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {lesson && (
        <div className="space-y-16">
          {/* Progress Tracker */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { id: 'rules', label: 'Neural Rules', icon: Book },
              { id: 'mistakes', label: 'Error Nodes', icon: AlertTriangle },
              { id: 'quiz', label: 'Verification', icon: Target }
            ].map((step, i) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id as any)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${
                    currentStep === step.id 
                      ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{step.label}</span>
                </button>
                {i < 2 && <div className="w-8 h-px bg-white/10"></div>}
              </React.Fragment>
            ))}
          </div>

          {/* Hero Header - Editorial Recipe */}
          <div className="relative py-20 px-10 glass rounded-[4rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
            <div className="relative z-10 space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px w-12 bg-purple-500/50"></div>
                  <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.5em]">Neural Lesson Node</h4>
                </div>
                <h2 className="text-6xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-[0.85] max-w-4xl">
                  {lesson.title}
                </h2>
              </div>
              <div className="flex flex-col md:flex-row gap-12 items-start">
                <div className="flex-1">
                  <p className="text-2xl md:text-3xl text-white/80 font-medium leading-relaxed italic border-l-4 border-purple-500 pl-8">
                    "{lesson.concept}"
                  </p>
                </div>
                <div className="w-full md:w-64 space-y-6 shrink-0">
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Complexity</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? 'bg-purple-500' : 'bg-white/10'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/40">
                    <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest">AI Generated Lesson</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections based on currentStep */}
          {currentStep === 'rules' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="flex items-center gap-4 ml-4">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Structural Rules</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 rounded-[3rem] overflow-hidden">
                {lesson.rules.map((rule: any, idx: number) => (
                  <div key={idx} className="p-12 border-white/10 border-b md:border-b-0 md:border-r last:border-r-0 group hover:bg-white/[0.02] transition-all">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-500/50 font-mono tracking-widest">RULE_0{idx + 1}</span>
                        <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                      <h5 className="text-2xl font-black text-white uppercase leading-tight">{rule.rule}</h5>
                      <div className="space-y-4">
                        <p className="text-[8px] font-black text-purple-400 uppercase tracking-widest">Usage Example</p>
                        <div className="p-6 bg-black/40 rounded-2xl border border-white/5 font-mono text-sm text-white/80 italic">
                          "{rule.example}"
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setCurrentStep('mistakes')}
                  className="px-12 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:bg-purple-400 transition-all shadow-2xl"
                >
                  Analyze Error Nodes
                </button>
              </div>
            </div>
          )}

          {currentStep === 'mistakes' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="flex items-center gap-4 ml-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Neural Warning: Common Errors</h4>
              </div>
              <div className="grid grid-cols-1 gap-6">
                {lesson.commonMistakes.map((m: any, idx: number) => (
                  <div key={idx} className="glass rounded-[3rem] p-12 border border-red-500/20 flex flex-col md:flex-row gap-12 items-center bg-red-500/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
                    <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                            <XCircle className="w-3 h-3" /> The Mistake
                          </p>
                          <p className="text-2xl font-bold text-white/40 line-through italic font-mono">"{m.mistake}"</p>
                        </div>
                        <div className="space-y-3">
                          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3" /> The Correction
                          </p>
                          <p className="text-2xl font-bold text-emerald-400 italic font-mono">"{m.correction}"</p>
                        </div>
                      </div>
                      <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-2">Neural Explanation</p>
                        <p className="text-lg text-white/60 font-medium italic leading-relaxed">{m.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setCurrentStep('quiz')}
                  className="px-12 py-5 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-[0.3em] hover:bg-purple-400 transition-all shadow-2xl"
                >
                  Begin Verification
                </button>
              </div>
            </div>
          )}

          {currentStep === 'quiz' && (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
              <div className="glass rounded-[4rem] p-16 border border-white/10 space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 blur-[100px] -mr-48 -mt-48"></div>
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 text-purple-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-purple-500/20">
                    Verification Protocol
                  </div>
                  <h3 className="text-5xl font-black text-white uppercase tracking-tighter italic">Neural Quiz</h3>
                </div>

                <div className="space-y-16">
                  {lesson.practiceQuiz.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-8">
                      <div className="flex gap-6 items-start">
                        <span className="text-4xl font-black text-white/10 font-mono">0{qIdx + 1}</span>
                        <p className="text-2xl font-bold text-white leading-tight pt-1">{q.question}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-16">
                        {q.options.map((opt: string, oIdx: number) => {
                          const isSelected = quizAnswers[qIdx] === opt;
                          const isCorrect = opt === q.correctAnswer;
                          const showFeedback = showResults;

                          return (
                            <button
                              key={oIdx}
                              disabled={showResults}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                              className={`p-8 rounded-[2rem] border text-left transition-all flex items-center justify-between group relative overflow-hidden ${
                                isSelected 
                                  ? (showFeedback ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500') : 'bg-purple-500/20 border-purple-500')
                                  : (showFeedback && isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-white/20')
                              }`}
                            >
                              <span className={`text-lg font-bold transition-colors ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{opt}</span>
                              {showFeedback && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                              {showFeedback && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                            </button>
                          );
                        })}
                      </div>
                      {showResults && (
                        <div className="ml-16 p-8 bg-white/5 rounded-[2rem] border border-white/5 animate-in slide-in-from-top-4 duration-700">
                          <div className="flex items-center gap-3 mb-4">
                            <Lightbulb className="w-4 h-4 text-purple-400" />
                            <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Neural Insight</p>
                          </div>
                          <p className="text-lg text-white/60 italic leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-12 border-t border-white/5">
                  {!showResults ? (
                    <button
                      onClick={() => setShowResults(true)}
                      disabled={Object.keys(quizAnswers).length < lesson.practiceQuiz.length}
                      className="w-full py-8 bg-white text-black rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] hover:bg-purple-400 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl shadow-white/10"
                    >
                      Verify Neural Mastery
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row gap-4">
                      <button
                        onClick={() => {
                          setShowResults(false);
                          setQuizAnswers({});
                        }}
                        className="flex-1 py-8 bg-white/5 text-white border border-white/10 rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] hover:bg-white/10 transition-all"
                      >
                        Retry Simulation
                      </button>
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="flex-1 py-8 bg-purple-500 text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.4em] hover:bg-purple-600 transition-all shadow-2xl shadow-purple-500/20"
                      >
                        Return to Matrix
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarMatrixView;
