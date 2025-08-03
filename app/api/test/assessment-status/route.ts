import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all students who completed onboarding
    const students = await Student.find({ onboardingCompleted: true });
    
    const results = [];
    
    for (const student of students) {
      const assessmentResponse = await AssessmentResponse.findOne({
        uniqueId: student.uniqueId,
        assessmentType: 'diagnostic'
      });
      
      results.push({
        uniqueId: student.uniqueId,
        fullName: student.fullName,
        onboardingCompleted: student.onboardingCompleted,
        hasAssessmentResponse: !!assessmentResponse,
        assessmentCompleted: assessmentResponse?.isCompleted || false,
        responsesCount: assessmentResponse?.responses?.length || 0,
        hasGeneratedQuestions: !!assessmentResponse?.generatedQuestions,
        generatedQuestionsCount: assessmentResponse?.generatedQuestions?.length || 0
      });
    }

    return NextResponse.json({
      success: true,
      students: results,
      totalStudents: students.length
    });

  } catch (error) {
    console.error('Test assessment status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 