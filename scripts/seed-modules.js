// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Magnet Brains video URLs for different subjects
const magnetBrainsVideos = {
  mathematics: [
    {
      title: "Introduction to Algebra",
      description: "Learn the basics of algebraic expressions and equations",
      subject: "Mathematics",
      grade: "Class 8",
      difficulty: "beginner",
      duration: 45,
      videoUrl: "https://www.youtube.com/embed/Pm6stsq9drk", // Magnet Brains Algebra Basics
      quizQuestions: [
        {
          question: "What is an algebraic expression?",
          options: [
            "A mathematical statement with an equals sign",
            "A combination of numbers, variables, and operations",
            "A geometric shape",
            "A type of fraction"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["definition", "concepts"],
          explanation: "An algebraic expression is a combination of numbers, variables, and mathematical operations without an equals sign."
        },
        {
          question: "Which of the following is a variable?",
          options: ["5", "x", "10", "π"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["variables", "identification"],
          explanation: "x is a variable that can represent different values, while 5 and 10 are constants."
        },
        {
          question: "Simplify: 3x + 2x",
          options: ["5x", "6x", "5x²", "3x²"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["simplification", "like-terms"],
          explanation: "When adding like terms with the same variable, add the coefficients: 3x + 2x = (3+2)x = 5x"
        },
        {
          question: "What is the coefficient of x in the expression 7x - 3?",
          options: ["7", "-3", "x", "4"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["coefficients", "terminology"],
          explanation: "The coefficient is the number multiplied by the variable. In 7x - 3, the coefficient of x is 7."
        },
        {
          question: "If x = 4, what is the value of 2x + 3?",
          options: ["11", "9", "8", "7"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["substitution", "evaluation"],
          explanation: "Substitute x = 4: 2(4) + 3 = 8 + 3 = 11"
        },
        {
          question: "Which expression is equivalent to 3(x + 2)?",
          options: ["3x + 2", "3x + 6", "x + 6", "3x + 5"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["distribution", "expansion"],
          explanation: "Using the distributive property: 3(x + 2) = 3·x + 3·2 = 3x + 6"
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["algebra", "expressions", "variables"]
    },
    {
      title: "Linear Equations in One Variable",
      description: "Solving linear equations step by step",
      subject: "Mathematics",
      grade: "Class 8",
      difficulty: "intermediate",
      duration: 50,
      videoUrl: "https://www.youtube.com/embed/Qw8pFfFzQJw", // Magnet Brains Linear Equations
      quizQuestions: [
        {
          question: "What is the solution to 2x + 3 = 11?",
          options: ["x = 4", "x = 5", "x = 6", "x = 7"],
          correctAnswer: 0,
          difficulty: "easy",
          skillTags: ["basic-solving", "one-step"],
          explanation: "2x + 3 = 11 → 2x = 11 - 3 → 2x = 8 → x = 4"
        },
        {
          question: "Solve for x: 5x - 7 = 18",
          options: ["x = 3", "x = 4", "x = 5", "x = 6"],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["basic-solving", "isolation"],
          explanation: "5x - 7 = 18 → 5x = 18 + 7 → 5x = 25 → x = 5"
        },
        {
          question: "What is the first step to solve 3x + 8 = 2x - 4?",
          options: ["Subtract 8 from both sides", "Subtract 2x from both sides", "Add 4 to both sides", "Divide by 3"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["strategy", "multi-step"],
          explanation: "To collect like terms, subtract 2x from both sides: 3x - 2x + 8 = -4"
        },
        {
          question: "Solve: 4(x - 3) = 20",
          options: ["x = 8", "x = 7", "x = 6", "x = 5"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["distribution", "parentheses"],
          explanation: "4(x - 3) = 20 → 4x - 12 = 20 → 4x = 32 → x = 8"
        },
        {
          question: "If 3x + 5 = 2x + 12, what is x?",
          options: ["x = 7", "x = 8", "x = 9", "x = 10"],
          correctAnswer: 0,
          difficulty: "medium",
          skillTags: ["variables-both-sides", "collection"],
          explanation: "3x + 5 = 2x + 12 → 3x - 2x = 12 - 5 → x = 7"
        },
        {
          question: "Solve: (2x + 1)/3 = 5",
          options: ["x = 7", "x = 8", "x = 6", "x = 9"],
          correctAnswer: 0,
          difficulty: "hard",
          skillTags: ["fractions", "complex-solving"],
          explanation: "(2x + 1)/3 = 5 → 2x + 1 = 15 → 2x = 14 → x = 7"
        }
      ],
      points: 20,
      prerequisites: ["Introduction to Algebra"],
      tags: ["equations", "linear", "solving"]
    }
  ],
  science: [
    {
      title: "Force and Pressure",
      description: "Understanding the concepts of force and pressure in physics",
      subject: "Science",
      grade: "Class 8",
      difficulty: "beginner",
      duration: 40,
      videoUrl: "https://www.youtube.com/embed/Qw8pFfFzQJw", // Magnet Brains Force and Pressure
      quizQuestions: [
        {
          question: "What is force?",
          options: [
            "A push or pull on an object",
            "The speed of an object",
            "The weight of an object",
            "The size of an object"
          ],
          correctAnswer: 0,
          difficulty: "easy",
          skillTags: ["definition", "concepts"],
          explanation: "Force is a push or pull on an object that can cause it to move, stop, or change direction."
        },
        {
          question: "What is the SI unit of force?",
          options: ["Newton", "Joule", "Watt", "Pascal"],
          correctAnswer: 0,
          difficulty: "easy",
          skillTags: ["units", "measurement"],
          explanation: "The SI unit of force is Newton (N), named after Sir Isaac Newton."
        },
        {
          question: "Which of the following is an example of contact force?",
          options: ["Gravitational force", "Magnetic force", "Friction", "Electric force"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["types", "classification"],
          explanation: "Friction is a contact force because it acts when two surfaces are in contact."
        },
        {
          question: "What is pressure?",
          options: [
            "Force per unit mass",
            "Force per unit area",
            "Force per unit volume",
            "Force per unit time"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["pressure", "definition"],
          explanation: "Pressure is defined as force per unit area: P = F/A"
        },
        {
          question: "If a force of 20N acts on an area of 4m², what is the pressure?",
          options: ["5 Pa", "80 Pa", "16 Pa", "24 Pa"],
          correctAnswer: 0,
          difficulty: "hard",
          skillTags: ["calculation", "formula"],
          explanation: "Pressure = Force/Area = 20N/4m² = 5 Pa (Pascal)"
        },
        {
          question: "Why do we use broad straps in heavy bags?",
          options: [
            "To look fashionable",
            "To reduce pressure on shoulders",
            "To increase pressure",
            "To make the bag lighter"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["application", "real-life"],
          explanation: "Broad straps increase the contact area, which reduces pressure on shoulders (P = F/A)."
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["force", "pressure", "physics"]
    },
    {
      title: "Chemical Reactions and Equations",
      description: "Learn about different types of chemical reactions",
      subject: "Science",
      grade: "Class 10",
      difficulty: "intermediate",
      duration: 55,
      videoUrl: "https://www.youtube.com/embed/w2z2p6Y0Jxw", // Magnet Brains Chemical Reactions
      quizQuestions: [
        {
          question: "What is a chemical reaction?",
          options: [
            "A physical change in matter",
            "A process where substances transform into new substances",
            "A change in temperature",
            "A change in color"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["definition", "concepts"],
          explanation: "A chemical reaction is a process where substances transform into new substances with different properties."
        },
        {
          question: "Which of the following indicates a chemical reaction?",
          options: [
            "Change in state",
            "Formation of gas bubbles",
            "Change in shape",
            "Change in size"
          ],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["indicators", "observation"],
          explanation: "Formation of gas bubbles is a chemical indicator, while others are typically physical changes."
        },
        {
          question: "In the equation 2H₂ + O₂ → 2H₂O, what are the reactants?",
          options: ["H₂O only", "H₂ and O₂", "O₂ only", "H₂ only"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["equations", "reactants-products"],
          explanation: "Reactants are on the left side of the arrow: H₂ (hydrogen) and O₂ (oxygen)."
        },
        {
          question: "What type of reaction is: CaCO₃ → CaO + CO₂?",
          options: ["Combination", "Decomposition", "Displacement", "Double displacement"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["reaction-types", "classification"],
          explanation: "This is a decomposition reaction where one compound breaks down into two or more products."
        },
        {
          question: "Balance the equation: Fe + O₂ → Fe₂O₃",
          options: ["2Fe + 3O₂ → Fe₂O₃", "4Fe + 3O₂ → 2Fe₂O₃", "Fe + 3O₂ → Fe₂O₃", "3Fe + 2O₂ → Fe₂O₃"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["balancing", "equations"],
          explanation: "4Fe + 3O₂ → 2Fe₂O₃ balances atoms: 4 Fe and 6 O on each side."
        },
        {
          question: "What is the Law of Conservation of Mass?",
          options: [
            "Mass can be created or destroyed",
            "Mass remains constant in a chemical reaction",
            "Mass always increases in reactions",
            "Mass depends on temperature"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["laws", "conservation"],
          explanation: "The Law of Conservation of Mass states that mass is neither created nor destroyed in chemical reactions."
        }
      ],
      points: 20,
      prerequisites: ["Force and Pressure"],
      tags: ["chemistry", "reactions", "equations"]
    }
  ],
  english: [
    {
      title: "Parts of Speech",
      description: "Learn about nouns, verbs, adjectives, and other parts of speech",
      subject: "English",
      grade: "Class 6",
      difficulty: "beginner",
      duration: 35,
      videoUrl: "https://www.youtube.com/embed/Qw8pFfFzQJw", // Magnet Brains Parts of Speech
      quizQuestions: [
        {
          question: "What part of speech is the word 'beautiful' in the sentence 'She has a beautiful voice'?",
          options: ["Noun", "Verb", "Adjective", "Adverb"],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["adjectives", "identification"],
          explanation: "'Beautiful' describes the noun 'voice', making it an adjective."
        },
        {
          question: "Identify the verb in: 'The children played in the garden.'",
          options: ["children", "played", "garden", "the"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["verbs", "action-words"],
          explanation: "'Played' is the action word (verb) that tells us what the children did."
        },
        {
          question: "Which word is a proper noun?",
          options: ["city", "London", "river", "mountain"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["nouns", "proper-common"],
          explanation: "'London' is a proper noun because it's the specific name of a city and is capitalized."
        },
        {
          question: "What part of speech connects words or phrases?",
          options: ["Preposition", "Conjunction", "Interjection", "Pronoun"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["conjunctions", "connecting-words"],
          explanation: "Conjunctions like 'and', 'but', 'or' connect words, phrases, or clauses."
        },
        {
          question: "In 'He runs quickly', what part of speech is 'quickly'?",
          options: ["Adjective", "Adverb", "Verb", "Noun"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["adverbs", "modification"],
          explanation: "'Quickly' modifies the verb 'runs' and tells us how he runs, making it an adverb."
        },
        {
          question: "Which sentence contains an interjection?",
          options: [
            "The book is on the table.",
            "Wow! What an amazing performance!",
            "She sings beautifully.",
            "The cat sat on the mat."
          ],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["interjections", "expressions"],
          explanation: "'Wow!' is an interjection that expresses strong emotion or surprise."
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["grammar", "parts-of-speech", "language"]
    },
    {
      title: "Tenses in English Grammar",
      description: "Understanding past, present, and future tenses",
      subject: "English",
      grade: "Class 7",
      difficulty: "intermediate",
      duration: 45,
      videoUrl: "https://www.youtube.com/embed/Qw8pFfFzQJw", // Magnet Brains Tenses
      quizQuestions: [
        {
          question: "Which tense is used in: 'She writes a letter every day'?",
          options: ["Past tense", "Present tense", "Future tense", "Present perfect"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["present-tense", "identification"],
          explanation: "'Writes' is in simple present tense, indicating a habitual action."
        },
        {
          question: "What is the past tense of 'go'?",
          options: ["goed", "went", "gone", "going"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["irregular-verbs", "past-tense"],
          explanation: "'Went' is the irregular past tense form of 'go'."
        },
        {
          question: "Complete: 'Tomorrow, I _____ to the market.'",
          options: ["go", "went", "will go", "have gone"],
          correctAnswer: 2,
          difficulty: "medium",
          skillTags: ["future-tense", "construction"],
          explanation: "'Will go' is the future tense form used for actions that will happen tomorrow."
        },
        {
          question: "Which sentence is in present continuous tense?",
          options: [
            "I eat breakfast daily.",
            "I am eating breakfast now.",
            "I ate breakfast yesterday.",
            "I will eat breakfast tomorrow."
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["continuous-tense", "ongoing-actions"],
          explanation: "'Am eating' shows an action happening right now (present continuous: am/is/are + verb-ing)."
        },
        {
          question: "What is the correct form: 'She _____ her homework before dinner yesterday.'",
          options: ["finish", "finished", "will finish", "finishing"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["past-tense", "completion"],
          explanation: "'Finished' is the past tense form, appropriate for an action completed yesterday."
        },
        {
          question: "Which sentence uses present perfect tense correctly?",
          options: [
            "I have eat my lunch.",
            "I have eaten my lunch.",
            "I have ate my lunch.",
            "I am have eaten my lunch."
          ],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["perfect-tense", "past-participle"],
          explanation: "Present perfect uses 'have/has + past participle'. 'Eaten' is the past participle of 'eat'."
        }
      ],
      points: 18,
      prerequisites: ["Parts of Speech"],
      tags: ["grammar", "tenses", "verbs"]
    }
  ],
  socialStudies: [
    {
      title: "Indian Constitution",
      description: "Learn about the Indian Constitution and fundamental rights",
      subject: "Social Studies",
      grade: "Class 9",
      difficulty: "intermediate",
      duration: 60,
      videoUrl: "https://www.youtube.com/embed/Qw8pFfFzQJw", // Magnet Brains Constitution
      quizQuestions: [
        {
          question: "When was the Indian Constitution adopted?",
          options: ["26 January 1950", "26 November 1949", "15 August 1947", "26 January 1949"],
          correctAnswer: 1,
          difficulty: "easy",
          skillTags: ["dates", "history"],
          explanation: "The Indian Constitution was adopted on 26 November 1949 and came into effect on 26 January 1950."
        },
        {
          question: "Who is known as the 'Father of the Indian Constitution'?",
          options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel"],
          correctAnswer: 2,
          difficulty: "easy",
          skillTags: ["personalities", "constitution-makers"],
          explanation: "Dr. B.R. Ambedkar is known as the 'Father of the Indian Constitution' for his role as chairman of the drafting committee."
        },
        {
          question: "How many fundamental rights are mentioned in the Indian Constitution?",
          options: ["5", "6", "7", "8"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["fundamental-rights", "counting"],
          explanation: "There are 6 fundamental rights: Right to Equality, Freedom, Against Exploitation, to Freedom of Religion, Cultural and Educational Rights, and Constitutional Remedies."
        },
        {
          question: "Which article of the Constitution deals with the Right to Education?",
          options: ["Article 19", "Article 21A", "Article 25", "Article 32"],
          correctAnswer: 1,
          difficulty: "hard",
          skillTags: ["articles", "education"],
          explanation: "Article 21A provides the Right to Education for children aged 6-14 years."
        },
        {
          question: "What does 'secular' mean in the context of the Indian Constitution?",
          options: [
            "The state favors one religion",
            "The state has no official religion",
            "The state opposes all religions",
            "The state controls all religions"
          ],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["secularism", "concepts"],
          explanation: "Secular means the state treats all religions equally and has no official religion."
        },
        {
          question: "Which part of the constitution can be called the 'heart and soul' of the constitution?",
          options: ["Preamble", "Fundamental Rights", "Directive Principles", "Fundamental Duties"],
          correctAnswer: 1,
          difficulty: "medium",
          skillTags: ["importance", "dr-ambedkar"],
          explanation: "Dr. Ambedkar called Article 32 (Right to Constitutional Remedies) the 'heart and soul' of the constitution."
        }
      ],
      points: 25,
      prerequisites: [],
      tags: ["constitution", "civics", "rights"]
    }
  ]
};

// Import the Module model
const Module = require('../models/Module.ts').default || require('../models/Module.ts');

async function seedModules() {
  try {
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
       moduleId: `MOD_${module.subject.replace(/\s+/g, '_').toUpperCase()}_${index + 1}`,
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
    'English': '📚',
    'Social Studies': '🏛️'
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
    'English': { 
      id: 'grammar_guardian',
      title: 'Grammar Guardian', 
      description: 'Perfect grammar in all questions', 
      type: 'score',
      target: 100, 
      reward: 25 
    },
    'Social Studies': { 
      id: 'history_hero',
      title: 'History Hero', 
      description: 'Remember all important dates', 
      type: 'score',
      target: 90, 
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