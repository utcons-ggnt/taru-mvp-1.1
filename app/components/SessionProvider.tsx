'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { clientSessionService } from '@/lib/ClientSessionService';

interface SessionContextType {
  savePageData: (data: any) => Promise<void>;
  loadPageData: () => Promise<any>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const savePageData = async (data: any) => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      await clientSessionService.savePageData(userId, pathname, data);
    } catch (error) {
      console.error('Error saving page data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPageData = async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      return await clientSessionService.loadPageData(userId, pathname);
    } catch (error) {
      console.error('Error loading page data:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save page data on unmount
  useEffect(() => {
    return () => {
      // This will be called when the component unmounts
      // We can't use async here, so we'll handle it in individual components
    };
  }, [pathname]);

  const value = {
    savePageData,
    loadPageData,
    isLoading
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export default SessionProvider;
