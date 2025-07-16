import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Parent from '@/models/Parent';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Verify token
    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    } catch {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Verify user is a parent
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'parent') {
      return NextResponse.json(
        { error: 'Only parents can complete parent onboarding' },
        { status: 403 }
      );
    }

    const {
      fullName,
      relationshipToStudent,
      contactNumber,
      alternateContactNumber,
      email,
      occupation,
      educationLevel,
      preferredLanguage,
      addressLine1,
      addressLine2,
      cityVillage,
      state,
      pinCode,
      linkedStudentId,
      studentUniqueId,
      consentToAccessChildData,
      agreeToTerms
    } = await request.json();

    // Validate required fields
    if (!fullName || !relationshipToStudent || !contactNumber || !occupation || 
        !educationLevel || !preferredLanguage || !addressLine1 || !cityVillage || 
        !state || !pinCode || !linkedStudentId || !studentUniqueId) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Validate phone numbers
    if (!/^\d{10}$/.test(contactNumber)) {
      return NextResponse.json({ 
        error: 'Contact number must be 10 digits' 
      }, { status: 400 });
    }

    if (alternateContactNumber && !/^\d{10}$/.test(alternateContactNumber)) {
      return NextResponse.json({ 
        error: 'Alternate contact number must be 10 digits' 
      }, { status: 400 });
    }

    // Validate pin code
    if (!/^\d{6}$/.test(pinCode)) {
      return NextResponse.json({ 
        error: 'Pin code must be 6 digits' 
      }, { status: 400 });
    }

    // Verify student exists and is not already linked
    const student = await User.findById(linkedStudentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ 
        error: 'Invalid student ID' 
      }, { status: 400 });
    }

    // Check if student is already linked to another parent
    const existingParent = await User.findOne({ 
      role: 'parent', 
      'profile.linkedStudentId': linkedStudentId,
      _id: { $ne: decoded.userId } // Exclude current user
    });
    if (existingParent) {
      return NextResponse.json({ 
        error: 'This student is already linked to another parent account' 
      }, { status: 400 });
    }

    // Validate consent
    if (!consentToAccessChildData || !agreeToTerms) {
      return NextResponse.json({ 
        error: 'Consent and terms acceptance are required' 
      }, { status: 400 });
    }

    // Create parent profile data
    const parentProfile = {
      userId: decoded.userId,
      fullName,
      relationshipToStudent,
      contactNumber,
      alternateContactNumber: alternateContactNumber || null,
      email: email || null,
      occupation,
      educationLevel,
      preferredLanguage,
      address: {
        line1: addressLine1,
        line2: addressLine2 || null,
        cityVillage,
        state,
        pinCode
      },
      linkedStudentId,
      studentUniqueId,
      consentToAccessChildData,
      agreeToTerms,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update user profile in database with basic information only
    const result = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $set: {
          profile: {
            linkedStudentId: linkedStudentId,
            role: 'parent'
          },
          updatedAt: new Date()
        }
      }
    );

    if (!result) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Create parent record in parents collection
    await Parent.create(parentProfile);

    return NextResponse.json({ 
      success: true, 
      message: 'Parent onboarding completed successfully' 
    });

  } catch (error) {
    console.error('Parent onboarding error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 