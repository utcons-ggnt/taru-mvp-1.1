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

export async function GET(request: NextRequest) {
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

    // Get all students for this teacher
    const students = await Student.find({ teacherId: user._id.toString() });
    const studentUserIds = students.map(s => s.userId);
    
    const studentUsers = await User.find({ 
      _id: { $in: studentUserIds }, 
      role: 'student' 
    }).select('+password'); // Explicitly include password field

    // Build credentials list
    const credentials = students.map(student => {
      const studentUser = studentUsers.find(u => u._id.toString() === student.userId);
      return {
        id: student._id.toString(),
        fullName: student.fullName || studentUser?.name,
        email: studentUser?.email,
        password: studentUser?.password,
        classGrade: student.classGrade,
        schoolName: student.schoolName,
        uniqueId: student.uniqueId,
        onboardingCompleted: student.onboardingCompleted,
        createdAt: student.createdAt
      };
    }).filter(cred => cred.email); // Only include students with valid user accounts

    return NextResponse.json({
      message: 'Student credentials retrieved successfully',
      credentials
    });

  } catch (error) {
    console.error('Error retrieving student credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
