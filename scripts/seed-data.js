const mongoose = require('mongoose');
const Module = require('../models/Module');
const LearningPath = require('../models/LearningPath');

// Sample modules data
const sampleModules = [
  {
    moduleId: 'math-beginner-001',
    name: 'Introduction to Basic Mathematics',
    subject: 'Mathematics',
    category: 'academic',
    description: 'Learn fundamental math concepts including numbers, operations, and basic problem-solving.',
    learningObjectives: [
      'Understand number systems and place value',
      'Perform basic arithmetic operations',
      'Solve simple word problems',
      'Develop mathematical thinking skills'
    ],
    recommendedFor: ['Elementary students', 'Math beginners', 'Students needing math foundation'],
    xpPoints: 100,
    estimatedDuration: 120,
    difficulty: 'beginner',
    learningType: 'interactive',
    content: [
      {
        type: 'video',
        name: 'Numbers and Counting',
        description: 'Learn about numbers and how to count',
        duration: 15,
        status: 'not-started'
      },
      {
        type: 'interactive',
        name: 'Addition Practice',
        description: 'Practice adding numbers',
        duration: 20,
        status: 'not-started'
      },
      {
        type: 'quiz',
        name: 'Basic Math Quiz',
        description: 'Test your understanding',
        duration: 10,
        status: 'not-started'
      }
    ],
    prerequisites: [],
    badges: [
      {
        name: 'Math Explorer',
        description: 'Completed basic mathematics module',
        icon: '🔢'
      }
    ],
    tags: ['math', 'beginner', 'numbers', 'arithmetic']
  },
  {
    moduleId: 'science-beginner-001',
    name: 'Introduction to Science',
    subject: 'Science',
    category: 'academic',
    description: 'Explore the world of science through fun experiments and discoveries.',
    learningObjectives: [
      'Understand the scientific method',
      'Learn about different branches of science',
      'Conduct simple experiments',
      'Develop curiosity and observation skills'
    ],
    recommendedFor: ['Elementary students', 'Science enthusiasts', 'Curious learners'],
    xpPoints: 120,
    estimatedDuration: 90,
    difficulty: 'beginner',
    learningType: 'project',
    content: [
      {
        type: 'video',
        name: 'What is Science?',
        description: 'Introduction to the world of science',
        duration: 12,
        status: 'not-started'
      },
      {
        type: 'project',
        name: 'Simple Experiment',
        description: 'Conduct a basic science experiment',
        duration: 30,
        status: 'not-started'
      },
      {
        type: 'story',
        name: 'Famous Scientists',
        description: 'Learn about great scientists',
        duration: 15,
        status: 'not-started'
      }
    ],
    prerequisites: [],
    badges: [
      {
        name: 'Young Scientist',
        description: 'Completed science introduction module',
        icon: '🔬'
      }
    ],
    tags: ['science', 'beginner', 'experiments', 'discovery']
  },
  {
    moduleId: 'tech-beginner-001',
    name: 'Digital Literacy Basics',
    subject: 'Technology',
    category: 'vocational',
    description: 'Learn essential computer and digital skills for the modern world.',
    learningObjectives: [
      'Understand basic computer operations',
      'Learn to use common software applications',
      'Develop internet safety awareness',
      'Master basic typing and navigation'
    ],
    recommendedFor: ['Technology beginners', 'Students preparing for digital world', 'Anyone wanting computer skills'],
    xpPoints: 150,
    estimatedDuration: 180,
    difficulty: 'beginner',
    learningType: 'interactive',
    content: [
      {
        type: 'video',
        name: 'Computer Basics',
        description: 'Understanding your computer',
        duration: 20,
        status: 'not-started'
      },
      {
        type: 'interactive',
        name: 'Typing Practice',
        description: 'Improve your typing skills',
        duration: 25,
        status: 'not-started'
      },
      {
        type: 'quiz',
        name: 'Internet Safety',
        description: 'Learn about online safety',
        duration: 15,
        status: 'not-started'
      }
    ],
    prerequisites: [],
    badges: [
      {
        name: 'Digital Citizen',
        description: 'Completed digital literacy module',
        icon: '💻'
      }
    ],
    tags: ['technology', 'computer', 'digital', 'typing', 'safety']
  },
  {
    moduleId: 'life-skills-001',
    name: 'Personal Finance for Kids',
    subject: 'Finance',
    category: 'life-skills',
    description: 'Learn about money, saving, and making smart financial decisions.',
    learningObjectives: [
      'Understand the value of money',
      'Learn about saving and budgeting',
      'Make smart spending decisions',
      'Develop financial responsibility'
    ],
    recommendedFor: ['Students learning about money', 'Future financial planners', 'Anyone wanting money skills'],
    xpPoints: 80,
    estimatedDuration: 60,
    difficulty: 'beginner',
    learningType: 'story',
    content: [
      {
        type: 'story',
        name: 'The Money Tree',
        description: 'A story about earning and saving money',
        duration: 10,
        status: 'not-started'
      },
      {
        type: 'interactive',
        name: 'Budget Builder',
        description: 'Create your first budget',
        duration: 20,
        status: 'not-started'
      },
      {
        type: 'quiz',
        name: 'Money Quiz',
        description: 'Test your financial knowledge',
        duration: 10,
        status: 'not-started'
      }
    ],
    prerequisites: [],
    badges: [
      {
        name: 'Money Manager',
        description: 'Completed personal finance module',
        icon: '💰'
      }
    ],
    tags: ['finance', 'money', 'saving', 'budgeting', 'life-skills']
  }
];

