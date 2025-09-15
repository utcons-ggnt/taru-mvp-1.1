'use client';

export interface PersistenceOptions {
  key: string;
  fallbackToLocalStorage?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  onSave?: (data: any) => void;
  onLoad?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface PersistenceState {
  data: any;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
}

export class PersistenceManager {
  private static instances = new Map<string, PersistenceManager>();
  private options: PersistenceOptions;
  private state: PersistenceState;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private listeners = new Set<(state: PersistenceState) => void>();

  constructor(options: PersistenceOptions) {
    this.options = {
      fallbackToLocalStorage: true,
      autoSave: false,
      autoSaveInterval: 30000,
      ...options
    };
    
    this.state = {
      data: null,
      lastSaved: null,
      hasUnsavedChanges: false,
      isOnline: navigator.onLine
    };

    this.setupEventListeners();
  }

  static getInstance(key: string, options?: Partial<PersistenceOptions>): PersistenceManager {
    if (!PersistenceManager.instances.has(key)) {
      PersistenceManager.instances.set(key, new PersistenceManager({ key, ...options }));
    }
    return PersistenceManager.instances.get(key)!;
  }

  private setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.state.isOnline = true;
      this.notifyListeners();
    });

    window.addEventListener('offline', () => {
      this.state.isOnline = false;
      this.notifyListeners();
    });

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state.hasUnsavedChanges) {
        this.save();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      if (this.state.hasUnsavedChanges) {
        this.save(true); // Force immediate save
      }
    });
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: PersistenceState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async load(): Promise<any> {
    try {
      // Try to load from server first
      if (this.state.isOnline) {
        try {
          const response = await fetch(`/api/session/load-page-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: localStorage.getItem('userId'),
              page: this.options.key 
            })
          });

          if (response.ok) {
            const result = await response.json();
            this.state.data = result.data;
            this.state.lastSaved = new Date();
            this.state.hasUnsavedChanges = false;
            this.notifyListeners();
            this.options.onLoad?.(this.state.data);
            return this.state.data;
          }
        } catch (error) {
          console.error('Error loading from server:', error);
        }
      }

      // Fallback to localStorage
      if (this.options.fallbackToLocalStorage) {
        const localData = this.loadFromLocalStorage();
        if (localData) {
          this.state.data = localData;
          this.state.hasUnsavedChanges = false;
          this.notifyListeners();
          this.options.onLoad?.(this.state.data);
          return this.state.data;
        }
      }

      return null;
    } catch (error) {
      this.options.onError?.(error as Error);
      return null;
    }
  }

  async save(data?: any, immediate = false): Promise<boolean> {
    try {
      if (data !== undefined) {
        this.state.data = data;
      }

      if (!immediate && this.options.autoSave) {
        this.state.hasUnsavedChanges = true;
        this.notifyListeners();
        return true;
      }

      // Try to save to server first
      if (this.state.isOnline) {
        try {
          const response = await fetch(`/api/session/save-page-data`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: localStorage.getItem('userId'),
              page: this.options.key,
              data: this.state.data
            })
          });

          if (response.ok) {
            this.state.lastSaved = new Date();
            this.state.hasUnsavedChanges = false;
            this.notifyListeners();
            this.options.onSave?.(this.state.data);
            return true;
          }
        } catch (error) {
          console.error('Error saving to server:', error);
        }
      }

      // Fallback to localStorage
      if (this.options.fallbackToLocalStorage) {
        this.saveToLocalStorage(this.state.data);
        this.state.lastSaved = new Date();
        this.state.hasUnsavedChanges = false;
        this.notifyListeners();
        this.options.onSave?.(this.state.data);
        return true;
      }

      return false;
    } catch (error) {
      this.options.onError?.(error as Error);
      return false;
    }
  }

  private saveToLocalStorage(data: any) {
    try {
      localStorage.setItem(this.options.key, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): any {
    try {
      const item = localStorage.getItem(this.options.key);
      if (item) {
        const parsed = JSON.parse(item);
        return parsed.data;
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }

  startAutoSave() {
    if (this.options.autoSave && this.options.autoSaveInterval) {
      this.autoSaveTimer = setInterval(() => {
        if (this.state.hasUnsavedChanges) {
          this.save();
        }
      }, this.options.autoSaveInterval);
    }
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  clear() {
    this.state.data = null;
    this.state.lastSaved = null;
    this.state.hasUnsavedChanges = false;
    this.notifyListeners();
    
    if (this.options.fallbackToLocalStorage) {
      localStorage.removeItem(this.options.key);
    }
  }

  getState(): PersistenceState {
    return { ...this.state };
  }
}

// Utility functions for common patterns
export const createFormPersistence = (formId: string, options?: Partial<PersistenceOptions>) => {
  const manager = PersistenceManager.getInstance(`form_${formId}`, {
    autoSave: true,
    autoSaveInterval: 5000,
    ...options
  });

  const extractFormData = (form: HTMLFormElement) => {
    const formData: Record<string, any> = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach((input: any) => {
      if (input.name) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          if (input.checked) {
            formData[input.name] = input.value;
          }
        } else {
          formData[input.name] = input.value;
        }
      }
    });

    return formData;
  };

  const restoreFormData = (form: HTMLFormElement, data: Record<string, any>) => {
    Object.entries(data).forEach(([name, value]) => {
      const input = form.querySelector(`[name="${name}"]`) as any;
      if (input) {
        if (input.type === 'checkbox' || input.type === 'radio') {
          input.checked = input.value === value;
        } else {
          input.value = value;
        }
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  };

  return {
    manager,
    extractFormData,
    restoreFormData
  };
};

export const createScrollPersistence = (pageId: string) => {
  const manager = PersistenceManager.getInstance(`scroll_${pageId}`, {
    autoSave: true,
    autoSaveInterval: 1000
  });

  const saveScrollPosition = () => {
    manager.save({
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now()
    });
  };

  const restoreScrollPosition = () => {
    manager.load().then((data) => {
      if (data && data.x !== undefined && data.y !== undefined) {
        window.scrollTo(data.x, data.y);
      }
    });
  };

  return {
    manager,
    saveScrollPosition,
    restoreScrollPosition
  };
};

export const createPageStatePersistence = (pageId: string, options?: Partial<PersistenceOptions>) => {
  const manager = PersistenceManager.getInstance(`page_${pageId}`, {
    autoSave: true,
    autoSaveInterval: 10000,
    ...options
  });

  return manager;
};

// Hook for React components
export const usePersistence = (key: string, options?: Partial<PersistenceOptions>) => {
  const manager = PersistenceManager.getInstance(key, options);
  
  return {
    load: () => manager.load(),
    save: (data: any, immediate = false) => manager.save(data, immediate),
    clear: () => manager.clear(),
    getState: () => manager.getState(),
    subscribe: (listener: (state: PersistenceState) => void) => manager.subscribe(listener)
  };
};
