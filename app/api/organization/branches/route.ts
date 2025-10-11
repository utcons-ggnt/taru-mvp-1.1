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

// GET - List all branches for an organization
export async function GET(request: NextRequest) {
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

    // Get organization ID
    let organizationId: string;
    if (user.role === 'platform_super_admin') {
      // PSA can view all organizations
      const { orgId } = Object.fromEntries(request.nextUrl.searchParams);
      if (!orgId) {
        return NextResponse.json({ error: 'Organization ID required for PSA' }, { status: 400 });
      }
      organizationId = orgId;
    } else {
      // Organization admin can only view their own branches
      const organization = await Organization.findOne({ userId: user._id.toString() });
      if (!organization) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
      }
      organizationId = organization._id.toString();
    }

    const branches = await Branch.find({ organizationId, isActive: true })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      branches,
      totalBranches: branches.length
    });

  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new branch
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
      return NextResponse.json({ error: 'Organization must be approved to create branches' }, { status: 403 });
    }

    const body = await request.json();
    const {
      branchName,
      branchCode,
      address,
      city,
      state,
      country,
      phoneNumber,
      email,
      principalName,
      principalEmail,
      principalPhone
    } = body;

    // Validate required fields
    const requiredFields = [
      'branchName', 'branchCode', 'address', 'city', 'state', 'country',
      'phoneNumber', 'email', 'principalName', 'principalEmail', 'principalPhone'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 });
      }
    }

    // Check if branch code already exists
    const existingBranch = await Branch.findOne({ branchCode });
    if (existingBranch) {
      return NextResponse.json({ error: 'Branch code already exists' }, { status: 409 });
    }

    // Create new branch
    const branch = new Branch({
      organizationId: organization._id.toString(),
      branchName,
      branchCode,
      address,
      city,
      state,
      country,
      phoneNumber,
      email,
      principalName,
      principalEmail,
      principalPhone
    });

    await branch.save();

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      organizationId: organization._id.toString(),
      action: 'CREATE_BRANCH',
      resource: 'Branch',
      resourceId: branch._id.toString(),
      details: {
        newValues: { branchName, branchCode, city, state }
      },
      severity: 'medium'
    });

    return NextResponse.json({
      message: 'Branch created successfully',
      branch
    });

  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
