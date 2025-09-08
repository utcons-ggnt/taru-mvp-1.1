import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'vocational', 'life-skills'],
    required: true
  },
  targetGrade: {
    type: String
  },
  careerGoal: {
    type: String
  },
  milestones: [{
    milestoneId: String,
    name: String,
    description: String,
    modules: [String], // module IDs
    estimatedTime: Number, // in minutes
    prerequisites: [String], // milestone IDs
    status: {
      type: String,
      enum: ['locked', 'available', 'in-progress', 'completed'],
      default: 'locked'
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  totalModules: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number, // in minutes
    default: 0
  },
  totalXpPoints: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
learningPathSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models && mongoose.models.LearningPath) || mongoose.model('LearningPath', learningPathSchema); 