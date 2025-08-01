'use client';

import React, { useState } from 'react';
import { ExplanationResult } from '../types';
import { N8NService } from '../services/N8NService';
import { SpeechService } from '../services/SpeechService';

interface AdvancedFeaturePanelProps {
  isVisible: boolean;
  onToggle: () => void;
  pdfContent: string;
  apiKey: string;
  onExplanationResult?: (result: ExplanationResult) => void;
}

export default function AdvancedFeaturePanel({
  isVisible,
  onToggle,
  pdfContent,
  apiKey,
  onExplanationResult
}: AdvancedFeaturePanelProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'explain' | 'stats' | 'settings'>('read');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanationResult, setExplanationResult] = useState<ExplanationResult | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [autoPlay, setAutoPlay] = useState(false);

  const n8nService = new N8NService();
  const speechService = new SpeechService();

  const handleFullRead = async () => {
    if (!pdfContent) return;

    setIsReading(true);
    setReadingProgress(0);

    try {
      // Split content into chunks for progressive reading
      const chunks = pdfContent.split('\n\n').filter(chunk => chunk.trim());
      const totalChunks = chunks.length;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        await speechService.speak(chunk, selectedLanguage, voiceSpeed);
        setReadingProgress(((i + 1) / totalChunks) * 100);
        
        // Small delay between chunks
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('🔴 Reading error:', error);
    } finally {
      setIsReading(false);
      setReadingProgress(0);
    }
  };

  const handleStopReading = async () => {
    await speechService.stop();
    setIsReading(false);
    setReadingProgress(0);
  };

  const handleGenerateExplanation = async () => {
    if (!explanationText.trim() || !apiKey) return;

    setIsExplaining(true);
    try {
      const response = await n8nService.generateResponse(
        `Explain this concept in detail: ${explanationText}`,
        { pdfContent, videoData: null, currentTime: 0, selectedText: explanationText, bookmarks: [] }
      );

      const result: ExplanationResult = {
        explanation: response.content,
        examples: response.suggestions,
        relatedTopics: response.relatedQuestions,
        difficulty: 'medium'
      };

      setExplanationResult(result);
      if (onExplanationResult) {
        onExplanationResult(result);
      }
    } catch (error) {
      console.error('🔴 Explanation error:', error);
    } finally {
      setIsExplaining(false);
    }
  };

  const getPDFStats = () => {
    if (!pdfContent) return null;

    const words = pdfContent.split(/\s+/).length;
    const sentences = pdfContent.split(/[.!?]+/).length;
    const paragraphs = pdfContent.split(/\n\s*\n/).length;
    const characters = pdfContent.length;
    const estimatedReadingTime = Math.ceil(words / 200); // 200 words per minute

    return {
      words,
      sentences,
      paragraphs,
      characters,
      estimatedReadingTime
    };
  };

  const stats = getPDFStats();

  const tabs = [
    { id: 'read', label: 'Read', icon: '📖' },
    { id: 'explain', label: 'Explain', icon: '💡' },
    { id: 'stats', label: 'Stats', icon: '📊' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Features</h3>
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'read' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Full PDF Reading</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Read the entire PDF content aloud with progress tracking.
              </p>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en-US">English (US)</option>
                <option value="hi-IN">Hindi</option>
                <option value="mr-IN">Marathi</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
              </select>
            </div>

            {/* Voice Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Voice Speed: {voiceSpeed}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={voiceSpeed}
                onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Progress Bar */}
            {isReading && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Reading Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(readingProgress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="flex space-x-2">
              {!isReading ? (
                <button
                  onClick={handleFullRead}
                  disabled={!pdfContent}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Start Reading
                </button>
              ) : (
                <button
                  onClick={handleStopReading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Stop Reading
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Explanation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get detailed explanations of concepts using AI.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What would you like explained?
              </label>
              <textarea
                value={explanationText}
                onChange={(e) => setExplanationText(e.target.value)}
                placeholder="Enter a concept or topic you want explained..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              onClick={handleGenerateExplanation}
              disabled={!explanationText.trim() || isExplaining || !apiKey}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {isExplaining ? 'Generating...' : 'Generate Explanation'}
            </button>

            {explanationResult && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">Explanation</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {explanationResult.explanation}
                </p>

                {explanationResult.examples.length > 0 && (
                  <div className="mb-3">
                    <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Examples:</h6>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {explanationResult.examples.map((example, index) => (
                        <li key={index}>• {example}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {explanationResult.relatedTopics.length > 0 && (
                  <div>
                    <h6 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Related Topics:</h6>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {explanationResult.relatedTopics.map((topic, index) => (
                        <li key={index}>• {topic}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">PDF Statistics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Detailed analysis of the current document.
              </p>
            </div>

            {stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.words.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Words</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.sentences.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">Sentences</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.paragraphs.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Paragraphs</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.estimatedReadingTime}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Minutes to Read</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                No PDF content available for analysis.
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Learning Settings</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Customize your learning experience.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-play Audio
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Automatically play audio for AI responses
                  </p>
                </div>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoPlay ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="en-US">English (US)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="mr-IN">Marathi</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Voice Speed: {voiceSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSpeed}
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 