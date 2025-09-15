import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  pathId: {
    type: String,
    required: true,
    unique: true
  },
  uniqueId: {
    type: String,
    required: true,
    index: true
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
    },
    // Enhanced fields for detailed learning paths
    submodules: [{
      title: String,
      description: String,
      chapters: [{
        title: String,
        description: String,
        estimatedTime: Number,
        resources: [String],
        completed: { type: Boolean, default: false }
      }],
      completed: { type: Boolean, default: false }
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    skills: [String], // Skills covered in this milestone
    learningObjectives: [String] // What students will learn
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
  // Enhanced metadata fields
  source: {
    type: String,
    enum: ['n8n', 'fallback', 'manual', 'ai-generated'],
    default: 'ai-generated'
  },
  version: {
    type: String,
    default: '1.0'
  },
  tags: [String], // Tags for categorization
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  prerequisites: [String], // General prerequisites for the entire path
  learningOutcomes: [String], // What students will achieve
  resources: [{
    type: {
      type: String,
      enum: ['video', 'article', 'book', 'course', 'tool', 'other'],
      required: true
    },
    title: String,
    url: String,
    description: String,
    required: { type: Boolean, default: false }
  }],
  // Progress tracking
  studentProgress: {
    currentMilestone: String,
    completedMilestones: [String],
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    lastAccessed: Date,
    completionPercentage: { type: Number, default: 0 }
  },
  // Analytics and feedback
  ratings: [{
    studentId: String,
    rating: { type: Number, min: 1, max: 5 },
    feedback: String,
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalEnrollments: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'learning-path-student'
});

// Update the updatedAt field before saving
learningPathSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add compound unique index to prevent duplicate learning paths for same uniqueId and careerGoal
learningPathSchema.index({ uniqueId: 1, careerGoal: 1 }, { unique: true });

export default (mongoose.models && mongoose.models.LearningPath) || mongoose.model('LearningPath', learningPathSchema); 