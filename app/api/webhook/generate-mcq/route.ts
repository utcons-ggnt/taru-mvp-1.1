import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MCQ_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 MCQ Generation API called at:', new Date().toISOString());
    
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
        { error: 'Student not found or onboarding not completed' },
        { status: 404 }
      );
    }

    // Parse request body
    const { chapterId } = await request.json();
    
    if (!chapterId) {
      return NextResponse.json(
        { error: 'Chapter ID is required' },
        { status: 400 }
      );
    }

    console.log('🧠 Generating MCQ for:', {
      uniqueId: student.uniqueId,
      chapterId: chapterId
    });

    // Prepare data for N8N webhook
    const mcqData = {
      Quetionformate: "MCQ",
      uniqueid: student.uniqueId,
      chapterid: chapterId
    };

    console.log('🧠 Calling N8N MCQ webhook with data:', mcqData);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const webhookResponse = await fetch(MCQ_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([mcqData]),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (webhookResponse.ok) {
      const responseData = await webhookResponse.json();
      console.log('🧠 MCQ generated successfully:', responseData);
      
      // Parse the questions from the response
      let questions = [];
      try {
        if (responseData && responseData.length > 0 && responseData[0].output) {
          questions = JSON.parse(responseData[0].output);
        }
      } catch (parseError) {
        console.error('🧠 Error parsing MCQ response:', parseError);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to parse MCQ response',
            details: 'Invalid JSON format in webhook response'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'MCQ questions generated successfully',
        questions: questions,
        chapterId: chapterId,
        uniqueId: student.uniqueId
      });
    } else {
      console.error('🧠 Failed to generate MCQ:', webhookResponse.status, webhookResponse.statusText);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to generate MCQ questions',
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          chapterId: chapterId,
          uniqueId: student.uniqueId
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🧠 MCQ Generation API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'MCQ generation request timed out',
          details: 'The request took too long to complete'
        },
        { status: 408 }
      );
    }
    
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
