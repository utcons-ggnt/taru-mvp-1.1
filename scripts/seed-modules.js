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
          explanation: "An algebraic expression is a combination of numbers, variables, and mathematical operations."
        },
        {
          question: "Which of the following is a variable?",
          options: ["5", "x", "10", "π"],
          correctAnswer: 1,
          explanation: "x is a variable that can represent different values."
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
          explanation: "2x + 3 = 11 → 2x = 8 → x = 4"
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
          explanation: "Force is a push or pull on an object that can cause it to move, stop, or change direction."
        },
        {
          question: "What is the SI unit of force?",
          options: ["Newton", "Joule", "Watt", "Pascal"],
          correctAnswer: 0,
          explanation: "The SI unit of force is Newton (N)."
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
          explanation: "A chemical reaction is a process where substances transform into new substances with different properties."
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
          question: "Which part of speech describes a person, place, or thing?",
          options: ["Verb", "Noun", "Adjective", "Adverb"],
          correctAnswer: 1,
          explanation: "A noun is a word that names a person, place, thing, or idea."
        },
        {
          question: "What part of speech shows action or state of being?",
          options: ["Noun", "Verb", "Adjective", "Pronoun"],
          correctAnswer: 1,
          explanation: "A verb shows action or state of being."
        }
      ],
      points: 10,
      prerequisites: [],
      tags: ["grammar", "parts of speech", "nouns", "verbs"]
    },
    {
      title: "Tenses in English Grammar",
      description: "Understanding present, past, and future tenses",
      subject: "English",
      grade: "Class 7",
      difficulty: "intermediate",
      duration: 45,
      videoUrl: "https://www.youtube.com/embed/w2z2p6Y0Jxw", // Magnet Brains Tenses
      quizQuestions: [
        {
          question: "Which tense is used for actions happening now?",
          options: ["Past tense", "Present tense", "Future tense", "Perfect tense"],
          correctAnswer: 1,
          explanation: "Present tense is used for actions happening now or regularly."
        }
      ],
      points: 15,
      prerequisites: ["Parts of Speech"],
      tags: ["grammar", "tenses", "present", "past", "future"]
    }
  ],
  socialStudies: [
    {
      title: "Indian Constitution",
      description: "Understanding the basic structure and features of Indian Constitution",
      subject: "Social Studies",
      grade: "Class 8",
      difficulty: "beginner",
      duration: 50,
      videoUrl: "https://www.youtube.com/embed/2V-20Qe4M8Y", // Magnet Brains Indian Constitution
      quizQuestions: [
        {
          question: "When was the Indian Constitution adopted?",
          options: ["1947", "1949", "1950", "1951"],
          correctAnswer: 1,
          explanation: "The Indian Constitution was adopted on 26th November 1949."
        },
        {
          question: "Who is known as the Father of the Indian Constitution?",
          options: ["Mahatma Gandhi", "Jawaharlal Nehru", "Dr. B.R. Ambedkar", "Sardar Patel"],
          correctAnswer: 2,
          explanation: "Dr. B.R. Ambedkar is known as the Father of the Indian Constitution."
        }
      ],
      points: 15,
      prerequisites: [],
      tags: ["constitution", "civics", "democracy"]
    }
  ]
};

async function seedModules() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define the Module schema directly in the script
    const moduleSchema = new mongoose.Schema({
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
      quizQuestions: [{
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: Number, required: true },
        explanation: { type: String, required: true }
      }],
      points: { type: Number, default: 10 },
      prerequisites: [{ type: String }],
      tags: [{ type: String }]
    }, {
      timestamps: true
    });

    const Module = mongoose.models.Module || mongoose.model('Module', moduleSchema);

    // Clear existing modules
    await Module.deleteMany({});
    console.log('Cleared existing modules');

    // Insert all modules
    const allModules = Object.values(magnetBrainsVideos).flat();
    const insertedModules = await Module.insertMany(allModules);
    
    console.log(`Successfully seeded ${insertedModules.length} modules`);
    
    // Log the modules by subject
    const modulesBySubject = {};
    insertedModules.forEach(module => {
      if (!modulesBySubject[module.subject]) {
        modulesBySubject[module.subject] = [];
      }
      modulesBySubject[module.subject].push(module.title);
    });
    
    console.log('\nModules by subject:');
    Object.entries(modulesBySubject).forEach(([subject, titles]) => {
      console.log(`${subject}: ${titles.join(', ')}`);
    });

  } catch (error) {
    console.error('Error seeding modules:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedModules(); 