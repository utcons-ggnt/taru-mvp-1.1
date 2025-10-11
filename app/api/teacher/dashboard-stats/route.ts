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

    // Connect to database
    await connectDB();

    // Get user and verify they are a teacher
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json(
        { error: 'Only teachers can access this endpoint' },
        { status: 403 }
      );
    }

    // Get all students (in a real system, you'd filter by teacher-student relationships)
    const students = await Student.find({ onboardingCompleted: true });
    const studentUserIds = students.map(s => s.userId);
    
    // Get progress data for these students
    const progressData = await StudentProgress.find({
      studentId: { $in: studentUserIds }
    });

    // Get assessment data for these students
    const assessments = await Assessment.find({
      userId: { $in: studentUserIds }
    });

    // Calculate statistics
    const totalStudents = students.length;
    const activeStudents = progressData.filter(p => p.totalModulesCompleted > 0).length;
    
    // Calculate average progress - using new structure
    const totalProgress = progressData.reduce((sum, p) => sum + (p.totalModulesCompleted || 0), 0);
    const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;
    
    // Calculate total XP across all students using the same formula as student dashboard
    const totalXpAcrossStudents = progressData.reduce((sum, progress) => {
      if (!progress.moduleProgress) return sum;
      
      const studentXp = progress.moduleProgress.reduce((studentSum: number, mp: any) => {
        let moduleXp = 0;
        
        // Base XP for starting a module
        moduleXp += 25;
        
        // XP for quiz performance (0.5 XP per percentage point)
        if (mp.quizScore > 0) {
          moduleXp += Math.round(mp.quizScore * 0.5);
        }
        
        // Bonus XP for completion (75 XP bonus)
        if (mp.quizScore >= 75 || mp.completedAt) {
          moduleXp += 75;
        }
        
        // Video watch time bonus (1 XP per 10 minutes watched)
        if (mp.videoProgress?.watchTime > 0) {
          moduleXp += Math.floor(mp.videoProgress.watchTime / 600); // 600 seconds = 10 minutes
        }
        
        return studentSum + moduleXp;
      }, 0);
      
      // Add learning streak bonus
      const streakBonus = Math.min((progress.learningStreak || 0) * 10, 100);
      return sum + studentXp + streakBonus;
    }, 0);
    
    // Calculate average score
    const totalScores = assessments.reduce((sum, a) => sum + (a.diagnosticScore || 0), 0);
    const averageScore = assessments.length > 0 ? Math.round(totalScores / assessments.length) : 0;
    
    // Calculate total assignments (placeholder for now)
    const totalAssignments = 0; // TODO: Implement assignment tracking

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = progressData
      .filter(p => p.updatedAt >= sevenDaysAgo)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    // Get subject-wise statistics
    const subjectStats = await Module.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    // Get grade-wise student distribution
    const gradeStats = await Student.aggregate([
      { $group: { _id: '$classGrade', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get performance distribution
    const performanceDistribution = {
      excellent: assessments.filter(a => (a.diagnosticScore || 0) >= 90).length,
      good: assessments.filter(a => (a.diagnosticScore || 0) >= 70 && (a.diagnosticScore || 0) < 90).length,
      average: assessments.filter(a => (a.diagnosticScore || 0) >= 50 && (a.diagnosticScore || 0) < 70).length,
      needsImprovement: assessments.filter(a => (a.diagnosticScore || 0) < 50).length
    };

    // Get weekly progress trend
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayActivity = progressData.filter(p => 
        p.updatedAt >= dayStart && p.updatedAt <= dayEnd
      ).length;
      
      weeklyTrend.push({
        date: dayStart.toISOString().split('T')[0],
        activity: dayActivity
      });
    }

    return NextResponse.json({
      overview: {
        totalStudents,
        activeStudents,
        averageProgress,
        totalAssignments,
        averageScore,
        totalXpAcrossStudents
      },
      subjectStats: subjectStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      gradeStats: gradeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {} as Record<string, number>),
      performanceDistribution,
      weeklyTrend,
      recentActivity: recentActivity.map(activity => ({
        studentId: activity.studentId,
        modulesCompleted: activity.totalModulesCompleted || 0,
        xpEarned: activity.totalPoints || 0,
        lastActivity: activity.updatedAt
      }))
    });

  } catch (error) {
    console.error('Teacher dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 