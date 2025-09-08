import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadStudentData(userId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading student data:', error);
    return NextResponse.json(
      { error: 'Failed to load student data' },
      { status: 500 }
    );
  }
}
