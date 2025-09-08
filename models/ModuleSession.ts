import mongoose from 'mongoose';

export interface IVideoProgress {
  videoUrl: string;
  currentTime: number; // in seconds
  totalDuration: number; // in seconds
  watchTime: number; // in seconds
  isCompleted: boolean;
  lastWatchedAt: Date;
}

export interface IQuizProgress {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  attempts: number;
  timestamp: Date;
}

export interface IModuleSession {
  userId: string;
  studentId: string;
  sessionId: string;
  moduleId: string;
  moduleTitle: string;
  currentSection: string;
  videoProgress: IVideoProgress;
  quizProgress: IQuizProgress[];
  interactiveProgress: any;
  projectProgress: any;
  peerLearningProgress: any;
  totalTimeSpent: number; // in minutes
  isCompleted: boolean;
  completedAt?: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const videoProgressSchema = new mongoose.Schema<IVideoProgress>({
  videoUrl: { type: String, required: true },
  currentTime: { type: Number, default: 0 },
  totalDuration: { type: Number, required: true },
  watchTime: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  lastWatchedAt: { type: Date, default: Date.now }
});

const quizProgressSchema = new mongoose.Schema<IQuizProgress>({
  questionId: { type: String, required: true },
  selectedAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number, default: 0 },
  attempts: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now }
});

const moduleSessionSchema = new mongoose.Schema<IModuleSession>({
  userId: { type: String, required: true },
  studentId: { type: String, required: true },
  sessionId: { type: String, required: true },
  moduleId: { type: String, required: true },
  moduleTitle: { type: String, required: true },
  currentSection: { type: String, default: 'video' },
  videoProgress: { type: videoProgressSchema, required: true },
  quizProgress: [quizProgressSchema],
  interactiveProgress: { type: mongoose.Schema.Types.Mixed },
  projectProgress: { type: mongoose.Schema.Types.Mixed },
  peerLearningProgress: { type: mongoose.Schema.Types.Mixed },
  totalTimeSpent: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
moduleSessionSchema.index({ userId: 1, moduleId: 1, isCompleted: 1 });
moduleSessionSchema.index({ sessionId: 1 });
moduleSessionSchema.index({ studentId: 1, moduleId: 1 });

// Update lastActivity before saving
moduleSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default (mongoose.models && mongoose.models.ModuleSession) || mongoose.model<IModuleSession>('ModuleSession', moduleSessionSchema);
