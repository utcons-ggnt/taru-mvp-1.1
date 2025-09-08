'use client';

import React, { useState, useEffect } from 'react';
import { VideoData, FlashCardType, MCQQuestion } from '../types';
import VideoPlayer from './VideoPlayer';
import AIAssistant from './AIAssistant';
import FlashCard from './FlashCard';
import { ClientN8NService } from '../services/ClientN8NService';
import { TranscriptService, TranscriptData } from '../services/TranscriptService';

interface VideoLearningInterfaceProps {
  className?: string;
  apiKey?: string;
  moduleId?: string;
  videoData?: VideoData;
  uniqueId?: string;
}

export default function VideoLearningInterface({
  className = '',
  apiKey = '',
  moduleId,
  videoData,
  uniqueId
}: VideoLearningInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'mcq' | 'flashcards' | 'transcript'>('chat');
  const [activeVideoData, setActiveVideoData] = useState<VideoData | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [flashcards, setFlashcards] = useState<FlashCardType[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  const n8nService = new ClientN8NService();
  const transcriptService = new TranscriptService();

  // Demo video data (fallback if no videoData provided)
  const demoVideo: VideoData = {
    id: 'demo-1',
    title: 'Introduction to Machine Learning',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 1800,
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    transcript: [
      {
        id: '1',
        text: 'Welcome to our introduction to machine learning.',
        startTime: 0,
        endTime: 5,
        confidence: 0.95
      },
      {
        id: '2',
        text: 'Today we will explore the fundamental concepts of AI and ML.',
        startTime: 5,
        endTime: 12,
        confidence: 0.92
      }
    ]
  };

  useEffect(() => {
    // Use provided videoData or fallback to demo
    const currentVideoData = videoData || demoVideo;
    setActiveVideoData(currentVideoData);
    generateLearningContent();
    loadTranscriptData(currentVideoData);
  }, [videoData, moduleId]);

  const loadTranscriptData = async (videoData: VideoData) => {
    if (!moduleId) return;
    
    setIsLoadingTranscript(true);
    setTranscriptError(null);
    try {
      const transcript = await transcriptService.getTranscript(moduleId, videoData);
      if (transcript) {
        setTranscriptData(transcript);
        console.log('✅ Transcript loaded for module:', moduleId);
      } else {
        setTranscriptError('Failed to generate transcript. Please try again.');
      }
    } catch (error) {
      console.error('🔴 Error loading transcript:', error);
      setTranscriptError('Unable to load transcript. Using generated content instead.');
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const generateLearningContent = async (forceRegenerate = false) => {
    if (!apiKey) return;

    setIsGenerating(true);
    try {
      // Generate flashcards with caching support
      const flashcardData = await n8nService.generateFlashcards(
        uniqueId || 'TRANSCRIBE_003',
        forceRegenerate
      );
      
      const formattedFlashcards: FlashCardType[] = flashcardData.map((item: any, index: number) => ({
        id: `flashcard-${index}`,
        front: item.front,
        back: item.back,
        difficulty: item.difficulty,
        category: item.category,
        tags: item.tags
      }));
      
      setFlashcards(formattedFlashcards);

      // Generate MCQ questions with caching support
      const mcqData = await n8nService.generateMCQs(
        uniqueId || 'TRANSCRIBE_003',
        forceRegenerate
      );
      
      const formattedMCQs: MCQQuestion[] = mcqData.map((item: any, index: number) => ({
        Q: item.Q || (index + 1).toString(),
        level: item.level || 'Basic',
        question: item.question,
        options: item.options,
        answer: item.answer
      }));
      
      setMcqQuestions(formattedMCQs);
    } catch (error) {
      console.error('🔴 Content generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVideoLoad = (data: VideoData) => {
    setActiveVideoData(data);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleFlashcardFlip = (isFlipped: boolean) => {
    console.log('Flashcard flipped:', isFlipped);
  };

  const handleNextFlashcard = () => {
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(prev => prev + 1);
    }
  };

  const handlePrevFlashcard = () => {
    if (currentFlashcardIndex > 0) {
      setCurrentFlashcardIndex(prev => prev - 1);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowAnswer(true);
    
    if (answerIndex === mcqQuestions[currentMcqIndex]?.options.indexOf(mcqQuestions[currentMcqIndex]?.answer)) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentMcqIndex < mcqQuestions.length - 1) {
      setCurrentMcqIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handlePrevQuestion = () => {
    if (currentMcqIndex > 0) {
      setCurrentMcqIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentMcqIndex(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore(0);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'mcq', label: 'MCQ', icon: '❓' },
    { id: 'flashcards', label: 'Flashcards', icon: '📚' },
    { id: 'transcript', label: 'Transcript', icon: '📝' }
  ];

  return (
    <div className={`flex flex-col lg:flex-row h-full bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Left Panel - Video Player */}
      <div className="lg:w-2/3 h-full p-4">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <VideoPlayer
            videoData={activeVideoData || demoVideo}
            moduleId={moduleId}
            onVideoLoad={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onProgress={(progress) => {
              // Track progress for analytics
              console.log(`📊 Video Progress: ${progress}%`);
            }}
            className="h-full"
          />
        </div>
      </div>

      {/* Right Panel - Learning Tools */}
      <div className="lg:w-1/3 h-full p-4">
        <div className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col">
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
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <AIAssistant
                isPDFReady={false}
                pdfContent=""
                apiKey={apiKey}
                className="h-full"
              />
            )}

            {activeTab === 'mcq' && (
              <div className="h-full p-4 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Generating questions...</p>
                    </div>
                  </div>
                ) : mcqQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Question {currentMcqIndex + 1} of {mcqQuestions.length}
                      </span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        Score: {score}/{mcqQuestions.length}
                      </span>
                    </div>

                    {/* Question */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        {mcqQuestions[currentMcqIndex]?.question}
                      </h3>
                      
                      {/* Options */}
                      <div className="space-y-2">
                        {mcqQuestions[currentMcqIndex]?.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleAnswerSelect(index)}
                            disabled={showAnswer}
                            className={`w-full p-3 text-left rounded-lg border transition-colors ${
                              selectedAnswer === index
                                ? index === mcqQuestions[currentMcqIndex]?.options.indexOf(mcqQuestions[currentMcqIndex]?.answer)
                                  ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-400 dark:text-green-200'
                                  : 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-400 dark:text-red-200'
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {String.fromCharCode(65 + index)}. {option}
                          </button>
                        ))}
                      </div>

                      {/* Explanation */}
                      {showAnswer && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Correct answer: {mcqQuestions[currentMcqIndex]?.answer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentMcqIndex === 0}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={handleNextQuestion}
                        disabled={currentMcqIndex === mcqQuestions.length - 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>

                    {/* Restart */}
                    <button
                      onClick={handleRestartQuiz}
                      className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Restart Quiz
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No questions available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="h-full p-4 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Generating flashcards...</p>
                    </div>
                  </div>
                ) : flashcards.length > 0 ? (
                  <div className="space-y-4">
                    <FlashCard
                      flashcard={flashcards[currentFlashcardIndex]}
                      onFlip={handleFlashcardFlip}
                      onRestart={() => setCurrentFlashcardIndex(0)}
                      className="h-64"
                    />
                    
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevFlashcard}
                        disabled={currentFlashcardIndex === 0}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {currentFlashcardIndex + 1} / {flashcards.length}
                      </span>
                      <button
                        onClick={handleNextFlashcard}
                        disabled={currentFlashcardIndex === flashcards.length - 1}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No flashcards available</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transcript' && (
              <div className="h-full p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Video Transcript
                  </h3>
                  {isLoadingTranscript && (
                    <div className="flex items-center text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                      Loading transcript...
                    </div>
                  )}
                </div>
                
                {transcriptData ? (
                  <div className="space-y-2">
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-blue-700 dark:text-blue-300">
                          Transcript ID: {transcriptData.transcriptId}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {transcriptData.segments.length} segments
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Generated: {transcriptData.generatedAt.toLocaleString()} | 
                        Source: {transcriptData.source} | 
                        Confidence: {Math.round(transcriptData.confidence * 100)}%
                      </div>
                    </div>
                    
                    {transcriptData.segments.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => {
                          setCurrentTime(item.startTime);
                          // Send transcript interaction to N8N
                          if (moduleId && activeVideoData) {
                            n8nService.sendTranscriptData(moduleId, activeVideoData, transcriptData, {
                              action: 'transcript_segment_clicked',
                              userInteraction: 'segment_click',
                              currentTime: item.startTime,
                              selectedText: item.text,
                              segmentId: item.id
                            });
                          }
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.floor(item.startTime / 60)}:{(item.startTime % 60).toString().padStart(2, '0')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {Math.round(item.confidence * 100)}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {transcriptError ? (
                      <div className="mb-4">
                        <p className="text-amber-600 dark:text-amber-400 mb-2">
                          {transcriptError}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          The system will use generated content based on the video title.
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        {isLoadingTranscript ? 'Loading transcript...' : 'No transcript available'}
                      </p>
                    )}
                    {!isLoadingTranscript && moduleId && (
                      <button
                        onClick={() => loadTranscriptData(activeVideoData || demoVideo)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {transcriptError ? 'Retry Generation' : 'Generate Transcript'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 