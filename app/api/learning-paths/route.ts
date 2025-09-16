import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LearningPath from '@/models/LearningPath';
import LearningPathResponse from '@/models/LearningPathResponse';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

interface PathProgress {
  pathId: string;
  status: string;
  progress: number;
  milestoneProgress?: Array<{
    milestoneId: string;
    status: string;
    progress: number;
  }>;
}

interface Milestone {
  milestoneId: string;
  toObject?: () => Record<string, unknown>;
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access learning paths' },
        { status: 403 }
      );
    }

    // Get studentId from query params
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (studentId) {
      // Get learning paths for specific student from learning-path-responses collection
      const learningPathResponses = await LearningPathResponse.find({ 
        uniqueid: studentId 
      }).sort({ updatedAt: -1 });

      // Transform the data to match the expected format
      const learningPaths = learningPathResponses.map(response => ({
        _id: response._id,
        studentId: response.uniqueid,
        careerPath: response.output.greeting?.replace(/^Hi\s+[^!]+!\s*/, '') || 'Career Path', // Extract career from greeting
        description: response.output.overview?.join(' ') || 'Learning path description',
        learningModules: response.output.learningPath || [],
        timeRequired: response.output.timeRequired || 'Not specified',
        focusAreas: response.output.focusAreas || [],
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      }));

      return NextResponse.json({
        learningPaths: learningPaths
      });
    } else {
      // Get all active learning paths (original functionality)
      const learningPaths = await LearningPath.find({ isActive: true });
      
      // Get student progress
      const progress = await StudentProgress.findOne({ userId: decoded.userId });

      // Update path progress with student data
      const pathsWithProgress = learningPaths.map(path => {
        const pathProgress = progress?.pathProgress?.find((pp: PathProgress) => pp.pathId === path.pathId);
        
        if (pathProgress) {
          // Update milestone status based on progress
          const updatedMilestones = path.milestones.map((milestone: Milestone) => {
            const milestoneProgress = pathProgress.milestoneProgress?.find((mp: { milestoneId: string }) => mp.milestoneId === milestone.milestoneId);
            return {
              ...(milestone.toObject ? milestone.toObject() : milestone),
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
    }

  } catch (error) {
    console.error('Get learning paths error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 