import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Module from '@/models/Module';
import Assessment from '@/models/Assessment';
import YoutubeUrl from '@/models/YoutubeUrl';

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

    // Get actual total modules from YouTube data
    const youtubeData = await YoutubeUrl.findOne({ uniqueid: student.uniqueId });
    let totalModules = 0;
    
    if (youtubeData && youtubeData.Module && youtubeData.Module.length > 0) {
      console.log('📺 YouTube data found:', {
        totalModules: youtubeData.Module.length,
        modules: youtubeData.Module.map((module: any, index: number) => ({
          moduleIndex: index,
          chapterKey: Object.keys(module)[0],
          videoTitle: module[Object.keys(module)[0]]?.videoTitle || 'Unknown'
        }))
      });
      
      // Each item in Module array is one chapter, so total is just the array length
      totalModules = youtubeData.Module.length;
    } else {
      console.log('📚 No YouTube data found, using Module collection');
      // Fallback to Module collection if no YouTube data
      const allModules = await Module.find({});
      totalModules = allModules.length;
    }


    // Get student progress - use the new structure with moduleProgress array
    const studentProgress = await StudentProgress.findOne({ studentId: student.uniqueId });
    
    let completedModules = 0;
    let inProgressModules = 0;
    let totalXp = 0;
    let averageScore = 0;
    let recentActivity: any[] = [];

    if (studentProgress && studentProgress.moduleProgress) {
      // Count completed modules (score >= 75% or has completedAt)
      const completedModulesList = studentProgress.moduleProgress.filter((mp: any) => {
        const isCompleted = mp.quizScore >= 75 || mp.completedAt;
        return isCompleted;
      });
      
      completedModules = completedModulesList.length;

      // Count in-progress modules (has some progress but not completed)
      inProgressModules = studentProgress.moduleProgress.filter((mp: any) => 
        (mp.quizScore > 0 || mp.videoProgress?.watchTime > 0) && 
        !(mp.quizScore >= 75 || mp.completedAt)
      ).length;


      // Calculate total XP with detailed breakdown
      totalXp = studentProgress.moduleProgress.reduce((sum: number, mp: any) => {
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
        
        return sum + moduleXp;
      }, 0);
      
      // Add learning streak bonus
      const streakBonus = Math.min((studentProgress.learningStreak || 0) * 10, 100);
      totalXp += streakBonus;

      // Calculate average score from quiz scores
      const scoresWithQuiz = studentProgress.moduleProgress.filter((mp: any) => mp.quizScore > 0);
      averageScore = scoresWithQuiz.length > 0 
        ? Math.round(scoresWithQuiz.reduce((sum: number, mp: any) => sum + mp.quizScore, 0) / scoresWithQuiz.length)
        : 0;

      // Get recent activity (last 5 modules worked on)
      recentActivity = studentProgress.moduleProgress
        .sort((a: any, b: any) => new Date(b.lastAccessedAt || b.startedAt).getTime() - new Date(a.lastAccessedAt || a.startedAt).getTime())
        .slice(0, 5)
        .map((mp: any) => {
          const isCompleted = mp.quizScore >= 75 || mp.completedAt;
          return {
            moduleId: mp.moduleId,
            status: isCompleted ? 'completed' : 'in-progress',
            progress: isCompleted ? 100 : Math.min(mp.quizScore || 0, 100),
            xpEarned: mp.pointsEarned || 0,
            lastAccessed: mp.lastAccessedAt || mp.startedAt,
            moduleName: mp.moduleId // Using moduleId as name for now
          };
        });
    }

    // Get recommended modules (chapters not started yet)
    const startedModuleIds = studentProgress?.moduleProgress?.map((mp: any) => mp.moduleId) || [];
    let recommendedModules: any[] = [];
    
    if (youtubeData && youtubeData.Module && youtubeData.Module.length > 0) {
      // Get all available chapters from YouTube data
      const allChapters: any[] = [];
      youtubeData.Module.forEach((module: any, moduleIndex: number) => {
        // Each module item contains one chapter
        const chapterKey = Object.keys(module)[0];
        const chapter = module[chapterKey];
        allChapters.push({
          id: chapterKey, // Use the actual chapter key like "Chapter 1"
          name: chapter.videoTitle,
          subject: `Chapter ${moduleIndex + 1}`,
          description: `Chapter: ${chapterKey}`,
          xpPoints: 100,
          estimatedDuration: '5-10 min',
          videoUrl: chapter.videoUrl
        });
      });
      
      // Filter out chapters that have been started
      recommendedModules = allChapters
        .filter(chapter => !startedModuleIds.includes(chapter.id))
        .slice(0, 6);
    } else {
      // Fallback to Module collection
      const allModules = await Module.find({});
      recommendedModules = allModules
        .filter((module: any) => !startedModuleIds.includes(module._id.toString()))
        .slice(0, 6)
        .map((module: any) => ({
          id: module._id.toString(),
          name: module.title,
          subject: module.subject,
          description: module.description,
          xpPoints: module.points,
          estimatedDuration: module.duration
        }));
    }

    // Get badges earned (from gamification progress)
    const badgesEarned = studentProgress?.moduleProgress?.flatMap((mp: any) => 
      mp.gamificationProgress?.badges || []
    ).map((badge: any) => ({
      badgeId: badge.badgeId,
      name: badge.name,
      description: `Achievement earned through learning progress`,
      earnedAt: badge.earnedAt
    })) || [];

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
    const totalTimeSpent = studentProgress?.moduleProgress?.reduce((sum: number, mp: any) => {
      return sum + (mp.videoProgress?.watchTime || 0);
    }, 0) || 0;

    const dashboardData = {
      overview: {
        totalModules,
        completedModules,
        inProgressModules,
        totalXp,
        averageScore,
        learningStreak: studentProgress?.learningStreak || 0,
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