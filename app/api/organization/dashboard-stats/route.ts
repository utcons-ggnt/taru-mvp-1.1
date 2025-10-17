import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import Invitation from '@/models/Invitation';

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

    // Get branch statistics
    const totalBranches = await Branch.countDocuments({ 
      organizationId: organization._id.toString(),
      isActive: true 
    });

    // Get teacher statistics
    const totalTeachers = await Teacher.countDocuments({ 
      schoolId: { $in: await Branch.find({ organizationId: organization._id.toString() }).distinct('_id') },
      isActive: true 
    });

    // Get student statistics (students from this organization)
    const totalStudents = await Student.countDocuments({ 
      organizationId: organization._id.toString()
    });

    // Get active students (completed onboarding)
    const activeStudents = await Student.countDocuments({ 
      organizationId: organization._id.toString(),
      onboardingCompleted: true
    });

    // Get pending students (not completed onboarding)
    const pendingStudents = await Student.countDocuments({ 
      organizationId: organization._id.toString(),
      onboardingCompleted: false
    });

    // Get students who completed assessments
    const studentsWithAssessments = await Student.countDocuments({ 
      organizationId: organization._id.toString(),
      assessmentCompleted: true
    });

    // Get students who completed diagnostic
    const studentsWithDiagnostic = await Student.countDocuments({ 
      organizationId: organization._id.toString(),
      diagnosticCompleted: true
    });

    // Get pending invitations
    const pendingInvitations = await Invitation.countDocuments({
      organizationId: organization._id.toString(),
      status: 'pending'
    });

    // Calculate completion rates
    const assessmentCompletionRate = totalStudents > 0 ? Math.round((studentsWithAssessments / totalStudents) * 100) : 0;
    const diagnosticCompletionRate = totalStudents > 0 ? Math.round((studentsWithDiagnostic / totalStudents) * 100) : 0;

    return NextResponse.json({
      totalBranches,
      totalTeachers,
      totalStudents,
      activeStudents,
      pendingStudents,
      studentsWithAssessments,
      studentsWithDiagnostic,
      assessmentCompletionRate,
      diagnosticCompletionRate,
      pendingInvitations
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
