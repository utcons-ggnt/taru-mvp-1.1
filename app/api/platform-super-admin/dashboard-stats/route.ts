import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Branch from '@/models/Branch';
import Teacher from '@/models/Teacher';
import Student from '@/models/Student';
import AuditLog from '@/models/AuditLog';

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
    
    if (!user || user.role !== 'platform_super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get organization statistics
    const totalOrganizations = await Organization.countDocuments();
    const pendingApprovals = await Organization.countDocuments({ approvalStatus: 'pending' });
    const approvedOrganizations = await Organization.countDocuments({ approvalStatus: 'approved' });
    const rejectedOrganizations = await Organization.countDocuments({ approvalStatus: 'rejected' });

    // Get branch statistics
    const totalBranches = await Branch.countDocuments({ isActive: true });

    // Get user statistics
    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalStudents = await Student.countDocuments({ onboardingCompleted: true });

    // Get audit log statistics
    const totalAuditLogs = await AuditLog.countDocuments();
    const criticalAlerts = await AuditLog.countDocuments({ severity: 'critical' });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentActivity = await AuditLog.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get organizations by type
    const organizationsByType = await Organization.aggregate([
      { $group: { _id: '$organizationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent organizations
    const recentOrganizations = await Organization.find()
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get critical audit logs
    const criticalAuditLogs = await AuditLog.find({ severity: 'critical' })
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      totalOrganizations,
      pendingApprovals,
      approvedOrganizations,
      rejectedOrganizations,
      totalBranches,
      totalTeachers,
      totalStudents,
      totalAuditLogs,
      criticalAlerts,
      recentActivity,
      organizationsByType,
      recentOrganizations,
      criticalAuditLogs
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
