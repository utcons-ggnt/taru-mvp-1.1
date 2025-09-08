import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Assessment from '@/models/Assessment';
import AssessmentResponse from '@/models/AssessmentResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_ASSESSMENT_WEBHOOK_URL = process.env.N8N_ASSESSMENT_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/assessment-questions';
const N8N_FALLBACK_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

// Function to retrigger webhook for new questions
async function retriggerWebhook(student: any, user: any) {
  // Prepare data for N8N
  const assessmentData = {
    studentId: user._id,
    studentName: user.name,
    uniqueId: student.uniqueId,
    age: student.age,
    classGrade: student.classGrade,
    languagePreference: student.languagePreference,
    schoolName: student.schoolName,
    preferredSubject: student.preferredSubject,
    type: 'diagnostic',
    timestamp: new Date().toISOString()
  };

  // Call N8N webhook to generate questions
  let webhookUrl = N8N_ASSESSMENT_WEBHOOK_URL;
  let usedFallback = false;
  let rawResponse;

  // Try primary webhook first, then fallback if needed
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}: Trying webhook:`, webhookUrl);

      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Convert payload to URL parameters for GET request
      const urlParams = new URLSearchParams({
        uniqueID: student.uniqueId, // Use actual student unique ID
        submittedAt: new Date().toISOString()
      });

      const getUrl = `${webhookUrl}?${urlParams.toString()}`;
      console.log('🔗 Full webhook URL:', getUrl);

      const response = await fetch(getUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('📡 Webhook response status:', response.status);

      try {
        const responseText = await response.text();
        console.log('📥 N8N Raw response text:', responseText);

        if (!responseText || responseText.trim() === '') {
          console.warn('📥 Empty response from N8N webhook');
          if (attempt === 1) {
            console.log('🔄 Empty response, trying fallback webhook...');
            webhookUrl = N8N_FALLBACK_WEBHOOK_URL;
            usedFallback = true;
            continue;
          } else {
            rawResponse = { error: 'Empty response from N8N webhook' };
            break;
          }
        } else {
          try {
            rawResponse = JSON.parse(responseText);
            console.log('📥 N8N Parsed Response:', JSON.stringify(rawResponse, null, 2));
            break; // Success, exit the retry loop
          } catch (parseError) {
            console.error('📥 Failed to parse response text as JSON:', parseError);
            if (attempt === 1) {
              console.log('🔄 JSON parse error, trying fallback webhook...');
              webhookUrl = N8N_FALLBACK_WEBHOOK_URL;
              usedFallback = true;
              continue;
            } else {
              rawResponse = { error: 'Invalid JSON response from N8N', rawText: responseText };
              break;
            }
          }
        }
      } catch (textError) {
        console.error('📥 Failed to get response text:', textError);
        if (attempt === 1) {
          console.log('🔄 Text read error, trying fallback webhook...');
          webhookUrl = N8N_FALLBACK_WEBHOOK_URL;
          usedFallback = true;
          continue;
        } else {
          rawResponse = { error: 'Failed to read response from N8N' };
          break;
        }
      }
    } catch (fetchError: unknown) {
      const error = fetchError as Error & { code?: string };
      console.error(`🔄 Attempt ${attempt} failed:`, error);

      if (attempt === 1) {
        console.log('🔄 Fetch error, trying fallback webhook...');
        webhookUrl = N8N_FALLBACK_WEBHOOK_URL;
        usedFallback = true;
        continue;
      } else {
        let errorMessage = 'Connection failed';
        if (error.name === 'AbortError') {
          errorMessage = 'Webhook timeout (30s)';
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = 'Webhook URL not found';
        } else if (error.code === 'ECONNREFUSED') {
          errorMessage = 'Connection refused';
        }

        console.error('Diagnosed issue:', errorMessage);
        rawResponse = { error: `Webhook unreachable: ${errorMessage}` };
        break;
      }
    }
  }

  // Store the generated questions in the database
  let assessmentResponse = await AssessmentResponse.findOne({
    uniqueId: student.uniqueId,
    assessmentType: 'diagnostic'
  });

  if (!assessmentResponse) {
    assessmentResponse = new AssessmentResponse({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic',
      responses: [],
      webhookTriggered: true,
      generatedQuestions: rawResponse
    });
  } else {
    assessmentResponse.generatedQuestions = rawResponse;
    assessmentResponse.webhookTriggered = true;
    assessmentResponse.webhookTriggeredAt = new Date();
  }

  await assessmentResponse.save();
  console.log('🔍 Saved new N8N questions to database for student:', student.uniqueId);

  return {
    success: true,
    usedFallback: usedFallback,
    webhookUrl: webhookUrl
  };
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

    // Verify user is a student
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can reset diagnostic assessment' },
        { status: 403 }
      );
    }

    // Get student profile for webhook data
    const student = await Student.findOne({ userId: decoded.userId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }

    // Get user's uniqueId for deleting assessment responses
    const userUniqueId = user.uniqueId;
    
    // Delete all assessment responses for this user
    if (userUniqueId) {
      const deleteResult = await AssessmentResponse.deleteMany({ uniqueId: userUniqueId });
      console.log(`Deleted ${deleteResult.deletedCount} assessment responses for user: ${userUniqueId}`);
    } else {
      console.log('No uniqueId found for user, skipping response deletion');
    }
    
    // Reset diagnostic assessment data in Assessment model
    await Assessment.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $unset: {
          diagnosticCompleted: 1,
          diagnosticScore: 1,
          diagnosticResults: 1
        }
      },
      { new: true }
    );

    // Retrigger webhook to generate new questions
    console.log('🔄 Retriggering webhook for new questions...');
    try {
      await retriggerWebhook(student, user);
      console.log('✅ Webhook retriggered successfully');
    } catch (webhookError) {
      console.error('⚠️ Webhook retrigger failed:', webhookError);
      // Don't fail the entire reset if webhook fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic assessment reset successfully and new questions generated'
    });

  } catch (error) {
    console.error('Reset diagnostic assessment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 