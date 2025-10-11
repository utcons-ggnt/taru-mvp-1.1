import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Parent from '@/models/Parent';
import AuditLog from '@/models/AuditLog';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      phoneNumber,
      currentPassword,
      newPassword,
      notificationEmail,
      notificationSMS,
      weeklyReports,
      studentProgressAlerts
    } = body;

    // Update basic profile info
    if (name) {
      user.name = name;
    }

    await user.save();

    // Update parent profile
    const parent = await Parent.findOne({ userId: user._id.toString() });
    if (parent) {
      if (phoneNumber) {
        parent.phoneNumber = phoneNumber;
      }
      
      if (notificationEmail !== undefined) {
        parent.preferences.notificationEmail = notificationEmail;
      }
      if (notificationSMS !== undefined) {
        parent.preferences.notificationSMS = notificationSMS;
      }
      if (weeklyReports !== undefined) {
        parent.preferences.weeklyReports = weeklyReports;
      }
      if (studentProgressAlerts !== undefined) {
        parent.preferences.studentProgressAlerts = studentProgressAlerts;
      }

      await parent.save();
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();
    }

    // Log audit
    await AuditLog.create({
      userId: user._id.toString(),
      userRole: user.role,
      action: 'UPDATE_PARENT_PROFILE',
      resource: 'Parent',
      resourceId: parent?._id.toString() || '',
      details: {
        newValues: { 
          name: name || user.name,
          phoneNumber: phoneNumber || parent?.phoneNumber,
          preferences: {
            notificationEmail: notificationEmail ?? parent?.preferences?.notificationEmail,
            notificationSMS: notificationSMS ?? parent?.preferences?.notificationSMS,
            weeklyReports: weeklyReports ?? parent?.preferences?.weeklyReports,
            studentProgressAlerts: studentProgressAlerts ?? parent?.preferences?.studentProgressAlerts
          }
        }
      },
      severity: 'low'
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      parent: parent ? {
        id: parent._id,
        fullName: parent.fullName,
        phoneNumber: parent.phoneNumber,
        preferences: parent.preferences
      } : null
    });

  } catch (error) {
    console.error('Error updating parent profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
