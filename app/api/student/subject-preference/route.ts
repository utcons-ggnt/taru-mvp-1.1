import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

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

    const { subjectId, subjectName } = await request.json();

    if (!subjectId || !subjectName) {
      return NextResponse.json(
        { error: 'Subject ID and name are required' },
        { status: 400 }
      );
    }

    // Find and update student record
    const student = await Student.findOneAndUpdate(
      { userId: decoded.userId },
      { 
        $set: { 
          preferredSubject: {
            id: subjectId,
            name: subjectName,
            selectedAt: new Date()
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    console.log(`Subject preference saved for student ${student.uniqueId}: ${subjectName}`);

    return NextResponse.json({
      success: true,
      message: 'Subject preference saved successfully',
      subject: {
        id: subjectId,
        name: subjectName
      }
    });

  } catch (error) {
    console.error('Subject preference error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}