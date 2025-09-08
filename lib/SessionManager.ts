import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import connectDB from './mongodb';
import UserSession from '@/models/UserSession';
import AssessmentSession from '@/models/AssessmentSession';
import ModuleSession from '@/models/ModuleSession';
import CareerSession from '@/models/CareerSession';
import Student from '@/models/Student';
import StudentProgress from '@/models/StudentProgress';
import Module from '@/models/Module';

export interface ISessionManager {
  savePageData(userId: string, page: string, data: any, metadata?: any): Promise<void>;
  loadPageData(userId: string, page: string): Promise<any>;
  saveAssessmentProgress(userId: string, studentId: string, assessmentType: string, progress: any): Promise<void>;
  loadAssessmentProgress(userId: string, studentId: string, assessmentType: string): Promise<any>;
  saveModuleProgress(userId: string, studentId: string, moduleId: string, progress: any): Promise<void>;
  loadModuleProgress(userId: string, studentId: string, moduleId: string): Promise<any>;
  saveCareerProgress(userId: string, studentId: string, careerData: any): Promise<void>;
  loadCareerProgress(userId: string, studentId: string): Promise<any>;
  getActiveSession(userId: string): Promise<any>;
  createSession(userId: string, studentId?: string): Promise<string>;
  updateNavigationHistory(userId: string, page: string): Promise<void>;
  clearSession(userId: string): Promise<void>;
  
  // Enhanced methods for existing data
  loadStudentData(userId: string): Promise<any>;
  loadStudentProgress(studentId: string): Promise<any>;
  loadModuleData(moduleId: string): Promise<any>;
  loadCareerPathData(uniqueId: string): Promise<any>;
  loadAssessmentResults(uniqueId: string): Promise<any>;
  saveStudentProgress(studentId: string, progressData: any): Promise<void>;
  migrateExistingData(userId: string, studentId: string): Promise<void>;
}

class SessionManager implements ISessionManager {
  private async getOrCreateUserSession(userId: string, studentId?: string): Promise<string> {
    await connectDB();
    
    // Try to find active session
    let session = await UserSession.findOne({ 
      userId, 
      isActive: true 
    }).sort({ lastActivity: -1 });

    if (!session) {
      // Create new session
      const sessionId = randomUUID();
      session = new UserSession({
        userId,
        studentId,
        sessionId,
        currentPage: '',
        navigationHistory: [],
        sessionData: [],
        isActive: true
      });
      await session.save();
    }

    return session.sessionId;
  }

  async savePageData(userId: string, page: string, data: any, metadata?: any): Promise<void> {
    await connectDB();
    
    const sessionId = await this.getOrCreateUserSession(userId);
    
    await UserSession.findOneAndUpdate(
      { sessionId },
      {
        $set: { 
          currentPage: page,
          lastActivity: new Date()
        },
        $push: { 
          sessionData: {
            page,
            data,
            timestamp: new Date(),
            metadata
          }
        }
      }
    );
  }

  async loadPageData(userId: string, page: string): Promise<any> {
    await connectDB();
    
    const session = await UserSession.findOne({ 
      userId, 
      isActive: true 
    }).sort({ lastActivity: -1 });

    if (!session) return null;

    const pageData = session.sessionData
      .filter((sd: any) => sd.page === page)
      .sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return pageData?.data || null;
  }

