import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';
import connectDB from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
  fullName: string;
  role: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Interest Assessment API called at:', new Date().toISOString());
    console.log('🔍 Request headers:', Object.fromEntries(request.headers.entries()));
    
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

    // Check if user is a student
    if (decoded.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can complete interest assessments' },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Get student data
    const student = await Student.findOne({ userId: decoded.userId });
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get request body
    const body = await request.json();
    const {
      broadInterestClusters,
      clusterDeepDive,
      personalityInsights,
      careerDirection
    } = body;

    // Validate required fields
    if (!broadInterestClusters || !Array.isArray(broadInterestClusters) || broadInterestClusters.length === 0) {
      return NextResponse.json({ error: 'Broad interest clusters are required' }, { status: 400 });
    }

    if (!personalityInsights || !personalityInsights.learningStyle || !personalityInsights.challengeApproach || !personalityInsights.coreValues) {
      return NextResponse.json({ error: 'Personality insights are required' }, { status: 400 });
    }

    if (!careerDirection || !careerDirection.dreamCareer || !careerDirection.excitingCareerTypes || !careerDirection.careerAttraction) {
      return NextResponse.json({ error: 'Career direction information is required' }, { status: 400 });
    }

    // Update student with interest assessment data
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      {
        $set: {
          broadInterestClusters,
          clusterDeepDive,
          personalityInsights,
          careerDirection,
          interestAssessmentCompleted: true,
          interestAssessmentCompletedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
    }

    // Check if webhook has already been triggered for this student
    const existingAssessmentResponse = await AssessmentResponse.findOne({
      uniqueId: updatedStudent.uniqueId,
      assessmentType: 'diagnostic',
      webhookTriggered: true
    });

    if (existingAssessmentResponse) {
      console.log('🔍 Webhook already triggered for student:', updatedStudent.uniqueId, 'skipping');
      return NextResponse.json({
        success: true,
        message: 'Interest assessment completed successfully (webhook already triggered)',
        student: {
          id: updatedStudent._id,
          uniqueId: updatedStudent.uniqueId,
          interestAssessmentCompleted: updatedStudent.interestAssessmentCompleted
        }
      });
    }

    // Trigger n8n webhook for assessment questions generation after interest assessment
    console.log('🔍 About to trigger webhook for student:', updatedStudent.uniqueId);
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const skipN8NWebhook = process.env.SKIP_N8N_WEBHOOK === 'true';
    
    if (skipN8NWebhook) {
      console.log('🔍 Skipping n8n webhook (SKIP_N8N_WEBHOOK=true)');
      console.log('🔍 Assessment will use fallback questions from API');
      
      // Create a basic assessment response entry for development
      try {
        let assessmentResponse = await AssessmentResponse.findOne({
          uniqueId: updatedStudent.uniqueId,
          assessmentType: 'diagnostic'
        });

        if (!assessmentResponse) {
          assessmentResponse = new AssessmentResponse({
            uniqueId: updatedStudent.uniqueId,
            assessmentType: 'diagnostic',
            responses: [],
            webhookTriggered: false,
            webhookTriggeredAt: new Date(),
            generatedQuestions: [] // Will use fallback questions
          });
          await assessmentResponse.save();
          console.log('🔍 Created assessment response entry for development mode');
        }
      } catch (devError) {
        console.error('🔍 Error creating development assessment response:', devError);
      }
    } else {
      // Production n8n webhook logic
      try {
        const webhookPayload = [
          {
            "UniqueID": updatedStudent.uniqueId,
            "submittedAt": new Date().toISOString()
          }
        ];

        console.log('🔍 Triggering n8n webhook with GET parameters:', {
          UniqueID: updatedStudent.uniqueId,
          submittedAt: new Date().toISOString()
        });

        // Build query parameters for GET request
        const params = new URLSearchParams({
          UniqueID: updatedStudent.uniqueId,
          submittedAt: new Date().toISOString()
        });

        const webhookResponse = await fetch(`https://nclbtaru.app.n8n.cloud/webhook/assessment-questions?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (webhookResponse.ok) {
          const responseData = await webhookResponse.json();
          console.log('🔍 n8n webhook triggered successfully, response:', responseData);
          
          // Store the generated questions in assessment response
          if (responseData && responseData[0] && responseData[0].output) {
            let assessmentResponse = await AssessmentResponse.findOne({
              uniqueId: updatedStudent.uniqueId,
              assessmentType: 'diagnostic'
            });

            if (!assessmentResponse) {
              assessmentResponse = new AssessmentResponse({
                uniqueId: updatedStudent.uniqueId,
                assessmentType: 'diagnostic',
                responses: []
              });
            }

            assessmentResponse.generatedQuestions = responseData[0].output;
            assessmentResponse.webhookTriggered = true;
            assessmentResponse.webhookTriggeredAt = new Date();
            await assessmentResponse.save();

            console.log('🔍 Generated questions stored for student:', updatedStudent.uniqueId);
          }
        } else {
          console.error('🔍 Failed to trigger n8n webhook:', webhookResponse.status, webhookResponse.statusText);
          console.log('🔍 Falling back to default assessment questions');
        }
      } catch (webhookError) {
        console.error('🔍 Error triggering n8n webhook:', webhookError);
        console.log('🔍 Falling back to default assessment questions');
        // Don't fail the interest assessment if webhook fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Interest assessment completed successfully',
      student: {
        id: updatedStudent._id,
        uniqueId: updatedStudent.uniqueId,
        interestAssessmentCompleted: updatedStudent.interestAssessmentCompleted
      }
    });

  } catch (error) {
    console.error('Error saving interest assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
