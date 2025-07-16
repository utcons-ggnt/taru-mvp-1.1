import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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

    // Check if user is authorized to access this student data
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Allow access if:
    // 1. User is the student themselves
    // 2. User is a parent linked to this student
    // 3. User is an admin or teacher
    const isAuthorized = 
      decoded.userId === id || // Student accessing their own data
      (user.role === 'parent' && user.profile?.linkedStudentId === id) || // Parent accessing linked student
      user.role === 'admin' || // Admin access
      user.role === 'teacher'; // Teacher access

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized to access this student data' },
        { status: 403 }
      );
    }

    // Fetch student data
    const student = await Student.findOne({ userId: id });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Return student data (excluding sensitive information for non-admin users)
    const studentData = student.toJSON();
    
    if (user.role !== 'admin') {
      // Remove sensitive data for non-admin users
      delete studentData.deviceId;
      delete studentData.consentForDataUsage;
      delete studentData.termsAndConditionsAccepted;
    }

    return NextResponse.json(
      { 
        student: studentData,
        message: 'Student data retrieved successfully'
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Get student error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 