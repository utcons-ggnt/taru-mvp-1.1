import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';

export async function POST(request: NextRequest) {
  try {
    const { avatar } = await request.json();
    
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar path is required' },
        { status: 400 }
      );
    }

    // Validate avatar path
    const validAvatars = [
      '/avatars/Group.svg',
      '/avatars/Group-1.svg',
      '/avatars/Group-2.svg',
      '/avatars/Group-3.svg',
      '/avatars/Group-4.svg',
      '/avatars/Group-5.svg',
      '/avatars/Group-6.svg',
      '/avatars/Group-7.svg',
      '/avatars/Group-8.svg'
    ];

    if (!validAvatars.includes(avatar)) {
      return NextResponse.json(
        { error: 'Invalid avatar path' },
        { status: 400 }
      );
    }

    // Get user from session
    const userResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userData = await userResponse.json();
    const userId = userData.user._id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Update user avatar in User collection
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatar },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Also update student profile if it exists
    try {
      await Student.findOneAndUpdate(
        { userId: userId },
        { avatar: avatar },
        { new: true }
      );
    } catch (error) {
      console.log('Student profile not found, continuing with user update only');
    }

    return NextResponse.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: avatar
    });

  } catch (error) {
    console.error('Error updating avatar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
