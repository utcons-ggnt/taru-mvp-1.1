import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'MCQ' | 'OPEN';
  options?: string[];
  correctAnswer?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Function to convert n8n question format to our internal format
function convertN8nQuestion(n8nQuestion: any): AssessmentQuestion {
  const questionType = n8nQuestion.type;
  let type: 'MCQ' | 'OPEN' = 'OPEN';
  let options: string[] | undefined = undefined;

  // Map n8n question types to our format
  if (questionType === 'Multiple Choice' || questionType === 'Pattern Choice') {
    type = 'MCQ';
    // For MCQ questions, we'll need to generate options or get them from n8n
    if (questionType === 'Pattern Choice') {
      options = ['Option A', 'Option B', 'Option C', 'Option D'];
    } else {
      options = ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'];
    }
  }

  return {
    id: n8nQuestion.Q.toString(), // Ensure ID is always a string
    question: n8nQuestion.question,
    type: type,
    options: options,
    category: n8nQuestion.section || 'General',
    difficulty: n8nQuestion.level?.toLowerCase() === 'middle' ? 'medium' : 'easy'
  };
}

// Fallback questions if n8n hasn't generated questions yet
const fallbackQuestions: AssessmentQuestion[] = [
  {
    id: '1',
    question: 'What is the capital of France?',
    type: 'MCQ',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    category: 'Geography',
    difficulty: 'easy'
  },
  {
    id: '2',
    question: 'Explain the water cycle in your own words.',
    type: 'OPEN',
    category: 'Science',
    difficulty: 'medium'
  },
  {
    id: '3',
    question: 'What is 2 + 2?',
    type: 'MCQ',
    options: ['3', '4', '5', '6'],
    correctAnswer: '4',
    category: 'Mathematics',
    difficulty: 'easy'
  },
  {
    id: '4',
    question: 'Describe your favorite hobby and why you enjoy it.',
    type: 'OPEN',
    category: 'Personal',
    difficulty: 'easy'
  },
  {
    id: '5',
    question: 'Which of these is a renewable energy source?',
    type: 'MCQ',
    options: ['Coal', 'Oil', 'Solar', 'Natural Gas'],
    correctAnswer: 'Solar',
    category: 'Environmental Science',
    difficulty: 'medium'
  },
  {
    id: '6',
    question: 'How do you prefer to learn new concepts?',
    type: 'MCQ',
    options: ['Reading and writing', 'Visual diagrams and charts', 'Hands-on practice', 'Listening to explanations'],
    correctAnswer: 'Visual diagrams and charts',
    category: 'Learning Style',
    difficulty: 'easy'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if this is a submission request (has questionId parameter)
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');
    const answer = searchParams.get('answer');
    const questionNumber = parseInt(searchParams.get('questionNumber') || '0');

    // If parameters are provided, handle as submission
    if (questionId && answer !== null) {
      return await handleAnswerSubmission(decoded, questionId, answer, questionNumber);
    }

    // Otherwise, handle as question fetch request

    // Verify student exists and onboarding is completed
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or onboarding not completed' },
        { status: 404 }
      );
    }

    // Get or create assessment response to check for generated questions
    const assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic'
    });

    // Get questions from n8n or use fallback
    let questions: AssessmentQuestion[] = fallbackQuestions;
    if (assessmentResponse && assessmentResponse.generatedQuestions && assessmentResponse.generatedQuestions.length > 0) {
      questions = assessmentResponse.generatedQuestions.map((q: any) => convertN8nQuestion(q));
      console.log('🔍 Using n8n generated questions for student:', student.uniqueId);
      console.log('🔍 Number of n8n questions:', questions.length);
    } else {
      console.log('🔍 Using fallback questions for student:', student.uniqueId);
      console.log('🔍 Number of fallback questions:', questions.length);
    }

    // Create assessment response if it doesn't exist
    let mutableAssessmentResponse = assessmentResponse;
    if (!mutableAssessmentResponse) {
      mutableAssessmentResponse = new AssessmentResponse({
        uniqueId: student.uniqueId,
        assessmentType: 'diagnostic',
        responses: [],
        webhookTriggered: false,
        generatedQuestions: []
      });
      await mutableAssessmentResponse.save();
      console.log('🔍 Created new assessment response for student:', student.uniqueId);
    }

    // Get current question number from existing responses
    const currentQuestionNumber = mutableAssessmentResponse.responses.length;
    const totalQuestions = questions.length;

    console.log('🔍 Assessment state:', {
      currentQuestionNumber,
      totalQuestions,
      responsesCount: mutableAssessmentResponse.responses.length,
      hasGeneratedQuestions: !!mutableAssessmentResponse.generatedQuestions?.length,
      questionsUsed: questions.length > 0 ? 'fallback' : 'none'
    });

    // Check if assessment is explicitly marked as completed
    if (mutableAssessmentResponse.isCompleted) {
      // Assessment already completed
      console.log('🔍 Assessment marked as completed', {
        isCompleted: mutableAssessmentResponse.isCompleted,
        currentQuestionNumber,
        totalQuestions
      });
      return NextResponse.json({
        success: true,
        message: 'Assessment already completed',
        completed: true,
        result: mutableAssessmentResponse.result
      });
    }

    // Check if all questions have been answered
    if (currentQuestionNumber >= totalQuestions) {
      console.log('🔍 All questions answered, marking assessment as completed', {
        currentQuestionNumber,
        totalQuestions
      });
      
      // Mark assessment as completed
      mutableAssessmentResponse.isCompleted = true;
      mutableAssessmentResponse.completedAt = new Date();
      
      // Generate result based on responses
      const mcqResponses = mutableAssessmentResponse.responses.filter((r: any) => r.questionType === 'MCQ');
      const correctAnswers = mcqResponses.filter((r: any) => r.isCorrect).length;
      const score = mcqResponses.length > 0 ? Math.round((correctAnswers / mcqResponses.length) * 100) : 85;
      
      mutableAssessmentResponse.result = {
        type: 'Assessment Completed',
        description: 'You have completed the diagnostic assessment successfully!',
        score: score,
        learningStyle: 'Mixed',
        recommendations: [
          { title: 'Continue Learning', description: 'Keep exploring your interests', xp: 50 },
          { title: 'Practice Regularly', description: 'Consistent practice leads to improvement', xp: 75 },
          { title: 'Seek Help When Needed', description: 'Don\'t hesitate to ask questions', xp: 30 }
        ]
      };
      
      await mutableAssessmentResponse.save();
      
      return NextResponse.json({
        success: true,
        message: 'Assessment completed',
        completed: true,
        result: mutableAssessmentResponse.result
      });
    }

    const currentQuestion = questions[currentQuestionNumber];

    if (!currentQuestion) {
      console.error('🔍 No question found at index:', currentQuestionNumber);
      console.error('🔍 Available questions:', questions.length);
      return NextResponse.json({
        error: 'No question available'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question: {
        id: currentQuestion.id,
        question: currentQuestion.question,
        type: currentQuestion.type,
        options: currentQuestion.options,
        section: currentQuestion.category,
        questionNumber: currentQuestionNumber + 1,
        totalQuestions: totalQuestions
      },
      currentQuestion: currentQuestionNumber + 1,
      totalQuestions: totalQuestions,
      progress: Math.round(((currentQuestionNumber + 1) / totalQuestions) * 100),
      isLast: (currentQuestionNumber + 1) === totalQuestions
    });

  } catch (error) {
    console.error('Assessment questions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
}

// Helper function to handle answer submission
async function handleAnswerSubmission(decoded: DecodedToken, questionId: string, answer: string, questionNumber: number) {
  try {
    // Verify student exists
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Find or create assessment response document
    let assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic'
    });

    // Get questions (n8n generated or fallback)
    let questions: AssessmentQuestion[] = fallbackQuestions;
    if (assessmentResponse && assessmentResponse.generatedQuestions && assessmentResponse.generatedQuestions.length > 0) {
      questions = assessmentResponse.generatedQuestions.map((q: any) => convertN8nQuestion(q));
      console.log('🔍 Using n8n generated questions for submission:', questions.length);
    } else {
      console.log('🔍 Using fallback questions for submission:', questions.length);
    }

    // Get the current question details
    console.log('🔍 Looking for question with ID:', questionId);
    console.log('🔍 Available question IDs:', questions.map(q => q.id));
    
    const currentQuestion = questions.find(q => q.id === questionId);
    if (!currentQuestion) {
      console.error('🔍 Question not found. Available questions:', questions.map(q => ({ id: q.id, question: q.question.substring(0, 50) + '...' })));
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    console.log('🔍 Found question:', currentQuestion.question.substring(0, 50) + '...');

    // Check if answer is correct (for MCQ questions)
    let isCorrect = null;
    if (currentQuestion.type === 'MCQ' && currentQuestion.correctAnswer) {
      isCorrect = answer === currentQuestion.correctAnswer;
    }

    if (!assessmentResponse) {
      assessmentResponse = new AssessmentResponse({
        uniqueId: student.uniqueId,
        assessmentType: 'diagnostic',
        responses: []
      });
    }

    // Add the response
    assessmentResponse.responses.push({
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      answer: answer,
      questionType: currentQuestion.type,
      category: currentQuestion.category,
      difficulty: currentQuestion.difficulty,
      isCorrect: isCorrect,
      submittedAt: new Date()
    });

    // Check if this is the last question
    const totalQuestions = questions.length;
    const isCompleted = questionNumber >= totalQuestions;

    if (isCompleted) {
      // Calculate score for MCQ questions
      const mcqResponses = assessmentResponse.responses.filter((r: { questionType: string }) => r.questionType === 'MCQ');
      const correctAnswers = mcqResponses.filter((r: { isCorrect: boolean }) => r.isCorrect).length;
      const score = mcqResponses.length > 0 ? Math.round((correctAnswers / mcqResponses.length) * 100) : 85;

      // Set completion data
      assessmentResponse.isCompleted = true;
      assessmentResponse.completedAt = new Date();
      
      // Set final result - can be enhanced with AI analysis later
      assessmentResponse.result = {
        type: 'Visual Superstar',
        description: 'You learn best with fun visuals and bright colors!',
        score: score,
        learningStyle: 'Visual',
        recommendations: [
          { title: 'The Water Cycle', description: 'Learn about water cycle with visual animations', xp: 75 },
          { title: 'Shapes Adventure', description: 'Explore geometric shapes through games', xp: 50 },
          { title: 'Story of the Moon', description: 'Discover moon phases with storytelling', xp: 30 }
        ]
      };

      console.log(`🔍 Assessment completed for student ${student.uniqueId} with score: ${score}%`);
    }

    // Save the assessment response
    await assessmentResponse.save();

    if (isCompleted) {
      // Generate new token without assessment requirement (assessment now complete)
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: decoded.email,
          fullName: decoded.fullName,
          role: decoded.role,
          firstTimeLogin: false,
          requiresOnboarding: false,
          requiresAssessment: false
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        success: true,
        message: 'Assessment completed successfully',
        completed: true,
        result: assessmentResponse.result
      });

      // Update the auth token cookie
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      });

      return response;
    }

    return NextResponse.json({
      success: true,
      message: 'Answer saved successfully',
      nextQuestion: questionNumber + 1
    });

  } catch (error) {
    console.error('Save assessment answer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}}
