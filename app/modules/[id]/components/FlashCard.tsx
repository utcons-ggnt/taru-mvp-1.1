'use client';

import React, { useState } from 'react';
import { FlashCardType } from '../types';

interface FlashCardProps {
  flashcard: FlashCardType;
  onFlip?: (isFlipped: boolean) => void;
  onRestart?: () => void;
  onSpeak?: (text: string) => void;
  className?: string;
}

export default function FlashCard({
  flashcard,
  onFlip,
  onRestart,
  onSpeak,
  className = ''
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setIsFlipped(!isFlipped);
    
    if (onFlip) {
      onFlip(!isFlipped);
    }
    
    // Reset animation state after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleSpeak = (text: string) => {
    if (onSpeak) {
      onSpeak(text);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '😊';
      case 'medium':
        return '😐';
      case 'hard':
        return '😰';
      default:
        return '📚';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Flashcard */}
      <div
        className={`relative w-full h-64 cursor-pointer perspective-1000 ${
          isAnimating ? 'pointer-events-none' : ''
        }`}
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-300 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getDifficultyIcon(flashcard.difficulty)}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(flashcard.difficulty)}`}>
                    {flashcard.difficulty}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {onSpeak && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(flashcard.front);
                      }}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="Listen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Question
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {flashcard.front}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-wrap gap-1">
                  {flashcard.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Click to flip
                </div>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="w-full h-full bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-lg shadow-lg p-6 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">💡</span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-full">
                    Answer
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {onSpeak && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(flashcard.back);
                      }}
                      className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      title="Listen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Answer
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    {flashcard.back}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {flashcard.category}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Click to flip back
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mt-4">
        <button
          onClick={handleFlip}
          disabled={isAnimating}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isFlipped ? 'Show Question' : 'Show Answer'}
        </button>
        
        {onRestart && (
          <button
            onClick={onRestart}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Restart
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
} 