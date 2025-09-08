import mongoose from 'mongoose';

export interface IAssessmentProgress {
  questionId: string;
  questionNumber: number;
  answer: string;
  selectedOptions: string[];
  isSkipped: boolean;
  timeSpent: number; // in seconds
  timestamp: Date;
}

export interface IAssessmentSession {
  userId: string;
  studentId: string;
  sessionId: string;
  assessmentType: 'diagnostic' | 'interest' | 'skill';
  currentQuestion: number;
  totalQuestions: number;
  progress: number; // percentage
  answers: IAssessmentProgress[];
  isCompleted: boolean;
  completedAt?: Date;
  result?: any;
  n8nResults?: any;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentProgressSchema = new mongoose.Schema<IAssessmentProgress>({
  questionId: { type: String, required: true },
  questionNumber: { type: Number, required: true },
  answer: { type: String, default: '' },
  selectedOptions: [{ type: String }],
  isSkipped: { type: Boolean, default: false },
  timeSpent: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const assessmentSessionSchema = new mongoose.Schema<IAssessmentSession>({
  userId: { type: String, required: true },
  studentId: { type: String, required: true },
  sessionId: { type: String, required: true },
  assessmentType: { 
    type: String, 
    enum: ['diagnostic', 'interest', 'skill'],
    required: true 
  },
  currentQuestion: { type: Number, default: 1 },
  totalQuestions: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  answers: [assessmentProgressSchema],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  result: { type: mongoose.Schema.Types.Mixed },
  n8nResults: { type: mongoose.Schema.Types.Mixed },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
assessmentSessionSchema.index({ userId: 1, assessmentType: 1, isCompleted: 1 });
assessmentSessionSchema.index({ sessionId: 1 });
assessmentSessionSchema.index({ studentId: 1, assessmentType: 1 });

// Update lastActivity before saving
assessmentSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default (mongoose.models && mongoose.models.AssessmentSession) || mongoose.model<IAssessmentSession>('AssessmentSession', assessmentSessionSchema);
