'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Star, CheckCircle, XCircle, Users, Code, FileText, Trophy, Brain, Target, Award, MessageCircle, BookOpen, Lightbulb, Mic, Volume2, ChevronDown } from 'lucide-react';

// Import AI-powered components
import AIAssistant from '../../../modules/[id]/components/AIAssistant';
import VideoLearningInterface from '../../../modules/[id]/components/VideoLearningInterface';
import AdvancedLearningInterface from '../../../modules/[id]/components/AdvancedLearningInterface';
import FlashCard from '../../../modules/[id]/components/FlashCard';
import BookmarksPanel from '../../../modules/[id]/components/BookmarksPanel';
import AdvancedFeaturePanel from '../../../modules/[id]/components/AdvancedFeaturePanel';
import { N8NService } from '../../../modules/[id]/services/N8NService';
import { SpeechService } from '../../../modules/[id]/services/SpeechService';

// Import types
import { 
  ActionType, 
  Message, 
  VideoData, 
  FlashCardType, 
  BookmarkItem, 
  ExplanationResult, 
  SpeechProgress, 
  MCQQuestion, 
  LearningContext, 
  AIResponse 
} from '../../../modules/[id]/types';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  uniqueId?: string;
  classGrade?: string;
  schoolName?: string;
  avatar?: string;
}

interface Module {
  id: string;
  uniqueID: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: string;
  duration: number;
  videoUrl: string;
  points: number;
  tags: string[];
  contentTypes?: any;
  gamification?: any;
}

