'use client';

import { useCallback, useEffect, useState } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface AssessmentState {
  currentQuestion: number;
  totalQuestions: number;
  progress: number;
  answers: any[];
  isCompleted: boolean;
  result?: any;
  n8nResults?: any;
  completedAt?: Date;
}

export function useAssessmentState(assessmentType: 'diagnostic' | 'interest' | 'skill') {
  const [state, setState] = useState<AssessmentState>({
    currentQuestion: 1,
    totalQuestions: 0,
    progress: 0,
    answers: [],
    isCompleted: false
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadState = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const savedState = await clientSessionService.loadAssessmentProgress(userId, studentId, assessmentType);
      if (savedState) {
        setState(savedState);
      }
    } catch (error) {
      console.error('Error loading assessment state:', error);
    } finally {
      setIsLoading(false);
    }
  }, [assessmentType]);

  const saveState = useCallback(async (newState: Partial<AssessmentState>) => {
    try {
      const userId = localStorage.getItem('userId');
      const studentId = localStorage.getItem('studentId');
      
      if (!userId || !studentId) return;

      const updatedState = { ...state, ...newState };
      setState(updatedState);

      await clientSessionService.saveAssessmentProgress(userId, studentId, assessmentType, updatedState);
    } catch (error) {
      console.error('Error saving assessment state:', error);
    }
  }, [state, assessmentType]);

  const addAnswer = useCallback(async (answer: any) => {
    const newAnswers = [...state.answers, answer];
    await saveState({ answers: newAnswers });
  }, [state.answers, saveState]);

  const updateProgress = useCallback(async (currentQuestion: number, totalQuestions: number) => {
    const progress = Math.round((currentQuestion / totalQuestions) * 100);
    await saveState({ 
      currentQuestion, 
      totalQuestions, 
      progress 
    });
  }, [saveState]);

  const completeAssessment = useCallback(async (result: any, n8nResults?: any) => {
    await saveState({ 
      isCompleted: true, 
      result, 
      n8nResults,
      completedAt: new Date()
    });
  }, [saveState]);

  const resetAssessment = useCallback(async () => {
    const resetState = {
      currentQuestion: 1,
      totalQuestions: 0,
      progress: 0,
      answers: [],
      isCompleted: false,
      result: undefined,
      n8nResults: undefined
    };
    setState(resetState);
    await saveState(resetState);
  }, [saveState]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  return {
    state,
    isLoading,
    loadState,
    saveState,
    addAnswer,
    updateProgress,
    completeAssessment,
    resetAssessment
  };
}

export default useAssessmentState;
