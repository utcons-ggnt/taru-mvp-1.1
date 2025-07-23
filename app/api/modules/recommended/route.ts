import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Module from '@/models/Module';

export async function GET() {
  try {
    await connectDB();
    
    // Get recommended modules (all available modules for now)
    const modules = await Module.find({}).limit(10);
    
    return NextResponse.json({
      success: true,
      modules: modules.map(module => ({
        id: module._id,
        moduleId: module.moduleId,
        title: module.title,
        description: module.description,
        subject: module.subject,
        grade: module.grade,
        difficulty: module.difficulty,
        duration: module.duration,
        videoUrl: module.videoUrl,
        points: module.points,
        tags: module.tags,
        quizQuestions: module.quizQuestions,
        contentTypes: module.contentTypes,
        gamification: module.gamification
      }))
    });
  } catch (error) {
    console.error('Error fetching recommended modules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
} 