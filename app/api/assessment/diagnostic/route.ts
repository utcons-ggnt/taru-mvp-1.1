import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Assessment from '@/models/Assessment';
import { getQuestionsForGrade, calculateSectionScores, generateRecommendations } from '@/lib/diagnosticQuestions';

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
        { error: 'Only students can complete diagnostic assessment' },
        { status: 403 }
      );
    }

    // Get student profile to determine grade
    const student = await Student.findOne({ userId: decoded.userId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    const { answers, timeSpent } = await request.json();

    // Validate required fields
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ 
        error: 'Answers are required' 
      }, { status: 400 });
    }

    // Calculate scores based on the new system
    const sectionScores = calculateSectionScores(answers);
    const overallScore = Object.values(sectionScores).reduce((sum, score) => sum + score, 0);
    const maxPossibleScore = getQuestionsForGrade(student.classGrade)
      .reduce((sum, q) => sum + q.points, 0);
    
    const percentageScore = Math.round((overallScore / maxPossibleScore) * 100);

    // Determine learning style based on answers
    let learningStyle = 'Visual';
    if (sectionScores['Logic'] && sectionScores['Logic'] > sectionScores['Creativity']) {
      learningStyle = 'Analytical';
    } else if (sectionScores['Creativity'] && sectionScores['Creativity'] > sectionScores['Logic']) {
      learningStyle = 'Creative';
    } else if (sectionScores['Reflection'] && sectionScores['Reflection'] > 30) {
      learningStyle = 'Reflective';
    }

    // Generate recommendations based on performance and grade level
    const gradeLevel = parseInt(student.classGrade.replace(/\D/g, '')) || 0;
    let level: string;
    if (gradeLevel >= 1 && gradeLevel <= 5) level = 'Elementary';
    else if (gradeLevel >= 6 && gradeLevel <= 8) level = 'Middle';
    else level = 'Secondary';

    const recommendations = generateRecommendations(sectionScores, level);

    // Update assessment with diagnostic results
    const updateData = {
      diagnosticCompleted: true,
      diagnosticScore: percentageScore,
      diagnosticResults: {
        learningStyle,
        skillLevels: sectionScores,
        interestAreas: Object.keys(sectionScores)
          .filter(category => sectionScores[category] >= (maxPossibleScore * 0.1))
          .slice(0, 5), // Top 5 interest areas
        recommendedModules: recommendations,
        detailedScores: {
          sectionScores,
          overallScore,
          maxPossibleScore,
          percentageScore,
          timeSpent: timeSpent || 0,
          completedQuestions: Object.keys(answers).length,
          level
        }
      }
    };

    await Assessment.findOneAndUpdate(
      { userId: decoded.userId },
      updateData,
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Diagnostic assessment completed successfully',
      results: {
        overallScore: percentageScore,
        learningStyle,
        sectionScores,
        recommendations,
        level,
        detailedAnalysis: {
          strengths: Object.keys(sectionScores)
            .filter(cat => sectionScores[cat] >= (maxPossibleScore * 0.15))
            .slice(0, 3),
          areasForImprovement: Object.keys(sectionScores)
            .filter(cat => sectionScores[cat] < (maxPossibleScore * 0.1))
            .slice(0, 3),
          timeEfficiency: timeSpent ? `${Math.round(timeSpent / 60)} minutes` : 'Not tracked'
        }
      }
    });

  } catch (error) {
    console.error('Diagnostic assessment submission error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
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
        { error: 'Only students can access diagnostic assessment' },
        { status: 403 }
      );
    }

    // Get student profile to determine grade
    const student = await Student.findOne({ userId: decoded.userId });
    if (!student) {
      return NextResponse.json(
        { error: 'Student profile not found. Please complete onboarding first.' },
        { status: 400 }
      );
    }

    // Get questions appropriate for student's grade
    const questions = getQuestionsForGrade(student.classGrade);
    
    // Shuffle questions to ensure variety
    const shuffledQuestions = questions.sort(() => Math.random() - 0.5);
    
    // Select a balanced set of questions (max 15 for good UX)
    const selectedQuestions: typeof questions = [];
    const sectionsUsed = new Set<string>();
    
    // First, try to get at least one question from each section
    shuffledQuestions.forEach(q => {
      if (!sectionsUsed.has(q.section) && selectedQuestions.length < 10) {
        selectedQuestions.push(q);
        sectionsUsed.add(q.section);
      }
    });
    
    // Fill remaining slots with other questions
    shuffledQuestions.forEach(q => {
      if (selectedQuestions.length < 15 && !selectedQuestions.includes(q)) {
        selectedQuestions.push(q);
      }
    });

    // Get existing assessment data
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    
    const response = {
      questions: selectedQuestions.map(q => ({
        id: q.id,
        section: q.section,
        prompt: q.prompt,
        inputType: q.inputType,
        options: q.options,
        category: q.category,
        points: q.points,
        timeLimit: q.timeLimit
      })),
      studentInfo: {
        grade: student.classGrade,
        level: selectedQuestions[0]?.level || 'Middle',
        totalQuestions: selectedQuestions.length,
        estimatedTime: selectedQuestions.reduce((sum, q) => sum + (q.timeLimit || 120), 0)
      },
      existingAssessment: assessment ? {
        completed: assessment.diagnosticCompleted || false,
        score: assessment.diagnosticScore || 0,
        results: assessment.diagnosticResults || null
      } : null
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get diagnostic assessment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 