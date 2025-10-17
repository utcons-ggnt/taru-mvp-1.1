import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Teacher from '@/models/Teacher';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // Find the teacher and verify they belong to this organization
    const teacher = await Teacher.findOne({ 
      _id: teacherId,
      organizationId: organization._id.toString()
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found or access denied' }, { status: 404 });
    }

    // Get teacher details for audit log
    const teacherUser = await User.findById(teacher.userId);
    const teacherDetails = {
      fullName: teacher.fullName,
      email: teacher.email,
      subjectSpecialization: teacher.subjectSpecialization,
      schoolName: teacher.schoolName
    };

    // Deactivate the teacher instead of deleting (soft delete)
    teacher.isActive = false;
    await teacher.save();

    // Also deactivate the user account
    if (teacherUser) {
      teacherUser.isActive = false;
      await teacherUser.save();
    }

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      branchId: teacher.branchId,
      action: 'REMOVE_TEACHER',
      resource: 'Teacher',
      resourceId: teacher._id.toString(),
      details: {
        removedValues: teacherDetails
      },
      severity: 'high'
    });

    return NextResponse.json({
      message: 'Teacher removed successfully',
      teacher: {
        id: teacher._id.toString(),
        fullName: teacher.fullName,
        email: teacher.email,
        isActive: false
      }
    });

  } catch (error) {
    console.error('Error removing teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
