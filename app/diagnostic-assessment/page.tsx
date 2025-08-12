'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
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
  totalQuestions?: number;
  n8nResults?: {
    'Total Questions'?: number;
    Score?: number;
    Summery?: string;
    [key: string]: any;
  };
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

interface CollectedAnswer {
  Q: string;
  section: string;
  question: string;
  studentAnswer: string;
  type: string;
}

export default function DiagnosticAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState<AssessmentQuestion | null>(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [collectedAnswers, setCollectedAnswers] = useState<CollectedAnswer[]>([]);
  const [allAnswers, setAllAnswers] = useState<{ [key: string]: string }>({});
  const [isResetting, setIsResetting] = useState(false);
  const [isFromInterestAssessment, setIsFromInterestAssessment] = useState(false);
  const router = useRouter();

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      console.log('🔍 Fetching user profile...');
      const response = await fetch('/api/user/profile');
      
      console.log('🔍 Profile response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch user profile';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse profile error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        console.error('Failed to fetch user profile:', errorMessage);
        return;
      }
      
      let data;
      try {
        data = await response.json();
        console.log('🔍 Profile data received:', data);
      } catch (parseError) {
        console.error('Failed to parse profile response as JSON:', parseError);
        return;
      }

      if (data.success && data.user) {
        setUserProfile(data.user);
        console.log('🔍 User profile set successfully');
      } else {
        console.error('Invalid profile response format:', data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Load current question
  const loadQuestion = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔍 Loading question...');
      const response = await fetch('/api/assessment/questions');
      
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        let errorMessage = 'Failed to load question';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
        console.log('🔍 Parsed response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        throw new Error('Invalid response format from server');
      }

      if (data.completed) {
        console.log('🔍 Assessment already completed');
        
        // Check if this is a premature completion (user hasn't actually taken the assessment)
        const hasActualAnswers = data.result && data.result.totalQuestions && data.result.totalQuestions > 0;
        
        if (!hasActualAnswers) {
          console.log('🔍 Detected premature completion - no actual questions answered');
          // User is coming from interest assessment, mark this
          setIsFromInterestAssessment(true);
          setIsCompleted(false);
          setResult(null);
          // Try to generate new questions
          await generateN8NQuestions();
          return;
        }
        
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

      if (!data.question) {
        throw new Error('No question data received from server');
      }

      console.log('🔍 Setting question data:', {
        id: data.question.id,
        question: data.question.question,
        type: data.question.type,
        section: data.question.section,
        options: data.question.options,
        currentQuestion: data.currentQuestion,
        totalQuestions: data.totalQuestions,
        progress: data.progress
      });
      
      // Debug: Show the actual API response type
      console.log('🔍 API response question type:', data.question.type);

      // Map question types to standardized format
      let mappedType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
      if (data.question.type === 'MCQ' || data.question.type === 'Single Choice') {
        mappedType = 'SINGLE_CHOICE';
      } else if (data.question.type === 'OPEN' || data.question.type === 'Multiple Choice') {
        mappedType = 'MULTIPLE_CHOICE';
      } else {
        // Default to single choice if unknown type
        mappedType = 'SINGLE_CHOICE';
      }
      
      const mappedQuestion = {
        ...data.question,
        type: mappedType
      };
      
      console.log('🔍 Mapped question type from', data.question.type, 'to', mappedQuestion.type);
      
      setCurrentQuestion(mappedQuestion);
      setCurrentQuestionNumber(data.currentQuestion);
      setTotalQuestions(data.totalQuestions);
      setProgress(data.progress);
      
              // Load previous answer from collected answers (ignore skipped)
        const previousAnswer = collectedAnswers.find(answer => answer.Q === data.question.id);
        if (previousAnswer && previousAnswer.studentAnswer !== 'Skipped') {
          if (mappedQuestion.type === 'SINGLE_CHOICE') {
            setSelectedOption([previousAnswer.studentAnswer]);
            setAnswer('');
          } else if (mappedQuestion.type === 'MULTIPLE_CHOICE') {
            // For multiple choice, split by comma if stored as comma-separated string
            const options = previousAnswer.studentAnswer.includes(',') 
              ? previousAnswer.studentAnswer.split(',').map(s => s.trim())
              : [previousAnswer.studentAnswer];
            setSelectedOption(options);
            setAnswer('');
          } else {
            setAnswer(previousAnswer.studentAnswer);
            setSelectedOption([]);
          }
        } else {
          setAnswer('');
          setSelectedOption([]);
        }
    } catch (err) {
      console.error('Error loading question:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load question';
      setError(errorMessage);
      
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

  // Load previous answers from database
  const loadPreviousAnswers = async () => {
    try {
      console.log('🔍 Loading previous answers from database...');
      const response = await fetch('/api/assessment/questions');
      
      if (!response.ok) {
        console.error('Failed to load previous answers');
        return;
      }

      const data = await response.json();
      
      if (data.responses && Array.isArray(data.responses)) {
        const answers: CollectedAnswer[] = data.responses.map((response: any) => ({
          Q: response.questionId,
          section: response.category,
          question: response.question,
          studentAnswer: response.answer,
          type: response.questionType === 'SINGLE_CHOICE' ? 'Single Choice' : 
                response.questionType === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Unknown'
        }));
        
        setCollectedAnswers(answers);
        console.log('🔍 Loaded previous answers:', answers.length);
      }
    } catch (error) {
      console.error('Error loading previous answers:', error);
    }
  };

  // Generate N8N questions if not already generated
  const generateN8NQuestions = async () => {
    try {
      console.log('🔍 Generating N8N questions...');
      const response = await fetch('/api/assessment/generate-questions?type=diagnostic');
      
      if (!response.ok) {
        console.error('Failed to generate N8N questions');
        return false;
      }

      const data = await response.json();
      console.log('🔍 N8N questions generated:', data);
      
      if (data.success && data.questions && data.questions.length > 0) {
        console.log('🔍 Successfully generated', data.questions.length, 'N8N questions');
        return true;
      } else {
        console.log('🔍 No N8N questions generated, using fallback');
        return false;
      }
    } catch (error) {
      console.error('Error generating N8N questions:', error);
      return false;
    }
  };

  // Go to previous question
  const goToPreviousQuestion = async () => {
    if (currentQuestionNumber <= 1) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Save current answer if any
      if (currentQuestion) {
        let currentAnswer: string;
        if (currentQuestion.type === 'SINGLE_CHOICE') {
          currentAnswer = selectedOption.length > 0 ? selectedOption[0] : '';
        } else if (currentQuestion.type === 'MULTIPLE_CHOICE') {
          currentAnswer = selectedOption.join(', ');
        } else {
          currentAnswer = answer;
        }
        
        if (currentAnswer.trim()) {
          setAllAnswers(prev => ({
            ...prev,
            [currentQuestion.id]: currentAnswer
          }));
        }
      }

      // Load previous question
      const response = await fetch(`/api/assessment/questions?previous=true&currentQuestion=${currentQuestionNumber}`);
      
      if (!response.ok) {
        throw new Error('Failed to load previous question');
      }

      const data = await response.json();

      if (data.question) {
        // Map question types to standardized format
        let mappedType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
        if (data.question.type === 'MCQ' || data.question.type === 'Single Choice') {
          mappedType = 'SINGLE_CHOICE';
        } else if (data.question.type === 'OPEN' || data.question.type === 'Multiple Choice') {
          mappedType = 'MULTIPLE_CHOICE';
        } else {
          // Default to single choice if unknown type
          mappedType = 'SINGLE_CHOICE';
        }
        
        const mappedQuestion = {
          ...data.question,
          type: mappedType
        };
        
        console.log('🔍 Previous question - mapped type from', data.question.type, 'to', mappedType);
        
        setCurrentQuestion(mappedQuestion);
        setCurrentQuestionNumber(data.currentQuestion);
        setTotalQuestions(data.totalQuestions);
        setProgress(data.progress);
        
        // Load previous answer if exists
        const previousAnswer = allAnswers[data.question.id];
        if (previousAnswer) {
          if (mappedQuestion.type === 'SINGLE_CHOICE') {
            setSelectedOption([previousAnswer]);
            setAnswer('');
          } else if (mappedQuestion.type === 'MULTIPLE_CHOICE') {
            // For multiple choice, split by comma if stored as comma-separated string
            const options = previousAnswer.includes(',') 
              ? previousAnswer.split(',').map(s => s.trim())
              : [previousAnswer];
            setSelectedOption(options);
            setAnswer('');
          } else {
            setAnswer(previousAnswer);
            setSelectedOption([]);
          }
        } else {
          setAnswer('');
          setSelectedOption([]);
        }
      }
    } catch (err) {
      console.error('Error loading previous question:', err);
      setError(err instanceof Error ? err.message : 'Failed to load previous question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit answer and move to next question
  const submitAnswer = async () => {
    if (!currentQuestion) return;

    let answerToSubmit: string;
    if (currentQuestion.type === 'SINGLE_CHOICE') {
      answerToSubmit = selectedOption.length > 0 ? selectedOption[0] : '';
    } else if (currentQuestion.type === 'MULTIPLE_CHOICE') {
      answerToSubmit = selectedOption.join(', ');
    } else {
      answerToSubmit = answer;
    }
    
    if (!answerToSubmit.trim()) {
      setError('Please provide an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Collect the current answer
      const currentAnswer: CollectedAnswer = {
        Q: currentQuestion.id,
        section: currentQuestion.section || currentQuestion.category || 'General',
        question: currentQuestion.question,
        studentAnswer: answerToSubmit,
        type: currentQuestion.type === 'SINGLE_CHOICE' ? 'Single Choice' : 
              currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Unknown'
      };

      // Add to collected answers
      setCollectedAnswers(prev => [...prev, currentAnswer]);
      
      // Save to all answers for navigation
      setAllAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: answerToSubmit
      }));

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
        console.log('🔍 Assessment completed! Getting N8N results...');
        
        // Save all collected answers to database
        await storeAnswersInDatabase([...collectedAnswers, currentAnswer]);
        
        // Get N8N results
        try {
          const resultResponse = await fetch('/api/assessment/result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (resultResponse.ok) {
            let resultData;
            try {
              const responseText = await resultResponse.text();
              console.log('🔍 Raw result response text:', responseText);
              
              if (!responseText || responseText.trim() === '') {
                console.log('⚠️ Empty response from result API, using fallback');
                setIsCompleted(true);
                setResult(data.result);
                return;
              }
              
              resultData = JSON.parse(responseText);
              console.log('🔍 N8N results received:', resultData);
            } catch (parseError) {
              console.error('🔍 Failed to parse result response as JSON:', parseError);
              // Still show completion with default result
              setIsCompleted(true);
              setResult(data.result);
              return;
            }
            
            // Update the result with N8N data - Enhanced mapping for actual N8N structure
            const n8nData = resultData.output?.[0] || resultData.result || resultData;
            console.log('🔍 Raw N8N data structure:', n8nData);
            
            const updatedResult = {
              ...data.result,
              totalQuestions: parseInt(n8nData?.['Total Questions']) || n8nData?.totalQuestions || n8nData?.['total_questions'] || 0,
              score: parseInt(n8nData?.Score) || n8nData?.score || n8nData?.['score'] || 0,
              description: n8nData?.Summery || n8nData?.summary || n8nData?.['summary'] || n8nData?.['description'] || data.result.description,
              n8nResults: n8nData
            };
            
            console.log('🔍 Updated result with N8N data:', updatedResult);
            setIsCompleted(true);
            setResult(updatedResult);
          } else {
            console.error('🔍 Failed to get N8N results:', resultResponse.status);
            // Still show completion with default result
            setIsCompleted(true);
            setResult(data.result);
          }
        } catch (resultError) {
          console.error('🔍 Error getting N8N results:', resultError);
          // Still show completion with default result
          setIsCompleted(true);
          setResult(data.result);
        }
      } else {
        // Load next question
        await loadQuestion();
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setIsSubmitting(false);
    }
  };


  // Skip current question without providing an answer
  const skipQuestion = async () => {
    if (!currentQuestion) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Collect the skipped answer for analytics/N8N, but do not prefill on revisit
      const skippedAnswer: CollectedAnswer = {
        Q: currentQuestion.id,
        section: currentQuestion.section || currentQuestion.category || 'General',
        question: currentQuestion.question,
        studentAnswer: 'Skipped',
        type: currentQuestion.type === 'SINGLE_CHOICE' ? 'Single Choice' : 
              currentQuestion.type === 'MULTIPLE_CHOICE' ? 'Multiple Choice' : 'Unknown'
      };

      setCollectedAnswers(prev => [...prev, skippedAnswer]);

      // Build URL with query parameters using a sentinel value for skipped
      const params = new URLSearchParams({
        questionId: currentQuestion.id,
        answer: 'Skipped',
        questionNumber: currentQuestionNumber.toString()
      });

      const response = await fetch(`/api/assessment/questions?${params}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to skip question');
      }

      if (data.completed) {
        // Save all collected answers to database
        await storeAnswersInDatabase([...collectedAnswers, skippedAnswer]);

        // Get N8N results
        try {
          const resultResponse = await fetch('/api/assessment/result', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (resultResponse.ok) {
            let resultData;
            try {
              const responseText = await resultResponse.text();
              console.log('🔍 Raw result response text:', responseText);
              
              if (!responseText || responseText.trim() === '') {
                console.log('⚠️ Empty response from result API, using fallback');
                setIsCompleted(true);
                setResult(data.result);
                return;
              }
              
              resultData = JSON.parse(responseText);
              console.log('🔍 N8N results received:', resultData);
            } catch (parseError) {
              console.error('🔍 Failed to parse result response as JSON:', parseError);
              // Fallback to default result if N8N fails
              setIsCompleted(true);
              setResult(data.result);
              return;
            }
            
            const n8nData = resultData.output?.[0] || resultData.result || resultData;

            const updatedResult = {
              ...data.result,
              totalQuestions: parseInt(n8nData?.['Total Questions']) || n8nData?.totalQuestions || n8nData?.['total_questions'] || 0,
              score: parseInt(n8nData?.Score) || n8nData?.score || n8nData?.['score'] || 0,
              description: n8nData?.Summery || n8nData?.summary || n8nData?.['summary'] || n8nData?.['description'] || data.result?.description,
              n8nResults: n8nData
            } as AssessmentResult;

            setIsCompleted(true);
            setResult(updatedResult);
          } else {
            // Fallback to default result if N8N fails
            setIsCompleted(true);
            setResult(data.result);
          }
        } catch {
          setIsCompleted(true);
          setResult(data.result);
        }
      } else {
        // Load next question
        await loadQuestion();
      }
    } catch (err) {
      console.error('Error skipping question:', err);
      setError(err instanceof Error ? err.message : 'Failed to skip question');
    } finally {
      setIsSubmitting(false);
    }
  };



  // Function to store answers in database
  const storeAnswersInDatabase = async (answers: CollectedAnswer[]) => {
    try {
      console.log('🔍 Storing answers in database:', answers.length, 'answers');
      
      const response = await fetch('/api/assessment/store-answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        console.error('🔍 Failed to store answers in database:', response.status);
        const errorData = await response.json();
        console.error('🔍 Error details:', errorData);
      } else {
        console.log('🔍 Answers stored in database successfully');
      }
    } catch (error) {
      console.error('🔍 Error storing answers in database:', error);
    }
  };

  // Function to reset assessment and start fresh
  const resetAssessment = async () => {
    try {
      console.log('🔍 Resetting assessment...');
      setIsResetting(true);
      
      // Call the API to reset the assessment
      const response = await fetch('/api/assessment/diagnostic/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const resetData = await response.json();
        console.log('🔍 Assessment reset successfully:', resetData.message);
        
        // Reset all state variables
        setCurrentQuestion(null);
        setCurrentQuestionNumber(1);
        setTotalQuestions(0);
        setProgress(0);
        setAnswer('');
        setSelectedOption([]);
        setIsLoading(true);
        setIsSubmitting(false);
        setIsCompleted(false);
        setResult(null);
        setError('');
        setCollectedAnswers([]);
        setAllAnswers({});
        
        // Reload the first question
        await loadQuestion();
      } else {
        const errorData = await response.json();
        console.error('🔍 Failed to reset assessment:', errorData.error);
        // If reset fails, just reload the page as fallback
        window.location.reload();
      }
    } catch (error) {
      console.error('🔍 Error resetting assessment:', error);
      // If there's an error, reload the page as fallback
      window.location.reload();
    } finally {
      setIsResetting(false);
    }
  };

  // Load user profile and first question on component mount
  useEffect(() => {
    const initializeAssessment = async () => {
      try {
        console.log('🔍 Initializing diagnostic assessment...');
        
        // First check if user is authenticated by trying to fetch profile
        await fetchUserProfile();
        
        // Load previous answers from database
        await loadPreviousAnswers();
        
        // Try to generate N8N questions if not already generated
        await generateN8NQuestions();
        
        // If profile fetch succeeds, load the question
        await loadQuestion();
      } catch (error) {
        console.error('Failed to initialize assessment:', error);
        // If there's an authentication error, redirect to login
        if (error instanceof Error && error.message.includes('401')) {
          router.push('/login');
        }
      }
    };
    
    initializeAssessment();
  }, [router]);

  // Auto-reset assessment if user comes from interest assessment and sees completion screen
  useEffect(() => {
    if (isCompleted && result && result.type === 'Assessment Completed' && result.description.includes('already completed')) {
      console.log('🔍 Detected premature completion from interest assessment, showing manual reset option...');
      // Don't auto-reset, let user choose to start the assessment
      // The yellow notice box will guide them
    }
  }, [isCompleted, result]);

  // Welcome screen for users coming from interest assessment
  if (isFromInterestAssessment && !isCompleted) {
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

        {/* Welcome Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <motion.div 
            className="bg-white rounded-2xl p-8 text-center max-w-4xl mx-auto shadow-lg"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div className="text-6xl mb-6">🎯</div>
              <h1 className="text-4xl font-bold text-purple-600 mb-4">
                Welcome to Your Diagnostic Assessment!
              </h1>
              
              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                Great job completing your interest assessment! Now it&apos;s time to take your personalized diagnostic assessment. 
                This will help us understand your current knowledge and skills in your areas of interest.
              </p>

              <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-purple-700 mb-3">What to expect:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    Personalized questions based on your interests
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    Single choice and multiple choice questions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    AI-generated content tailored to your learning style
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    Detailed results and recommendations
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setIsFromInterestAssessment(false);
                  loadQuestion();
                }}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Diagnostic Assessment
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.main>
    );
  }

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

        {/* Special notice for users coming from interest assessment */}
        {result && result.type === 'Assessment Completed' && result.description.includes('already completed') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Welcome from Interest Assessment!
                </h3>
                <p className="text-yellow-700 mb-3">
                  It looks like you&apos;ve completed the interest assessment and are now ready for the diagnostic assessment. 
                  Click the button below to start your diagnostic assessment with N8N-generated questions.
                </p>
                <button
                  onClick={resetAssessment}
                  disabled={isResetting}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? 'Starting...' : 'Start Diagnostic Assessment'}
                </button>
              </div>
            </div>
          </div>
        )}

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
              
              {/* Student Info */}
              {userProfile && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Personalized Results for</h3>
                    <p className="text-xl font-bold text-blue-200">
                      {userProfile.fullName} #{userProfile.uniqueId}
                    </p>
                  </div>
                </div>
              )}
              
                             {/* Assessment Results Display - Enhanced N8N Data Alignment */}
               {result.n8nResults && (
                 <div className="space-y-6 mb-8">
                   {/* Score and Stats Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 text-center border border-blue-300/30">
                       <div className="text-4xl mb-2">📊</div>
                       <h3 className="text-lg font-semibold mb-2 text-blue-200">Total Questions</h3>
                       <p className="text-3xl font-bold text-blue-100">
                         {result.n8nResults?.['Total Questions'] || result.totalQuestions || 0}
                       </p>
                     </div>
                     
                     <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-6 text-center border border-yellow-300/30">
                       <div className="text-4xl mb-2">🏆</div>
                       <h3 className="text-lg font-semibold mb-2 text-yellow-200">Your Score</h3>
                       <p className="text-3xl font-bold text-yellow-100">
                         {result.n8nResults?.Score || result.score || 0}%
                       </p>
                     </div>
                     
                     <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 text-center border border-green-300/30">
                       <div className="text-4xl mb-2">⭐</div>
                       <h3 className="text-lg font-semibold mb-2 text-green-200">Performance</h3>
                       <p className="text-3xl font-bold text-green-100">
                         {(() => {
                           const scoreStr = String(result.n8nResults?.Score || result.score || 0);
                           const score = parseInt(scoreStr);
                           if (score >= 90) return 'Excellent';
                           if (score >= 80) return 'Great';
                           if (score >= 70) return 'Good';
                           if (score >= 60) return 'Fair';
                           return 'Needs Work';
                         })()}
                       </p>
                     </div>
                   </div>
                   
                   {/* Assessment Summary */}
                   <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-8 border border-purple-300/30">
                     <div className="text-center mb-6">
                       <h3 className="text-2xl font-bold text-purple-100 mb-2">🎯 Assessment Summary</h3>
                       <div className="w-24 h-1 bg-purple-300 mx-auto rounded-full"></div>
                     </div>
                     
                     <div className="bg-white/10 rounded-lg p-6 text-left">
                       <p className="text-lg leading-relaxed text-white/95 font-medium">
                         {result.n8nResults?.Summery || result.description || 'Assessment completed successfully.'}
                       </p>
                     </div>
                   </div>
                   
                   {/* Debug: Show raw N8N data */}
                   <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-sm rounded-xl p-6 border border-gray-300/30">
                     <h3 className="text-xl font-bold text-gray-100 mb-4 text-center">🔧 Debug: N8N Data Structure</h3>
                     <div className="bg-white/10 rounded-lg p-4">
                       <pre className="text-sm text-gray-100/90 overflow-x-auto">
                         {JSON.stringify(result.n8nResults, null, 2)}
                       </pre>
                               </div>
                           </div>
                 </div>
               )}
              

              
              {/* Fallback description if no N8N results */}
              {!result.n8nResults && (
                <p className="text-xl mb-8 opacity-90">
                  {result.description}
                </p>
              )}
              

            </motion.div>

                         <motion.div 
               className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.6, duration: 0.5 }}
             >
                               <button 
                  onClick={resetAssessment}
                  disabled={isResetting}
                  className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:from-blue-500/30 hover:to-blue-600/30 transition-all duration-300 flex items-center gap-3 border border-blue-300/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">🔄</span>
                      <span>Take Assessment Again</span>
                    </>
                  )}
                </button>
               <button
                 onClick={() => router.push('/dashboard/student')}
                 className="bg-gradient-to-r from-white to-gray-100 text-purple-600 px-8 py-4 rounded-full font-semibold hover:from-gray-100 hover:to-gray-200 transition-all duration-300 flex items-center gap-3 shadow-lg"
               >
                 <span className="text-2xl">🏠</span>
                 <span>Go to Dashboard</span>
               </button>
               <button
                 onClick={() => router.push('/recommended-modules')}
                 className="bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold hover:from-green-500/30 hover:to-green-600/30 transition-all duration-300 flex items-center gap-3 border border-green-300/30"
               >
                 <span className="text-2xl">📚</span>
                 <span>Start Learning</span>
               </button>
             </motion.div>






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
            
            {/* Show additional error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-red-800 mb-2">Debug Information:</h3>
                <p className="text-sm text-red-700 mb-2">Error: {error}</p>
                <p className="text-sm text-red-700">Check browser console for more details.</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setError('');
                  loadQuestion();
                }} 
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/login')} 
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question screen (only if not completed)
  if (!isCompleted) {
  return (
    <motion.main 
      className="min-h-screen bg-white flex flex-col"
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
      <div className="bg-white px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Progress Steps Container */}
          <div className="relative">
            {/* Connecting Lines */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 z-0"></div>
            
            {/* Progress Steps */}
            <div className="relative flex items-start justify-between w-full z-10 px-4">
              {Array.from({ length: Math.min(totalQuestions, 10) }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentQuestionNumber;
                const isCurrent = stepNumber === currentQuestionNumber;
                const isPending = stepNumber > currentQuestionNumber;
                
                return (
                  <div key={stepNumber} className="flex flex-col items-center relative flex-1 max-w-32">
                    {/* Step Circle */}
                    <div className="relative mb-6">
                      {isCompleted ? (
                        // Completed step
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg border-2 border-purple-700">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
          </div>
                      ) : isCurrent ? (
                        // Current step
                        <div className="relative">
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-xl border-2 border-purple-700">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
            </div>
                          <div className="absolute -inset-3 bg-purple-100 rounded-full -z-10 animate-pulse"></div>
                        </div>
                      ) : stepNumber === totalQuestions ? (
                        // Final step with grid icon
                        <div className="w-10 h-10 border-3 border-gray-400 rounded-full flex items-center justify-center bg-white shadow-sm">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                        </div>
                      ) : (
                        // Pending step with lock icon
                        <div className="w-10 h-10 border-3 border-gray-400 rounded-full flex items-center justify-center bg-white shadow-sm">
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="text-center w-full">
                      <div className="text-xs text-gray-500 font-normal mb-2 leading-tight">
                        {stepNumber === totalQuestions ? 'Final Question' : `Question ${stepNumber} of ${totalQuestions}`}
                      </div>
                      <div className={`inline-block px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-sm ${
                        isCompleted 
                          ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-300' 
                          : isCurrent 
                            ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-300 shadow-md' 
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Progress Percentage */}
          <div className="flex justify-center mt-8 pt-4 border-t border-gray-100">
            <div className="bg-purple-50 px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-purple-700">{progress}% Complete</span>
            </div>
          </div>
          </div>
          </div>

      {/* Question Content */}
      <div className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Debug: Show current question state */}
          {currentQuestion && (
            <div className="mb-4 p-4 bg-gray-100 rounded-lg text-sm">
              <strong>Debug:</strong> Question Type: {currentQuestion.type}, 
              Has Options: {currentQuestion.options ? 'Yes' : 'No'}, 
              Options Count: {currentQuestion.options?.length || 0}
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {currentQuestion ? (
            <motion.div 
              key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  {/* Question Identifier */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-white text-2xl font-bold">
                        {currentQuestionNumber.toString().padStart(2, '0')}
                    </span>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      Level - {currentQuestion.difficulty}
                    </span>
                  </div>
                  
                  {/* Question Display */}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                  </div>
                </div>

                                {/* Single Choice Options */}
                {currentQuestion.type === 'SINGLE_CHOICE' && currentQuestion.options && (
                  <div className="mb-8">
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D...
                        const isSelected = selectedOption.includes(option);
                        
                        return (
                          <label
                            key={index}
                            className={`block cursor-pointer transition-all duration-200 ${
                              isSelected ? 'transform scale-105' : 'hover:scale-102'
                            }`}
                          >
                            <input
                              type="radio"
                              name="single-choice-option"
                              value={option}
                              checked={isSelected}
                              onChange={(e) => setSelectedOption([e.target.value])}
                              className="sr-only"
                            />
                            <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-purple-500 shadow-lg shadow-purple-100' 
                                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                            }`}>
                              <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isSelected 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {letter}
                                </div>
                                <span className="text-gray-800 font-medium text-lg leading-relaxed flex-1">
                                  {option}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Multiple Choice Options */}
                {currentQuestion.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
                  <div className="mb-8">
                    <div className="space-y-4">
                      {currentQuestion.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D...
                        const isSelected = selectedOption.includes(option);
                        
                        return (
                          <label
                            key={index}
                            className={`block cursor-pointer transition-all duration-200 ${
                              isSelected ? 'transform scale-105' : 'hover:scale-102'
                            }`}
                          >
                            <input
                              type="checkbox"
                              name="multiple-choice-option"
                              value={option}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOption([...selectedOption, option]);
                                } else {
                                  setSelectedOption(selectedOption.filter(item => item !== option));
                                }
                              }}
                              className="sr-only"
                            />
                            <div className={`bg-white rounded-xl p-6 border-2 transition-all duration-200 ${
                              isSelected 
                                ? 'border-purple-500 shadow-lg shadow-purple-100' 
                                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                            }`}>
                              <div className="flex items-start gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  isSelected 
                                    ? 'bg-purple-500 text-white' 
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  {letter}
                                </div>
                                <span className="text-gray-800 font-medium text-lg leading-relaxed flex-1">
                                  {option}
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
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

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4">
                  {/* Previous Button */}
                  <button
                    onClick={goToPreviousQuestion}
                    disabled={isSubmitting || currentQuestionNumber <= 1}
                    className="bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        ← Previous Question
                      </>
                    )}
                  </button>

                  {/* Skip Button */}
                  <button
                    onClick={skipQuestion}
                    disabled={isSubmitting}
                    className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Skipping...
                      </>
                    ) : (
                      'Skip →'
                    )}
                  </button>

                  {/* Next/Complete Button */}
                  <button
                    onClick={submitAnswer}
                    disabled={isSubmitting || (
                      (currentQuestion.type === 'SINGLE_CHOICE' && selectedOption.length === 0) ||
                      (currentQuestion.type === 'MULTIPLE_CHOICE' && selectedOption.length === 0)
                    )}
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
              <div className="text-center">
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