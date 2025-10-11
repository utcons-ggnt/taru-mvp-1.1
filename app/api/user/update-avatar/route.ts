import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

    // Get avatar from request body
    const { avatar } = await request.json();
    
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar path is required' },
        { status: 400 }
      );
    }

    // Validate avatar path
    const validAvatars = [
      '/avatars/Group.svg',
      '/avatars/Group-1.svg',
      '/avatars/Group-2.svg',
      '/avatars/Group-3.svg',
      '/avatars/Group-4.svg',
      '/avatars/Group-5.svg',
      '/avatars/Group-6.svg',
      '/avatars/Group-7.svg',
      '/avatars/Group-8.svg'
    ];

    if (!validAvatars.includes(avatar)) {
      return NextResponse.json(
        { error: 'Invalid avatar path' },
        { status: 400 }
      );
    }

    // Update user avatar in database
    const result = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $set: {
          avatar: avatar,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ Avatar updated successfully for user:', decoded.userId);

    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: avatar
    });

  } catch (error) {
    console.error('❌ Update avatar error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    );
  }
}
