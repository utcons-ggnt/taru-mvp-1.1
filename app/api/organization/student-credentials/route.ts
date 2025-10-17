import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Student credentials API called');
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      console.log('No auth token found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'organization') {
      console.log('User not found or not organization role:', user?.role);
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    console.log('Student ID requested:', studentId);

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    // Find the student record
    const student = await Student.findById(studentId);
    console.log('Student found:', student ? 'YES' : 'NO');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Find the associated user account
    const studentUser = await User.findById(student.userId);
    console.log('Student user found:', studentUser ? 'YES' : 'NO');
    if (!studentUser) {
      return NextResponse.json({ error: 'Student user account not found' }, { status: 404 });
    }

    // Generate a permanent password for sharing
    const generatePermanentPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const permanentPassword = generatePermanentPassword();
    console.log('Generated permanent password:', permanentPassword);

    // Update the student's password in the database with the permanent password
    console.log('Updating student password with permanent password');
    const userToUpdate = await User.findById(student.userId);
    if (userToUpdate) {
      console.log('User found, updating password...');
      userToUpdate.password = permanentPassword; // This will trigger the pre-save hook to hash the password
      userToUpdate.firstTimeLogin = true; // Mark for password change on first login
      await userToUpdate.save(); // This will trigger the pre-save hook
      console.log('Student password updated and hashed successfully');
      
      // Verify the password was updated by checking if it's different from the original
      const updatedUser = await User.findById(student.userId);
      console.log('Password was updated:', updatedUser?.password !== studentUser.password);
    } else {
      console.log('User not found for password update');
    }

    // Build credentials object
    const credentials = {
      id: student._id.toString(),
      userId: studentUser._id.toString(),
      fullName: student.fullName || studentUser.name,
      email: studentUser.email,
      password: permanentPassword, // Use the generated permanent password
      classGrade: student.classGrade,
      schoolName: student.schoolName,
      uniqueId: student.uniqueId,
      onboardingCompleted: student.onboardingCompleted,
      joinedAt: student.createdAt
    };

    console.log('Returning credentials:', credentials);
    return NextResponse.json({
      message: 'Student credentials retrieved successfully',
      credentials
    });

  } catch (error) {
    console.error('Error retrieving student credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
