import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';

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
    
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get linked student
    const studentId = user.profile?.linkedStudentId;
    if (!studentId) {
      return NextResponse.json({ error: 'No linked student found' }, { status: 404 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get student's teachers
    const teachers = await Teacher.find({ 
      schoolId: student.schoolId,
      isActive: true 
    });

    // Get organization and branch details
    let organization = null;
    let branch = null;

    if (student.schoolId) {
      branch = await Branch.findById(student.schoolId);
      if (branch) {
        organization = await Organization.findById(branch.organizationId);
      }
    }

    return NextResponse.json({
      student: {
        id: student._id,
        fullName: student.fullName,
        email: student.email,
        classGrade: student.classGrade,
        schoolName: student.schoolName,
        uniqueId: student.uniqueId,
        onboardingCompleted: student.onboardingCompleted,
        isActive: student.isActive
      },
      teachers: teachers.map(teacher => ({
        id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email,
        subjectSpecialization: teacher.subjectSpecialization,
        experienceYears: teacher.experienceYears,
        phoneNumber: teacher.phoneNumber
      })),
      organization: organization ? {
        id: organization._id,
        organizationName: organization.organizationName,
        organizationType: organization.organizationType,
        industry: organization.industry,
        address: organization.address,
        city: organization.city,
        state: organization.state,
        phoneNumber: organization.phoneNumber,
        website: organization.website
      } : null,
      branch: branch ? {
        id: branch._id,
        branchName: branch.branchName,
        branchCode: branch.branchCode,
        address: branch.address,
        city: branch.city,
        state: branch.state,
        phoneNumber: branch.phoneNumber,
        email: branch.email,
        principalName: branch.principalName,
        principalEmail: branch.principalEmail,
        principalPhone: branch.principalPhone
      } : null
    });

  } catch (error) {
    console.error('Error fetching child details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
