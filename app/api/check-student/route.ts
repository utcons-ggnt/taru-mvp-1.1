import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get the most recent student
    const recentStudent = await Student.findOne({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      recentStudent: {
        id: recentStudent?._id,
        teacherId: recentStudent?.teacherId,
        fullName: recentStudent?.fullName,
        classGrade: recentStudent?.classGrade,
        createdAt: recentStudent?.createdAt
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
