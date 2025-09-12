'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, BookOpen, Youtube, Zap, Trophy, Sparkles, Clock, Loader2 } from 'lucide-react';

interface ConsistentLoadingPageProps {
  type?: 'dashboard' | 'modules' | 'videos' | 'assessment' | 'general' | 'auth' | 'webhook';
  title?: string;
  subtitle?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
  tips?: string[];
  estimatedTime?: string;
  className?: string;
}

const ConsistentLoadingPage: React.FC<ConsistentLoadingPageProps> = ({
  type = 'general',
  title,
  subtitle,
  progress = 0,
  showProgress = false,
  tips = [],
  estimatedTime,
  className = ''
}) => {
  const [currentTipIndex, setCurrentTipIndex] = React.useState(0);

  // Rotate tips every 3 seconds
  React.useEffect(() => {
    if (tips.length > 1) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [tips.length]);

  const getLoadingConfig = () => {
    switch (type) {
      case 'dashboard':
        return {
          icon: Brain,
          primaryColor: 'purple',
          title: title || 'Loading Dashboard',
          subtitle: subtitle || 'Preparing your personalized learning environment...',
          bgGradient: 'from-purple-600 via-purple-700 to-indigo-800',
          iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
          iconColor: 'text-purple-600',
          spinnerColor: 'text-purple-500',
          accentColor: 'purple-500',
          tips: tips.length > 0 ? tips : [
            'Loading your progress and achievements',
            'Preparing personalized recommendations',
            'Setting up your learning environment'
          ]
        };
      case 'modules':
        return {
          icon: BookOpen,
          primaryColor: 'purple',
          title: title || 'Loading Learning Modules',
          subtitle: subtitle || 'Preparing your personalized learning content...',
          bgGradient: 'from-purple-600 via-purple-700 to-indigo-800',
          iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
          iconColor: 'text-purple-600',
          spinnerColor: 'text-purple-500',
          accentColor: 'purple-500',
          tips: tips.length > 0 ? tips : [
            'AI is analyzing your learning preferences',
            'Customizing content difficulty for you',
            'Loading interactive elements and quizzes'
          ]
        };
      case 'videos':
        return {
          icon: Youtube,
          primaryColor: 'red',
          title: title || 'Loading YouTube Videos',
          subtitle: subtitle || 'Fetching your learning videos from YouTube...',
          bgGradient: 'from-red-600 via-red-700 to-pink-800',
          iconBg: 'bg-gradient-to-br from-red-100 to-red-200',
          iconColor: 'text-red-600',
          spinnerColor: 'text-red-500',
          accentColor: 'red-500',
          tips: tips.length > 0 ? tips : [
            'Connecting to YouTube educational channels',
            'Filtering content for your grade level',
            'Organizing videos by subject and topic'
          ]
        };
      case 'assessment':
        return {
          icon: Trophy,
          primaryColor: 'emerald',
          title: title || 'Loading Assessment',
          subtitle: subtitle || 'Preparing your diagnostic test...',
          bgGradient: 'from-emerald-600 via-green-700 to-teal-800',
          iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
          iconColor: 'text-emerald-600',
          spinnerColor: 'text-emerald-500',
          accentColor: 'emerald-500',
          tips: tips.length > 0 ? tips : [
            'Preparing personalized questions for you',
            'Calibrating difficulty to your level',
            'Setting up adaptive assessment engine'
          ]
        };
      case 'auth':
        return {
          icon: Sparkles,
          primaryColor: 'purple',
          title: title || 'Authenticating',
          subtitle: subtitle || 'Verifying your credentials...',
          bgGradient: 'from-purple-600 via-purple-700 to-indigo-800',
          iconBg: 'bg-gradient-to-br from-purple-100 to-purple-200',
          iconColor: 'text-purple-600',
          spinnerColor: 'text-purple-500',
          accentColor: 'purple-500',
          tips: tips.length > 0 ? tips : [
            'Verifying your account credentials',
            'Setting up your personalized experience',
            'Almost ready!'
          ]
        };
      case 'webhook':
        return {
          icon: Zap,
          primaryColor: 'blue',
          title: title || 'Processing Request',
          subtitle: subtitle || 'AI is generating your personalized content...',
          bgGradient: 'from-blue-600 via-blue-700 to-cyan-800',
          iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200',
          iconColor: 'text-blue-600',
          spinnerColor: 'text-blue-500',
          accentColor: 'blue-500',
          tips: tips.length > 0 ? tips : [
            'AI is analyzing your learning profile',
            'Generating personalized recommendations',
            'Optimizing content for your preferences'
          ]
        };
      default:
        return {
          icon: Sparkles,
          primaryColor: 'gray',
          title: title || 'Loading',
          subtitle: subtitle || 'Please wait while we prepare everything for you...',
          bgGradient: 'from-gray-600 via-gray-700 to-slate-800',
          iconBg: 'bg-gradient-to-br from-gray-100 to-gray-200',
          iconColor: 'text-gray-600',
          spinnerColor: 'text-gray-500',
          accentColor: 'gray-500',
          tips: tips.length > 0 ? tips : [
            'Setting up your experience',
            'Loading content and resources',
            'Almost ready!'
          ]
        };
    }
  };

  const config = getLoadingConfig();
  const Icon = config.icon;

  return (
    <motion.main 
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${config.bgGradient} p-4 relative overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800)],
              x: [null, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200)],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="max-w-md w-full relative z-10">
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center border border-white/20"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Icon Section */}
          <div className="relative mb-6">
            <motion.div
              className={`w-20 h-20 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30`}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Icon className={`w-10 h-10 ${config.iconColor}`} />
            </motion.div>
            
            {/* Animated Spinner Ring */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className={`w-24 h-24 border-4 border-white/30 border-t-${config.accentColor} rounded-full`}></div>
            </motion.div>

            {/* Pulsing Ring */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className={`w-28 h-28 border-2 border-${config.accentColor}/30 rounded-full`}></div>
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.h2
            className="text-2xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            {config.title}
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {config.subtitle}
          </motion.p>

          {/* Progress Bar */}
          {showProgress && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`bg-gradient-to-r ${config.bgGradient} h-3 rounded-full relative`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Tips Section */}
          {config.tips.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-700">Did you know?</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentTipIndex}
                    className="text-sm text-gray-700"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {config.tips[currentTipIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Estimated Time */}
          {estimatedTime && (
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Clock className="w-4 h-4" />
              <span>Estimated time: {estimatedTime}</span>
            </motion.div>
          )}

          {/* Loading Steps */}
          <motion.div
            className="space-y-3 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {[
              { text: 'Loading your progress', delay: 0 },
              { text: 'Preparing recommendations', delay: 1 },
              { text: 'Setting up dashboard', delay: 2 }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay, duration: 0.5 }}
              >
                <motion.div
                  className={`w-2 h-2 bg-${config.accentColor} rounded-full`}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: step.delay,
                  }}
                />
                <span className="text-sm text-gray-600">{step.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Loading Dots */}
          <motion.div
            className="flex justify-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-3 h-3 bg-gradient-to-r ${config.bgGradient} rounded-full`}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default ConsistentLoadingPage;
