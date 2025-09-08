import mongoose from 'mongoose';

export interface ICareerPath {
  careerPath: string;
  description: string;
  details: any;
  selectedAt: Date;
}

export interface ICareerSession {
  userId: string;
  studentId: string;
  sessionId: string;
  currentCareerPath: string;
  careerPaths: ICareerPath[];
  explorationHistory: string[];
  selectedCareerDetails: any;
  isCompleted: boolean;
  completedAt?: Date;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const careerPathSchema = new mongoose.Schema<ICareerPath>({
  careerPath: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, required: true },
  selectedAt: { type: Date, default: Date.now }
});

const careerSessionSchema = new mongoose.Schema<ICareerSession>({
  userId: { type: String, required: true },
  studentId: { type: String, required: true },
  sessionId: { type: String, required: true },
  currentCareerPath: { type: String, default: '' },
  careerPaths: [careerPathSchema],
  explorationHistory: [{ type: String }],
  selectedCareerDetails: { type: mongoose.Schema.Types.Mixed },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for efficient queries
careerSessionSchema.index({ userId: 1, isCompleted: 1 });
careerSessionSchema.index({ sessionId: 1 });
careerSessionSchema.index({ studentId: 1 });

// Update lastActivity before saving
careerSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default (mongoose.models && mongoose.models.CareerSession) || mongoose.model<ICareerSession>('CareerSession', careerSessionSchema);
