import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import AssessmentResponse from '@/models/AssessmentResponse';

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

    // Verify user is a student
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can reset diagnostic assessment' },
        { status: 403 }
      );
    }

    // Get user's uniqueId for deleting assessment responses
    const userUniqueId = user.uniqueId;
    
    // Delete all assessment responses for this user
    if (userUniqueId) {
      const deleteResult = await AssessmentResponse.deleteMany({ uniqueId: userUniqueId });
      console.log(`Deleted ${deleteResult.deletedCount} assessment responses for user: ${userUniqueId}`);
    } else {
      console.log('No uniqueId found for user, skipping response deletion');
    }
    
    // Reset diagnostic assessment data in Assessment model
    await Assessment.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $unset: {
          diagnosticCompleted: 1,
          diagnosticScore: 1,
          diagnosticResults: 1
        }
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic assessment and all responses reset successfully'
    });

  } catch (error) {
    console.error('Reset diagnostic assessment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 