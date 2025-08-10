import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import AssessmentResponse from '@/models/AssessmentResponse';
import Assessment from '@/models/Assessment';
import Parent from '@/models/Parent';
import Teacher from '@/models/Teacher';
import Organization from '@/models/Organization';
import LearningPath from '@/models/LearningPath';
import Module from '@/models/Module';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cleanup and reseed endpoint not available in production' },
        { status: 403 }
      );
    }

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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can perform cleanup and reseed' },
        { status: 403 }
      );
    }

    console.log('🚀 Admin cleanup and reseed requested by:', user.email);

    // Run the cleanup and reseed process directly
    await performCleanupAndReseed();

    return NextResponse.json({
      success: true,
      message: 'Database cleanup and reseed completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Cleanup and reseed error:', error);
    return NextResponse.json(
      { 
        error: 'Cleanup and reseed failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Cleanup and reseed function
async function performCleanupAndReseed() {
  try {
    console.log('🚀 Starting comprehensive cleanup and reseed...');
    
    // ===== PHASE 1: COMPREHENSIVE CLEANUP =====
    console.log('\n🧹 PHASE 1: Cleaning up all data...');
    
    // Delete all data in reverse dependency order
    const cleanupResults = {
      assessmentResponses: 0,
      assessments: 0,
      studentProgress: 0,
      learningPaths: 0,
      students: 0,
      parents: 0,
      teachers: 0,
      organizations: 0,
      users: 0,
      modules: 0
    };

    // 1. Delete assessment responses (depends on students)
    const assessmentResponseResult = await AssessmentResponse.deleteMany({});
    cleanupResults.assessmentResponses = assessmentResponseResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.assessmentResponses} assessment responses`);

    // 2. Delete assessments
    const assessmentResult = await Assessment.deleteMany({});
    cleanupResults.assessments = assessmentResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.assessments} assessments`);

    // 3. Delete student progress
    const studentProgressResult = await StudentProgress.deleteMany({});
    cleanupResults.studentProgress = studentProgressResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.studentProgress} student progress records`);

    // 4. Delete learning paths
    const learningPathResult = await LearningPath.deleteMany({});
    cleanupResults.learningPaths = learningPathResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.learningPaths} learning paths`);

    // 5. Delete students
    const studentResult = await Student.deleteMany({});
    cleanupResults.students = studentResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.students} students`);

    // 6. Delete parents
    const parentResult = await Parent.deleteMany({});
    cleanupResults.parents = parentResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.parents} parents`);

    // 7. Delete teachers
    const teacherResult = await Teacher.deleteMany({});
    cleanupResults.teachers = teacherResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.teachers} teachers`);

    // 8. Delete organizations
    const organizationResult = await Organization.deleteMany({});
    cleanupResults.organizations = organizationResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.organizations} organizations`);

    // 9. Delete all users (except keep one admin for access)
    const userResult = await User.deleteMany({});
    cleanupResults.users = userResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.users} users`);

    // 10. Delete modules (will be reseeded)
    const moduleResult = await Module.deleteMany({});
    cleanupResults.modules = moduleResult.deletedCount;
    console.log(`   Deleted ${cleanupResults.modules} modules`);

    console.log('\n📊 Cleanup Summary:');
    Object.entries(cleanupResults).forEach(([key, count]) => {
      console.log(`   ${key}: ${count} records deleted`);
    });

    const totalDeleted = Object.values(cleanupResults).reduce((sum, count) => sum + count, 0);
    console.log(`\n🎯 Total records deleted: ${totalDeleted}`);

    // ===== PHASE 2: RESEED WITH DEMO DATA =====
    console.log('\n🌱 PHASE 2: Reseeding with demo data...');
    
    // Create a default admin user
    const password = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@system.com',
      password,
      role: 'admin',
      profile: {
        bio: 'System administrator for the learning platform',
        avatar: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=A'
      },
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('   ✅ Created system admin user');

    // Create demo students
    const students = [
      { name: 'Demo Student 1', email: 'student1@demo.com', grade: 'Grade 6', subject: 'Mathematics' },
      { name: 'Demo Student 2', email: 'student2@demo.com', grade: 'Grade 7', subject: 'Science' },
      { name: 'Demo Student 3', email: 'student3@demo.com', grade: 'Grade 8', subject: 'English' }
    ];

    for (const s of students) {
      const studentUser = await User.create({
        name: s.name,
        email: s.email,
        password: await bcrypt.hash('demopass', 10),
        role: 'student',
        profile: {
          bio: `${s.grade} student interested in ${s.subject}`,
          avatar: 'https://via.placeholder.com/150/10B981/FFFFFF?text=S'
        }
      });

      await Student.create({
        userId: studentUser._id,
        name: s.name,
        email: s.email,
        gradeLevel: s.grade,
        subjects: [s.subject],
        bio: `${s.grade} student with a passion for learning`,
        onboardingCompleted: true,
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          weeklyReports: true,
          learningReminders: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✅ Created ${students.length} demo students`);

    // Create demo parents
    const parents = [
      { name: 'Demo Parent 1', email: 'parent1@demo.com' },
      { name: 'Demo Parent 2', email: 'parent2@demo.com' }
    ];

    for (const p of parents) {
      const parentUser = await User.create({
        name: p.name,
        email: p.email,
        password: await bcrypt.hash('demopass', 10),
        role: 'parent',
        profile: {
          bio: 'Supportive parent committed to child education',
          avatar: 'https://via.placeholder.com/150/F59E0B/FFFFFF?text=P'
        }
      });

      await Parent.create({
        userId: parentUser._id,
        name: p.name,
        email: p.email,
        phoneNumber: '9999999999',
        bio: 'Dedicated parent supporting child learning journey',
        onboardingCompleted: true,
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: true,
          weeklyReports: true,
          progressAlerts: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✅ Created ${parents.length} demo parents`);

    // Create demo teachers
    const teachers = [
      { name: 'Demo Teacher 1', email: 'teacher1@demo.com', subject: 'Mathematics', exp: 5 },
      { name: 'Demo Teacher 2', email: 'teacher2@demo.com', subject: 'Science', exp: 8 },
      { name: 'Demo Teacher 3', email: 'teacher3@demo.com', subject: 'English', exp: 3 }
    ];

    for (const t of teachers) {
      const teacherUser = await User.create({
        name: t.name,
        email: t.email,
        password: await bcrypt.hash('demopass', 10),
        role: 'teacher',
        profile: {
          bio: `Experienced ${t.subject} teacher`,
          avatar: 'https://via.placeholder.com/150/EF4444/FFFFFF?text=T'
        }
      });

      await Teacher.create({
        userId: teacherUser._id,
        name: t.name,
        email: t.email,
        phoneNumber: '8888888888',
        gradeLevels: ['Grade 6', 'Grade 7', 'Grade 8'],
        subjects: [t.subject],
        bio: `Experienced ${t.subject} teacher with ${t.exp} years of teaching experience.`,
        onboardingCompleted: true,
        isActive: true,
        preferences: {
          notificationEmail: true,
          notificationSMS: false,
          weeklyReports: true,
          studentProgressAlerts: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✅ Created ${teachers.length} demo teachers`);

    // Create demo organization
    const orgUser = await User.create({
      name: 'Demo School District',
      email: 'contact@demoschool.edu',
      password: await bcrypt.hash('demopass', 10),
      role: 'organization',
      profile: {
        organizationType: 'school',
        contactEmail: 'contact@demoschool.edu',
        contactPhone: '7777777777'
      }
    });

    await Organization.create({
      userId: orgUser._id,
      organizationName: 'Demo School District',
      organizationType: 'school',
      industry: 'Education',
      address: '123 Education Street',
      city: 'Demo City',
      state: 'Demo State',
      country: 'India',
      phoneNumber: '7777777777',
      website: 'https://demoschool.edu',
      description: 'A leading educational institution dedicated to student success',
      employeeCount: '51-200',
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('   ✅ Created demo organization');

    console.log('\n🎉 RESEED COMPLETE!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('   System Admin: admin@system.com / admin123');
    console.log('   Students: student1@demo.com, student2@demo.com, student3@demo.com / demopass');
    console.log('   Parents: parent1@demo.com, parent2@demo.com / demopass');
    console.log('   Teachers: teacher1@demo.com, teacher2@demo.com, teacher3@demo.com / demopass');

  } catch (error) {
    console.error('❌ Error during cleanup and reseed:', error);
    throw error;
  }
}

// GET endpoint to show status and confirm action
export async function GET(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cleanup and reseed endpoint not available in production' },
        { status: 403 }
      );
    }

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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can access this endpoint' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup and reseed endpoint is available',
      instructions: {
        method: 'POST',
        description: 'Send a POST request to this endpoint to perform comprehensive cleanup and reseed',
        warning: 'This will delete ALL user data, responses, and related data, then reseed with fresh demo data',
        environment: process.env.NODE_ENV
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
