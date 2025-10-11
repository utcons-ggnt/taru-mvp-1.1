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

    const requestData = await request.json();
    console.log('📝 Parent onboarding request data:', {
      hasFullName: !!requestData.fullName,
      hasRelationship: !!requestData.relationshipToStudent,
      hasContactNumber: !!requestData.contactNumber,
      hasOccupation: !!requestData.occupation,
      hasEducationLevel: !!requestData.educationLevel,
      hasPreferredLanguage: !!requestData.preferredLanguage,
      hasAddressLine1: !!requestData.addressLine1,
      hasCityVillage: !!requestData.cityVillage,
      hasState: !!requestData.state,
      hasPinCode: !!requestData.pinCode,
      hasLinkedStudentId: !!requestData.linkedStudentId,
      hasStudentUniqueId: !!requestData.studentUniqueId,
      hasConsent: !!requestData.consentToAccessChildData,
      hasAgreeToTerms: !!requestData.agreeToTerms
    });

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
    } = requestData;

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

    // Import Student model to find the correct userId
    const Student = (await import('@/models/Student')).default;
    
    // Find student by uniqueId to get the actual userId
    const studentRecord = await Student.findOne({ uniqueId: studentUniqueId });
    if (!studentRecord) {
      console.error('❌ Student not found with unique ID:', studentUniqueId);
      return NextResponse.json({ 
        error: 'Student not found with the provided unique ID' 
      }, { status: 400 });
    }

    // Use the actual userId from the student record
    const actualStudentId = studentRecord.userId;
    console.log('✅ Student ID mapping:', {
      uniqueId: studentUniqueId,
      actualStudentId: actualStudentId,
      studentName: studentRecord.fullName
    });
    
    // Verify student exists and is not already linked
    const student = await User.findById(actualStudentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ 
        error: 'Invalid student ID' 
      }, { status: 400 });
    }

    // Check if student is already linked to another parent
    const existingParent = await User.findOne({ 
      role: 'parent', 
      'profile.linkedStudentId': actualStudentId,
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
      alternateContactNumber: alternateContactNumber || undefined,
      email: email || undefined,
      occupation,
      educationLevel,
      preferredLanguage,
      address: {
        line1: addressLine1,
        line2: addressLine2 || undefined,
        cityVillage,
        state,
        pinCode
      },
      linkedStudentId: actualStudentId,
      studentUniqueId,
      consentToAccessChildData,
      agreeToTerms,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date()
    };

    // Update user profile in database with basic information only
    const result = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        $set: {
          profile: {
            linkedStudentId: actualStudentId,
            linkedStudentUniqueId: studentUniqueId
          },
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    // Create parent record in parents collection
    try {
      await Parent.create(parentProfile);
      console.log('✅ Parent record created successfully');
    } catch (parentError) {
      console.error('❌ Error creating parent record:', parentError);
      return NextResponse.json({ 
        error: 'Failed to create parent profile' 
      }, { status: 500 });
    }

    // Generate new token without onboarding requirement
    const newToken = jwt.sign(
      {
        userId: decoded.userId,
        email: result.email,
        fullName: result.name,
        role: result.role,
        firstTimeLogin: false,
        requiresOnboarding: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      success: true, 
      message: 'Parent onboarding completed successfully' 
    });

    // Update the auth token cookie
    response.cookies.set('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('❌ Parent onboarding error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    }, { status: 500 });
  }
} 