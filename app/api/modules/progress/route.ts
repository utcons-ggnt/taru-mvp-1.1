import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentProgress from '@/models/StudentProgress';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      moduleId,
      watchTime,
      totalDuration,
      quizScore,
      feedback,
      pointsEarned,
      totalPoints
    } = await request.json();

    // Get user from session/token (you'll need to implement authentication)
    // For now, we'll use a placeholder user ID
    const userId = 'placeholder-user-id'; // Replace with actual user ID from auth

    // Create or update student progress
    const progressData = {
      userId,
      moduleId,
      watchTime,
      totalDuration,
      quizScore,
      feedback,
      pointsEarned,
      totalPoints,
      completedAt: new Date(),
      progress: {
        videoWatched: true,
        quizCompleted: true,
        feedbackSubmitted: true
      }
    };

    // Upsert progress (update if exists, create if not)
    const progress = await StudentProgress.findOneAndUpdate(
      { userId, moduleId },
      progressData,
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Progress saved successfully',
      progress,
      pointsEarned: totalPoints
    });

  } catch (error) {
    console.error('Error saving module progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');
    const studentId = searchParams.get('studentId');

    // If studentId is provided, return all progress for that student
    if (studentId) {
      console.log('🔍 Looking for progress data for student:', studentId);
      
      const studentProgress = await StudentProgress.findOne({ studentId });
      console.log('📋 Student progress found:', !!studentProgress);
      
      if (!studentProgress) {
        console.log('⚠️ No student progress found for student:', studentId);
        return NextResponse.json({
          success: true,
          progress: []
        });
      }

      console.log('📊 Total modules in progress:', studentProgress.moduleProgress.length);
      console.log('📊 Raw module progress:', studentProgress.moduleProgress);

      // Return module progress data
      const progressData = studentProgress.moduleProgress.map((module: any) => ({
        moduleId: module.moduleId,
        quizScore: module.quizScore,
        completedAt: module.completedAt,
        pointsEarned: module.pointsEarned,
        lastAccessedAt: module.lastAccessedAt
      }));

      console.log('📊 Processed progress data for student:', studentId, progressData);

      return NextResponse.json({
        success: true,
        progress: progressData
      });
    }

    // If moduleId is provided, return specific module progress
    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID or Student ID is required' },
        { status: 400 }
      );
    }

    const progress = await StudentProgress.findOne({ moduleId });

    return NextResponse.json({
      success: true,
      progress: progress || null
    });

  } catch (error) {
    console.error('Error fetching module progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
} 