'use client';

import React, { useState } from 'react';
import { ActionType } from '../types';

interface EnhancedTextTooltipProps {
  text: string;
  position: { x: number; y: number };
  onClose: () => void;
  onAction: (action: ActionType, text: string, context?: string) => Promise<void>;
  isLoading?: boolean;
  apiKey?: string;
}

export default function EnhancedTextTooltip({
  text,
  position,
  onClose,
  onAction,
  isLoading = false,
  apiKey
}: EnhancedTextTooltipProps) {
  const [customQuestion, setCustomQuestion] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const handleAction = async (action: ActionType) => {
    try {
      await onAction(action, text);
      onClose();
    } catch (error) {
      console.error('🔴 Action error:', error);
    }
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    
    try {
      await onAction('explain', text, customQuestion);
      setCustomQuestion('');
      setShowCustomInput(false);
      onClose();
    } catch (error) {
      console.error('🔴 Custom question error:', error);
    }
  };

  const actions = [
    {
      type: 'read' as ActionType,
      label: 'Read Aloud',
      icon: '🔊',
      description: 'Listen to this text'
    },
    {
      type: 'explain' as ActionType,
      label: 'Explain',
      icon: '💡',
      description: 'Get detailed explanation'
    },
    {
      type: 'define' as ActionType,
      label: 'Define',
      icon: '📖',
      description: 'Find word definitions'
    },
    {
      type: 'translate' as ActionType,
      label: 'Translate',
      icon: '🌐',
      description: 'Translate to other languages'
    },
    {
      type: 'summarize' as ActionType,
      label: 'Summarize',
      icon: '📝',
      description: 'Create a summary'
    }
  ];

  return (
    <div
      className="fixed z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-w-sm"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.max(position.y - 200, 10)
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-white">Text Actions</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Selected Text */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected Text:</p>
        <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 rounded">
          &quot;{text}&quot;
        </p>
      </div>

      {/* Language Selection */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Language
        </label>
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="en-US">English</option>
          <option value="hi-IN">Hindi</option>
          <option value="mr-IN">Marathi</option>
          <option value="es-ES">Spanish</option>
          <option value="fr-FR">French</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="p-3 space-y-2">
        {actions.map((action) => (
          <button
            key={action.type}
            onClick={() => handleAction(action.type)}
            disabled={isLoading}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <span className="text-lg">{action.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">{action.label}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{action.description}</div>
            </div>
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            )}
          </button>
        ))}

        {/* Custom Question */}
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="text-lg">❓</span>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">Ask Custom Question</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Ask anything about this text</div>
            </div>
          </button>
        ) : (
          <div className="space-y-2">
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="What would you like to know about this text?"
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
              rows={2}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCustomQuestion}
                disabled={!customQuestion.trim() || isLoading}
                className="flex-1 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Ask
              </button>
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomQuestion('');
                }}
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
        <div className="flex space-x-2">
          <button
            onClick={() => handleAction('read')}
            disabled={isLoading}
            className="flex-1 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
          >
            🔊 Read
          </button>
          <button
            onClick={() => handleAction('explain')}
            disabled={isLoading}
            className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
          >
            💡 Explain
          </button>
          <button
            onClick={() => handleAction('define')}
            disabled={isLoading}
            className="flex-1 px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 disabled:opacity-50"
          >
            📖 Define
          </button>
        </div>
      </div>
    </div>
  );
} 