import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sessionManager } from '@/lib/SessionManager';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { page, data, metadata } = await request.json();

    if (!page || !data) {
      return NextResponse.json(
        { error: 'Page and data are required' },
        { status: 400 }
      );
    }

    // Save page data
    await sessionManager.savePageData(decoded.userId, page, data, metadata);

    return NextResponse.json({
      success: true,
      message: 'Page data saved successfully'
    });

  } catch (error) {
    console.error('Session save error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
