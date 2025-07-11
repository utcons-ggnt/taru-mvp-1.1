import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB Atlas connection.' },
        { status: 500 }
      );
    }

    const { name, email, password, role, profile } = await request.json();

    // Validate input
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = ['student', 'teacher', 'parent_org', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: student, teacher, parent_org, parent, admin' },
        { status: 400 }
      );
    }

    // Validate student linking for parent role
    if (role === 'parent' && !profile?.linkedStudentUniqueId) {
      return NextResponse.json(
        { error: 'Student Unique ID is required for parent registration' },
        { status: 400 }
      );
    }

    // Create new user
    const userData: any = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      profile: profile || {}
    };

    // Verify student exists if linking
    if (role === 'parent' && profile?.linkedStudentUniqueId) {
      // Find student by unique ID
      const student = await Student.findOne({ 
        uniqueId: profile.linkedStudentUniqueId,
        onboardingCompleted: true 
      });
      
      if (!student) {
        return NextResponse.json(
          { error: 'Invalid student unique ID. Please ensure the student has completed onboarding first.' },
          { status: 400 }
        );
      }
      
      // Check if student is already linked to another parent
      const existingParent = await User.findOne({ 
        role: 'parent', 
        'profile.linkedStudentId': student.userId 
      });
      if (existingParent) {
        return NextResponse.json(
          { error: 'This student is already linked to another parent account' },
          { status: 400 }
        );
      }
      
      // Use the found student's userId
      userData.profile = {
        ...userData.profile,
        linkedStudentId: student.userId
      };
    }

    const user = new User(userData);

    await user.save();

    // Return user data without password
    const userResponse = user.toJSON();

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        firstTimeLogin: user.firstTimeLogin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie with JWT token
    const response = NextResponse.json(
      {
        message: 'User registered successfully',
        user: userResponse
      },
      { status: 201 }
    );
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });
    return response;

  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 