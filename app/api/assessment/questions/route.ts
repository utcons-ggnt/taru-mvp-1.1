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

  // Map n8n question types to our format based on the actual N8N output
  if (questionType === 'Multiple Choice') {
    type = 'MCQ';
    // For Multiple Choice questions, generate contextually appropriate options
    options = ['Strongly Agree', 'Agree', 'Disagree', 'Strongly Disagree'];
  } else if (questionType === 'Pattern Choice') {
    type = 'MCQ';
    // For Pattern Choice questions, generate pattern-related options
    options = ['Organ', 'System', 'Organism', 'Population'];
  } else {
    // All other types (Open Text, etc.) are treated as OPEN questions
    type = 'OPEN';
  }

  // Map difficulty levels
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';
  if (n8nQuestion.difficulty === 'Middle') {
    difficulty = 'medium';
  } else if (n8nQuestion.difficulty === 'Secondary') {
    difficulty = 'hard';
  }

  return {
    id: n8nQuestion.id.toString(), // Use the id field from N8N output
    question: n8nQuestion.question,
    type: type,
    options: options,
    category: n8nQuestion.section || 'General',
    difficulty: difficulty
  };
}

// Function to parse N8N output format and extract questions
function parseN8nOutput(n8nOutput: any): AssessmentQuestion[] {
  try {
    console.log('🔍 Parsing N8N output:', JSON.stringify(n8nOutput, null, 2));
    
    // Handle the N8N format: [{"output": "JSON_STRING_WITH_QUESTIONS"}]
    if (Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      const firstItem = n8nOutput[0];
      if (firstItem && firstItem.output) {
        console.log('🔍 Found output field in N8N response');
        
        // Parse the JSON string inside the output field
        const parsedOutput = JSON.parse(firstItem.output);
        console.log('🔍 Parsed output:', JSON.stringify(parsedOutput, null, 2));
        
        // Extract questions from the parsed output
        if (parsedOutput && parsedOutput.questions && Array.isArray(parsedOutput.questions)) {
          console.log('🔍 Found questions array with', parsedOutput.questions.length, 'questions');
          return parsedOutput.questions.map((q: any) => convertN8nQuestion(q));
        }
      }
    }
    
    // Handle direct object format (fallback)
    if (n8nOutput && typeof n8nOutput === 'object' && !Array.isArray(n8nOutput)) {
      if (n8nOutput.questions && Array.isArray(n8nOutput.questions)) {
        console.log('🔍 Found direct questions array with', n8nOutput.questions.length, 'questions');
        return n8nOutput.questions.map((q: any) => convertN8nQuestion(q));
      }
    }
    
    console.warn('🔍 No valid questions found in N8N output');
    return [];
  } catch (error) {
    console.error('🔍 Error parsing N8N output:', error);
    return [];
  }
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
    
    // Try to get N8N questions from assessment response
    if (assessmentResponse && assessmentResponse.generatedQuestions && assessmentResponse.generatedQuestions.length > 0) {
      console.log('🔍 Found stored N8N questions for student:', student.uniqueId);
      const parsedQuestions = parseN8nOutput(assessmentResponse.generatedQuestions);
      
      if (parsedQuestions.length > 0) {
        questions = parsedQuestions;
        console.log('🔍 Using parsed N8N questions:', questions.length);
      } else {
        console.log('🔍 Failed to parse N8N questions, using fallback');
      }
    } else {
      console.log('🔍 No stored N8N questions, using fallback questions for student:', student.uniqueId);
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
      console.log('🔍 Found stored N8N questions for submission');
      const parsedQuestions = parseN8nOutput(assessmentResponse.generatedQuestions);
      
      if (parsedQuestions.length > 0) {
        questions = parsedQuestions;
        console.log('🔍 Using parsed N8N questions for submission:', questions.length);
      } else {
        console.log('🔍 Failed to parse N8N questions for submission, using fallback');
      }
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
