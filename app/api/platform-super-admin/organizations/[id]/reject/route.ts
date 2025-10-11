import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'platform_super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rejectionReason } = body;

    if (!rejectionReason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    const organization = await Organization.findById(id);

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    if (organization.approvalStatus !== 'pending') {
      return NextResponse.json({ error: 'Organization is not pending approval' }, { status: 400 });
    }

    // Update organization status
    organization.approvalStatus = 'rejected';
    organization.rejectionReason = rejectionReason;
    await organization.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      action: 'REJECT_ORGANIZATION',
      resource: 'Organization',
      resourceId: organization._id.toString(),
      details: {
        newValues: { 
          approvalStatus: 'rejected',
          rejectionReason
        }
      },
      severity: 'high'
    });

    // TODO: Send rejection email to organization

    return NextResponse.json({
      message: 'Organization rejected successfully',
      organization: {
        id: organization._id,
        organizationName: organization.organizationName,
        approvalStatus: organization.approvalStatus,
        rejectionReason: organization.rejectionReason
      }
    });

  } catch (error) {
    console.error('Error rejecting organization:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
