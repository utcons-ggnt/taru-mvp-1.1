import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// External webhook URL removed - just returning user data locally

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Trigger Current Student Webhook API called at:', new Date().toISOString());
    
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

    // Get student profile
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or onboarding not completed' },
        { status: 404 }
      );
    }

    console.log('🔍 Triggering current student webhook for:', {
      uniqueId: student.uniqueId,
      fullName: student.fullName,
      classGrade: student.classGrade
    });

    // Trigger N8N webhook for current student
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const skipN8NWebhook = process.env.SKIP_N8N_WEBHOOK === 'true';
    
    if (skipN8NWebhook) {
      console.log('🔍 Skipping N8N webhook (SKIP_N8N_WEBHOOK=true)');
      return NextResponse.json({
        success: true,
        message: 'Current student webhook triggered (development mode)',
        studentInfo: {
          uniqueId: student.uniqueId,
          fullName: student.fullName,
          classGrade: student.classGrade,
          schoolName: student.schoolName,
          email: student.email
        },
        webhookSkipped: true
      });
    }

    try {
      // Prepare student data for webhook
      const studentData = {
        uniqueId: student.uniqueId,
        fullName: student.fullName,
        classGrade: student.classGrade,
        schoolName: student.schoolName,
        email: student.email,
        languagePreference: student.languagePreference,
        learningModePreference: student.learningModePreference,
        interestsOutsideClass: student.interestsOutsideClass,
        preferredCareerDomains: student.preferredCareerDomains,
        broadInterestClusters: student.broadInterestClusters,
        personalityInsights: student.personalityInsights,
        careerDirection: student.careerDirection,
        interestAssessmentCompleted: student.interestAssessmentCompleted,
        timestamp: new Date().toISOString()
      };

      console.log('🔍 Returning current student data:', studentData);

      // Return the student data directly without calling external webhook
      return NextResponse.json({
        success: true,
        message: 'Current student data retrieved successfully',
        studentInfo: {
          uniqueId: student.uniqueId,
          fullName: student.fullName,
          classGrade: student.classGrade,
          schoolName: student.schoolName,
          email: student.email
        },
        studentData: studentData
      });
    } catch (error) {
      console.error('🔍 Error retrieving current student data:', error);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to retrieve current student data',
          details: error instanceof Error ? error.message : 'Unknown error',
          studentInfo: {
            uniqueId: student?.uniqueId,
            fullName: student?.fullName,
            classGrade: student?.classGrade,
            schoolName: student?.schoolName,
            email: student?.email
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Current student API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Trigger Current Student Webhook API (GET) called at:', new Date().toISOString());
    
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

    // Get student profile
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found or onboarding not completed' },
        { status: 404 }
      );
    }

    console.log('🔍 Returning current student data (GET) for:', {
      uniqueId: student.uniqueId,
      fullName: student.fullName,
      classGrade: student.classGrade
    });

    // Return student data directly without external webhook
    return NextResponse.json({
      success: true,
      message: 'Current student data retrieved successfully',
      studentInfo: {
        uniqueId: student.uniqueId,
        fullName: student.fullName,
        classGrade: student.classGrade,
        schoolName: student.schoolName,
        email: student.email
      }
    });


  } catch (error) {
    console.error('Current student API error (GET):', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
