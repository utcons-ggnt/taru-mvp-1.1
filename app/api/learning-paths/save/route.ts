import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import LearningPath from '@/models/LearningPath';
import LearningPathResponse from '@/models/LearningPathResponse';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
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

    // Connect to database
    await connectDB();

    // Get user
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can save learning paths' },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { 
      studentId, 
      careerPath, 
      description, 
      learningModules, 
      timeRequired, 
      focusAreas 
    } = body;

    // Validate required fields
    if (!careerPath || !description || !learningModules || !Array.isArray(learningModules)) {
      return NextResponse.json(
        { error: 'Missing required fields: careerPath, description, learningModules' },
        { status: 400 }
      );
    }

    // Check if a learning path for this career already exists for this student in learning-path-responses
    const existingResponse = await LearningPathResponse.findOne({
      uniqueid: studentId || user.uniqueId,
      'output.greeting': { $regex: new RegExp(careerPath, 'i') }
    });

    if (existingResponse) {
      // Update existing response
      existingResponse.output.overview = description.split('. ').filter((s: string) => s.trim());
      existingResponse.output.learningPath = learningModules;
      existingResponse.output.timeRequired = timeRequired || 'Not specified';
      existingResponse.output.focusAreas = focusAreas || [];
      existingResponse.updatedAt = new Date();
      
      await existingResponse.save();
      
      return NextResponse.json({
        message: 'Learning path updated successfully',
        learningPath: {
          _id: existingResponse._id,
          studentId: existingResponse.uniqueid,
          careerPath: careerPath,
          description: description,
          learningModules: learningModules,
          timeRequired: timeRequired || 'Not specified',
          focusAreas: focusAreas || [],
          createdAt: existingResponse.createdAt,
          updatedAt: existingResponse.updatedAt
        }
      });
    } else {
      // Create new learning path response
      const newLearningPathResponse = new LearningPathResponse({
        uniqueid: studentId || user.uniqueId,
        output: {
          greeting: `Hi Student! Welcome to your ${careerPath} learning journey!`,
          overview: description.split('. ').filter((s: string) => s.trim()),
          timeRequired: timeRequired || 'Not specified',
          focusAreas: focusAreas || [],
          learningPath: learningModules,
          finalTip: `Keep exploring and learning in ${careerPath}!`
        }
      });

      await newLearningPathResponse.save();

      return NextResponse.json({
        message: 'Learning path saved successfully',
        learningPath: {
          _id: newLearningPathResponse._id,
          studentId: newLearningPathResponse.uniqueid,
          careerPath: careerPath,
          description: description,
          learningModules: learningModules,
          timeRequired: timeRequired || 'Not specified',
          focusAreas: focusAreas || [],
          createdAt: newLearningPathResponse.createdAt,
          updatedAt: newLearningPathResponse.updatedAt
        }
      });
    }

  } catch (error) {
    console.error('Save learning path error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}