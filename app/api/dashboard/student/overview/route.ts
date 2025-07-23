import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Module from '@/models/Module';
import Assessment from '@/models/Assessment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
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

    if (decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Access denied. Student role required.' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get user and student info
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const student = await Student.findOne({ userId: decoded.userId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get all modules for total count
    const allModules = await Module.find({});
    const totalModules = allModules.length;

    // Get student progress
    const studentProgresses = await StudentProgress.find({ studentId: student._id });
    const completedModules = studentProgresses.filter(progress => progress.completed).length;
    const inProgressModules = studentProgresses.filter(progress => !progress.completed && progress.videoProgress.watchTime > 0).length;

    // Calculate total XP
    const totalXp = studentProgresses.reduce((sum, progress) => sum + (progress.pointsEarned || 0), 0);

    // Calculate average score
    const scoresWithQuiz = studentProgresses.filter(progress => progress.quizScore > 0);
    const averageScore = scoresWithQuiz.length > 0 
      ? Math.round(scoresWithQuiz.reduce((sum, progress) => sum + progress.quizScore, 0) / scoresWithQuiz.length)
      : 0;

    // Get recent activity (last 5 modules worked on)
    const recentActivity = studentProgresses
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .map(progress => {
        const foundModule = allModules.find(m => m._id.toString() === progress.moduleId);
        return {
          moduleId: progress.moduleId,
          status: progress.completed ? 'completed' : 'in-progress',
          progress: progress.completed ? 100 : Math.round((progress.videoProgress.watchTime / 300) * 100), // Assuming 5 min videos
          xpEarned: progress.pointsEarned || 0,
          lastAccessed: progress.updatedAt,
          moduleName: foundModule?.title || 'Unknown Module'
        };
      });

    // Get recommended modules (modules not started yet)
    const startedModuleIds = studentProgresses.map(progress => progress.moduleId);
    const recommendedModules = allModules
      .filter(module => !startedModuleIds.includes(module._id.toString()))
      .slice(0, 6)
      .map(module => ({
        id: module._id.toString(),
        name: module.title,
        subject: module.subject,
        description: module.description,
        xpPoints: module.points,
        estimatedDuration: module.duration
      }));

    // Get badges earned (from gamification progress)
    const badgesEarned = studentProgresses
      .flatMap(progress => progress.gamificationProgress?.badges || [])
      .map(badge => ({
        badgeId: badge.badgeId,
        name: badge.name,
        description: `Achievement earned through learning progress`,
        earnedAt: badge.earnedAt
      }));

    // Get assessment info
    let assessment = null;
    try {
      const userAssessment = await Assessment.findOne({ userId: decoded.userId });
      if (userAssessment) {
        assessment = {
          diagnosticCompleted: userAssessment.completed,
          diagnosticScore: userAssessment.overallScore || 0,
          assessmentCompletedAt: userAssessment.createdAt
        };
      }
         } catch {
       console.log('Assessment not found, continuing without it');
     }

    // Calculate total time spent
    const totalTimeSpent = studentProgresses.reduce((sum, progress) => {
      return sum + (progress.videoProgress.watchTime || 0);
    }, 0);

    const dashboardData = {
      overview: {
        totalModules,
        completedModules,
        inProgressModules,
        totalXp,
        averageScore,
        studentName: user.name,
        grade: student.grade || user.profile?.grade || '',
        school: student.school || user.profile?.school || '',
        studentKey: student.studentKey || `STU${student._id.toString().slice(-6).toUpperCase()}`
      },
      recentActivity,
      notifications: [], // TODO: Implement notifications system
      recommendedModules,
      progress: {
        totalTimeSpent,
        badgesEarned,
        currentModule: recentActivity[0] || null
      },
      assessment
    };

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 