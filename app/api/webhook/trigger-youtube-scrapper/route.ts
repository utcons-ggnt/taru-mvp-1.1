import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_YOUTUBE_SCRAPPER_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/YoutubeLinkscrapper';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 YouTube Scrapper Webhook API called at:', new Date().toISOString());
    
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

    // Get request body
    const { uniqueid } = await request.json();

    if (!uniqueid) {
      return NextResponse.json(
        { error: 'uniqueid is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Triggering YouTube scrapper webhook for uniqueid:', uniqueid);

    // Trigger N8N webhook for YouTube scrapping
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const skipN8NWebhook = process.env.SKIP_N8N_WEBHOOK === 'true';
    
    if (skipN8NWebhook) {
      console.log('🔍 Skipping N8N webhook (SKIP_N8N_WEBHOOK=true)');
      return NextResponse.json({
        success: true,
        message: 'YouTube scrapper webhook triggered (development mode)',
        uniqueid: uniqueid,
        webhookSkipped: true
      });
    }

    try {
      // Build query parameters for GET request
      const params = new URLSearchParams({
        uniqueid: uniqueid,
        timestamp: new Date().toISOString()
      });

      console.log('🔍 Triggering N8N YouTube scrapper webhook:', {
        url: `${N8N_YOUTUBE_SCRAPPER_WEBHOOK_URL}?${params}`,
        uniqueid: uniqueid
      });

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const webhookResponse = await fetch(`${N8N_YOUTUBE_SCRAPPER_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (webhookResponse.ok) {
        const responseData = await webhookResponse.json();
        console.log('🔍 N8N YouTube scrapper webhook triggered successfully:', responseData);
        
        return NextResponse.json({
          success: true,
          message: 'YouTube scrapper webhook triggered successfully',
          uniqueid: uniqueid,
          webhookResponse: responseData
        });
      } else {
        console.error('🔍 Failed to trigger N8N YouTube scrapper webhook:', webhookResponse.status, webhookResponse.statusText);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to trigger YouTube scrapper webhook',
            status: webhookResponse.status,
            statusText: webhookResponse.statusText
          },
          { status: 500 }
        );
      }
    } catch (webhookError) {
      console.error('🔍 Error triggering N8N YouTube scrapper webhook:', webhookError);
      
      if (webhookError instanceof Error && webhookError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false,
            error: 'YouTube scrapper webhook request timed out',
            uniqueid: uniqueid
          },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to trigger YouTube scrapper webhook',
          details: webhookError instanceof Error ? webhookError.message : 'Unknown error',
          uniqueid: uniqueid
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('YouTube scrapper webhook API error:', error);
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

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 YouTube Scrapper Webhook API (GET) called at:', new Date().toISOString());
    
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

    // Get uniqueid from query parameters
    const { searchParams } = new URL(request.url);
    const uniqueid = searchParams.get('uniqueid');

    if (!uniqueid) {
      return NextResponse.json(
        { error: 'uniqueid parameter is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Triggering YouTube scrapper webhook (GET) for uniqueid:', uniqueid);

    // Trigger N8N webhook for YouTube scrapping
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const skipN8NWebhook = process.env.SKIP_N8N_WEBHOOK === 'true';
    
    if (skipN8NWebhook) {
      console.log('🔍 Skipping N8N webhook (SKIP_N8N_WEBHOOK=true)');
      return NextResponse.json({
        success: true,
        message: 'YouTube scrapper webhook triggered (development mode)',
        uniqueid: uniqueid,
        webhookSkipped: true
      });
    }

    try {
      // Build query parameters for GET request
      const params = new URLSearchParams({
        uniqueid: uniqueid,
        timestamp: new Date().toISOString()
      });

      console.log('🔍 Triggering N8N YouTube scrapper webhook (GET):', {
        url: `${N8N_YOUTUBE_SCRAPPER_WEBHOOK_URL}?${params}`,
        uniqueid: uniqueid
      });

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const webhookResponse = await fetch(`${N8N_YOUTUBE_SCRAPPER_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (webhookResponse.ok) {
        const responseData = await webhookResponse.json();
        console.log('🔍 N8N YouTube scrapper webhook triggered successfully (GET):', responseData);
        
        return NextResponse.json({
          success: true,
          message: 'YouTube scrapper webhook triggered successfully',
          uniqueid: uniqueid,
          webhookResponse: responseData
        });
      } else {
        console.error('🔍 Failed to trigger N8N YouTube scrapper webhook (GET):', webhookResponse.status, webhookResponse.statusText);
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to trigger YouTube scrapper webhook',
            status: webhookResponse.status,
            statusText: webhookResponse.statusText
          },
          { status: 500 }
        );
      }
    } catch (webhookError) {
      console.error('🔍 Error triggering N8N YouTube scrapper webhook (GET):', webhookError);
      
      if (webhookError instanceof Error && webhookError.name === 'AbortError') {
        return NextResponse.json(
          { 
            success: false,
            error: 'YouTube scrapper webhook request timed out',
            uniqueid: uniqueid
          },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to trigger YouTube scrapper webhook',
          details: webhookError instanceof Error ? webhookError.message : 'Unknown error',
          uniqueid: uniqueid
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('YouTube scrapper webhook API error (GET):', error);
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
