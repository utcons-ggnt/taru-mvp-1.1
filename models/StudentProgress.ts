import mongoose from 'mongoose';

export interface IVideoProgress {
  videoUrl: string;
  watchTime: number; // in seconds
  totalDuration: number; // in seconds
  completed: boolean;
  lastWatchedAt: Date;
  engagementScore: number; // 0-100
  playbackRate: number;
  seekCount: number;
}

export interface IQuizAttempt {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  skillTags: string[];
}

export interface IInteractiveProgress {
  type: 'coding' | 'simulation' | 'drag-drop' | 'matching' | 'fill-blank';
  attempts: number;
  maxAttempts: number;
  completed: boolean;
  score: number; // 0-100
  timeSpent: number; // in seconds
  lastAttemptAt: Date;
  content: any; // Interactive content data
}

export interface IProjectSubmission {
  title: string;
  description: string;
  submissionType: 'text' | 'file' | 'link';
  content: string;
  submittedAt: Date;
  rubricScores: Array<{
    criterion: string;
    score: number;
    maxScore: number;
    feedback: string;
  }>;
  totalScore: number;
  feedback: string;
  status: 'submitted' | 'reviewed' | 'approved' | 'rejected';
}

export interface IPeerLearningProgress {
  discussionTopics: string[];
  participationCount: number;
  collaborationTasks: string[];
  completedTasks: string[];
  groupSize: number;
  peerFeedback: Array<{
    fromStudent: string;
    feedback: string;
    rating: number; // 1-5
    timestamp: Date;
  }>;
  lastActivityAt: Date;
}

export interface IGamificationProgress {
  quests: Array<{
    questId: string;
    title: string;
    type: 'watch' | 'complete' | 'score' | 'collaborate' | 'create';
    target: number;
    current: number;
    completed: boolean;
    reward: number;
    completedAt?: Date;
  }>;
  badges: Array<{
    badgeId: string;
    name: string;
    description: string;
    earnedAt: Date;
    icon: string;
  }>;
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastActivityDate: Date;
  };
  leaderboardPoints: number;
}

export interface IAIAssessment {
  realTimeScore: number; // 0-100
  skillGaps: string[];
  recommendations: string[];
  adaptiveQuestions: Array<{
    questionId: string;
    difficulty: 'easy' | 'medium' | 'hard';
    answered: boolean;
    correct: boolean;
    timeSpent: number;
  }>;
  learningPathRecommendations: string[];
  lastAssessmentAt: Date;
}

export interface IModuleProgress {
  moduleId: string;
  videoProgress: IVideoProgress;
  quizAttempts: IQuizAttempt[];
  quizScore: number; // percentage
  interactiveProgress?: IInteractiveProgress;
  projectSubmission?: IProjectSubmission;
  peerLearningProgress?: IPeerLearningProgress;
  gamificationProgress: IGamificationProgress;
  aiAssessment: IAIAssessment;
  feedback: string;
  pointsEarned: number;
  completedAt?: Date;
  startedAt: Date;
  lastAccessedAt: Date;
  learningPath: string[];
  skillImprovements: string[];
}

export interface IStudentProgress {
  studentId: string;
  moduleProgress: IModuleProgress[];
  totalPoints: number;
  totalModulesCompleted: number;
  totalWatchTime: number; // in minutes
  totalInteractiveTime: number; // in minutes
  totalProjectTime: number; // in minutes
  totalPeerLearningTime: number; // in minutes
  learningStreak: number;
  badgesEarned: string[];
  skillLevels: { [skill: string]: number }; // 0-100
  learningPreferences: {
    preferredContentTypes: string[];
    preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
    preferredGroupSize: number;
    preferredTimeOfDay: string;
  };
  aiInsights: {
    learningStyle: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    lastUpdated: Date;
  };
}

const videoProgressSchema = new mongoose.Schema<IVideoProgress>({
  videoUrl: { type: String, required: true },
  watchTime: { type: Number, default: 0 },
  totalDuration: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now },
  engagementScore: { type: Number, min: 0, max: 100 },
  playbackRate: { type: Number, default: 1 },
  seekCount: { type: Number, default: 0 }
});

const quizAttemptSchema = new mongoose.Schema<IQuizAttempt>({
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number, default: 0 },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  skillTags: [{ type: String }]
});

