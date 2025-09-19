'use client';

import React from 'react';
import { Youtube, BookOpen, Play, Loader2, Clock, Zap } from 'lucide-react';
import Image from 'next/image';
import VantaBackground from './VantaBackground';

interface LoadingPageProps {
  type?: 'modules' | 'videos' | 'webhook' | 'general';
  title?: string;
  subtitle?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  type = 'general',
  title,
  subtitle,
  progress = 0,
  showProgress = false
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'modules':
        return {
          icon: BookOpen,
          primaryColor: 'purple',
          title: title || 'Loading Learning Modules',
          subtitle: subtitle || 'Preparing your personalized learning content...',
          bgGradient: 'from-purple-500 to-purple-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          spinnerColor: 'text-purple-500'
        };
      case 'videos':
        return {
          icon: Youtube,
          primaryColor: 'red',
          title: title || 'Loading YouTube Videos',
          subtitle: subtitle || 'Fetching your learning videos from YouTube...',
          bgGradient: 'from-red-500 to-red-600',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          spinnerColor: 'text-red-500'
        };
      case 'webhook':
        return {
          icon: Zap,
          primaryColor: 'blue',
          title: title || 'Processing Request',
          subtitle: subtitle || 'Generating your personalized content, please wait...',
          bgGradient: 'from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          spinnerColor: 'text-blue-500'
        };
      default:
        return {
          icon: Loader2,
          primaryColor: 'gray',
          title: title || 'Loading',
          subtitle: subtitle || 'Please wait while we load your content...',
          bgGradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          spinnerColor: 'text-gray-500'
        };
    }
  };

  const config = getLoadingConfig();
  const Icon = config.icon;

  return (
    <VantaBackground
      className="min-h-screen flex items-center justify-center p-4"
      color="#8b5cf6"
      backgroundColor="#1e1b4b"
      maxDistance={25}
      spacing={18}
      showDots={true}
      showLines={true}
      mouseControls={true}
      touchControls={true}
      gyroControls={false}
      minHeight={200}
      minWidth={200}
      scale={1}
      scaleMobile={1}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="max-w-md w-full">
        {/* Main Loading Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Taru Logo Section */}
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Image 
                src="/icons/logo.svg" 
                alt="Taru Logo" 
                width={40} 
                height={40} 
                className="w-10 h-10"
              />
            </div>
            
            {/* Animated Spinner */}
            <div className="absolute -top-2 -right-2">
              <div className={`w-8 h-8 border-3 border-gray-200 border-t-transparent rounded-full animate-spin ${config.spinnerColor}`}></div>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {config.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {config.subtitle}
          </p>

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${config.bgGradient} h-2 rounded-full transition-all duration-300 ease-out`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Loading Animation Dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 bg-gradient-to-r ${config.bgGradient} rounded-full animate-pulse`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.4s'
                }}
              ></div>
            ))}
          </div>
        </div>

        {/* Additional Info Cards */}
        {type === 'webhook' && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>This may take up to 30 seconds to complete</span>
            </div>
          </div>
        )}

        {type === 'videos' && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Fetching latest educational content from YouTube</span>
            </div>
          </div>
        )}

        {type === 'modules' && (
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span>Personalizing your learning experience</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </VantaBackground>
  );
};

export default LoadingPage;
