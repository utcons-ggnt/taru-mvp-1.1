const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Define schemas directly since we can't import TypeScript models in Node.js
const userSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  studentId: { type: String, index: true },
  sessionId: { type: String, required: true, unique: true },
  currentPage: { type: String, required: true },
  navigationHistory: [{ type: String }],
  sessionData: [{
    page: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  lastActivity: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const assessmentSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  assessmentType: { type: String, enum: ['diagnostic', 'interest', 'skill'], required: true },
  currentQuestion: { type: Number, default: 1 },
  totalQuestions: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  answers: [{ type: mongoose.Schema.Types.Mixed }],
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  result: { type: mongoose.Schema.Types.Mixed },
  n8nResults: { type: mongoose.Schema.Types.Mixed },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const careerSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  studentId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  currentCareerPath: { type: String, default: '' },
  careerPaths: [{
    careerPath: { type: String, required: true },
    description: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, required: true },
    selectedAt: { type: Date, default: Date.now }
  }],
  explorationHistory: [{ type: String }],
  selectedCareerDetails: { type: mongoose.Schema.Types.Mixed },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  uniqueId: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  // Add other fields as needed
}, { timestamps: true });

const studentProgressSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  moduleProgress: [{ type: mongoose.Schema.Types.Mixed }],
  totalPoints: { type: Number, default: 0 },
  totalModulesCompleted: { type: Number, default: 0 },
  totalWatchTime: { type: Number, default: 0 },
  totalInteractiveTime: { type: Number, default: 0 },
  totalProjectTime: { type: Number, default: 0 },
  totalPeerLearningTime: { type: Number, default: 0 },
  learningStreak: { type: Number, default: 0 },
  badgesEarned: [{ type: String }],
  skillLevels: { type: Map, of: Number, default: {} },
  learningPreferences: {
    preferredContentTypes: [{ type: String }],
    preferredDifficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    preferredGroupSize: { type: Number, default: 4 },
    preferredTimeOfDay: { type: String, default: 'morning' }
  },
  aiInsights: {
    learningStyle: { type: String, default: 'visual' },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    recommendations: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now }
  }
}, { timestamps: true });

// Create models
const UserSession = mongoose.model('UserSession', userSessionSchema);
const AssessmentSession = mongoose.model('AssessmentSession', assessmentSessionSchema);
const CareerSession = mongoose.model('CareerSession', careerSessionSchema);
const Student = mongoose.model('Student', studentSchema);
const StudentProgress = mongoose.model('StudentProgress', studentProgressSchema);

async function migrateSessionData() {
  try {
    console.log('🔄 Starting session data migration...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Get all students
    const students = await Student.find({});
    console.log(`📊 Found ${students.length} students to migrate`);

    for (const student of students) {
      console.log(`\n🔄 Migrating data for student: ${student.fullName} (${student.uniqueId})`);

      try {
        // Create user session
        const userSession = new UserSession({
          userId: student.userId,
          studentId: student._id.toString(),
          sessionId: `session_${student._id}_${Date.now()}`,
          currentPage: '/dashboard/student',
          navigationHistory: ['/student-onboarding', '/interest-assessment', '/diagnostic-assessment'],
          sessionData: [],
          isActive: true
        });
        await userSession.save();

        // Migrate assessment data
        const assessmentResponses = await db.collection('Learning-path-responses').findOne({ uniqueid: student.uniqueId });
        const n8nResults = await db.collection('n8nresults').findOne({ uniqueId: student.uniqueId });

        if (assessmentResponses || n8nResults) {
          const assessmentSession = new AssessmentSession({
            userId: student.userId,
            studentId: student._id.toString(),
            sessionId: userSession.sessionId,
            assessmentType: 'diagnostic',
            currentQuestion: 10,
            totalQuestions: 10,
            progress: 100,
            answers: [],
            isCompleted: true,
            completedAt: new Date(),
            result: assessmentResponses?.Result || n8nResults?.processedData,
            n8nResults: n8nResults?.responseData || null
          });
          await assessmentSession.save();
          console.log('  ✅ Migrated assessment data');
        }

        // Migrate career path data
        const careerPathData = await db.collection('learning-path-student').findOne({ uniqueid: student.uniqueId });
        const careerOptions = await db.collection('Career-Option-Generation').findOne({ uniqueId: student.uniqueId });

        if (careerPathData || careerOptions) {
          const careerSession = new CareerSession({
            userId: student.userId,
            studentId: student._id.toString(),
            sessionId: userSession.sessionId,
            currentCareerPath: careerPathData?.output?.greeting ? 'Career Path Generated' : 'Career Options Available',
            careerPaths: careerPathData ? [{
              careerPath: 'Generated Career Path',
              description: careerPathData.output?.greeting || 'Career path generated',
              details: careerPathData.output,
              selectedAt: new Date()
            }] : [],
            explorationHistory: ['/career-exploration'],
            selectedCareerDetails: careerPathData?.output || careerOptions?.output,
            isCompleted: !!careerPathData
          });
          await careerSession.save();
          console.log('  ✅ Migrated career data');
        }

        // Migrate student progress
        const existingProgress = await StudentProgress.findOne({ studentId: student._id.toString() });
        if (existingProgress) {
          // Update existing progress with session data
          existingProgress.currentSession = {
            sessionId: userSession.sessionId,
            currentPage: '/dashboard/student',
            lastActivity: new Date()
          };
          await existingProgress.save();
          console.log('  ✅ Updated student progress with session data');
        }

        // Add page data to user session
        const pageData = {
          student: student,
          progress: existingProgress,
          careerPath: careerPathData,
          careerOptions: careerOptions,
          assessmentResults: assessmentResponses || n8nResults,
          migratedAt: new Date()
        };

        userSession.sessionData.push({
          page: '/dashboard/student',
          data: pageData,
          timestamp: new Date()
        });
        await userSession.save();

        console.log(`  ✅ Completed migration for ${student.fullName}`);

      } catch (error) {
        console.error(`  ❌ Error migrating data for ${student.fullName}:`, error.message);
      }
    }

    console.log('\n🎉 Session data migration completed!');
    
    // Show summary
    const totalSessions = await UserSession.countDocuments();
    const totalAssessments = await AssessmentSession.countDocuments();
    const totalCareers = await CareerSession.countDocuments();
    
    console.log('\n📊 Migration Summary:');
    console.log(`  - User Sessions: ${totalSessions}`);
    console.log(`  - Assessment Sessions: ${totalAssessments}`);
    console.log(`  - Career Sessions: ${totalCareers}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

migrateSessionData();
