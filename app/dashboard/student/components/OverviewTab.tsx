'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Zap, Play, ChevronRight, Star, Clock, Users, Briefcase, Youtube } from 'lucide-react';
import { useRouter } from 'next/navigation';
import YouTubeVideoList from '../../../components/YouTubeVideoList';
import YouTubeModulesGrid from '../../../components/YouTubeModulesGrid';
import InlineLoading from '../../../components/InlineLoading';

interface YouTubeData {
  _id: string;
  uniqueid: string;
  chapters: Array<{
    chapterIndex: number;
    chapterKey: string;
    videoTitle: string;
    videoUrl: string;
  }>;
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
}

interface OverviewTabProps {
  courses: any[];
  tests: any[];
  onTabChange: (tab: string) => void;
  dashboardData?: {
    overview?: {
      totalXp?: number;
      totalModules?: number;
      studentKey?: string;
    };
    progress?: {
      badgesEarned?: Array<{
        name: string;
        description: string;
        earnedAt: string;
      }>;
    };
  };
  user?: {
    uniqueId?: string;
  };
  youtubeData?: YouTubeData | null;
  youtubeLoading?: boolean;
  onTriggerYouTubeScrapping?: () => Promise<void>;
}

export default function OverviewTab({ 
  courses, 
  tests: _tests, 
  onTabChange, 
  dashboardData, 
  user, 
  youtubeData, 
  youtubeLoading, 
  onTriggerYouTubeScrapping 
}: OverviewTabProps) {
  const router = useRouter();
  const [showYouTubeVideos, setShowYouTubeVideos] = React.useState(false);
  const [showYouTubeModules, setShowYouTubeModules] = React.useState(false);
  const [isProcessingWebhook, setIsProcessingWebhook] = React.useState(false);
  const [processingStatus, setProcessingStatus] = React.useState('');
  
  // Handle video selection
  const handleVideoSelect = (videoUrl: string, videoTitle: string) => {
    console.log('Video selected:', { videoUrl, videoTitle });
    window.open(videoUrl, '_blank');
  };

  // Handle triggering webhook for current student
  const handleTriggerCurrentStudentWebhook = async () => {
    console.log('🚀 Triggering webhook for current student...');
    
    if (onTriggerYouTubeScrapping) {
      setIsProcessingWebhook(true);
      setProcessingStatus('Triggering YouTube content generation...');
      
      try {
        await onTriggerYouTubeScrapping();
        setProcessingStatus('YouTube content generation started! Please check back in a few minutes.');
      } catch (error) {
        console.error('❌ Error triggering webhook:', error);
        setProcessingStatus('Error: Failed to trigger content generation');
      } finally {
        setIsProcessingWebhook(false);
      }
    }
  };

  // Handle back to overview
  const handleBackToOverview = () => {
    setShowYouTubeVideos(false);
    setShowYouTubeModules(false);
    setIsProcessingWebhook(false);
  };

  const handleBackToOverviewFromGrid = () => {
    setShowYouTubeModules(false);
  };

  const handleModuleSelect = (moduleIndex: number) => {
    // When a module is selected from the grid, show the video list for that module
    setShowYouTubeModules(false);
    setShowYouTubeVideos(true);
  };
  
  // Call YouTube Link Scrapper webhook when Browse Modules is clicked
  const handleBrowseModulesClick = async () => {
    console.log('🔍 Browse Modules clicked - User data:', user, 'Dashboard data:', dashboardData);
    
    try {
      // Try to get current student's unique ID first
      let uniqueId = user?.uniqueId || dashboardData?.overview?.studentKey;
      
      // If no uniqueId available, try to fetch it from the current student API
      if (!uniqueId) {
        console.log('🔍 No uniqueId available, fetching current student data...');
        try {
          const studentResponse = await fetch('/api/student/profile');
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            uniqueId = studentData.uniqueId;
            console.log('✅ Got uniqueId from student profile:', uniqueId);
          }
        } catch (error) {
          console.error('❌ Error fetching student profile:', error);
        }
      }
      
      // Use fallback if still no uniqueId
      if (!uniqueId) {
        uniqueId = 'default';
        console.warn('⚠️ Using fallback uniqueId:', uniqueId);
      } else {
        console.log('✅ Using current student uniqueId:', uniqueId);
      }
      
      console.log('🔄 Triggering YouTube scrapper via API for uniqueId:', uniqueId);
      setProcessingStatus('Triggering video processing...');
      
      // Show processing state
      setIsProcessingWebhook(true);
      
      // Step 1: Call our API route which will trigger the N8N webhook
      const apiResponse = await fetch('/api/webhook/trigger-youtube-scrapper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uniqueid: uniqueId })
      });

      console.log('📡 API response status:', apiResponse.status);

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        console.error('❌ API error response:', errorData);
        
        // Check if N8N workflow is inactive
        if (errorData.n8nWorkflowInactive) {
          throw new Error(`N8N Workflow Issue: ${errorData.message}`);
        } else {
          throw new Error(`API failed: ${apiResponse.status} - ${errorData.message}`);
        }
      }

      const apiResult = await apiResponse.json();
      console.log('✅ Webhook triggered successfully via API:', apiResult);
      setProcessingStatus('Video processing started, waiting for completion...');
      
      // Step 2: Poll the database until videos are saved
      const maxAttempts = 120; // 120 attempts = 2 minutes max
      let attempts = 0;
      let videosFound = false;

      while (attempts < maxAttempts && !videosFound) {
        attempts++;
        console.log(`🔄 Checking for videos (attempt ${attempts}/${maxAttempts})...`);
        setProcessingStatus(`Checking for videos... (${attempts}/${maxAttempts}) - ${Math.floor(attempts / 60)}:${(attempts % 60).toString().padStart(2, '0')} elapsed`);
        
        // Wait 1 second before checking
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        try {
          // Fetch videos from our API
          const apiUrl = `/api/youtube-data?uniqueid=${encodeURIComponent(uniqueId)}`;
          console.log('🔍 Fetching from API:', apiUrl);
          
          const videosResponse = await fetch(apiUrl);
          console.log('📊 API response status:', videosResponse.status);
          
          if (videosResponse.ok) {
            const videosResult = await videosResponse.json();
            console.log('📊 API response data:', videosResult);
            
            if (videosResult.success && videosResult.data && videosResult.data.modules && videosResult.data.modules.length > 0) {
              console.log('✅ Videos found in database:', videosResult.data);
              videosFound = true;
            } else {
              console.log('⏳ No videos yet, continuing to poll...');
            }
          } else {
            console.warn(`⚠️ API request failed with status: ${videosResponse.status}`);
          }
        } catch (fetchError) {
          console.warn(`⚠️ Error fetching videos (attempt ${attempts}):`, fetchError);
        }
      }

      if (videosFound) {
        console.log('✅ Successfully loaded videos from database');
        setProcessingStatus('Videos loaded successfully!');
        setShowYouTubeModules(true);
      } else {
        console.warn('⚠️ No videos found after maximum attempts, showing empty grid');
        setProcessingStatus('No videos found, showing empty grid');
        setShowYouTubeModules(true);
      }
      
    } catch (error) {
      console.error('❌ Error in webhook process:', error);
      // Still show modules grid even if webhook fails
      setShowYouTubeModules(true);
    } finally {
      setIsProcessingWebhook(false);
      setProcessingStatus('');
    }
  };

  if (showYouTubeModules) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Youtube className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">YouTube Learning Modules</h2>
                <p className="text-red-100">Choose a module to start your learning journey</p>
              </div>
            </div>
            <button
              onClick={handleBackToOverviewFromGrid}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
        <YouTubeModulesGrid
          uniqueid={user?.uniqueId || dashboardData?.overview?.studentKey || 'default'}
          onModuleSelect={handleModuleSelect}
          onVideoSelect={handleVideoSelect}
        />
      </motion.div>
    );
  }

  if (showYouTubeVideos) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Play className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Learning Videos</h2>
                <p className="text-blue-100">Select a video to start learning</p>
              </div>
            </div>
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
            >
              ← Back to Modules
            </button>
          </div>
        </div>
        <YouTubeVideoList
          uniqueid={user?.uniqueId || dashboardData?.overview?.studentKey || 'default'}
          onVideoSelect={handleVideoSelect}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Your Learning Dashboard</h1>
            <p className="text-blue-100 text-lg">Access your personalized YouTube learning content</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Browse Modules */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBrowseModulesClick}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Browse Modules</h3>
              <p className="text-gray-600 dark:text-gray-400">Explore learning modules</p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Discover educational content organized into modules with multiple videos covering different topics.
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isProcessingWebhook ? 'Loading...' : 'Click to explore'}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>

        {/* View All Videos */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowYouTubeVideos(true)}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Play className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">All Videos</h3>
              <p className="text-gray-600 dark:text-gray-400">View all available videos</p>
            </div>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Access all your learning videos in one place and continue your learning journey.
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">Click to view</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </motion.div>

        {/* Learning Progress */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">Track your learning</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Videos Watched</span>
              <span className="font-medium text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Modules Completed</span>
              <span className="font-medium text-gray-900 dark:text-white">0</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total XP</span>
              <span className="font-medium text-gray-900 dark:text-white">{dashboardData?.overview?.totalXp || 0}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Recent Activity</h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start watching videos to see your learning activity here.
          </p>
          <button
            onClick={handleBrowseModulesClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Start Learning
          </button>
        </div>
      </div>

      {/* Debug Section - Current Student Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 mt-6">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">Current Student Debug Info</h4>
          <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1 mb-3">
            <p>User: {user ? 'Loaded' : 'Not loaded'}</p>
            <p>UniqueId: {user?.uniqueId || 'Not available'}</p>
            <p>Dashboard StudentKey: {dashboardData?.overview?.studentKey || 'Not available'}</p>
            <p>Processing: {isProcessingWebhook ? 'Yes' : 'No'}</p>
            <p>YouTube Data: {youtubeData ? 'Available' : 'Not available'}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBrowseModulesClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              Browse Modules (Current Student)
            </button>
            <button
              onClick={handleTriggerCurrentStudentWebhook}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
            >
              Trigger Webhook (Current Student)
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}