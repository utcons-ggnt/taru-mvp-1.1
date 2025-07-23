export interface DiagnosticQuestion {
  id: string;
  level: 'Elementary' | 'Middle' | 'Secondary';
  section: string;
  prompt: string;
  inputType: 'open_text' | 'multiple_choice' | 'pattern_choice' | 'fill_blanks' | 'image_text' | 'scenario_steps';
  options?: string[];
  category: 'Math' | 'Reading' | 'Writing' | 'Science' | 'Technology' | 'Logic' | 'Creativity' | 'Career' | 'Analytics' | 'Reflection';
  points: number;
  timeLimit?: number; // in seconds
}

export const diagnosticQuestionBank: DiagnosticQuestion[] = [
  // MIDDLE SCHOOL QUESTIONS (Grades 6-8)
  {
    id: 'mid_skill_001',
    level: 'Middle',
    section: 'Skill & Interest Survey',
    prompt: 'If you could invent one thing to help your school life, what would it be?',
    inputType: 'open_text',
    category: 'Creativity',
    points: 10,
    timeLimit: 120
  },
  {
    id: 'mid_skill_002',
    level: 'Middle',
    section: 'Skill & Interest Survey',
    prompt: 'Which of these sounds fun to you?',
    inputType: 'multiple_choice',
    options: ['Coding a game', 'Making a video', 'Fixing a toy', 'Solving a puzzle'],
    category: 'Technology',
    points: 8,
    timeLimit: 60
  },
  {
    id: 'mid_skill_003',
    level: 'Middle',
    section: 'Skill & Interest Survey',
    prompt: 'What do you like doing most when no one\'s watching?',
    inputType: 'multiple_choice',
    options: ['Drawing', 'Exploring apps', 'Solving riddles', 'Helping a friend'],
    category: 'Reflection',
    points: 8,
    timeLimit: 60
  },
  {
    id: 'mid_logic_001',
    level: 'Middle',
    section: 'Logical Reasoning Challenges',
    prompt: 'You see a robot do the same 3 actions again and again. What comes next?',
    inputType: 'pattern_choice',
    options: ['Action 1', 'Action 2', 'Action 3', 'Action 4'],
    category: 'Logic',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'mid_logic_002',
    level: 'Middle',
    section: 'Logical Reasoning Challenges',
    prompt: 'Solve: If Alex is taller than Sam, and Sam is taller than Mia, who is the shortest?',
    inputType: 'multiple_choice',
    options: ['Alex', 'Sam', 'Mia', 'Cannot determine'],
    category: 'Logic',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'mid_logic_003',
    level: 'Middle',
    section: 'Logical Reasoning Challenges',
    prompt: 'Complete the puzzle: 3, 6, 9, ?, ?',
    inputType: 'fill_blanks',
    category: 'Math',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'mid_creative_001',
    level: 'Middle',
    section: 'Creative Thinking Prompts',
    prompt: 'Find 3 new ways to use a pencil (not for writing).',
    inputType: 'open_text',
    category: 'Creativity',
    points: 15,
    timeLimit: 180
  },
  {
    id: 'mid_creative_002',
    level: 'Middle',
    section: 'Creative Thinking Prompts',
    prompt: 'Finish this story: \'One day, my book started talking to me and...\'',
    inputType: 'open_text',
    category: 'Writing',
    points: 15,
    timeLimit: 240
  },
  {
    id: 'mid_creative_003',
    level: 'Middle',
    section: 'Creative Thinking Prompts',
    prompt: 'Design a superhero classroom — what will it have?',
    inputType: 'image_text',
    category: 'Creativity',
    points: 15,
    timeLimit: 300
  },

  // SECONDARY SCHOOL QUESTIONS (Grades 9-12)
  {
    id: 'sec_career_001',
    level: 'Secondary',
    section: 'Career Interest Profiler',
    prompt: 'Which of these real-world missions excites you most?',
    inputType: 'multiple_choice',
    options: ['Build', 'Teach', 'Innovate', 'Analyze', 'Create'],
    category: 'Career',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'sec_career_002',
    level: 'Secondary',
    section: 'Career Interest Profiler',
    prompt: 'What kind of people do you admire the most?',
    inputType: 'multiple_choice',
    options: ['Engineers', 'Designers', 'Entrepreneurs', 'Scientists', 'Social Leaders'],
    category: 'Career',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'sec_career_003',
    level: 'Secondary',
    section: 'Career Interest Profiler',
    prompt: 'Imagine your ideal future job — describe a day at work.',
    inputType: 'open_text',
    category: 'Career',
    points: 15,
    timeLimit: 300
  },
  {
    id: 'sec_analytics_001',
    level: 'Secondary',
    section: 'Analytical Problem Scenarios',
    prompt: 'You are planning an event for 200 students with ₹10,000. How do you split the money?',
    inputType: 'open_text',
    category: 'Analytics',
    points: 20,
    timeLimit: 360
  },
  {
    id: 'sec_analytics_002',
    level: 'Secondary',
    section: 'Analytical Problem Scenarios',
    prompt: 'What would you do to reduce water wastage in your community?',
    inputType: 'open_text',
    category: 'Analytics',
    points: 20,
    timeLimit: 300
  },
  {
    id: 'sec_analytics_003',
    level: 'Secondary',
    section: 'Analytical Problem Scenarios',
    prompt: 'Your school\'s Wi-Fi breaks during an online exam. What steps will you take?',
    inputType: 'scenario_steps',
    category: 'Analytics',
    points: 20,
    timeLimit: 240
  },
  {
    id: 'sec_reflection_001',
    level: 'Secondary',
    section: 'Self-Assessment Reflection',
    prompt: 'When was the last time you were really proud of yourself? What happened?',
    inputType: 'open_text',
    category: 'Reflection',
    points: 15,
    timeLimit: 240
  },
  {
    id: 'sec_reflection_002',
    level: 'Secondary',
    section: 'Self-Assessment Reflection',
    prompt: 'How do you usually react when things don\'t go as planned?',
    inputType: 'multiple_choice',
    options: ['Get frustrated', 'Step back and rethink', 'Ask for help', 'Try again differently'],
    category: 'Reflection',
    points: 12,
    timeLimit: 90
  },
  {
    id: 'sec_reflection_003',
    level: 'Secondary',
    section: 'Self-Assessment Reflection',
    prompt: 'If you had a magic notebook that taught one skill — what would you want it to teach you?',
    inputType: 'open_text',
    category: 'Reflection',
    points: 15,
    timeLimit: 180
  },

  // ELEMENTARY SCHOOL QUESTIONS (Grades 1-5)
  {
    id: 'elem_basic_001',
    level: 'Elementary',
    section: 'Basic Skills Survey',
    prompt: 'What is your favorite way to learn new things?',
    inputType: 'multiple_choice',
    options: ['Looking at pictures', 'Listening to stories', 'Playing games', 'Drawing'],
    category: 'Reflection',
    points: 5,
    timeLimit: 60
  },
  {
    id: 'elem_basic_002',
    level: 'Elementary',
    section: 'Basic Skills Survey',
    prompt: 'If you could be any animal for a day, which would you choose and why?',
    inputType: 'open_text',
    category: 'Creativity',
    points: 8,
    timeLimit: 120
  },
  {
    id: 'elem_logic_001',
    level: 'Elementary',
    section: 'Simple Logic Puzzles',
    prompt: 'What comes after: Apple, Banana, Apple, Banana, ?',
    inputType: 'multiple_choice',
    options: ['Apple', 'Banana', 'Orange', 'Grape'],
    category: 'Logic',
    points: 8,
    timeLimit: 60
  },
  {
    id: 'elem_creative_001',
    level: 'Elementary',
    section: 'Creative Expression',
    prompt: 'Draw or describe your dream playground',
    inputType: 'image_text',
    category: 'Creativity',
    points: 10,
    timeLimit: 180
  },
  {
    id: 'elem_math_001',
    level: 'Elementary',
    section: 'Number Fun',
    prompt: 'Count by 2s: 2, 4, 6, ?, ?',
    inputType: 'fill_blanks',
    category: 'Math',
    points: 8,
    timeLimit: 90
  }
];

