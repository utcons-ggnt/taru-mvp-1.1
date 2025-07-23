'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, Star, Brain, Trophy, Target } from 'lucide-react';

interface DiagnosticQuestion {
  id: string;
  section: string;
  prompt: string;
  inputType: 'open_text' | 'multiple_choice' | 'pattern_choice' | 'fill_blanks' | 'image_text' | 'scenario_steps';
  options?: string[];
  category: string;
  points: number;
  timeLimit?: number;
}

interface StudentInfo {
  grade: string;
  level: string;
  totalQuestions: number;
  estimatedTime: number;
}

interface AssessmentResults {
  overallScore: number;
  learningStyle: string;
  sectionScores: Record<string, number>;
  recommendations: string[];
  level: string;
  detailedAnalysis: {
    strengths: string[];
    areasForImprovement: string[];
    timeEfficiency: string;
  };
}

export default function DiagnosticTestTab() {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load questions on component mount
  useEffect(() => {
    loadDiagnosticQuestions();
  }, []);



  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(questions[nextIndex]?.timeLimit || 120);
    } else {
      completeTest();
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStarted && !testCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextQuestion(); // Auto-advance when time runs out
            return 0;
          }
          return prev - 1;
        });
        setTotalTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, testCompleted, timeRemaining, handleNextQuestion]);

  const loadDiagnosticQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessment/diagnostic');
      if (!response.ok) {
        throw new Error('Failed to load diagnostic questions');
      }
      const data = await response.json();
      
      setQuestions(data.questions);
      setStudentInfo(data.studentInfo);
      
      // Check if assessment already completed
      if (data.existingAssessment?.completed) {
        setTestCompleted(true);
        if (data.existingAssessment.results) {
          setResults(data.existingAssessment.results);
        }
      }
    } catch (err) {
      setError('Failed to load diagnostic test. Please try again.');
      console.error('Load questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    setTestStarted(true);
    setCurrentQuestionIndex(0);
    if (questions[0]?.timeLimit) {
      setTimeRemaining(questions[0].timeLimit);
    }
  };

  const handleAnswerChange = (value: string | number | string[]) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setTimeRemaining(questions[prevIndex]?.timeLimit || 120);
    }
  };

  const completeTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assessment/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers,
          timeSpent: totalTimeSpent,
          completed: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit diagnostic test');
      }

      const data = await response.json();
      setResults(data.results);
      setTestCompleted(true);
      setTestStarted(false);
    } catch (err) {
      setError('Failed to submit test. Please try again.');
      console.error('Submit test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = (question: DiagnosticQuestion) => {
    const currentAnswer = answers[question.id] || '';

    switch (question.inputType) {
      case 'multiple_choice':
      case 'pattern_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={currentAnswer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  className="text-blue-600"
                />
                <span className="text-gray-800">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'open_text':
        return (
          <textarea
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            maxLength={500}
          />
        );

      case 'fill_blanks':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">Fill in the missing values:</p>
            <input
              type="text"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Enter your answers separated by commas"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
          </div>
        );

      case 'image_text':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">You can draw, sketch, or describe your answer:</p>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Describe or sketch your idea here..."
              className="w-full h-40 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={1000}
            />
          </div>
        );

      case 'scenario_steps':
        return (
          <div className="space-y-4">
            <p className="text-gray-600">List the steps you would take (separate each step with a comma):</p>
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Step 1: ..., Step 2: ..., Step 3: ..."
              className="w-full h-32 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={800}
            />
          </div>
        );

      default:
        return (
          <input
            type="text"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadDiagnosticQuestions}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Results view
  if (testCompleted && results) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Diagnostic Assessment Complete!</h2>
              <p className="text-green-100">Overall Score: {results.overallScore}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Learning Style */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Learning Style</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">{results.learningStyle}</p>
            <p className="text-gray-600 mt-2">Your preferred way of learning</p>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold">Top Strengths</h3>
            </div>
            <ul className="space-y-2">
              {results.detailedAnalysis.strengths.map((strength, index) => (
                <li key={index} className="text-green-600 font-medium">• {strength}</li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Growth Areas</h3>
            </div>
            <ul className="space-y-2">
              {results.detailedAnalysis.areasForImprovement.map((area, index) => (
                <li key={index} className="text-blue-600 font-medium">• {area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section Scores */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Scores by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(results.sectionScores).map(([category, score]) => (
              <div key={category} className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 font-bold">{score}</span>
                </div>
                <p className="text-sm font-medium text-gray-700">{category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Learning Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-gray-700">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retake Assessment
          </button>
        </div>
      </div>
    );
  }

  // Pre-test info
  if (!testStarted) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Brain className="w-10 h-10 text-blue-600" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {studentInfo?.level} Level Diagnostic Assessment
            </h2>
            <p className="text-gray-600">
              Grade {studentInfo?.grade} • {studentInfo?.totalQuestions} Questions
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-blue-900">What to Expect:</h3>
            <ul className="text-left space-y-2 text-blue-800">
              <li>• Questions adapted to your grade level</li>
              <li>• Multiple question types: multiple choice, short answers, creative tasks</li>
              <li>• Estimated time: {Math.round((studentInfo?.estimatedTime || 0) / 60)} minutes</li>
              <li>• Each question has a time limit</li>
              <li>• Your answers help us understand your learning style</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={startTest}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Start Diagnostic Test
            </button>
            <p className="text-sm text-gray-500">
              Make sure you have a quiet environment and stable internet connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Test in progress
  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeRemaining)}</span>
            </div>
            <span className="text-sm font-medium text-blue-600">
              {getProgressPercentage()}% Complete
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
              {currentQuestion.section}
            </span>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
              {currentQuestion.category}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            {currentQuestion.prompt}
          </h3>
        </div>

        {renderQuestionInput(currentQuestion)}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              Points: {currentQuestion.points}
            </p>
          </div>

          <button
            onClick={handleNextQuestion}
            disabled={!answers[currentQuestion.id]}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Complete Test' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 