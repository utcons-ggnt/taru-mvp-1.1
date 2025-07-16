import { DataSyncEvents } from './dataSync';

// Data type interfaces
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  profile?: Record<string, unknown>;
}

interface ProgressData {
  moduleId: string;
  progress: number;
  completed: boolean;
  lastUpdated: Date;
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  content: Record<string, unknown>;
}

interface AssessmentData {
  id: string;
  score: number;
  completed: boolean;
  answers: Record<string, unknown>;
}

interface DashboardData {
  overview: Record<string, unknown>;
  recentActivity: Array<Record<string, unknown>>;
  progress: Record<string, unknown>;
}

interface LearningPathData {
  id: string;
  modules: string[];
  progress: number;
}

interface StudentProgressData {
  studentId: string;
  moduleProgress: Array<Record<string, unknown>>;
  totalPoints: number;
}

interface ParentDashboardData {
  parentId: string;
  children: Array<Record<string, unknown>>;
  overview: Record<string, unknown>;
}

interface TeacherDashboardData {
  teacherId: string;
  students: Array<Record<string, unknown>>;
  classes: Array<Record<string, unknown>>;
}

interface AdminDashboardData {
  adminId: string;
  users: Array<Record<string, unknown>>;
  statistics: Record<string, unknown>;
}

interface SyncUpdate {
  eventType: DataSyncEvents;
  data: UserData | ProgressData | ModuleData | AssessmentData | DashboardData | LearningPathData | StudentProgressData | ParentDashboardData | TeacherDashboardData | AdminDashboardData | Record<string, unknown>;
  userId?: string;
  source?: string;
}

// Server-side data synchronization utility
export class APIDataSync {
  private static instance: APIDataSync;
  private dataSync: { 
    updateData: (eventType: DataSyncEvents, data: Record<string, unknown>, userId?: string, source?: string) => void; 
    clearCache: (eventType: DataSyncEvents, userId?: string) => void; 
    getStats: () => Record<string, unknown> 
  } | null = null;

  private constructor() {}

  static getInstance(): APIDataSync {
    if (!APIDataSync.instance) {
      APIDataSync.instance = new APIDataSync();
    }
    return APIDataSync.instance;
  }

  // Initialize data sync (only in server environment)
  private async initDataSync() {
    if (typeof window === 'undefined' && !this.dataSync) {
      try {
        const { default: dataSync } = await import('./dataSync');
        this.dataSync = dataSync;
      } catch (error) {
        console.error('Failed to initialize data sync:', error);
      }
    }
  }

  // Update data and notify all listeners
  async updateData(eventType: DataSyncEvents, data: unknown, userId?: string, source: string = 'api') {
    await this.initDataSync();
    
    if (this.dataSync) {
      this.dataSync.updateData(eventType, data as Record<string, unknown>, userId, source);
    }
  }

  // Update multiple data types at once
  async updateMultiple(updates: SyncUpdate[]) {
    await this.initDataSync();
    
    if (this.dataSync) {
      for (const update of updates) {
        this.dataSync.updateData(
          update.eventType,
          update.data as Record<string, unknown>,
          update.userId,
          update.source || 'api'
        );
      }
    }
  }

  // Update user data
  async updateUser(userData: UserData, userId: string) {
    await this.updateData(DataSyncEvents.USER_UPDATED, userData as unknown as Record<string, unknown>, userId);
  }

  // Update progress data
  async updateProgress(progressData: ProgressData, userId: string) {
    await this.updateData(DataSyncEvents.PROGRESS_UPDATED, progressData as unknown as Record<string, unknown>, userId);
  }

  // Update module data
  async updateModule(moduleData: ModuleData, moduleId: string) {
    await this.updateData(DataSyncEvents.MODULE_UPDATED, moduleData as unknown as Record<string, unknown>, moduleId);
  }

  // Update assessment data
  async updateAssessment(assessmentData: AssessmentData, userId: string) {
    await this.updateData(DataSyncEvents.ASSESSMENT_UPDATED, assessmentData as unknown as Record<string, unknown>, userId);
  }

  // Update dashboard data
  async updateDashboard(dashboardData: DashboardData, userId: string) {
    await this.updateData(DataSyncEvents.DASHBOARD_UPDATED, dashboardData as unknown as Record<string, unknown>, userId);
  }

  // Update learning path data
  async updateLearningPath(learningPathData: LearningPathData, pathId?: string) {
    await this.updateData(DataSyncEvents.LEARNING_PATH_UPDATED, learningPathData as unknown as Record<string, unknown>, pathId);
  }

  // Update student progress data
  async updateStudentProgress(studentProgressData: StudentProgressData, userId: string) {
    await this.updateData(DataSyncEvents.STUDENT_PROGRESS_UPDATED, studentProgressData as unknown as Record<string, unknown>, userId);
  }

  // Update parent dashboard data
  async updateParentDashboard(parentDashboardData: ParentDashboardData, parentId: string) {
    await this.updateData(DataSyncEvents.PARENT_DASHBOARD_UPDATED, parentDashboardData as unknown as Record<string, unknown>, parentId);
  }

  // Update teacher dashboard data
  async updateTeacherDashboard(teacherDashboardData: TeacherDashboardData, teacherId: string) {
    await this.updateData(DataSyncEvents.TEACHER_DASHBOARD_UPDATED, teacherDashboardData as unknown as Record<string, unknown>, teacherId);
  }

  // Update admin dashboard data
  async updateAdminDashboard(adminDashboardData: AdminDashboardData, adminId: string) {
    await this.updateData(DataSyncEvents.ADMIN_DASHBOARD_UPDATED, adminDashboardData as unknown as Record<string, unknown>, adminId);
  }

  // Clear cache for specific data type
  async clearCache(eventType: DataSyncEvents, userId?: string) {
    await this.initDataSync();
    
    if (this.dataSync) {
      this.dataSync.clearCache(eventType, userId);
    }
  }

  // Get sync statistics
  async getStats() {
    await this.initDataSync();
    
    if (this.dataSync) {
      return this.dataSync.getStats();
    }
    
    return {
      cacheSize: 0,
      pendingUpdates: 0,
      queueLength: 0,
      isProcessing: false
    };
  }
}

// Export singleton instance
export const apiDataSync = APIDataSync.getInstance();

// Helper function for API routes
export async function syncDataInAPI(
  eventType: DataSyncEvents,
  data: Record<string, unknown>,
  userId?: string,
  source: string = 'api'
) {
  try {
    await apiDataSync.updateData(eventType, data, userId, source);
  } catch (error) {
    console.error('Error syncing data in API:', error);
  }
}

// Helper function for multiple updates
export async function syncMultipleDataInAPI(updates: SyncUpdate[]) {
  try {
    await apiDataSync.updateMultiple(updates);
  } catch (error) {
    console.error('Error syncing multiple data in API:', error);
  }
} 