'use client';

import React, { useEffect, useState } from 'react';
import { useModuleState } from '@/lib/hooks/useModuleState';
import { useNavigationWithState } from '@/lib/hooks/useNavigationWithState';

interface SessionAwareModuleProps {
  moduleId: string;
  moduleTitle: string;
  children: React.ReactNode;
}

export default function SessionAwareModule({ 
  moduleId, 
  moduleTitle, 
  children 
}: SessionAwareModuleProps) {
  const { 
    state: moduleState, 
    updateVideoProgress, 
    addQuizAnswer, 
    updateCurrentSection,
    updateTimeSpent,
    completeModule 
  } = useModuleState(moduleId, moduleTitle);
  
  const { navigateWithState, loadPageState, savePageState } = useNavigationWithState();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize module state on mount
  useEffect(() => {
    const initializeModule = async () => {
      try {
        // Load saved state
        const savedState = await loadPageState(window.location.pathname);
        if (savedState) {
          // Restore module state from saved data
          console.log('Restoring module state:', savedState);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Error initializing module:', error);
        setIsInitialized(true);
      }
    };

    initializeModule();
  }, [moduleId, loadPageState]);

  // Save state when module state changes
  useEffect(() => {
    if (isInitialized) {
      const saveState = async () => {
        try {
          await savePageState(window.location.pathname, {
            moduleState,
            moduleId,
            moduleTitle,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Error saving module state:', error);
        }
      };

      saveState();
    }
  }, [moduleState, isInitialized, moduleId, moduleTitle, savePageState]);

  // Navigation handlers with state preservation
  const handleNavigate = async (path: string, currentData?: any) => {
    await navigateWithState(path, {
      moduleState,
      currentData,
      moduleId,
      moduleTitle
    });
  };

  // Video progress handlers
  const handleVideoProgress = async (progress: any) => {
    await updateVideoProgress(progress);
  };

  // Quiz handlers
  const handleQuizAnswer = async (answer: any) => {
    await addQuizAnswer(answer);
  };

  // Section change handlers
  const handleSectionChange = async (section: string) => {
    await updateCurrentSection(section);
  };

  // Time tracking
  const handleTimeUpdate = async (timeSpent: number) => {
    await updateTimeSpent(timeSpent);
  };

  // Module completion
  const handleModuleComplete = async () => {
    await completeModule();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  // Pass session management functions to children via context or props
  const sessionProps = {
    moduleState,
    handleNavigate,
    handleVideoProgress,
    handleQuizAnswer,
    handleSectionChange,
    handleTimeUpdate,
    handleModuleComplete
  };

  return (
    <div className="session-aware-module">
      {React.cloneElement(children as React.ReactElement, sessionProps)}
    </div>
  );
}
