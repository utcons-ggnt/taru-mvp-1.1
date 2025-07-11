import mongoose from 'mongoose';

const studentProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  // Module Progress
  moduleProgress: [{
    moduleId: String,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    progress: {
      type: Number,
      default: 0
    },
    startedAt: Date,
    completedAt: Date,
    xpEarned: {
      type: Number,
      default: 0
    },
    contentProgress: [{
      contentId: String,
      status: {
        type: String,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
      },
      score: Number,
      timeSpent: Number
    }]
  }],
  
  // Learning Path Progress
  pathProgress: [{
    pathId: String,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    progress: {
      type: Number,
      default: 0
    },
    startedAt: Date,
    completedAt: Date,
    milestoneProgress: [{
      milestoneId: String,
      status: {
        type: String,
        enum: ['locked', 'available', 'in-progress', 'completed'],
        default: 'locked'
      },
      progress: {
        type: Number,
        default: 0
      },
      completedAt: Date
    }]
  }],
  
  // Overall Statistics
  totalXpEarned: {
    type: Number,
    default: 0
  },
  totalModulesCompleted: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  badgesEarned: [{
    badgeId: String,
    name: String,
    description: String,
    earnedAt: Date
  }],
  
  // Current Learning State
  currentModule: {
    moduleId: String,
    contentId: String,
    lastAccessed: Date
  },
  currentPath: {
    pathId: String,
    milestoneId: String
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
studentProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.StudentProgress || mongoose.model('StudentProgress', studentProgressSchema); 