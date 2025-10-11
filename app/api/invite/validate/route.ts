import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invitation from '@/models/Invitation';
import Branch from '@/models/Branch';
import Organization from '@/models/Organization';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
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

    // Get additional details
    let branchDetails = null;
    let organizationDetails = null;

    if (invitation.branchId) {
      branchDetails = await Branch.findById(invitation.branchId);
    }

    if (invitation.organizationId) {
      organizationDetails = await Organization.findById(invitation.organizationId);
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        id: invitation._id,
        email: invitation.email,
        name: invitation.name,
        inviteType: invitation.inviteType,
        expiresAt: invitation.expiresAt,
        metadata: invitation.metadata
      },
      branch: branchDetails,
      organization: organizationDetails
    });

  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
