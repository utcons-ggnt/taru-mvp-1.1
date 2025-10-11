import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';
import Module from '@/models/Module';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // For now, we'll use a mock teacher ID - in production, decode JWT
    const teacherId = 'teacher123';
    
    // TODO: Implement proper JWT authentication
    // const token = request.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // Get students
    const students = await Student.find({ teacherId });

    // Get modules
    const modules = await Module.find({ isActive: true });

    // Calculate analytics
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.onboardingCompleted).length;
    
    // Calculate average progress
    const totalProgress = students.reduce((sum, student) => {
      return sum + (student.totalModulesCompleted || 0);
    }, 0);
    const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

    // Calculate total XP
    const totalXp = students.reduce((sum, student) => {
      return sum + (student.totalXpEarned || 0);
    }, 0);

    // Calculate average score
    const totalScore = students.reduce((sum, student) => {
      return sum + (student.diagnosticScore || 0);
    }, 0);
    const averageScore = totalStudents > 0 ? Math.round(totalScore / totalStudents) : 0;

    // Get top performing students
    const topStudents = students
      .sort((a, b) => (b.totalXpEarned || 0) - (a.totalXpEarned || 0))
      .slice(0, 5)
      .map(student => ({
        id: student._id.toString(),
        name: student.userId?.name || 'Unknown',
        xp: student.totalXpEarned || 0,
        modulesCompleted: student.totalModulesCompleted || 0,
        classGrade: student.classGrade || 'Not specified'
      }));

    // Get recent activity (mock data for now)
    const recentActivity = [
      {
        id: 1,
        action: 'Student completed module',
        student: 'John Doe',
        module: 'Algebra Basics',
        time: '2 hours ago',
        type: 'completion'
      },
      {
        id: 2,
        action: 'Assignment submitted',
        student: 'Jane Smith',
        module: 'Science Report',
        time: '4 hours ago',
        type: 'submission'
      },
      {
        id: 3,
        action: 'New student joined',
        student: 'Mike Johnson',
        module: 'Grade 7',
        time: '1 day ago',
        type: 'enrollment'
      }
    ];

    // Get subject distribution
    const subjectDistribution = modules.reduce((acc, module) => {
      acc[module.subject] = (acc[module.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get grade distribution
    const gradeDistribution = students.reduce((acc, student) => {
      const grade = student.classGrade || 'Unknown';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const analytics = {
      overview: {
        totalStudents,
        activeStudents,
        averageProgress,
        totalXp,
        averageScore,
        totalModules: modules.length
      },
      topStudents,
      recentActivity,
      distributions: {
        subjects: subjectDistribution,
        grades: gradeDistribution
      },
      charts: {
        // Placeholder for chart data
        studentProgress: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [20, 35, 45, 60]
        },
        assignmentCompletion: {
          labels: ['Math', 'Science', 'English', 'History'],
          data: [85, 70, 90, 65]
        }
      }
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
