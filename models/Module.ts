import mongoose from 'mongoose';

export interface IModule {
  _id: string;
  uniqueID: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  videoUrl: string; // YouTube video URL
  transcribe?: string; // Video transcription text
  
  // Basic metadata
  points: number;
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new mongoose.Schema<IModule>({
  uniqueID: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  difficulty: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  },
  duration: { type: Number, required: true },
  videoUrl: { type: String, required: true },
  transcribe: { type: String }, // Optional transcription field
  
  // Basic metadata
  points: { type: Number, default: 100 },
  tags: [String]
}, {
  timestamps: true,
  collection: 'modules'
});

// Create indexes for better performance
// Note: uniqueID already has an index due to unique: true constraint
moduleSchema.index({ subject: 1 });
moduleSchema.index({ grade: 1 });
moduleSchema.index({ difficulty: 1 });

export default mongoose.models.Module || mongoose.model<IModule>('Module', moduleSchema);