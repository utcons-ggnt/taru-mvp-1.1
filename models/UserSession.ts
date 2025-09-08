import mongoose from 'mongoose';

export interface ISessionData {
  page: string;
  data: any;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    screenSize?: string;
    referrer?: string;
  };
}

export interface IUserSession {
  userId: string;
  studentId?: string;
  sessionId: string;
  currentPage: string;
  navigationHistory: string[];
  sessionData: ISessionData[];
  lastActivity: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionDataSchema = new mongoose.Schema<ISessionData>({
  page: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    userAgent: String,
    screenSize: String,
    referrer: String
  }
});

const userSessionSchema = new mongoose.Schema<IUserSession>({
  userId: { type: String, required: true },
  studentId: { type: String },
  sessionId: { type: String, required: true, unique: true },
  currentPage: { type: String, required: true },
  navigationHistory: [{ type: String }],
  sessionData: [sessionDataSchema],
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for efficient queries
userSessionSchema.index({ userId: 1, isActive: 1 });
userSessionSchema.index({ sessionId: 1 });
userSessionSchema.index({ lastActivity: 1 });

// Update lastActivity before saving
userSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

export default (mongoose.models && mongoose.models.UserSession) || mongoose.model<IUserSession>('UserSession', userSessionSchema);
