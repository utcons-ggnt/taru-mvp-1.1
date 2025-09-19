'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  BookOpen, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Lightbulb,
  Brain,
  Database,
  X
} from 'lucide-react';

interface N8NLoadingIndicatorProps {
  isVisible: boolean;
  status: 'idle' | 'triggering' | 'processing' | 'checking' | 'completed' | 'error';
  message?: string;
  progress?: number;
  className?: string;
  startTime?: number | null;
  onDatabaseCheck?: () => Promise<boolean>;
  onClose?: () => void;
}

// Educational facts to display while loading
const educationalFacts = [
  "Did you know? The human brain contains approximately 86 billion neurons!",
  "Fun fact: Honey never spoils - archaeologists have found edible honey in ancient Egyptian tombs!",
  "Amazing: A group of flamingos is called a 'flamboyance'!",
  "Interesting: Octopuses have three hearts and blue blood!",
  "Cool fact: The shortest war in history lasted only 38-45 minutes!",
  "Fascinating: There are more possible games of chess than atoms in the observable universe!",
  "Wow: A single cloud can weigh more than a million pounds!",
  "Incredible: The human body produces 25 million new cells every second!",
  "Amazing: The Great Wall of China is not visible from space with the naked eye!",
  "Fun fact: Bananas are berries, but strawberries aren't!",
  "Interesting: The human brain uses 20% of the body's total energy!",
  "Cool: There are more trees on Earth than stars in the Milky Way galaxy!",
  "Fascinating: The human heart beats about 100,000 times per day!",
  "Wow: A group of owls is called a 'parliament'!",
  "Incredible: The speed of light is about 186,282 miles per second!",
  "Amazing: The human body has enough DNA to stretch to the sun and back 600 times!",
  "Fun fact: Wombat poop is cube-shaped!",
  "Interesting: The human brain is 75% water!",
  "Cool: A group of jellyfish is called a 'smack'!",
  "Fascinating: The human body contains enough iron to make a 3-inch nail!"
];

const N8NLoadingIndicator: React.FC<N8NLoadingIndicatorProps> = ({
  isVisible,
  status,
  message,
  progress = 0,
  className = '',
  startTime = null,
  onDatabaseCheck,
  onClose
}) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [currentFact, setCurrentFact] = useState(educationalFacts[0]);
  const [databaseCheckAttempts, setDatabaseCheckAttempts] = useState(0);

  // Rotate facts every 3 seconds when processing
  useEffect(() => {
    if (status === 'processing' && isVisible) {
      const interval = setInterval(() => {
        setCurrentFactIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % educationalFacts.length;
          setCurrentFact(educationalFacts[nextIndex]);
          return nextIndex;
        });
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [status, isVisible]);

  // Database checking logic
  useEffect(() => {
    if (status === 'checking' && onDatabaseCheck && isVisible) {
      const checkDatabase = async () => {
        try {
          setDatabaseCheckAttempts(prev => prev + 1);
          const hasModules = await onDatabaseCheck();
          
          if (hasModules) {
            // Modules found, mark as completed
            console.log('✅ Database check successful: Modules found');
            return;
          } else if (databaseCheckAttempts < 3) {
            // No modules yet, retry after 10 seconds
            console.log(`⏳ Database check attempt ${databaseCheckAttempts + 1}/3: No modules found, retrying...`);
            setTimeout(checkDatabase, 10000);
          } else {
            // Max attempts reached, show error
            console.log('❌ Database check failed: No modules found after 3 attempts');
            return;
          }
        } catch (error) {
          console.error('❌ Database check error:', error);
          if (databaseCheckAttempts < 3) {
            setTimeout(checkDatabase, 10000);
          }
        }
      };

      checkDatabase();
    }
  }, [status, onDatabaseCheck, isVisible, databaseCheckAttempts]);

  const getStatusConfig = () => {
    switch (status) {
      case 'triggering':
        return {
          icon: <BookOpen className="w-6 h-6" />,
          title: 'Preparing Your Learning Content',
          description: 'Setting up personalized educational materials...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100'
        };
      case 'processing':
        return {
          icon: <Brain className="w-6 h-6 animate-pulse" />,
          title: 'Generating Your Learning Path',
          description: currentFact,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100'
        };
      case 'checking':
        return {
          icon: <Database className="w-6 h-6 animate-pulse" />,
          title: 'Verifying Content Generation',
          description: 'Checking database to ensure your learning modules are ready...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Content Generated Successfully',
          description: 'Your personalized learning content is ready!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          title: 'Generation Failed',
          description: 'There was an issue generating content. Please try again.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100'
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 animate-spin" />,
          title: 'Preparing...',
          description: 'Getting ready to generate content...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100'
        };
    }
  };

  const config = getStatusConfig();
  
  // Calculate elapsed time
  const getElapsedTime = () => {
    if (!startTime) return null;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed top-4 right-4 z-50 max-w-sm ${className}`}
        >
          <div className={`
            ${config.bgColor} ${config.borderColor} 
            border-2 rounded-2xl p-6 shadow-2xl backdrop-blur-sm
            relative overflow-hidden
          `}>
            {/* Close button */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 group"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
              </button>
            )}
            
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
            
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + (i % 3) * 20}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`
                  ${config.iconBg} ${config.color} 
                  p-3 rounded-xl flex-shrink-0
                `}>
                  {config.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-bold ${config.color} mb-1`}>
                    {config.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {message || config.description}
                  </p>
                </div>
              </div>

              {/* Educational fact display for processing status */}
              {status === 'processing' && (
                <div className="mb-4">
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs font-semibold text-purple-700">Did You Know?</span>
                    </div>
                    <motion.p
                      key={currentFactIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-sm text-purple-800 leading-relaxed"
                    >
                      {currentFact}
                    </motion.p>
                  </div>
                </div>
              )}

              {/* Status indicators */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className={`
                    w-2 h-2 rounded-full 
                    ${status === 'processing' ? 'bg-purple-500 animate-pulse' : 
                      status === 'checking' ? 'bg-blue-500 animate-pulse' :
                      status === 'completed' ? 'bg-green-500' : 
                      status === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                  `} />
                  <span className="text-gray-600">
                    {status === 'processing' ? 'Learning' : 
                     status === 'checking' ? 'Verifying' :
                     status === 'completed' ? 'Complete' : 
                     status === 'error' ? 'Failed' : 'Ready'}
                  </span>
                </div>
                
                {status === 'processing' && (
                  <div className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-purple-500 animate-pulse" />
                    <span className="text-gray-600">Generating Content</span>
                  </div>
                )}
                
                {status === 'checking' && (
                  <div className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-blue-500 animate-pulse" />
                    <span className="text-gray-600">Checking Database</span>
                  </div>
                )}
                
                {startTime && (status === 'processing' || status === 'triggering' || status === 'checking') && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">{getElapsedTime()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Animated border */}
            {(status === 'processing' || status === 'checking') && (
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-purple-300"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default N8NLoadingIndicator;
