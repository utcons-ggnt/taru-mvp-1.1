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
    const userId = searchParams.get('userId'); // Replace with actual user ID from auth

    if (!moduleId || !userId) {
      return NextResponse.json(
        { error: 'Module ID and User ID are required' },
        { status: 400 }
      );
    }

    const progress = await StudentProgress.findOne({ userId, moduleId });

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