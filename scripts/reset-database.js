// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const { execSync } = require('child_process');
const path = require('path');

// Import models to ensure they're registered
const User = require('../models/User.ts').default || require('../models/User.ts');
const Student = require('../models/Student.ts').default || require('../models/Student.ts');
const Parent = require('../models/Parent.ts').default || require('../models/Parent.ts');
const Module = require('../models/Module.ts').default || require('../models/Module.ts');
const Assessment = require('../models/Assessment.ts').default || require('../models/Assessment.ts');
const StudentProgress = require('../models/StudentProgress.ts').default || require('../models/StudentProgress.ts');
const LearningPath = require('../models/LearningPath.ts').default || require('../models/LearningPath.ts');

async function resetDatabase() {
  try {
    console.log('🚀 Starting MongoDB Database Reset...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set. Please check your .env.local file.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get database instance
    const db = mongoose.connection.db;

    // List all collections
    console.log('📋 Listing existing collections...');
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections:`, collections.map(c => c.name).join(', '));

    // Drop all collections
    console.log('\n🗑️  Dropping all collections...');
    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop();
        console.log(`   ✅ Dropped: ${collection.name}`);
      } catch (error) {
        if (error.codeName === 'NamespaceNotFound') {
          console.log(`   ⚠️  Collection ${collection.name} already empty`);
        } else {
          console.log(`   ❌ Error dropping ${collection.name}:`, error.message);
        }
      }
    }

    console.log('\n🧹 Database cleared successfully!');

    // Close MongoDB connection before running seed scripts
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');

    // Run seed scripts
    console.log('🌱 Starting to seed fresh data...\n');

    // Seed modules first
    console.log('📚 Seeding modules...');
    try {
      execSync('node scripts/seed-modules.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Modules seeded successfully\n');
    } catch (error) {
      console.log('❌ Error seeding modules:', error.message);
    }

    // Seed demo users
    console.log('👥 Seeding demo users...');
    try {
      execSync('node scripts/seed-demo-users.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Demo users seeded successfully\n');
    } catch (error) {
      console.log('❌ Error seeding demo users:', error.message);
    }

    console.log('🎉 Database reset completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   • All existing data cleared');
    console.log('   • Fresh modules loaded');
    console.log('   • Demo users created');
    console.log('   • Learning paths initialized');
    console.log('\n🔑 Demo Login Credentials:');
    console.log('   Student: student1@demo.com / demopass');
    console.log('   Parent: parent1@demo.com / demopass');
    console.log('   Teacher: teacher1@demo.com / demopass');
    console.log('   Admin: admin1@demo.com / demopass');

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your MONGODB_URI in .env.local');
    console.error('   2. Ensure MongoDB server is running');
    console.error('   3. Verify network connectivity');
    console.error('   4. Check if seed scripts exist in /scripts folder');
    process.exit(1);
  } finally {
    // Ensure connection is closed
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(0);
  }
}

// Add script information
console.log('🔄 MongoDB Database Reset Script');
console.log('==================================');
console.log('This script will:');
console.log('• Clear ALL existing MongoDB data');
console.log('• Restore fresh seed data');
console.log('• Create demo users for testing');
console.log('==================================\n');

// Run the reset
resetDatabase(); 