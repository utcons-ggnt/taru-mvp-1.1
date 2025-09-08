import mongoose from 'mongoose';

export interface IN8NResult {
  _id: string;
  uniqueId: string; // Student or module unique identifier
  resultType: 'assessment_questions' | 'assessment_analysis' | 'module_content' | 'transcript' | 'learning_path' | 'career_analysis';
  webhookUrl: string; // The N8N webhook URL that was called
  requestPayload: any; // The payload sent to N8N
  responseData: any; // The response received from N8N
  processedData: any; // The processed/parsed data ready for use
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string;
  generatedAt: Date;
  expiresAt?: Date; // Optional expiration for cache invalidation
  metadata: {
    studentId?: string;
    moduleId?: string;
    assessmentId?: string;
    contentType?: string; // 'mcq', 'flashcard', 'transcript', etc.
    version?: string; // For versioning of results
  };
  createdAt: Date;
  updatedAt: Date;
}

const n8nResultSchema = new mongoose.Schema<IN8NResult>({
  uniqueId: { 
    type: String, 
    required: true,
    index: true 
  },
  resultType: { 
    type: String, 
    required: true,
    enum: ['assessment_questions', 'assessment_analysis', 'module_content', 'transcript', 'learning_path', 'career_analysis'],
    index: true
  },
  webhookUrl: { 
    type: String, 
    required: true 
  },
  requestPayload: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  responseData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  processedData: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  errorMessage: { 
    type: String 
  },
  generatedAt: { 
    type: Date, 
    required: true,
    default: Date.now,
    index: true
  },
  expiresAt: { 
    type: Date,
    index: { expireAfterSeconds: 0 } // TTL index for automatic cleanup
  },
  metadata: {
    studentId: { type: String, index: true },
    moduleId: { type: String, index: true },
    assessmentId: { type: String, index: true },
    contentType: { type: String },
    version: { type: String, default: '1.0' }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
n8nResultSchema.index({ uniqueId: 1, resultType: 1 });
n8nResultSchema.index({ uniqueId: 1, resultType: 1, status: 1 });
n8nResultSchema.index({ 'metadata.studentId': 1, resultType: 1 });
n8nResultSchema.index({ 'metadata.moduleId': 1, resultType: 1 });
n8nResultSchema.index({ generatedAt: -1 });

// Update the updatedAt field before saving
n8nResultSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default (mongoose.models && mongoose.models.N8NResult) || mongoose.model<IN8NResult>('N8NResult', n8nResultSchema);
