import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
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

    // Parse form data (including file upload)
    console.log('🔍 Parsing form data...');
    const formData = await request.formData();
    
    // Extract form fields with better error handling
    try {
      const fullName = formData.get('fullName') as string;
      const nickname = formData.get('nickname') as string;
      const dateOfBirth = formData.get('dateOfBirth') as string;
      const age = parseInt(formData.get('age') as string);
      const gender = formData.get('gender') as string;
      const classGrade = formData.get('classGrade') as string;
      const schoolName = formData.get('schoolName') as string;
      const schoolId = formData.get('schoolId') as string;
      const languagePreference = formData.get('languagePreference') as string;
      const learningModePreference = JSON.parse(formData.get('learningModePreference') as string);
      const interestsOutsideClass = JSON.parse(formData.get('interestsOutsideClass') as string);
      const preferredCareerDomains = JSON.parse(formData.get('preferredCareerDomains') as string);
      const guardianName = formData.get('guardianName') as string;
      const guardianContactNumber = formData.get('guardianContactNumber') as string;
      const guardianEmail = formData.get('guardianEmail') as string;
      const location = formData.get('location') as string;
      const deviceId = formData.get('deviceId') as string;
      const consentForDataUsage = formData.get('consentForDataUsage') === 'true';
      const termsAndConditionsAccepted = formData.get('termsAndConditionsAccepted') === 'true';

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

      // Handle profile picture upload
      let profilePictureUrl = null;
      const profilePicture = formData.get('profilePicture') as File;
      
      if (profilePicture) {
        // In a real application, you would upload to a cloud storage service
        // For now, we'll store the file info
        profilePictureUrl = `/uploads/profile-pictures/${Date.now()}-${profilePicture.name}`;
        
        // TODO: Implement actual file upload to cloud storage
        // Example: Upload to AWS S3, Google Cloud Storage, etc.
      }

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
        updatedAt: new Date()
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

      return NextResponse.json({ 
        success: true, 
        message: 'Student onboarding completed successfully',
        uniqueId: student.uniqueId
      });

    } catch (parseError) {
      console.error('🔍 Form data parsing error:', parseError);
      return NextResponse.json({ 
        error: 'Invalid form data format' 
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