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

    // Get student statistics (students linked to teachers in this organization)
    const teacherIds = await Teacher.find({ 
      schoolId: { $in: await Branch.find({ organizationId: organization._id.toString() }).distinct('_id') }
    }).distinct('userId');
    
    const totalStudents = await Student.countDocuments({ 
      onboardingCompleted: true 
    });

    // Get pending invitations
    const pendingInvitations = await Invitation.countDocuments({
      organizationId: organization._id.toString(),
      status: 'pending'
    });

    return NextResponse.json({
      totalBranches,
      totalTeachers,
      totalStudents,
      pendingInvitations
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
