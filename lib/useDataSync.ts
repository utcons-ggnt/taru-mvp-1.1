import { useEffect, useState, useCallback, useRef } from 'react';
import dataSync, { DataSyncEvents, type SyncData } from './dataSync';

// Hook for subscribing to data synchronization events
export function useDataSync<T = Record<string, unknown>>(
  eventType: DataSyncEvents,
  userId?: string,
  initialData?: T
) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to data updates
  useEffect(() => {
    const handleDataUpdate = (syncData: SyncData) => {
      setData(syncData.data as T);
      setError(null);
    };

    const handleRefresh = async () => {
      setIsLoading(true);
      try {
        // Trigger a refresh by clearing cache and re-fetching
        dataSync.clearCache(eventType, userId);
        // The component should handle the actual data fetching
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to refresh data');
      } finally {
        setIsLoading(false);
      }
    };

    // Subscribe to data updates
    const unsubscribe = dataSync.subscribe(eventType, handleDataUpdate, userId);
    
    // Subscribe to refresh events
    const unsubscribeRefresh = dataSync.subscribe(
      `${eventType}:refresh` as DataSyncEvents,
      handleRefresh,
      userId
    );

    // Get cached data if available
    const cachedData = dataSync.getCachedData(eventType, userId);
    if (cachedData && !data) {
      setData(cachedData as T);
    }

    unsubscribeRef.current = () => {
      unsubscribe();
      unsubscribeRefresh();
    };

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [eventType, userId, data]);

  // Update data function
  const updateData = useCallback((newData: T, source: string = 'component') => {
    dataSync.updateData(eventType, newData as Record<string, unknown>, userId, source);
  }, [eventType, userId]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      await dataSync.refreshData(eventType, userId);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [eventType, userId]);

  return {
    data,
    setData: updateData,
    isLoading,
    error,
    refreshData
  };
}

// Hook for subscribing to global state updates
export function useGlobalDataSync() {
  const [globalUpdates, setGlobalUpdates] = useState<SyncData[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleGlobalUpdate = (syncData: SyncData) => {
      setGlobalUpdates(prev => [...prev.slice(-9), syncData]); // Keep last 10 updates
    };

    const unsubscribe = dataSync.subscribeToGlobal(handleGlobalUpdate);
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  const clearUpdates = useCallback(() => {
    setGlobalUpdates([]);
  }, []);

  return {
    globalUpdates,
    clearUpdates
  };
}

// Hook for managing multiple data subscriptions
export function useMultiDataSync<T extends Record<string, DataSyncEvents>>(
  subscriptions: T,
  userId?: string
) {
  const [data, setData] = useState<Record<keyof T, Record<string, unknown>>>({} as Record<keyof T, Record<string, unknown>>);
  const [loading, setLoading] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [errors, setErrors] = useState<Record<keyof T, string | null>>({} as Record<keyof T, string | null>);
  const unsubscribeRefs = useRef<Record<keyof T, (() => void) | null>>({} as Record<keyof T, (() => void) | null>);

  useEffect(() => {
    const unsubscribes: (() => void)[] = [];

    Object.entries(subscriptions).forEach(([key, eventType]) => {
      const handleDataUpdate = (syncData: SyncData) => {
        setData(prev => ({ ...prev, [key]: syncData.data }));
        setErrors(prev => ({ ...prev, [key]: null }));
      };

      const handleRefresh = () => {
        setLoading(prev => ({ ...prev, [key]: true }));
        dataSync.clearCache(eventType, userId);
      };

      const unsubscribe = dataSync.subscribe(eventType, handleDataUpdate, userId);
      const unsubscribeRefresh = dataSync.subscribe(
        `${eventType}:refresh` as DataSyncEvents,
        handleRefresh,
        userId
      );

      unsubscribeRefs.current[key as keyof T] = () => {
        unsubscribe();
        unsubscribeRefresh();
      };

      unsubscribes.push(unsubscribe, unsubscribeRefresh);

      // Get cached data
      const cachedData = dataSync.getCachedData(eventType, userId);
      if (cachedData) {
        setData(prev => ({ ...prev, [key]: cachedData }));
      }
    });

    // Copy ref to variable for cleanup
    const currentUnsubscribeRefs = unsubscribeRefs.current;

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      Object.values(currentUnsubscribeRefs).forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, [subscriptions, userId]);

  const updateData = useCallback(<K extends keyof T>(key: K, newData: Record<string, unknown>, source: string = 'component') => {
    const eventType = subscriptions[key];
    dataSync.updateData(eventType, newData, userId, source);
  }, [subscriptions, userId]);

  const refreshData = useCallback(async <K extends keyof T>(key: K) => {
    const eventType = subscriptions[key];
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await dataSync.refreshData(eventType, userId);
      setErrors(prev => ({ ...prev, [key]: null }));
    } catch (err) {
      setErrors(prev => ({ 
        ...prev, 
        [key]: err instanceof Error ? err.message : 'Failed to refresh data' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [subscriptions, userId]);

  return {
    data,
    loading,
    errors,
    updateData,
    refreshData
  };
}

// Hook for optimistic updates with rollback
export function useOptimisticDataSync<T = Record<string, unknown>>(
  eventType: DataSyncEvents,
  userId?: string,
  initialData?: T
) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const originalDataRef = useRef<T | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const handleDataUpdate = (syncData: SyncData) => {
      setData(syncData.data as T);
      setOptimisticData(null);
      setIsUpdating(false);
      originalDataRef.current = null;
    };

    const unsubscribe = dataSync.subscribe(eventType, handleDataUpdate, userId);
    unsubscribeRef.current = unsubscribe;

    const cachedData = dataSync.getCachedData(eventType, userId);
    if (cachedData && !data) {
      setData(cachedData as T);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [eventType, userId, data]);

  const optimisticUpdate = useCallback(async (
    optimisticData: T,
    updateFunction: () => Promise<void>,
    rollbackFunction?: () => Promise<void>
  ) => {
    setIsUpdating(true);
    originalDataRef.current = data;
    setOptimisticData(optimisticData);

    try {
      await updateFunction();
      // If successful, the data update will come through the subscription
    } catch (error) {
      // Rollback on error
      setOptimisticData(null);
      setIsUpdating(false);
      
      if (rollbackFunction) {
        await rollbackFunction();
      }
      
      throw error;
    }
  }, [data]);

  const rollback = useCallback(() => {
    if (originalDataRef.current !== null) {
      setData(originalDataRef.current);
      setOptimisticData(null);
      setIsUpdating(false);
      originalDataRef.current = null;
    }
  }, []);

  return {
    data: optimisticData || data,
    isUpdating,
    optimisticUpdate,
    rollback
  };
} 