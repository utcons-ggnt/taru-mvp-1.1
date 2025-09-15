import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const YOUTUBE_SCRAPING_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/YoutubeLinkscrapper';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 YouTube Scraping API called at:', new Date().toISOString());
    
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

    console.log('🎬 Triggering YouTube scraping for:', {
      uniqueId: student.uniqueId,
      fullName: student.fullName,
      classGrade: student.classGrade
    });

    // Prepare uniqueId for N8N webhook - use GET request with query parameters
    const uniqueId = student.uniqueId;

    console.log('🎬 Calling N8N YouTube scraping webhook with uniqueId only:', uniqueId);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for scraping

    // Build GET URL with query parameters
    const urlParams = new URLSearchParams({
      uniqueid: uniqueId
    });
    const webhookUrl = `${YOUTUBE_SCRAPING_WEBHOOK_URL}?${urlParams.toString()}`;

    console.log('🎬 Calling N8N webhook:', webhookUrl);

    const webhookResponse = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('🎬 Webhook response status:', webhookResponse.status);
    console.log('🎬 Webhook response headers:', Object.fromEntries(webhookResponse.headers.entries()));

    if (webhookResponse.ok) {
      const responseData = await webhookResponse.json();
      console.log('🎬 YouTube scraping triggered successfully:', responseData);
      
      return NextResponse.json({
        success: true,
        message: 'YouTube scraping triggered successfully',
        studentInfo: {
          uniqueId: student.uniqueId,
          fullName: student.fullName,
          classGrade: student.classGrade,
          schoolName: student.schoolName,
          email: student.email
        },
        webhookResponse: responseData,
        note: 'Please wait for the scraping to complete. Modules will be available shortly.'
      });
    } else {
      const errorText = await webhookResponse.text();
      console.error('🎬 Failed to trigger YouTube scraping:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        errorText: errorText,
        webhookUrl: webhookUrl
      });
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to trigger YouTube scraping',
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          details: errorText,
          webhookUrl: webhookUrl,
          studentInfo: {
            uniqueId: student.uniqueId,
            fullName: student.fullName,
            classGrade: student.classGrade,
            schoolName: student.schoolName,
            email: student.email
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('🎬 YouTube Scraping API error:', error);
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { 
          success: false,
          error: 'YouTube scraping request timed out',
          details: 'The scraping request took too long to complete'
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
