import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';
import StudentProgress from '@/models/StudentProgress';

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

    // Get user and verify they are an admin or organization
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can access this endpoint' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const difficulty = searchParams.get('difficulty');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (subject && subject !== 'all') query.subject = subject;
    if (grade && grade !== 'all') query.grade = grade;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (status && status !== 'all') {
      if (status === 'active') query.isActive = true;
      if (status === 'inactive') query.isActive = false;
    }

    // Get modules with pagination
    const modules = await Module.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalModules = await Module.countDocuments(query);

    // Get module statistics
    const moduleStats = await Module.aggregate([
      {
        $group: {
          _id: null,
          totalModules: { $sum: 1 },
          activeModules: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalPoints: { $sum: '$points' },
          avgDuration: { $avg: '$duration' }
        }
      }
    ]);

    // Get subject breakdown
    const subjectBreakdown = await Module.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    // Get grade breakdown
    const gradeBreakdown = await Module.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } }
    ]);

    // Get difficulty breakdown
    const difficultyBreakdown = await Module.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Get completion statistics for each module
    const moduleIds = modules.map(m => m._id.toString());
    const completionStats = await StudentProgress.aggregate([
      { $unwind: '$moduleProgress' },
      { $match: { 'moduleProgress.moduleId': { $in: moduleIds } } },
      {
        $group: {
          _id: '$moduleProgress.moduleId',
          totalAttempts: { $sum: 1 },
          completedAttempts: { $sum: { $cond: [{ $eq: ['$moduleProgress.status', 'completed'] }, 1, 0] } },
          avgScore: { $avg: '$moduleProgress.score' }
        }
      }
    ]);

    // Enhance modules with completion data
    const enhancedModules = modules.map(module => {
      const moduleObj = module.toJSON();
      const completion = completionStats.find(c => c._id === module._id.toString());
      
      return {
        ...moduleObj,
        completionStats: completion ? {
          totalAttempts: completion.totalAttempts,
          completedAttempts: completion.completedAttempts,
          completionRate: completion.totalAttempts > 0 ? 
            Math.round((completion.completedAttempts / completion.totalAttempts) * 100) : 0,
          avgScore: Math.round(completion.avgScore || 0)
        } : {
          totalAttempts: 0,
          completedAttempts: 0,
          completionRate: 0,
          avgScore: 0
        }
      };
    });

    return NextResponse.json({
      modules: enhancedModules,
      pagination: {
        page,
        limit,
        total: totalModules,
        pages: Math.ceil(totalModules / limit)
      },
      statistics: {
        ...(moduleStats[0] || {
          totalModules: 0,
          activeModules: 0,
          totalPoints: 0,
          avgDuration: 0
        }),
        subjectBreakdown: subjectBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        gradeBreakdown: gradeBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        difficultyBreakdown: difficultyBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Admin modules fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Get user and verify they are an admin or organization
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can create modules' },
        { status: 403 }
      );
    }

    const {
      title,
      subject,
      grade,
      difficulty,
      duration,
      points,
      description,
      content,
      learningObjectives,
      prerequisites,
      tags,
      isActive = true
    } = await request.json();

    // Validate required fields
    if (!title || !subject || !grade || !difficulty) {
      return NextResponse.json(
        { error: 'Title, subject, grade, and difficulty are required' },
        { status: 400 }
      );
    }

    // Generate unique module ID
    const moduleId = `MOD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create new module
    const newModule = new Module({
      moduleId,
      title,
      subject,
      grade,
      difficulty,
      duration: duration || 30,
      points: points || 100,
      description: description || '',
      content: content || '',
      learningObjectives: learningObjectives || [],
      prerequisites: prerequisites || [],
      tags: tags || [],
      isActive,
      createdBy: decoded.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newModule.save();

    return NextResponse.json({
      success: true,
      message: 'Module created successfully',
      module: {
        _id: newModule._id,
        moduleId: newModule.moduleId,
        title: newModule.title,
        subject: newModule.subject,
        grade: newModule.grade,
        difficulty: newModule.difficulty,
        duration: newModule.duration,
        points: newModule.points,
        description: newModule.description,
        isActive: newModule.isActive,
        createdAt: newModule.createdAt
      }
    });

  } catch (error) {
    console.error('Admin module creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Get user and verify they are an admin or organization
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can modify modules' },
        { status: 403 }
      );
    }

    const { moduleId, action, data } = await request.json();

    if (!moduleId || !action) {
      return NextResponse.json(
        { error: 'Module ID and action are required' },
        { status: 400 }
      );
    }

    const targetModule = await Module.findOne({ moduleId });
    if (!targetModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update':
        // Update module fields
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            targetModule[key] = data[key];
          }
        });
        targetModule.updatedAt = new Date();
        await targetModule.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Module updated successfully',
          module: targetModule.toJSON()
        });

      case 'activate':
        targetModule.isActive = true;
        targetModule.updatedAt = new Date();
        await targetModule.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Module activated successfully' 
        });

      case 'deactivate':
        targetModule.isActive = false;
        targetModule.updatedAt = new Date();
        await targetModule.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Module deactivated successfully' 
        });

      case 'duplicate':
        const duplicatedModule = new Module({
          ...targetModule.toObject(),
          _id: undefined,
          moduleId: `MOD${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          title: `${targetModule.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        await duplicatedModule.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Module duplicated successfully',
          module: duplicatedModule.toJSON()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin module update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get user and verify they are an admin or organization
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete modules' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    const targetModule = await Module.findOne({ moduleId });
    if (!targetModule) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Delete the module
    await Module.findOneAndDelete({ moduleId });

    return NextResponse.json({ 
      success: true, 
      message: 'Module deleted successfully' 
    });

  } catch (error) {
    console.error('Admin module delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
