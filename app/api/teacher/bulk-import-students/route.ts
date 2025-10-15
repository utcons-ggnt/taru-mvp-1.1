import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { students } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: 'Students array is required' }, { status: 400 });
    }

    if (students.length > 100) {
      return NextResponse.json({ error: 'Cannot import more than 100 students at once' }, { status: 400 });
    }

    const results = {
      successful: [] as any[],
      failed: [] as any[],
      total: students.length
    };

    // Generate secure password function
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    for (let i = 0; i < students.length; i++) {
      const studentData = students[i];
      
      try {
        // Validate required fields - now including email
        const requiredFields = ['fullName', 'email', 'dateOfBirth', 'gender', 'classGrade', 'schoolName'];
        const missingFields = requiredFields.filter(field => !studentData[field]);
        
        if (missingFields.length > 0) {
          results.failed.push({
            index: i,
            fullName: studentData.fullName || 'Unknown',
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: studentData.email });
        if (existingUser) {
          results.failed.push({
            index: i,
            fullName: studentData.fullName,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({
          fullName: studentData.fullName,
          schoolName: studentData.schoolName,
          teacherId: user._id.toString()
        });

        if (existingStudent) {
          results.failed.push({
            index: i,
            fullName: studentData.fullName,
            error: 'Student already exists'
          });
          continue;
        }

        // Generate secure password
        const securePassword = generateSecurePassword();

        // Create new user
        const newUser = new User({
          name: studentData.fullName,
          email: studentData.email,
          password: securePassword,
          role: 'student',
          profile: {
            classGrade: studentData.classGrade,
            schoolName: studentData.schoolName || 'Not specified'
          },
          onboardingCompleted: false,
          firstTimeLogin: true
        });

        const savedUser = await newUser.save();

        // Create new student record
        const newStudent = new Student({
          userId: savedUser._id,
          teacherId: user._id.toString(),
          fullName: studentData.fullName,
          nickname: studentData.nickname || studentData.fullName.split(' ')[0],
          dateOfBirth: new Date(studentData.dateOfBirth),
          age: studentData.age || new Date().getFullYear() - new Date(studentData.dateOfBirth).getFullYear(),
          gender: studentData.gender,
          classGrade: studentData.classGrade,
          schoolName: studentData.schoolName,
          schoolId: studentData.schoolId || `SCH${Date.now()}`,
          uniqueId: `STU${Date.now()}${Math.random().toString(36).substr(2, 5)}`,
          languagePreference: studentData.languagePreference || 'English',
          learningModePreference: studentData.learningModePreference || ['Visual'],
          interestsOutsideClass: studentData.interestsOutsideClass || [],
          preferredCareerDomains: studentData.preferredCareerDomains || [],
          guardian: studentData.guardian || {
            name: 'Guardian Name',
            contactNumber: '0000000000',
            email: studentData.email
          },
          location: studentData.location || 'Not specified',
          consentForDataUsage: studentData.consentForDataUsage || false,
          termsAndConditionsAccepted: studentData.termsAndConditionsAccepted || false,
          onboardingCompleted: false,
          totalModulesCompleted: 0,
          totalXpEarned: 0,
          learningStreak: 0,
          badgesEarned: 0,
          assessmentCompleted: false,
          diagnosticCompleted: false,
          diagnosticScore: 0
        });

        await newStudent.save();

        results.successful.push({
          index: i,
          fullName: studentData.fullName,
          email: studentData.email,
          password: securePassword,
          uniqueId: newStudent.uniqueId,
          id: newStudent._id.toString()
        });

      } catch (error) {
        results.failed.push({
          index: i,
          fullName: studentData.fullName || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Bulk import completed',
      results: {
        successful: results.successful.length,
        failed: results.failed.length,
        total: results.total,
        details: results
      }
    });

  } catch (error) {
    console.error('Error bulk importing students:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}