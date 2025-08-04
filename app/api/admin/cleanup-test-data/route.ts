import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import AssessmentResponse from '@/models/AssessmentResponse';
import StudentProgress from '@/models/StudentProgress';

export async function DELETE() {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cleanup endpoint not available in production' },
        { status: 403 }
      );
    }

    console.log('🧹 Starting test data cleanup...');
    await connectDB();

    // Define patterns to identify test data
    const testPatterns = [
      /test.*student/i,
      /debug.*student/i,
      /api.*test.*user/i,
      /db.*test.*user/i,
      /fresh.*debug/i,
      /assessment.*debug/i
    ];

    const testEmailPatterns = [
      /test-\d+@example\.com/,
      /debug-\d+@example\.com/,
      /assess-debug-\d+@example\.com/,
      /fresh-debug-\d+@example\.com/
    ];

    const deletedCounts = {
      users: 0,
      students: 0,
      assessmentResponses: 0,
      studentProgress: 0
    };

    // 1. Find and delete test users
    const testUserConditions = [
      { email: { $in: testEmailPatterns } },
      { name: { $in: testPatterns } }
    ];

    for (const condition of testUserConditions) {
      const testUsers = await User.find(condition);
      console.log(`🔍 Found ${testUsers.length} test users matching condition`);
      
      for (const user of testUsers) {
        console.log(`   Deleting user: ${user.name} (${user.email})`);
        await User.deleteOne({ _id: user._id });
        deletedCounts.users++;
      }
    }

    // 2. Find and delete test students
    const testStudentConditions = [
      { fullName: { $in: testPatterns } }
    ];

    for (const condition of testStudentConditions) {
      const testStudents = await Student.find(condition);
      console.log(`🔍 Found ${testStudents.length} test students`);
      
      for (const student of testStudents) {
        console.log(`   Deleting student: ${student.fullName} (${student.uniqueId})`);
        
        // Delete associated assessment responses
        const assessmentDeleted = await AssessmentResponse.deleteMany({ 
          uniqueId: student.uniqueId 
        });
        deletedCounts.assessmentResponses += assessmentDeleted.deletedCount || 0;
        
        // Delete associated student progress
        const progressDeleted = await StudentProgress.deleteMany({ 
          userId: student.userId 
        });
        deletedCounts.studentProgress += progressDeleted.deletedCount || 0;
        
        // Delete the student record
        await Student.deleteOne({ _id: student._id });
        deletedCounts.students++;
      }
    }

    // 3. Clean up orphaned assessment responses (those with test-like unique IDs)
    await AssessmentResponse.deleteMany({
      $or: [
        { uniqueId: { $regex: /^STU[A-Z0-9]{5,}$/ } }, // Generated test IDs
        { uniqueId: { $in: [] } } // Add specific IDs if needed
      ]
    });

    // 4. Clean up orphaned student progress records
    await StudentProgress.deleteMany({
      userId: { $exists: false }
    });

    console.log('✅ Cleanup completed successfully');
    console.log('📊 Cleanup Summary:', deletedCounts);

    return NextResponse.json({
      success: true,
      message: 'Test data cleanup completed',
      deleted: deletedCounts,
      summary: {
        totalDeleted: Object.values(deletedCounts).reduce((sum, count) => sum + count, 0),
        ...deletedCounts
      }
    });

  } catch (error) {
    console.error('❌ Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what would be deleted
export async function GET() {
  try {
    // Only allow in development environment for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Cleanup endpoint not available in production' },
        { status: 403 }
      );
    }

    await connectDB();

    // Define patterns to identify test data
    const testPatterns = [
      /test.*student/i,
      /debug.*student/i,
      /api.*test.*user/i,
      /db.*test.*user/i,
      /fresh.*debug/i,
      /assessment.*debug/i
    ];

    const testEmailPatterns = [
      /test-\d+@example\.com/,
      /debug-\d+@example\.com/,
      /assess-debug-\d+@example\.com/,
      /fresh-debug-\d+@example\.com/
    ];

    // Find test users
    const testUsers = await User.find({
      $or: [
        { email: { $in: testEmailPatterns } },
        { name: { $in: testPatterns } }
      ]
    }).select('name email _id');

    // Find test students
    const testStudents = await Student.find({
      fullName: { $in: testPatterns }
    }).select('fullName uniqueId userId _id');

    // Count associated data
    let assessmentCount = 0;
    let progressCount = 0;

    for (const student of testStudents) {
      const assessments = await AssessmentResponse.countDocuments({ uniqueId: student.uniqueId });
      const progress = await StudentProgress.countDocuments({ userId: student.userId });
      assessmentCount += assessments;
      progressCount += progress;
    }

    return NextResponse.json({
      success: true,
      preview: {
        users: {
          count: testUsers.length,
          items: testUsers.map(u => ({ name: u.name, email: u.email, id: u._id }))
        },
        students: {
          count: testStudents.length,
          items: testStudents.map(s => ({ name: s.fullName, uniqueId: s.uniqueId, id: s._id }))
        },
        assessmentResponses: {
          count: assessmentCount
        },
        studentProgress: {
          count: progressCount
        }
      },
      totalToDelete: testUsers.length + testStudents.length + assessmentCount + progressCount
    });

  } catch (error) {
    console.error('❌ Preview error:', error);
    return NextResponse.json(
      { error: 'Preview failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}