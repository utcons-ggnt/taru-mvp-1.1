import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId } = await request.json();

    if (!userId || !studentId) {
      return NextResponse.json(
        { error: 'userId and studentId are required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadCareerProgress(userId, studentId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading career progress:', error);
    return NextResponse.json(
      { error: 'Failed to load career progress' },
      { status: 500 }
    );
  }
}
