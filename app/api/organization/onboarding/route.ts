import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    // Connect to MongoDB
    try {
      await connectDB();
    } catch (dbError: unknown) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB Atlas connection.' },
        { status: 500 }
      );
    }

    // Get the JWT token from cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user exists and is an organization
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'organization') {
      return NextResponse.json(
        { error: 'Access denied. Only organizations can access this endpoint.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
      organizationName,
      organizationType,
      industry,
      address,
      city,
      state,
      country,
      phoneNumber,
      website,
      description,
      employeeCount
    } = body;

    // Validate required fields
    const requiredFields = [
      'organizationName',
      'organizationType',
      'industry',
      'address',
      'city',
      'state',
      'country',
      'phoneNumber',
      'employeeCount'
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Check if organization profile already exists
    const existingOrganization = await Organization.findOne({ userId: user._id.toString() });
    
    if (existingOrganization) {
      return NextResponse.json(
        { error: 'Organization profile already exists' },
        { status: 400 }
      );
    }

    // Create organization profile
    const organization = new Organization({
      userId: user._id.toString(),
      organizationName,
      organizationType,
      industry,
      address,
      city,
      state,
      country,
      phoneNumber,
      website: website || undefined,
      description: description || undefined,
      employeeCount,
      onboardingCompleted: true
    });

    await organization.save();

    // Update user profile with organization info
    user.profile = {
      ...user.profile,
      organizationType,
      industry
    };
    user.firstTimeLogin = false;
    await user.save();

    // Generate new JWT token with updated info
    const newToken = jwt.sign(
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
    const response = NextResponse.json(
      { 
        message: 'Organization onboarding completed successfully',
        organization: organization.toJSON()
      },
      { status: 200 }
    );

    // Set updated cookie
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: unknown) {
    console.error('Organization onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 