  async saveAssessmentProgress(userId: string, studentId: string, assessmentType: string, progress: any): Promise<void> {
    await connectDB();
    
    const sessionId = await this.getOrCreateUserSession(userId, studentId);
    
    await AssessmentSession.findOneAndUpdate(
      { userId, studentId, assessmentType, sessionId },
      {
        $set: {
          ...progress,
          lastActivity: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  async loadAssessmentProgress(userId: string, studentId: string, assessmentType: string): Promise<any> {
    await connectDB();
    
    const session = await AssessmentSession.findOne({ 
      userId, 
      studentId, 
      assessmentType 
    }).sort({ lastActivity: -1 });

    return session || null;
  }

  async saveModuleProgress(userId: string, studentId: string, moduleId: string, progress: any): Promise<void> {
    await connectDB();
    
    const sessionId = await this.getOrCreateUserSession(userId, studentId);
    
    await ModuleSession.findOneAndUpdate(
      { userId, studentId, moduleId, sessionId },
      {
        $set: {
          ...progress,
          lastActivity: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  async loadModuleProgress(userId: string, studentId: string, moduleId: string): Promise<any> {
    await connectDB();
    
    const session = await ModuleSession.findOne({ 
      userId, 
      studentId, 
      moduleId 
    }).sort({ lastActivity: -1 });

    return session || null;
  }

  async saveCareerProgress(userId: string, studentId: string, careerData: any): Promise<void> {
    await connectDB();
    
    const sessionId = await this.getOrCreateUserSession(userId, studentId);
    
    await CareerSession.findOneAndUpdate(
      { userId, studentId, sessionId },
      {
        $set: {
          ...careerData,
          lastActivity: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  async loadCareerProgress(userId: string, studentId: string): Promise<any> {
    await connectDB();
    
    const session = await CareerSession.findOne({ 
      userId, 
      studentId 
    }).sort({ lastActivity: -1 });

    return session || null;
  }

  async getActiveSession(userId: string): Promise<any> {
    await connectDB();
    
    const session = await UserSession.findOne({ 
      userId, 
      isActive: true 
    }).sort({ lastActivity: -1 });

    return session || null;
  }

  async createSession(userId: string, studentId?: string): Promise<string> {
    await connectDB();
    
    // Deactivate existing sessions
    await UserSession.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    const sessionId = randomUUID();
    const session = new UserSession({
      userId,
      studentId,
      sessionId,
      currentPage: '',
      navigationHistory: [],
      sessionData: [],
      isActive: true
    });

    await session.save();
    return sessionId;
  }

  async updateNavigationHistory(userId: string, page: string): Promise<void> {
    await connectDB();
    
    const session = await UserSession.findOne({ 
      userId, 
      isActive: true 
    }).sort({ lastActivity: -1 });

    if (session) {
      const history = session.navigationHistory || [];
      if (!history.includes(page)) {
        history.push(page);
      }
      
      await UserSession.findByIdAndUpdate(session._id, {
        $set: {
          currentPage: page,
          navigationHistory: history,
          lastActivity: new Date()
        }
      });
    }
  }

  async clearSession(userId: string): Promise<void> {
    await connectDB();
    
    await UserSession.updateMany(
      { userId },
      { isActive: false }
    );
  }

  // Enhanced methods for existing data
  async loadStudentData(userId: string): Promise<any> {
    await connectDB();
    
    const student = await Student.findOne({ userId });
    return student;
  }

  async loadStudentProgress(studentId: string): Promise<any> {
    await connectDB();
    
    const progress = await StudentProgress.findOne({ studentId });
    return progress;
  }

  async loadModuleData(moduleId: string): Promise<any> {
    await connectDB();
    
    const module = await Module.findOne({ _id: moduleId });
    return module;
  }

  async loadCareerPathData(uniqueId: string): Promise<any> {
    await connectDB();
    
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    
    // Check learning-path-student collection
    const careerPath = await mongoose.connection.db.collection('learning-path-student').findOne({ uniqueid: uniqueId });
    if (careerPath) return careerPath;

    // Check Career-Option-Generation collection
    const careerOptions = await mongoose.connection.db.collection('Career-Option-Generation').findOne({ uniqueId });
    if (careerOptions) return careerOptions;

    return null;
  }

  async loadAssessmentResults(uniqueId: string): Promise<any> {
    await connectDB();
    
    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }
    
    // Check Learning-path-responses collection
    const assessmentResult = await mongoose.connection.db.collection('Learning-path-responses').findOne({ uniqueid: uniqueId });
    if (assessmentResult) return assessmentResult;

    // Check n8nresults collection
    const n8nResult = await mongoose.connection.db.collection('n8nresults').findOne({ uniqueId });
    if (n8nResult) return n8nResult;

    return null;
  }

  async saveStudentProgress(studentId: string, progressData: any): Promise<void> {
    await connectDB();
    
    await StudentProgress.findOneAndUpdate(
      { studentId },
      {
        $set: {
          ...progressData,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }

  async migrateExistingData(userId: string, studentId: string): Promise<void> {
    await connectDB();
    
    try {
      // Load student data
      const student = await this.loadStudentData(userId);
      if (!student) return;

      // Load existing progress
      const existingProgress = await this.loadStudentProgress(studentId);
      
      // Load career path data
      const careerPathData = await this.loadCareerPathData(student.uniqueId);
      
      // Load assessment results
      const assessmentResults = await this.loadAssessmentResults(student.uniqueId);

      // Create comprehensive session data
      const sessionData = {
        student: student,
        progress: existingProgress,
        careerPath: careerPathData,
        assessmentResults: assessmentResults,
        migratedAt: new Date()
      };

      // Save to session
      await this.savePageData(userId, 'migration', sessionData);

      console.log('✅ Successfully migrated existing data for user:', userId);
    } catch (error) {
      console.error('❌ Error migrating existing data:', error);
    }
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
