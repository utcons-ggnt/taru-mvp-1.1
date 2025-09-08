'use client';

export interface IClientSessionService {
  savePageData(userId: string, page: string, data: any, metadata?: any): Promise<void>;
  loadPageData(userId: string, page: string): Promise<any>;
  saveAssessmentProgress(userId: string, studentId: string, assessmentType: string, progress: any): Promise<void>;
  loadAssessmentProgress(userId: string, studentId: string, assessmentType: string): Promise<any>;
  saveModuleProgress(userId: string, studentId: string, moduleId: string, progress: any): Promise<void>;
  loadModuleProgress(userId: string, studentId: string, moduleId: string): Promise<any>;
  saveCareerProgress(userId: string, studentId: string, careerData: any): Promise<void>;
  loadCareerProgress(userId: string, studentId: string): Promise<any>;
  createSession(userId: string, studentId?: string): Promise<string>;
  clearSession(userId: string): Promise<void>;
  loadStudentData(userId: string): Promise<any>;
  loadStudentProgress(studentId: string): Promise<any>;
  loadCareerPathData(uniqueId: string): Promise<any>;
  loadAssessmentResults(uniqueId: string): Promise<any>;
  getActiveSession(userId: string): Promise<any>;
  migrateExistingData(userId: string, studentId: string): Promise<void>;
  saveStudentProgress(studentId: string, progressData: any): Promise<void>;
  updateNavigationHistory(userId: string, page: string): Promise<void>;
}

class ClientSessionService implements IClientSessionService {
  private async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`/api/session/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async savePageData(userId: string, page: string, data: any, metadata?: any): Promise<void> {
    await this.makeRequest('save-page-data', { userId, page, data, metadata });
  }

  async loadPageData(userId: string, page: string): Promise<any> {
    const result = await this.makeRequest('load-page-data', { userId, page });
    return result.data;
  }

  async saveAssessmentProgress(userId: string, studentId: string, assessmentType: string, progress: any): Promise<void> {
    await this.makeRequest('save-assessment-progress', { userId, studentId, assessmentType, progress });
  }

  async loadAssessmentProgress(userId: string, studentId: string, assessmentType: string): Promise<any> {
    const result = await this.makeRequest('load-assessment-progress', { userId, studentId, assessmentType });
    return result.data;
  }

  async saveModuleProgress(userId: string, studentId: string, moduleId: string, progress: any): Promise<void> {
    await this.makeRequest('save-module-progress', { userId, studentId, moduleId, progress });
  }

  async loadModuleProgress(userId: string, studentId: string, moduleId: string): Promise<any> {
    const result = await this.makeRequest('load-module-progress', { userId, studentId, moduleId });
    return result.data;
  }

  async saveCareerProgress(userId: string, studentId: string, careerData: any): Promise<void> {
    await this.makeRequest('save-career-progress', { userId, studentId, careerData });
  }

  async loadCareerProgress(userId: string, studentId: string): Promise<any> {
    const result = await this.makeRequest('load-career-progress', { userId, studentId });
    return result.data;
  }

  async createSession(userId: string, studentId?: string): Promise<string> {
    const result = await this.makeRequest('create', { userId, studentId });
    return result.sessionId;
  }

  async clearSession(userId: string): Promise<void> {
    await this.makeRequest('clear', { userId });
  }

  async loadStudentData(userId: string): Promise<any> {
    const result = await this.makeRequest('load-student-data', { userId });
    return result.data;
  }

  async loadStudentProgress(studentId: string): Promise<any> {
    const result = await this.makeRequest('load-student-progress', { studentId });
    return result.data;
  }

  async loadCareerPathData(uniqueId: string): Promise<any> {
    const result = await this.makeRequest('load-career-path-data', { uniqueId });
    return result.data;
  }

  async loadAssessmentResults(uniqueId: string): Promise<any> {
    const result = await this.makeRequest('load-assessment-results', { uniqueId });
    return result.data;
  }

  async getActiveSession(userId: string): Promise<any> {
    const result = await this.makeRequest('get-active-session', { userId });
    return result.data;
  }

  async migrateExistingData(userId: string, studentId: string): Promise<void> {
    await this.makeRequest('migrate-existing-data', { userId, studentId });
  }

  async saveStudentProgress(studentId: string, progressData: any): Promise<void> {
    await this.makeRequest('save-student-progress', { studentId, progressData });
  }

  async updateNavigationHistory(userId: string, page: string): Promise<void> {
    await this.makeRequest('update-navigation-history', { userId, page });
  }
}

export const clientSessionService = new ClientSessionService();
export default clientSessionService;
