import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  moduleId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'vocational', 'life-skills'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  learningObjectives: [{
    type: String
  }],
  recommendedFor: [{
    type: String
  }],
  xpPoints: {
    type: Number,
    required: true
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  learningType: {
    type: String,
    enum: ['video', 'quiz', 'story', 'interactive', 'project'],
    required: true
  },
  content: [{
    type: {
      type: String,
      enum: ['video', 'quiz', 'story', 'interactive', 'project']
    },
    name: String,
    description: String,
    duration: Number,
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    }
  }],
  prerequisites: [{
    type: String // module IDs
  }],
  badges: [{
    name: String,
    description: String,
    icon: String
  }],
  tags: [{
    type: String
  }],
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
moduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Module || mongoose.model('Module', moduleSchema); 