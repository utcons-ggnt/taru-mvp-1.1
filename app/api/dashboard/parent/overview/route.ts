import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';
import Module from '@/models/Module';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    if (!user || user.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can access this endpoint' },
        { status: 403 }
      );
    }

    // Get linked student
    const linkedStudentId = user.profile?.linkedStudentId;
    if (!linkedStudentId) {
      return NextResponse.json(
        { error: 'No student linked to this parent account' },
        { status: 400 }
      );
    }

    // Get student profile
    const student = await Student.findOne({ userId: linkedStudentId });
    if (!student) {
      return NextResponse.json(
        { error: 'Linked student not found' },
        { status: 404 }
      );
    }

    // Get student user data for email
    const studentUser = await User.findById(linkedStudentId);
    if (!studentUser) {
      return NextResponse.json(
        { error: 'Student user data not found' },
        { status: 404 }
      );
    }

    // Get student progress
    const progress = await StudentProgress.findOne({ userId: linkedStudentId });
    
    // Get assessment data
    const assessment = await Assessment.findOne({ userId: linkedStudentId });
    
    // Get active modules
    const activeModules = await Module.find({ isActive: true }).limit(5);

    // Calculate statistics
    const totalModules = progress?.moduleProgress?.length || 0;
    const completedModules = progress?.moduleProgress?.filter((mp: any) => mp.status === 'completed').length || 0;
    const inProgressModules = progress?.moduleProgress?.filter((mp: any) => mp.status === 'in-progress').length || 0;
    const totalXp = progress?.totalXpEarned || 0;
    const averageScore = assessment?.diagnosticScore || 0;

    // Calculate completion rate
    const completionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // Get recent activity (last 5 modules)
    const recentActivity = progress?.moduleProgress?.slice(-5).map((mp: any) => ({
      moduleId: mp.moduleId,
      status: mp.status,
      progress: mp.progress,
      xpEarned: mp.xpEarned,
      lastAccessed: mp.startedAt
    })) || [];

    // Get test results from assessment
    const testResults = [];
    if (assessment?.diagnosticCompleted) {
      testResults.push({
        id: '1',
        testName: 'Learning Profile Assessment',
        score: assessment.diagnosticScore || 0,
        totalQuestions: 15,
        date: assessment.assessmentCompletedAt?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        subject: 'Overall Assessment',
        grade: getGradeFromScore(assessment.diagnosticScore || 0)
      });
    }

    // Get notifications based on student progress
    const notifications = [];
    
    if (completedModules === 0) {
      notifications.push({
        id: '1',
        title: 'Student Onboarding Complete',
        message: `${student.fullName} has completed their profile setup. They can now start learning!`,
        type: 'info',
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    }
    
    if (inProgressModules > 0) {
      notifications.push({
        id: '2',
        title: 'Active Learning',
        message: `${student.fullName} is currently working on ${inProgressModules} module(s).`,
        type: 'success',
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    }

    if (completedModules > 0) {
      notifications.push({
        id: '3',
        title: 'Great Progress!',
        message: `${student.fullName} has completed ${completedModules} module(s) and earned ${totalXp} XP!`,
        type: 'success',
        date: new Date().toISOString().split('T')[0],
        read: false
      });
    }

    // Get progress reports by subject
    const progressReports: any[] = [];
    if (progress?.moduleProgress) {
      const subjectStats: any = {};
      
      progress.moduleProgress.forEach((mp: any) => {
        const module = activeModules.find(m => m.moduleId === mp.moduleId);
        if (module) {
          if (!subjectStats[module.subject]) {
            subjectStats[module.subject] = {
              total: 0,
              completed: 0,
              xpEarned: 0
            };
          }
          subjectStats[module.subject].total++;
          if (mp.status === 'completed') {
            subjectStats[module.subject].completed++;
          }
          subjectStats[module.subject].xpEarned += mp.xpEarned || 0;
        }
      });

      Object.entries(subjectStats).forEach(([subject, stats]: [string, any]) => {
        progressReports.push({
          subject,
          currentGrade: getGradeFromScore((stats.completed / stats.total) * 100),
          improvement: Math.round((stats.completed / stats.total) * 100),
          attendance: 95, // Mock data for now
          assignmentsCompleted: stats.completed,
          totalAssignments: stats.total
        });
      });
    }

    return NextResponse.json({
      student: {
        id: student.userId,
        name: student.fullName,
        email: studentUser.email,
        grade: student.classGrade,
        school: student.schoolName,
        profilePicture: student.profilePictureUrl
      },
      overview: {
        totalModules,
        completedModules,
        inProgressModules,
        completionRate,
        totalXp,
        averageScore,
        totalTimeSpent: progress?.totalTimeSpent || 0
      },
      recentActivity,
      testResults,
      notifications,
      progressReports,
      recommendedModules: activeModules.slice(0, 3).map(module => ({
        id: module.moduleId,
        name: module.name,
        subject: module.subject,
        description: module.description,
        xpPoints: module.xpPoints,
        estimatedDuration: module.estimatedDuration
      })),
      progress: {
        badgesEarned: progress?.badgesEarned || [],
        currentModule: progress?.currentModule || null
      }
    });

  } catch (error: any) {
    console.error('Get parent overview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
} 