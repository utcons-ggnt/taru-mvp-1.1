import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
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

    // Get user and verify they are a teacher
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can assign tests' },
        { status: 403 }
      );
    }

    const { studentIds, moduleIds, dueDate, instructions } = await request.json();

    // Validate required fields
    if (!studentIds || !moduleIds || !Array.isArray(studentIds) || !Array.isArray(moduleIds)) {
      return NextResponse.json(
        { error: 'Student IDs and Module IDs are required as arrays' },
        { status: 400 }
      );
    }

    // Verify modules exist
    const modules = await Module.find({ 
      _id: { $in: moduleIds },
      isActive: true 
    });

    if (modules.length !== moduleIds.length) {
      return NextResponse.json(
        { error: 'Some modules not found or inactive' },
        { status: 400 }
      );
    }

    // In a real implementation, you would create test assignments
    // For now, we'll just return success with the assignment details
    const assignment = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: decoded.userId,
      teacherName: user.name,
      studentIds,
      moduleIds,
      modules: modules.map(m => ({
        id: m._id,
        title: m.title,
        subject: m.subject,
        difficulty: m.difficulty,
        duration: m.duration
      })),
      dueDate: dueDate || null,
      instructions: instructions || '',
      assignedAt: new Date(),
      status: 'active'
    };

    // TODO: Save assignment to database when Assignment model is created

    return NextResponse.json({
      success: true,
      message: 'Test assigned successfully',
      assignment
    });

  } catch (error) {
    console.error('Assign test error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Get user and verify they are a teacher
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can view assignments' },
        { status: 403 }
      );
    }

    // Get available modules for assignment
    const modules = await Module.find({ isActive: true }).select('_id title subject grade difficulty duration points');

    return NextResponse.json({
      modules: modules.map(m => ({
        id: m._id,
        title: m.title,
        subject: m.subject,
        grade: m.grade,
        difficulty: m.difficulty,
        duration: m.duration,
        points: m.points
      }))
    });

  } catch (error) {
    console.error('Get modules error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 