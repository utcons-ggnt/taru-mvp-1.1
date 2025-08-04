import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AssessmentResponse from '@/models/AssessmentResponse';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Webhook received from n8n');
    
    // Connect to database
    await connectDB();

    const payload = await request.json();
    console.log('🔍 Webhook payload:', payload);

    const { uniqueId, generatedQuestions } = payload;

    if (!uniqueId) {
      return NextResponse.json(
        { error: 'uniqueId is required' },
        { status: 400 }
      );
    }

    // Find the student
    const student = await Student.findOne({ uniqueId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Find or create assessment response
    let assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic'
    });

    if (!assessmentResponse) {
      assessmentResponse = new AssessmentResponse({
        uniqueId: student.uniqueId,
        assessmentType: 'diagnostic',
        responses: []
      });
    }

    // Update with generated questions
    assessmentResponse.generatedQuestions = generatedQuestions || [];
    assessmentResponse.webhookTriggered = true;
    assessmentResponse.webhookTriggeredAt = new Date();

    await assessmentResponse.save();

    console.log(`🔍 Webhook processed successfully for student ${uniqueId}`);

    return NextResponse.json({
      success: true,
      message: 'Questions generated and stored successfully',
      studentId: uniqueId,
      questionsCount: generatedQuestions?.length || 0
    });

  } catch (error) {
    console.error('🔍 Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}