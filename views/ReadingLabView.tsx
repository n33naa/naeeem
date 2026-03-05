
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Loader2, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  Volume2,
  Sparkles,
  Target,
  Lightbulb,
  ArrowRight,
  PenTool,
  FileText,
  PlusCircle,
  Flag,
  Settings
} from 'lucide-react';
import { analyzeReading, generateStory, analyzeWordInContext } from '../services/geminiService';
import { Flashcard } from '../types';

interface ReadingLabViewProps {
  onSaveToFlashcards: (card: Flashcard) => void;
}

const ReadingLabView: React.FC<ReadingLabViewProps> = ({ onSaveToFlashcards }) => {
  const [inputText, setInputText] = useState('');
  const [storyTopic, setStoryTopic] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const [mode, setMode] = useState<'paste' | 'generate'>('paste');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [generatedStoryText, setGeneratedStoryText] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [lookupWord, setLookupWord] = useState<any>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [popupPos, setPopupPos] = useState<{ x: number, y: number, isBelow?: boolean, arrowOffset?: number } | null>(null);

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLookupWord(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];

  const UKFlag = () => (
    <svg width="18" height="18" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-full overflow-hidden border border-white/20">
      <rect width="60" height="60" fill="#012169"/>
      <path d="M0 0L60 60M60 0L0 60" stroke="white" strokeWidth="6"/>
      <path d="M0 0L60 60M60 0L0 60" stroke="#C8102E" strokeWidth="4"/>
      <path d="M30 0V60M0 30H60" stroke="white" strokeWidth="10"/>
      <path d="M30 0V60M0 30H60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );

  const handleAnalyze = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeReading(textToAnalyze);
      setAnalysis(result);
      setQuizAnswers({});
      setShowResults(false);
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAndAnalyze = async () => {
    if (!storyTopic.trim()) return;
    setIsGenerating(true);
    try {
      const story = await generateStory(storyTopic, selectedLevel);
      setGeneratedStoryText(story);
      await handleAnalyze(story);
    } catch (error) {
      console.error("Story generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWordClick = async (e: React.MouseEvent, word: string, contextParagraph: string) => {
    const cleanWord = word.replace(/[.,!?;:()"]/g, "").trim();
    if (!cleanWord || cleanWord.length < 2) return;
    
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    console.log('Word Clicked Rect:', rect);
    
    // Calculate position with a safety margin from the top
    const popupHeight = 260; // Height + padding
    const popupWidth = 240;
    const padding = 16;
    
    const wordCenter = rect.left + rect.width / 2;
    let x = wordCenter;
    const isBelow = rect.top < popupHeight;
    const y = isBelow ? rect.bottom : rect.top;

    // Horizontal containment
    if (x - popupWidth / 2 < padding) {
      x = popupWidth / 2 + padding;
    } else if (x + popupWidth / 2 > window.innerWidth - padding) {
      x = window.innerWidth - popupWidth / 2 - padding;
    }

    const arrowOffset = wordCenter - x;

    console.log('Word Clicked:', { cleanWord, x, y, isBelow, arrowOffset, rect });

    setPopupPos({ x, y, isBelow, arrowOffset });
    
    setIsLookingUp(true);
    setLookupWord({ word: cleanWord, arabic: '', definition: '', phonetic: '', partOfSpeech: '' });

    try {
      const result = await analyzeWordInContext(cleanWord, contextParagraph);
      setLookupWord({ ...result, word: cleanWord });
      speak(cleanWord);
    } catch (error) {
      console.error("Word lookup failed", error);
    } finally {
      setIsLookingUp(false);
    }
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const handleSaveWord = (wordObj: any) => {
    const card: Flashcard = {
      id: Math.random().toString(36).substr(2, 9),
      word: wordObj.word,
      meaning: wordObj.arabic,
      examples: [wordObj.definition],
      level: 0,
      nextReview: Date.now()
    };
    onSaveToFlashcards(card);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto py-8 px-4 space-y-12 pb-32"
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-500/10 text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
             <BookOpen className="w-4 h-4" /> Neural Reading Lab
          </div>
          <h2 className="luxury-text text-4xl sm:text-6xl md:text-8xl brand-gradient font-black tracking-tighter uppercase italic leading-none">Reading Lab</h2>
          <p className="text-slate-400 font-bold text-sm md:text-lg px-4">Paste any English text for a deep linguistic breakdown and comprehension test.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!analysis && !isAnalyzing && !isGenerating && (
            <motion.div 
              key="input-mode"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Mode Switcher */}
              <div className="flex justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('paste')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl border transition-all ${mode === 'paste' ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Paste Text</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setMode('generate')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-2xl border transition-all ${mode === 'generate' ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                >
                  <PenTool className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Generate Story</span>
                </motion.button>
              </div>

              <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 border border-white/10 shadow-2xl space-y-8">
                {mode === 'paste' ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your text here (news articles, stories, essays...)"
                      className="w-full h-48 md:h-64 bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white text-base md:text-lg focus:outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-white/20"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnalyze(inputText)}
                      disabled={!inputText.trim()}
                      className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <Sparkles className="w-5 h-5" />
                      Initialize Linguistic Scan
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <p className="text-white/60 font-black uppercase text-[10px] tracking-widest text-center">Neural Level Selection</p>
                        <div className="flex justify-center gap-2">
                          {levels.map(lvl => (
                            <motion.button
                              key={lvl}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSelectedLevel(lvl)}
                              className={`w-14 h-14 rounded-2xl border font-black transition-all flex items-center justify-center ${selectedLevel === lvl ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white'}`}
                            >
                              {lvl}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-white/60 font-medium text-center">What should the story be about?</p>
                        <input
                          type="text"
                          value={storyTopic}
                          onChange={(e) => setStoryTopic(e.target.value)}
                          placeholder="e.g., A futuristic city, A mystery in the woods, Space exploration..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 px-8 text-white text-xl focus:outline-none focus:border-indigo-500 transition-all placeholder:text-white/10"
                        />
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateAndAnalyze}
                      disabled={!storyTopic.trim()}
                      className="w-full py-6 bg-indigo-500 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-indigo-500/20"
                    >
                      <PenTool className="w-5 h-5" />
                      Generate {selectedLevel} Neural Story
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {(isAnalyzing || isGenerating) && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="w-12 h-12 text-indigo-500 animate-pulse" />
                </div>
              </div>
              <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-xs animate-pulse">
                {isGenerating ? 'Weaving Narrative Threads...' : 'Deconstructing Syntax...'}
              </p>
            </motion.div>
          )}

          {analysis && !isAnalyzing && !isGenerating && (
            <motion.div 
              key="analysis-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              {/* Story Content if generated */}
              {(generatedStoryText || inputText) && (
                <div className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 border border-white/10 space-y-6 md:space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                      <PenTool className="w-4 h-4" /> {generatedStoryText ? 'Generated Narrative' : 'Analyzed Text'}
                    </h3>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Click any word for instant lookup</p>
                  </div>
                  <div className="space-y-6 md:space-y-8">
                    {(generatedStoryText || inputText).split(/\n+/).map((paragraph, pIdx) => (
                      <p key={pIdx} className="text-lg sm:text-xl md:text-2xl text-white/80 leading-[1.7] md:leading-[1.8] font-serif tracking-wide">
                        {paragraph.split(/\s+/).map((word, wIdx) => (
                          <motion.span 
                            key={wIdx} 
                            whileHover={{ scale: 1.1, color: '#818cf8' }}
                            onClick={(e) => handleWordClick(e, word, paragraph)}
                            className="cursor-pointer hover:bg-indigo-500/10 rounded px-0.5 transition-all inline-block"
                          >
                            {word}{' '}
                          </motion.span>
                        ))}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="lg:col-span-2 glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white/10 space-y-4 md:space-y-6"
                >
                  <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Executive Summary
                  </h3>
                  <p className="text-lg md:text-2xl font-bold leading-relaxed text-white/90 italic">
                    "{analysis.summary}"
                  </p>
                </motion.div>
                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="glass rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-white/10 flex flex-col items-center justify-center text-center space-y-2 md:space-y-4"
                >
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Linguistic Complexity</p>
                  <div className="text-5xl md:text-7xl font-black text-indigo-400 luxury-text">{analysis.cefrLevel}</div>
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">CEFR Standard</p>
                </motion.div>
              </div>

              {/* Vocabulary Matrix */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">Vocabulary Matrix</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analysis.keyVocabulary.map((word: any, idx: number) => (
                    <motion.div 
                      key={idx} 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass rounded-[2.5rem] p-8 border border-white/10 space-y-4 group hover:border-indigo-500/50 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <h5 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{word.word}</h5>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => speak(word.word)} className="p-2 bg-white/5 rounded-xl text-white/40 hover:text-white transition-colors">
                          <Volume2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-white/40 font-medium italic">{word.phonetic}</p>
                        <p className="text-xl font-bold text-indigo-400 text-right" dir="rtl">{word.arabic}</p>
                        <p className="text-xs text-white/60 leading-relaxed">{word.definition}</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSaveWord(word)}
                        className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                      >
                        Add to Deck
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Grammar Insights */}
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] ml-4">Grammar Insights</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {analysis.grammarInsights.map((insight: any, idx: number) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass rounded-[3rem] p-10 border border-white/10 space-y-6 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                            <Lightbulb className="w-6 h-6 text-emerald-400" />
                          </div>
                          <h5 className="text-lg font-black text-white uppercase">{insight.point}</h5>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{insight.explanation}</p>
                        <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-2">In Context:</p>
                          <p className="text-sm font-bold italic text-white/80">"{insight.example}"</p>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>

              {/* Comprehension Quiz */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-12 border border-white/10 space-y-8 md:space-y-12 shadow-2xl"
              >
                <div className="text-center space-y-2">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Comprehension Test</h4>
                  <h3 className="text-2xl md:text-3xl font-black text-white uppercase">Neural Verification</h3>
                </div>

                <div className="space-y-12">
                  {analysis.comprehensionQuiz.map((q: any, qIdx: number) => (
                    <div key={qIdx} className="space-y-6">
                      <div className="flex gap-4">
                        <span className="text-2xl font-black text-white/10">0{qIdx + 1}</span>
                        <p className="text-xl font-bold text-white">{q.question}</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12">
                        {q.options.map((opt: string, oIdx: number) => {
                          const isSelected = quizAnswers[qIdx] === opt;
                          const isCorrect = opt === q.correctAnswer;
                          const showFeedback = showResults;

                          return (
                            <motion.button
                              key={oIdx}
                              disabled={showResults}
                              whileHover={!showResults ? { scale: 1.02 } : {}}
                              whileTap={!showResults ? { scale: 0.98 } : {}}
                              onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: opt }))}
                              className={`p-6 rounded-3xl border text-left transition-all flex items-center justify-between ${
                                isSelected 
                                  ? (showFeedback ? (isCorrect ? 'bg-emerald-500/20 border-emerald-500' : 'bg-red-500/20 border-red-500') : 'bg-indigo-500/20 border-indigo-500')
                                  : (showFeedback && isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10 hover:border-white/20')
                              }`}
                            >
                              <span className={`font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>{opt}</span>
                              {showFeedback && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                              {showFeedback && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
                            </motion.button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {showResults && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="ml-12 p-6 bg-white/5 rounded-2xl border border-white/5 overflow-hidden"
                          >
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-2">Neural Explanation</p>
                            <p className="text-sm text-white/60 italic">{q.explanation}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {!showResults ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(quizAnswers).length < analysis.comprehensionQuiz.length}
                    className="w-full py-6 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-400 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    Submit Verification
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setAnalysis(null); setInputText(''); setGeneratedStoryText(null); setStoryTopic(''); }}
                    className="w-full py-6 bg-indigo-500 text-white rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                  >
                    New Simulation <ArrowRight className="w-5 h-5" />
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Word Lookup Popup - Moved outside of all animated containers */}
      <AnimatePresence>
        {lookupWord && popupPos && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70]" 
              onClick={() => setLookupWord(null)}
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: popupPos.isBelow ? 10 : -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: popupPos.isBelow ? 10 : -10 }}
              className="fixed z-[80] pointer-events-none"
              style={{ 
                top: popupPos.isBelow ? `${popupPos.y + 12}px` : `${popupPos.y - 12}px`,
                left: `${popupPos.x}px`,
                transform: popupPos.isBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)'
              }}
            >
              <div className="bg-[#333a45] rounded-2xl border border-white/10 shadow-2xl flex flex-col pointer-events-auto w-[240px] overflow-hidden relative">
                {/* Tooltip Arrow - Top or Bottom */}
                {popupPos.isBelow ? (
                  <div 
                    className="absolute top-0 -translate-x-1/2 -translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#333a45]"
                    style={{ left: `calc(50% + ${popupPos.arrowOffset || 0}px)` }}
                  ></div>
                ) : (
                  <div 
                    className="absolute bottom-0 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#333a45]"
                    style={{ left: `calc(50% + ${popupPos.arrowOffset || 0}px)` }}
                  ></div>
                )}
                
                {isLookingUp ? (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Analyzing...</span>
                  </div>
                ) : (
                  <>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <Flag className="w-4 h-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
                        <Settings className="w-4 h-4 text-white/40 hover:text-white cursor-pointer transition-colors" />
                      </div>
                      <div className="flex items-center gap-2">
                        <UKFlag />
                        <div className="flex items-center gap-1.5 bg-white/10 rounded-full pl-3 pr-1 py-1">
                          <span className="text-[11px] font-bold text-white">{lookupWord.word}</span>
                          <button 
                            onClick={() => speak(lookupWord.word)}
                            className="p-1.5 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-4 py-4 flex flex-col items-end text-right space-y-1">
                      <span className="text-[10px] font-medium text-white/40">{lookupWord.partOfSpeech || 'word'}</span>
                      <span className="text-2xl font-black text-white leading-tight">{lookupWord.arabic || '...'}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 p-3 pt-0">
                      <button 
                        onClick={() => setLookupWord(null)}
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                      >
                        Know
                      </button>
                      <button 
                        onClick={() => {
                          handleSaveWord({ word: lookupWord.word, arabic: lookupWord.arabic, definition: lookupWord.definition });
                          setLookupWord(null);
                        }}
                        className="flex-1 py-3 bg-[#fcc45c] hover:bg-[#fbb02d] text-black rounded-xl text-[11px] font-black uppercase tracking-wider transition-all"
                      >
                        Learn
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReadingLabView;
