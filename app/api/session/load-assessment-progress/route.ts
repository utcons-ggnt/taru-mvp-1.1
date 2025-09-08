import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId, assessmentType } = await request.json();

    if (!userId || !studentId || !assessmentType) {
      return NextResponse.json(
        { error: 'userId, studentId, and assessmentType are required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadAssessmentProgress(userId, studentId, assessmentType);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading assessment progress:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment progress' },
      { status: 500 }
    );
  }
}
