import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AssessmentResponse from '@/models/AssessmentResponse';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Assessment analysis result webhook received from n8n');
    
    // Connect to database
    await connectDB();

    const payload = await request.json();
    console.log('🔍 Analysis result payload:', payload);

    const { 
      uniqueId, 
      analysisResult,
      learningStyle,
      personalityType,
      recommendations,
      score 
    } = payload;

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

    // Find assessment response
    const assessmentResponse = await AssessmentResponse.findOne({
      uniqueId: student.uniqueId,
      assessmentType: 'diagnostic'
    });

    if (!assessmentResponse) {
      return NextResponse.json(
        { error: 'Assessment response not found' },
        { status: 404 }
      );
    }

    // Update with n8n analysis results
    assessmentResponse.result = {
      type: personalityType || 'Visual Superstar',
      description: analysisResult?.description || 'You learn best with fun visuals and bright colors!',
      score: score || assessmentResponse.result?.score || 85,
      learningStyle: learningStyle || 'Visual',
      recommendations: recommendations || [
        { 
          title: 'The Water Cycle', 
          description: 'Learn about water cycle with visual animations', 
          xp: 75 
        },
        { 
          title: 'Shapes Adventure', 
          description: 'Explore geometric shapes through games', 
          xp: 50 
        },
        { 
          title: 'Story of the Moon', 
          description: 'Discover moon phases with storytelling', 
          xp: 30 
        }
      ]
    };

    assessmentResponse.analysisCompleted = true;
    assessmentResponse.analysisCompletedAt = new Date();

    await assessmentResponse.save();

    console.log(`🔍 Assessment analysis updated for student ${uniqueId}: ${personalityType}`);

    return NextResponse.json({
      success: true,
      message: 'Assessment analysis result saved successfully',
      studentId: uniqueId,
      result: assessmentResponse.result
    });

  } catch (error) {
    console.error('🔍 Assessment analysis result webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}