import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LearningPath from '@/models/LearningPath';
import LearningPathResponse from '@/models/LearningPathResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params to get the id
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can delete learning paths' },
        { status: 403 }
      );
    }

    // Get student profile to get uniqueId
    const Student = (await import('@/models/Student')).default;
    const student = await Student.findOne({ userId: decoded.userId });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Find and delete the learning path response
    const learningPathResponse = await LearningPathResponse.findById(id);
    
    if (!learningPathResponse) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Check if the learning path belongs to the current user
    console.log('🔍 Learning path uniqueid:', learningPathResponse.uniqueid);
    console.log('🔍 Student uniqueId:', student.uniqueId);
    console.log('🔍 User ID:', decoded.userId);
    
    if (learningPathResponse.uniqueid !== student.uniqueId) {
      console.log('❌ Access denied: Learning path does not belong to user');
      return NextResponse.json(
        { error: 'You can only delete your own learning paths' },
        { status: 403 }
      );
    }

    await LearningPathResponse.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Learning path deleted successfully'
    });

  } catch (error) {
    console.error('Delete learning path error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
