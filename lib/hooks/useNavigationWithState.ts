'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback, useRef, useEffect } from 'react';
import { clientSessionService } from '../ClientSessionService';

export interface NavigationOptions {
  preserveState?: boolean;
  saveCurrentState?: boolean;
  preserveScroll?: boolean;
  preserveFormState?: boolean;
  replace?: boolean;
  delay?: number;
}

export interface PageState {
  scrollPosition: { x: number; y: number };
  formData: Record<string, any>;
  timestamp: number;
  pageData?: any;
}

export function useNavigationWithState() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const scrollPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const formStates = useRef<Map<string, Record<string, any>>>(new Map());

  // Save scroll position
  const saveScrollPosition = useCallback((page: string) => {
    const scrollPos = {
      x: window.scrollX,
      y: window.scrollY
    };
    scrollPositions.current.set(page, scrollPos);
    
    // Also save to localStorage as backup
    try {
      localStorage.setItem(`scroll_${page}`, JSON.stringify(scrollPos));
    } catch (error) {
      console.error('Error saving scroll position to localStorage:', error);
    }
  }, []);

  // Restore scroll position
  const restoreScrollPosition = useCallback((page: string) => {
    // Try memory first
    const memoryPos = scrollPositions.current.get(page);
    if (memoryPos) {
      window.scrollTo(memoryPos.x, memoryPos.y);
      return;
    }

    // Fallback to localStorage
    try {
      const savedPos = localStorage.getItem(`scroll_${page}`);
      if (savedPos) {
        const pos = JSON.parse(savedPos);
        window.scrollTo(pos.x, pos.y);
      }
    } catch (error) {
      console.error('Error restoring scroll position from localStorage:', error);
    }
  }, []);

  // Save form state
  const saveFormState = useCallback((page: string, formData: Record<string, any>) => {
    formStates.current.set(page, formData);
    
    // Also save to localStorage as backup
    try {
      localStorage.setItem(`form_${page}`, JSON.stringify(formData));
    } catch (error) {
      console.error('Error saving form state to localStorage:', error);
    }
  }, []);

  // Restore form state
  const restoreFormState = useCallback((page: string) => {
    // Try memory first
    const memoryForm = formStates.current.get(page);
    if (memoryForm) {
      return memoryForm;
    }

    // Fallback to localStorage
    try {
      const savedForm = localStorage.getItem(`form_${page}`);
      if (savedForm) {
        return JSON.parse(savedForm);
      }
    } catch (error) {
      console.error('Error restoring form state from localStorage:', error);
    }

    return null;
  }, []);

  // Enhanced navigation with state preservation
  const navigateWithState = useCallback(async (
    path: string, 
    currentPageData?: any,
    options: NavigationOptions = {}
  ) => {
    const {
      preserveState = true,
      saveCurrentState = true,
      preserveScroll = true,
      preserveFormState = true,
      replace = false,
      delay = 0
    } = options;

    try {
      setIsLoading(true);

      // Get current user ID from localStorage or context
      const userId = localStorage.getItem('userId');
      const currentPage = window.location.pathname;

      // Save current page state
      if (saveCurrentState) {
        // Save scroll position
        if (preserveScroll) {
          saveScrollPosition(currentPage);
        }

        // Save form state
        if (preserveFormState) {
          const formData = extractFormData();
          if (formData && Object.keys(formData).length > 0) {
            saveFormState(currentPage, formData);
          }
        }

        // Save page data to server
        if (userId && currentPageData) {
          const pageState: PageState = {
            scrollPosition: preserveScroll ? { x: window.scrollX, y: window.scrollY } : { x: 0, y: 0 },
            formData: preserveFormState ? extractFormData() : {},
            timestamp: Date.now(),
            pageData: currentPageData
          };

          await clientSessionService.savePageData(userId, currentPage, pageState);
        }
      }

      // Update navigation history
      if (preserveState && userId) {
        await clientSessionService.updateNavigationHistory(userId, path);
      }

      // Add delay if specified
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
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
  }, [router, saveScrollPosition, saveFormState]);

  // Extract form data from all forms on the page
  const extractFormData = useCallback(() => {
    const formData: Record<string, any> = {};
    
    try {
      const forms = document.querySelectorAll('form');
      forms.forEach((form, formIndex) => {
        const formName = form.name || `form_${formIndex}`;
        formData[formName] = {};
        
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input: any) => {
          if (input.name) {
            if (input.type === 'checkbox' || input.type === 'radio') {
              if (input.checked) {
                formData[formName][input.name] = input.value;
              }
            } else {
              formData[formName][input.name] = input.value;
            }
          }
        });
      });
    } catch (error) {
      console.error('Error extracting form data:', error);
    }
    
    return formData;
  }, []);

  // Restore form data to forms
  const restoreFormData = useCallback((formData: Record<string, any>) => {
    try {
      Object.entries(formData).forEach(([formName, fields]) => {
        const form = document.querySelector(`form[name="${formName}"]`) || 
                    document.querySelector(`form:nth-of-type(${parseInt(formName.split('_')[1]) + 1})`);
        
        if (form) {
          Object.entries(fields).forEach(([fieldName, value]) => {
            const input = form.querySelector(`[name="${fieldName}"]`) as any;
            if (input) {
              if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = input.value === value;
              } else {
                input.value = value;
                // Trigger change event
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });
        }
      });
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
  }, []);

  const loadPageState = useCallback(async (page: string) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return null;

      const pageState = await clientSessionService.loadPageData(userId, page);
      
      // Restore scroll position
      if (pageState?.scrollPosition) {
        window.scrollTo(pageState.scrollPosition.x, pageState.scrollPosition.y);
      } else {
        restoreScrollPosition(page);
      }

      // Restore form state
      if (pageState?.formData) {
        restoreFormData(pageState.formData);
      } else {
        const formState = restoreFormState(page);
        if (formState) {
          restoreFormData(formState);
        }
      }

      return pageState;
    } catch (error) {
      console.error('Error loading page state:', error);
      return null;
    }
  }, [restoreScrollPosition, restoreFormState, restoreFormData]);

  const savePageState = useCallback(async (page: string, data: any) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const pageState: PageState = {
        scrollPosition: { x: window.scrollX, y: window.scrollY },
        formData: extractFormData(),
        timestamp: Date.now(),
        pageData: data
      };

      await clientSessionService.savePageData(userId, page, pageState);
    } catch (error) {
      console.error('Error saving page state:', error);
    }
  }, [extractFormData]);

  // Auto-restore state when component mounts
  useEffect(() => {
    const currentPage = window.location.pathname;
    const timer = setTimeout(() => {
      restoreScrollPosition(currentPage);
      const formState = restoreFormState(currentPage);
      if (formState) {
        restoreFormData(formState);
      }
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [restoreScrollPosition, restoreFormState, restoreFormData]);

  return {
    navigateWithState,
    loadPageState,
    savePageState,
    saveScrollPosition,
    restoreScrollPosition,
    saveFormState,
    restoreFormState,
    extractFormData,
    restoreFormData,
    isLoading
  };
}

export default useNavigationWithState;