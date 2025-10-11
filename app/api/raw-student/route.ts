import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get the most recent student directly from the database
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ error: 'Database not connected' }, { status: 500 });
    }
    const students = await db.collection('students').find({}).sort({ createdAt: -1 }).limit(1).toArray();
    
    return NextResponse.json({ 
      students: students.map(student => ({
        id: student._id,
        teacherId: student.teacherId,
        fullName: student.fullName,
        classGrade: student.classGrade,
        createdAt: student.createdAt,
        allFields: Object.keys(student)
      }))
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
