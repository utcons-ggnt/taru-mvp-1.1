import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { studentId, progressData } = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId is required' },
        { status: 400 }
      );
    }

    await sessionManager.saveStudentProgress(studentId, progressData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving student progress:', error);
    return NextResponse.json(
      { error: 'Failed to save student progress' },
      { status: 500 }
    );
  }
}
