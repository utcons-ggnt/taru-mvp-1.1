// Fallback Module Service - Provides default modules when no modules are available
export interface FallbackModule {
  moduleId: string;
  name: string;
  subject: string;
  category: string;
  description: string;
  learningObjectives: string[];
  recommendedFor: string[];
  xpPoints: number;
  estimatedDuration: number;
  difficulty: string;
  learningType: string;
  content: Array<{
    type: string;
    name: string;
    description: string;
    duration: number;
    status: string;
  }>;
  prerequisites: string[];
  badges: Array<{
    name: string;
    description: string;
    icon: string;
  }>;
  tags: string[];
  isActive: boolean;
  videoUrl?: string;
  duration?: number;
}

export interface FallbackYouTubeData {
  _id: string;
  uniqueid: string;
  chapters: Array<{
    chapterIndex: number;
    chapterKey: string;
    videoTitle: string;
    videoUrl: string;
  }>;
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
}

export class FallbackModuleService {
  private static fallbackModules: FallbackModule[] = [
    {
      moduleId: 'fallback-math-001',
      name: 'Introduction to Mathematics',
      subject: 'Mathematics',
      category: 'academic',
      description: 'Learn the fundamentals of mathematics including basic arithmetic, algebra, and problem-solving techniques.',
      learningObjectives: [
        'Understand basic arithmetic operations',
        'Solve simple algebraic equations',
        'Apply mathematical concepts to real-world problems',
        'Develop critical thinking skills'
      ],
      recommendedFor: ['Beginner students', 'Anyone interested in math'],
      xpPoints: 100,
      estimatedDuration: 120,
      difficulty: 'beginner',
      learningType: 'interactive',
      content: [
        {
          type: 'video',
          name: 'Introduction to Numbers',
          description: 'Learn about different types of numbers and their properties',
          duration: 15,
          status: 'not-started'
        },
        {
          type: 'quiz',
          name: 'Basic Arithmetic Quiz',
          description: 'Test your understanding of basic arithmetic operations',
          duration: 10,
          status: 'not-started'
        },
        {
          type: 'interactive',
          name: 'Problem Solving Workshop',
          description: 'Practice solving mathematical problems step by step',
          duration: 20,
          status: 'not-started'
        }
      ],
      prerequisites: [],
      badges: [
        {
          name: 'Math Explorer',
          description: 'Completed your first mathematics module',
          icon: '🔢'
        }
      ],
      tags: ['mathematics', 'beginner', 'arithmetic', 'algebra'],
      isActive: true,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 120
    },
    {
      moduleId: 'fallback-science-001',
      name: 'Introduction to Science',
      subject: 'Science',
      category: 'academic',
      description: 'Explore the fascinating world of science through interactive experiments and discoveries.',
      learningObjectives: [
        'Understand the scientific method',
        'Learn about different branches of science',
        'Conduct simple experiments',
        'Develop observation skills'
      ],
      recommendedFor: ['Science enthusiasts', 'Curious learners'],
      xpPoints: 120,
      estimatedDuration: 90,
      difficulty: 'beginner',
      learningType: 'interactive',
      content: [
        {
          type: 'video',
          name: 'What is Science?',
          description: 'Introduction to the world of scientific discovery',
          duration: 12,
          status: 'not-started'
        },
        {
          type: 'experiment',
          name: 'Simple Experiments',
          description: 'Hands-on experiments you can do at home',
          duration: 25,
          status: 'not-started'
        },
        {
          type: 'quiz',
          name: 'Science Knowledge Check',
          description: 'Test your understanding of basic science concepts',
          duration: 15,
          status: 'not-started'
        }
      ],
      prerequisites: [],
      badges: [
        {
          name: 'Young Scientist',
          description: 'Completed your first science module',
          icon: '🔬'
        }
      ],
      tags: ['science', 'experiments', 'discovery', 'beginner'],
      isActive: true,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 90
    },
    {
      moduleId: 'fallback-language-001',
      name: 'Language and Communication',
      subject: 'Language Arts',
      category: 'academic',
      description: 'Improve your communication skills through reading, writing, and speaking exercises.',
      learningObjectives: [
        'Enhance reading comprehension',
        'Improve writing skills',
        'Develop speaking confidence',
        'Learn effective communication techniques'
      ],
      recommendedFor: ['Language learners', 'Communication enthusiasts'],
      xpPoints: 80,
      estimatedDuration: 100,
      difficulty: 'beginner',
      learningType: 'interactive',
      content: [
        {
          type: 'video',
          name: 'Effective Communication',
          description: 'Learn the basics of clear and effective communication',
          duration: 18,
          status: 'not-started'
        },
        {
          type: 'reading',
          name: 'Reading Comprehension',
          description: 'Practice reading and understanding different texts',
          duration: 20,
          status: 'not-started'
        },
        {
          type: 'writing',
          name: 'Creative Writing',
          description: 'Express yourself through creative writing exercises',
          duration: 25,
          status: 'not-started'
        }
      ],
      prerequisites: [],
      badges: [
        {
          name: 'Wordsmith',
          description: 'Completed your first language module',
          icon: '📝'
        }
      ],
      tags: ['language', 'communication', 'writing', 'reading'],
      isActive: true,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      duration: 100
    }
  ];

  private static fallbackYouTubeData: FallbackYouTubeData = {
    _id: 'fallback-youtube-data',
    uniqueid: 'fallback-user',
    chapters: [
      {
        chapterIndex: 1,
        chapterKey: 'Chapter 1: Getting Started',
        videoTitle: 'Welcome to Learning - Introduction Video',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        chapterIndex: 2,
        chapterKey: 'Chapter 2: Basic Concepts',
        videoTitle: 'Understanding the Fundamentals',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        chapterIndex: 3,
        chapterKey: 'Chapter 3: Practice Exercises',
        videoTitle: 'Hands-on Learning Activities',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        chapterIndex: 4,
        chapterKey: 'Chapter 4: Advanced Topics',
        videoTitle: 'Taking Your Learning Further',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        chapterIndex: 5,
        chapterKey: 'Chapter 5: Review and Assessment',
        videoTitle: 'Consolidating Your Knowledge',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    totalChapters: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  static getFallbackModules(): FallbackModule[] {
    return this.fallbackModules;
  }

  static getFallbackModule(moduleId: string): FallbackModule | null {
    return this.fallbackModules.find(module => module.moduleId === moduleId) || null;
  }

  static getFallbackYouTubeData(uniqueid: string): FallbackYouTubeData {
    return {
      ...this.fallbackYouTubeData,
      uniqueid: uniqueid || 'fallback-user'
    };
  }

  static getRandomFallbackModule(): FallbackModule {
    const randomIndex = Math.floor(Math.random() * this.fallbackModules.length);
    return this.fallbackModules[randomIndex];
  }

  static getFallbackModuleProgress(moduleId: string) {
    return {
      status: 'not-started' as const,
      progress: 0,
      xpEarned: 0,
      contentProgress: []
    };
  }
}
