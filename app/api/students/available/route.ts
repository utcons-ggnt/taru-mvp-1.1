import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Check if user is authenticated (optional for registration flow)
    let isAuthenticated = false;
    let userId: string | null = null;

    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
        userId = decoded.userId;
        isAuthenticated = true;
      } catch {
        // Token is invalid, but we'll still return students for registration
      }
    }

    // If authenticated, verify user is a parent
    if (isAuthenticated) {
      const user = await User.findById(userId);
      if (!user || user.role !== 'parent') {
        return NextResponse.json(
          { error: 'Only parents can access this endpoint' },
          { status: 403 }
        );
      }
    }

    // Find all students who are not already linked to any parent
    const linkedStudentIds = await User.distinct('profile.linkedStudentId', {
      role: 'parent',
      'profile.linkedStudentId': { $exists: true, $ne: null }
    });

    // Get all students who have completed onboarding
    const completedStudents = await Student.find({ 
      onboardingCompleted: true 
    }).select('userId fullName classGrade uniqueId');

    // Get user details for these students
    const studentUserIds = completedStudents.map(s => s.userId);
    const studentUsers = await User.find({
      _id: { $in: studentUserIds },
      role: 'student'
    }).select('_id name email');

    // For authenticated parents, exclude already linked students
    const availableStudentIds = isAuthenticated 
      ? studentUserIds.filter(id => !linkedStudentIds.includes(id.toString()))
      : studentUserIds;

    // Combine student and user data
    const availableStudents = availableStudentIds.map(studentId => {
      const student = completedStudents.find(s => s.userId === studentId);
      const user = studentUsers.find(u => u._id.toString() === studentId);
      
      return {
        id: studentId, // This is the MongoDB ObjectId (userId)
        uniqueId: student?.uniqueId || '', // This is the custom unique ID
        name: student?.fullName || user?.name || 'Unknown',
        email: user?.email || '',
        grade: student?.classGrade || 'Not set'
      };
    });

    console.log('🔍 Available students for parent linking:', {
      totalStudents: completedStudents.length,
      availableCount: availableStudents.length,
      linkedCount: linkedStudentIds.length,
      students: availableStudents.map(s => ({ id: s.id, name: s.name, uniqueId: s.uniqueId }))
    });

    return NextResponse.json(
      { 
        students: availableStudents,
        message: 'Available students retrieved successfully'
      },
      { status: 200 }
    );

  } catch (error: unknown) {
    console.error('Get available students error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 