import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';
import StudentProgress from '@/models/StudentProgress';

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
  contentProgress?: Array<{
    contentId: string;
    status: string;
    score: number;
    timeSpent: number;
  }>;
  [key: string]: unknown;
}

interface Badge {
  name: string;
  description: string;
  [key: string]: unknown;
}

export async function GET(
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
        { error: 'Only students can access modules' },
        { status: 403 }
      );
    }

    // Get module
    const foundModule = await Module.findOne({ moduleId: id, isActive: true });
    if (!foundModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Get student progress for this module
    const progress = await StudentProgress.findOne({ userId: decoded.userId });
    const moduleProgress = progress?.moduleProgress?.find((mp: ModuleProgress) => mp.moduleId === id);

    return NextResponse.json({
      module: foundModule.toJSON(),
      progress: moduleProgress || {
        status: 'not-started',
        progress: 0,
        xpEarned: 0
      }
    });

  } catch (error) {
    console.error('Get module error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { action, contentId, score, timeSpent } = await request.json();
    
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
        { error: 'Only students can update module progress' },
        { status: 403 }
      );
    }

    // Get module
    const foundModule = await Module.findOne({ moduleId: id, isActive: true });
    if (!foundModule) {
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

    // Find or create module progress
    let moduleProgress = progress.moduleProgress.find((mp: ModuleProgress) => mp.moduleId === id);
    if (!moduleProgress) {
      moduleProgress = {
        moduleId: id,
        status: 'in-progress',
        progress: 0,
        startedAt: new Date(),
        xpEarned: 0,
        contentProgress: []
      };
      progress.moduleProgress.push(moduleProgress);
    }

    // Handle different actions
    switch (action) {
      case 'update_content_progress':
        if (!contentId) {
          return NextResponse.json(
            { error: 'Content ID required for content progress update' },
            { status: 400 }
          );
        }
        
        // Update content progress
        let contentProgress = moduleProgress.contentProgress?.find((cp: { contentId: string; status: string; score: number; timeSpent: number }) => cp.contentId === contentId);
        if (!contentProgress) {
          contentProgress = {
            contentId,
            status: 'in-progress',
            score: score || 0,
            timeSpent: timeSpent || 0
          };
          if (!moduleProgress.contentProgress) {
            moduleProgress.contentProgress = [];
          }
          moduleProgress.contentProgress.push(contentProgress);
        } else {
          contentProgress.status = 'completed';
          contentProgress.score = score || contentProgress.score;
          contentProgress.timeSpent = timeSpent || contentProgress.timeSpent;
        }
        break;

      case 'complete_module':
        moduleProgress.status = 'completed';
        moduleProgress.completedAt = new Date();
        moduleProgress.progress = 100;
        moduleProgress.xpEarned = foundModule.xpPoints;
        
        // Update overall statistics
        progress.totalXpEarned += foundModule.xpPoints;
        progress.totalModulesCompleted += 1;
        progress.totalTimeSpent += timeSpent || 0;
        
        // Check for badges
        if (foundModule.badges && foundModule.badges.length > 0) {
          foundModule.badges.forEach((badge: Badge) => {
            const existingBadge = progress.badgesEarned.find((b: { badgeId: string; name: string; description: string; earnedAt: Date }) => b.badgeId === badge.name);
            if (!existingBadge) {
              progress.badgesEarned.push({
                badgeId: badge.name,
                name: badge.name,
                description: badge.description,
                earnedAt: new Date()
              });
            }
          });
        }
        break;

      case 'update_progress':
        const newProgress = Math.min(100, Math.max(0, score || 0));
        moduleProgress.progress = newProgress;
        if (newProgress >= 100) {
          moduleProgress.status = 'completed';
          moduleProgress.completedAt = new Date();
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be one of: update_content_progress, complete_module, update_progress' },
          { status: 400 }
        );
    }

    await progress.save();

    return NextResponse.json({
      success: true,
      message: 'Module progress updated successfully',
      progress: moduleProgress,
      totalXp: progress.totalXpEarned,
      totalModulesCompleted: progress.totalModulesCompleted
    });

  } catch (error) {
    console.error('Update module progress error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 