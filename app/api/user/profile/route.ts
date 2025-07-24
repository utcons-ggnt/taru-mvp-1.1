import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function PUT(request: NextRequest) {
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const { name, grade, school, language } = await request.json();

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        { error: 'Name cannot be more than 50 characters' },
        { status: 400 }
      );
    }

    if (school && school.length > 100) {
      return NextResponse.json(
        { error: 'School name cannot be more than 100 characters' },
        { status: 400 }
      );
    }

    // Update User model
    user.name = name.trim();
    if (grade) {
      user.profile = user.profile || {};
      user.profile.grade = grade;
    }
    if (language) {
      user.profile = user.profile || {};
      user.profile.language = language;
    }

    await user.save();

    // Update Student model if user is a student
    if (decoded.role === 'student') {
      const student = await Student.findOne({ userId: decoded.userId });
      if (student) {
        if (name) {
          student.fullName = name.trim();
        }
        if (grade) {
          student.classGrade = grade;
        }
        if (school) {
          student.schoolName = school.trim();
        }
        if (language) {
          student.languagePreference = language;
        }
        
        await student.save();
      }
    }

    // Return updated profile data
    const updatedUser = await User.findById(decoded.userId).select('-password');
    const updatedStudent = decoded.role === 'student' 
      ? await Student.findOne({ userId: decoded.userId })
      : null;

    const profileData = {
      name: updatedUser.name,
      email: updatedUser.email,
      grade: updatedUser.profile?.grade || updatedStudent?.classGrade || '',
      school: updatedStudent?.schoolName || '',
      language: updatedUser.profile?.language || updatedStudent?.languagePreference || '',
      studentKey: updatedStudent?.uniqueId || '',
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current profile
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

    // Fetch user data
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch student data if user is a student
    const student = decoded.role === 'student' 
      ? await Student.findOne({ userId: decoded.userId })
      : null;

    const profileData = {
      name: user.name,
      email: user.email,
      grade: user.profile?.grade || student?.classGrade || '',
      school: student?.schoolName || '',
      language: user.profile?.language || student?.languagePreference || '',
      studentKey: student?.uniqueId || '',
    };

    return NextResponse.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 