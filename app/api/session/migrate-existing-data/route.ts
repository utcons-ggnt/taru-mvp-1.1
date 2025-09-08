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

    await sessionManager.migrateExistingData(userId, studentId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error migrating existing data:', error);
    return NextResponse.json(
      { error: 'Failed to migrate existing data' },
      { status: 500 }
    );
  }
}
