'use client';

import React from 'react';
import { Youtube, BookOpen, Play, Loader2, Clock, Zap, Download } from 'lucide-react';

interface InlineLoadingProps {
  type?: 'modules' | 'videos' | 'webhook' | 'general';
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showSteps?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

const InlineLoading: React.FC<InlineLoadingProps> = ({
  type = 'general',
  title,
  subtitle,
  size = 'md',
  showSteps = false,
  currentStep = 1,
  totalSteps = 3
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'modules':
        return {
          icon: BookOpen,
          title: title || 'Loading Modules',
          subtitle: subtitle || 'Preparing your learning content...',
          bgGradient: 'from-purple-500 to-purple-600',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          spinnerColor: 'text-purple-500',
          steps: [
            'Fetching modules data',
            'Processing content',
            'Ready to learn'
          ]
        };
      case 'videos':
        return {
          icon: Youtube,
          title: title || 'Loading Videos',
          subtitle: subtitle || 'Fetching YouTube content...',
          bgGradient: 'from-red-500 to-red-600',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          spinnerColor: 'text-red-500',
          steps: [
            'Connecting to YouTube',
            'Loading video data',
            'Preparing playlist'
          ]
        };
      case 'webhook':
        return {
          icon: Zap,
          title: title || 'Processing',
          subtitle: subtitle || 'Generating content...',
          bgGradient: 'from-blue-500 to-blue-600',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          spinnerColor: 'text-blue-500',
          steps: [
            'Sending request',
            'Processing data',
            'Saving results'
          ]
        };
      default:
        return {
          icon: Loader2,
          title: title || 'Loading',
          subtitle: subtitle || 'Please wait...',
          bgGradient: 'from-gray-500 to-gray-600',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          spinnerColor: 'text-gray-500',
          steps: [
            'Initializing',
            'Loading data',
            'Almost done'
          ]
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-8',
          icon: 'w-12 h-12',
          iconContainer: 'w-16 h-16',
          title: 'text-lg',
          subtitle: 'text-sm',
          spinner: 'w-5 h-5'
        };
      case 'lg':
        return {
          container: 'py-20',
          icon: 'w-12 h-12',
          iconContainer: 'w-20 h-20',
          title: 'text-3xl',
          subtitle: 'text-lg',
          spinner: 'w-8 h-8'
        };
      default: // md
        return {
          container: 'py-16',
          icon: 'w-8 h-8',
          iconContainer: 'w-16 h-16',
          title: 'text-xl',
          subtitle: 'text-base',
          spinner: 'w-6 h-6'
        };
    }
  };

  const config = getLoadingConfig();
  const sizeClasses = getSizeClasses();
  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-center ${sizeClasses.container}`}>
      <div className="text-center max-w-md">
        {/* Icon Section */}
        <div className="relative mb-6">
          <div className={`${sizeClasses.iconContainer} ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            <Icon className={`${sizeClasses.icon} ${config.iconColor}`} />
          </div>
          
          {/* Animated Spinner */}
          <div className="absolute -top-1 -right-1">
            <Loader2 className={`${sizeClasses.spinner} animate-spin ${config.spinnerColor}`} />
          </div>
        </div>

        {/* Text Content */}
        <h3 className={`${sizeClasses.title} font-semibold text-gray-900 mb-2`}>
          {config.title}
        </h3>
        <p className={`${sizeClasses.subtitle} text-gray-600 mb-6`}>
          {config.subtitle}
        </p>

        {/* Steps Indicator */}
        {showSteps && (
          <div className="space-y-3">
            {config.steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;
              
              return (
                <div key={index} className="flex items-center gap-3 text-left">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    isCompleted 
                      ? `bg-gradient-to-r ${config.bgGradient} text-white`
                      : isActive
                      ? `border-2 border-current ${config.spinnerColor} bg-white`
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <span className={`text-sm ${
                    isActive ? 'text-gray-900 font-medium' : 'text-gray-600'
                  }`}>
                    {step}
                    {isActive && (
                      <span className="ml-2">
                        <Loader2 className="w-3 h-3 animate-spin inline" />
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading Animation Dots */}
        {!showSteps && (
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
        )}
      </div>
    </div>
  );
};

export default InlineLoading;
