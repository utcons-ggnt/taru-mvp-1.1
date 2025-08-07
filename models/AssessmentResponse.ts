import mongoose from 'mongoose';

const assessmentResponseSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    required: true,
    unique: true
  },
  assessmentType: {
    type: String,
    required: true,
    default: 'diagnostic'
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['MCQ', 'OPEN'],
      required: true
    },
    category: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: null // null for open questions
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    formattedResponse: {
      type: {
        Q: String,
        section: String,
        question: String,
        studentAnswer: String,
        type: String
      }
    }
  }],
  result: {
    type: {
      type: String // e.g., "Visual Superstar"
    },
    description: {
      type: String
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    learningStyle: {
      type: String
    },
    recommendations: [{
      title: String,
      description: String,
      xp: Number
    }]
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  generatedQuestions: {
    type: Array, // Store the n8n generated questions
    default: []
  },
  collectedAnswers: {
    type: Array, // Store the collected answers in the required format
    default: []
  },
  webhookTriggered: {
    type: Boolean,
    default: false
  },
  webhookTriggeredAt: {
    type: Date
  },
  webhookDataSent: {
    type: Boolean,
    default: false
  },
  webhookSentAt: {
    type: Date
  },
  analysisCompleted: {
    type: Boolean,
    default: false
  },
  analysisCompletedAt: {
    type: Date
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
assessmentResponseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.AssessmentResponse || mongoose.model('AssessmentResponse', assessmentResponseSchema);