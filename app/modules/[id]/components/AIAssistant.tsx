'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ClientN8NService } from '../services/ClientN8NService';
import { SpeechService } from '../services/SpeechService';
import { SpeechProgress } from '../types';
import ChatMessages from './ChatMessages';
import SpeechProgressIndicator from './SpeechProgressIndicator';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  audioUrl?: string;
}

type ActionType = 'explain' | 'define' | 'translate' | 'summarize';


interface AIAssistantProps {
  isPDFReady?: boolean;
  pdfContent?: string;
  onTextSelection?: (action: ActionType, text: string) => Promise<void>;
  apiKey?: string;
  className?: string;
}

export default function AIAssistant({
  isPDFReady = false,
  pdfContent = '',
  onTextSelection,
  apiKey = '',
  className = ''
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechProgress, setSpeechProgress] = useState<SpeechProgress>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    status: 'idle'
  });
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const n8nService = useRef<ClientN8NService | null>(null);
  const speechService = useRef<SpeechService | null>(null);

  useEffect(() => {
    if (apiKey) {
      n8nService.current = new ClientN8NService();
      speechService.current = new SpeechService(setSpeechProgress);
    }
  }, [apiKey]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role: 'user' | 'assistant', content: string, audioUrl?: string) => {
    const newMessage: Message = {
      id: Date.now(),
      role,
      content,
      timestamp: Date.now(),
      audioUrl
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !n8nService.current) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    try {
      const context = {
        pdfContent,
        videoData: null,
        currentTime: 0,
        selectedText: '',
        bookmarks: []
      };

      const response = await n8nService.current.generateResponse(userMessage, context);
      
      // Add AI response
      addMessage('assistant', response.content || response.message || 'No response received');

      // Auto-speak the response if enabled
      if (speechService.current && response.content) {
        await speechService.current.speak(response.content, selectedLanguage);
      }

    } catch (error) {
      console.error('🔴 Error sending message:', error);
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (messageId: number, text: string) => {
    if (!speechService.current) return;

    setPlayingMessageId(messageId);
    try {
      await speechService.current.speak(text, selectedLanguage);
    } catch (error) {
      console.error('🔴 Speech error:', error);
    } finally {
      setPlayingMessageId(null);
    }
  };

  const handleStop = async () => {
    if (speechService.current) {
      await speechService.current.stop();
      setPlayingMessageId(null);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('🔴 Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">AI</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Learning Assistant</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isPDFReady ? 'PDF Ready' : 'No PDF loaded'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="en-US">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="mr-IN">Marathi</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages
          messages={messages}
          onSpeak={handleSpeak}
          onStop={handleStop}
          playingMessageId={playingMessageId}
        />
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Speech Progress */}
      {speechProgress.status !== 'idle' && (
        <div className="px-4 pb-2">
          <SpeechProgressIndicator
            onStop={handleStop}
            onPause={() => speechService.current?.pause()}
            onResume={() => speechService.current?.resume()}
            progress={speechProgress}
            compact={true}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about the content..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
          </div>
          
          <div className="flex space-x-1">
            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Voice Input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 