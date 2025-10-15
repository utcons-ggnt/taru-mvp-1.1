// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User.ts').default || require('../models/User.ts');
const Student = require('../models/Student.ts').default || require('../models/Student.ts');
const StudentProgress = require('../models/StudentProgress.ts').default || require('../models/StudentProgress.ts');
const AssessmentResponse = require('../models/AssessmentResponse.ts').default || require('../models/AssessmentResponse.ts');
const Assessment = require('../models/Assessment.ts').default || require('../models/Assessment.ts');
const Parent = require('../models/Parent.ts').default || require('../models/Parent.ts');
const Teacher = require('../models/Teacher.ts').default || require('../models/Teacher.ts');
const Organization = require('../models/Organization.ts').default || require('../models/Organization.ts');
const LearningPath = require('../models/LearningPath.ts').default || require('../models/LearningPath.ts');
const Module = require('../models/Module.ts').default || require('../models/Module.ts');

async function cleanupAndReseed() {
  try {
    console.log('🚀 Starting comprehensive cleanup and reseed...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

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

    // ===== PHASE 2: RESEED DATA =====
    console.log('\n🌱 PHASE 2: Reseeding data...');

    // Create a default admin user for access
    const adminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        organizationType: 'System',
        contactEmail: 'admin@system.com',
        contactPhone: '0000000000'
      }
    });
    console.log('   ✅ Created system admin user (admin@system.com / admin123)');

    // Seed demo users
    console.log('\n👥 Seeding demo users...');
    const password = await bcrypt.hash('demopass', 10);

    // Students
    const students = [
      {
        name: 'Demo Student', 
        email: 'student1@demo.com', 
        grade: '8', 
        uniqueId: null,
        fullName: 'Demo Student', 
        age: 14, 
        gender: 'Male', 
        school: 'Demo School',
        guardianEmail: 'parent1@demo.com', 
        badges: ['Starter Badge'], 
        modules: 2, 
        points: 100, 
        streak: 3
      },
      {
        name: 'Priya Sharma', 
        email: 'student2@demo.com', 
        grade: '7', 
        uniqueId: null,
        fullName: 'Priya Sharma', 
        age: 13, 
        gender: 'Female', 
        school: 'Springfield School',
        guardianEmail: 'parent2@demo.com', 
        badges: ['Math Whiz', 'Science Star'], 
        modules: 4, 
        points: 220, 
        streak: 5
      },
      {
        name: 'Amit Verma', 
        email: 'student3@demo.com', 
        grade: '9', 
        uniqueId: null,
        fullName: 'Amit Verma', 
        age: 15, 
        gender: 'Male', 
        school: 'Green Valley High',
        guardianEmail: 'parent2@demo.com', 
        badges: [], 
        modules: 1, 
        points: 50, 
        streak: 1
      }
    ];

    const studentUsers = [];
    const studentRecords = [];
    for (const [i, s] of students.entries()) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        password,
        role: 'student',
        profile: {
          grade: s.grade,
          language: 'English',
          location: 'Demo City',
          guardianName: 'Demo Parent'
        }
      });
      studentUsers.push(user);
      
      // Generate real unique student ID using centralized generator
      const { StudentKeyGenerator } = require('../lib/studentKeyGenerator');
      const realUniqueId = StudentKeyGenerator.generateDeterministic(user._id.toString(), s.fullName);
      
      await Student.create({
        userId: user._id,
        fullName: s.fullName,
        dateOfBirth: new Date('2010-01-01'),
        age: s.age,
        gender: s.gender,
        classGrade: s.grade,
        schoolName: s.school,
        schoolId: 'SCH00' + s.grade,
        languagePreference: 'English',
        learningModePreference: ['Visual Learning'],
        interestsOutsideClass: ['Music', 'Sports'],
        preferredCareerDomains: ['Technology'],
        guardian: {
          name: 'Demo Parent',
          contactNumber: '9999999999',
          email: s.guardianEmail
        },
        location: 'Demo City',
        deviceId: 'device_' + realUniqueId,
        consentForDataUsage: true,
        termsAndConditionsAccepted: true,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        uniqueId: realUniqueId
      });
      studentRecords.push(student);

      // Create initial progress for each student
      const now = new Date();
      await StudentProgress.create({
        userId: user._id,
        studentId: user._id,
        totalModulesCompleted: s.modules,
        totalPointsEarned: s.points,
        currentStreak: s.streak,
        badgesEarned: s.badges,
        lastActivityDate: now,
        createdAt: now,
        updatedAt: now
      });
    }
    console.log(`   ✅ Created ${students.length} demo students`);

    // Parents
    const parents = [
      { name: 'Demo Parent', email: 'parent1@demo.com' },
      { name: 'Sharma Parent', email: 'parent2@demo.com' }
    ];

    for (const p of parents) {
      const user = await User.create({
        name: p.name,
        email: p.email,
        password,
        role: 'parent',
        profile: {
          childrenCount: 2,
          location: 'Demo City',
          contactPhone: '9999999999'
        }
      });

      await Parent.create({
        userId: user._id,
        fullName: p.name,
        email: p.email,
        relationshipToStudent: 'Guardian',
        contactNumber: '9999999999',
        alternateContactNumber: '8888888888',
        occupation: 'Professional',
        educationLevel: 'Bachelor\'s Degree',
        preferredLanguage: 'English',
        address: {
          line1: '123 Demo Street',
          line2: 'Demo Apartment',
          cityVillage: 'Demo City',
          state: 'Demo State',
          pinCode: '123456'
        },
        linkedStudentId: studentUsers[0]._id.toString(),
        studentUniqueId: studentRecords[0].uniqueId, // This will now be the real generated uniqueId
        consentToAccessChildData: true,
        agreeToTerms: true,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✅ Created ${parents.length} demo parents`);

    // Teachers
    const teachers = [
      { name: 'Demo Teacher', email: 'teacher1@demo.com', subject: 'Mathematics', exp: 5 },
      { name: 'Science Teacher', email: 'teacher2@demo.com', subject: 'Science', exp: 8 },
      { name: 'English Teacher', email: 'teacher3@demo.com', subject: 'English', exp: 3 }
    ];

    for (const t of teachers) {
      const user = await User.create({
        name: t.name,
        email: t.email,
        password,
        role: 'teacher',
        profile: {
          subjectSpecialization: t.subject,
          experienceYears: t.exp,
          location: 'Demo City'
        }
      });

      await Teacher.create({
        userId: user._id,
        fullName: t.name,
        email: t.email,
        phoneNumber: '8888888888',
        subjectSpecialization: t.subject,
        experienceYears: t.exp,
        qualification: 'Bachelor\'s Degree in Education',
        schoolName: 'Demo School',
        schoolId: 'SCH001',
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

    // Organizations
    const organizations = [
      {
        name: 'Demo School District',
        type: 'school',
        email: 'contact@demoschool.edu',
        phone: '7777777777',
        address: '123 Education Street',
        website: 'https://demoschool.edu'
      }
    ];

    for (const org of organizations) {
      // Create organization user first
      const orgUser = await User.create({
        name: org.name,
        email: org.email,
        password,
        role: 'organization',
        profile: {
          organizationType: org.type,
          contactEmail: org.email,
          contactPhone: org.phone
        }
      });

      await Organization.create({
        userId: orgUser._id,
        organizationName: org.name,
        organizationType: org.type,
        industry: 'Education',
        address: org.address,
        city: 'Demo City',
        state: 'Demo State',
        country: 'India',
        phoneNumber: org.phone,
        website: org.website,
        description: 'A leading educational institution dedicated to student success',
        employeeCount: '51-200',
        onboardingCompleted: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    console.log(`   ✅ Created ${organizations.length} demo organizations`);

    console.log('\n📚 Seeding modules...');
    // Import and run the module seeding function
    const { seedModules } = require('./seed-modules.js');
    await seedModules();
    console.log('   ✅ Modules seeded successfully');

    console.log('\n🎉 RESEED COMPLETE!');
    console.log('\n📋 Demo Account Credentials:');
    console.log('   System Admin: admin@system.com / admin123');
    console.log('   Students: student1@demo.com, student2@demo.com, student3@demo.com / demopass');
    console.log('   Parents: parent1@demo.com, parent2@demo.com / demopass');
    console.log('   Teachers: teacher1@demo.com, teacher2@demo.com, teacher3@demo.com / demopass');

  } catch (error) {
    console.error('❌ Error during cleanup and reseed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  cleanupAndReseed()
    .then(() => {
      console.log('\n✅ Cleanup and reseed completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Cleanup and reseed failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupAndReseed };
