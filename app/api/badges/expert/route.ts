import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import StudentProgress from '@/models/StudentProgress';
import LearningPath from '@/models/LearningPath';

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

    // Verify user is a student
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can receive expert badges' },
        { status: 403 }
      );
    }

    const { learningPathId } = await request.json();

    // Get student progress
    const progress = await StudentProgress.findOne({ userId: decoded.userId });
    if (!progress) {
      return NextResponse.json(
        { error: 'Student progress not found' },
        { status: 404 }
      );
    }

    // Get learning path
    const learningPath = await LearningPath.findOne({ pathId: learningPathId });
    if (!learningPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Check if all modules in the learning path are completed
    const allModules = learningPath.milestones.flatMap((milestone: any) => milestone.modules);
    const completedModules = progress.moduleProgress.filter((mp: any) => mp.completedAt);
    const completedModuleIds = completedModules.map((mp: any) => mp.moduleId);

    const allModulesCompleted = allModules.every((moduleId: string) => 
      completedModuleIds.includes(moduleId)
    );

    if (!allModulesCompleted) {
      return NextResponse.json({
        success: false,
        message: 'Not all modules completed yet',
        progress: {
          completed: completedModuleIds.length,
          total: allModules.length,
          remaining: allModules.filter((id: string) => !completedModuleIds.includes(id))
        }
      });
    }

    // Check if expert badge already exists
    const existingExpertBadge = progress.gamificationProgress?.badges?.find((b: any) => 
      b.name.includes('Expert') && b.learningPathId === learningPathId
    );

    if (existingExpertBadge) {
      return NextResponse.json({
        success: false,
        message: 'Expert badge already awarded for this learning path',
        badge: existingExpertBadge
      });
    }

    // Award expert badge
    const expertBadge = {
      badgeId: `expert_${learningPathId}_${Date.now()}`,
      name: `${learningPath.name} Expert`,
      description: `Successfully completed all modules in ${learningPath.name} learning path`,
      earnedAt: new Date(),
      icon: '👑',
      learningPathId,
      learningPathName: learningPath.name,
      completedModules: completedModuleIds.length,
      totalModules: allModules.length
    };

    // Initialize gamification progress if not exists
    if (!progress.gamificationProgress) {
      progress.gamificationProgress = {
        quests: [],
        badges: [],
        streaks: {
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: new Date()
        },
        leaderboardPoints: 0
      };
    }

    // Add expert badge
    progress.gamificationProgress.badges.push(expertBadge);
    progress.gamificationProgress.leaderboardPoints += 500; // Bonus points for expert badge

    // Update learning path progress
    const pathProgress = progress.pathProgress?.find((pp: any) => pp.pathId === learningPathId);
    if (pathProgress) {
      pathProgress.status = 'completed';
      pathProgress.progress = 100;
      pathProgress.completedAt = new Date();
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      message: 'Expert badge awarded successfully!',
      badge: expertBadge,
      metadata: {
        awardedAt: new Date().toISOString(),
        studentId: decoded.userId,
        learningPathId,
        learningPathName: learningPath.name
      }
    });

  } catch (error) {
    console.error('Expert badge award error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
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

    // Get student progress
    const progress = await StudentProgress.findOne({ userId: decoded.userId });
    if (!progress) {
      return NextResponse.json({
        expertBadges: [],
        progress: []
      });
    }

    // Get all learning paths
    const learningPaths = await LearningPath.find({ isActive: true });

    // Check progress for each learning path
    const pathProgress = learningPaths.map((path: any) => {
      const allModules = path.milestones.flatMap((milestone: any) => milestone.modules);
      const completedModules = progress.moduleProgress?.filter((mp: any) => mp.completedAt) || [];
      const completedModuleIds = completedModules.map((mp: any) => mp.moduleId);
      
      const completedCount = allModules.filter((moduleId: string) => 
        completedModuleIds.includes(moduleId)
      ).length;

      const expertBadge = progress.gamificationProgress?.badges?.find((b: any) => 
        b.name.includes('Expert') && b.learningPathId === path.pathId
      );

      return {
        pathId: path.pathId,
        pathName: path.name,
        totalModules: allModules.length,
        completedModules: completedCount,
        progress: Math.round((completedCount / allModules.length) * 100),
        expertBadgeAwarded: !!expertBadge,
        expertBadge: expertBadge || null,
        canAwardExpertBadge: completedCount === allModules.length && !expertBadge
      };
    });

    return NextResponse.json({
      expertBadges: progress.gamificationProgress?.badges?.filter((b: any) => 
        b.name.includes('Expert')
      ) || [],
      progress: pathProgress
    });

  } catch (error) {
    console.error('Get expert badges error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 