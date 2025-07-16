import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'student' | 'teacher' | 'parent' | 'organization' | 'admin';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profile: Record<string, any>;
  firstTimeLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const profileSchema = new mongoose.Schema({
  // Student profile fields
  grade: { type: String },
  language: { type: String },
  location: { type: String },
  interests: [{ type: String }],
  
  // Teacher profile fields
  subjectSpecialization: { type: String },
  experienceYears: { type: String },
  
  // Parent profile fields
  linkedStudentId: { type: String },
  linkedStudentUniqueId: { type: String },
  
  // Organization profile fields
  organizationType: { type: String },
  industry: { type: String },
  
  // Common fields
  guardianName: { type: String },
}, { _id: false });

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'parent', 'organization', 'admin'],
    required: true,
    default: 'student',
  },
  profile: {
    type: profileSchema,
    default: {},
  },
  firstTimeLogin: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Prevent password from being returned in queries
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema); 