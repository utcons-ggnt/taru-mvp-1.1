// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

// Import all models
const User = require('../models/User.ts').default || require('../models/User.ts');
const Student = require('../models/Student.ts').default || require('../models/Student.ts');
const StudentProgress = require('../models/StudentProgress.ts').default || require('../models/StudentProgress.ts');
const AssessmentResponse = require('../models/AssessmentResponse.ts').default || require('../models/AssessmentResponse.ts');
const Assessment = require('../models/Assessment.ts').default || require('../models/Assessment.ts');
const AssessmentSession = require('../models/AssessmentSession.ts').default || require('../models/AssessmentSession.ts');
const Parent = require('../models/Parent.ts').default || require('../models/Parent.ts');
const Teacher = require('../models/Teacher.ts').default || require('../models/Teacher.ts');
const Organization = require('../models/Organization.ts').default || require('../models/Organization.ts');
const LearningPath = require('../models/LearningPath.ts').default || require('../models/LearningPath.ts');
const LearningPathResponse = require('../models/LearningPathResponse.ts').default || require('../models/LearningPathResponse.ts');
const Module = require('../models/Module.ts').default || require('../models/Module.ts');
const ModuleSession = require('../models/ModuleSession.ts').default || require('../models/ModuleSession.ts');
const UserSession = require('../models/UserSession.ts').default || require('../models/UserSession.ts');
const CareerSession = require('../models/CareerSession.ts').default || require('../models/CareerSession.ts');
const Invitation = require('../models/Invitation.ts').default || require('../models/Invitation.ts');
const AuditLog = require('../models/AuditLog.ts').default || require('../models/AuditLog.ts');
const Branch = require('../models/Branch.ts').default || require('../models/Branch.ts');
const N8NResult = require('../models/N8NResult.ts').default || require('../models/N8NResult.ts');
const YoutubeUrl = require('../models/YoutubeUrl.ts').default || require('../models/YoutubeUrl.ts');

async function cleanupDatabase() {
  try {
    console.log('🚀 Starting comprehensive database cleanup...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ===== COMPREHENSIVE CLEANUP =====
    console.log('\n🧹 Cleaning up all data from all collections...');
    
    // Define all models in dependency order (children first, then parents)
    const models = [
      { name: 'AssessmentResponse', model: AssessmentResponse },
      { name: 'LearningPathResponse', model: LearningPathResponse },
      { name: 'AssessmentSession', model: AssessmentSession },
      { name: 'ModuleSession', model: ModuleSession },
      { name: 'UserSession', model: UserSession },
      { name: 'CareerSession', model: CareerSession },
      { name: 'StudentProgress', model: StudentProgress },
      { name: 'Assessment', model: Assessment },
      { name: 'LearningPath', model: LearningPath },
      { name: 'Module', model: Module },
      { name: 'Student', model: Student },
      { name: 'Parent', model: Parent },
      { name: 'Teacher', model: Teacher },
      { name: 'Organization', model: Organization },
      { name: 'User', model: User },
      { name: 'Invitation', model: Invitation },
      { name: 'AuditLog', model: AuditLog },
      { name: 'Branch', model: Branch },
      { name: 'N8NResult', model: N8NResult },
      { name: 'YoutubeUrl', model: YoutubeUrl }
    ];

    const cleanupResults = {};

    // Delete all data from each collection
    for (const { name, model } of models) {
      try {
        const result = await model.deleteMany({});
        cleanupResults[name] = result.deletedCount;
        console.log(`   ✅ Deleted ${result.deletedCount} records from ${name}`);
      } catch (error) {
        console.error(`   ❌ Error deleting from ${name}:`, error.message);
        cleanupResults[name] = 0;
      }
    }

    // Display cleanup summary
    console.log('\n📊 Cleanup Summary:');
    console.log('='.repeat(50));
    let totalDeleted = 0;
    Object.entries(cleanupResults).forEach(([collection, count]) => {
      console.log(`   ${collection.padEnd(20)}: ${count.toString().padStart(6)} records`);
      totalDeleted += count;
    });
    console.log('='.repeat(50));
    console.log(`   ${'TOTAL'.padEnd(20)}: ${totalDeleted.toString().padStart(6)} records`);
    console.log('='.repeat(50));

    console.log('\n🎯 Database cleanup completed successfully!');
    console.log('   All collections have been emptied.');
    console.log('   The database is now fresh and ready for new data.');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  cleanupDatabase()
    .then(() => {
      console.log('\n✅ Database cleanup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Database cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupDatabase };
