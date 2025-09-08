'use client';

import { useCallback, useEffect, useState } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface ModuleState {
  moduleId: string;
  moduleTitle: string;
  currentSection: string;
  videoProgress: {
    videoUrl: string;
    currentTime: number;
    totalDuration: number;
    watchTime: number;
    isCompleted: boolean;
  };
  quizProgress: any[];
  interactiveProgress?: any;
  projectProgress?: any;
  peerLearningProgress?: any;
  totalTimeSpent: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export function useModuleState(moduleId: string, moduleTitle: string) {
  const [state, setState] = useState<ModuleState>({
    moduleId,
    moduleTitle,
    currentSection: 'video',
    videoProgress: {
      videoUrl: '',
      currentTime: 0,
      totalDuration: 0,
      watchTime: 0,
      isCompleted: false
    },
    quizProgress: [],
    totalTimeSpent: 0,
    isCompleted: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const savedState = await clientSessionService.loadModuleProgress(userId, studentId, moduleId);
      if (savedState) {
        setState(savedState);
      }
    } catch (error) {
      console.error('Error loading module state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [moduleId]);

  const saveState = useCallback(async (newState: Partial<ModuleState>) => {
    try {
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const updatedState = { ...state, ...newState };
      setState(updatedState);

      await clientSessionService.saveModuleProgress(userId, studentId, moduleId, updatedState);
    } catch (error) {
      console.error('Error saving module state:', error);
    }
  }, [state, moduleId]);

  const updateVideoProgress = useCallback(async (videoProgress: Partial<ModuleState['videoProgress']>) => {
    const updatedVideoProgress = { ...state.videoProgress, ...videoProgress };
    await saveState({ videoProgress: updatedVideoProgress });
  }, [state.videoProgress, saveState]);

  const addQuizAnswer = useCallback(async (quizAnswer: any) => {
    const newQuizProgress = [...state.quizProgress, quizAnswer];
    await saveState({ quizProgress: newQuizProgress });
  }, [state.quizProgress, saveState]);

  const updateCurrentSection = useCallback(async (section: string) => {
    await saveState({ currentSection: section });
  }, [saveState]);

  const updateTimeSpent = useCallback(async (timeSpent: number) => {
    await saveState({ totalTimeSpent: state.totalTimeSpent + timeSpent });
  }, [state.totalTimeSpent, saveState]);

  const completeModule = useCallback(async () => {
    await saveState({ 
      isCompleted: true,
      completedAt: new Date()
    });
  }, [saveState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  return {
    state,
    isLoading,
    loadState,
    saveState,
    updateVideoProgress,
    addQuizAnswer,
    updateCurrentSection,
    updateTimeSpent,
    completeModule
  };
}

export default useModuleState;
