'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'profile' | 'dashboard' | 'module' | 'video';
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = ''
}) => {
  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { x: '100%' },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  const SkeletonBox = ({ width, height, className: boxClassName = '' }: { 
    width?: string; 
    height?: string; 
    className?: string; 
  }) => (
    <div 
      className={`relative overflow-hidden bg-gray-200 rounded ${boxClassName}`}
      style={{ width, height }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        variants={shimmerVariants}
        initial="initial"
        animate="animate"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear" as const
        }}
      />
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <SkeletonBox width="60px" height="60px" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox height="20px" className="w-3/4" />
          <SkeletonBox height="16px" className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBox height="16px" />
        <SkeletonBox height="16px" />
        <SkeletonBox height="16px" className="w-4/5" />
      </div>
      <div className="flex justify-between items-center">
        <SkeletonBox width="80px" height="32px" className="rounded-lg" />
        <SkeletonBox width="100px" height="32px" className="rounded-lg" />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center space-x-4">
        <SkeletonBox width="48px" height="48px" className="rounded-full" />
        <div className="flex-1 space-y-2">
          <SkeletonBox height="18px" className="w-2/3" />
          <SkeletonBox height="14px" className="w-1/2" />
        </div>
        <SkeletonBox width="24px" height="24px" className="rounded" />
      </div>
    </div>
  );

  const renderProfileSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex flex-col items-center space-y-4">
        <SkeletonBox width="120px" height="120px" className="rounded-full" />
        <div className="text-center space-y-2">
          <SkeletonBox height="24px" className="w-32 mx-auto" />
          <SkeletonBox height="16px" className="w-24 mx-auto" />
        </div>
        <div className="w-full space-y-3">
          <SkeletonBox height="16px" />
          <SkeletonBox height="16px" className="w-4/5" />
          <SkeletonBox height="16px" className="w-3/5" />
        </div>
        <div className="flex space-x-3">
          <SkeletonBox width="100px" height="36px" className="rounded-lg" />
          <SkeletonBox width="100px" height="36px" className="rounded-lg" />
        </div>
      </div>
    </div>
  );

  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SkeletonBox width="80px" height="80px" className="rounded-full" />
            <div className="space-y-2">
              <SkeletonBox height="28px" className="w-48" />
              <SkeletonBox height="16px" className="w-32" />
            </div>
          </div>
          <div className="flex space-x-4">
            <SkeletonBox width="120px" height="80px" className="rounded-xl" />
            <SkeletonBox width="120px" height="80px" className="rounded-xl" />
            <SkeletonBox width="120px" height="80px" className="rounded-xl" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonBox height="16px" className="w-24" />
                <SkeletonBox height="32px" className="w-16" />
              </div>
              <SkeletonBox width="48px" height="48px" className="rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <SkeletonBox height="24px" className="w-1/3" />
              <div className="space-y-2">
                <SkeletonBox height="16px" />
                <SkeletonBox height="16px" className="w-4/5" />
                <SkeletonBox height="16px" className="w-3/5" />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center space-x-3">
                <SkeletonBox width="40px" height="40px" className="rounded-lg" />
                <div className="flex-1 space-y-1">
                  <SkeletonBox height="16px" className="w-3/4" />
                  <SkeletonBox height="12px" className="w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderModuleSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <SkeletonBox height="200px" className="w-full" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBox height="20px" className="w-2/3" />
          <SkeletonBox width="60px" height="24px" className="rounded-full" />
        </div>
        <div className="space-y-2">
          <SkeletonBox height="16px" />
          <SkeletonBox height="16px" className="w-4/5" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SkeletonBox width="20px" height="20px" className="rounded" />
            <SkeletonBox height="14px" className="w-16" />
          </div>
          <SkeletonBox width="80px" height="32px" className="rounded-lg" />
        </div>
      </div>
    </div>
  );

  const renderVideoSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="relative">
        <SkeletonBox height="180px" className="w-full" />
        <div className="absolute bottom-2 right-2">
          <SkeletonBox width="40px" height="20px" className="rounded" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <SkeletonBox height="18px" className="w-5/6" />
        <div className="flex items-center space-x-2">
          <SkeletonBox width="32px" height="32px" className="rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBox height="14px" className="w-1/2" />
            <SkeletonBox height="12px" className="w-1/3" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'profile':
        return renderProfileSkeleton();
      case 'dashboard':
        return renderDashboardSkeleton();
      case 'module':
        return renderModuleSkeleton();
      case 'video':
        return renderVideoSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (variant === 'dashboard') {
    return (
      <motion.div
        className={`animate-pulse ${className}`}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {renderSkeleton()}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`space-y-4 ${className}`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[...Array(count)].map((_, index) => (
        <motion.div
          key={index}
          className="animate-pulse"
          variants={itemVariants}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default SkeletonLoader;
