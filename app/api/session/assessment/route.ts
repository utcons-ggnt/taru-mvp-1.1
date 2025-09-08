import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sessionManager } from '@/lib/SessionManager';

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

    const { assessmentType, progress, studentId } = await request.json();

    if (!assessmentType || !progress || !studentId) {
      return NextResponse.json(
        { error: 'Assessment type, progress, and student ID are required' },
        { status: 400 }
      );
    }

    // Save assessment progress
    await sessionManager.saveAssessmentProgress(decoded.userId, studentId, assessmentType, progress);

    return NextResponse.json({
      success: true,
      message: 'Assessment progress saved successfully'
    });

  } catch (error) {
    console.error('Assessment session save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    const { searchParams } = new URL(request.url);
    const assessmentType = searchParams.get('assessmentType');
    const studentId = searchParams.get('studentId');

    if (!assessmentType || !studentId) {
      return NextResponse.json(
        { error: 'Assessment type and student ID are required' },
        { status: 400 }
      );
    }

    // Load assessment progress
    const progress = await sessionManager.loadAssessmentProgress(decoded.userId, studentId, assessmentType);

    return NextResponse.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Assessment session load error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
