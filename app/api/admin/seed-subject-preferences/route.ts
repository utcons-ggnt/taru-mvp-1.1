import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding endpoint not available in production' },
        { status: 403 }
      );
    }

    console.log('📚 Seeding subject preferences...');
    await connectDB();

    const data = await request.json();
    const { uniqueId, preferredSubject } = data;

    // Verify the student exists
    const student = await Student.findOne({ uniqueId });
    if (!student) {
      return NextResponse.json(
        { error: `Student with uniqueId ${uniqueId} not found` },
        { status: 404 }
      );
    }

    // Update student with preferred subject
    student.preferredSubject = preferredSubject;
    await student.save();

    console.log(`✅ Subject preference seeded for student: ${uniqueId} -> ${preferredSubject}`);

    return NextResponse.json({
      success: true,
      message: 'Subject preference seeded successfully',
      data: {
        uniqueId,
        preferredSubject
      }
    });

  } catch (error) {
    console.error('❌ Error seeding subject preference:', error);
    return NextResponse.json(
      { error: 'Seeding failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET endpoint to check existing subject preferences
export async function GET(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding endpoint not available in production' },
        { status: 403 }
      );
    }

    await connectDB();

    const students = await Student.find({ preferredSubject: { $exists: true, $ne: null } })
      .select('uniqueId fullName preferredSubject');

    return NextResponse.json({
      success: true,
      data: students.map(student => ({
        uniqueId: student.uniqueId,
        fullName: student.fullName,
        preferredSubject: student.preferredSubject
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching subject preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subject preferences: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 