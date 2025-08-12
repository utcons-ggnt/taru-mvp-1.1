import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_SCORE_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/Score-result';

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

    // Get assessment response
    const assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic',
      isCompleted: true
    });

    if (!assessmentResponse) {
      return NextResponse.json(
        { error: 'Assessment not completed' },
        { status: 404 }
      );
    }

    console.log('🔍 Sending uniqueID to N8N Score-result webhook:', student.uniqueId);

    // Send uniqueID to N8N webhook using GET request
    const params = new URLSearchParams({
      uniqueId: student.uniqueId
    });

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let n8nOutput: any; // Declare n8nOutput here
    try {
      const response = await fetch(`${N8N_SCORE_WEBHOOK_URL}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('🔍 N8N webhook request failed:', response.status, response.statusText);
        return NextResponse.json(
          { error: 'Failed to get assessment results' },
          { status: 500 }
        );
      }

      // Add better error handling for JSON parsing
      const responseText = await response.text();
      console.log('🔍 Raw N8N response text:', responseText);
      
      if (!responseText || responseText.trim() === '') {
        console.log('⚠️ N8N returned empty response, using fallback');
        return NextResponse.json({
          success: true,
          result: {
            totalQuestions: 0,
            score: 0,
            summary: 'Assessment completed successfully!',
            n8nResults: null
          }
        });
      }
      
      n8nOutput = JSON.parse(responseText);
      console.log('🔍 Parsed N8N webhook response:', n8nOutput);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('🔍 N8N webhook request timed out after 10 seconds');
      } else {
        console.error('🔍 N8N webhook request failed:', fetchError);
      }
      
      // Return fallback result instead of failing
      return NextResponse.json({
        success: true,
        result: {
          totalQuestions: 0,
          score: 0,
          summary: 'Assessment completed successfully!',
          n8nResults: null
        }
      });
    }

    // Parse the N8N output format
    let result = null;
    if (n8nOutput && Array.isArray(n8nOutput) && n8nOutput.length > 0) {
      result = n8nOutput[0];
      console.log('🔍 Parsed N8N result:', result);
    } else if (n8nOutput && typeof n8nOutput === 'object') {
      result = n8nOutput;
      console.log('🔍 Using direct N8N result:', result);
    }

    if (!result) {
      console.log('⚠️ No valid result from N8N, using fallback');
      return NextResponse.json({
        success: true,
        result: {
          totalQuestions: 0,
          score: 0,
          summary: 'Assessment completed successfully!',
          n8nResults: null
        }
      });
    }

    // Update assessment response with N8N results
    assessmentResponse.result = {
      type: 'Assessment Completed',
      description: result.Summery || 'Assessment completed successfully!',
      score: result.Score || 0,
      learningStyle: 'Mixed',
      recommendations: [
        { title: 'Continue Learning', description: 'Keep exploring your interests', xp: 50 },
        { title: 'Practice Regularly', description: 'Consistent practice leads to improvement', xp: 75 },
        { title: 'Seek Help When Needed', description: 'Don\'t hesitate to ask questions', xp: 30 }
      ],
      totalQuestions: result['Total Questions'] || 0,
      n8nResults: result
    };

    await assessmentResponse.save();
    console.log('🔍 Assessment response updated with N8N results');

    return NextResponse.json({
      success: true,
      result: {
        totalQuestions: result['Total Questions'] || 0,
        score: result.Score || 0,
        summary: result.Summery || 'Assessment completed successfully!',
        n8nResults: result
      }
    });

  } catch (error) {
    console.error('Assessment result error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Test N8N webhook connectivity
    try {
      console.log('🔍 Testing N8N webhook connectivity...');
      const testResponse = await fetch(`${N8N_SCORE_WEBHOOK_URL}?uniqueId=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log('🔍 N8N test response status:', testResponse.status);
      console.log('🔍 N8N test response headers:', Object.fromEntries(testResponse.headers.entries()));
      
      if (testResponse.ok) {
        const testText = await testResponse.text();
        console.log('🔍 N8N test response text:', testText);
        
        try {
          const testJson = JSON.parse(testText);
          console.log('🔍 N8N test response JSON:', testJson);
        } catch (parseError) {
          console.log('🔍 N8N test response is not valid JSON');
        }
      }
    } catch (testError) {
      console.error('🔍 N8N webhook test failed:', testError);
    }

    // Get assessment response
    const assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic',
      isCompleted: true
    });

    if (!assessmentResponse) {
      return NextResponse.json(
        { error: 'Assessment not completed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      result: assessmentResponse.result || {
        type: 'Assessment Completed',
        description: 'Assessment completed successfully!',
        score: 0,
        learningStyle: 'Mixed',
        recommendations: [
          { title: 'Continue Learning', description: 'Keep exploring your interests', xp: 50 },
          { title: 'Practice Regularly', description: 'Consistent practice leads to improvement', xp: 75 },
          { title: 'Seek Help When Needed', description: 'Don\'t hesitate to ask questions', xp: 30 }
        ],
        totalQuestions: 0,
        n8nResults: null
      }
    });

  } catch (error) {
    console.error('Assessment result error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}