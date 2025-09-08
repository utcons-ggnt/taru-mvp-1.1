import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { N8NCacheService } from '@/lib/N8NCacheService';

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

    // Connect to database
    await connectDB();

    // Verify user is an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { uniqueId, resultType } = body;

    // Clear cache
    if (uniqueId) {
      await N8NCacheService.clearCache(uniqueId, resultType);
      return NextResponse.json({
        success: true,
        message: `Cache cleared for ${uniqueId}${resultType ? ` (${resultType})` : ''}`
      });
    } else {
      // Clear all cache
      await N8NCacheService.clearCache('', '');
      return NextResponse.json({
        success: true,
        message: 'All cache cleared'
      });
    }

  } catch (error) {
    console.error('Clear cache error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
