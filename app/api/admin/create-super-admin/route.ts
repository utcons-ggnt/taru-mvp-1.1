import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Super Admin credentials to create
const SUPER_ADMINS = [
  {
    name: 'Platform Super Admin',
    email: 'superadmin@taru.com',
    password: 'SuperAdmin@2024!',
    role: 'platform_super_admin',
    profile: {
      organizationType: 'platform',
      industry: 'education_technology'
    }
  },
  {
    name: 'System Administrator',
    email: 'sysadmin@taru.com',
    password: 'SysAdmin@2024!',
    role: 'platform_super_admin',
    profile: {
      organizationType: 'platform',
      industry: 'education_technology'
    }
  },
  {
    name: 'Platform Owner',
    email: 'owner@taru.com',
    password: 'Owner@2024!',
    role: 'platform_super_admin',
    profile: {
      organizationType: 'platform',
      industry: 'education_technology'
    }
  }
];

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    const results = [];
    const errors = [];

    for (const adminData of SUPER_ADMINS) {
      try {
        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        
        if (existingAdmin) {
          // Update role if not already platform_super_admin
          if (existingAdmin.role !== 'platform_super_admin') {
            existingAdmin.role = 'platform_super_admin';
            await existingAdmin.save();
            results.push({
              email: adminData.email,
              name: adminData.name,
              action: 'updated',
              message: 'Role updated to platform_super_admin'
            });
          } else {
            results.push({
              email: adminData.email,
              name: adminData.name,
              action: 'exists',
              message: 'Super admin already exists'
            });
          }
          continue;
        }

        // Create new super admin
        const superAdmin = new User({
          name: adminData.name,
          email: adminData.email,
          password: adminData.password, // Will be hashed by pre-save hook
          role: adminData.role,
          profile: adminData.profile,
          avatar: '/avatars/Group.svg',
          firstTimeLogin: false, // Set to false so they don't get onboarding prompts
          isIndependent: true
        });

        await superAdmin.save();
        results.push({
          email: adminData.email,
          name: adminData.name,
          action: 'created',
          message: 'Super admin created successfully'
        });

      } catch (error) {
        console.error(`Error creating super admin ${adminData.email}:`, error);
        errors.push({
          email: adminData.email,
          name: adminData.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Get all super admins for summary
    const allSuperAdmins = await User.find({ role: 'platform_super_admin' });

    return NextResponse.json({
      success: true,
      message: 'Super admin creation process completed',
      results,
      errors,
      summary: {
        totalSuperAdmins: allSuperAdmins.length,
        superAdmins: allSuperAdmins.map(admin => ({
          name: admin.name,
          email: admin.email,
          role: admin.role,
          createdAt: admin.createdAt
        }))
      },
      credentials: SUPER_ADMINS.map(admin => ({
        name: admin.name,
        email: admin.email,
        password: admin.password
      }))
    });

  } catch (error) {
    console.error('Super admin creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
