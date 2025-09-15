import mongoose from 'mongoose';

const chapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  }
}, { _id: false });

const submoduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  chapters: [chapterSchema]
}, { _id: false });

const learningPathModuleSchema = new mongoose.Schema({
  module: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  submodules: [submoduleSchema]
}, { _id: false });

const outputSchema = new mongoose.Schema({
  greeting: {
    type: String,
    required: true
  },
  overview: [{
    type: String,
    required: true
  }],
  timeRequired: {
    type: String,
    required: true
  },
  focusAreas: [{
    type: String,
    required: true
  }],
  learningPath: [learningPathModuleSchema],
  finalTip: {
    type: String,
    required: true
  }
}, { _id: false });

const learningPathResponseSchema = new mongoose.Schema({
  output: {
    type: outputSchema,
    required: true
  },
  uniqueid: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'learning-path-responses'
});

// Create compound index for uniqueid and career path (derived from greeting)
learningPathResponseSchema.index({ uniqueid: 1, 'output.greeting': 1 });

// Ensure exact mapping with pre-save validation
learningPathResponseSchema.pre('save', function(next) {
  // Validate exact structure before saving
  if (!this.output || !this.uniqueid) {
    return next(new Error('Missing required fields: output or uniqueid'));
  }
  
  // Ensure all required output fields are present
  const requiredOutputFields = ['greeting', 'overview', 'timeRequired', 'focusAreas', 'learningPath', 'finalTip'] as const;
  for (const field of requiredOutputFields) {
    if (!(this.output as any)[field]) {
      return next(new Error(`Missing required output field: ${field}`));
    }
  }
  
  next();
});

export default mongoose.models.LearningPathResponse || mongoose.model('LearningPathResponse', learningPathResponseSchema);
