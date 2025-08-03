import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Starting student onboarding...');
    console.log('🔍 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('🔍 MONGODB_URI exists:', !!process.env.MONGODB_URI);

    // Get token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;
    console.log('🔍 Token exists:', !!token);
    
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
      console.log('🔍 Token verified, userId:', decoded.userId);
    } catch (error) {
      console.error('🔍 Token verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Connect to database
    try {
      console.log('🔍 Connecting to database...');
      await connectDB();
      console.log('🔍 Database connected successfully');
    } catch (dbError) {
      console.error('🔍 Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please check your MongoDB configuration.' },
        { status: 500 }
      );
    }

    // Parse request data (handle both JSON and FormData)
    console.log('🔍 Parsing request data...');
    const contentType = request.headers.get('content-type') || '';
    let data: any = {};
    
    if (contentType.includes('application/json')) {
      console.log('🔍 Parsing JSON data...');
      data = await request.json();
    } else {
      console.log('🔍 Parsing FormData...');
      const formData = await request.formData();
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (key === 'learningModePreference' || key === 'interestsOutsideClass' || key === 'preferredCareerDomains') {
          try {
            data[key] = JSON.parse(value as string);
          } catch {
            data[key] = [value];
          }
        } else {
          data[key] = value;
        }
      }
    }
    
    // Extract form fields with better error handling
    try {
      const fullName = data.fullName as string;
      const nickname = data.nickname as string;
      const dateOfBirth = data.dateOfBirth as string;
      const age = parseInt(data.age as string) || 0;
      const gender = data.gender as string;
      const classGrade = data.classGrade as string;
      const schoolName = data.schoolName as string;
      const schoolId = data.schoolId as string;
      const languagePreference = data.languagePreference as string;
      const learningModePreference = Array.isArray(data.learningModePreference) ? data.learningModePreference : [data.learningModePreference];
      const interestsOutsideClass = Array.isArray(data.interestsOutsideClass) ? data.interestsOutsideClass : [data.interestsOutsideClass];
      const preferredCareerDomains = Array.isArray(data.preferredCareerDomains) ? data.preferredCareerDomains : [data.preferredCareerDomains];
      const guardianName = data.guardianName as string;
      const guardianContactNumber = data.guardianPhone || data.guardianContactNumber as string;
      const guardianEmail = data.guardianEmail as string;
      const location = data.location as string;
      const deviceId = data.deviceId as string;
      const consentForDataUsage = data.consentForDataUsage === 'true' || data.consentForDataUsage === true || data.privacyConsent === true;
      const termsAndConditionsAccepted = data.termsAndConditionsAccepted === 'true' || data.termsAndConditionsAccepted === true || data.dataProcessingConsent === true;
      // Accept uniqueId from form data if provided
      const uniqueId = data.uniqueId as string | null;

      console.log('🔍 Form data extracted successfully');
      console.log('🔍 Required fields check:', {
        fullName: !!fullName,
        dateOfBirth: !!dateOfBirth,
        gender: !!gender,
        classGrade: !!classGrade,
        schoolId: !!schoolId,
        languagePreference: !!languagePreference,
        guardianName: !!guardianName,
        guardianContactNumber: !!guardianContactNumber
      });

      // Validate required fields
      if (!fullName || !dateOfBirth || !gender || !classGrade || !schoolId || 
          !languagePreference || !guardianName || !guardianContactNumber) {
        console.log('🔍 Missing required fields');
        return NextResponse.json({ 
          error: 'Missing required fields' 
        }, { status: 400 });
      }

      // Validate email format if provided
      if (guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail)) {
        return NextResponse.json({ 
          error: 'Invalid guardian email format' 
        }, { status: 400 });
      }

      // Handle profile picture - no default, will be blank if not provided
      const profilePictureUrl = null;

      // Create student profile data
      const studentProfile = {
        fullName,
        nickname: nickname || null,
        dateOfBirth: new Date(dateOfBirth),
        age,
        gender: gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase(), // Capitalize first letter
        classGrade,
        schoolName,
        schoolId,
        profilePictureUrl,
        languagePreference,
        learningModePreference,
        interestsOutsideClass,
        preferredCareerDomains,
        guardian: {
          name: guardianName,
          contactNumber: guardianContactNumber,
          email: guardianEmail || null
        },
        location,
        deviceId,
        consentForDataUsage,
        termsAndConditionsAccepted,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...(uniqueId ? { uniqueId } : {})
      };

      console.log('🔍 Updating user profile...');
      // Update user profile in database with basic information only
      const result = await User.findByIdAndUpdate(
        decoded.userId,
        { 
          $set: {
            profile: {
              grade: classGrade,
              role: 'student'
            },
            updatedAt: new Date()
          }
        }
      );

      if (!result) {
        console.log('🔍 User not found');
        return NextResponse.json({ 
          error: 'User not found' 
        }, { status: 404 });
      }

      console.log('🔍 Creating student record...');
      // Create student record in students collection
      const student = await Student.create({
        userId: decoded.userId,
        ...studentProfile
      });

      // Initialize student progress record
      console.log('🔍 Initializing student progress...');
      await StudentProgress.create({
        userId: decoded.userId,
        studentId: decoded.userId,
        moduleProgress: [],
        pathProgress: [],
        totalXpEarned: 0,
        totalModulesCompleted: 0,
        totalTimeSpent: 0,
        badgesEarned: [],
        currentModule: null,
        currentPath: null
      });

      console.log('🔍 Student onboarding completed successfully');
      console.log('🔍 Unique ID generated:', student.uniqueId);

      // Trigger n8n webhook for assessment questions generation
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const skipN8NWebhook = process.env.SKIP_N8N_WEBHOOK === 'true';
      
      if (skipN8NWebhook) {
        console.log('🔍 Skipping n8n webhook (SKIP_N8N_WEBHOOK=true)');
        console.log('🔍 Assessment will use fallback questions from API');
        
        // Create a basic assessment response entry for development
        try {
          let assessmentResponse = await AssessmentResponse.findOne({
            uniqueId: student.uniqueId,
            assessmentType: 'diagnostic'
          });

          if (!assessmentResponse) {
            assessmentResponse = new AssessmentResponse({
              uniqueId: student.uniqueId,
              assessmentType: 'diagnostic',
              responses: [],
              webhookTriggered: false,
              webhookTriggeredAt: new Date(),
              generatedQuestions: [] // Will use fallback questions
            });
            await assessmentResponse.save();
            console.log('🔍 Created assessment response entry for development mode');
          }
        } catch (devError) {
          console.error('🔍 Error creating development assessment response:', devError);
        }
      } else {
        // Production n8n webhook logic
        try {
          const webhookPayload = [
            {
              "UniqueID": student.uniqueId,
              "submittedAt": new Date().toISOString()
            }
          ];

          console.log('🔍 Triggering n8n webhook with GET parameters:', {
            UniqueID: student.uniqueId,
            submittedAt: new Date().toISOString()
          });

          // Build query parameters for GET request
          const params = new URLSearchParams({
            UniqueID: student.uniqueId,
            submittedAt: new Date().toISOString()
          });

          const webhookResponse = await fetch(`https://nclbtaru.app.n8n.cloud/webhook/assessment-questions?${params}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (webhookResponse.ok) {
            const responseData = await webhookResponse.json();
            console.log('🔍 n8n webhook triggered successfully, response:', responseData);
            
            // Store the generated questions in assessment response
            if (responseData && responseData[0] && responseData[0].output) {
              let assessmentResponse = await AssessmentResponse.findOne({
                uniqueId: student.uniqueId,
                assessmentType: 'diagnostic'
              });

              if (!assessmentResponse) {
                assessmentResponse = new AssessmentResponse({
                  uniqueId: student.uniqueId,
                  assessmentType: 'diagnostic',
                  responses: []
                });
              }

              assessmentResponse.generatedQuestions = responseData[0].output;
              assessmentResponse.webhookTriggered = true;
              assessmentResponse.webhookTriggeredAt = new Date();
              await assessmentResponse.save();

              console.log('🔍 Generated questions stored for student:', student.uniqueId);
            }
          } else {
            console.error('🔍 Failed to trigger n8n webhook:', webhookResponse.status, webhookResponse.statusText);
            console.log('🔍 Falling back to default assessment questions');
          }
        } catch (webhookError) {
          console.error('🔍 Error triggering n8n webhook:', webhookError);
          console.log('🔍 Falling back to default assessment questions');
          // Don't fail the onboarding if webhook fails
        }
      }

      // Generate new token with assessment requirement (since onboarding is now complete)
      const newToken = jwt.sign(
        {
          userId: decoded.userId,
          email: result.email,
          fullName: result.name,
          role: result.role,
          firstTimeLogin: false,
          requiresOnboarding: false,
          requiresAssessment: true
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({ 
        success: true, 
        message: 'Student onboarding completed successfully',
        uniqueId: student.uniqueId
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

    } catch (parseError) {
      console.error('🔍 Form data parsing error:', parseError);
      console.error('🔍 Error details:', {
        message: parseError instanceof Error ? parseError.message : 'Unknown error',
        stack: parseError instanceof Error ? parseError.stack : 'No stack trace'
      });
      return NextResponse.json({ 
        error: `Invalid form data format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` 
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔍 Student onboarding error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('MongoDB')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please check your MongoDB configuration.' 
        }, { status: 500 });
      }
      if (error.message.includes('validation')) {
        return NextResponse.json({ 
          error: 'Data validation failed: ' + error.message 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Internal server error. Please try again later.' 
    }, { status: 500 });
  }
} 