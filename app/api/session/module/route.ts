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

    const { moduleId, progress, studentId } = await request.json();

    if (!moduleId || !progress || !studentId) {
      return NextResponse.json(
        { error: 'Module ID, progress, and student ID are required' },
        { status: 400 }
      );
    }

    // Save module progress
    await sessionManager.saveModuleProgress(decoded.userId, studentId, moduleId, progress);

    return NextResponse.json({
      success: true,
      message: 'Module progress saved successfully'
    });

  } catch (error) {
    console.error('Module session save error:', error);
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
    const moduleId = searchParams.get('moduleId');
    const studentId = searchParams.get('studentId');

    if (!moduleId || !studentId) {
      return NextResponse.json(
        { error: 'Module ID and student ID are required' },
        { status: 400 }
      );
    }

    // Load module progress
    const progress = await sessionManager.loadModuleProgress(decoded.userId, studentId, moduleId);

    return NextResponse.json({
      success: true,
      progress: progress
    });

  } catch (error) {
    console.error('Module session load error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
