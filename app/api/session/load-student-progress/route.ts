import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { studentId } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadStudentProgress(studentId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading student progress:', error);
    return NextResponse.json(
      { error: 'Failed to load student progress' },
      { status: 500 }
    );
  }
}
