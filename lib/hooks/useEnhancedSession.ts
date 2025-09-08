'use client';

import { useCallback, useEffect, useState } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface EnhancedSessionData {
  student?: any;
  progress?: any;
  careerPath?: any;
  assessmentResults?: any;
  modules?: any[];
  currentPage?: string;
  navigationHistory?: string[];
}

export function useEnhancedSession() {
  const [sessionData, setSessionData] = useState<EnhancedSessionData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId) return;

      // Load student data
      const student = await clientSessionService.loadStudentData(userId);
      
      // Load student progress
      const progress = studentId ? await clientSessionService.loadStudentProgress(studentId) : null;
      
      // Load career path data
      const careerPath = student?.uniqueId ? await clientSessionService.loadCareerPathData(student.uniqueId) : null;
      
      // Load assessment results
      const assessmentResults = student?.uniqueId ? await clientSessionService.loadAssessmentResults(student.uniqueId) : null;

      // Load active session
      const activeSession = await clientSessionService.getActiveSession(userId);

      const enhancedData: EnhancedSessionData = {
        student,
        progress,
        careerPath,
        assessmentResults,
        currentPage: activeSession?.currentPage,
        navigationHistory: activeSession?.navigationHistory || []
      };

      setSessionData(enhancedData);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading enhanced session data:', error);
      setIsInitialized(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePageData = useCallback(async (page: string, data: any) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      await clientSessionService.savePageData(userId, page, data);
      
      // Update local state
      setSessionData(prev => ({
        ...prev,
        [page]: data
      }));
    } catch (error) {
      console.error('Error saving page data:', error);
    }
  }, []);

  const loadPageData = useCallback(async (page: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      return await clientSessionService.loadPageData(userId, page);
    } catch (error) {
      console.error('Error loading page data:', error);
      return null;
    }
  }, []);

  const migrateExistingData = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      await clientSessionService.migrateExistingData(userId, studentId);
      
      // Reload all data after migration
      await loadAllData();
    } catch (error) {
      console.error('Error migrating existing data:', error);
    }
  }, [loadAllData]);

  const updateStudentProgress = useCallback(async (progressData: any) => {
    try {
      const studentId = localStorage.getItem('studentId');
      if (!studentId) return;

      await clientSessionService.saveStudentProgress(studentId, progressData);
      
      // Update local state
      setSessionData(prev => ({
        ...prev,
        progress: { ...prev.progress, ...progressData }
      }));
    } catch (error) {
      console.error('Error updating student progress:', error);
    }
  }, []);

  const getCareerPathData = useCallback(() => {
    return sessionData.careerPath?.output || null;
  }, [sessionData.careerPath]);

  const getAssessmentResults = useCallback(() => {
    return sessionData.assessmentResults?.Result || sessionData.assessmentResults?.processedData || null;
  }, [sessionData.assessmentResults]);

  const getStudentProgress = useCallback(() => {
    return sessionData.progress || null;
  }, [sessionData.progress]);

  const getStudentData = useCallback(() => {
    return sessionData.student || null;
  }, [sessionData.student]);

  // Initialize on mount
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    sessionData,
    isLoading,
    isInitialized,
    loadAllData,
    savePageData,
    loadPageData,
    migrateExistingData,
    updateStudentProgress,
    getCareerPathData,
    getAssessmentResults,
    getStudentProgress,
    getStudentData
  };
}

export default useEnhancedSession;
