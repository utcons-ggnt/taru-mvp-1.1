import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
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
    
    if (!user || user.role !== 'organization') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = await Organization.findOne({ userId: user._id.toString() });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (organization.approvalStatus !== 'approved') {
      return NextResponse.json({ error: 'Organization must be approved to invite teachers' }, { status: 403 });
    }

    const body = await request.json();
    const {
      email,
      name,
      branchId,
      subjectSpecialization,
      experienceYears,
      gradeLevels,
      subjects
    } = body;

    // Validate required fields
    if (!email || !name || !branchId) {
      return NextResponse.json({ error: 'Email, name, and branch ID are required' }, { status: 400 });
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

    // Verify branch belongs to organization
    const branch = await Branch.findById(branchId);
    if (!branch || branch.organizationId !== organization._id.toString()) {
      return NextResponse.json({ error: 'Branch not found or access denied' }, { status: 404 });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new Invitation({
      organizationId: organization._id.toString(),
      branchId,
      invitedBy: user._id.toString(),
      inviteType: 'teacher',
      email: email.toLowerCase(),
      name,
      token: invitationToken,
      metadata: {
        subjectSpecialization,
        experienceYears,
        gradeLevels,
        subjects
      }
    });

    await invitation.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      branchId,
      action: 'INVITE_TEACHER',
      resource: 'Invitation',
      resourceId: invitation._id.toString(),
      details: {
        newValues: { email, name, branchId, subjectSpecialization }
      },
      severity: 'medium'
    });

    // TODO: Send email invitation
    // For now, we'll return the invitation token for testing
    const invitationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/invite/teacher?token=${invitationToken}`;

    return NextResponse.json({
      message: 'Teacher invitation sent successfully',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        branchId: invitation.branchId,
        expiresAt: invitation.expiresAt,
        invitationUrl
      }
    });

  } catch (error) {
    console.error('Error inviting teacher:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
