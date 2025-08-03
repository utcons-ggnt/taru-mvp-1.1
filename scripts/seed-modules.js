// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Video URLs for different subjects based on provided YouTube links
const magnetBrainsVideos = {
  geography: [
    {
      title: "6th Grade Geography",
      description: "Learn fundamental geographical concepts, continents, countries, and maps",
      subject: "Geography",
      grade: "Class 6",
      difficulty: "beginner",
      duration: 45,
      videoUrl: "https://www.youtube.com/embed/Al9v3jxSW1I",
      quizQuestions: [
        {
          question: "What is geography?",
          options: [
            "The study of numbers and calculations",
            "The study of Earth's surface and its features",
            "The study of living organisms",
            "The study of chemical reactions"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["definition", "concepts"],
          explanation: "Geography is the study of Earth's surface, including its physical features, climate, and human activities."
        },
        {
          question: "How many continents are there on Earth?",
          options: ["5", "6", "7", "8"],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["continents", "counting"],
          explanation: "There are 7 continents: Asia, Africa, North America, South America, Antarctica, Europe, and Australia."
        },
        {
          question: "Which is the largest continent?",
          options: ["Africa", "Asia", "North America", "Europe"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["continents", "size-comparison"],
          explanation: "Asia is the largest continent, covering about 30% of Earth's land area."
        },
        {
          question: "What is a landform?",
          options: [
            "A type of weather pattern",
            "A natural feature of Earth's surface",
            "A type of plant",
            "A type of animal"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["landforms", "definition"],
          explanation: "A landform is a natural feature of Earth's surface, such as mountains, valleys, plains, or plateaus."
        },
        {
          question: "Which of these is NOT a type of landform?",
          options: ["Mountain", "River", "Desert", "Cloud"],
          correctAnswer: 3,
          difficulty: "medium",
          skillTags: ["landforms", "classification"],
          explanation: "Cloud is a weather phenomenon, not a landform. Mountains, rivers, and deserts are all landforms."
        },
        {
          question: "What is the purpose of a map?",
          options: [
            "To show only roads and cities",
            "To represent Earth's surface on a flat surface",
            "To show only political boundaries",
            "To display only natural features"
          ],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["maps", "purpose"],
          explanation: "A map is a representation of Earth's surface on a flat surface, showing various features like landforms, political boundaries, and human settlements."
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["geography", "continents", "landforms", "maps"]
    }
  ],
  science: [
    {
      title: "Nutrition in Plants - Full Chapter",
      description: "Complete understanding of how plants make their own food through photosynthesis",
      subject: "Science",
      grade: "Class 7",
      difficulty: "beginner",
      duration: 50,
      videoUrl: "https://www.youtube.com/embed/oP2sbq9G5PI",
      quizQuestions: [
        {
          question: "What is the process by which plants make their own food?",
          options: [
            "Respiration",
            "Photosynthesis",
            "Digestion",
            "Excretion"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["photosynthesis", "definition"],
          explanation: "Photosynthesis is the process by which plants make their own food using sunlight, water, and carbon dioxide."
        },
        {
          question: "What are the raw materials needed for photosynthesis?",
          options: [
            "Sunlight, water, and oxygen",
            "Sunlight, water, and carbon dioxide",
            "Water, oxygen, and glucose",
            "Carbon dioxide, oxygen, and glucose"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["raw-materials", "photosynthesis"],
          explanation: "The raw materials for photosynthesis are sunlight, water, and carbon dioxide."
        },
        {
          question: "Which part of the plant is mainly responsible for photosynthesis?",
          options: ["Roots", "Stem", "Leaves", "Flowers"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["plant-parts", "photosynthesis"],
          explanation: "Leaves are the main site of photosynthesis because they contain chlorophyll and have a large surface area to capture sunlight."
        },
        {
          question: "What is the green pigment in plants called?",
          options: ["Hemoglobin", "Chlorophyll", "Melanin", "Carotene"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["chlorophyll", "pigments"],
          explanation: "Chlorophyll is the green pigment in plants that captures sunlight for photosynthesis."
        },
        {
          question: "What are plants that make their own food called?",
          options: ["Heterotrophs", "Autotrophs", "Parasites", "Saprophytes"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["autotrophs", "nutrition-types"],
          explanation: "Plants that make their own food are called autotrophs (auto = self, troph = nutrition)."
        },
        {
          question: "What is the main product of photosynthesis?",
          options: ["Oxygen", "Glucose", "Carbon dioxide", "Water"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["products", "photosynthesis"],
          explanation: "Glucose (sugar) is the main product of photosynthesis, which plants use as food and energy."
        }
      ],
      points: 18,
      prerequisites: [],
      tags: ["photosynthesis", "plant-nutrition", "autotrophs"]
    },
    {
      title: "Nutrition in Plants - Chapter Explanation & Solutions",
      description: "Detailed explanation of plant nutrition with NCERT solutions and examples",
      subject: "Science",
      grade: "Class 7",
      difficulty: "intermediate",
      duration: 55,
      videoUrl: "https://www.youtube.com/embed/JbnxZR01HrY",
      quizQuestions: [
        {
          question: "Why are plants called producers in the food chain?",
          options: [
            "Because they produce oxygen",
            "Because they produce their own food",
            "Because they produce seeds",
            "Because they produce flowers"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["producers", "food-chain"],
          explanation: "Plants are called producers because they produce their own food through photosynthesis, which other organisms depend on."
        },
        {
          question: "What happens to the glucose produced during photosynthesis?",
          options: [
            "It is immediately released into the air",
            "It is stored as starch or used for energy",
            "It is converted to carbon dioxide",
            "It is excreted by the plant"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["glucose-utilization", "energy"],
          explanation: "The glucose produced during photosynthesis is either stored as starch or used by the plant for energy and growth."
        },
        {
          question: "Which of these is NOT a condition required for photosynthesis?",
          options: ["Sunlight", "Chlorophyll", "Oxygen", "Carbon dioxide"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["conditions", "photosynthesis"],
          explanation: "Oxygen is a product of photosynthesis, not a requirement. Sunlight, chlorophyll, and carbon dioxide are required."
        },
        {
          question: "What is the role of stomata in photosynthesis?",
          options: [
            "To absorb sunlight",
            "To take in carbon dioxide and release oxygen",
            "To transport water",
            "To store food"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["stomata", "gas-exchange"],
          explanation: "Stomata are tiny pores in leaves that allow carbon dioxide to enter and oxygen to exit during photosynthesis."
        },
        {
          question: "How do plants get water for photosynthesis?",
          options: [
            "Through their leaves",
            "Through their roots",
            "Through their flowers",
            "Through their stem only"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["water-absorption", "roots"],
          explanation: "Plants absorb water through their roots, which is then transported to the leaves for photosynthesis."
        },
        {
          question: "What is the chemical equation for photosynthesis?",
          options: [
            "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂",
            "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O",
            "6CO₂ + 6O₂ → C₆H₁₂O₆ + 6H₂O",
            "C₆H₁₂O₆ + 6H₂O → 6CO₂ + 6O₂"
          ],
          correctAnswer: 0,
          difficulty: "hard",
          skillTags: ["chemical-equation", "photosynthesis"],
          explanation: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂ represents the conversion of carbon dioxide and water to glucose and oxygen in the presence of sunlight and chlorophyll."
        }
      ],
      points: 20,
      prerequisites: ["Nutrition in Plants - Full Chapter"],
      tags: ["photosynthesis", "food-chain", "stomata", "chemical-equation"]
    }
  ],
  mathematics: [
    {
      title: "Integers - Chapter Overview and Introduction",
      description: "Complete introduction to integers, positive and negative numbers, and their operations",
      subject: "Mathematics",
      grade: "Class 7",
      difficulty: "beginner",
      duration: 40,
      videoUrl: "https://www.youtube.com/embed/qOfN5jA8eMc",
      quizQuestions: [
        {
          question: "What are integers?",
          options: [
            "Only positive numbers",
            "Only negative numbers",
            "Positive numbers, negative numbers, and zero",
            "Only decimal numbers"
          ],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["definition", "integers"],
          explanation: "Integers include positive numbers, negative numbers, and zero. They are whole numbers without fractions or decimals."
        },
        {
          question: "Which of these is an integer?",
          options: ["3.5", "-2", "1/2", "0.75"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["identification", "integers"],
          explanation: "-2 is an integer. 3.5, 1/2, and 0.75 are not integers because they have decimal or fractional parts."
        },
        {
          question: "What is the opposite of 7?",
          options: ["-7", "7", "0", "1/7"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["opposites", "negative-numbers"],
          explanation: "The opposite of 7 is -7. Opposite numbers are the same distance from zero but on opposite sides of the number line."
        },
        {
          question: "What is the sum of -5 and 3?",
          options: ["-8", "-2", "2", "8"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["addition", "integers"],
          explanation: "-5 + 3 = -2. When adding integers with different signs, subtract the smaller absolute value from the larger one and keep the sign of the larger absolute value."
        },
        {
          question: "What is the product of -4 and -6?",
          options: ["-24", "24", "-10", "10"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["multiplication", "integers"],
          explanation: "-4 × -6 = 24. When multiplying two negative numbers, the result is positive."
        },
        {
          question: "What is the absolute value of -8?",
          options: ["-8", "8", "0", "-1/8"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["absolute-value", "integers"],
          explanation: "The absolute value of -8 is 8. Absolute value represents the distance of a number from zero on the number line, which is always positive."
        }
      ],
      points: 18,
      prerequisites: [],
      tags: ["integers", "positive-numbers", "negative-numbers", "absolute-value"]
    }
  ]
};

// Import the Module model
let Module;
try {
  Module = require('../models/Module.ts').default;
} catch (error) {
  console.log('Trying alternative import method...');
  Module = require('../models/Module.ts');
}

async function seedModules() {
  try {
    console.log('Starting module seeding...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Not found');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing modules
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    // Flatten all modules from different subjects
    const allModules = [];
    Object.keys(magnetBrainsVideos).forEach(subject => {
      allModules.push(...magnetBrainsVideos[subject]);
    });

         // Add additional fields and ensure schema compliance
     const modulesToInsert = allModules.map((module, index) => ({
       ...module,
       uniqueID: `TRANSCRIBE_${String(index + 3).padStart(3, '0')}`, // Use transcribe IDs starting from 003
       learningType: 'hybrid',
       contentTypes: {
         video: {
           url: module.videoUrl,
           duration: module.duration,
           engagementThreshold: 80
         }
       },
       adaptiveFeatures: {
         difficultyAdjustment: true,
         personalizedPath: true,
         skillGaps: [],
         prerequisites: module.prerequisites || [],
         nextModules: []
       },
       gamification: {
         quests: generateQuests(module.subject),
         badges: generateAchievements(module.difficulty),
         leaderboard: true,
         streaks: true
       },
       aiFeatures: {
         realTimeAssessment: true,
         personalizedFeedback: true,
         adaptiveQuestions: true,
         learningPathRecommendation: true
       },
       isActive: true,
       createdAt: new Date(),
       updatedAt: new Date()
     }));

    // Insert modules
    await Module.insertMany(modulesToInsert);
    console.log(`Successfully seeded ${modulesToInsert.length} modules`);

    // Display summary
    const subjectCounts = {};
    modulesToInsert.forEach(module => {
      subjectCounts[module.subject] = (subjectCounts[module.subject] || 0) + 1;
    });

    console.log('\nModules by subject:');
    Object.entries(subjectCounts).forEach(([subject, count]) => {
      const subjectModules = modulesToInsert.filter(m => m.subject === subject);
      console.log(`${subject}: ${subjectModules.map(m => m.title).join(', ')}`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Error seeding modules:', error);
    process.exit(1);
  }
}

function getSubjectIcon(subject) {
  const icons = {
    'Mathematics': '🔢',
    'Science': '🔬',
    'Geography': '🌍'
  };
  return icons[subject] || '📖';
}

function generateQuests(subject) {
  const baseQuests = [
    { 
      id: 'watch_video',
      title: 'Video Watcher', 
      description: 'Complete the video lesson', 
      type: 'watch',
      target: 1, 
      reward: 10 
    },
    { 
      id: 'quiz_master',
      title: 'Quiz Master', 
      description: 'Score 80% or higher in quiz', 
      type: 'score',
      target: 80, 
      reward: 15 
    },
    { 
      id: 'fast_learner',
      title: 'Fast Learner', 
      description: 'Complete module in under 30 minutes', 
      type: 'complete',
      target: 30, 
      reward: 20 
    }
  ];
  
  // Add subject-specific quests
  const subjectQuests = {
    'Mathematics': { 
      id: 'problem_solver',
      title: 'Problem Solver', 
      description: 'Solve all math problems correctly', 
      type: 'complete',
      target: 100, 
      reward: 25 
    },
    'Science': { 
      id: 'experiment_explorer',
      title: 'Experiment Explorer', 
      description: 'Identify all scientific concepts', 
      type: 'complete',
      target: 100, 
      reward: 25 
    },
    'Geography': { 
      id: 'world_explorer',
      title: 'World Explorer', 
      description: 'Master all geographical concepts', 
      type: 'complete',
      target: 100, 
      reward: 25 
    }
  };
  
  if (subjectQuests[subject]) {
    baseQuests.push(subjectQuests[subject]);
  }
  
  return baseQuests;
}

function generateAchievements(difficulty) {
  const baseAchievements = ['First Steps', 'Consistent Learner'];
  
  if (difficulty === 'intermediate') {
    baseAchievements.push('Rising Star');
  } else if (difficulty === 'advanced') {
    baseAchievements.push('Expert Level');
  }
  
  return baseAchievements;
}

seedModules(); 