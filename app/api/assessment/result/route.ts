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

    // Find student
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

    // Find assessment response
    const assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic',
      isCompleted: true
    });

    if (!assessmentResponse) {
      return NextResponse.json(
        { error: 'Assessment not found or not completed' },
        { status: 404 }
      );
    }

    // Check if analysis is complete
    const isAnalysisComplete = assessmentResponse.analysisCompleted || 
                               (assessmentResponse.result && 
                                assessmentResponse.result.type !== 'Processing');

    return NextResponse.json({
      success: true,
      isComplete: isAnalysisComplete,
      result: assessmentResponse.result,
      analysisCompleted: assessmentResponse.analysisCompleted,
      completedAt: assessmentResponse.completedAt,
      analysisCompletedAt: assessmentResponse.analysisCompletedAt
    });

  } catch (error) {
    console.error('Assessment result error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}