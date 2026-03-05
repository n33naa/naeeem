
export enum AppView {
  DASHBOARD = 'dashboard',
  TRANSLATE = 'translate',
  CONVERSATION = 'conversation',
  FLASHCARDS = 'flashcards',
  WRITING = 'writing',
  DAILY_WORDS = 'daily_words',
  EXAMS = 'exams',
  SLANG = 'slang',
  READING_LAB = 'reading_lab'
}

export enum DifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface UserStats {
  xp: number;
  level: number;
  wordsLearned: number;
  minutesSpoken: number;
  streakDays: number;
  lastActive: number;
  examsPassed: number;
  avgScore: number;
}

export interface Flashcard {
  id: string;
  word: string;
  meaning: string;
  imageUrl?: string;
  examples: string[];
  level: number; 
  nextReview: number;
}

export interface ExamQuestion {
  id: string;
  targetWord: string;
  type: 'definition' | 'context' | 'synonym' | 'audio';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface SlangWord {
  phrase: string;
  meaning: string;
  arabicEquivalent: string;
  origin: string;
  examples: {
    english: string;
    arabic: string;
  }[];
}

export interface NeuralFeedback {
  summary: string;
  weakWords: string[];
  improvementTip: string;
}

export interface TranslationResult {
  word: string;
  phonetic: string;
  cefrLevel: string;
  arabicMeaning: string;
  partOfSpeech: string;
  frequency: string;
  synonyms: string[];
  collocations: string[];
  examples: {
    english: string;
    arabic: string;
  }[];
}

export interface DailyWord {
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  synonyms: string[];
  examples: {
    english: string;
    arabic: string;
  }[];
}

export interface WritingCorrection {
  original: string;
  basicCorrection: string;
  corrected: string;
  improvements: string;
  tone: string;
  cefrLevel: string;
  flowFeedback: string;
  errors: {
    type: string;
    error: string;
    explanation: string;
    rule?: string;
  }[];
  vocabularyUpgrades: {
    original: string;
    upgrade: string;
    reason: string;
  }[];
}

export interface WritingPrompt {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
}

export interface RephraseResult {
  original: string;
  variations: {
    tone: string;
    text: string;
  }[];
}
