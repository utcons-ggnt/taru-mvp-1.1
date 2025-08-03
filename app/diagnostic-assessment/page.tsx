'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'OPEN';
  options?: string[];
  category?: string;
  section?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface AssessmentResult {
  type: string;
  description: string;
  score: number;
  learningStyle?: string;
  recommendations?: { title: string; description: string; xp: number }[];
}

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  uniqueId?: string;
  avatar?: string;
  age?: number;
  classGrade?: string;
}

export default function DiagnosticAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setUserProfile(data.user);
      } else {
        console.error('Failed to fetch user profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Load current question
  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/assessment/questions');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load question');
      }

      if (data.completed) {
        setIsCompleted(true);
        setResult(data.result || {
          type: 'Assessment Completed',
          description: 'You have already completed the diagnostic assessment.',
          score: 0,
          learningStyle: 'Not Available',
          recommendations: []
        });
        return;
      }

      setCurrentQuestion(data.question);
      setCurrentQuestionNumber(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);
      setProgress(data.progress);
      setAnswer('');
      setSelectedOption('');
    } catch (err) {
      console.error('Error loading question:', err);
      setError(err instanceof Error ? err.message : 'Failed to load question');
      
      // If there's an error, check if it's because assessment is completed
      if (err instanceof Error && err.message.includes('completed')) {
        setIsCompleted(true);
        setResult({
          type: 'Assessment Completed',
          description: 'You have already completed the diagnostic assessment.',
          score: 0,
          learningStyle: 'Not Available',
          recommendations: []
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!currentQuestion) return;

    const answerToSubmit = currentQuestion.type === 'MCQ' ? selectedOption : answer;
    if (!answerToSubmit.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      console.log('🔍 Submitting answer:', {
        questionId: currentQuestion.id,
        answer: answerToSubmit,
        questionNumber: currentQuestionNumber,
        questionType: currentQuestion.type
      });

      // Build URL with query parameters
      const params = new URLSearchParams({
        questionId: currentQuestion.id,
        answer: answerToSubmit,
        questionNumber: currentQuestionNumber.toString()
      });

      const response = await fetch(`/api/assessment/questions?${params}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      if (data.completed) {
        setIsCompleted(true);
        setResult(data.result);
        // Redirect to student dashboard after assessment completion
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 2000); // 2 second delay to show completion message
      } else {
        // Load next question
        loadQuestion();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Load user profile and first question on component mount
  useEffect(() => {
    fetchUserProfile();
    loadQuestion();
  }, []);

  // Completion screen
  if (isCompleted && result) {
    return (
      <motion.main 
        className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/jio-logo.png" alt="Jio Logo" width={40} height={40} className="rounded-full" />
            <span className="font-semibold text-gray-800">JioWorld Learning</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-gray-600">
              {userProfile ? `${userProfile.fullName} ${userProfile.uniqueId ? `#${userProfile.uniqueId}` : ''}` : 'Loading...'}
            </span>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {userProfile ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
        </div>
        </header>

        {/* Progress Steps */}
        <div className="bg-white px-6 py-4">
          <div className="flex justify-center items-center gap-4 max-w-4xl mx-auto">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    Step {i + 1} of 6
                  </div>
                  <div className="text-xs text-green-600">Completed</div>
                </div>
                {i < 5 && <div className="w-16 h-0.5 bg-green-500 mx-2"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Result Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div 
            className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white text-center max-w-4xl mx-auto relative overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold mb-4">
                🎭 You&apos;re a {result.type}! 🏆
              </h1>
              <p className="text-xl mb-8 opacity-90">
                {result.description}
              </p>
            </motion.div>

            <motion.div 
              className="flex justify-center gap-4 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <button className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors flex items-center gap-2">
                😊 Try Again with Me!
                </button>
                <button
                onClick={() => router.push('/dashboard/student')}
                className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </button>
            </motion.div>

            {/* Redirect Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="text-center mb-4"
            >
              <p className="text-white/80 text-sm">
                Redirecting to your dashboard in 2 seconds...
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Magical Suggestions!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold mb-2">The Water Cycle</h3>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">75+ XP</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Shapes Adventure</h3>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">50+ XP</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold mb-2">Story of the Moon</h3>
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm">30+ XP</span>
                </div>
            </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-4xl">⭐</div>
            <div className="absolute bottom-4 left-4 text-2xl">✨</div>
            <div className="absolute top-1/2 right-8 text-3xl">☁️</div>
          </motion.div>
        </div>
      </motion.main>
    );
  }

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your diagnostic assessment...</p>
        </div>
          </div>
    );
  }



  // Error screen
  if (error && !isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          <button
              onClick={() => {
                setError('');
                loadQuestion();
              }} 
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
              Try Again
          </button>
          </div>
        </div>
      </div>
    );
  }

  // Question screen (only if not completed)
  if (!isCompleted) {
  return (
    <motion.main 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/jio-logo.png" alt="Jio Logo" width={40} height={40} className="rounded-full" />
          <span className="font-semibold text-gray-800">JioWorld Learning</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600">
            {userProfile ? `${userProfile.fullName} ${userProfile.uniqueId ? `#${userProfile.uniqueId}` : ''}` : 'Loading...'}
          </span>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userProfile ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
        </div>
      </header>

          {/* Progress Bar */}
      <div className="bg-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Question {currentQuestionNumber} of {totalQuestions}</span>
            <span className="text-sm font-medium text-purple-600">{progress}% Complete</span>
          </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          </div>

      {/* Question Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
            <motion.div 
              key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
                      {currentQuestion.section || currentQuestion.category}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      {currentQuestion.difficulty}
                    </span>
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {currentQuestion.type}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {currentQuestion.question}
              </h2>
                </div>

                {/* MCQ Options */}
                {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                  <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                      <label
                    key={index}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          selectedOption === option
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mcq-option"
                          value={option}
                          checked={selectedOption === option}
                          onChange={(e) => setSelectedOption(e.target.value)}
                          className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                        />
                        <span className="ml-3 text-gray-800">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Open Question */}
                {currentQuestion.type === 'OPEN' && (
                  <div className="mb-6">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none resize-none"
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4"
                  >
                    {error}
            </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
            <button
                    onClick={submitAnswer}
                    disabled={isSubmitting || (!selectedOption && !answer.trim())}
                    className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Submitting...
                      </>
                    ) : currentQuestionNumber === totalQuestions ? (
                      'Complete Assessment'
                    ) : (
                      'Next Question →'
                    )}
            </button>
          </div>
                    </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <p className="text-gray-600">No question available. Please try refreshing the page.</p>
            <button
                  onClick={() => loadQuestion()} 
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
            >
                  Retry
            </button>
          </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.main>
  );
  }

  // If we reach here, something went wrong
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unexpected State</h2>
          <p className="text-gray-600 mb-6">Something went wrong. Please try refreshing the page.</p>
            <button
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
            >
            Refresh Page
            </button>
          </div>
      </div>
    </div>
  );
} 