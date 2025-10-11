import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { students } = body;

    if (!students || !Array.isArray(students)) {
      return NextResponse.json(
        { error: 'Invalid students data' },
        { status: 400 }
      );
    }

    const results = {
      success: [] as any[],
      errors: [] as any[]
    };

    for (const studentData of students) {
      try {
        const { fullName, email, classGrade, schoolName } = studentData;

        // Validate required fields
        if (!fullName || !email || !classGrade) {
          results.errors.push({
            email: email || 'Unknown',
            error: 'Missing required fields (fullName, email, classGrade)'
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          results.errors.push({
            email,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Create new user
        const newUser = new User({
          name: fullName,
          email,
          role: 'student',
          onboardingCompleted: false
        });

        await newUser.save();

        // Create student record
        const newStudent = new Student({
          userId: newUser._id,
          teacherId: 'teacher123', // This should come from JWT
          classGrade,
          schoolName: schoolName || 'Not specified',
          uniqueId: `STU${Date.now()}`,
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

        results.success.push({
          id: newStudent._id.toString(),
          fullName: newUser.name,
          email: newUser.email,
          classGrade,
          uniqueId: newStudent.uniqueId
        });
      } catch (error) {
        results.errors.push({
          email: studentData.email || 'Unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: `Bulk import completed. ${results.success.length} students added successfully.`,
      results
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    return NextResponse.json(
      { error: 'Failed to import students' },
      { status: 500 }
    );
  }
}
