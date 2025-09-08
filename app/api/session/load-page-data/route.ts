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

    const data = await sessionManager.loadPageData(userId, page);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading page data:', error);
    return NextResponse.json(
      { error: 'Failed to load page data' },
      { status: 500 }
    );
  }
}
