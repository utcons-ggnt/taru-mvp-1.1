import mongoose from 'mongoose';

export interface IModule {
  _id: string;
  uniqueID: string;
  transID?: string; // Transcription ID for N8N integration
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  videoUrl: string; // Magnet Brains video URL
  transcribe?: string; // Video transcription text
  
  // Hybrid Learning Components
  learningType: 'video' | 'interactive' | 'project' | 'quiz' | 'peer' | 'hybrid';
  contentTypes: {
    video?: {
      url: string;
      duration: number;
      engagementThreshold: number; // % of video to watch for completion
    };
    interactive?: {
      type: 'coding' | 'simulation' | 'drag-drop' | 'matching' | 'fill-blank';
      content: any; // Interactive content data
      attempts: number;
    };
    project?: {
      title: string;
      description: string;
      requirements: string[];
      submissionType: 'text' | 'file' | 'link';
      rubric: Array<{
        criterion: string;
        points: number;
        description: string;
      }>;
    };
    peerLearning?: {
      discussionTopics: string[];
      groupSize: number;
      collaborationTasks: string[];
    };
  };
  
  // Adaptive Learning Features
  adaptiveFeatures: {
    difficultyAdjustment: boolean;
    personalizedPath: boolean;
    skillGaps: string[];
    prerequisites: string[];
    nextModules: string[];
  };
  
  // Gamification Elements
  gamification: {
    quests: Array<{
      id: string;
      title: string;
      description: string;
      type: 'watch' | 'complete' | 'score' | 'collaborate' | 'create';
      target: number;
      reward: number;
    }>;
    badges: string[];
    leaderboard: boolean;
    streaks: boolean;
  };
  
  // Assessment & Feedback
  quizQuestions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
    skillTags: string[];
  }>;
  
  // AI-Powered Features
  aiFeatures: {
    realTimeAssessment: boolean;
    personalizedFeedback: boolean;
    adaptiveQuestions: boolean;
    learningPathRecommendation: boolean;
  };
  
  points: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const moduleSchema = new mongoose.Schema<IModule>({
  uniqueID: { type: String, required: true, unique: true },
  transID: { type: String }, // Optional transcription ID
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
  
  // Hybrid Learning Components
  learningType: { 
    type: String, 
    enum: ['video', 'interactive', 'project', 'quiz', 'peer', 'hybrid'],
    default: 'hybrid'
  },
  contentTypes: {
    video: {
      url: String,
      duration: Number,
      engagementThreshold: { type: Number, default: 80 } // 80% watch time
    },
    interactive: {
      type: { 
        type: String, 
        enum: ['coding', 'simulation', 'drag-drop', 'matching', 'fill-blank'] 
      },
      content: mongoose.Schema.Types.Mixed,
      attempts: { type: Number, default: 3 }
    },
    project: {
      title: String,
      description: String,
      requirements: [String],
      submissionType: { 
        type: String, 
        enum: ['text', 'file', 'link'] 
      },
      rubric: [{
        criterion: String,
        points: Number,
        description: String
      }]
    },
    peerLearning: {
      discussionTopics: [String],
      groupSize: { type: Number, default: 4 },
      collaborationTasks: [String]
    }
  },
  
  // Adaptive Learning Features
  adaptiveFeatures: {
    difficultyAdjustment: { type: Boolean, default: true },
    personalizedPath: { type: Boolean, default: true },
    skillGaps: [String],
    prerequisites: [String],
    nextModules: [String]
  },
  
  // Gamification Elements
  gamification: {
    quests: [{
      id: String,
      title: String,
      description: String,
      type: { 
        type: String, 
        enum: ['watch', 'complete', 'score', 'collaborate', 'create'] 
      },
      target: Number,
      reward: Number
    }],
    badges: [String],
    leaderboard: { type: Boolean, default: true },
    streaks: { type: Boolean, default: true }
  },
  
  // Assessment & Feedback
  quizQuestions: [{
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    explanation: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    skillTags: [String]
  }],
  
  // AI-Powered Features
  aiFeatures: {
    realTimeAssessment: { type: Boolean, default: true },
    personalizedFeedback: { type: Boolean, default: true },
    adaptiveQuestions: { type: Boolean, default: true },
    learningPathRecommendation: { type: Boolean, default: true }
  },
  
  points: { type: Number, default: 10 },
  tags: [{ type: String }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.models.Module || mongoose.model<IModule>('Module', moduleSchema); 