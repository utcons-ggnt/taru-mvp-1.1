'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    question: 'How confident are you with basic arithmetic (addition, subtraction, multiplication, division)?',
    options: [
      { id: 'very-confident', text: 'Very confident - I can do this easily', score: 5 },
      { id: 'confident', text: 'Confident - I can do this most of the time', score: 4 },
      { id: 'somewhat', text: 'Somewhat confident - I can do this sometimes', score: 3 },
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
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 1 }
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
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
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
      { id: 'good', text: 'Good - I write mostly complete sentences', score: 4 },
      { id: 'average', text: 'Average - I write some complete sentences', score: 3 },
      { id: 'below-average', text: 'Below average - I struggle with complete sentences', score: 2 },
      { id: 'poor', text: 'Poor - I have trouble writing sentences', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 8,
    category: 'Writing',
    question: 'Can you organize your thoughts into paragraphs?',
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
    id: 9,
    category: 'Writing',
    question: 'Do you use proper punctuation and capitalization?',
    options: [
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
    ],
    type: 'true-false'
  },

  // Science Skills
  {
    id: 10,
    category: 'Science',
    question: 'How interested are you in learning about how things work?',
    options: [
      { id: 'very-interested', text: 'Very interested - I love learning about this', score: 5 },
      { id: 'interested', text: 'Interested - I like learning about this', score: 4 },
      { id: 'somewhat', text: 'Somewhat interested - It\'s okay', score: 3 },
      { id: 'not-interested', text: 'Not very interested - I don\'t care much', score: 2 },
      { id: 'boring', text: 'Boring - I don\'t like this', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 11,
    category: 'Science',
    question: 'Can you follow step-by-step instructions for experiments?',
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
    question: 'Do you ask questions about why things happen?',
    options: [
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
    ],
    type: 'true-false'
  },

  // Technology Skills
  {
    id: 13,
    category: 'Technology',
    question: 'How comfortable are you using computers and digital devices?',
    options: [
      { id: 'very-comfortable', text: 'Very comfortable - I can use them easily', score: 5 },
      { id: 'comfortable', text: 'Comfortable - I can use them most of the time', score: 4 },
      { id: 'somewhat', text: 'Somewhat comfortable - I can use them sometimes', score: 3 },
      { id: 'not-comfortable', text: 'Not very comfortable - I struggle with them', score: 2 },
      { id: 'uncomfortable', text: 'Uncomfortable - I have trouble using them', score: 1 }
    ],
    type: 'multiple-choice'
  },
  {
    id: 14,
    category: 'Technology',
    question: 'Can you use basic software like word processors or web browsers?',
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
    id: 15,
    category: 'Technology',
    question: 'Do you enjoy learning about new technology?',
    options: [
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
    ],
    type: 'true-false'
  }
];

export default function DiagnosticAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Diagnostic Assessment Complete!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Here are your results and what they mean for your learning journey.
              </p>
            </div>

            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
              <div className="text-6xl font-bold mb-2">{assessmentResults.overallScore}%</div>
              <p className="text-lg">Skill Level: {assessmentResults.skillLevel.charAt(0).toUpperCase() + assessmentResults.skillLevel.slice(1)}</p>
            </div>

            {/* Category Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {Object.entries(assessmentResults.categoryScores).map(([category, score]) => (
                <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{category}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Learning Style */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your Learning Style</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Based on your responses, you learn best through{' '}
                <span className="font-semibold">
                  {assessmentResults.learningStyle === 'reading-writing' && 'reading and writing activities'}
                  {assessmentResults.learningStyle === 'logical-mathematical' && 'logical thinking and problem-solving'}
                  {assessmentResults.learningStyle === 'visual-spatial' && 'visual and hands-on activities'}
                  {assessmentResults.learningStyle === 'balanced' && 'a balanced mix of different approaches'}
                </span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSaveResults}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Results & Continue'}
              </button>
              <button
                onClick={handleSkip}
                className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-medium transition-colors hover:bg-gray-600"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
              Question {currentQuestionIndex + 1} of {diagnosticQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Diagnostic Assessment
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Let's understand your current skills and learning preferences
            </p>
          </div>

          {/* Category Badge */}
          <div className="text-center mb-6">
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full font-medium">
              {currentQuestion.category}
            </span>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              {currentQuestion.question}
            </h2>

            {/* Answer Options */}
            <div className="space-y-4">
              {currentQuestion.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.id)}
                  className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                    answers[currentQuestion.id] === option.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <span className="text-lg text-gray-900 dark:text-white">{option.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === diagnosticQuestions.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>

          {/* Skip Option */}
          <div className="text-center mt-6">
            <button
              onClick={handleSkip}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline"
            >
              Skip this assessment for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 