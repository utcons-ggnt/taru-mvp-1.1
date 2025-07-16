'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import dataSync, { DataSyncEvents, type SyncData } from './dataSync';

// Context interface
interface DataSyncContextType {
  // Data synchronization methods
  updateData: (eventType: DataSyncEvents, data: Record<string, unknown>, userId?: string, source?: string) => void;
  getCachedData: (eventType: DataSyncEvents, userId?: string) => Record<string, unknown> | null;
  clearCache: (eventType: DataSyncEvents, userId?: string) => void;
  refreshData: (eventType: DataSyncEvents, userId?: string) => Promise<void>;
  
  // Subscription methods
  subscribe: (eventType: DataSyncEvents, callback: (data: SyncData) => void, userId?: string) => () => void;
  subscribeToGlobal: (callback: (data: SyncData) => void) => () => void;
  
  // Statistics
  getStats: () => { cacheSize: number; pendingUpdates: number; queueLength: number; isProcessing: boolean };
  
  // Global state
  globalUpdates: SyncData[];
  clearGlobalUpdates: () => void;
  
  // Connection status
  isConnected: boolean;
  lastUpdate: SyncData | null;
}

// Create context
const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

// Provider props
interface DataSyncProviderProps {
  children: ReactNode;
}

// Provider component
export function DataSyncProvider({ children }: DataSyncProviderProps) {
  const [globalUpdates, setGlobalUpdates] = useState<SyncData[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<SyncData | null>(null);

  useEffect(() => {
    // Subscribe to global updates
    const unsubscribeGlobal = dataSync.subscribeToGlobal((syncData: SyncData) => {
      setGlobalUpdates(prev => [...prev.slice(-9), syncData]); // Keep last 10 updates
      setLastUpdate(syncData);
    });

    // Subscribe to connection status updates
    const handleConnectionChange = () => {
      setIsConnected(true);
    };

    const handleDisconnection = () => {
      setIsConnected(false);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleDisconnection);

    // Set up periodic connection check
    const connectionCheck = setInterval(() => {
      if (navigator.onLine !== isConnected) {
        setIsConnected(navigator.onLine);
      }
    }, 5000);

    return () => {
      unsubscribeGlobal();
      window.removeEventListener('online', handleConnectionChange);
      window.removeEventListener('offline', handleDisconnection);
      clearInterval(connectionCheck);
    };
  }, [isConnected]);

  // Context value
  const contextValue: DataSyncContextType = {
    // Data synchronization methods
    updateData: (eventType: DataSyncEvents, data: Record<string, unknown>, userId?: string, source: string = 'provider') => {
      dataSync.updateData(eventType, data, userId, source);
    },
    
    getCachedData: (eventType: DataSyncEvents, userId?: string) => {
      return dataSync.getCachedData(eventType, userId);
    },
    
    clearCache: (eventType: DataSyncEvents, userId?: string) => {
      dataSync.clearCache(eventType, userId);
    },
    
    refreshData: async (eventType: DataSyncEvents, userId?: string) => {
      await dataSync.refreshData(eventType, userId);
    },
    
    // Subscription methods
    subscribe: (eventType: DataSyncEvents, callback: (data: SyncData) => void, userId?: string) => {
      return dataSync.subscribe(eventType, callback, userId);
    },
    
    subscribeToGlobal: (callback: (data: SyncData) => void) => {
      return dataSync.subscribeToGlobal(callback);
    },
    
    // Statistics
    getStats: () => {
      return dataSync.getStats();
    },
    
    // Global state
    globalUpdates,
    clearGlobalUpdates: () => {
      setGlobalUpdates([]);
    },
    
    // Connection status
    isConnected,
    lastUpdate
  };

  return (
    <DataSyncContext.Provider value={contextValue}>
      {children}
    </DataSyncContext.Provider>
  );
}

// Hook to use the data sync context
export function useDataSyncContext() {
  const context = useContext(DataSyncContext);
  if (context === undefined) {
    throw new Error('useDataSyncContext must be used within a DataSyncProvider');
  }
  return context;
}

// Hook for automatic data synchronization with API
export function useAutoDataSync<T = Record<string, unknown>>(
  eventType: DataSyncEvents,
  fetchFunction: () => Promise<T>,
  userId?: string,
  dependencies: unknown[] = []
) {
  const { updateData, getCachedData, subscribe } = useDataSyncContext();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first
      const cachedData = getCachedData(eventType, userId);
      if (cachedData) {
        setData(cachedData as T);
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const result = await fetchFunction();
      setData(result);
      
      // Update cache and notify other components
      updateData(eventType, result as Record<string, unknown>, userId, 'auto-sync');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to data updates
  useEffect(() => {
    const unsubscribe = subscribe(eventType, (syncData: SyncData) => {
      setData(syncData.data as T);
      setError(null);
    }, userId);

    return unsubscribe;
  }, [eventType, userId, subscribe]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData
  };
}

// Hook for real-time data synchronization
export function useRealtimeDataSync<T = Record<string, unknown>>(
  eventType: DataSyncEvents,
  userId?: string
) {
  const { getCachedData, subscribe } = useDataSyncContext();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial data from cache
    const cachedData = getCachedData(eventType, userId);
    if (cachedData) {
      setData(cachedData as T);
      setIsLoading(false);
    }

    // Subscribe to real-time updates
    const unsubscribe = subscribe(eventType, (syncData: SyncData) => {
      setData(syncData.data as T);
      setError(null);
    }, userId);

    return unsubscribe;
  }, [eventType, userId, getCachedData, subscribe]);

  return {
    data,
    isLoading,
    error
  };
}

// Hook for optimistic updates
export function useOptimisticDataSync<T = Record<string, unknown>>(
  eventType: DataSyncEvents,
  userId?: string
) {
  const { updateData, getCachedData } = useDataSyncContext();
  const [data, setData] = useState<T | null>(null);
  const [isOptimistic, setIsOptimistic] = useState(false);

  useEffect(() => {
    const cachedData = getCachedData(eventType, userId);
    if (cachedData) {
      setData(cachedData as T);
    }
  }, [eventType, userId, getCachedData]);

  const optimisticUpdate = async (
    optimisticData: T,
    updateFunction: () => Promise<void>
  ) => {
    // Store original data
    const originalData = data;
    
    // Apply optimistic update
    setData(optimisticData);
    setIsOptimistic(true);
    
    try {
      // Perform actual update
      await updateFunction();
      
      // Update cache with optimistic data
      updateData(eventType, optimisticData as Record<string, unknown>, userId, 'optimistic');
      
      setIsOptimistic(false);
    } catch (error) {
      // Revert on error
      setData(originalData);
      setIsOptimistic(false);
      throw error;
    }
  };

  return {
    data,
    isOptimistic,
    optimisticUpdate
  };
} 