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

export async function GET(request: NextRequest) {
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

    // Get all students for this teacher
    const students = await Student.find({ teacherId: user._id.toString() });
    const studentUserIds = students.map(s => s.userId);
    const studentUsers = await User.find({ 
      _id: { $in: studentUserIds }, 
      role: 'student' 
    }).select('+password'); // Explicitly include password field

    // Build CSV content
    const header = [
      'Student Name',
      'Email',
      'Password',
      'Class Grade',
      'School Name',
      'Unique ID',
      'Onboarding Status',
      'Created Date'
    ];

    const rows = [header];

    students.forEach(student => {
      const studentUser = studentUsers.find(u => u._id.toString() === student.userId);
      if (studentUser) {
        rows.push([
          student.fullName || studentUser.name,
          studentUser.email,
          studentUser.password, // Include the password
          student.classGrade,
          student.schoolName,
          student.uniqueId,
          student.onboardingCompleted ? 'Completed' : 'Pending',
          student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'
        ]);
      }
    });

    // Convert to CSV format
    const csvContent = rows.map(row => 
      row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="student_credentials_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error('Error exporting student credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
