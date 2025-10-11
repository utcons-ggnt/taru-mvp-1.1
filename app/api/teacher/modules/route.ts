import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Module from '@/models/Module';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const grade = searchParams.get('grade');
    const difficulty = searchParams.get('difficulty');

    // Build filter object
    const filter: any = {};
    if (subject) filter.subject = subject;
    if (grade) filter.grade = grade;
    if (difficulty) filter.difficulty = difficulty;

    // Get modules
    const modules = await Module.find(filter)
      .sort({ createdAt: -1 });

    // Transform the data for the frontend
    const modulesData = modules.map(module => ({
      id: module._id.toString(),
      title: module.title,
      subject: module.subject,
      grade: module.grade,
      difficulty: module.difficulty,
      duration: module.duration || 30,
      points: module.points || 100,
      description: module.description,
      content: module.content,
      isActive: module.isActive !== false
    }));

    return NextResponse.json({ modules: modulesData });
  } catch (error) {
    console.error('Error fetching modules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch modules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, subject, grade, difficulty, duration, points, description, content } = body;

    // Validate required fields
    if (!title || !subject || !grade || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new module
    const newModule = new Module({
      title,
      subject,
      grade,
      difficulty,
      duration: duration || 30,
      points: points || 100,
      description: description || '',
      content: content || '',
      isActive: true,
      createdBy: 'teacher123' // This should come from JWT
    });

    await newModule.save();

    return NextResponse.json({
      message: 'Module created successfully',
      module: {
        id: newModule._id.toString(),
        title: newModule.title,
        subject: newModule.subject,
        grade: newModule.grade,
        difficulty: newModule.difficulty,
        duration: newModule.duration,
        points: newModule.points,
        description: newModule.description,
        content: newModule.content,
        isActive: newModule.isActive
      }
    });
  } catch (error) {
    console.error('Error creating module:', error);
    return NextResponse.json(
      { error: 'Failed to create module' },
      { status: 500 }
    );
  }
}
