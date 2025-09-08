import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true
  },
  // Skill & Interest Form Data
  languagePreference: {
    type: String,
    required: true
  },
  enableVoiceInstructions: {
    type: Boolean,
    default: false
  },
  preferredLearningStyle: [{
    type: String
  }],
  bestLearningEnvironment: [{
    type: String
  }],
  subjectsILike: [{
    type: String
  }],
  topicsThatExciteMe: [{
    type: String
  }],
  howISpendFreeTime: [{
    type: String
  }],
  thingsImConfidentDoing: [{
    type: String
  }],
  thingsINeedHelpWith: [{
    type: String
  }],
  dreamJobAsKid: {
    type: String
  },
  currentCareerInterest: [{
    type: String
  }],
  peopleIAdmire: [{
    type: String
  }],
  whatImMostProudOf: {
    type: String
  },
  ifICouldFixOneProblem: {
    type: String
  },
  
  // Diagnostic Assessment Data
  diagnosticCompleted: {
    type: Boolean,
    default: false
  },
  diagnosticScore: {
    type: Number
  },
  diagnosticResults: {
    learningStyle: String,
    skillLevels: Map,
    interestAreas: [String],
    recommendedModules: [String]
  },
  
  // Assessment Status
  assessmentCompleted: {
    type: Boolean,
    default: false
  },
  assessmentCompletedAt: {
    type: Date
  },
  
  // Session and Navigation State
  currentSession: {
    sessionId: String,
    currentQuestion: { type: Number, default: 1 },
    lastActivity: { type: Date, default: Date.now }
  },
  navigationHistory: [{
    page: String,
    timestamp: { type: Date, default: Date.now },
    data: mongoose.Schema.Types.Mixed
  }],
  
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
assessmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});


export default (mongoose.models && mongoose.models.Assessment) || mongoose.model('Assessment', assessmentSchema); 