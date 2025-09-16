'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Database,
  Cpu
} from 'lucide-react';

interface N8NLoadingIndicatorProps {
  isVisible: boolean;
  status: 'idle' | 'triggering' | 'processing' | 'completed' | 'error';
  message?: string;
  progress?: number;
  className?: string;
}

const N8NLoadingIndicator: React.FC<N8NLoadingIndicatorProps> = ({
  isVisible,
  status,
  message,
  progress = 0,
  className = ''
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'triggering':
        return {
          icon: <Zap className="w-6 h-6" />,
          title: 'Triggering N8N Workflow',
          description: 'Starting YouTube content generation...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100'
        };
      case 'processing':
        return {
          icon: <Cpu className="w-6 h-6 animate-pulse" />,
          title: 'N8N is Generating Content',
          description: 'AI is finding and processing YouTube videos for you...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100'
        };
      case 'completed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          title: 'Content Generated Successfully',
          description: 'YouTube videos are ready for you to explore!',
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

              {/* Progress bar for processing status */}
              {status === 'processing' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Processing
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="w-full bg-white/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Status indicators */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className={`
                    w-2 h-2 rounded-full 
                    ${status === 'processing' ? 'bg-purple-500 animate-pulse' : 
                      status === 'completed' ? 'bg-green-500' : 
                      status === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                  `} />
                  <span className="text-gray-600">
                    {status === 'processing' ? 'N8N Active' : 
                     status === 'completed' ? 'Complete' : 
                     status === 'error' ? 'Failed' : 'Ready'}
                  </span>
                </div>
                
                {status === 'processing' && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
                    <span className="text-gray-600">AI Working</span>
                  </div>
                )}
              </div>
            </div>

            {/* Animated border */}
            {status === 'processing' && (
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
