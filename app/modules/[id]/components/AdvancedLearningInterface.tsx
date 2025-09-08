'use client';

import React, { useState, useEffect } from 'react';
import { ActionType, BookmarkItem, ExplanationResult } from '../types';
import AIAssistant from './AIAssistant';
import PDFViewer from './PDFViewer';
import VideoLearningInterface from './VideoLearningInterface';
import BookmarksPanel from './BookmarksPanel';
import AdvancedFeaturePanel from './AdvancedFeaturePanel';
import { ClientN8NService } from '../services/ClientN8NService';
import { SpeechService } from '../services/SpeechService';

interface AdvancedLearningInterfaceProps {
  className?: string;
  apiKey?: string;
  moduleId?: string;
}

export default function AdvancedLearningInterface({
  className = '',
  apiKey = '',
  moduleId
}: AdvancedLearningInterfaceProps) {
  const [learningMode, setLearningMode] = useState<'pdf' | 'video'>('pdf');
  const [pdfContent, setPdfContent] = useState('');
  const [isPDFReady, setIsPDFReady] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const n8nService = new ClientN8NService();
  const speechService = new SpeechService();

  useEffect(() => {
    // Load demo bookmarks
    const demoBookmarks: BookmarkItem[] = [
      {
        id: '1',
        text: 'Machine learning is a subset of artificial intelligence',
        context: 'Introduction section',
        timestamp: 0,
        notes: 'Key definition to remember',
        tags: ['definition', 'important'],
        createdAt: new Date()
      },
      {
        id: '2',
        text: 'Supervised learning involves training a model on a labeled dataset',
        context: 'Key Concepts section',
        timestamp: 120,
        notes: 'Core concept for understanding ML',
        tags: ['concept', 'supervised'],
        createdAt: new Date()
      }
    ];
    setBookmarks(demoBookmarks);
  }, []);

  const handlePDFReady = (content: string) => {
    setPdfContent(content);
    setIsPDFReady(true);
  };

  const handleTextSelection = async (action: ActionType, text: string, context?: string) => {
    if (!apiKey) {
      console.log('🔴 No API key provided for text actions');
      return;
    }

    setIsProcessing(true);
    try {
      let response = '';
      
      switch (action) {
        case 'read':
          await speechService.speak(text);
          response = `Reading: "${text}"`;
          break;
        case 'explain':
          const explanation = await n8nService.generateResponse(
            context || `Explain this: ${text}`,
            { pdfContent, videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = explanation.content;
          break;
        case 'define':
          const definition = await n8nService.generateResponse(
            `Define this term: ${text}`,
            { pdfContent, videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = definition.content;
          break;
        case 'translate':
          const translation = await n8nService.generateResponse(
            `Translate this to Hindi: ${text}`,
            { pdfContent, videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = translation.content;
          break;
        case 'summarize':
          const summary = await n8nService.generateResponse(
            `Summarize this: ${text}`,
            { pdfContent, videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = summary.content;
          break;
      }

      // Add to bookmarks if it's an important action
      if (action === 'explain' || action === 'define') {
        const newBookmark: BookmarkItem = {
          id: Date.now().toString(),
          text,
          context: action,
          timestamp: Date.now(),
          notes: response.substring(0, 100) + '...',
          tags: [action],
          createdAt: new Date()
        };
        setBookmarks(prev => [...prev, newBookmark]);
      }

    } catch (error) {
      console.error('🔴 Text action error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBookmark = (bookmark: BookmarkItem) => {
    setBookmarks(prev => [...prev, bookmark]);
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  const handleExplanationResult = (result: ExplanationResult) => {
    console.log('Explanation result:', result);
  };

  return (
    <div className={`flex h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Left Panel - Content Viewer */}
      <div className="flex-1 flex flex-col">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI-Powered Learning Platform
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setLearningMode('pdf')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  learningMode === 'pdf'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                📄 PDF Learning
              </button>
              <button
                onClick={() => setLearningMode('video')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  learningMode === 'video'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                🎥 Video Learning
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowBookmarks(!showBookmarks)}
              className={`p-2 rounded-lg transition-colors ${
                showBookmarks
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Bookmarks"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button
              onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)}
              className={`p-2 rounded-lg transition-colors ${
                showAdvancedFeatures
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Advanced Features"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {learningMode === 'pdf' ? (
            <div className="h-full flex">
              {/* PDF Viewer */}
              <div className="flex-1">
                <PDFViewer
                  onPDFReady={handlePDFReady}
                  onTextSelection={handleTextSelection}
                  apiKey={apiKey}
                  className="h-full"
                />
              </div>

              {/* AI Assistant */}
              <div className="w-96 border-l border-gray-200 dark:border-gray-700">
                <AIAssistant
                  isPDFReady={isPDFReady}
                  pdfContent={pdfContent}
                  onTextSelection={handleTextSelection}
                  apiKey={apiKey}
                  className="h-full"
                />
              </div>
            </div>
          ) : (
            <VideoLearningInterface
              apiKey={apiKey}
              moduleId={moduleId}
              className="h-full"
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Bookmarks */}
      {showBookmarks && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700">
          <BookmarksPanel
            isOpen={showBookmarks}
            onClose={() => setShowBookmarks(false)}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        </div>
      )}

      {/* Advanced Features Panel */}
      {showAdvancedFeatures && (
        <div className="w-96 border-l border-gray-200 dark:border-gray-700">
          <AdvancedFeaturePanel
            isVisible={showAdvancedFeatures}
            onToggle={() => setShowAdvancedFeatures(false)}
            pdfContent={pdfContent}
            apiKey={apiKey}
            onExplanationResult={handleExplanationResult}
          />
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-white">Processing your request...</p>
          </div>
        </div>
      )}
    </div>
  );
} 