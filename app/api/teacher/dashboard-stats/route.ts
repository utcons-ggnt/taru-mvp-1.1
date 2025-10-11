import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Module from '@/models/Module';
import AssessmentSession from '@/models/AssessmentSession';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get JWT token from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

            // Verify JWT token
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            let decoded: any;
            try {
              decoded = jwt.verify(token, JWT_SECRET);
            } catch (jwtError) {
              return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
            }

            // Check if user is a teacher
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const teacherId = user._id.toString();

    // Get teacher's students
    const students = await Student.find({ 
      teacherId: teacherId,
      onboardingCompleted: true 
    });

    // Get total students
    const totalStudents = students.length;

    // Get active students (completed at least one module in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeStudents = await Student.find({
      teacherId: teacherId,
      lastActivity: { $gte: thirtyDaysAgo }
    });

    // Calculate average progress
    const totalProgress = students.reduce((sum, student) => {
      return sum + (student.totalModulesCompleted || 0);
    }, 0);
    const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    // Get total assignments (mock data for now)
    const totalAssignments = 8;

    // Calculate average score
    const totalScore = students.reduce((sum, student) => {
      return sum + (student.diagnosticScore || 0);
    }, 0);
    const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

    // Calculate total XP across all students
    const totalXpAcrossStudents = students.reduce((sum, student) => {
      return sum + (student.totalXpEarned || 0);
    }, 0);

    const stats = {
      totalStudents,
      activeStudents: activeStudents.length,
      averageProgress,
      totalAssignments,
      averageScore,
      totalXpAcrossStudents
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching teacher dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}