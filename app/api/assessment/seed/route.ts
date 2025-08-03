import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AssessmentResponse from '@/models/AssessmentResponse';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding endpoint not available in production' },
        { status: 403 }
      );
    }

    console.log('🌱 Seeding assessment data...');
    await connectDB();

    const data = await request.json();
    const { uniqueId, assessmentType, responses, webhookTriggered, webhookTriggeredAt, generatedQuestions, isCompleted, completedAt, result } = data;

    // Verify the student exists
    const student = await Student.findOne({ uniqueId });
    if (!student) {
      return NextResponse.json(
        { error: `Student with uniqueId ${uniqueId} not found` },
        { status: 404 }
      );
    }

    // Check if assessment response already exists
    let assessmentResponse = await AssessmentResponse.findOne({
      uniqueId,
      assessmentType
    });

    if (assessmentResponse) {
      // Update existing assessment response
      assessmentResponse.responses = responses;
      assessmentResponse.webhookTriggered = webhookTriggered;
      assessmentResponse.webhookTriggeredAt = webhookTriggeredAt;
      assessmentResponse.generatedQuestions = generatedQuestions;
      assessmentResponse.isCompleted = isCompleted;
      assessmentResponse.completedAt = completedAt;
      assessmentResponse.result = result;
      assessmentResponse.updatedAt = new Date();
    } else {
      // Create new assessment response
      assessmentResponse = new AssessmentResponse({
        uniqueId,
        assessmentType,
        responses,
        webhookTriggered,
        webhookTriggeredAt,
        generatedQuestions,
        isCompleted,
        completedAt,
        result
      });
    }

    await assessmentResponse.save();

    console.log(`✅ Assessment data seeded for student: ${uniqueId}`);

    return NextResponse.json({
      success: true,
      message: 'Assessment data seeded successfully',
      data: {
        uniqueId,
        assessmentType,
        responsesCount: responses.length,
        isCompleted,
        result
      }
    });

  } catch (error) {
    console.error('❌ Error seeding assessment data:', error);
    return NextResponse.json(
      { error: 'Seeding failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET endpoint to check existing assessment data
export async function GET(request: NextRequest) {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding endpoint not available in production' },
        { status: 403 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const uniqueId = searchParams.get('uniqueId');

    if (uniqueId) {
      // Get assessment data for specific student
      const assessmentResponse = await AssessmentResponse.findOne({
        uniqueId,
        assessmentType: 'diagnostic'
      });

      if (!assessmentResponse) {
        return NextResponse.json({
          success: false,
          message: 'No assessment data found for this student'
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          uniqueId: assessmentResponse.uniqueId,
          assessmentType: assessmentResponse.assessmentType,
          responsesCount: assessmentResponse.responses.length,
          isCompleted: assessmentResponse.isCompleted,
          result: assessmentResponse.result
        }
      });
    } else {
      // Get all assessment data
      const assessmentResponses = await AssessmentResponse.find({
        assessmentType: 'diagnostic'
      }).populate('uniqueId', 'fullName');

      return NextResponse.json({
        success: true,
        data: assessmentResponses.map(ar => ({
          uniqueId: ar.uniqueId,
          assessmentType: ar.assessmentType,
          responsesCount: ar.responses.length,
          isCompleted: ar.isCompleted,
          result: ar.result
        }))
      });
    }

  } catch (error) {
    console.error('❌ Error fetching assessment data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment data: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
} 