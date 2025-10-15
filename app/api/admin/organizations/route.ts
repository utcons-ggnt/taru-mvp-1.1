import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface DecodedToken {
  userId: string;
  role: string;
  [key: string]: unknown;
}

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

    // Get user and verify they are an admin (admin dashboard is now admin-only)
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can access this endpoint' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get organizations with pagination
    const organizations = await Organization.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrganizations = await Organization.countDocuments({});

    // Get organization statistics
    const orgStats = await Organization.aggregate([
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          activeOrganizations: { $sum: { $cond: ['$isActive', 1, 0] } },
          totalStudents: { $sum: '$studentCount' },
          totalTeachers: { $sum: '$teacherCount' }
        }
      }
    ]);

    // Get organization type breakdown
    const typeBreakdown = await Organization.aggregate([
      { $group: { _id: '$organizationType', count: { $sum: 1 } } }
    ]);

    // Get region breakdown
    const regionBreakdown = await Organization.aggregate([
      { $group: { _id: '$region', count: { $sum: 1 } } }
    ]);

    // Enhance organizations with user counts
    const enhancedOrganizations = await Promise.all(
      organizations.map(async (org) => {
        const orgObj = org.toJSON();
        
        // Get actual user counts
        const studentCount = await Student.countDocuments({ organizationId: org._id.toString() });
        const teacherCount = await Teacher.countDocuments({ organizationId: org._id.toString() });
        
        // Get organization admin
        const admin = await User.findOne({ 
          role: 'organization', 
          'profile.organizationId': org._id.toString() 
        });

        return {
          ...orgObj,
          actualStudentCount: studentCount,
          actualTeacherCount: teacherCount,
          admin: admin ? {
            _id: admin._id,
            name: admin.name,
            email: admin.email
          } : null
        };
      })
    );

    return NextResponse.json({
      organizations: enhancedOrganizations,
      pagination: {
        page,
        limit,
        total: totalOrganizations,
        pages: Math.ceil(totalOrganizations / limit)
      },
      statistics: {
        ...(orgStats[0] || {
          totalOrganizations: 0,
          activeOrganizations: 0,
          totalStudents: 0,
          totalTeachers: 0
        }),
        typeBreakdown: typeBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        regionBreakdown: regionBreakdown.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });

  } catch (error) {
    console.error('Admin organizations fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only platform administrators can create organizations' },
        { status: 403 }
      );
    }

    const {
      name,
      organizationType,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
      region,
      website,
      description,
      isActive = true
    } = await request.json();

    // Validate required fields
    if (!name || !organizationType || !contactEmail) {
      return NextResponse.json(
        { error: 'Name, organization type, and contact email are required' },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this name already exists' },
        { status: 400 }
      );
    }

    // Create new organization
    const newOrganization = new Organization({
      name,
      organizationType,
      contactEmail,
      contactPhone: contactPhone || '',
      address: address || '',
      city: city || '',
      state: state || '',
      country: country || '',
      region: region || '',
      website: website || '',
      description: description || '',
      isActive,
      studentCount: 0,
      teacherCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newOrganization.save();

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      organization: {
        _id: newOrganization._id,
        name: newOrganization.name,
        organizationType: newOrganization.organizationType,
        contactEmail: newOrganization.contactEmail,
        isActive: newOrganization.isActive,
        createdAt: newOrganization.createdAt
      }
    });

  } catch (error) {
    console.error('Admin organization creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only platform administrators can modify organizations' },
        { status: 403 }
      );
    }

    const { organizationId, action, data } = await request.json();

    if (!organizationId || !action) {
      return NextResponse.json(
        { error: 'Organization ID and action are required' },
        { status: 400 }
      );
    }

    const targetOrganization = await Organization.findById(organizationId);
    if (!targetOrganization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    switch (action) {
      case 'update':
        // Update organization fields
        Object.keys(data).forEach(key => {
          if (data[key] !== undefined) {
            targetOrganization[key] = data[key];
          }
        });
        targetOrganization.updatedAt = new Date();
        await targetOrganization.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Organization updated successfully',
          organization: targetOrganization.toJSON()
        });

      case 'activate':
        targetOrganization.isActive = true;
        targetOrganization.updatedAt = new Date();
        await targetOrganization.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Organization activated successfully' 
        });

      case 'deactivate':
        targetOrganization.isActive = false;
        targetOrganization.updatedAt = new Date();
        await targetOrganization.save();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Organization deactivated successfully' 
        });

      case 'assign_admin':
        if (!data.adminEmail) {
          return NextResponse.json(
            { error: 'Admin email is required' },
            { status: 400 }
          );
        }

        // Find or create admin user
        let adminUser = await User.findOne({ email: data.adminEmail });
        if (!adminUser) {
          // Create new admin user
          adminUser = new User({
            name: data.adminName || 'Organization Admin',
            email: data.adminEmail,
            role: 'organization',
            password: 'TempPass123', // In production, generate secure password
            profile: {
              organizationId: targetOrganization._id.toString(),
              organizationType: targetOrganization.organizationType
            }
          });
          await adminUser.save();
        } else {
          // Update existing user
          adminUser.role = 'organization';
          adminUser.profile = {
            ...adminUser.profile,
            organizationId: targetOrganization._id.toString(),
            organizationType: targetOrganization.organizationType
          };
          await adminUser.save();
        }
        
        return NextResponse.json({ 
          success: true, 
          message: 'Admin assigned successfully',
          admin: {
            _id: adminUser._id,
            name: adminUser.name,
            email: adminUser.email
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Admin organization update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get user and verify they are an admin
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only platform administrators can delete organizations' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const targetOrganization = await Organization.findById(organizationId);
    if (!targetOrganization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Check if organization has users
    const studentCount = await Student.countDocuments({ organizationId });
    const teacherCount = await Teacher.countDocuments({ organizationId });
    
    if (studentCount > 0 || teacherCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete organization with existing users. Please transfer or remove users first.' },
        { status: 400 }
      );
    }

    // Delete related organization admin users
    await User.updateMany(
      { 'profile.organizationId': organizationId },
      { $unset: { profile: 1 }, role: 'student' }
    );

    // Delete the organization
    await Organization.findByIdAndDelete(organizationId);

    return NextResponse.json({ 
      success: true, 
      message: 'Organization deleted successfully' 
    });

  } catch (error) {
    console.error('Admin organization delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
