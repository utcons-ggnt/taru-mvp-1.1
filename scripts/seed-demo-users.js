// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Fix model imports for CommonJS and .ts extension
const User = require('../models/User.ts').default || require('../models/User.ts');
const Student = require('../models/Student.ts').default || require('../models/Student.ts');
const StudentProgress = require('../models/StudentProgress.ts').default || require('../models/StudentProgress.ts');

async function seedDemoUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing demo users (by email)
    const demoEmails = [
      'student1@demo.com',
      'student2@demo.com',
      'student3@demo.com',
      'parent1@demo.com',
      'parent2@demo.com',
      'teacher1@demo.com',
      'teacher2@demo.com',
      'teacher3@demo.com',
      'admin1@demo.com',
      'admin2@demo.com'
    ];
    await User.deleteMany({ email: { $in: demoEmails } });
    await Student.deleteMany({ fullName: /Demo/ });
    await StudentProgress.deleteMany({});

    // Also delete all students with uniqueId starting with 'STU' (demo students)
    const demoStudentDocs = await Student.find({ uniqueId: /^STU/ });
    const demoStudentUserIds = demoStudentDocs.map(s => s.userId);
    await Student.deleteMany({ uniqueId: /^STU/ });
    await StudentProgress.deleteMany({ studentId: { $in: demoStudentUserIds } });

    const password = 'demopass';

    // --- Students ---
    const students = [
      {
        name: 'Demo Student', email: 'student1@demo.com', grade: '8', uniqueId: 'STUDEMO1',
        fullName: 'Demo Student', age: 14, gender: 'Male', school: 'Demo School',
        guardianEmail: 'parent1@demo.com', badges: ['Starter Badge'], modules: 2, points: 100, streak: 3
      },
      {
        name: 'Priya Sharma', email: 'student2@demo.com', grade: '7', uniqueId: 'STUPRIYA1',
        fullName: 'Priya Sharma', age: 13, gender: 'Female', school: 'Springfield School',
        guardianEmail: 'parent2@demo.com', badges: ['Math Whiz', 'Science Star'], modules: 4, points: 220, streak: 5
      },
      {
        name: 'Amit Verma', email: 'student3@demo.com', grade: '9', uniqueId: 'STUAMIT1',
        fullName: 'Amit Verma', age: 15, gender: 'Male', school: 'Green Valley High',
        guardianEmail: 'parent2@demo.com', badges: [], modules: 1, points: 50, streak: 1
      }
    ];
    const studentUsers = [];
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
        deviceId: 'device_' + s.uniqueId,
        consentForDataUsage: true,
        termsAndConditionsAccepted: true,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
        uniqueId: s.uniqueId
      });
      // --- Add module progress ---
      const now = new Date();
      const moduleProgress = [
        {
          moduleId: 'math-001',
          status: 'completed',
          progress: 100,
          xpEarned: 50,
          startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
          quizScore: 90,
          videoProgress: {
            videoUrl: 'https://www.youtube.com/embed/Pm6stsq9drk',
            watchTime: 2700,
            totalDuration: 2700,
            completed: true,
            lastWatchedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
            engagementScore: 95,
            playbackRate: 1,
            seekCount: 0
          },
          quizAttempts: [],
          gamificationProgress: {
            quests: [],
            badges: [{ badgeId: 'math-whiz', name: 'Math Whiz', description: 'Completed all math modules', earnedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), icon: '/math-badge.png' }],
            streaks: { currentStreak: 2, longestStreak: 2, lastActivityDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
            leaderboardPoints: 100
          },
          aiAssessment: { realTimeScore: 90, skillGaps: [], recommendations: [], adaptiveQuestions: [], learningPathRecommendations: [], lastAssessmentAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
          feedback: '',
          pointsEarned: 50,
          startedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          lastAccessedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
          learningPath: [],
          skillImprovements: [],
        },
        {
          moduleId: 'science-001',
          status: 'in-progress',
          progress: 60,
          xpEarned: 30,
          startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          quizScore: 70,
          videoProgress: {
            videoUrl: 'https://www.youtube.com/embed/Qw8pFfFzQJw',
            watchTime: 1200,
            totalDuration: 2400,
            completed: false,
            lastWatchedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            engagementScore: 60,
            playbackRate: 1,
            seekCount: 1
          },
          quizAttempts: [],
          gamificationProgress: {
            quests: [],
            badges: [],
            streaks: { currentStreak: 1, longestStreak: 2, lastActivityDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
            leaderboardPoints: 50
          },
          aiAssessment: { realTimeScore: 70, skillGaps: [], recommendations: [], adaptiveQuestions: [], learningPathRecommendations: [], lastAssessmentAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
          feedback: '',
          pointsEarned: 30,
          startedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          lastAccessedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          learningPath: [],
          skillImprovements: [],
        }
      ];
      // Count completed modules for totalModulesCompleted
      const completedCount = moduleProgress.filter(mp => mp.status === 'completed').length;
      await StudentProgress.create({
        studentId: user._id,
        moduleProgress,
        totalPoints: s.points,
        totalModulesCompleted: completedCount,
        totalWatchTime: 60 * s.modules,
        totalInteractiveTime: 10 * s.modules,
        totalProjectTime: 5 * s.modules,
        totalPeerLearningTime: 2 * s.modules,
        learningStreak: s.streak,
        badgesEarned: s.badges.length ? s.badges : ['Starter Badge'],
        skillLevels: { Math: 80, Science: 70 },
        learningPreferences: {
          preferredContentTypes: ['video'],
          preferredDifficulty: 'beginner',
          preferredGroupSize: 4,
          preferredTimeOfDay: 'morning'
        },
        aiInsights: {
          learningStyle: 'visual',
          strengths: ['Math'],
          weaknesses: ['Writing'],
          recommendations: ['Practice more science quizzes'],
          lastUpdated: new Date()
        }
      });
    }

    // --- Parents ---
    const parents = [
      {
        name: 'Demo Parent', email: 'parent1@demo.com', student: studentUsers[0], uniqueId: students[0].uniqueId
      },
      {
        name: 'Sunita Sharma', email: 'parent2@demo.com', student: studentUsers[1], uniqueId: students[1].uniqueId
      }
    ];
    for (const p of parents) {
      await User.create({
        name: p.name,
        email: p.email,
        password,
        role: 'parent',
        profile: {
          linkedStudentUniqueId: p.uniqueId,
          linkedStudentId: p.student._id,
          location: 'Demo City',
          guardianName: p.name
        }
      });
    }

    // --- Teachers ---
    const teachers = [
      { name: 'Demo Teacher', email: 'teacher1@demo.com', subject: 'Mathematics', exp: '5' },
      { name: 'Ravi Kumar', email: 'teacher2@demo.com', subject: 'Science', exp: '7' },
      { name: 'Anjali Mehta', email: 'teacher3@demo.com', subject: 'English', exp: '4' }
    ];
    for (const t of teachers) {
      await User.create({
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
    }

    // --- Admins ---
    const admins = [
      { name: 'Demo Admin', email: 'admin1@demo.com' },
      { name: 'Priya Admin', email: 'admin2@demo.com' }
    ];
    for (const a of admins) {
      await User.create({
        name: a.name,
        email: a.email,
        password,
        role: 'admin',
        profile: {
          organizationType: 'School',
          contactEmail: a.email,
          contactPhone: '8888888888'
        }
      });
    }

    console.log('Seeded demo users:');
    students.forEach(s => console.log(`Student: ${s.email} / demopass`));
    parents.forEach(p => console.log(`Parent: ${p.email} / demopass`));
    teachers.forEach(t => console.log(`Teacher: ${t.email} / demopass`));
    admins.forEach(a => console.log(`Admin: ${a.email} / demopass`));
  } catch (error) {
    console.error('Error seeding demo users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDemoUsers(); 