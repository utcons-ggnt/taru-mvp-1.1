import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/SessionManager';

export async function POST(request: NextRequest) {
  try {
    const { uniqueId } = await request.json();

    if (!uniqueId) {
      return NextResponse.json(
        { error: 'uniqueId is required' },
        { status: 400 }
      );
    }

    const data = await sessionManager.loadCareerPathData(uniqueId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading career path data:', error);
    return NextResponse.json(
      { error: 'Failed to load career path data' },
      { status: 500 }
    );
  }
}
