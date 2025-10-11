import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

// GET - Get specific branch details
export async function GET(
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
    
    if (!user || (user.role !== 'organization' && user.role !== 'platform_super_admin')) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Check if user has access to this branch
    if (user.role === 'organization') {
      const organization = await Organization.findOne({ userId: user._id.toString() });
      if (!organization || branch.organizationId !== organization._id.toString()) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return NextResponse.json({ branch });

  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update branch
export async function PUT(
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
    
    if (!user || user.role !== 'organization') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Check if user owns this branch
    const organization = await Organization.findOne({ userId: user._id.toString() });
    if (!organization || branch.organizationId !== organization._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const oldValues = {
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
    };

    // Update branch fields
    Object.keys(body).forEach(key => {
      if (body[key] !== undefined && branch.schema.paths[key]) {
        branch[key] = body[key];
      }
    });

    await branch.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      branchId: branch._id.toString(),
      action: 'UPDATE_BRANCH',
      resource: 'Branch',
      resourceId: branch._id.toString(),
      details: {
        oldValues,
        newValues: body
      },
      severity: 'medium'
    });

    return NextResponse.json({
      message: 'Branch updated successfully',
      branch
    });

  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete branch (soft delete)
export async function DELETE(
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
    
    if (!user || user.role !== 'organization') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const branch = await Branch.findById(id);

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Check if user owns this branch
    const organization = await Organization.findOne({ userId: user._id.toString() });
    if (!organization || branch.organizationId !== organization._id.toString()) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Soft delete by setting isActive to false
    branch.isActive = false;
    await branch.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      branchId: branch._id.toString(),
      action: 'DELETE_BRANCH',
      resource: 'Branch',
      resourceId: branch._id.toString(),
      details: {
        oldValues: { isActive: true },
        newValues: { isActive: false }
      },
      severity: 'high'
    });

    return NextResponse.json({
      message: 'Branch deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
