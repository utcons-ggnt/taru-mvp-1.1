'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '@/app/components/SessionProvider';
import { PersistenceManager, PersistenceOptions } from '@/lib/utils/persistenceUtils';

export interface DataPersistenceOptions extends Omit<PersistenceOptions, 'key'> {
  autoRestore?: boolean;
  preserveScroll?: boolean;
  preserveForm?: boolean;
  debounceMs?: number;
}

export function useDataPersistence(
  key: string, 
  initialData: any = null,
  options: DataPersistenceOptions = {}
) {
  const {
    autoRestore = true,
    preserveScroll = true,
    preserveForm = true,
    debounceMs = 1000,
    ...persistenceOptions
  } = options;

  const { savePageData, loadPageData, isOnline, hasUnsavedChanges } = useSession();
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const manager = useRef<PersistenceManager | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  // Initialize persistence manager
  useEffect(() => {
    manager.current = PersistenceManager.getInstance(key, {
      autoSave: true,
      autoSaveInterval: 30000,
      onSave: (savedData) => {
        setLastSaved(new Date());
        setIsSaving(false);
      },
      onLoad: (loadedData) => {
        setData(loadedData);
        setIsLoading(false);
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
        setIsSaving(false);
      },
      ...persistenceOptions
    });

    return () => {
      manager.current?.stopAutoSave();
    };
  }, [key, persistenceOptions]);

  // Auto-restore data on mount
  useEffect(() => {
    if (autoRestore && !isInitialized.current) {
      setIsLoading(true);
      manager.current?.load().then((loadedData) => {
        if (loadedData) {
          setData(loadedData);
          
          // Restore scroll position if enabled
          if (preserveScroll && loadedData.scrollPosition) {
            setTimeout(() => {
              window.scrollTo(loadedData.scrollPosition.x, loadedData.scrollPosition.y);
            }, 100);
          }
          
          // Restore form data if enabled
          if (preserveForm && loadedData.formData) {
            setTimeout(() => {
              restoreFormData(loadedData.formData);
            }, 100);
          }
        }
        setIsLoading(false);
        isInitialized.current = true;
      });
    }
  }, [autoRestore, preserveScroll, preserveForm]);

  // Debounced save function
  const debouncedSave = useCallback((newData: any) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      setIsSaving(true);
      setError(null);
      
      try {
        const dataToSave = {
          ...newData,
          scrollPosition: preserveScroll ? { x: window.scrollX, y: window.scrollY } : undefined,
          formData: preserveForm ? extractFormData() : undefined,
          timestamp: Date.now()
        };

        await manager.current?.save(dataToSave);
      } catch (err) {
        setError(err as Error);
      }
    }, debounceMs);
  }, [debounceMs, preserveScroll, preserveForm]);

  // Update data and trigger save
  const updateData = useCallback((newData: any, immediate = false) => {
    setData(newData);
    
    if (immediate) {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      setIsSaving(true);
      manager.current?.save(newData, true);
    } else {
      debouncedSave(newData);
    }
  }, [debouncedSave]);

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
              }
              input.dispatchEvent(new Event('change', { bubbles: true }));
            }
          });
        }
      });
    } catch (error) {
      console.error('Error restoring form data:', error);
    }
  }, []);

  // Save current state
  const save = useCallback(async (immediate = false) => {
    setIsSaving(true);
    setError(null);
    
    try {
      const dataToSave = {
        ...data,
        scrollPosition: preserveScroll ? { x: window.scrollX, y: window.scrollY } : undefined,
        formData: preserveForm ? extractFormData() : undefined,
        timestamp: Date.now()
      };

      await manager.current?.save(dataToSave, immediate);
      setLastSaved(new Date());
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSaving(false);
    }
  }, [data, preserveScroll, preserveForm, extractFormData]);

  // Load data
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedData = await manager.current?.load();
      if (loadedData) {
        setData(loadedData);
        
        // Restore scroll position
        if (preserveScroll && loadedData.scrollPosition) {
          setTimeout(() => {
            window.scrollTo(loadedData.scrollPosition.x, loadedData.scrollPosition.y);
          }, 100);
        }
        
        // Restore form data
        if (preserveForm && loadedData.formData) {
          setTimeout(() => {
            restoreFormData(loadedData.formData);
          }, 100);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [preserveScroll, preserveForm, restoreFormData]);

  // Clear data
  const clear = useCallback(() => {
    setData(initialData);
    manager.current?.clear();
    setLastSaved(null);
    setError(null);
  }, [initialData]);

  // Auto-save on form changes
  useEffect(() => {
    if (preserveForm && isInitialized.current) {
      const handleFormChange = () => {
        const formData = extractFormData();
        if (Object.keys(formData).length > 0) {
          updateData({ ...data, formData });
        }
      };

      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('input', handleFormChange);
        form.addEventListener('change', handleFormChange);
      });

      return () => {
        forms.forEach(form => {
          form.removeEventListener('input', handleFormChange);
          form.removeEventListener('change', handleFormChange);
        });
      };
    }
  }, [preserveForm, data, updateData, extractFormData]);

  // Auto-save on scroll changes
  useEffect(() => {
    if (preserveScroll && isInitialized.current) {
      const handleScroll = () => {
        updateData({ ...data, scrollPosition: { x: window.scrollX, y: window.scrollY } });
      };

      let timeoutId: NodeJS.Timeout;
      const throttledScroll = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleScroll, 100);
      };

      window.addEventListener('scroll', throttledScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', throttledScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [preserveScroll, data, updateData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    data,
    updateData,
    save,
    load,
    clear,
    isLoading,
    isSaving,
    lastSaved,
    error,
    isOnline,
    hasUnsavedChanges: manager.current?.getState().hasUnsavedChanges || false
  };
}
