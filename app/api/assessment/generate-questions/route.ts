import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_WEBHOOK_URL = process.env.N8N_ASSESSMENT_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/learnign-path';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
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

    // Verify user is a student
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can generate assessment questions' },
        { status: 403 }
      );
    }

    // Get student's assessment data (skills, interests, goals)
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    if (!assessment || !assessment.assessmentCompleted) {
      return NextResponse.json(
        { error: 'Please complete skills and interests assessment first' },
        { status: 400 }
      );
    }

    const { retakeCount = 0 } = await request.json();

    // Prepare data for N8N
    const assessmentData = {
      skills: assessment.subjectsILike || [],
      interests: assessment.topicsThatExciteMe || [],
      careerGoals: assessment.currentCareerInterest || [],
      dreamJob: assessment.dreamJobAsKid || '',
      aspirations: assessment.whatImMostProudOf || '',
      problemsToSolve: assessment.ifICouldFixOneProblem || '',
      learningStyle: assessment.preferredLearningStyle || [],
      retakeCount,
      studentId: decoded.userId,
      studentName: user.name,
      grade: user.profile?.grade || '6'
    };

    // Call N8N webhook to generate questions
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_assessment_questions',
          studentData: assessmentData,
          requirements: {
            questionCount: 10,
            categories: ['skills', 'interests', 'aspirations', 'goals'],
            difficulty: 'adaptive',
            format: 'multiple_choice'
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        // Extract questions from N8N response
        const questions = result.questions || result.data?.questions || [];
        
        if (questions.length === 0) {
          throw new Error('No questions generated');
        }

        return NextResponse.json({
          success: true,
          questions: questions.map((q: any, index: number) => ({
            id: `ai_${Date.now()}_${index}`,
            question: q.question || q.prompt,
            options: q.options || q.choices || [],
            category: q.category || 'General',
            points: q.points || 10,
            timeLimit: q.timeLimit || 120,
            type: 'multiple-choice'
          })),
          metadata: {
            generatedAt: new Date().toISOString(),
            studentId: decoded.userId,
            retakeCount,
            totalQuestions: questions.length
          }
        });

      } else {
        throw new Error(`N8N returned ${response.status}`);
      }

    } catch (error) {
      console.error('N8N assessment generation error:', error);
      
      // Fallback to static questions if N8N fails
      const fallbackQuestions = generateFallbackQuestions(assessmentData);
      
      return NextResponse.json({
        success: true,
        questions: fallbackQuestions,
        fallback: true,
        metadata: {
          generatedAt: new Date().toISOString(),
          studentId: decoded.userId,
          retakeCount,
          totalQuestions: fallbackQuestions.length,
          error: 'Using fallback questions due to N8N unavailability'
        }
      });
    }

  } catch (error) {
    console.error('Generate assessment questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Fallback question generator
function generateFallbackQuestions(studentData: any) {
  const questions: any[] = [];
  
  // Generate questions based on student's skills
  if (studentData.skills.length > 0) {
    studentData.skills.slice(0, 3).forEach((skill: string) => {
      questions.push({
        id: `fallback_skill_${Date.now()}_${questions.length}`,
        question: `How confident are you in ${skill}?`,
        options: ['Very confident', 'Somewhat confident', 'Not very confident', 'Need to learn more'],
        category: 'Skills Assessment',
        points: 10,
        timeLimit: 120,
        type: 'multiple-choice'
      });
    });
  }

  // Generate questions based on interests
  if (studentData.interests.length > 0) {
    studentData.interests.slice(0, 3).forEach((interest: string) => {
      questions.push({
        id: `fallback_interest_${Date.now()}_${questions.length}`,
        question: `What would you like to learn most about ${interest}?`,
        options: ['The basics', 'Advanced concepts', 'Practical applications', 'Career opportunities'],
        category: 'Interest Exploration',
        points: 10,
        timeLimit: 120,
        type: 'multiple-choice'
      });
    });
  }

  // Generate questions based on career goals
  if (studentData.careerGoals.length > 0) {
    studentData.careerGoals.slice(0, 2).forEach((goal: string) => {
      questions.push({
        id: `fallback_career_${Date.now()}_${questions.length}`,
        question: `What skills do you think are most important for a career in ${goal}?`,
        options: ['Technical skills', 'Communication skills', 'Problem-solving', 'Creativity'],
        category: 'Career Planning',
        points: 10,
        timeLimit: 120,
        type: 'multiple-choice'
      });
    });
  }

  // Add general questions to reach 10 total
  const generalQuestions = [
    {
      id: `fallback_general_${Date.now()}_${questions.length}`,
      question: 'How do you prefer to learn new things?',
      options: ['By watching videos', 'By reading', 'By doing hands-on activities', 'By discussing with others'],
      category: 'Learning Style',
      points: 10,
      timeLimit: 120,
      type: 'multiple-choice'
    },
    {
      id: `fallback_general_${Date.now()}_${questions.length + 1}`,
      question: 'What motivates you to learn?',
      options: ['Getting good grades', 'Understanding new concepts', 'Solving problems', 'Helping others'],
      category: 'Motivation',
      points: 10,
      timeLimit: 120,
      type: 'multiple-choice'
    }
  ];

  return [...questions, ...generalQuestions].slice(0, 10);
} 