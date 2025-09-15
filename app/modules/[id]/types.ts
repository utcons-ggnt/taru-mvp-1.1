export interface BookmarkItem {
  id: string;
  title: string;
  content: string;
  text: string;
  context?: string;
  notes?: string;
  timestamp: number;
  pageNumber?: number;
  chapter?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  pageNumber?: number;
  chapter?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface HighlightItem {
  id: string;
  text: string;
  color: string;
  timestamp: number;
  pageNumber?: number;
  chapter?: string;
  createdAt: Date;
}

export interface ModuleSession {
  moduleId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  progress: number;
  status: 'active' | 'paused' | 'completed';
  lastAccessedAt: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  prerequisites: string[];
}

export interface AssessmentResult {
  id: string;
  moduleId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  completedAt: Date;
  answers: Array<{
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
}

export interface ProgressData {
  moduleId: string;
  userId: string;
  overallProgress: number;
  contentProgress: Array<{
    contentId: string;
    progress: number;
    status: 'not-started' | 'in-progress' | 'completed';
  }>;
  timeSpent: number;
  lastAccessedAt: Date;
  achievements: string[];
  badges: string[];
}

export interface Message {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  audioUrl?: string;
  language?: string;
  isTyping?: boolean;
}

export type ActionType = 'read' | 'explain' | 'define' | 'translate' | 'summarize';

export interface FlashCardType {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SpeechProgress {
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'stopped' | 'error';
  progress: number;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

export interface AIResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  content?: string;
  suggestions?: string[];
  relatedQuestions?: string[];
  confidence?: number;
}

export interface LearningContext {
  moduleId?: string;
  userId?: string;
  content?: string;
  type?: 'text' | 'video' | 'quiz' | 'assignment';
  metadata?: any;
  pdfContent?: string;
  videoData?: any;
  currentTime?: number;
  selectedText?: string;
  bookmarks?: any[];
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

export interface N8NAssessmentResponse {
  success: boolean;
  questions: MCQQuestion[];
  totalQuestions: number;
  difficulty: string;
  topics: string[];
  estimatedTime: number;
  output?: string;
}