'use client';

import React from 'react';
import { useAutoDataSync, useDataSyncContext } from '@/lib/DataSyncProvider';
import { useGlobalDataSync, useOptimisticDataSync } from '@/lib/useDataSync';
import { DataSyncEvents } from '@/lib/dataSync';

// Example component showing different data sync patterns
export function DataSyncExample() {
  const { isConnected, lastUpdate, getStats } = useDataSyncContext();
  const { globalUpdates, clearUpdates } = useGlobalDataSync();

  // Example of auto data sync
  const { data: userData, isLoading: userLoading, error: userError } = useAutoDataSync(
    DataSyncEvents.USER_UPDATED,
    async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      return response.json();
    },
    undefined, // Global user data
    []
  );

  // Example of real-time data sync
  const { data: progressData, isLoading: progressLoading } = useAutoDataSync(
    DataSyncEvents.PROGRESS_UPDATED,
    async () => {
      const response = await fetch('/api/dashboard/student/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch progress data');
      }
      return response.json();
    },
    userData?.user?.email,
    [userData]
  );

  const stats = getStats();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Data Synchronization Example</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Connection Status</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Sync Statistics */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Sync Statistics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Cache Size: {stats.cacheSize}</div>
          <div>Pending Updates: {stats.pendingUpdates}</div>
          <div>Queue Length: {stats.queueLength}</div>
          <div>Processing: {stats.isProcessing ? 'Yes' : 'No'}</div>
        </div>
      </div>

      {/* User Data */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">User Data</h3>
        {userLoading && <div className="text-blue-500">Loading user data...</div>}
        {userError && <div className="text-red-500">Error: {userError}</div>}
        {userData && (
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs">{JSON.stringify(userData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Progress Data */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Progress Data</h3>
        {progressLoading && <div className="text-blue-500">Loading progress data...</div>}
        {progressData && (
          <div className="bg-gray-50 p-3 rounded">
            <pre className="text-xs">{JSON.stringify(progressData, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Global Updates */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Recent Global Updates ({globalUpdates.length})</h3>
        <div className="max-h-40 overflow-y-auto">
          {globalUpdates.map((update, index) => (
            <div key={index} className="text-xs bg-gray-50 p-2 mb-1 rounded">
              <div className="font-semibold">{update.type}</div>
              <div className="text-gray-600">Source: {update.source}</div>
              <div className="text-gray-600">
                {new Date(update.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={clearUpdates}
          className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
        >
          Clear Updates
        </button>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Last Update</h3>
          <div className="bg-blue-50 p-3 rounded">
            <div className="text-sm">
              <strong>Type:</strong> {lastUpdate.type}
            </div>
            <div className="text-sm">
              <strong>Source:</strong> {lastUpdate.source}
            </div>
            <div className="text-sm">
              <strong>Time:</strong> {new Date(lastUpdate.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Example of a component that updates data
export function DataUpdateExample() {
  const { updateData } = useDataSyncContext();

  const handleUpdateUser = () => {
    const newUserData = {
      name: 'Updated User',
      email: 'updated@example.com',
      lastUpdated: new Date().toISOString()
    };

    updateData(DataSyncEvents.USER_UPDATED, newUserData, undefined, 'example');
  };

  const handleUpdateProgress = () => {
    const newProgressData = {
      totalPoints: Math.floor(Math.random() * 1000),
      completedModules: Math.floor(Math.random() * 10),
      lastUpdated: new Date().toISOString()
    };

    updateData(DataSyncEvents.PROGRESS_UPDATED, newProgressData, 'user@example.com', 'example');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Data Update Example</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleUpdateUser}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Update User Data
        </button>
        
        <button
          onClick={handleUpdateProgress}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Update Progress Data
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-600">
        Click these buttons to see how data updates propagate across components.
      </p>
    </div>
  );
}

// Example of optimistic updates
export function OptimisticUpdateExample() {
  const { optimisticUpdate } = useOptimisticDataSync(
    DataSyncEvents.PROGRESS_UPDATED,
    'user@example.com'
  );

  const handleOptimisticUpdate = async () => {
    const optimisticData = {
      moduleId: 'example-module',
      progress: 100,
      completed: true,
      timestamp: new Date().toISOString()
    };

    try {
      await optimisticUpdate(
        optimisticData,
        async () => {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Simulate API response
          const response = { success: true, data: optimisticData };
          
          if (!response.success) {
            throw new Error('API call failed');
          }
        }
      );
    } catch (error) {
      console.error('Optimistic update failed:', error);
      alert('Update failed - changes have been rolled back');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Optimistic Update Example</h2>
      
      <button
        onClick={handleOptimisticUpdate}
        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
      >
        Complete Module (Optimistic)
      </button>
      
      <p className="mt-4 text-sm text-gray-600">
        This demonstrates optimistic updates with automatic rollback on failure.
      </p>
    </div>
  );
} 