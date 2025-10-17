import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

// GET - Fetch organization and user settings
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

    // Return both user and organization details
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile || {},
        createdAt: user.createdAt,
        isActive: user.isActive
      },
      organization: {
        id: organization._id.toString(),
        name: organization.name,
        type: organization.type,
        description: organization.description,
        contactEmail: organization.contactEmail,
        contactPhone: organization.contactPhone,
        website: organization.website,
        address: organization.address,
        city: organization.city,
        state: organization.state,
        country: organization.country,
        approvalStatus: organization.approvalStatus,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update organization settings
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const {
      name,
      type,
      description,
      contactEmail,
      contactPhone,
      website,
      address,
      city,
      state,
      country
    } = body;

    // Update organization details
    const updatedOrganization = await Organization.findByIdAndUpdate(
      organization._id,
      {
        name: name || organization.name,
        type: type || organization.type,
        description: description || organization.description,
        contactEmail: contactEmail || organization.contactEmail,
        contactPhone: contactPhone || organization.contactPhone,
        website: website || organization.website,
        address: address || organization.address,
        city: city || organization.city,
        state: state || organization.state,
        country: country || organization.country,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    // Update user details if provided
    if (body.userName || body.userEmail) {
      await User.findByIdAndUpdate(
        user._id,
        {
          name: body.userName || user.name,
          email: body.userEmail || user.email
        },
        { new: true, runValidators: true }
      );
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      organization: {
        id: updatedOrganization._id.toString(),
        name: updatedOrganization.name,
        type: updatedOrganization.type,
        description: updatedOrganization.description,
        contactEmail: updatedOrganization.contactEmail,
        contactPhone: updatedOrganization.contactPhone,
        website: updatedOrganization.website,
        address: updatedOrganization.address,
        city: updatedOrganization.city,
        state: updatedOrganization.state,
        country: updatedOrganization.country,
        updatedAt: updatedOrganization.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating organization settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