export default function ModulesTab() {
  // Learning mode state
  const [learningMode, setLearningMode] = useState<'pdf' | 'video'>('pdf');
  const [activeTab, setActiveTab] = useState<'chat' | 'mcq' | 'flashcard'>('chat');
  const [selectedText, setSelectedText] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashCardType[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  
  // Real data state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModuleSelector, setShowModuleSelector] = useState(false);
  
  // AI Services
  const n8nService = useRef<N8NService | null>(null);
  const speechService = useRef<SpeechService | null>(null);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    type: 'ai' | 'user';
    content: string;
    timestamp: string;
  }>>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [chatInput, setChatInput] = useState('');
  
  // N8N Webhook URL
  const N8N_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN';

  // Initialize AI Services
  useEffect(() => {
    n8nService.current = new N8NService();
    speechService.current = new SpeechService(() => {});
  }, []);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch modules data
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/modules/recommended');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.modules) {
            setModules(data.modules);
            // Auto-select first module if available
            if (data.modules.length > 0 && !selectedModule) {
              setSelectedModule(data.modules[0]);
            }
          } else {
            console.error('Invalid response format:', data);
            setModules([]);
          }
        } else {
          console.error('Failed to fetch modules');
          setModules([]);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []); // Remove selectedModule from dependency to prevent infinite loop

  // Reset chat when module changes
  useEffect(() => {
    if (selectedModule) {
      setChatMessages([]);
    }
  }, [selectedModule]);

  // AI-Powered Learning Functions
  const handleTextSelection = async (action: ActionType, text: string, context?: string) => {
    if (!n8nService.current) return;

    try {
      let response = '';
      
      switch (action) {
        case 'read':
          if (speechService.current) {
            await speechService.current.speak(text);
          }
          response = `Reading: "${text}"`;
          break;
        case 'explain':
          const explanation = await n8nService.current.generateResponse(
            context || `Explain this: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = explanation.content;
          break;
        case 'define':
          const definition = await n8nService.current.generateResponse(
            `Define this term: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = definition.content;
          break;
      }
      
      console.log('AI Response:', response);
    } catch (error) {
      console.error('Error processing text action:', error);
    }
  };

  // N8N AI Buddy Chat Functions (Enhanced with reference to your chat API)
  const sendMessageToN8N = async (message: string, context?: string) => {
    try {
      setIsLoadingAI(true);
      
      // Build URL parameters for GET request (matching new N8N workflow format)
      const params = new URLSearchParams({
        Query: message, // Use 'Query' to match the new N8N format
        uniqueid: selectedModule?.uniqueID || 'TRANSCRIBE_003', // Use selected module's uniqueID as transcribe ID
        submittedAt: new Date().toISOString(),
        // Additional context for learning modules
        subject: selectedModule?.subject || 'General',
        module: selectedModule?.title || 'Learning Module',
        learningMode: learningMode,
        additionalContext: context || '',
        // Student context for personalized responses
        studentName: user?.fullName || 'Student',
        studentGrade: user?.classGrade || '',
        studentSchool: user?.schoolName || ''
      });

      const webhookUrl = `${N8N_WEBHOOK_URL}?${params.toString()}`;
      console.log('🔍 Sending message to N8N Transcribe Workflow:', {
        Query: message,
        uniqueid: selectedModule?.uniqueID || 'TRANSCRIBE_003',
        submittedAt: new Date().toISOString(),
        subject: selectedModule?.subject || 'General',
        module: selectedModule?.title || 'Learning Module'
      });

      // Add timeout to prevent hanging requests (following your API pattern)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        let data;
        try {
          data = await response.json();
          console.log('🔍 N8N Transcribe Workflow response:', data);
        } catch (parseError) {
          console.error('Failed to parse N8N response as JSON:', parseError);
          throw new Error('Invalid JSON response from N8N');
        }
        
        // Enhanced response extraction (matching new N8N workflow format)
        let aiResponse = 'I understand your question. Let me help you with that.';
        
        // Handle new N8N format: [{"output": "detailed response with emojis and formatting"}]
        if (data && Array.isArray(data) && data.length > 0) {
          const firstItem = data[0];
          if (firstItem && typeof firstItem === 'object') {
            // Prioritize 'output' field for the new workflow
            aiResponse = firstItem.output || firstItem.response || firstItem.message || 
                        Object.values(firstItem).find(v => typeof v === 'string' && v.trim().length > 20) as string || aiResponse;
          }
        } 
        // Handle direct object format
        else if (data && typeof data === 'object') {
          aiResponse = data.output || data.response || data.message || data.text || data.content || aiResponse;
        }
        // Handle string format
        else if (data && typeof data === 'string') {
          aiResponse = data;
        }
        
        return aiResponse;
      } else {
        console.error('🔍 N8N AI Buddy error:', response.status, response.statusText);
        
        // Generate fallback response (following your API pattern)
        const fallbackResponse = generateFallbackResponse(message, {
          name: user?.fullName || 'Student',
          grade: user?.classGrade || '',
          school: user?.schoolName || ''
        });
        
        return fallbackResponse;
      }
    } catch (error) {
      console.error('🔍 Error sending message to N8N:', error);
      
      // Generate fallback response for network errors
      const fallbackResponse = generateFallbackResponse(message, {
        name: user?.fullName || 'Student',
        grade: user?.classGrade || '',
        school: user?.schoolName || ''
      });
      
      return fallbackResponse;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Fallback response generator (enhanced for transcribe-based learning)
  const generateFallbackResponse = (query: string, studentData: Record<string, unknown>): string => {
    const studentName = studentData.name as string || 'there';
    const lowerQuery = query.toLowerCase();
    
    // Match common learning-related queries with more detailed responses
    if (lowerQuery.includes('help') || lowerQuery.includes('assist')) {
      return `Hi ${studentName}! I'm here to help you with your learning journey. I can assist you with understanding ${selectedModule?.subject || 'your subjects'}, explaining complex concepts, and answering questions about your course materials. Feel free to ask me anything!`;
    }
    
    if (lowerQuery.includes('explain') || lowerQuery.includes('understand') || lowerQuery.includes('repeat')) {
      return `${studentName}, I'd be happy to explain ${selectedModule?.subject || 'the concepts'} to you in detail. While I'm in offline mode, you can still ask me questions about your learning materials, and I'll provide comprehensive explanations.`;
    }
    
    if (lowerQuery.includes('read') || lowerQuery.includes('aloud')) {
      return `${studentName}, I can help you with reading assistance and text-to-speech features. You can also ask me to explain content in simpler terms or break down complex topics for better understanding.`;
    }
    
    if (lowerQuery.includes('module') || lowerQuery.includes('content') || lowerQuery.includes('chapter')) {
      return `Great question about ${selectedModule?.title || 'your learning content'}, ${studentName}! Each module is designed to help you understand key concepts and improve your knowledge. I can provide detailed explanations and summaries.`;
    }
    
    if (lowerQuery.includes('previous') || lowerQuery.includes('before') || lowerQuery.includes('earlier')) {
      return `${studentName}, I understand you want to review previous content. I can help you with summaries, key points, and explanations of earlier topics in ${selectedModule?.subject || 'your subject'}.`;
    }
    
    // Default friendly response with more context
    return `Hello ${studentName}! I'm your AI learning assistant. While I'm working in offline mode right now, I'm still here to help! You can ask me about ${selectedModule?.subject || 'your subjects'}, request detailed explanations, get help with complex topics, or ask me to repeat and clarify previous content.`;
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    try {
      // Get context based on current mode and module
      let context = '';
      if (learningMode === 'pdf' && selectedModule) {
        context = `PDF Reader Mode - Subject: ${selectedModule.subject}, Module: ${selectedModule.title}`;
      } else if (learningMode === 'video' && selectedModule) {
        context = `Video Learning Mode - Subject: ${selectedModule.subject}, Module: ${selectedModule.title}`;
      }

      const aiResponse = await sendMessageToN8N(message, context);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: aiResponse,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      
      // The sendMessageToN8N function now returns fallback responses instead of throwing errors
      // So this catch block will only handle unexpected errors
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: 'I encountered an unexpected issue. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };

      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  // Initialize chat with welcome message
  useEffect(() => {
    if (user && selectedModule && chatMessages.length === 0) {
      const welcomeMessage = {
        id: 'welcome',
        type: 'ai' as const,
        content: `Hello ${user.fullName ? user.fullName.split(' ')[0] : 'there'}! I'm your AI learning assistant. I can help you understand ${selectedModule.subject} content, explain concepts, define terms, or read text aloud. How can I assist your learning today?`,
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      setChatMessages([welcomeMessage]);
    }
  }, [user, selectedModule, chatMessages.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    const chatContainers = document.querySelectorAll('.chat-container');
    chatContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.scrollTop = container.scrollHeight;
      }
    });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <style jsx>{`
        .chat-container::-webkit-scrollbar {
          width: 6px;
        }
        .chat-container::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .chat-container::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .chat-container::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">J</span>
          </div>
          <span className="font-semibold text-gray-800 text-lg">JioWorld Learning</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600">🔔</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="User" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-sm font-bold">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-800 font-medium">
                {user?.fullName || 'Loading...'}
              </span>
              <span className="text-gray-500 text-sm ml-1">
                {user?.uniqueId ? `#${user.uniqueId}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module Selection */}
      <div className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Select Module</span>
            <div className="relative">
              <button
                onClick={() => setShowModuleSelector(!showModuleSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 min-w-[300px]"
              >
                {selectedModule ? (
                  <>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{selectedModule.title}</div>
                      <div className="text-sm text-gray-500">{selectedModule.subject} • {selectedModule.grade}</div>
                    </div>
                  </>
                ) : (
                  <span className="text-gray-500">Choose a module to start learning...</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showModuleSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      Loading modules...
                    </div>
                  ) : modules.length > 0 ? (
                    modules.map((module) => (
                      <button
                        key={module.id}
                        onClick={() => {
                          setSelectedModule(module);
                          setShowModuleSelector(false);
                        }}
                        className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          selectedModule?.id === module.id ? 'bg-purple-50 border-purple-200' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-800">{module.title}</div>
                        <div className="text-sm text-gray-500">{module.subject} • {module.grade}</div>
                        <div className="text-xs text-gray-400 mt-1">{module.duration} mins • {module.difficulty}</div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No modules available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {selectedModule && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>📚 {selectedModule.subject}</span>
              <span>•</span>
              <span>⏱️ {selectedModule.duration} mins</span>
              <span>•</span>
              <span>🎯 {selectedModule.points} XP</span>
            </div>
          )}
        </div>
      </div>

      {/* Learning Mode Tabs */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-700 font-medium">Learning Mode</span>
          <div className="flex gap-2">
            <button
              onClick={() => setLearningMode('pdf')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                learningMode === 'pdf'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📄 PDF Reader
            </button>
            <button
              onClick={() => setLearningMode('video')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                learningMode === 'video'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              📹 Video Learning
            </button>
          </div>
          <div className="ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
              🔖 Bookmarks
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 py-6">
        {!selectedModule ? (
          // No module selected state
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Module to Start Learning</h3>
            <p className="text-gray-600 mb-6">Choose from the available modules above to begin your learning journey.</p>
            <button
              onClick={() => setShowModuleSelector(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Browse Modules
            </button>
          </div>
        ) : learningMode === 'pdf' ? (
          // PDF Reader Mode
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
            {/* Left Panel - PDF Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedModule.title}
                </h3>
                <p className="text-gray-600 text-sm">{selectedModule.subject} - {selectedModule.grade}</p>
                
                <div className="space-y-4 mt-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="text-blue-600 font-semibold mb-2">
                      📚 {selectedModule.title}
                    </h4>
                    <h5 className="text-lg font-semibold text-gray-800 mb-3">
                      {selectedModule.subject}: {selectedModule.description}
                    </h5>
                    
                    <div className="prose prose-sm text-gray-700 space-y-3">
                      <p>
                        {selectedModule.description}
                      </p>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h6 className="font-semibold text-gray-800 mb-2">Module Details:</h6>
                        <ul className="text-sm space-y-1">
                          <li><strong>Duration:</strong> {selectedModule.duration} minutes</li>
                          <li><strong>Difficulty:</strong> {selectedModule.difficulty}</li>
                          <li><strong>Points:</strong> {selectedModule.points} XP</li>
                          {selectedModule.tags && selectedModule.tags.length > 0 && (
                            <li><strong>Tags:</strong> {selectedModule.tags.join(', ')}</li>
                          )}
                        </ul>
                      </div>

                      {user?.schoolName && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>School:</strong> {user.schoolName}
                            {user?.classGrade && <span> | <strong>Grade:</strong> {user.classGrade}</span>}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - AI Buddy */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">AI Buddy</h3>
                <p className="text-gray-600 text-sm">Your intelligent reading companion</p>
              </div>

              <div className="chat-container flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                    {message.type === 'ai' && (
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        🤖
                      </div>
                    )}
                    <div className={`flex-1 ${message.type === 'user' ? 'max-w-xs' : ''}`}>
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white ml-auto' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <span className={`text-xs text-gray-500 mt-1 ${
                        message.type === 'user' ? 'block text-right' : ''
                      }`}>
                        {message.timestamp}
                      </span>
                    </div>
                    {message.type === 'user' && (
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                        {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoadingAI && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                      🤖
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                          <p className="text-gray-800 text-sm">AI is thinking...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => handleSendMessage("Can you read the current content aloud?")}
                    disabled={isLoadingAI}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-4 h-4" />
                    Read Only
                  </button>
                  <button
                    onClick={() => handleSendMessage("Can you explain the main concepts from this content in simple terms?")}
                    disabled={isLoadingAI}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📖 Explain Sentence
                  </button>
                  <button
                    onClick={() => handleSendMessage("Can you define and explain the key terms used in this content?")}
                    disabled={isLoadingAI}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📝 Explain Word
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(chatInput);
                        }
                      }}
                      placeholder={`Ask about ${selectedModule.subject} content...`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoadingAI}
                    />
                    <button
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        // TODO: Implement voice input
                        console.log('Voice input clicked');
                      }}
                    >
                      <Mic className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSendMessage(chatInput)}
                    disabled={!chatInput.trim() || isLoadingAI}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chatInput.trim() && !isLoadingAI
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoadingAI ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span>➤</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Video Learning Mode
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-300px)]">
            {/* Left Panel - Video Player */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedModule.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {selectedModule.subject} - {selectedModule.duration} mins
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={selectedModule.videoUrl || "Upload a Link"}
                    defaultValue={selectedModule.videoUrl || ""}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    🔗
                  </button>
                </div>
                
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                  {selectedModule.videoUrl ? (
                    <div className="text-center text-white">
                      <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">▶️</span>
                      </div>
                      <p className="text-sm">Video: {selectedModule.title}</p>
                      <p className="text-xs text-gray-300 mt-1">Duration: {selectedModule.duration} minutes</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 text-2xl">⬆</span>
                      </div>
                      <p className="text-gray-400">Upload a Link</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Module Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Subject:</span>
                      <p className="font-medium">{selectedModule.subject}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <p className="font-medium">{selectedModule.difficulty}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Points:</span>
                      <p className="font-medium">{selectedModule.points} XP</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Grade:</span>
                      <p className="font-medium">{selectedModule.grade}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - AI Learning Assistant */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">AI Learning Assistant</h3>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'chat' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setActiveTab('mcq')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'mcq' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  MCQ
                </button>
                <button
                  onClick={() => setActiveTab('flashcard')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'flashcard' 
                      ? 'text-purple-600 border-b-2 border-purple-600' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Flashcard
                </button>
              </div>
              
              <div className="chat-container flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                {activeTab === 'chat' && (
                  <>
                    {chatMessages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                            🤖
                          </div>
                        )}
                        <div className={`flex-1 ${message.type === 'user' ? 'max-w-xs' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.type === 'user' 
                              ? 'bg-purple-600 text-white ml-auto' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                          <span className={`text-xs text-gray-500 mt-1 ${
                            message.type === 'user' ? 'block text-right' : ''
                          }`}>
                            {message.timestamp}
                          </span>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isLoadingAI && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                          🤖
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                              <p className="text-gray-800 text-sm">AI is thinking...</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'mcq' && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">MCQ questions will appear here</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Ready to generate practice questions for {selectedModule.subject}
                    </p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                      Generate MCQ Questions
                    </button>
                  </div>
                )}

                {activeTab === 'flashcard' && (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Flashcards will appear here</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Ready to create flashcards for {selectedModule.title}
                    </p>
                    <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
                      Create Flashcards
                    </button>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(chatInput);
                        }
                      }}
                      placeholder={`Ask questions about ${selectedModule.subject} content...`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={isLoadingAI}
                    />
                    <button
                      className="absolute left-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => {
                        // TODO: Implement voice input
                        console.log('Voice input clicked');
                      }}
                    >
                      <Mic className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleSendMessage(chatInput)}
                    disabled={!chatInput.trim() || isLoadingAI}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      chatInput.trim() && !isLoadingAI
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isLoadingAI ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <span>➤</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </button>
        <button className="w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 flex items-center justify-center">
          <span className="text-xl">🤖</span>
        </button>
      </div>
    </div>
  );
} 