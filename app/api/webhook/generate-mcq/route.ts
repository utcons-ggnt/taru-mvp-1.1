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
    console.log('🧠 Base webhook URL:', MCQ_WEBHOOK_URL);

    // Add timeout to prevent hanging requests (N8N takes ~20 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      // Call the N8N webhook with GET request and query parameters
      const queryParams = new URLSearchParams({
        Quetionformate: mcqData.Quetionformate,
        uniqueid: mcqData.uniqueid,
        chapterid: mcqData.chapterid
      });
      
      const webhookUrl = `${MCQ_WEBHOOK_URL}?${queryParams.toString()}`;
      console.log('🧠 Final webhook URL:', webhookUrl);
      
      // Add retry logic for network issues
      let webhookResponse: Response | undefined;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          console.log(`🧠 Attempt ${retryCount + 1}/${maxRetries} - Calling webhook...`);
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
          console.log(`🧠 Attempt ${retryCount} failed:`, errorMessage);
          
          if (retryCount >= maxRetries) {
            throw fetchError; // Re-throw if all retries exhausted
          }
          
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
          console.log(`🧠 Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      clearTimeout(timeoutId);
      
      if (!webhookResponse) {
        throw new Error('Failed to get webhook response after all retries');
      }
      
      console.log('🧠 Webhook response status:', webhookResponse.status);
      console.log('🧠 Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

      if (webhookResponse.ok) {
        console.log('🧠 Webhook call successful!');
      const responseData = await webhookResponse.json();
      console.log('🧠 MCQ generated successfully:', responseData);
      
      // Parse the questions from the response
      let questions = [];
      try {
        if (responseData && responseData.length > 0 && responseData[0].output) {
          questions = JSON.parse(responseData[0].output);
          console.log('🧠 Parsed questions:', questions);
        }
      } catch (parseError) {
        console.error('🧠 Error parsing MCQ response:', parseError);
        console.error('🧠 Raw response data:', responseData);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to parse MCQ response',
            details: 'Invalid JSON format in webhook response',
            rawResponse: responseData
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
        const errorText = await webhookResponse.text();
        console.error('🧠 Error response body:', errorText);
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to generate MCQ questions',
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            errorDetails: errorText,
            chapterId: chapterId,
            uniqueId: student.uniqueId
          },
          { status: 500 }
        );
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('🧠 Fetch error:', fetchError);
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Network error while calling MCQ webhook',
          details: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
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
