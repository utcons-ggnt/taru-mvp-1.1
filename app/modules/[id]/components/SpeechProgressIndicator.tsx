'use client';

import React from 'react';
import { SpeechProgress } from '../types';

interface SpeechProgressIndicatorProps {
  onStop?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  progress: SpeechProgress;
  className?: string;
  compact?: boolean;
}

export default function SpeechProgressIndicator({
  onStop,
  onPause,
  onResume,
  progress,
  className = '',
  compact = false
}: SpeechProgressIndicatorProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'loading':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'playing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'paused':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        {getStatusIcon()}
        
        <div className="flex-1">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {progress.status === 'playing' && onPause && (
            <button
              onClick={onPause}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Pause"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            </button>
          )}
          
          {progress.status === 'paused' && onResume && (
            <button
              onClick={onResume}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Resume"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
          
          {onStop && (
            <button
              onClick={onStop}
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Stop"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="font-medium text-gray-900 dark:text-white">
            {progress.status === 'loading' && 'Loading...'}
            {progress.status === 'playing' && 'Playing'}
            {progress.status === 'paused' && 'Paused'}
            {progress.status === 'error' && 'Error'}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {progress.duration > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
            </span>
          )}
        </div>
      </div>

      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-center space-x-4">
        {progress.status === 'playing' && onPause && (
          <button
            onClick={onPause}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Pause"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
            </svg>
          </button>
        )}
        
        {progress.status === 'paused' && onResume && (
          <button
            onClick={onResume}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="Resume"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
        
        {onStop && (
          <button
            onClick={onStop}
            className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
            title="Stop"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 