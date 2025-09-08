'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface NavigationOptions {
  preserveState?: boolean;
  saveCurrentState?: boolean;
  replace?: boolean;
}

export function useNavigationWithState() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithState = useCallback(async (
    path: string, 
    currentPageData?: any,
    options: NavigationOptions = {}
  ) => {
    const {
      preserveState = true,
      saveCurrentState = true,
      replace = false
    } = options;

    try {
      setIsLoading(true);

      // Get current user ID from localStorage or context
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found, navigating without state preservation');
        if (replace) {
          router.replace(path);
        } else {
          router.push(path);
        }
        return;
      }

      // Save current page state if requested
      if (saveCurrentState && currentPageData) {
        const currentPage = window.location.pathname;
        await clientSessionService.savePageData(userId, currentPage, currentPageData);
      }

      // Update navigation history
      if (preserveState) {
        await clientSessionService.updateNavigationHistory(userId, path);
      }

      // Navigate to new page
      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    } catch (error) {
      console.error('Error navigating with state:', error);
      // Fallback to normal navigation
      if (replace) {
        router.replace(path);
      } else {
        router.push(path);
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const loadPageState = useCallback(async (page: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      return await clientSessionService.loadPageData(userId, page);
    } catch (error) {
      console.error('Error loading page state:', error);
      return null;
    }
  }, []);

  const savePageState = useCallback(async (page: string, data: any) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      await clientSessionService.savePageData(userId, page, data);
    } catch (error) {
      console.error('Error saving page state:', error);
    }
  }, []);

  return {
    navigateWithState,
    loadPageState,
    savePageState,
    isLoading
  };
}

export default useNavigationWithState;
