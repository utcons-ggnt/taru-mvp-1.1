'use client';

import { useCallback, useEffect, useState } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface CareerState {
  currentCareerPath: string;
  careerPaths: Array<{
    careerPath: string;
    description: string;
    details: any;
    selectedAt: Date;
  }>;
  explorationHistory: string[];
  selectedCareerDetails: any;
  isCompleted: boolean;
  completedAt?: Date;
}

export function useCareerState() {
  const [state, setState] = useState<CareerState>({
    currentCareerPath: '',
    careerPaths: [],
    explorationHistory: [],
    selectedCareerDetails: null,
    isCompleted: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const savedState = await clientSessionService.loadCareerProgress(userId, studentId);
      if (savedState) {
        setState(savedState);
      }
    } catch (error) {
      console.error('Error loading career state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveState = useCallback(async (newState: Partial<CareerState>) => {
    try {
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const updatedState = { ...state, ...newState };
      setState(updatedState);

      await clientSessionService.saveCareerProgress(userId, studentId, updatedState);
    } catch (error) {
      console.error('Error saving career state:', error);
    }
  }, [state]);

  const addCareerPath = useCallback(async (careerPath: string, description: string, details: any) => {
    const newCareerPath = {
      careerPath,
      description,
      details,
      selectedAt: new Date()
    };
    const updatedCareerPaths = [...state.careerPaths, newCareerPath];
    await saveState({ 
      careerPaths: updatedCareerPaths,
      currentCareerPath: careerPath
    });
  }, [state.careerPaths, saveState]);

  const selectCareerPath = useCallback(async (careerPath: string, details: any) => {
    await saveState({ 
      currentCareerPath: careerPath,
      selectedCareerDetails: details
    });
  }, [saveState]);

  const addToExplorationHistory = useCallback(async (path: string) => {
    const updatedHistory = [...state.explorationHistory, path];
    await saveState({ explorationHistory: updatedHistory });
  }, [state.explorationHistory, saveState]);

  const completeCareerSelection = useCallback(async () => {
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
    addCareerPath,
    selectCareerPath,
    addToExplorationHistory,
    completeCareerSelection
  };
}

export default useCareerState;
