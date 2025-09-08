import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, studentId, moduleId } = await request.json();

    if (!userId || !studentId || !moduleId) {
      return NextResponse.json(
        { error: 'userId, studentId, and moduleId are required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadModuleProgress(userId, studentId, moduleId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading module progress:', error);
    return NextResponse.json(
      { error: 'Failed to load module progress' },
      { status: 500 }
    );
  }
}
