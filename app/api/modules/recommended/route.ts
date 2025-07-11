import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Assessment from '@/models/Assessment';
import Module from '@/models/Module';
import StudentProgress from '@/models/StudentProgress';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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

    // Get user and assessment data
    const user = await User.findById(decoded.userId);
    const assessment = await Assessment.findOne({ userId: decoded.userId });
    const progress = await StudentProgress.findOne({ userId: decoded.userId });

    if (!user || user.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access recommended modules' },
        { status: 403 }
      );
    }

    // Get all active modules
    const allModules = await Module.find({ isActive: true });

    // Filter modules based on assessment data
    let recommendedModules = allModules;

    if (assessment) {
      // Filter by subjects the student likes
      if (assessment.subjectsILike && assessment.subjectsILike.length > 0) {
        recommendedModules = recommendedModules.filter(module =>
          assessment.subjectsILike.some((subject: string) =>
            module.subject.toLowerCase().includes(subject.toLowerCase()) ||
            module.tags.some((tag: string) => tag.toLowerCase().includes(subject.toLowerCase()))
          )
        );
      }

      // Filter by learning style
      if (assessment.preferredLearningStyle && assessment.preferredLearningStyle.length > 0) {
        recommendedModules = recommendedModules.filter(module =>
          assessment.preferredLearningStyle.some((style: string) => {
            const styleLower = style.toLowerCase();
            if (styleLower.includes('visual')) return module.learningType === 'video' || module.learningType === 'interactive';
            if (styleLower.includes('auditory')) return module.learningType === 'video' || module.learningType === 'story';
            if (styleLower.includes('kinesthetic')) return module.learningType === 'interactive' || module.learningType === 'project';
            return true;
          })
        );
      }

      // Filter by career interests
      if (assessment.currentCareerInterest && assessment.currentCareerInterest.length > 0) {
        recommendedModules = recommendedModules.filter(module =>
          assessment.currentCareerInterest.some((interest: string) =>
            module.tags.some((tag: string) => tag.toLowerCase().includes(interest.toLowerCase())) ||
            module.description.toLowerCase().includes(interest.toLowerCase())
          )
        );
      }
    }

    // Remove modules the student has already completed
    if (progress && progress.moduleProgress) {
      const completedModuleIds = progress.moduleProgress
        .filter((mp: any) => mp.status === 'completed')
        .map((mp: any) => mp.moduleId);
      
      recommendedModules = recommendedModules.filter(module =>
        !completedModuleIds.includes(module.moduleId)
      );
    }

    // Sort by relevance and difficulty
    recommendedModules.sort((a, b) => {
      // Prioritize beginner modules for new students
      if (a.difficulty === 'beginner' && b.difficulty !== 'beginner') return -1;
      if (b.difficulty === 'beginner' && a.difficulty !== 'beginner') return 1;
      
      // Then sort by XP points (higher first)
      return b.xpPoints - a.xpPoints;
    });

    // Limit to top 20 recommendations
    recommendedModules = recommendedModules.slice(0, 20);

    // Group by category
    const academicModules = recommendedModules.filter(m => m.category === 'academic');
    const vocationalModules = recommendedModules.filter(m => m.category === 'vocational');
    const lifeSkillsModules = recommendedModules.filter(m => m.category === 'life-skills');

    return NextResponse.json({
      academic: academicModules,
      vocational: vocationalModules,
      lifeSkills: lifeSkillsModules,
      all: recommendedModules
    });

  } catch (error) {
    console.error('Get recommended modules error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 