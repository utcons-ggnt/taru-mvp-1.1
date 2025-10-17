import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Teacher from '@/models/Teacher';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'organization') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const organization = await Organization.findOne({ userId: user._id.toString() });
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    console.log('Received teacherId:', teacherId);
    console.log('URL:', request.url);

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID is required' }, { status: 400 });
    }

    // Find the teacher and verify they belong to this organization
    const teacher = await Teacher.findOne({ 
      _id: teacherId,
      organizationId: organization._id.toString()
    });

    if (!teacher) {
      return NextResponse.json({ error: 'Teacher not found or access denied' }, { status: 404 });
    }

    // Get the user account for this teacher
    const teacherUser = await User.findById(teacher.userId);
    if (!teacherUser) {
      return NextResponse.json({ error: 'Teacher user account not found' }, { status: 404 });
    }

    // Generate a new temporary password for the teacher
    const generateSecurePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const newTemporaryPassword = generateSecurePassword();

    // Update the teacher's password with the new permanent password
    teacherUser.password = newTemporaryPassword;
    // Remove firstTimeLogin flag to make password permanent
    teacherUser.firstTimeLogin = false;
    await teacherUser.save();

    const loginUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login`;

    return NextResponse.json({
      message: 'Teacher credentials retrieved successfully',
      credentials: {
        id: teacherUser._id.toString(),
        name: teacherUser.name,
        email: teacherUser.email,
        password: newTemporaryPassword,
        loginUrl
      }
    });

  } catch (error) {
    console.error('Error retrieving teacher credentials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
