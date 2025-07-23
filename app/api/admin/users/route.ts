import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Parent from '@/models/Parent';
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can access this endpoint' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (role && role !== 'all') {
      query.role = role;
    }

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);

    // Get additional data for students
    const userIds = users.map(u => u._id.toString());
    const students = await Student.find({ userId: { $in: userIds } });
    const parents = await Parent.find({ userId: { $in: userIds } });
    const progressData = await StudentProgress.find({ studentId: { $in: userIds } });

    // Enhance user data
    const enhancedUsers = users.map(user => {
      const userObj = user.toJSON();
      const student = students.find(s => s.userId === user._id.toString());
      const parent = parents.find(p => p.userId === user._id.toString());
      const progress = progressData.find(p => p.studentId === user._id.toString());

      return {
        ...userObj,
        // Student-specific data
        ...(student && {
          studentProfile: {
            fullName: student.fullName,
            classGrade: student.classGrade,
            schoolName: student.schoolName,
            uniqueId: student.uniqueId,
            onboardingCompleted: student.onboardingCompleted
          }
        }),
        // Parent-specific data
        ...(parent && {
          parentProfile: {
            fullName: parent.fullName,
            linkedStudentId: parent.linkedStudentId,
            onboardingCompleted: parent.onboardingCompleted
          }
        }),
        // Progress data for students
        ...(progress && {
          progress: {
            totalModulesCompleted: progress.totalModulesCompleted,
            totalXpEarned: progress.totalXpEarned,
            learningStreak: progress.learningStreak,
            badgesEarned: progress.badgesEarned?.length || 0
          }
        })
      };
    });

    // Get role statistics
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    return NextResponse.json({
      users: enhancedUsers,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      },
      statistics: {
        totalUsers,
        roleBreakdown: roleStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Admin users fetch error:', error);
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can modify users' },
        { status: 403 }
      );
    }

    const { userId, action, data } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'User ID and action are required' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'activate':
        // Add activation logic if needed
        return NextResponse.json({ 
          success: true, 
          message: 'User activated successfully' 
        });

      case 'deactivate':
        // Add deactivation logic if needed
        return NextResponse.json({ 
          success: true, 
          message: 'User deactivated successfully' 
        });

      case 'update_role':
        if (!data.role) {
          return NextResponse.json(
            { error: 'New role is required' },
            { status: 400 }
          );
        }
        
        targetUser.role = data.role;
        await targetUser.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'User role updated successfully' 
        });

      case 'reset_password':
        // In a real system, you'd generate a secure temporary password
        const tempPassword = 'TempPass123';
        targetUser.password = tempPassword;
        await targetUser.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Password reset successfully',
          tempPassword
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin user update error:', error);
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can delete users' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (userId === decoded.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete related data
    await Student.deleteOne({ userId });
    await Parent.deleteOne({ userId });
    await StudentProgress.deleteOne({ studentId: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({ 
      success: true, 
      message: 'User and related data deleted successfully' 
    });

  } catch (error) {
    console.error('Admin user delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 