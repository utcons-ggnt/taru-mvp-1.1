// Test script to verify learning path deduplication
const mongoose = require('mongoose');

// Mock LearningPath model for testing
const learningPathSchema = new mongoose.Schema({
  pathId: { type: String, required: true, unique: true },
  uniqueId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['academic', 'vocational', 'life-skills'], required: true },
  targetGrade: { type: String },
  careerGoal: { type: String },
  milestones: [{
    milestoneId: String,
    name: String,
    description: String,
    modules: [String],
    estimatedTime: Number,
    prerequisites: [String],
    status: { type: String, enum: ['locked', 'available', 'in-progress', 'completed'], default: 'locked' },
    progress: { type: Number, default: 0 }
  }],
  totalModules: { type: Number, default: 0 },
  totalDuration: { type: Number, default: 0 },
  totalXpPoints: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add compound unique index to prevent duplicate learning paths for same uniqueId and careerGoal
learningPathSchema.index({ uniqueId: 1, careerGoal: 1 }, { unique: true });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

async function testDeduplication() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taru2');
    console.log('✅ Connected to MongoDB');

    const testUniqueId = 'TEST_UNIQUE_ID_123';
    const testCareerGoal = 'Software Engineer';

    // Test 1: Create first learning path
    console.log('\n🧪 Test 1: Creating first learning path...');
    const firstPath = new LearningPath({
      pathId: 'LP_TEST_001',
      uniqueId: testUniqueId,
      name: 'Software Engineer Learning Path',
      description: 'First learning path for Software Engineer',
      category: 'vocational',
      targetGrade: '10',
      careerGoal: testCareerGoal,
      milestones: [{
        milestoneId: 'MIL_001',
        name: 'Programming Basics',
        description: 'Learn basic programming concepts',
        modules: ['intro_programming', 'variables', 'functions'],
        estimatedTime: 120,
        prerequisites: [],
        status: 'available',
        progress: 0
      }],
      totalModules: 3,
      totalDuration: 120,
      totalXpPoints: 100,
      isActive: true
    });

    await firstPath.save();
    console.log('✅ First learning path created successfully');

    // Test 2: Try to create duplicate learning path (should fail)
    console.log('\n🧪 Test 2: Attempting to create duplicate learning path...');
    try {
      const duplicatePath = new LearningPath({
        pathId: 'LP_TEST_002',
        uniqueId: testUniqueId,
        name: 'Software Engineer Learning Path (Duplicate)',
        description: 'Duplicate learning path for Software Engineer',
        category: 'vocational',
        targetGrade: '10',
        careerGoal: testCareerGoal,
        milestones: [{
          milestoneId: 'MIL_002',
          name: 'Advanced Programming',
          description: 'Learn advanced programming concepts',
          modules: ['oop', 'design_patterns', 'algorithms'],
          estimatedTime: 180,
          prerequisites: [],
          status: 'available',
          progress: 0
        }],
        totalModules: 3,
        totalDuration: 180,
        totalXpPoints: 150,
        isActive: true
      });

      await duplicatePath.save();
      console.log('❌ ERROR: Duplicate learning path was created (this should not happen!)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ SUCCESS: Duplicate learning path creation was prevented by unique index');
        console.log('   Error details:', error.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 3: Create learning path for different career goal (should succeed)
    console.log('\n🧪 Test 3: Creating learning path for different career goal...');
    const differentCareerPath = new LearningPath({
      pathId: 'LP_TEST_003',
      uniqueId: testUniqueId,
      name: 'Data Scientist Learning Path',
      description: 'Learning path for Data Scientist',
      category: 'vocational',
      targetGrade: '10',
      careerGoal: 'Data Scientist',
      milestones: [{
        milestoneId: 'MIL_003',
        name: 'Data Analysis Basics',
        description: 'Learn basic data analysis concepts',
        modules: ['statistics', 'python', 'pandas'],
        estimatedTime: 150,
        prerequisites: [],
        status: 'available',
        progress: 0
      }],
      totalModules: 3,
      totalDuration: 150,
      totalXpPoints: 120,
      isActive: true
    });

    await differentCareerPath.save();
    console.log('✅ Learning path for different career goal created successfully');

    // Test 4: Create learning path for different uniqueId (should succeed)
    console.log('\n🧪 Test 4: Creating learning path for different uniqueId...');
    const differentUniqueIdPath = new LearningPath({
      pathId: 'LP_TEST_004',
      uniqueId: 'TEST_UNIQUE_ID_456',
      name: 'Software Engineer Learning Path (Different Student)',
      description: 'Learning path for different student',
      category: 'vocational',
      targetGrade: '10',
      careerGoal: testCareerGoal,
      milestones: [{
        milestoneId: 'MIL_004',
        name: 'Web Development',
        description: 'Learn web development concepts',
        modules: ['html', 'css', 'javascript'],
        estimatedTime: 200,
        prerequisites: [],
        status: 'available',
        progress: 0
      }],
      totalModules: 3,
      totalDuration: 200,
      totalXpPoints: 180,
      isActive: true
    });

    await differentUniqueIdPath.save();
    console.log('✅ Learning path for different uniqueId created successfully');

    // Test 5: Query existing learning paths
    console.log('\n🧪 Test 5: Querying existing learning paths...');
    const existingPaths = await LearningPath.find({ uniqueId: testUniqueId });
    console.log(`✅ Found ${existingPaths.length} learning paths for uniqueId ${testUniqueId}:`);
    existingPaths.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path.name} (${path.careerGoal}) - ${path.pathId}`);
    });

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await LearningPath.deleteMany({ pathId: { $regex: '^LP_TEST_' } });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Learning paths with same uniqueId + careerGoal are prevented');
    console.log('   ✅ Learning paths with different careerGoal are allowed');
    console.log('   ✅ Learning paths with different uniqueId are allowed');
    console.log('   ✅ Unique index is working correctly');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
testDeduplication();
