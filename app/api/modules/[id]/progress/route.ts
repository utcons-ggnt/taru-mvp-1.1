import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import StudentProgress, { IModuleProgress, IGamificationProgress, IQuizAttempt } from '@/models/StudentProgress';
import Module, { IModule } from '@/models/Module';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  email: string;
  role: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
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
        { error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    // Get student progress
    const studentProgress = await StudentProgress.findOne({ studentId: decoded.userId });
    
    if (!studentProgress) {
      return NextResponse.json({
        success: true,
        progress: null
      });
    }

    // Find module progress
    const moduleProgress = studentProgress.moduleProgress.find(
      (mp: IModuleProgress) => mp.moduleId === id
    );

    return NextResponse.json({
      success: true,
      progress: moduleProgress || null
    });

  } catch (error) {
    console.error('Error fetching module progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const {
      videoProgress,
      quizAttempts,
      feedback,
      interactiveProgress,
      projectSubmission,
      peerLearningProgress,
      aiAssessment
    } = await request.json();

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
        { error: 'Only students can save progress' },
        { status: 403 }
      );
    }

    // Get module data
    const moduleData = await Module.findOne({ moduleId: id, isActive: true });
    if (!moduleData) {
      return NextResponse.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Get or create student progress
    let studentProgress = await StudentProgress.findOne({ studentId: decoded.userId });
    
    if (!studentProgress) {
      studentProgress = new StudentProgress({
        studentId: decoded.userId,
        moduleProgress: [],
        totalPoints: 0,
        totalModulesCompleted: 0,
        totalWatchTime: 0,
        totalInteractiveTime: 0,
        totalProjectTime: 0,
        totalPeerLearningTime: 0,
        learningStreak: 0,
        badgesEarned: [],
        skillLevels: {},
        learningPreferences: {
          preferredContentTypes: [],
          preferredDifficulty: 'beginner',
          preferredGroupSize: 4,
          preferredTimeOfDay: 'morning'
        },
        aiInsights: {
          learningStyle: 'visual',
          strengths: [],
          weaknesses: [],
          recommendations: [],
          lastUpdated: new Date()
        }
      });
    }

    // Find or create module progress
    let moduleProgress = studentProgress.moduleProgress.find(
      (mp: IModuleProgress) => mp.moduleId === id
    );

    if (!moduleProgress) {
      moduleProgress = {
        moduleId: id,
        videoProgress: {
          videoUrl: moduleData.videoUrl,
          watchTime: 0,
          totalDuration: moduleData.duration * 60, // Convert minutes to seconds
          completed: false,
          lastWatchedAt: new Date(),
          engagementScore: 0,
          playbackRate: 1,
          seekCount: 0
        },
        quizAttempts: [],
        quizScore: 0,
        gamificationProgress: {
          quests: moduleData.gamification.quests.map((quest: IModule['gamification']['quests'][number]) => ({
            questId: quest.id,
            current: 0,
            completed: false
          })),
          badges: [],
          streaks: {
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: new Date()
          },
          leaderboardPoints: 0
        },
        aiAssessment: {
          realTimeScore: 0,
          skillGaps: [],
          recommendations: [],
          adaptiveQuestions: [],
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

    // Update video progress
    if (videoProgress) {
      moduleProgress.videoProgress.watchTime = videoProgress.watchTime;
      moduleProgress.videoProgress.completed = videoProgress.completed;
      moduleProgress.videoProgress.lastWatchedAt = new Date();
      
      // Store enhanced engagement data
      if (videoProgress.engagementScore !== undefined) {
        moduleProgress.videoProgress.engagementScore = videoProgress.engagementScore;
      }
      if (videoProgress.playbackRate !== undefined) {
        moduleProgress.videoProgress.playbackRate = videoProgress.playbackRate;
      }
      if (videoProgress.seekCount !== undefined) {
        moduleProgress.videoProgress.seekCount = videoProgress.seekCount;
      }

      // Update quest progress
      const videoQuest = moduleProgress.gamificationProgress.quests.find(
        (q: IGamificationProgress['quests'][number]) => q.questId === 'quest1' || q.questId.includes('watch')
      );
      if (videoQuest) {
        const watchPercentage = (moduleProgress.videoProgress.totalDuration > 0)
          ? (videoProgress.watchTime / moduleProgress.videoProgress.totalDuration) * 100
          : 0;
        const safeWatchPercentage = isNaN(watchPercentage) ? 0 : watchPercentage;
        const safeTarget = typeof videoQuest.target === 'number' && !isNaN(videoQuest.target) ? videoQuest.target : 100;
        videoQuest.current = Math.min(safeWatchPercentage, safeTarget);
        if (isNaN(videoQuest.current)) videoQuest.current = 0;
        videoQuest.completed = safeWatchPercentage >= safeTarget;
      }
    }

    // Update interactive progress
    if (interactiveProgress) {
      moduleProgress.interactiveProgress = {
        type: interactiveProgress.type,
        attempts: interactiveProgress.attempts,
        maxAttempts: moduleData.contentTypes.interactive?.attempts || 3,
        completed: interactiveProgress.completed,
        score: interactiveProgress.score,
        timeSpent: interactiveProgress.timeSpent,
        lastAttemptAt: new Date(),
        content: interactiveProgress.content
      };

      // Update quest progress
      const interactiveQuest = moduleProgress.gamificationProgress.quests.find(
        (q: IGamificationProgress['quests'][number]) => q.questId === 'quest2' || q.questId.includes('complete')
      );
      if (interactiveQuest && interactiveProgress.completed) {
        const safeTarget = typeof interactiveQuest.target === 'number' && !isNaN(interactiveQuest.target) ? interactiveQuest.target : 100;
        const newCurrent = isNaN(interactiveQuest.current + 1) ? 0 : interactiveQuest.current + 1;
        interactiveQuest.current = Math.min(newCurrent, safeTarget);
        if (isNaN(interactiveQuest.current)) interactiveQuest.current = 0;
        interactiveQuest.completed = interactiveQuest.current >= safeTarget;
      }
    }

    // Update project submission
    if (projectSubmission) {
      moduleProgress.projectSubmission = {
        title: projectSubmission.title,
        description: projectSubmission.description || '',
        submissionType: projectSubmission.submissionType,
        content: projectSubmission.content,
        submittedAt: new Date(),
        rubricScores: [],
        totalScore: 0,
        feedback: '',
        status: 'submitted'
      };

      // Update quest progress
      const projectQuest = moduleProgress.gamificationProgress.quests.find(
        (q: IGamificationProgress['quests'][number]) => q.questId === 'quest4' || q.questId.includes('create')
      );
      if (projectQuest) {
        projectQuest.current = 1;
        projectQuest.completed = true;
      }
    }

    // Update peer learning progress
    if (peerLearningProgress) {
      moduleProgress.peerLearningProgress = {
        discussionTopics: moduleData.contentTypes.peerLearning?.discussionTopics || [],
        participationCount: peerLearningProgress.participationCount,
        collaborationTasks: moduleData.contentTypes.peerLearning?.collaborationTasks || [],
        completedTasks: peerLearningProgress.completedTasks,
        groupSize: moduleData.contentTypes.peerLearning?.groupSize || 4,
        peerFeedback: [],
        lastActivityAt: new Date()
      };

      // Update quest progress
      const peerQuest = moduleProgress.gamificationProgress.quests.find(
        (q: IGamificationProgress['quests'][number]) => q.questId === 'quest3' || q.questId.includes('collaborate')
      );
      if (peerQuest) {
        peerQuest.current = Math.min(peerLearningProgress.participationCount, peerQuest.target);
        peerQuest.completed = peerLearningProgress.participationCount >= peerQuest.target;
      }
    }

    // Update quiz attempts
    if (quizAttempts && quizAttempts.length > 0) {
      moduleProgress.quizAttempts = quizAttempts;
      
      // Calculate quiz score
      const correctAnswers = quizAttempts.filter((attempt: IQuizAttempt) => attempt.isCorrect).length;
      const quizScore = quizAttempts.length > 0 ? (correctAnswers / quizAttempts.length) * 100 : 0;
      moduleProgress.quizScore = quizScore;

      // Update quest progress
      const quizQuest = moduleProgress.gamificationProgress.quests.find(
        (q: IGamificationProgress['quests'][number]) => q.questId.includes('score')
      );
      if (quizQuest) {
        const safeTarget = typeof quizQuest.target === 'number' && !isNaN(quizQuest.target) ? quizQuest.target : 100;
        const safeQuizScore = isNaN(quizScore) ? 0 : quizScore;
        quizQuest.current = Math.min(safeQuizScore, safeTarget);
        if (isNaN(quizQuest.current)) quizQuest.current = 0;
        quizQuest.completed = safeQuizScore >= safeTarget;
      }
    }

    // Update feedback
    if (feedback) {
      moduleProgress.feedback = feedback;
    }

    // Update AI assessment
    if (aiAssessment) {
      moduleProgress.aiAssessment = {
        ...moduleProgress.aiAssessment,
        ...aiAssessment,
        lastAssessmentAt: new Date()
      };
    }

    // Calculate points earned
    let pointsEarned = 0;
    
    // Points for video completion (25% of module points)
    if (moduleProgress.videoProgress.completed) {
      pointsEarned += Math.floor(moduleData.points * 0.25);
    }
    
    // Points for interactive completion (25% of module points)
    if (moduleProgress.interactiveProgress?.completed) {
      pointsEarned += Math.floor(moduleData.points * 0.25);
    }
    
    // Points for project submission (25% of module points)
    if (moduleProgress.projectSubmission) {
      pointsEarned += Math.floor(moduleData.points * 0.25);
    }
    
    // Points for quiz (15% of module points)
    if (moduleProgress.quizScore > 0) {
      pointsEarned += Math.floor((moduleProgress.quizScore / 100) * moduleData.points * 0.15);
    }
    
    // Points for feedback (10% of module points)
    if (moduleProgress.feedback.trim()) {
      pointsEarned += Math.floor(moduleData.points * 0.10);
    }

    moduleProgress.pointsEarned = pointsEarned;
    moduleProgress.lastAccessedAt = new Date();

    // Check if module is completed (all major components completed)
    const isCompleted = moduleProgress.videoProgress.completed && 
                       (moduleProgress.interactiveProgress?.completed || !moduleData.contentTypes.interactive) &&
                       (moduleProgress.projectSubmission || !moduleData.contentTypes.project) &&
                       (moduleProgress.peerLearningProgress?.participationCount > 0 || !moduleData.contentTypes.peerLearning) &&
                       moduleProgress.quizAttempts.length > 0 && 
                       moduleProgress.feedback.trim();

    if (isCompleted && !moduleProgress.completedAt) {
      moduleProgress.completedAt = new Date();
      studentProgress.totalModulesCompleted += 1;
    }

    // Update total points and time tracking
    studentProgress.totalPoints = studentProgress.moduleProgress.reduce(
      (total: number, mp: IModuleProgress) => total + mp.pointsEarned, 0
    );
    
    studentProgress.totalWatchTime = studentProgress.moduleProgress.reduce(
      (total: number, mp: IModuleProgress) => total + (mp.videoProgress.watchTime / 60), 0 // Convert seconds to minutes
    );

    studentProgress.totalInteractiveTime = studentProgress.moduleProgress.reduce(
      (total: number, mp: IModuleProgress) => total + (mp.interactiveProgress?.timeSpent || 0) / 60, 0
    );

    // Update learning streak
    const today = new Date();
    const lastActivity = studentProgress.aiInsights.lastUpdated;
    const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastActivity <= 1) {
      studentProgress.learningStreak += 1;
    } else {
      studentProgress.learningStreak = 1;
    }

    // Update AI insights
    studentProgress.aiInsights.lastUpdated = new Date();

    await studentProgress.save();

    // Prepare response data
    const responseData = {
      moduleId: id,
      videoProgress: moduleProgress.videoProgress,
      interactiveProgress: moduleProgress.interactiveProgress,
      projectSubmission: moduleProgress.projectSubmission,
      peerLearningProgress: moduleProgress.peerLearningProgress,
      quizScore: moduleProgress.quizScore,
      pointsEarned: moduleProgress.pointsEarned,
      completed: isCompleted,
      gamificationProgress: moduleProgress.gamificationProgress,
      aiAssessment: moduleProgress.aiAssessment,
      totalPoints: studentProgress.totalPoints,
      totalModulesCompleted: studentProgress.totalModulesCompleted,
      learningStreak: studentProgress.learningStreak
    };

    return NextResponse.json({
      success: true,
      progress: responseData
    });

  } catch (error) {
    console.error('Error saving module progress:', error);
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    );
  }
} 