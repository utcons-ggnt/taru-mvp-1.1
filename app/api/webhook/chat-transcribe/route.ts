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

    // Convert data to query parameters for GET request
    const queryParams = new URLSearchParams({
      Queries: chatData.Queries,
      uniqueid: chatData.uniqueid,
      chapterid: chatData.chapterid
    });
    const webhookUrl = `${CHAT_WEBHOOK_URL}?${queryParams.toString()}`;

    console.log('💬 Base webhook URL:', CHAT_WEBHOOK_URL);
    console.log('💬 Final webhook URL:', webhookUrl);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    // Retry logic with exponential backoff
    let webhookResponse: Response | undefined;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`💬 Attempt ${retryCount + 1}/${maxRetries} - Calling webhook...`);
        webhookResponse = await fetch(webhookUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal
        });
        break; // Success, exit retry loop
      } catch (fetchError) {
        retryCount++;
        const errorMessage = fetchError instanceof Error ? fetchError.message : 'Unknown error';
        console.log(`💬 Attempt ${retryCount} failed:`, errorMessage);
        if (retryCount >= maxRetries) {
          throw fetchError;
        }
        const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`💬 Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (!webhookResponse) {
      throw new Error('Failed to get webhook response after all retries');
    }

    clearTimeout(timeoutId);

    console.log('💬 Webhook response status:', webhookResponse.status);
    console.log('💬 Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

    if (webhookResponse.ok) {
      const responseData = await webhookResponse.json();
      console.log('💬 Webhook call successful!');
      console.log('💬 Chat response received:', responseData);
      
      // Handle simple JSON response format
      let chatAnswer = '';
      if (responseData && typeof responseData === 'string') {
        chatAnswer = responseData;
      } else if (responseData && responseData.answer) {
        chatAnswer = responseData.answer;
      } else if (responseData && responseData.response) {
        chatAnswer = responseData.response;
      } else if (Array.isArray(responseData) && responseData.length > 0) {
        chatAnswer = responseData[0].answer || responseData[0].response || JSON.stringify(responseData[0]);
      } else {
        chatAnswer = JSON.stringify(responseData);
      }
      
      return NextResponse.json({
        success: true,
        message: 'Chat query processed successfully',
        answer: chatAnswer,
        chapterId: chapterId,
        uniqueId: student.uniqueId,
        query: query
      });
    } else {
      const errorText = await webhookResponse.text();
      console.error('💬 Failed to process chat query:', webhookResponse.status, webhookResponse.statusText);
      console.error('💬 Error response body:', errorText);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to process chat query',
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          details: errorText,
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
