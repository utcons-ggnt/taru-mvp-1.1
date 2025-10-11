import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'organization') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = await Organization.findOne({ userId: user._id.toString() });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'overview';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.$lte = new Date(endDate);
    }

    let reportData: any = {};

    switch (reportType) {
      case 'overview':
        // Get organization overview
        const totalBranches = await Branch.countDocuments({ 
          organizationId: organization._id.toString(),
          isActive: true 
        });

        const totalTeachers = await Teacher.countDocuments({ 
          schoolId: { $in: await Branch.find({ organizationId: organization._id.toString() }).distinct('_id') },
          isActive: true 
        });

        const totalStudents = await Student.countDocuments({ 
          onboardingCompleted: true 
        });

        const recentActivity = await AuditLog.find({
          organizationId: organization._id.toString(),
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .limit(10);

        reportData = {
          totalBranches,
          totalTeachers,
          totalStudents,
          recentActivity
        };
        break;

      case 'teachers':
        // Get teacher performance report
        const teachers = await Teacher.find({ 
          schoolId: { $in: await Branch.find({ organizationId: organization._id.toString() }).distinct('_id') },
          isActive: true 
        })
        .populate('userId', 'name email createdAt')
        .sort({ createdAt: -1 });

        const teacherStats = await Promise.all(teachers.map(async (teacher) => {
          const students = await Student.find({ teacherId: teacher.userId.toString() });
          return {
            id: teacher._id.toString(),
            name: teacher.fullName,
            email: teacher.email,
            subjectSpecialization: teacher.subjectSpecialization,
            experienceYears: teacher.experienceYears,
            totalStudents: students.length,
            activeStudents: students.filter(s => s.onboardingCompleted).length,
            joinedAt: teacher.createdAt
          };
        }));

        reportData = {
          teachers: teacherStats,
          totalTeachers: teachers.length
        };
        break;

      case 'students':
        // Get student performance report
        const teacherIds = await Teacher.find({ 
          schoolId: { $in: await Branch.find({ organizationId: organization._id.toString() }).distinct('_id') }
        }).distinct('userId');

        const students = await Student.find({ 
          teacherId: { $in: teacherIds },
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 });

        const studentStats = students.map(student => ({
          id: student._id.toString(),
          name: student.fullName,
          email: student.email,
          classGrade: student.classGrade,
          schoolName: student.schoolName,
          onboardingCompleted: student.onboardingCompleted,
          totalModulesCompleted: student.totalModulesCompleted || 0,
          totalXpEarned: student.totalXpEarned || 0,
          learningStreak: student.learningStreak || 0,
          joinedAt: student.createdAt
        }));

        reportData = {
          students: studentStats,
          totalStudents: students.length,
          activeStudents: students.filter(s => s.onboardingCompleted).length
        };
        break;

      case 'activity':
        // Get activity report
        const activityLogs = await AuditLog.find({
          organizationId: organization._id.toString(),
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 });

        const activityStats = {
          totalActivities: activityLogs.length,
          activitiesByType: await AuditLog.aggregate([
            { $match: { organizationId: organization._id.toString() } },
            { $group: { _id: '$action', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]),
          recentActivities: activityLogs.slice(0, 20)
        };

        reportData = activityStats;
        break;

      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return NextResponse.json({
      reportType,
      organization: {
        id: organization._id.toString(),
        name: organization.organizationName,
        type: organization.organizationType
      },
      generatedAt: new Date().toISOString(),
      data: reportData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}