export function getQuestionsForGrade(grade: string): DiagnosticQuestion[] {
  const gradeNum = parseInt(grade.replace(/\D/g, '')) || 0;
  
  let level: 'Elementary' | 'Middle' | 'Secondary';
  
  if (gradeNum >= 1 && gradeNum <= 5) {
    level = 'Elementary';
  } else if (gradeNum >= 6 && gradeNum <= 8) {
    level = 'Middle';
  } else {
    level = 'Secondary';
  }
  
  return diagnosticQuestionBank.filter(q => q.level === level);
}

export function getQuestionsBySection(level: string, section: string): DiagnosticQuestion[] {
  return diagnosticQuestionBank.filter(q => 
    q.level === level && q.section === section
  );
}

export function calculateSectionScores(answers: Record<string, string | number>): Record<string, number> {
  const scores: Record<string, number> = {};
  
  Object.entries(answers).forEach(([questionId, answer]) => {
    const question = diagnosticQuestionBank.find(q => q.id === questionId);
    if (question && answer) {
      const category = question.category;
      if (!scores[category]) {
        scores[category] = 0;
      }
      
      // Score based on input type and quality of answer
      let questionScore = 0;
      
      switch (question.inputType) {
        case 'multiple_choice':
        case 'pattern_choice':
          questionScore = question.points;
          break;
        case 'open_text':
        case 'image_text':
          // Score based on answer length and thoughtfulness
          const answerLength = answer.toString().length;
          if (answerLength > 50) questionScore = question.points;
          else if (answerLength > 20) questionScore = Math.floor(question.points * 0.7);
          else if (answerLength > 0) questionScore = Math.floor(question.points * 0.4);
          break;
        case 'fill_blanks':
          questionScore = question.points;
          break;
        case 'scenario_steps':
          // Score based on number of steps provided
          const steps = answer.toString().split(',').length;
          questionScore = Math.min(steps * 3, question.points);
          break;
        default:
          questionScore = question.points * 0.5;
      }
      
      scores[category] += questionScore;
    }
  });
  
  return scores;
}

