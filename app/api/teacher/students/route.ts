import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';

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

    // Get all students for this teacher (in a real system, you'd have student-teacher relationships)
    // For now, we'll show all students
    const students = await Student.find({ onboardingCompleted: true });
    const studentUserIds = students.map(s => s.userId);
    
    // Get user details for these students
    const studentUsers = await User.find({
      _id: { $in: studentUserIds },
      role: 'student'
    }).select('_id name email createdAt');

    // Get progress for these students
    const progressData = await StudentProgress.find({
      studentId: { $in: studentUserIds }
    });

    // Get assessment data for these students
    const assessments = await Assessment.find({
      userId: { $in: studentUserIds }
    });

    // Combine data
    const studentData = students.map(student => {
      const userInfo = studentUsers.find(u => u._id.toString() === student.userId);
      const progress = progressData.find(p => p.studentId === student.userId);
      const assessment = assessments.find(a => a.userId === student.userId);

      return {
        id: student._id,
        userId: student.userId,
        fullName: student.fullName,
        email: userInfo?.email,
        classGrade: student.classGrade,
        schoolName: student.schoolName,
        uniqueId: student.uniqueId,
        onboardingCompleted: student.onboardingCompleted,
        joinedAt: userInfo?.createdAt,
        // Progress statistics
        totalModulesCompleted: progress?.totalModulesCompleted || 0,
        totalXpEarned: progress?.totalXpEarned || 0,
        learningStreak: progress?.learningStreak || 0,
        badgesEarned: progress?.badgesEarned?.length || 0,
        // Assessment status
        assessmentCompleted: assessment?.assessmentCompleted || false,
        diagnosticCompleted: assessment?.diagnosticCompleted || false,
        diagnosticScore: assessment?.diagnosticScore || 0
      };
    });

    return NextResponse.json({
      students: studentData,
      totalStudents: studentData.length
    });

  } catch (error) {
    console.error('Teacher students fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 