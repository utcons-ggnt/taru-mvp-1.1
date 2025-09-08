import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, page } = await request.json();

    if (!userId || !page) {
      return NextResponse.json(
        { error: 'userId and page are required' },
        { status: 400 }
      );
    }

    await sessionManager.updateNavigationHistory(userId, page);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating navigation history:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation history' },
      { status: 500 }
    );
  }
}
