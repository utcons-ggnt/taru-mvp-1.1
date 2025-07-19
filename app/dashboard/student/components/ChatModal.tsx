'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  n8nOutput?: {
    fullResponse?: unknown;
    processedResponse?: unknown;
    geminiInput?: string;
    geminiResponse?: string;
    timestamp?: string;
    studentContext?: {
      name?: string;
      grade?: string;
      school?: string;
    };
  };
  metadata?: {
    method?: string;
    webhookStatus?: number;
    responseTime?: number;
    messageLength?: number;
    studentDataProvided?: boolean;
    webhookUrl?: string;
    timestamp?: string;
  };
  geminiInput?: string;
  geminiResponse?: string;
  aiBuddyResponse?: unknown;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: {
    name: string;
    email: string;
    grade?: string;
    school?: string;
    _id?: string;
  } | null;
}

export default function ChatModal({ isOpen, onClose, studentData }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showN8nOutput, setShowN8nOutput] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !studentData || isLoading) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage,
          studentData: {
            name: studentData?.name || '',
            email: studentData?.email || '',
            grade: studentData?.grade || '',
            school: studentData?.school || '',
            studentId: studentData?._id || '',
            timestamp: new Date().toISOString()
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Chat API Response:', data);

        // Enhanced error handling and response processing
        let responseText = data.response || 'Thank you for your message! I\'ll get back to you soon.';
        let geminiInput = data.n8nOutput?.geminiInput || inputMessage;
        let geminiResponse = data.n8nOutput?.geminiResponse || data.response;

        // If n8n failed but we have a fallback response
        if (data.fallback && data.response) {
          responseText = data.response;
          geminiInput = inputMessage;
          geminiResponse = 'Fallback response (n8n unavailable)';
        }

        const botMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          text: responseText,
          sender: 'bot',
          timestamp: new Date(),
          n8nOutput: data.n8nOutput,
          metadata: data.metadata,
          geminiInput: geminiInput,
          geminiResponse: geminiResponse,
          aiBuddyResponse: data.n8nOutput?.fullResponse || data.response
        };

        setMessages(prev => [...prev, botMessage]);

        // Enhanced logging
        if (data.n8nOutput) {
          console.log('N8N Output:', data.n8nOutput);
          console.log('AI-BUDDY Input:', geminiInput);
          console.log('AI-BUDDY Response:', geminiResponse);
        }
        if (data.metadata) {
          console.log('Response Metadata:', data.metadata);
          console.log('Webhook URL used:', data.metadata.webhookUrl);
          console.log('Response time:', data.metadata.responseTime);
        }
      } else {
        const fallbackMessage: Message = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          text: 'I\'m here to help with your learning journey! What would you like to know about your courses, progress, or any other learning topics?',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        text: 'I\'m having trouble connecting right now, but I\'m here to help! You can ask me about your learning progress, upcoming modules, or any questions about your courses.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
      <div className="bg-white rounded-t-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-purple-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">AI Learning Assistant</h3>
              <p className="text-xs text-purple-100">
                {isLoading ? 'Processing...' : 'Ready to help you learn!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowN8nOutput(!showN8nOutput)}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              title="Toggle AI-BUDDY output display"
            >
              {showN8nOutput ? 'Hide AI' : 'Show AI'}
            </button>
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-2 py-1 rounded transition-colors"
              title="Toggle debug mode"
            >
              {showDebug ? 'Hide Debug' : 'Show Debug'}
            </button>
            <button onClick={onClose} className="text-white hover:text-purple-200 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.sender === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 text-purple-600" />}
                  <div>
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {showN8nOutput &&
                      message.sender === 'bot' &&
                      (message.geminiInput || message.geminiResponse) && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">🎯</span>
                            </div>
                            <span className="text-xs font-semibold text-green-800">
                              AI-BUDDY (Workflow 3)
                            </span>
                          </div>
                          {message.geminiInput && (
                            <div className="mb-3">
                              <span className="text-xs font-medium text-green-700">📤 Query to AI-BUDDY:</span>
                              <div className="text-xs text-green-700 bg-white p-3 rounded border border-green-200 shadow-sm whitespace-pre-wrap">
                                {message.geminiInput}
                              </div>
                            </div>
                          )}
                          {message.geminiResponse && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-blue-700">📥 AI-BUDDY Response:</span>
                              <div className="text-xs text-blue-700 bg-white p-3 rounded border border-blue-200 shadow-sm whitespace-pre-wrap">
                                {message.geminiResponse}
                              </div>
                            </div>
                          )}
                          {message.n8nOutput?.studentContext && (
                            <div className="mt-3 p-2 bg-gray-50 rounded border">
                              <span className="text-xs font-medium text-gray-600">Student Context Used:</span>
                              <div className="text-xs text-gray-600 mt-1">
                                <div>Name: {message.n8nOutput.studentContext.name}</div>
                                <div>Grade: {message.n8nOutput.studentContext.grade}</div>
                                <div>School: {message.n8nOutput.studentContext.school}</div>
                              </div>
                            </div>
                          )}
                          {typeof message.metadata?.responseTime === 'number' && (
                            <div className="text-xs text-gray-500 mt-2">
                              ⏱️ Processed in {message.metadata.responseTime}ms
                            </div>
                          )}
                        </div>
                      )}

                    {showDebug && message.sender === 'bot' && (message.n8nOutput || message.metadata) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <details className="text-gray-600">
                          <summary className="cursor-pointer font-medium">Debug Info</summary>
                          <div className="mt-1 space-y-1">
                            {message.metadata && (
                              <div>
                                <strong>Metadata:</strong>
                                <pre className="text-xs bg-white p-1 rounded overflow-x-auto">
                                  {JSON.stringify(message.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                            {message.n8nOutput && (
                              <div>
                                <strong>Full N8N Output:</strong>
                                <pre className="text-xs bg-white p-1 rounded overflow-x-auto">
                                  {JSON.stringify(message.n8nOutput, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                  {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 text-purple-200" />}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-600" />
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* AI Summary */}
        {showN8nOutput &&
          messages.some((m) => m.sender === 'bot' && (m.geminiInput || m.geminiResponse)) && (
            <div className="p-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full" />
                  <span className="text-xs font-medium text-green-800">AI-BUDDY (Workflow 3) Active</span>
                </div>
                <span className="text-xs text-green-600">
                  {
                    messages.filter((m) => m.sender === 'bot' && (m.geminiInput || m.geminiResponse)).length
                  }{' '}
                  AI responses
                </span>
              </div>
            </div>
          )}

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              aria-label="Chat message input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <button
              aria-label="Send message"
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['Help with current module', 'Show my progress', 'Recommend courses', 'Ask about grades'].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInputMessage(suggestion)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
