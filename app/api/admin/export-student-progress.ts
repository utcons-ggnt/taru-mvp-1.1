import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();

    // Get all students
    const students = await Student.find({ onboardingCompleted: true });
    const userIds = students.map(s => s.userId);
    const users = await User.find({ _id: { $in: userIds }, role: 'student' });
    const progresses = await StudentProgress.find({ studentId: { $in: userIds } });

    // Build CSV rows
    const header = [
      'Name', 'Email', 'Grade', 'Unique ID', 'Modules Completed', 'Total Points', 'Total Watch Time (min)', 'Learning Streak', 'Badges Earned'
    ];
    const rows = [header];

    students.forEach(student => {
      const user = users.find(u => u._id.toString() === student.userId);
      const progress = progresses.find(p => p.studentId === student.userId);
      rows.push([
        user?.name || student.fullName || '',
        user?.email || '',
        student.classGrade || '',
        student.uniqueId || '',
        progress?.totalModulesCompleted?.toString() || '0',
        progress?.totalPoints?.toString() || '0',
        progress?.totalWatchTime?.toString() || '0',
        progress?.learningStreak?.toString() || '0',
        (progress?.badgesEarned || []).join('; ')
      ]);
    });

    const csvContent = rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="all_student_progress.csv"'
      }
    });
  } catch (error) {
    console.error('Export student progress error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 