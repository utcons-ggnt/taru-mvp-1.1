import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(
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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
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
        { error: 'Only students can start modules' },
        { status: 403 }
      );
    }

    // Get module
    const module = await Module.findOne({ moduleId: id, isActive: true });
    if (!module) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Get or create student progress
    let progress = await StudentProgress.findOne({ userId: decoded.userId });
    
    if (!progress) {
      progress = new StudentProgress({
        userId: decoded.userId,
        studentId: decoded.userId,
        moduleProgress: [],
        pathProgress: [],
        totalXpEarned: 0,
        totalModulesCompleted: 0,
        totalTimeSpent: 0,
        badgesEarned: []
      });
    }

    // Check if module is already in progress
    let moduleProgress = progress.moduleProgress.find((mp: any) => mp.moduleId === id);
    
    if (!moduleProgress) {
      // Add new module progress
      moduleProgress = {
        moduleId: id,
        status: 'in-progress',
        progress: 0,
        startedAt: new Date(),
        xpEarned: 0,
        contentProgress: []
      };
      progress.moduleProgress.push(moduleProgress);
    } else if (moduleProgress.status === 'not-started') {
      // Update existing module progress
      moduleProgress.status = 'in-progress';
      moduleProgress.startedAt = new Date();
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      message: 'Module started successfully',
      progress: moduleProgress
    });

  } catch (error) {
    console.error('Start module error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 