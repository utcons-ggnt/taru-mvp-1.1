import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_WEBHOOK_URL = process.env.N8N_VALIDATION_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/ASSESSMENT-VALIDATOR';

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
        { error: 'Only students can validate assessment results' },
        { status: 403 }
      );
    }

    const { answers, questions, timeSpent } = await request.json();

    // Get student's original assessment data
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    if (!assessment) {
      return NextResponse.json(
        { error: 'Assessment data not found' },
        { status: 400 }
      );
    }

    // Calculate basic scores
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(answers).length;
    const score = calculateBasicScore(answers, questions);
    const percentage = Math.round((score / totalQuestions) * 100);

    // Prepare data for N8N validation
    const validationData = {
      studentProfile: {
        skills: assessment.subjectsILike || [],
        interests: assessment.topicsThatExciteMe || [],
        careerGoals: assessment.currentCareerInterest || [],
        dreamJob: assessment.dreamJobAsKid || '',
        aspirations: assessment.whatImMostProudOf || '',
        problemsToSolve: assessment.ifICouldFixOneProblem || '',
        learningStyle: assessment.preferredLearningStyle || []
      },
      assessmentResults: {
        answers,
        questions,
        score,
        percentage,
        totalQuestions,
        answeredQuestions,
        timeSpent
      },
      studentId: decoded.userId,
      studentName: user.name,
      grade: user.profile?.grade || '6'
    };

    // Call N8N webhook for validation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'validate_assessment_results',
          data: validationData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        // Extract validation results from N8N response
        const validation = result.validation || result.data?.validation || {};
        
        return NextResponse.json({
          success: true,
          validation: {
            alignment: validation.alignment || 'moderate',
            recommendation: validation.recommendation || 'proceed',
            confidence: validation.confidence || 0.7,
            feedback: validation.feedback || 'Assessment results show moderate alignment with your profile.',
            suggestions: validation.suggestions || [],
            learningPathReady: validation.learningPathReady || false
          },
          results: {
            score,
            percentage,
            totalQuestions,
            answeredQuestions,
            timeSpent
          },
          metadata: {
            validatedAt: new Date().toISOString(),
            studentId: decoded.userId
          }
        });

      } else {
        throw new Error(`N8N returned ${response.status}`);
      }

    } catch (error) {
      console.error('N8N validation error:', error);
      
      // Fallback validation logic
      const fallbackValidation = generateFallbackValidation(validationData);
      
      return NextResponse.json({
        success: true,
        validation: fallbackValidation,
        results: {
          score,
          percentage,
          totalQuestions,
          answeredQuestions,
          timeSpent
        },
        fallback: true,
        metadata: {
          validatedAt: new Date().toISOString(),
          studentId: decoded.userId,
          error: 'Using fallback validation due to N8N unavailability'
        }
      });
    }

  } catch (error) {
    console.error('Validate assessment results error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Calculate basic score from answers
function calculateBasicScore(answers: Record<string, string>, questions: any[]) {
  let score = 0;
  let totalPossible = 0;

  questions.forEach(question => {
    const answer = answers[question.id];
    if (answer) {
      // For multiple choice, assume first option is correct for fallback
      if (question.options && question.options.length > 0) {
        if (answer === question.options[0]) {
          score += question.points || 10;
        }
      }
      totalPossible += question.points || 10;
    }
  });

  return totalPossible > 0 ? score : 0;
}

// Fallback validation logic
function generateFallbackValidation(data: any) {
  const { studentProfile, assessmentResults } = data;
  const { percentage } = assessmentResults;

  let alignment = 'low';
  let recommendation = 'retake';
  let confidence = 0.5;
  let feedback = '';
  const suggestions = [];
  let learningPathReady = false;

  // Determine alignment based on percentage and profile consistency
  if (percentage >= 80) {
    alignment = 'high';
    recommendation = 'proceed';
    confidence = 0.9;
    feedback = 'Excellent! Your assessment results strongly align with your skills, interests, and goals. You\'re ready to proceed with your personalized learning path.';
    learningPathReady = true;
  } else if (percentage >= 60) {
    alignment = 'moderate';
    recommendation = 'proceed';
    confidence = 0.7;
    feedback = 'Good! Your assessment results show moderate alignment with your profile. You can proceed with your learning path, but consider reviewing your skills and interests.';
    learningPathReady = true;
  } else {
    alignment = 'low';
    recommendation = 'retake';
    confidence = 0.6;
    feedback = 'Your assessment results don\'t seem to fully align with your skills and interests. Consider retaking the assessment or updating your profile.';
    
    // Generate suggestions based on profile
    if (studentProfile.skills.length < 3) {
      suggestions.push('Add more skills to your profile');
    }
    if (studentProfile.interests.length < 3) {
      suggestions.push('Explore more interests');
    }
    if (!studentProfile.dreamJob) {
      suggestions.push('Think about your dream job');
    }
    if (!studentProfile.aspirations) {
      suggestions.push('Reflect on what you\'re most proud of');
    }
  }

  return {
    alignment,
    recommendation,
    confidence,
    feedback,
    suggestions,
    learningPathReady
  };
} 