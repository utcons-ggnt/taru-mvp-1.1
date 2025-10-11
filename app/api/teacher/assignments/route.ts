import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Assignment from '../../../../models/Assignment';
import Student from '../../../../models/Student';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/teacher/assignments called');
    
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    // For now, we'll use a mock teacher ID - in production, decode JWT
    const teacherId = 'teacher456';
    
    // Get assignments for this teacher
    const assignments = await Assignment.find({ teacherId })
      .sort({ createdAt: -1 });

    console.log(`Found ${assignments.length} assignments for teacher ${teacherId}`);

    // Get student information for each assignment
    const assignmentsData = await Promise.all(assignments.map(async (assignment: any) => {
      // Get assigned students
      const assignedStudents = await Student.find({ 
        _id: { $in: assignment.assignedStudents || [] } 
      });

      return {
        id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        subject: assignment.subject,
        grade: assignment.grade,
        dueDate: assignment.dueDate.toISOString(),
        status: assignment.status,
        assignedTo: assignment.assignedStudents?.length || 0,
        submitted: assignment.submittedCount || 0,
        totalPoints: assignment.totalPoints || 0,
        createdAt: assignment.createdAt.toISOString(),
        assignedStudents: assignedStudents.map(student => ({
          id: student._id.toString(),
          name: student.fullName,
          email: student.email || 'N/A'
        }))
      };
    }));

    return NextResponse.json({ assignments: assignmentsData });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error type:', typeof error);
    
    // Ensure we always return JSON, never HTML
    try {
      return NextResponse.json(
        { 
          error: 'Failed to fetch assignments', 
          details: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error
        },
        { status: 500 }
      );
    } catch (responseError) {
      console.error('Failed to create JSON response:', responseError);
      // Fallback response
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: 'Failed to process request'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/teacher/assignments called');
    
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed', details: dbError instanceof Error ? dbError.message : 'Unknown database error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    console.log('Received assignment data:', body);
    const { title, description, subject, grade, dueDate, assignedStudents, totalPoints } = body;

    // Validate required fields
    console.log('Validating fields:', { title, description, subject, grade, dueDate });
    if (!title || !description || !subject || !grade || !dueDate) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Validation passed, proceeding to create assignment');

    // Create new assignment
    const newAssignment = new Assignment({
      teacherId: 'teacher456', // This should come from JWT
      title,
      description,
      subject,
      grade,
      dueDate: new Date(dueDate),
      assignedStudents: assignedStudents || [],
      totalPoints: totalPoints || 100,
      status: 'active',
      submittedCount: 0,
      createdAt: new Date()
    });

    const savedAssignment = await newAssignment.save();
    console.log('Assignment saved successfully:', savedAssignment._id);

    // Verify the data was saved correctly
    const verifyAssignment = await Assignment.findById(savedAssignment._id);
    
    if (!verifyAssignment) {
      throw new Error('Failed to verify saved assignment');
    }
    
    console.log('Assignment verification successful - record exists in database');

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment: {
        id: savedAssignment._id.toString(),
        title: savedAssignment.title,
        description: savedAssignment.description,
        subject: savedAssignment.subject,
        grade: savedAssignment.grade,
        dueDate: savedAssignment.dueDate.toISOString(),
        status: savedAssignment.status,
        assignedTo: savedAssignment.assignedStudents?.length || 0,
        submitted: savedAssignment.submittedCount || 0,
        totalPoints: savedAssignment.totalPoints,
        createdAt: savedAssignment.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error type:', typeof error);
    
    // Ensure we always return JSON, never HTML
    try {
      return NextResponse.json(
        { 
          error: 'Failed to create assignment', 
          details: error instanceof Error ? error.message : 'Unknown error',
          type: typeof error
        },
        { status: 500 }
      );
    } catch (responseError) {
      console.error('Failed to create JSON response:', responseError);
      // Fallback response
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          details: 'Failed to process request'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
}