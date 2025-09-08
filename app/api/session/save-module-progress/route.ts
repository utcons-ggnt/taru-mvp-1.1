import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId, moduleId, progress } = await request.json();

    if (!userId || !studentId || !moduleId) {
      return NextResponse.json(
        { error: 'userId, studentId, and moduleId are required' },
        { status: 400 }
      );
    }

    await sessionManager.saveModuleProgress(userId, studentId, moduleId, progress);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving module progress:', error);
    return NextResponse.json(
      { error: 'Failed to save module progress' },
      { status: 500 }
    );
  }
}
