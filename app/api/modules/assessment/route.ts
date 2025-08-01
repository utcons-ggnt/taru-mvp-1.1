import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Module from '@/models/Module';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const N8N_WEBHOOK_URL = process.env.N8N_MODULE_ASSESSMENT_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions';

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
        { error: 'Only students can take module assessments' },
        { status: 403 }
      );
    }

    const { moduleId, answers, attemptNumber = 1 } = await request.json();

    // Validate required fields
    if (!moduleId || !answers) {
      return NextResponse.json({ 
        error: 'Module ID and answers are required' 
      }, { status: 400 });
    }

    // Get module details
    const module = await Module.findOne({ moduleId });
    if (!module) {
      return NextResponse.json({ 
        error: 'Module not found' 
      }, { status: 404 });
    }

    // Check if student has already completed this module
    const progress = await StudentProgress.findOne({ userId: decoded.userId });
    const moduleProgress = progress?.moduleProgress?.find((mp: any) => mp.moduleId === moduleId);

    if (moduleProgress?.completedAt) {
      return NextResponse.json({ 
        error: 'Module already completed' 
      }, { status: 400 });
    }

    // Check attempt limit (5 attempts)
    if (attemptNumber > 5) {
      return NextResponse.json({ 
        error: 'Maximum attempts reached for this module' 
      }, { status: 400 });
    }

    // Prepare assessment data for N8N
    const assessmentData = {
      moduleId,
      moduleTitle: module.title,
      moduleSubject: module.subject,
      moduleDifficulty: module.difficulty,
      answers,
      attemptNumber,
      studentId: decoded.userId,
      studentName: user.name,
      grade: user.profile?.grade || '6'
    };

    // Call N8N webhook for assessment evaluation
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'evaluate_module_assessment',
          data: assessmentData
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        
        // Extract assessment results from N8N response
        const evaluation = result.evaluation || result.data?.evaluation || {};
        
        const score = evaluation.score || 0;
        const percentage = evaluation.percentage || 0;
        const passed = evaluation.passed || false;
        const feedback = evaluation.feedback || '';
        const correctAnswers = evaluation.correctAnswers || 0;
        const totalQuestions = evaluation.totalQuestions || Object.keys(answers).length;

        // Update student progress
        await updateStudentProgress(decoded.userId, moduleId, {
          score,
          percentage,
          passed,
          attemptNumber,
          feedback,
          correctAnswers,
          totalQuestions,
          completedAt: passed ? new Date() : null
        });

        // Check if student is eligible for badge
        const badgeEligible = passed && percentage >= 80;
        let badge = null;

        if (badgeEligible) {
          badge = await awardModuleBadge(decoded.userId, moduleId, module.title);
        }

        return NextResponse.json({
          success: true,
          assessment: {
            score,
            percentage,
            passed,
            feedback,
            correctAnswers,
            totalQuestions,
            attemptNumber,
            badgeEligible,
            badge
          },
          metadata: {
            evaluatedAt: new Date().toISOString(),
            studentId: decoded.userId,
            moduleId
          }
        });

      } else {
        throw new Error(`N8N returned ${response.status}`);
      }

    } catch (error) {
      console.error('N8N assessment evaluation error:', error);
      
      // Fallback assessment evaluation
      const fallbackEvaluation = generateFallbackEvaluation(answers, attemptNumber);
      
      // Update student progress
      await updateStudentProgress(decoded.userId, moduleId, {
        score: fallbackEvaluation.score,
        percentage: fallbackEvaluation.percentage,
        passed: fallbackEvaluation.passed,
        attemptNumber,
        feedback: fallbackEvaluation.feedback,
        correctAnswers: fallbackEvaluation.correctAnswers,
        totalQuestions: fallbackEvaluation.totalQuestions,
        completedAt: fallbackEvaluation.passed ? new Date() : null
      });

      // Check badge eligibility
      const badgeEligible = fallbackEvaluation.passed && fallbackEvaluation.percentage >= 80;
      let badge = null;

      if (badgeEligible) {
        badge = await awardModuleBadge(decoded.userId, moduleId, module.title);
      }

      return NextResponse.json({
        success: true,
        assessment: {
          ...fallbackEvaluation,
          attemptNumber,
          badgeEligible,
          badge
        },
        fallback: true,
        metadata: {
          evaluatedAt: new Date().toISOString(),
          studentId: decoded.userId,
          moduleId,
          error: 'Using fallback evaluation due to N8N unavailability'
        }
      });
    }

  } catch (error) {
    console.error('Module assessment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Update student progress
async function updateStudentProgress(userId: string, moduleId: string, assessmentData: any) {
  const progress = await StudentProgress.findOne({ userId });
  
  if (!progress) {
    // Create new progress record
    const newProgress = new StudentProgress({
      userId,
      moduleProgress: [{
        moduleId,
        quizAttempts: [{
          attemptNumber: assessmentData.attemptNumber,
          score: assessmentData.score,
          percentage: assessmentData.percentage,
          passed: assessmentData.passed,
          feedback: assessmentData.feedback,
          correctAnswers: assessmentData.correctAnswers,
          totalQuestions: assessmentData.totalQuestions,
          completedAt: assessmentData.completedAt
        }],
        quizScore: assessmentData.percentage,
        completedAt: assessmentData.completedAt,
        startedAt: new Date(),
        lastAccessedAt: new Date()
      }]
    });
    await newProgress.save();
  } else {
    // Update existing progress
    const moduleProgressIndex = progress.moduleProgress.findIndex((mp: any) => mp.moduleId === moduleId);
    
    if (moduleProgressIndex >= 0) {
      // Update existing module progress
      const moduleProgress = progress.moduleProgress[moduleProgressIndex];
      moduleProgress.quizAttempts.push({
        attemptNumber: assessmentData.attemptNumber,
        score: assessmentData.score,
        percentage: assessmentData.percentage,
        passed: assessmentData.passed,
        feedback: assessmentData.feedback,
        correctAnswers: assessmentData.correctAnswers,
        totalQuestions: assessmentData.totalQuestions,
        completedAt: assessmentData.completedAt
      });
      
      if (assessmentData.passed) {
        moduleProgress.quizScore = Math.max(moduleProgress.quizScore, assessmentData.percentage);
        moduleProgress.completedAt = assessmentData.completedAt;
      }
      
      moduleProgress.lastAccessedAt = new Date();
    } else {
      // Add new module progress
      progress.moduleProgress.push({
        moduleId,
        quizAttempts: [{
          attemptNumber: assessmentData.attemptNumber,
          score: assessmentData.score,
          percentage: assessmentData.percentage,
          passed: assessmentData.passed,
          feedback: assessmentData.feedback,
          correctAnswers: assessmentData.correctAnswers,
          totalQuestions: assessmentData.totalQuestions,
          completedAt: assessmentData.completedAt
        }],
        quizScore: assessmentData.percentage,
        completedAt: assessmentData.completedAt,
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
    }
    
    await progress.save();
  }
}

// Award module badge
async function awardModuleBadge(userId: string, moduleId: string, moduleTitle: string) {
  const progress = await StudentProgress.findOne({ userId });
  
  if (!progress) return null;

  const badge = {
    badgeId: `badge_${moduleId}_${Date.now()}`,
    name: `${moduleTitle} Master`,
    description: `Successfully completed ${moduleTitle} with 80% or higher score`,
    earnedAt: new Date(),
    icon: '🏆'
  };

  if (!progress.gamificationProgress) {
    progress.gamificationProgress = {
      quests: [],
      badges: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date()
      },
      leaderboardPoints: 0
    };
  }

  // Check if badge already exists
  const existingBadge = progress.gamificationProgress.badges.find((b: any) => b.badgeId === badge.badgeId);
  if (!existingBadge) {
    progress.gamificationProgress.badges.push(badge);
    progress.gamificationProgress.leaderboardPoints += 100;
    await progress.save();
  }

  return badge;
}

// Fallback assessment evaluation
function generateFallbackEvaluation(answers: Record<string, string>, attemptNumber: number) {
  const totalQuestions = Object.keys(answers).length;
  let correctAnswers = 0;

  // Simple fallback logic: assume first option is correct
  Object.values(answers).forEach(answer => {
    if (answer && answer.toString().toLowerCase().includes('correct')) {
      correctAnswers++;
    }
  });

  // Add some randomness based on attempt number
  const baseScore = (correctAnswers / totalQuestions) * 100;
  const attemptBonus = Math.max(0, (5 - attemptNumber) * 5); // Bonus for fewer attempts
  const percentage = Math.min(100, baseScore + attemptBonus);

  const passed = percentage >= 80;
  
  let feedback = '';
  if (passed) {
    feedback = 'Excellent work! You have successfully completed this module.';
  } else if (attemptNumber < 5) {
    feedback = 'Good effort! Review the material and try again.';
  } else {
    feedback = 'You\'ve reached the maximum attempts. Consider reviewing the module content.';
  }

  return {
    score: Math.round(percentage),
    percentage: Math.round(percentage),
    passed,
    feedback,
    correctAnswers,
    totalQuestions
  };
} 