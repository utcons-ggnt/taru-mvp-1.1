import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentProgress from '@/models/StudentProgress';
import jwt from 'jsonwebtoken';

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

    const { chapterId, studentId, score, totalQuestions, correctAnswers, quizAttempts } = await request.json();

    // Validate required fields
    if (!chapterId || !studentId || score === undefined || !totalQuestions || !correctAnswers || !quizAttempts) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate score range
    if (score < 0 || score > 100) {
      return NextResponse.json(
        { error: 'Score must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Validate quiz attempts structure
    if (!Array.isArray(quizAttempts) || quizAttempts.length === 0) {
      return NextResponse.json(
        { error: 'Quiz attempts must be a non-empty array' },
        { status: 400 }
      );
    }

    // Find or create student progress
    let studentProgress = await StudentProgress.findOne({ studentId });
    
    if (!studentProgress) {
      studentProgress = new StudentProgress({
        studentId,
        totalModulesCompleted: 0,
        totalPoints: 0,
        totalWatchTime: 0,
        totalInteractiveTime: 0,
        learningStreak: 0,
        lastActivityDate: new Date(),
        moduleProgress: [],
        aiInsights: {
          strengths: [],
          areasForImprovement: [],
          learningStyle: 'Visual',
          recommendedModules: [],
          learningPathRecommendations: [],
          lastAssessmentAt: new Date()
        }
      });
    }

    // Ensure required fields are initialized
    if (!studentProgress.lastActivityDate) {
      studentProgress.lastActivityDate = new Date();
    }
    if (studentProgress.learningStreak === undefined) {
      studentProgress.learningStreak = 0;
    }
    if (studentProgress.totalPoints === undefined) {
      studentProgress.totalPoints = 0;
    }
    if (studentProgress.totalModulesCompleted === undefined) {
      studentProgress.totalModulesCompleted = 0;
    }

    // Find or create module progress for this chapter
    let moduleProgress = studentProgress.moduleProgress.find(
      (mp: any) => mp.moduleId === chapterId
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: chapterId,
        videoProgress: {
          videoUrl: `https://youtube.com/watch?v=placeholder_${chapterId}`, // Placeholder URL
          totalDuration: 0, // Will be updated when video is watched
          completed: false,
          watchTime: 0,
          lastWatchedAt: null
        },
        quizAttempts: [],
        quizScore: 0,
        interactiveProgress: null,
        projectSubmission: null,
        peerLearningProgress: null,
        gamificationProgress: {
          level: 1,
          xp: 0,
          quests: [
            {
              questId: 'video_completion',
              title: 'Watch Video',
              description: 'Complete the video lesson',
              target: 1,
              current: 0,
              completed: false
            },
            {
              questId: 'quiz_score',
              title: 'Quiz Master',
              description: 'Score 75% or higher on quiz',
              target: 75,
              current: 0,
              completed: false
            }
          ]
        },
        aiAssessment: {
          strengths: [],
          areasForImprovement: [],
          learningStyle: 'Visual',
          recommendedModules: [],
          learningPathRecommendations: [],
          lastAssessmentAt: new Date()
        },
        feedback: '',
        pointsEarned: 0,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        learningPath: [],
        skillImprovements: []
      };
      studentProgress.moduleProgress.push(moduleProgress);
    }

    // Update quiz attempts - use the data as sent from frontend
    moduleProgress.quizAttempts = quizAttempts;
    moduleProgress.quizScore = score;
    
    // Ensure videoProgress has required fields if they don't exist
    if (!moduleProgress.videoProgress.videoUrl) {
      moduleProgress.videoProgress.videoUrl = `https://youtube.com/watch?v=placeholder_${chapterId}`;
    }
    if (moduleProgress.videoProgress.totalDuration === undefined) {
      moduleProgress.videoProgress.totalDuration = 0;
    }
    
    // Ensure gamificationProgress has required structure
    if (!moduleProgress.gamificationProgress) {
      moduleProgress.gamificationProgress = {
        level: 1,
        xp: 0,
        quests: []
      };
    }
    
    // Ensure aiAssessment has required structure
    if (!moduleProgress.aiAssessment) {
      moduleProgress.aiAssessment = {
        strengths: [],
        areasForImprovement: [],
        learningStyle: 'Visual',
        recommendedModules: [],
        learningPathRecommendations: [],
        lastAssessmentAt: new Date()
      };
    }

    // Update quest progress for quiz score
    const quizQuest = moduleProgress.gamificationProgress.quests.find(
      (q: any) => q.questId === 'quiz_score'
    );
    if (quizQuest) {
      quizQuest.current = Math.min(score, quizQuest.target);
      quizQuest.completed = score >= quizQuest.target;
    }

    // Calculate XP earned based on quiz performance (same as dashboard calculation)
    let quizXp = 0;
    
    // Base XP for starting a module (already included in module progress)
    // Note: This is handled in the dashboard calculation, not here
    
    // XP for quiz performance (0.5 XP per percentage point)
    if (score > 0) {
      quizXp += Math.round(score * 0.5);
    }
    
    // Bonus XP for completion (75 XP bonus for scoring >= 75%)
    if (score >= 75) {
      quizXp += 75;
    }
    
    // Update points earned with the new XP calculation
    moduleProgress.pointsEarned = quizXp;

    // Check if module is completed (quiz score >= 75%)
    const isModuleCompleted = score >= 75;
    
    console.log('🎯 Completion check:', {
      score,
      isModuleCompleted,
      alreadyCompleted: !!moduleProgress.completedAt,
      currentCompletedAt: moduleProgress.completedAt
    });
    
    if (isModuleCompleted && !moduleProgress.completedAt) {
      moduleProgress.completedAt = new Date();
      studentProgress.totalModulesCompleted += 1;
      console.log('✅ Module marked as completed!', {
        chapterId,
        score,
        completedAt: moduleProgress.completedAt,
        totalModulesCompleted: studentProgress.totalModulesCompleted
      });
    } else if (isModuleCompleted && moduleProgress.completedAt) {
      console.log('✅ Module already completed previously');
    } else {
      console.log('⚠️ Module not completed - score too low:', score);
    }

    // Update last accessed time
    moduleProgress.lastAccessedAt = new Date();

    // Update total points
    studentProgress.totalPoints = studentProgress.moduleProgress.reduce(
      (total: number, mp: any) => total + mp.pointsEarned, 0
    );

    // Update learning streak
    const today = new Date();
    const lastActivity = studentProgress.lastActivityDate || today;
    const daysSinceLastActivity = Math.floor(
      (today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastActivity <= 1) {
      studentProgress.learningStreak = (studentProgress.learningStreak || 0) + 1;
    } else {
      studentProgress.learningStreak = 1;
    }
    studentProgress.lastActivityDate = today;

    // Save the updated progress
    try {
      console.log('💾 Saving progress to database...', {
        studentId,
        chapterId,
        score,
        moduleProgress: {
          quizScore: moduleProgress.quizScore,
          quizAttempts: moduleProgress.quizAttempts.length,
          completedAt: moduleProgress.completedAt
        }
      });
      
      await studentProgress.save();
      console.log('✅ Progress saved successfully to database:', {
        studentId,
        chapterId,
        score,
        isCompleted: isModuleCompleted,
        totalModules: studentProgress.moduleProgress.length
      });
    } catch (saveError) {
      console.error('❌ Database save error:', saveError);
      throw saveError;
    }

    // Calculate overall progress for this module
    const overallProgress = isModuleCompleted ? 100 : Math.min(score, 100);

    return NextResponse.json({
      success: true,
      message: 'Quiz score saved successfully',
             data: {
               score,
               isCompleted: isModuleCompleted,
               progress: overallProgress,
               pointsEarned: quizXp,
               totalPoints: studentProgress.totalPoints,
               modulesCompleted: studentProgress.totalModulesCompleted
             }
    });

  } catch (error) {
    console.error('Quiz score API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save quiz score',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