const interactiveProgressSchema = new mongoose.Schema<IInteractiveProgress>({
  type: { 
    type: String, 
    enum: ['coding', 'simulation', 'drag-drop', 'matching', 'fill-blank'],
    required: true
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  completed: { type: Boolean, default: false },
  score: { type: Number, min: 0, max: 100, default: 0 },
  timeSpent: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: Date.now },
  content: mongoose.Schema.Types.Mixed
});

const projectSubmissionSchema = new mongoose.Schema<IProjectSubmission>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  submissionType: { 
    type: String, 
    enum: ['text', 'file', 'link'],
    required: true
  },
  content: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now },
  rubricScores: [{
    criterion: String,
    score: Number,
    maxScore: Number,
    feedback: String
  }],
  totalScore: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['submitted', 'reviewed', 'approved', 'rejected'],
    default: 'submitted'
  }
});

const peerLearningProgressSchema = new mongoose.Schema<IPeerLearningProgress>({
  discussionTopics: [{ type: String }],
  participationCount: { type: Number, default: 0 },
  collaborationTasks: [{ type: String }],
  completedTasks: [{ type: String }],
  groupSize: { type: Number, default: 4 },
  peerFeedback: [{
    fromStudent: String,
    feedback: String,
    rating: { type: Number, min: 1, max: 5 },
    timestamp: { type: Date, default: Date.now }
  }],
  lastActivityAt: { type: Date, default: Date.now }
});

const gamificationProgressSchema = new mongoose.Schema<IGamificationProgress>({
  quests: [{
    questId: String,
    title: String,
    type: { 
      type: String, 
      enum: ['watch', 'complete', 'score', 'collaborate', 'create'] 
    },
    target: Number,
    current: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    reward: Number,
    completedAt: Date
  }],
  badges: [{
    badgeId: String,
    name: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    icon: String
  }],
  streaks: {
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActivityDate: { type: Date, default: Date.now }
  },
  leaderboardPoints: { type: Number, default: 0 }
});

const aiAssessmentSchema = new mongoose.Schema<IAIAssessment>({
  realTimeScore: { type: Number, min: 0, max: 100, default: 0 },
  skillGaps: [{ type: String }],
  recommendations: [{ type: String }],
  adaptiveQuestions: [{
    questionId: String,
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'] 
    },
    answered: { type: Boolean, default: false },
    correct: { type: Boolean, default: false },
    timeSpent: { type: Number, default: 0 }
  }],
  learningPathRecommendations: [{ type: String }],
  lastAssessmentAt: { type: Date, default: Date.now }
});

const moduleProgressSchema = new mongoose.Schema<IModuleProgress>({
  moduleId: { type: String, required: true },
  videoProgress: { type: videoProgressSchema, required: true },
  quizAttempts: [{ type: quizAttemptSchema }],
  quizScore: { type: Number, default: 0 },
  interactiveProgress: { type: interactiveProgressSchema },
  projectSubmission: { type: projectSubmissionSchema },
  peerLearningProgress: { type: peerLearningProgressSchema },
  gamificationProgress: { type: gamificationProgressSchema, default: () => ({}) },
  aiAssessment: { type: aiAssessmentSchema, default: () => ({}) },
  feedback: { type: String, default: '' },
  pointsEarned: { type: Number, default: 0 },
  completedAt: { type: Date },
  startedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now },
  learningPath: [{ type: String }],
  skillImprovements: [{ type: String }]
});

const studentProgressSchema = new mongoose.Schema<IStudentProgress>({
  studentId: { type: String, required: true, unique: true },
  moduleProgress: [{ type: moduleProgressSchema }],
  totalPoints: { type: Number, default: 0 },
  totalModulesCompleted: { type: Number, default: 0 },
  totalWatchTime: { type: Number, default: 0 },
  totalInteractiveTime: { type: Number, default: 0 },
  totalProjectTime: { type: Number, default: 0 },
  totalPeerLearningTime: { type: Number, default: 0 },
  learningStreak: { type: Number, default: 0 },
  badgesEarned: [{ type: String }],
  skillLevels: { type: Map, of: Number, default: {} },
  learningPreferences: {
    preferredContentTypes: [{ type: String }],
    preferredDifficulty: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    preferredGroupSize: { type: Number, default: 4 },
    preferredTimeOfDay: { type: String, default: 'morning' }
  },
  aiInsights: {
    learningStyle: { type: String, default: 'visual' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

export default (mongoose.models && mongoose.models.StudentProgress) || mongoose.model<IStudentProgress>('StudentProgress', studentProgressSchema); 