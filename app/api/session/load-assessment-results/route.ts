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

    const data = await sessionManager.loadAssessmentResults(uniqueId);

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error loading assessment results:', error);
    return NextResponse.json(
      { error: 'Failed to load assessment results' },
      { status: 500 }
    );
  }
}
