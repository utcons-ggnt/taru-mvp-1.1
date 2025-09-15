import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import { processLearningPathData, saveLearningPathToDatabase, createLearningPathResponse, saveN8NLearningPathResponse } from '@/lib/utils/learningPathUtils';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
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

    // Get student profile
    const student = await Student.findOne({ 
      userId: decoded.userId,
      onboardingCompleted: true 
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get career details from request body
    const { careerDetails, careerPath } = await request.json();

    if (!careerDetails || !careerPath) {
      return NextResponse.json(
        { error: 'Career details and career path are required' },
        { status: 400 }
      );
    }

    if (!careerDetails.output?.learningPath || careerDetails.output.learningPath.length === 0) {
      return NextResponse.json(
        { error: 'No learning path data to save' },
        { status: 400 }
      );
    }

    console.log('💾 Saving learning path for career:', careerPath, 'student:', student.uniqueId);

    // Save N8N output directly in the exact database format
    const responseResult = await saveN8NLearningPathResponse(
      careerDetails.output,
      student.uniqueId
    );

    // Create the learning path response for API response
    const learningPathResponse = createLearningPathResponse(
      careerDetails.output,
      student.uniqueId
    );

    // Process the raw learning path data for database storage
    const processedData = processLearningPathData(
      careerDetails.output,
      student,
      careerPath,
      'n8n'
    );

    // Save to database with validation
    const result = await saveLearningPathToDatabase(processedData);
    
    if (result.success && responseResult.success) {
      console.log('✅ Learning path and response saved successfully:', result.pathId, responseResult.id);
      return NextResponse.json({
        success: true,
        message: 'Learning path saved successfully',
        pathId: result.pathId,
        responseId: responseResult.id,
        learningPathResponse: learningPathResponse
      });
    } else {
      const errors = [];
      if (!result.success) errors.push(result.error);
      if (!responseResult.success) errors.push(responseResult.error);
      
      console.error('❌ Failed to save learning path:', errors);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to save learning path',
          details: errors.join('; ')
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Learning path save error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
