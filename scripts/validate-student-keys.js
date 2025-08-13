const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User.ts');
const Student = require('../models/Student.ts');
const StudentProgress = require('../models/StudentProgress.ts');
const AssessmentResponse = require('../models/AssessmentResponse.ts');

// Import the centralized student key generator
const { StudentKeyGenerator } = require('../lib/studentKeyGenerator');

async function validateStudentKeys() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Validating student keys across the system...\n');

    // Get all students
    const students = await Student.find({}).populate('userId', 'name email');
    console.log(`📊 Found ${students.length} students in the system`);

    let validationErrors = [];
    let consistencyIssues = [];

    for (const student of students) {
      console.log(`\n👤 Validating student: ${student.fullName} (${student.email})`);
      
      // 1. Validate key format
      if (!StudentKeyGenerator.validate(student.uniqueId)) {
        validationErrors.push({
          student: student.fullName,
          issue: 'Invalid key format',
          key: student.uniqueId
        });
        console.log(`   ❌ Invalid key format: ${student.uniqueId}`);
      } else {
        console.log(`   ✅ Key format valid: ${student.uniqueId}`);
      }

      // 2. Check for duplicate keys
      const duplicateStudents = await Student.find({ 
        uniqueId: student.uniqueId,
        _id: { $ne: student._id }
      });
      
      if (duplicateStudents.length > 0) {
        validationErrors.push({
          student: student.fullName,
          issue: 'Duplicate key found',
          key: student.uniqueId,
          duplicates: duplicateStudents.map(s => s.fullName)
        });
        console.log(`   ❌ Duplicate key found with: ${duplicateStudents.map(s => s.fullName).join(', ')}`);
      } else {
        console.log(`   ✅ Key is unique`);
      }

      // 3. Check consistency across related collections
      const progressRecords = await StudentProgress.find({ userId: student.userId });
      const assessmentRecords = await AssessmentResponse.find({ uniqueId: student.uniqueId });
      
      console.log(`   📊 Progress records: ${progressRecords.length}`);
      console.log(`   📊 Assessment records: ${assessmentRecords.length}`);

      // 4. Check if key appears in other collections with different userId
      const otherProgressRecords = await StudentProgress.find({ 
        userId: { $ne: student.userId },
        studentId: student.userId 
      });
      
      if (otherProgressRecords.length > 0) {
        consistencyIssues.push({
          student: student.fullName,
          issue: 'Progress records with mismatched userId',
          key: student.uniqueId,
          count: otherProgressRecords.length
        });
        console.log(`   ⚠️  Found ${otherProgressRecords.length} progress records with mismatched userId`);
      }

      // 5. Check parent linking
      const parentUsers = await User.find({ 
        role: 'parent',
        'profile.linkedStudentUniqueId': student.uniqueId
      });

      if (parentUsers.length > 0) {
        console.log(`   👨‍👩‍👧‍👦 Linked to ${parentUsers.length} parent(s): ${parentUsers.map(p => p.name).join(', ')}`);
      } else {
        console.log(`   👨‍👩‍👧‍👦 No parent linked`);
      }

      // 6. Check teacher assignments
      const teacherUsers = await User.find({ 
        role: 'teacher'
      });
      
      // This would need to be expanded based on how teachers are linked to students
      console.log(`   👨‍🏫 Teacher assignments: Check manually`);
    }

    // Summary
    console.log('\n📋 VALIDATION SUMMARY');
    console.log('========================');
    
    if (validationErrors.length === 0 && consistencyIssues.length === 0) {
      console.log('✅ All student keys are valid and consistent!');
    } else {
      if (validationErrors.length > 0) {
        console.log(`\n❌ Validation Errors (${validationErrors.length}):`);
        validationErrors.forEach(error => {
          console.log(`   - ${error.student}: ${error.issue} - ${error.key}`);
        });
      }
      
      if (consistencyIssues.length > 0) {
        console.log(`\n⚠️  Consistency Issues (${consistencyIssues.length}):`);
        consistencyIssues.forEach(issue => {
          console.log(`   - ${issue.student}: ${issue.issue} - ${issue.count} records`);
        });
      }
    }

    // Generate sample keys for comparison
    console.log('\n🔑 Sample Generated Keys:');
    for (let i = 0; i < 5; i++) {
      const sampleKey = StudentKeyGenerator.generate();
      console.log(`   ${i + 1}. ${sampleKey}`);
    }

    console.log('\n🔑 Sample Deterministic Keys:');
    const sampleNames = ['John Doe', 'Jane Smith', 'Bob Johnson'];
    sampleNames.forEach(name => {
      const sampleKey = StudentKeyGenerator.generateDeterministic('sampleId123', name);
      console.log(`   ${name}: ${sampleKey}`);
    });

  } catch (error) {
    console.error('❌ Error during validation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run validation if called directly
if (require.main === module) {
  validateStudentKeys();
}

module.exports = { validateStudentKeys };
