import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId, assessmentType, progress } = await request.json();

    if (!userId || !studentId || !assessmentType) {
      return NextResponse.json(
        { error: 'userId, studentId, and assessmentType are required' },
        { status: 400 }
      );
    }

    await sessionManager.saveAssessmentProgress(userId, studentId, assessmentType, progress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving assessment progress:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment progress' },
      { status: 500 }
    );
  }
}
