import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import Student from '@/models/Student';
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
