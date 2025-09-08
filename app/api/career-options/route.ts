import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_CAREER_OPTIONS_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/learnign-path-options';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

interface CareerOption {
  ID: string;
  career: string;
  description: string;
}

// Dummy data fallback
const getDummyCareerOptions = (): CareerOption[] => [
  {
    ID: "1",
    career: "Creative Explorer",
    description: "Design, animation, and storytelling could be your world! You have a natural talent for creative expression and visual communication."
  },
  {
    ID: "2", 
    career: "Logical Leader",
    description: "You're great with strategies - future entrepreneur or engineer? Your analytical thinking and problem-solving skills are exceptional."
  },
  {
    ID: "3",
    career: "Science Detective", 
    description: "You love to explore and experiment — maybe a future scientist! Your curiosity and methodical approach to discovery are remarkable."
  },
  {
    ID: "4",
    career: "Tech Innovator",
    description: "Technology and innovation fascinate you! You have the potential to create the next big breakthrough in the digital world."
  }
];

export async function GET(request: NextRequest) {
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

    console.log('🔍 Sending uniqueID to N8N career options webhook:', {
      uniqueId: student.uniqueId,
      webhookUrl: N8N_CAREER_OPTIONS_WEBHOOK_URL
    });

    // Send uniqueID to N8N webhook using GET request
    const params = new URLSearchParams({
      uniqueId: student.uniqueId
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let n8nOutput: any;
    try {
      const response = await fetch(`${N8N_CAREER_OPTIONS_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 N8N career options webhook request failed:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Failed to get career options' },
          { status: 500 }
        );
      }

      const responseText = await response.text();
      console.log('🔍 Raw N8N career options response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('⚠️ N8N returned empty response, using dummy data fallback');
        return NextResponse.json({
          success: true,
          careerOptions: getDummyCareerOptions()
        });
      }
      
      n8nOutput = JSON.parse(responseText);
      console.log('🔍 Parsed N8N career options response:', n8nOutput);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('🔍 N8N career options webhook request timed out after 15 seconds');
      } else {
        console.error('🔍 N8N career options webhook request failed:', fetchError);
      }
      
      // Return fallback result with dummy data instead of failing
      return NextResponse.json({
        success: true,
        careerOptions: getDummyCareerOptions()
      });
    }

    // Parse the N8N output format - expecting array with output property
    let careerOptions: CareerOption[] = [];
    
    if (n8nOutput && Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      const firstItem = n8nOutput[0];
      if (firstItem.output && Array.isArray(firstItem.output)) {
        careerOptions = firstItem.output;
      } else if (Array.isArray(firstItem)) {
        careerOptions = firstItem;
      }
    } else if (n8nOutput && n8nOutput.output && Array.isArray(n8nOutput.output)) {
      careerOptions = n8nOutput.output;
    }

    console.log('🔍 Extracted career options:', careerOptions);

    return NextResponse.json({
      success: true,
      careerOptions: careerOptions,
      n8nResults: n8nOutput
    });

  } catch (error) {
    console.error('Career options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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

    // Get request body for additional parameters if needed
    const body = await request.json().catch(() => ({}));

    console.log('🔍 Sending uniqueID to N8N career options webhook (POST):', student.uniqueId);

    // Send uniqueID to N8N webhook using POST request
    const requestBody = {
      uniqueId: student.uniqueId,
      ...body
    };

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    let n8nOutput: any;
    try {
      const response = await fetch(N8N_CAREER_OPTIONS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 N8N career options webhook request failed:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Failed to get career options' },
          { status: 500 }
        );
      }

      const responseText = await response.text();
      console.log('🔍 Raw N8N career options response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('⚠️ N8N returned empty response, using dummy data fallback');
        return NextResponse.json({
          success: true,
          careerOptions: getDummyCareerOptions()
        });
      }
      
      n8nOutput = JSON.parse(responseText);
      console.log('🔍 Parsed N8N career options response:', n8nOutput);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('🔍 N8N career options webhook request timed out after 15 seconds');
      } else {
        console.error('🔍 N8N career options webhook request failed:', fetchError);
      }
      
      // Return fallback result with dummy data instead of failing
      return NextResponse.json({
        success: true,
        careerOptions: getDummyCareerOptions()
      });
    }

    // Parse the N8N output format - expecting array with output property
    let careerOptions: CareerOption[] = [];
    
    if (n8nOutput && Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      const firstItem = n8nOutput[0];
      if (firstItem.output && Array.isArray(firstItem.output)) {
        careerOptions = firstItem.output;
      } else if (Array.isArray(firstItem)) {
        careerOptions = firstItem;
      }
    } else if (n8nOutput && n8nOutput.output && Array.isArray(n8nOutput.output)) {
      careerOptions = n8nOutput.output;
    }

    console.log('🔍 Extracted career options:', careerOptions);

    return NextResponse.json({
      success: true,
      careerOptions: careerOptions,
      n8nResults: n8nOutput
    });

  } catch (error) {
    console.error('Career options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
