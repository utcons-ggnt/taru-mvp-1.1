import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
import Teacher from '@/models/Teacher';
import Parent from '@/models/Parent';
import Invitation from '@/models/Invitation';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { token, password, name } = body;

    if (!token || !password || !name) {
      return NextResponse.json({ error: 'Token, password, and name are required' }, { status: 400 });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userRole = invitation.inviteType === 'teacher' ? 'teacher' : 'parent';
    const user = new User({
      name,
      email: invitation.email,
      password: hashedPassword,
      role: userRole,
      firstTimeLogin: false
    });

    await user.save();

    // Create role-specific profile
    if (invitation.inviteType === 'teacher') {
      const branch = await Branch.findById(invitation.branchId);
      if (!branch) {
        return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
      }

      const teacher = new Teacher({
        userId: user._id.toString(),
        fullName: name,
        email: invitation.email,
        phoneNumber: '',
        subjectSpecialization: invitation.metadata.subjectSpecialization || '',
        experienceYears: invitation.metadata.experienceYears || 0,
        qualification: 'Bachelor\'s Degree',
        schoolName: branch.branchName,
        schoolId: branch._id.toString(),
        gradeLevels: invitation.metadata.gradeLevels || [],
        subjects: invitation.metadata.subjects || [],
        bio: `Teacher at ${branch.branchName}`,
        onboardingCompleted: true,
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          weeklyReports: true,
          studentProgressAlerts: true
        }
      });

      await teacher.save();
    } else if (invitation.inviteType === 'parent') {
      const parent = new Parent({
        userId: user._id.toString(),
        fullName: name,
        email: invitation.email,
        phoneNumber: '',
        linkedStudentId: invitation.metadata.studentId,
        linkedStudentUniqueId: invitation.metadata.studentId, // This should be the student's unique ID
        onboardingCompleted: true,
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          weeklyReports: true,
          studentProgressAlerts: true
        }
      });

      await parent.save();

      // Update user profile with linked student info
      user.profile = {
        ...user.profile,
        linkedStudentId: invitation.metadata.studentId,
        linkedStudentUniqueId: invitation.metadata.studentId
      };
      await user.save();
    }

    // Update invitation status
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = user._id.toString();
    await invitation.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: invitation.organizationId,
      branchId: invitation.branchId,
      action: 'ACCEPT_INVITATION',
      resource: 'Invitation',
      resourceId: invitation._id.toString(),
      details: {
        newValues: { inviteType: invitation.inviteType, email: invitation.email }
      },
      severity: 'medium'
    });

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        fullName: user.name,
        role: user.role,
        firstTimeLogin: false,
        requiresOnboarding: false,
        requiresAssessment: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Create response
    const response = NextResponse.json({
      message: 'Invitation accepted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    // Set auth cookie
    response.cookies.set('auth-token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
