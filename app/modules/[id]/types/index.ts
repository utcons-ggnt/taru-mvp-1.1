export type ActionType = 'read' | 'explain' | 'define' | 'translate' | 'summarize' | 'general' | 'video_analytics' | 'transcript_analysis' | 'transcript_generated' | 'transcript_segment_clicked';

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  language?: string;
}

export interface VideoData {
  id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  transcript?: VideoTranscript[];
}

export interface VideoTranscript {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface FlashCardType {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
}

export interface BookmarkItem {
  id: string;
  text: string;
  context: string;
  timestamp: number;
  notes?: string;
  tags: string[];
  createdAt: Date;
}

export interface ExplanationResult {
  explanation: string;
  examples: string[];
  relatedTopics: string[];
  difficulty: string;
}

export interface SpeechProgress {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'error';
}

export interface MCQQuestion {
  Q: string;
  level: string;
  question: string;
  options: string[];
  answer: string;
}

export interface N8NAssessmentResponse {
  output: string;
}

export interface LearningContext {
  pdfContent: string;
  videoData: VideoData | null;
  currentTime: number;
  selectedText: string;
  bookmarks: BookmarkItem[];
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  relatedQuestions: string[];
  confidence: number;
}

export interface UserPreferences {
  language: string;
  voiceSpeed: number;
  autoPlay: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
}

export interface LearningProgress {
  moduleId: string;
  completedSections: string[];
  timeSpent: number;
  quizScores: Record<string, number>;
  bookmarks: BookmarkItem[];
  lastAccessed: Date;
} 