
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import DashboardView from './views/DashboardView';
import TranslateView from './views/TranslateView';
import ConversationView from './views/ConversationView';
import FlashcardsView from './views/FlashcardsView';
import WritingView from './views/WritingView';
import DailyWordsView from './views/DailyWordsView';
import ExamsView from './views/ExamsView';
import SlangView from './views/SlangView';
import ReadingLabView from './views/ReadingLabView';
import AuthView from './components/AuthView';
import { AppView, Flashcard, UserStats } from './types';
import { SecurityService } from './services/securityService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [theme, setTheme] = useState<'space' | 'light'>('space');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [sessionWords, setSessionWords] = useState<string[]>([]);
  const [isSlangExam, setIsSlangExam] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    xp: 0,
    level: 1,
    wordsLearned: 0,
    minutesSpoken: 0,
    streakDays: 1,
    lastActive: Date.now(),
    examsPassed: 0,
    avgScore: 0
  });

  const handleLogin = (key: string) => {
    setUserKey(key);
    const hashedKey = SecurityService.hashKey(key);
    const savedData = localStorage.getItem(`elite_identity_${hashedKey}`);
    
    if (savedData) {
      try {
        // Try to decrypt first
        const decrypted = SecurityService.decryptData(savedData, key);
        const parsed = decrypted || JSON.parse(savedData); // Fallback to plain JSON for migration
        
        setFlashcards(parsed.flashcards || []);
        setStats(parsed.stats || {
          xp: 0, level: 1, wordsLearned: 0, minutesSpoken: 0,
          streakDays: 1, lastActive: Date.now(), examsPassed: 0, avgScore: 0
        });
      } catch (e) { console.error("Identity load failed", e); }
    } else {
      setFlashcards([]);
      setStats({
        xp: 0, level: 1, wordsLearned: 0, minutesSpoken: 0,
        streakDays: 1, lastActive: Date.now(), examsPassed: 0, avgScore: 0
      });
    }
    setIsAuthorized(true);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('elite-theme') as 'space' | 'light';
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (isAuthorized && userKey) {
      const dataToSave = { flashcards, stats };
      const hashedKey = SecurityService.hashKey(userKey);
      const encryptedData = SecurityService.encryptData(dataToSave, userKey);
      localStorage.setItem(`elite_identity_${hashedKey}`, encryptedData);
    }
    localStorage.setItem('elite-theme', theme);
    if (theme === 'light') document.body.classList.add('theme-light');
    else document.body.classList.remove('theme-light');
  }, [flashcards, stats, theme, isAuthorized, userKey]);

  const toggleTheme = () => setTheme(prev => prev === 'space' ? 'light' : 'space');

  const addXp = (amount: number, additionalStats?: Partial<UserStats>) => {
    setStats(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      return { ...prev, ...additionalStats, xp: newXp, level: newLevel };
    });
  };

  const handleSaveToFlashcards = (card: Flashcard | string, isMasteryUpdate = false) => {
    setFlashcards(prev => {
      const wordToFind = typeof card === 'string' ? card.toLowerCase() : card.word.toLowerCase();
      const existingIndex = prev.findIndex(c => c.word.toLowerCase() === wordToFind);
      
      if (existingIndex > -1) {
        if (isMasteryUpdate) {
          const updated = [...prev];
          const item = updated[existingIndex];
          const newLevel = Math.min(5, item.level + 1);
          const intervals = [3600000, 86400000, 259200000, 604800000, 1296000000, 2592000000];
          item.level = newLevel;
          item.nextReview = Date.now() + intervals[newLevel];
          return updated;
        }
        return prev;
      }

      if (typeof card === 'object') {
        addXp(50, { wordsLearned: stats.wordsLearned + 1 });
        return [card, ...prev];
      }
      return prev;
    });
  };

  const updateMasteryFromExam = (wordStats: {word: string, correct: boolean}[]) => {
    setFlashcards(prev => {
      return prev.map(card => {
        const result = wordStats.find(rs => rs.word.toLowerCase() === card.word.toLowerCase());
        if (result) {
          const newLevel = result.correct ? Math.min(5, card.level + 1) : Math.max(0, card.level - 1);
          const intervals = [0, 3600000, 86400000, 259200000, 604800000, 1296000000];
          return { ...card, level: newLevel, nextReview: Date.now() + intervals[newLevel] };
        }
        return card;
      });
    });
  };

  const startSlangExam = (phrases: string[]) => {
    setSessionWords(phrases);
    setIsSlangExam(true);
    setActiveView(AppView.EXAMS);
  };

  if (!isAuthorized) {
    return <AuthView onLogin={handleLogin} />;
  }

  return (
    <Layout activeView={activeView} onViewChange={(v) => { setActiveView(v); if(v !== AppView.EXAMS) { setIsSlangExam(false); setSessionWords([]); } }} theme={theme} onToggleTheme={toggleTheme}>
      {activeView === AppView.DASHBOARD && <DashboardView stats={stats} onNavigate={setActiveView} />}
      {activeView === AppView.TRANSLATE && <TranslateView onSaveToFlashcards={(c) => handleSaveToFlashcards(c)} />}
      {activeView === AppView.CONVERSATION && <ConversationView />}
      {activeView === AppView.SLANG && <SlangView onStartExam={startSlangExam} />}
      {activeView === AppView.FLASHCARDS && <FlashcardsView cards={flashcards} onUpdateCard={(card) => { setFlashcards(p => p.map(c => c.id === card.id ? card : c)); addXp(10); }} />}
      {activeView === AppView.WRITING && <WritingView />}
      {activeView === AppView.READING_LAB && <ReadingLabView onSaveToFlashcards={(c) => handleSaveToFlashcards(c)} />}
      {activeView === AppView.DAILY_WORDS && <DailyWordsView learnedWords={flashcards} onCompleteWord={(w, mastered) => { handleSaveToFlashcards(w, mastered); addXp(25); }} onFinishChallenge={(wordsLearned) => { setSessionWords(wordsLearned); setIsSlangExam(false); setActiveView(AppView.EXAMS); }} />}
      {activeView === AppView.EXAMS && (
        <ExamsView 
          flashcards={flashcards} predefinedWords={sessionWords.length > 0 ? sessionWords : undefined} onNavigate={setActiveView} 
          onExamPassed={(score, wordStats) => {
            const xpMultiplier = isSlangExam ? 20 : (sessionWords.length > 0 ? 15 : 8);
            addXp(Math.floor(score * xpMultiplier), {
              examsPassed: stats.examsPassed + 1,
              avgScore: Math.floor((stats.avgScore * stats.examsPassed + score) / (stats.examsPassed + 1))
            });
            if (!isSlangExam) updateMasteryFromExam(wordStats);
            setSessionWords([]);
            setIsSlangExam(false);
          }}
        />
      )}
    </Layout>
  );
};

export default App;
