import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Assessment from '@/models/Assessment';
import Module from '@/models/Module';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
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

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const notifications = [];

    // Generate role-specific notifications
    switch (user.role) {
      case 'student':
        notifications.push(...await generateStudentNotifications(decoded.userId));
        break;
      case 'parent':
        notifications.push(...await generateParentNotifications(decoded.userId));
        break;
      case 'teacher':
        notifications.push(...await generateTeacherNotifications(decoded.userId));
        break;
      case 'admin':
        notifications.push(...await generateAdminNotifications());
        break;
    }

    return NextResponse.json({
      notifications: notifications.slice(0, 10), // Limit to 10 most recent
      unreadCount: notifications.filter(n => !n.read).length
    });

  } catch (error) {
    console.error('Notifications fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function generateStudentNotifications(userId: string) {
  const notifications = [];
  
  // Get student progress
  const progress = await StudentProgress.findOne({ studentId: userId });
  const assessment = await Assessment.findOne({ userId });
  
  // Welcome notification for new students
  if (!progress || progress.totalModulesCompleted === 0) {
    notifications.push({
      id: 'welcome',
      title: 'Welcome to Your Learning Journey!',
      message: 'Start your first module to begin earning XP and badges.',
      type: 'info',
      date: new Date().toISOString(),
      read: false
    });
  }

  // Progress milestones
  if (progress) {
    const modulesCompleted = progress.totalModulesCompleted || 0;
    
    if (modulesCompleted === 1) {
      notifications.push({
        id: 'first-module',
        title: 'First Module Completed! 🎉',
        message: 'Congratulations on completing your first module! Keep up the great work.',
        type: 'success',
        date: new Date().toISOString(),
        read: false
      });
    }
    
    if (modulesCompleted === 5) {
      notifications.push({
        id: 'five-modules',
        title: '5 Modules Completed! 🚀',
        message: 'You\'ve completed 5 modules! You\'re making excellent progress.',
        type: 'success',
        date: new Date().toISOString(),
        read: false
      });
    }

    // Streak notifications
    if (progress.learningStreak >= 3) {
      notifications.push({
        id: 'streak-3',
        title: 'Learning Streak! 🔥',
        message: `Amazing! You've maintained a ${progress.learningStreak}-day learning streak.`,
        type: 'success',
        date: new Date().toISOString(),
        read: false
      });
    }
  }

  // Assessment notifications
  if (assessment && assessment.diagnosticCompleted) {
    const score = assessment.diagnosticScore || 0;
    
    if (score >= 90) {
      notifications.push({
        id: 'excellent-score',
        title: 'Excellent Assessment Score! 🌟',
        message: `You scored ${score}% on your diagnostic assessment. Outstanding work!`,
        type: 'success',
        date: new Date().toISOString(),
        read: false
      });
    } else if (score >= 70) {
      notifications.push({
        id: 'good-score',
        title: 'Good Assessment Score! 👍',
        message: `You scored ${score}% on your diagnostic assessment. Keep learning!`,
        type: 'info',
        date: new Date().toISOString(),
        read: false
      });
    }
  }

  return notifications;
}

async function generateParentNotifications(userId: string) {
  const notifications = [];
  
  // Get linked student
  const user = await User.findById(userId);
  const linkedStudentId = user?.profile?.linkedStudentId;
  
  if (linkedStudentId) {
    const student = await Student.findOne({ userId: linkedStudentId });
    const progress = await StudentProgress.findOne({ studentId: linkedStudentId });
    const assessment = await Assessment.findOne({ userId: linkedStudentId });
    
    if (student) {
      // Student progress updates
      if (progress) {
        const modulesCompleted = progress.totalModulesCompleted || 0;
        
        if (modulesCompleted > 0) {
          notifications.push({
            id: 'child-progress',
            title: 'Child Progress Update',
            message: `${student.fullName} has completed ${modulesCompleted} module(s) and earned ${progress.totalPoints || 0} XP!`,
            type: 'success',
            date: new Date().toISOString(),
            read: false
          });
        }
      }

      // Assessment completion
      if (assessment && assessment.diagnosticCompleted) {
        notifications.push({
          id: 'assessment-complete',
          title: 'Assessment Completed',
          message: `${student.fullName} has completed their diagnostic assessment with a score of ${assessment.diagnosticScore || 0}%.`,
          type: 'info',
          date: new Date().toISOString(),
          read: false
        });
      }
    }
  }

  return notifications;
}

async function generateTeacherNotifications(userId: string) {
  const notifications = [];
  
  // Get all students (in a real system, filter by teacher-student relationships)
  const students = await Student.find({ onboardingCompleted: true });
  const studentUserIds = students.map(s => s.userId);
  
  const progressData = await StudentProgress.find({
    studentId: { $in: studentUserIds }
  });

  // New student registrations
  const recentStudents = students.filter(s => {
    const createdAt = new Date(s.createdAt);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return createdAt >= oneWeekAgo;
  });

  if (recentStudents.length > 0) {
    notifications.push({
      id: 'new-students',
      title: 'New Students Joined',
      message: `${recentStudents.length} new student(s) have joined your class.`,
      type: 'info',
      date: new Date().toISOString(),
      read: false
    });
  }

  // Student progress milestones
  const recentProgress = progressData.filter(p => {
    const updatedAt = new Date(p.updatedAt);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return updatedAt >= oneDayAgo;
  });

  if (recentProgress.length > 0) {
    notifications.push({
      id: 'recent-activity',
      title: 'Recent Student Activity',
      message: `${recentProgress.length} student(s) have made progress in the last 24 hours.`,
      type: 'success',
      date: new Date().toISOString(),
      read: false
    });
  }

  return notifications;
}

async function generateAdminNotifications() {
  const notifications = [];
  
  // Get system statistics
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTeachers = await User.countDocuments({ role: 'teacher' });
  const totalModules = await Module.countDocuments({ isActive: true });
  
  // System health notifications
  notifications.push({
    id: 'system-health',
    title: 'System Status',
    message: `System is running smoothly with ${totalStudents} students, ${totalTeachers} teachers, and ${totalModules} active modules.`,
    type: 'info',
    date: new Date().toISOString(),
    read: false
  });

  // Recent activity
  const recentUsers = await User.find({})
    .sort({ createdAt: -1 })
    .limit(5);

  if (recentUsers.length > 0) {
    notifications.push({
      id: 'recent-users',
      title: 'Recent User Registrations',
      message: `${recentUsers.length} new user(s) have registered recently.`,
      type: 'info',
      date: new Date().toISOString(),
      read: false
    });
  }

  return notifications;
} 