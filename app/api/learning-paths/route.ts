import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LearningPath from '@/models/LearningPath';
import StudentProgress from '@/models/StudentProgress';

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
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access learning paths' },
        { status: 403 }
      );
    }

    // Get all active learning paths
    const learningPaths = await LearningPath.find({ isActive: true });
    
    // Get student progress
    const progress = await StudentProgress.findOne({ userId: decoded.userId });

    // Update path progress with student data
    const pathsWithProgress = learningPaths.map(path => {
      const pathProgress = progress?.pathProgress?.find((pp: any) => pp.pathId === path.pathId);
      
      if (pathProgress) {
        // Update milestone status based on progress
        const updatedMilestones = path.milestones.map((milestone: any) => {
          const milestoneProgress = pathProgress.milestoneProgress?.find((mp: any) => mp.milestoneId === milestone.milestoneId);
          return {
            ...milestone.toObject(),
            status: milestoneProgress?.status || 'locked',
            progress: milestoneProgress?.progress || 0
          };
        });

        return {
          ...path.toObject(),
          milestones: updatedMilestones,
          status: pathProgress.status,
          progress: pathProgress.progress
        };
      }

      return path.toObject();
    });

    return NextResponse.json({
      paths: pathsWithProgress
    });

  } catch (error) {
    console.error('Get learning paths error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 