export function generateRecommendations(scores: Record<string, number>, level: string): string[] {
  const recommendations: string[] = [];
  const sortedScores = Object.entries(scores).sort(([,a], [,b]) => b - a);
  
  // Get top 3 categories
  const topCategories = sortedScores.slice(0, 3);
  
  topCategories.forEach(([category]) => {
    switch (category) {
      case 'Math':
        if (level === 'Elementary') {
          recommendations.push('Number games and counting activities');
        } else if (level === 'Middle') {
          recommendations.push('Algebra and geometry modules');
        } else {
          recommendations.push('Advanced mathematics and statistics');
        }
        break;
      case 'Technology':
        if (level === 'Elementary') {
          recommendations.push('Basic computer skills and educational games');
        } else if (level === 'Middle') {
          recommendations.push('Introduction to coding and digital tools');
        } else {
          recommendations.push('Programming languages and software development');
        }
        break;
      case 'Creativity':
        recommendations.push('Art and creative writing modules');
        recommendations.push('Design thinking workshops');
        break;
      case 'Logic':
        recommendations.push('Logic puzzles and brain teasers');
        recommendations.push('Critical thinking exercises');
        break;
      case 'Career':
        recommendations.push('Career exploration modules');
        recommendations.push('Professional skill development');
        break;
      case 'Analytics':
        recommendations.push('Data analysis and problem-solving modules');
        recommendations.push('Research methodology courses');
        break;
      case 'Science':
        if (level === 'Elementary') {
          recommendations.push('Basic science experiments and nature study');
        } else if (level === 'Middle') {
          recommendations.push('Physics, chemistry, and biology fundamentals');
        } else {
          recommendations.push('Advanced scientific research and methodology');
        }
        break;
      case 'Writing':
        recommendations.push('Creative writing and storytelling modules');
        recommendations.push('Essay writing and communication skills');
        break;
      case 'Reading':
        recommendations.push('Literature appreciation and reading comprehension');
        break;
      case 'Reflection':
        recommendations.push('Self-awareness and mindfulness modules');
        recommendations.push('Personal development workshops');
        break;
    }
  });
  
  return [...new Set(recommendations)]; // Remove duplicates
} 