'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Circle, Trophy, Star, Zap, ChevronLeft, ChevronRight, Target, Clock } from 'lucide-react';

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
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
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
      { id: 'true', text: 'True', score: 5 },
      { id: 'false', text: 'False', score: 2 }
    ],
    type: 'true-false'
  }
];

interface AssessmentResults {
  overallScore: number;
  skillLevel: string;
  categoryScores: { [category: string]: number };
  learningStyle: string;
  // Add other properties as needed
}

const categoryConfig = {
  Mathematics: { icon: Target, gradient: 'from-blue-500 to-purple-600', color: 'bg-blue-100 text-blue-600' },
  Reading: { icon: Star, gradient: 'from-green-500 to-emerald-600', color: 'bg-green-100 text-green-600' },
  Writing: { icon: Zap, gradient: 'from-purple-500 to-pink-600', color: 'bg-purple-100 text-purple-600' },
  Science: { icon: Trophy, gradient: 'from-orange-500 to-red-600', color: 'bg-orange-100 text-orange-600' },
  Technology: { icon: Clock, gradient: 'from-teal-500 to-cyan-600', color: 'bg-teal-100 text-teal-600' }
};

export default function DiagnosticAssessment() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<unknown>(null);
  const router = useRouter();

  const currentQuestion = diagnosticQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / diagnosticQuestions.length) * 100;
  const categoryInfo = categoryConfig[currentQuestion.category as keyof typeof categoryConfig];

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'from-green-500 to-emerald-600';
      case 'intermediate': return 'from-blue-500 to-purple-600';
      default: return 'from-orange-500 to-red-600';
    }
  };

  if (showResults && assessmentResults) {
    const results: AssessmentResults = assessmentResults as AssessmentResults;
    return (
      <>
        {/* Skip Link for Accessibility */}
        <a href="#assessment-results" className="skip-link">
          Skip to assessment results
        </a>

        <motion.div 
          className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-4xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <motion.div 
              id="assessment-results"
              className="card-glass p-6 sm:p-8 border-gradient relative overflow-hidden"
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 gradient-primary rounded-full blur-3xl opacity-10" aria-hidden="true"></div>
              <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 gradient-accent rounded-full blur-2xl opacity-10" aria-hidden="true"></div>

              <motion.div 
                className="text-center mb-8 sm:mb-12 relative z-10"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <motion.div 
                    className="w-16 h-16 sm:w-20 sm:h-20 gradient-primary rounded-2xl flex items-center justify-center"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
                  >
                    <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-3 sm:mb-4">
                  Assessment Complete! 🎉
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                  Great job! Here are your personalized results and learning recommendations
                </p>
              </motion.div>

              {/* Overall Score Card */}
              <motion.div 
                className={`card-modern p-6 sm:p-8 mb-6 sm:mb-8 bg-gradient-to-r ${getSkillLevelColor(results.skillLevel)} text-white relative overflow-hidden`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-10"></div>
                <div className="absolute top-4 right-4 opacity-20" aria-hidden="true">
                  <Star className="w-24 h-24 sm:w-32 sm:h-32" />
                </div>
                <div className="relative z-10 text-center">
                  <motion.div 
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 300 }}
                  >
                    {results.overallScore}%
                  </motion.div>
                  <div className="text-xl sm:text-2xl font-bold mb-2 capitalize">
                    {results.skillLevel} Level
                  </div>
                  <div className="text-white/90 text-sm sm:text-base">
                    Overall Performance Score
                  </div>
                </div>
              </motion.div>

              {/* Category Scores */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {Object.entries(results.categoryScores).map(([category, score], index) => {
                  const config = categoryConfig[category as keyof typeof categoryConfig];
                  return (
                    <motion.div 
                      key={category}
                      className="card-modern p-4 sm:p-6 group hover:shadow-xl transition-all duration-300"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${config.color} group-hover:scale-110 transition-transform duration-200`}>
                            <config.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">{category}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Skill Assessment</p>
                          </div>
                        </div>
                        <div className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${getScoreColor(score as number)}`}>
                          {score as number}%
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                        <motion.div
                          className={`h-2 sm:h-3 rounded-full bg-gradient-to-r ${config.gradient}`}
                          initial={{ width: "0%" }}
                          animate={{ width: `${score as number}%` }}
                          transition={{ delay: 1.0 + index * 0.2, duration: 1 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Learning Style */}
              <motion.div 
                className="card-modern p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Learning Style</h3>
                    <p className="text-sm sm:text-base text-gray-600">Personalized learning approach</p>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-gray-700">
                  Based on your responses, your learning style is{' '}
                  <span className="font-bold text-yellow-700 capitalize">
                    {results.learningStyle.replace('-', ' ')}
                  </span>
                  . This helps us recommend the best learning methods for you.
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <motion.button
                  onClick={handleSaveResults}
                  disabled={isSubmitting}
                  className="btn-modern btn-primary flex-1 max-w-xs"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={isSubmitting ? 'Saving results, please wait' : 'Save results and continue'}
                >
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.div
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full loading-spin"
                          aria-hidden="true"
                        />
                        Saving Results...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="save"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Star className="w-5 h-5" aria-hidden="true" />
                        Save & Continue
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                
                <motion.button
                  onClick={handleSkip}
                  className="btn-secondary flex-1 max-w-xs"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Skip for Now
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </>
    );
  }

  return (
    <>
      {/* Skip Link for Accessibility */}
      <a href="#assessment-form" className="skip-link">
        Skip to assessment form
      </a>

      <motion.main 
        className="min-h-screen flex flex-col lg:flex-row overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 gradient-accent rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-56 sm:w-80 h-56 sm:h-80 gradient-warm rounded-full blur-2xl opacity-20"></div>
        </div>

        {/* 🟪 Left Section - Enhanced Gradient */}
        <motion.section 
          className="w-full lg:w-1/2 gradient-primary px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white flex flex-col justify-between relative overflow-hidden min-h-screen lg:min-h-auto"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-20 left-10 w-24 sm:w-32 h-24 sm:h-32 bg-white bg-opacity-10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 right-10 w-20 sm:w-24 h-20 sm:h-24 bg-yellow-400 bg-opacity-20 rounded-full blur-xl"></div>
          </div>

          <motion.div
            className="relative z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="glass-dark rounded-2xl p-3 sm:p-4 w-fit">
              <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-8 sm:mt-16 relative z-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-400 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-800" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
                  Diagnostic Assessment
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mt-2">
                  Let&apos;s understand your skills and
                  <span className="text-gradient-warm block font-bold">Learning Preferences</span>
                </p>
              </div>
            </div>
            
            {/* Assessment info */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
              {[
                { icon: Clock, text: '15 Questions', subtext: 'Quick & Easy' },
                { icon: Target, text: 'Personalized', subtext: 'Just for You' },
                { icon: Star, text: 'No Wrong Answers', subtext: 'Be Honest' },
                { icon: Trophy, text: 'Get Results', subtext: 'Instant Feedback' }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="glass-dark rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-semibold text-sm sm:text-base">{item.text}</div>
                    <div className="text-xs text-white/70">{item.subtext}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            className="relative z-10 mt-6 sm:mt-8 lg:mt-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.05, rotate: 2 }}
          >
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-30"></div>
              <Image 
                src="/landingPage.png" 
                alt="Learning assessment illustration" 
                width={280} 
                height={280} 
                className="w-48 h-48 sm:w-64 sm:h-64 relative z-10" 
                priority
              />
            </div>
          </motion.div>
        </motion.section>

        {/* ⬜ Right Section - Enhanced Form */}
        <motion.section 
          className="w-full lg:w-1/2 bg-gradient-to-br from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-center relative overflow-hidden min-h-screen lg:min-h-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }} aria-hidden="true"></div>

          <motion.div 
            className="max-w-md mx-auto w-full relative z-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {/* Assessment Form Container */}
            <motion.div 
              id="assessment-form"
              className="card-glass p-6 sm:p-8 border-gradient"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Enhanced Progress Bar */}
              <motion.div 
                className="mb-6 sm:mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Question {currentQuestionIndex + 1} of {diagnosticQuestions.length}
                  </span>
                  <motion.span 
                    className="text-sm font-bold text-purple-600 bg-purple-100 px-2 sm:px-3 py-1 rounded-full"
                    key={Math.round(progress)}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {Math.round(progress)}%
                  </motion.span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 sm:h-3 rounded-full shadow-sm"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Assessment progress: ${Math.round(progress)}% complete`}
                  />
                </div>
              </motion.div>

              <motion.div 
                className="text-center mb-6 sm:mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gradient mb-2 sm:mb-3">
                  Diagnostic Assessment
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Help us understand your learning preferences
                </p>
              </motion.div>

              {/* Enhanced Category Badge */}
              <motion.div 
                className="text-center mb-6 sm:mb-8"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4, type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl font-semibold text-sm ${categoryInfo.color} shadow-lg`}
                  key={currentQuestion.category}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <categoryInfo.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {currentQuestion.category}
                </motion.div>
              </motion.div>

              {/* Enhanced Question */}
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentQuestion.id}
                  className="mb-6 sm:mb-8"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <motion.h2 
                    className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 text-center leading-relaxed px-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    {currentQuestion.question}
                  </motion.h2>

                  {/* Enhanced Answer Options */}
                  <motion.div 
                    className="space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <motion.button
                        key={option.id}
                        onClick={() => handleAnswer(option.id)}
                        className={`w-full p-3 sm:p-4 rounded-xl text-left transition-all duration-300 group relative overflow-hidden ${
                          answers[currentQuestion.id] === option.id
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg border-2 border-purple-300'
                            : 'bg-white border-2 border-gray-200 hover:border-purple-300 hover:shadow-md text-gray-700'
                        }`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
                        whileHover={{ 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        aria-pressed={answers[currentQuestion.id] === option.id}
                        aria-label={`Select option: ${option.text}`}
                      >
                        {/* Shimmer effect */}
                        {answers[currentQuestion.id] === option.id && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                            aria-hidden="true"
                          />
                        )}
                        
                        <div className="flex items-center justify-between relative z-10">
                          <span className="font-medium text-sm sm:text-base pr-2">{option.text}</span>
                          <div className="flex items-center flex-shrink-0">
                            {answers[currentQuestion.id] === option.id ? (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                              </motion.div>
                            ) : (
                              <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Enhanced Navigation Buttons */}
              <motion.div 
                className="flex justify-between items-center mb-4 sm:mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <motion.button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base px-3 sm:px-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Go to previous question"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </motion.button>

                <div className="flex gap-1 sm:gap-2" role="tablist" aria-label="Question progress indicators">
                  {diagnosticQuestions.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                        index === currentQuestionIndex 
                          ? 'bg-purple-600' 
                          : index < currentQuestionIndex 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3 + index * 0.02, duration: 0.2 }}
                      role="tab"
                      aria-selected={index === currentQuestionIndex}
                      aria-label={`Question ${index + 1} ${
                        index < currentQuestionIndex ? 'completed' : 
                        index === currentQuestionIndex ? 'current' : 'upcoming'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.id]}
                  className="btn-modern btn-primary flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base px-3 sm:px-4"
                  whileHover={{ 
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={currentQuestionIndex === diagnosticQuestions.length - 1 ? 'Finish assessment' : 'Go to next question'}
                >
                  {currentQuestionIndex === diagnosticQuestions.length - 1 ? (
                    <>
                      <Trophy className="w-4 h-4" />
                      <span className="hidden sm:inline">Finish</span>
                      <span className="sm:hidden">Done</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Skip Option */}
              <motion.div 
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                <motion.button
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 underline text-sm transition-colors duration-200 flex items-center gap-1 mx-auto focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded px-2 py-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Skip assessment for now
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.section>
      </motion.main>
    </>
  );
} 