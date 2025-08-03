import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
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

    // Get user data
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let profileData: any = {
      id: user._id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      avatar: user.avatar || null,
      createdAt: user.createdAt
    };

    // If user is a student, get additional student profile data
    if (user.role === 'student') {
      const studentProfile = await Student.findOne({ userId: user._id });
      if (studentProfile) {
        profileData = {
          ...profileData,
          uniqueId: studentProfile.uniqueId,
          age: studentProfile.age,
          classGrade: studentProfile.classGrade,
          languagePreference: studentProfile.languagePreference,
          schoolName: studentProfile.schoolName,
          onboardingCompleted: studentProfile.onboardingCompleted,
          preferredSubject: studentProfile.preferredSubject
        };
      }
    }

    return NextResponse.json({
      success: true,
      user: profileData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}