import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
        { error: 'Only students can complete skill assessment' },
        { status: 403 }
      );
    }

    const {
      languagePreference,
      enableVoiceInstructions,
      preferredLearningStyle,
      bestLearningEnvironment,
      subjectsILike,
      topicsThatExciteMe,
      howISpendFreeTime,
      thingsImConfidentDoing,
      thingsINeedHelpWith,
      dreamJobAsKid,
      currentCareerInterest,
      peopleIAdmire,
      whatImMostProudOf,
      ifICouldFixOneProblem
    } = await request.json();

    // Validate required fields
    if (!languagePreference || !preferredLearningStyle || !subjectsILike) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Create or update assessment
    const assessmentData = {
      userId: decoded.userId,
      studentId: decoded.userId,
      languagePreference,
      enableVoiceInstructions,
      preferredLearningStyle,
      bestLearningEnvironment,
      subjectsILike,
      topicsThatExciteMe,
      howISpendFreeTime,
      thingsImConfidentDoing,
      thingsINeedHelpWith,
      dreamJobAsKid,
      currentCareerInterest,
      peopleIAdmire,
      whatImMostProudOf,
      ifICouldFixOneProblem,
      assessmentCompleted: true,
      assessmentCompletedAt: new Date()
    };

    await Assessment.findOneAndUpdate(
      { userId: decoded.userId },
      assessmentData,
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Skill and interest assessment completed successfully' 
    });

  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

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

    // Get assessment data
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    
    if (!assessment) {
      return NextResponse.json({ 
        assessment: null 
      });
    }

    return NextResponse.json({ 
      assessment: assessment.toJSON() 
    });

  } catch (error) {
    console.error('Get assessment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 