// Sample learning paths data
const sampleLearningPaths = [
  {
    pathId: 'academic-foundation',
    name: 'Academic Foundation',
    description: 'Build a strong foundation in core academic subjects',
    category: 'academic',
    targetGrade: 'Elementary',
    careerGoal: 'Academic Excellence',
    milestones: [
      {
        milestoneId: 'math-basics',
        name: 'Mathematics Basics',
        description: 'Master fundamental math concepts',
        modules: ['math-beginner-001'],
        estimatedTime: 120,
        prerequisites: [],
        status: 'available',
        progress: 0
      },
      {
        milestoneId: 'science-exploration',
        name: 'Science Exploration',
        description: 'Discover the world through science',
        modules: ['science-beginner-001'],
        estimatedTime: 90,
        prerequisites: ['math-basics'],
        status: 'locked',
        progress: 0
      }
    ],
    totalModules: 2,
    totalDuration: 210,
    totalXpPoints: 220
  },
  {
    pathId: 'digital-skills',
    name: 'Digital Skills Development',
    description: 'Master essential digital and technology skills',
    category: 'vocational',
    targetGrade: 'All Ages',
    careerGoal: 'Technology Proficiency',
    milestones: [
      {
        milestoneId: 'computer-basics',
        name: 'Computer Fundamentals',
        description: 'Learn basic computer operations',
        modules: ['tech-beginner-001'],
        estimatedTime: 180,
        prerequisites: [],
        status: 'available',
        progress: 0
      }
    ],
    totalModules: 1,
    totalDuration: 180,
    totalXpPoints: 150
  },
  {
    pathId: 'life-skills-mastery',
    name: 'Life Skills Mastery',
    description: 'Develop essential life skills for success',
    category: 'life-skills',
    targetGrade: 'All Ages',
    careerGoal: 'Life Success',
    milestones: [
      {
        milestoneId: 'financial-literacy',
        name: 'Financial Literacy',
        description: 'Learn about money management',
        modules: ['life-skills-001'],
        estimatedTime: 60,
        prerequisites: [],
        status: 'available',
        progress: 0
      }
    ],
    totalModules: 1,
    totalDuration: 60,
    totalXpPoints: 80
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taru2');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Module.deleteMany({});
    await LearningPath.deleteMany({});
    console.log('Cleared existing data');

    // Insert modules
    const modules = await Module.insertMany(sampleModules);
    console.log(`Inserted ${modules.length} modules`);

    // Insert learning paths
    const learningPaths = await LearningPath.insertMany(sampleLearningPaths);
    console.log(`Inserted ${learningPaths.length} learning paths`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedData(); 