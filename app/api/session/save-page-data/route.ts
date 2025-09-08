import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { userId, page, data, metadata } = await request.json();

    if (!userId || !page) {
      return NextResponse.json(
        { error: 'userId and page are required' },
        { status: 400 }
      );
    }

    await sessionManager.savePageData(userId, page, data, metadata);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving page data:', error);
    return NextResponse.json(
      { error: 'Failed to save page data' },
      { status: 500 }
    );
  }
}
