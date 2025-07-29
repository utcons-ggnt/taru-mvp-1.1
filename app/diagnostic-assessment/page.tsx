'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  question: string;
  options: {
    id: string;
    text: string;
    score: number;
  }[];
  type: 'multiple-choice' | 'true-false' | 'rating';
}

const diagnosticQuestions: Question[] = [
  // Math Skills
  {
    id: 1,
    category: 'Mathematics',
    question: 'How confident are you with basic algebra?',
    options: [
      { id: 'very-confident', text: 'Very confident - I can solve most problems easily', score: 5 },
      { id: 'confident', text: 'Confident - I can solve most problems', score: 4 },
      { id: 'somewhat', text: 'Somewhat confident - I can solve some problems', score: 3 },
      { id: 'not-confident', text: 'Not very confident - I struggle with this', score: 2 },
      { id: 'need-help', text: 'I need help with this', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 2,
    category: 'Mathematics',
    question: 'Can you solve word problems that involve multiple steps?',
    options: [
      { id: 'yes-easily', text: 'Yes, easily', score: 5 },
      { id: 'yes-mostly', text: 'Yes, most of the time', score: 4 },
      { id: 'sometimes', text: 'Sometimes', score: 3 },
      { id: 'rarely', text: 'Rarely', score: 2 },
      { id: 'no', text: 'No, I find this difficult', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 3,
    category: 'Mathematics',
    question: 'Do you understand fractions and decimals?',
    options: [
      { id: 'true', text: 'Yes, I understand them well', score: 5 },
      { id: 'false', text: 'No, I need more practice', score: 1 }
    ],
    type: 'true-false'
  },

  // Reading Skills
  {
    id: 4,
    category: 'Reading',
    question: 'How well can you read and understand what you read?',
    options: [
      { id: 'excellent', text: 'Excellent - I understand everything I read', score: 5 },
      { id: 'good', text: 'Good - I understand most of what I read', score: 4 },
      { id: 'average', text: 'Average - I understand some of what I read', score: 3 },
      { id: 'below-average', text: 'Below average - I struggle to understand', score: 2 },
      { id: 'poor', text: 'Poor - I have trouble reading', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 5,
    category: 'Reading',
    question: 'Can you identify the main idea in a paragraph?',
    options: [
      { id: 'always', text: 'Always', score: 5 },
      { id: 'usually', text: 'Usually', score: 4 },
      { id: 'sometimes', text: 'Sometimes', score: 3 },
      { id: 'rarely', text: 'Rarely', score: 2 },
      { id: 'never', text: 'Never', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 6,
    category: 'Reading',
    question: 'Do you enjoy reading books for fun?',
    options: [
      { id: 'true', text: 'Yes, I love reading', score: 5 },
      { id: 'false', text: 'No, I prefer other activities', score: 2 }
    ],
    type: 'true-false'
  },

  // Writing Skills
  {
    id: 7,
    category: 'Writing',
    question: 'How well can you write complete sentences?',
    options: [
      { id: 'excellent', text: 'Excellent - I write clear, complete sentences', score: 5 },
      { id: 'good', text: 'Good - Most of my sentences are complete', score: 4 },
      { id: 'average', text: 'Average - Some of my sentences are complete', score: 3 },
      { id: 'below-average', text: 'Below average - I struggle with sentences', score: 2 },
      { id: 'poor', text: 'Poor - I have trouble writing sentences', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 8,
    category: 'Writing',
    question: 'Can you write a paragraph with a main idea and supporting details?',
    options: [
      { id: 'yes-easily', text: 'Yes, easily', score: 5 },
      { id: 'yes-help', text: 'Yes, with some help', score: 4 },
      { id: 'sometimes', text: 'Sometimes', score: 3 },
      { id: 'rarely', text: 'Rarely', score: 2 },
      { id: 'no', text: 'No, this is very difficult for me', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 9,
    category: 'Writing',
    question: 'Do you like writing stories or essays?',
    options: [
      { id: 'true', text: 'Yes, I enjoy writing', score: 5 },
      { id: 'false', text: 'No, I find it challenging', score: 2 }
    ],
    type: 'true-false'
  },

  // Science Skills
  {
    id: 10,
    category: 'Science',
    question: 'How interested are you in learning about how things work?',
    options: [
      { id: 'very-interested', text: 'Very interested', score: 5 },
      { id: 'interested', text: 'Interested', score: 4 },
      { id: 'somewhat', text: 'Somewhat interested', score: 3 },
      { id: 'not-very', text: 'Not very interested', score: 2 },
      { id: 'not-interested', text: 'Not interested', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 11,
    category: 'Science',
    question: 'Can you make predictions about what might happen in an experiment?',
    options: [
      { id: 'always', text: 'Always', score: 5 },
      { id: 'usually', text: 'Usually', score: 4 },
      { id: 'sometimes', text: 'Sometimes', score: 3 },
      { id: 'rarely', text: 'Rarely', score: 2 },
      { id: 'never', text: 'Never', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 12,
    category: 'Science',
    question: 'Do you enjoy doing science experiments?',
    options: [
      { id: 'true', text: 'Yes, I love experiments', score: 5 },
      { id: 'false', text: 'No, I prefer other activities', score: 2 }
    ],
    type: 'true-false'
  },

  // Technology Skills
  {
    id: 13,
    category: 'Technology',
    question: 'How comfortable are you using computers or tablets?',
    options: [
      { id: 'very-comfortable', text: 'Very comfortable', score: 5 },
      { id: 'comfortable', text: 'Comfortable', score: 4 },
      { id: 'somewhat', text: 'Somewhat comfortable', score: 3 },
      { id: 'not-very', text: 'Not very comfortable', score: 2 },
      { id: 'not-comfortable', text: 'Not comfortable at all', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 14,
    category: 'Technology',
    question: 'Can you find information on the internet safely?',
    options: [
      { id: 'yes-easily', text: 'Yes, easily and safely', score: 5 },
      { id: 'yes-help', text: 'Yes, with some help', score: 4 },
      { id: 'sometimes', text: 'Sometimes', score: 3 },
      { id: 'rarely', text: 'Rarely', score: 2 },
      { id: 'no', text: 'No, I need help with this', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 15,
    category: 'Technology',
    question: 'Do you enjoy learning about new technology?',
    options: [
      { id: 'true', text: 'Yes, I love learning about tech', score: 5 },
      { id: 'false', text: 'No, I prefer other subjects', score: 2 }
    ],
    type: 'true-false'
  }
];

interface AssessmentResults {
  overallScore: number;
  skillLevel: string;
  categoryScores: { [category: string]: number };
  learningStyle: string;
}

export default function DiagnosticAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<unknown>(null);
  const router = useRouter();

  const currentQuestion = diagnosticQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / diagnosticQuestions.length) * 100;

  const handleAnswer = (answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < diagnosticQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const categoryScores: {[key: string]: number} = {};
    const categoryCounts: {[key: string]: number} = {};

    // Calculate scores for each category
    diagnosticQuestions.forEach(question => {
      const answer = answers[question.id];
      if (answer) {
        const option = question.options.find(opt => opt.id === answer);
        if (option) {
          categoryScores[question.category] = (categoryScores[question.category] || 0) + option.score;
          categoryCounts[question.category] = (categoryCounts[question.category] || 0) + 1;
        }
      }
    });

    // Calculate averages
    const averageScores: {[key: string]: number} = {};
    Object.keys(categoryScores).forEach(category => {
      averageScores[category] = Math.round((categoryScores[category] / categoryCounts[category]) * 20); // Convert to percentage
    });

    // Determine learning style based on scores
    let learningStyle = 'balanced';
    if (averageScores['Reading'] > averageScores['Mathematics'] && averageScores['Reading'] > averageScores['Technology']) {
      learningStyle = 'reading-writing';
    } else if (averageScores['Mathematics'] > averageScores['Reading'] && averageScores['Mathematics'] > averageScores['Technology']) {
      learningStyle = 'logical-mathematical';
    } else if (averageScores['Technology'] > averageScores['Reading'] && averageScores['Technology'] > averageScores['Mathematics']) {
      learningStyle = 'visual-spatial';
    }

    // Determine overall skill level
    const overallScore = Object.values(averageScores).reduce((sum, score) => sum + score, 0) / Object.values(averageScores).length;
    let skillLevel = 'beginner';
    if (overallScore >= 80) skillLevel = 'advanced';
    else if (overallScore >= 60) skillLevel = 'intermediate';

    const results = {
      categoryScores: averageScores,
      learningStyle,
      skillLevel,
      overallScore: Math.round(overallScore),
      totalQuestions: diagnosticQuestions.length,
      answeredQuestions: Object.keys(answers).length
    };

    setAssessmentResults(results);
    setShowResults(true);
  };

  const handleSaveResults = async () => {
    if (!assessmentResults) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          diagnosticResults: assessmentResults,
          answers: answers
        })
      });

      if (response.ok) {
        router.push('/result-summary');
      } else {
        throw new Error('Failed to save diagnostic results');
      }
    } catch (error) {
      console.error('Save diagnostic results error:', error);
      alert('Failed to save results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/result-summary');
  };

  if (showResults && assessmentResults) {
    const results: AssessmentResults = assessmentResults as AssessmentResults;
    return (
      <motion.div 
        className="min-h-screen bg-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md lg:max-w-lg w-full">
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Results Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#6D18CE] mb-2">
                Assessment Complete! 🎉
              </h1>
              <p className="text-gray-500 text-sm md:text-base">
                Here are your personalized results
              </p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-[#6D18CE] to-purple-600 text-white rounded-xl p-6 mb-6 text-center">
              <div className="text-4xl font-bold mb-2">{results.overallScore}%</div>
              <div className="text-lg font-semibold capitalize">{results.skillLevel} Level</div>
            </div>

            {/* Category Scores */}
            <div className="space-y-4 mb-8">
              {Object.entries(results.categoryScores).map(([category, score]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{category}</span>
                  <span className="text-[#6D18CE] font-bold">{score as number}%</span>
                </div>
              ))}
            </div>

            {/* Learning Style */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8">
              <h3 className="font-semibold text-gray-800 mb-2">Your Learning Style</h3>
              <p className="text-gray-600 text-sm">
                {results.learningStyle.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSaveResults}
                disabled={isSubmitting}
                className="flex-1 bg-[#6D18CE] text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save & Continue'}
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Skip
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-md lg:max-w-lg w-full">
        <motion.div 
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-[#6D18CE] h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Heading Section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#6D18CE] mb-2">
              Take Diagnostic Test
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Let&apos;s assess your current skill level.
            </p>
          </div>

          {/* Question Box */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-medium mb-6 text-gray-800">
                {currentQuestion.question}
              </h2>

              {/* Answer Options */}
              <div className="space-y-3 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleAnswer(option.id)}
                    className={`w-full border border-gray-300 rounded-xl p-4 text-left cursor-pointer transition-all duration-200 ${
                      answers[currentQuestion.id] === option.id
                        ? 'bg-[#6D18CE] text-white border-[#6D18CE]'
                        : 'hover:shadow-md hover:border-[#6D18CE]'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option.text}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="bg-[#6D18CE] text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {currentQuestionIndex === diagnosticQuestions.length - 1 ? 'Finish' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors"
            >
              Skip assessment for now
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 