import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const CHAT_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/chat-transcribe';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('💬 Chat Transcription API called at:', new Date().toISOString());
    
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
    const { query, chapterId } = await request.json();
    
    if (!query || !chapterId) {
      return NextResponse.json(
        { error: 'Query and Chapter ID are required' },
        { status: 400 }
      );
    }

    console.log('💬 Processing chat query for:', {
      uniqueId: student.uniqueId,
      chapterId: chapterId,
      query: query
    });

    // Prepare data for N8N webhook
    const chatData = {
      Queries: query,
      uniqueid: student.uniqueId,
      chapterid: chapterId
    };

    console.log('💬 Calling N8N chat webhook with data:', chatData);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const webhookResponse = await fetch(CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([chatData]),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (webhookResponse.ok) {
      const responseData = await webhookResponse.json();
      console.log('💬 Chat response received:', responseData);
      
      return NextResponse.json({
        success: true,
        message: 'Chat query processed successfully',
        response: responseData,
        chapterId: chapterId,
        uniqueId: student.uniqueId,
        query: query
      });
    } else {
      console.error('💬 Failed to process chat query:', webhookResponse.status, webhookResponse.statusText);
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process chat query',
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          chapterId: chapterId,
          uniqueId: student.uniqueId,
          query: query
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💬 Chat Transcription API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Chat query request timed out',
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
