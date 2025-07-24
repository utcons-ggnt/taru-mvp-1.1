'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  metadata?: {
    n8nOutput?: unknown;
    responseMetadata?: unknown;
    fallback?: boolean;
    error?: boolean;
  };
}

interface StudentData {
  name: string;
  grade?: string;
  interests?: string[];
  currentModules?: string[];
  email?: string;
  school?: string;
  studentId?: string;
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: StudentData;
}

export default function ChatModal({ isOpen, onClose, studentData }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi ${studentData.name}! I'm your AI Learning Assistant. I'm here to help you with your studies, answer questions, and guide you through your learning journey. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showN8nOutput, setShowN8nOutput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call your n8n API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentMessage,
          studentData: {
            name: studentData.name,
            email: studentData.email,
            grade: studentData.grade,
            school: studentData.school || 'JioWorld Learning',
            studentId: studentData.studentId || 'student_' + Date.now(),
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();
      
      // Log debug information to console
      console.log('Chat API Response:', data);
      if (data.n8nOutput) {
        console.log('N8N Output:', data.n8nOutput);
        console.log('AI-BUDDY Input:', data.n8nOutput.aiInput);
        console.log('AI-BUDDY Response:', data.n8nOutput.aiResponse);
        console.log('Response Metadata:', data.metadata);
        console.log('Webhook URL used:', data.metadata?.webhookUrl);
        console.log('Response time:', data.metadata?.responseTime);
      }

      if (data.success) {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
          metadata: {
            n8nOutput: data.n8nOutput,
            responseMetadata: data.metadata,
            fallback: data.fallback || false
          }
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        // Handle API errors
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response || "I'm having trouble connecting right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
          metadata: {
            error: true,
            fallback: true
          }
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('Chat API Error:', error);
      // Fallback response for network errors
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Hi ${studentData.name}! I'm having trouble connecting to my learning database right now. While I work on reconnecting, feel free to ask me about your studies, and I'll help you as soon as I can!`,
        isUser: false,
        timestamp: new Date(),
        metadata: {
          error: true,
          fallback: true
        }
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      x: 100,
      y: 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      x: 100,
      y: 100,
    }
  };

  const messageVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: {
        duration: 0.2
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div 
          className="bg-white rounded-t-xl shadow-2xl w-full max-w-md h-[600px] flex flex-col"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 360,
                  transition: { duration: 0.6 }
                }}
              >
                <Bot className="w-5 h-5" />
              </motion.div>
              <div>
                <motion.h3 
                  className="font-semibold"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  AI Learning Assistant
                </motion.h3>
                <motion.p 
                  className="text-xs text-white/80"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {isLoading ? 'Processing...' : 'Ready to help you learn!'}
                </motion.p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowN8nOutput(!showN8nOutput)}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors backdrop-blur-sm"
                title="Toggle AI-BUDDY output display"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {showN8nOutput ? 'Hide AI' : 'Show AI'}
              </motion.button>
              <motion.button
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors backdrop-blur-sm"
                title="Toggle debug mode"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'}
              </motion.button>
              <motion.button 
                onClick={onClose} 
                className="text-white hover:text-white/80 transition-colors"
                whileHover={{ 
                  scale: 1.1,
                  rotate: 90,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>

          {/* Messages */}
          <motion.div 
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <AnimatePresence>
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {messages.map((message, _index) => (
                <motion.div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  layout
                >
                  <motion.div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isUser
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-br-md shadow-md'
                        : 'bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100'
                    }`}
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <motion.p 
                      className={`text-xs mt-1 ${
                        message.isUser ? 'text-white/70' : 'text-gray-500'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="flex justify-start"
                  variants={loadingVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <motion.div 
                    className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                    animate={{ 
                      scale: [1, 1.02, 1],
                    }}
                    transition={{ 
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.2
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                        animate={{ 
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ 
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.4
                        }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input */}
          <motion.div 
            className="p-4 border-t border-gray-200 bg-white"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex gap-2">
              <motion.textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900"
                rows={1}
                disabled={isLoading}
                whileFocus={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              />
              <motion.button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 5px 15px -5px rgba(147, 51, 234, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={isLoading ? { 
                    duration: 1, 
                    repeat: Infinity, 
                    ease: "linear" 
                  } : {}}
                >
                  {isLoading ? '⏳' : '📤'}
                </motion.span>
              </motion.button>
            </div>
            
            {/* Quick suggestions */}
            <motion.div 
              className="flex gap-2 mt-2 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              {['Explain this topic', 'Help with homework', 'Study tips', 'Quiz me'].map((suggestion, index) => (
                <motion.button
                  key={suggestion}
                  onClick={() => setInputMessage(suggestion)}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-full hover:from-purple-100 hover:to-blue-100 transition-colors border border-purple-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
