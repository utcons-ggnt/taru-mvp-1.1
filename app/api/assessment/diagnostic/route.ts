import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
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
        { error: 'Only students can complete diagnostic assessment' },
        { status: 403 }
      );
    }

    const { diagnosticResults, answers } = await request.json();

    // Validate required fields
    if (!diagnosticResults || !answers) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Update assessment with diagnostic results
    const updateData = {
      diagnosticCompleted: true,
      diagnosticScore: diagnosticResults.overallScore,
      diagnosticResults: {
        learningStyle: diagnosticResults.learningStyle,
        skillLevels: diagnosticResults.categoryScores,
        interestAreas: Object.keys(diagnosticResults.categoryScores).filter(
          category => diagnosticResults.categoryScores[category] >= 60
        ),
        recommendedModules: generateRecommendedModules(diagnosticResults)
      }
    };

    await Assessment.findOneAndUpdate(
      { userId: decoded.userId },
      updateData,
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic assessment completed successfully',
      results: diagnosticResults
    });

  } catch (error) {
    console.error('Diagnostic assessment submission error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function generateRecommendedModules(results: any): string[] {
  const recommendations: string[] = [];
  
  // Add recommendations based on skill levels
  Object.entries(results.categoryScores).forEach(([category, score]: [string, any]) => {
    if (score >= 80) {
      // High skill level - recommend advanced modules
      recommendations.push(`${category.toLowerCase()}-advanced`);
    } else if (score >= 60) {
      // Medium skill level - recommend intermediate modules
      recommendations.push(`${category.toLowerCase()}-intermediate`);
    } else {
      // Low skill level - recommend beginner modules
      recommendations.push(`${category.toLowerCase()}-beginner`);
    }
  });

  // Add recommendations based on learning style
  switch (results.learningStyle) {
    case 'reading-writing':
      recommendations.push('literature-beginner', 'writing-beginner');
      break;
    case 'logical-mathematical':
      recommendations.push('math-beginner', 'logic-beginner');
      break;
    case 'visual-spatial':
      recommendations.push('art-beginner', 'technology-beginner');
      break;
    default:
      recommendations.push('general-beginner');
  }

  return recommendations.slice(0, 10); // Limit to top 10 recommendations
} 