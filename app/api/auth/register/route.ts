import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
  profile: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: unknown) {
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
    const validRoles = ['student', 'teacher', 'parent', 'organization', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: student, teacher, parent, organization, admin' },
        { status: 400 }
      );
    }

    // Validate student linking for parent role
    if (role === 'parent') {
      const studentId = profile?.linkedStudentUniqueId;
      
      if (!studentId) {
        return NextResponse.json(
          { error: 'Student Unique ID is required for parent registration' },
          { status:400}
        );
      }
      
      // Validate student ID format
      if (!studentId.startsWith('STU')) {
        return NextResponse.json(
          { error: 'Invalid student ID format. Student ID must start with "STU"' },
          { status:400}
        );
      }
      
      if (studentId.length < 8) {
        return NextResponse.json(
          { error: 'Invalid student ID format. Student ID must be at least 8aracters long' },
          { status:400}
        );
      }
    }

    // Create new user with role-specific profile mapping
    let userProfile: Record<string, unknown> = {};
    
    // Map form data to profile based on role
    if (role === 'student') {
      userProfile = {
        grade: profile?.grade || profile?.classGrade,
        language: profile?.language,
        location: profile?.location,
        guardianName: profile?.guardianName,
      };
    } else if (role === 'teacher') {
      userProfile = {
        subjectSpecialization: profile?.subjectSpecialization || profile?.classGrade,
        experienceYears: profile?.experienceYears || profile?.language,
        location: profile?.location,
      };
    } else if (role === 'parent') {
      userProfile = {
        linkedStudentUniqueId: profile?.linkedStudentUniqueId || profile?.classGrade,
        location: profile?.location,
        guardianName: profile?.guardianName,
      };
      
      // Verify student exists if linking
      if (userProfile.linkedStudentUniqueId) {
        // Find student by unique ID
        const student = await Student.findOne({ 
          uniqueId: userProfile.linkedStudentUniqueId,
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
        
        // Add the found student's userId
        userProfile.linkedStudentId = student.userId;
      }
    } else if (role === 'organization') {
      userProfile = {
        organizationType: profile?.organizationType || profile?.classGrade,
        industry: profile?.industry || profile?.language,
        location: profile?.location,
      };
    }

    const userData: UserData = {
      name,
      email: email.toLowerCase(),
      password,
      role,
      profile: userProfile
    };

    const user = new User(userData);

    await user.save();

    // Return user data without password
    const userResponse = user.toJSON();

    // Generate JWT token
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

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
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