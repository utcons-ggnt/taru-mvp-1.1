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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, newPassword } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Find the student record to verify it belongs to this teacher
    const student = await Student.findOne({ 
      _id: studentId, 
      teacherId: user._id.toString() 
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found or access denied' }, { status: 404 });
    }

    // Find the user account for this student
    const studentUser = await User.findOne({ 
      _id: student.userId,
      role: 'student'
    }).select('+password'); // Explicitly include password field

    if (!studentUser) {
      return NextResponse.json({ error: 'Student user account not found' }, { status: 404 });
    }

    // Generate new password if not provided
    let passwordToSet = newPassword;
    if (!passwordToSet) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      passwordToSet = '';
      for (let i = 0; i < 12; i++) {
        passwordToSet += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    // Update the password
    studentUser.password = passwordToSet;
    studentUser.firstTimeLogin = true; // Mark for password change on next login
    await studentUser.save();

    return NextResponse.json({
      message: 'Password reset successfully',
      student: {
        id: student._id.toString(),
        fullName: student.fullName,
        email: studentUser.email,
        newPassword: passwordToSet,
        uniqueId: student.uniqueId
      }
    });

  } catch (error) {
    console.error('Error resetting student password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
