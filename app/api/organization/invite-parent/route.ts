import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Student from '@/models/Student';
import Invitation from '@/models/Invitation';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || (user.role !== 'organization' && user.role !== 'teacher')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      name,
      studentId,
      studentName
    } = body;

    // Validate required fields
    if (!email || !name || !studentId) {
      return NextResponse.json({ error: 'Email, name, and student ID are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({ 
      email: email.toLowerCase(), 
      status: 'pending' 
    });
    if (existingInvitation) {
      return NextResponse.json({ error: 'Invitation already sent to this email' }, { status: 409 });
    }

    // Verify student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get organization ID
    let organizationId: string;
    if (user.role === 'organization') {
      const organization = await Organization.findOne({ userId: user._id.toString() });
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      organizationId = organization._id.toString();
    } else {
      // For teachers, we need to get the organization from the student's context
      // This would need to be implemented based on your student-organization relationship
      return NextResponse.json({ error: 'Teacher parent invitation not yet implemented' }, { status: 501 });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new Invitation({
      organizationId,
      invitedBy: user._id.toString(),
      inviteType: 'parent',
      email: email.toLowerCase(),
      name,
      token: invitationToken,
      metadata: {
        studentId,
        studentName: studentName || student.fullName
      }
    });

    await invitation.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId,
      action: 'INVITE_PARENT',
      resource: 'Invitation',
      resourceId: invitation._id.toString(),
      details: {
        newValues: { email, name, studentId }
      },
      severity: 'medium'
    });

    // TODO: Send email invitation
    // For now, we'll return the invitation token for testing
    const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/parent?token=${invitationToken}`;

    return NextResponse.json({
      message: 'Parent invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        studentId: invitation.metadata.studentId,
        studentName: invitation.metadata.studentName,
        expiresAt: invitation.expiresAt,
        invitationUrl
      }
    });

  } catch (error) {
    console.error('Error inviting parent:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
