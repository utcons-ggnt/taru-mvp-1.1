import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';
import Module from '@/models/Module';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

interface ModuleProgress {
  moduleId: string;
  status: string;
  progress: number;
  xpEarned: number;
  startedAt: Date;
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    // Get student profile
    const student = await Student.findOne({ userId: decoded.userId });
    
    // Get student progress
    const progress = await StudentProgress.findOne({ userId: decoded.userId });
    
    // Get assessment data
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    
    // Get active modules
    const activeModules = await Module.find({ isActive: true }).limit(5);

    // Calculate statistics
    const totalModules = progress?.moduleProgress?.length || 0;
    const completedModules = progress?.moduleProgress?.filter((mp: ModuleProgress) => mp.status === 'completed').length || 0;
    const inProgressModules = progress?.moduleProgress?.filter((mp: ModuleProgress) => mp.status === 'in-progress').length || 0;
    const totalXp = progress?.totalXpEarned || 0;
    const averageScore = assessment?.diagnosticScore || 0;

    // Get recent activity (last 5 modules)
    const recentActivity = progress?.moduleProgress?.slice(-5).map((mp: ModuleProgress) => ({
      moduleId: mp.moduleId,
      status: mp.status,
      progress: mp.progress,
      xpEarned: mp.xpEarned,
      lastAccessed: mp.startedAt
    })) || [];

    // Get notifications based on progress
    const notifications = [];
    
    if (completedModules === 0) {
      notifications.push({
        id: '1',
        title: 'Welcome to JioWorld Learning!',
        message: 'Complete your first module to start earning XP and badges.',
        type: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    }
    
    if (inProgressModules > 0) {
      notifications.push({
        id: '2',
        title: 'Continue Your Learning',
        message: `You have ${inProgressModules} module(s) in progress. Keep going!`,
        type: 'success',
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    }

    if (assessment?.diagnosticCompleted) {
      notifications.push({
        id: '3',
        title: 'Assessment Complete!',
        message: 'Your learning profile has been created. Check out your personalized recommendations!',
        type: 'success',
        date: assessment.assessmentCompletedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        read: false
      });
    }

    return NextResponse.json({
      overview: {
        totalModules,
        completedModules,
        inProgressModules,
        totalXp,
        averageScore,
        studentName: student?.fullName || user.name,
        grade: student?.classGrade || user.profile?.grade || 'Not set',
        school: student?.schoolName || 'Not set',
        studentKey: student?.uniqueId || 'Not available'
      },
      recentActivity,
      notifications,
      recommendedModules: activeModules.slice(0, 3).map(foundModule => ({
        id: foundModule.moduleId,
        name: foundModule.name,
        subject: foundModule.subject,
        description: foundModule.description,
        xpPoints: foundModule.xpPoints,
        estimatedDuration: foundModule.estimatedDuration
      })),
      progress: {
        totalTimeSpent: progress?.totalTimeSpent || 0,
        badgesEarned: progress?.badgesEarned || [],
        currentModule: progress?.currentModule || null
      }
    });

  } catch (error: unknown) {
    console.error('Get student overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 