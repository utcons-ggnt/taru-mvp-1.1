'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  category: string;
  points: number;
  timeLimit: number;
  type: string;
}

interface AssessmentResults {
  score: number;
  percentage: number;
  totalQuestions: number;
  answeredQuestions: number;
  timeSpent: number;
}

interface ValidationResults {
  alignment: string;
  recommendation: string;
  confidence: number;
  feedback: string;
  suggestions: string[];
  learningPathReady: boolean;
}

export default function DiagnosticAssessment() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [retakeCount, setRetakeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Load dynamic questions on component mount
  useEffect(() => {
    loadQuestions();
  }, [retakeCount]);

  const loadQuestions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/assessment/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ retakeCount })
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setAnswers({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load questions');
      }
    } catch (error) {
      console.error('Error loading questions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerId
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      validateAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const validateAssessment = async () => {
    // setIsSubmitting(true);
    
    try {
      // First, validate the assessment results
      const validationResponse = await fetch('/api/assessment/validate-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          questions,
          timeSpent: 0 // TODO: Add time tracking
        })
      });

      if (validationResponse.ok) {
        const validationData = await validationResponse.json();
        setValidationResults(validationData.validation);
        setAssessmentResults(validationData.results);

        // If learning path is ready, generate it
        if (validationData.validation.learningPathReady) {
          await generateLearningPath(validationData.results, validationData.validation);
        }

        setShowResults(true);
      } else {
        throw new Error('Failed to validate assessment');
      }
    } catch (error) {
      console.error('Assessment validation error:', error);
      setError('Failed to validate assessment results');
    } finally {
      // setIsSubmitting(false);
    }
  };

  const generateLearningPath = async (results: AssessmentResults, validation: ValidationResults) => {
    try {
      const response = await fetch('/api/learning-paths/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          assessmentResults: results,
          validationResults: validation
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Learning path generated:', data);
        // Store learning path data for later use
        localStorage.setItem('generatedLearningPath', JSON.stringify(data.learningPath));
      }
    } catch (error) {
      console.error('Learning path generation error:', error);
    }
  };

  const handleRetake = () => {
    setRetakeCount(prev => prev + 1);
    setShowResults(false);
    setAssessmentResults(null);
    setValidationResults(null);
  };

  const handleModifyProfile = () => {
    router.push('/skill-assessment');
  };

  const handleProceedToLearningPath = () => {
    router.push('/curriculum-path');
  };

  const handleSkip = () => {
    router.push('/dashboard/student');
  };

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Generating Your Assessment</h2>
          <p className="text-gray-600">Creating personalized questions based on your skills and interests...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="min-h-screen bg-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Assessment</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadQuestions}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (showResults && assessmentResults && validationResults) {
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
                {validationResults.feedback}
              </p>
            </div>

            {/* Assessment Score */}
            <div className="bg-gradient-to-r from-[#6D18CE] to-purple-600 text-white rounded-xl p-6 mb-6 text-center">
              <div className="text-4xl font-bold mb-2">{assessmentResults.percentage}%</div>
              <div className="text-lg font-semibold">
                {assessmentResults.percentage >= 80 ? 'Excellent' : 
                 assessmentResults.percentage >= 60 ? 'Good' : 'Needs Improvement'}
              </div>
            </div>

            {/* Validation Results */}
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Alignment</span>
                <span className={`font-bold ${
                  validationResults.alignment === 'high' ? 'text-green-600' :
                  validationResults.alignment === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {validationResults.alignment.charAt(0).toUpperCase() + validationResults.alignment.slice(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Confidence</span>
                <span className="text-[#6D18CE] font-bold">
                  {Math.round(validationResults.confidence * 100)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Questions Answered</span>
                <span className="text-[#6D18CE] font-bold">
                  {assessmentResults.answeredQuestions}/{assessmentResults.totalQuestions}
                </span>
              </div>
            </div>

            {/* Recommendations */}
            {validationResults.suggestions.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">Suggestions</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {validationResults.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {validationResults.recommendation === 'retake' && (
                <button
                  onClick={handleRetake}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Retake Assessment
                </button>
              )}

              {validationResults.recommendation === 'modify' && (
                <button
                  onClick={handleModifyProfile}
                  className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                >
                  Modify Skills & Interests
                </button>
              )}

              {validationResults.learningPathReady && (
                <button
                  onClick={handleProceedToLearningPath}
                  className="w-full bg-[#6D18CE] text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Proceed to Learning Path
                </button>
              )}

              <button
                onClick={handleSkip}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div 
        className="min-h-screen bg-white flex items-center justify-center px-4 py-6 md:px-8 md:py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600 mb-4">Please complete your skills and interests assessment first.</p>
          <button
            onClick={() => router.push('/skill-assessment')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Go to Skills Assessment
          </button>
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
              Personalized Assessment
            </h1>
            <p className="text-gray-500 text-sm md:text-base">
              Question {currentQuestionIndex + 1} of {questions.length}
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
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className={`w-full border border-gray-300 rounded-xl p-4 text-left cursor-pointer transition-all duration-200 ${
                      answers[currentQuestion.id] === option
                        ? 'bg-[#6D18CE] text-white border-[#6D18CE]'
                        : 'hover:shadow-md hover:border-[#6D18CE]'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
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
              {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Continue'}
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