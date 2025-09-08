import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId, careerData } = await request.json();

    if (!userId || !studentId) {
      return NextResponse.json(
        { error: 'userId and studentId are required' },
        { status: 400 }
      );
    }

    await sessionManager.saveCareerProgress(userId, studentId, careerData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving career progress:', error);
    return NextResponse.json(
      { error: 'Failed to save career progress' },
      { status: 500 }
    );
  }
}
