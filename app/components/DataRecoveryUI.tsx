'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from './SessionProvider';

interface DataRecoveryUIProps {
  onDataRecovered?: (data: any) => void;
  onRecoveryDismissed?: () => void;
  showOfflineIndicator?: boolean;
}

export default function DataRecoveryUI({ 
  onDataRecovered, 
  onRecoveryDismissed,
  showOfflineIndicator = true 
}: DataRecoveryUIProps) {
  const { isOnline, hasUnsavedChanges, lastSaved, loadFromLocalStorage } = useSession();
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryData, setRecoveryData] = useState<any>(null);
  const [isRecovering, setIsRecovering] = useState(false);

  // Check for recoverable data on mount
  useEffect(() => {
    const checkForRecoveryData = () => {
      const currentPage = window.location.pathname;
      const localData = loadFromLocalStorage(`page_data_${currentPage}`);
      
      if (localData) {
        setRecoveryData(localData);
        setShowRecoveryModal(true);
      }
    };

    // Small delay to ensure session is initialized
    const timer = setTimeout(checkForRecoveryData, 1000);
    return () => clearTimeout(timer);
  }, [loadFromLocalStorage]);

  const handleRecoverData = async () => {
    setIsRecovering(true);
    try {
      onDataRecovered?.(recoveryData);
      setShowRecoveryModal(false);
    } catch (error) {
      console.error('Error recovering data:', error);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleDismissRecovery = () => {
    setShowRecoveryModal(false);
    onRecoveryDismissed?.();
  };

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (!showRecoveryModal && !showOfflineIndicator) {
    return null;
  }

  return (
    <>
      {/* Offline Indicator */}
      {showOfflineIndicator && !isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Working offline</span>
        </div>
      )}

      {/* Unsaved Changes Indicator */}
      {hasUnsavedChanges && isOnline && (
        <div className="fixed top-4 right-4 z-50 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Saving changes...</span>
        </div>
      )}

      {/* Data Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Data Recovery Available</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              We found saved data from a previous session. Would you like to restore it?
            </p>
            
            {recoveryData && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recoverable Data:</h4>
                <div className="text-sm text-gray-600">
                  {recoveryData.formData && Object.keys(recoveryData.formData).length > 0 && (
                    <div className="mb-1">• Form data ({Object.keys(recoveryData.formData).length} fields)</div>
                  )}
                  {recoveryData.scrollPosition && (
                    <div className="mb-1">• Scroll position (x: {recoveryData.scrollPosition.x}, y: {recoveryData.scrollPosition.y})</div>
                  )}
                  {recoveryData.timestamp && (
                    <div className="mb-1">• Saved: {formatLastSaved(new Date(recoveryData.timestamp))}</div>
                  )}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleRecoverData}
                disabled={isRecovering}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isRecovering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Recovering...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Recover Data</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleDismissRecovery}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Start Fresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Saved Indicator */}
      {lastSaved && isOnline && !hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 z-40 bg-green-100 border border-green-400 text-green-700 px-3 py-1 rounded-lg text-xs">
          Last saved: {formatLastSaved(lastSaved)}
        </div>
      )}
    </>
  );
}
