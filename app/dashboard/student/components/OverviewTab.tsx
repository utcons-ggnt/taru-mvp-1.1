'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Zap, Play, ChevronRight, Star, Clock, Users, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { N8NCacheService } from '@/lib/N8NCacheService';
import YouTubeVideoList from '../../../components/YouTubeVideoList';
import YouTubeModulesGrid from '../../../components/YouTubeModulesGrid';
import InlineLoading from '../../../components/InlineLoading';

interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
  icon: string; // Added icon property
  progress: number; // Added progress property
}

interface Test {
  title: string;
  date: string;
  color: string;
}

interface OverviewTabProps {
  courses: Course[];
  tests: Test[];
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
}

export default function OverviewTab({ courses, tests: _tests, onTabChange, dashboardData, user }: OverviewTabProps) {
  const router = useRouter();
  const [showYouTubeVideos, setShowYouTubeVideos] = React.useState(false);
  const [showYouTubeModules, setShowYouTubeModules] = React.useState(false);
  const [isProcessingWebhook, setIsProcessingWebhook] = React.useState(false);
  
  // Handle video selection
  const handleVideoSelect = (videoUrl: string, videoTitle: string) => {
    console.log('Video selected:', { videoUrl, videoTitle });
    window.open(videoUrl, '_blank');
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
      const uniqueId = user?.uniqueId || dashboardData?.overview?.studentKey || 'unknown';
      console.log('🔍 Resolved uniqueId:', uniqueId);
      
      if (uniqueId !== 'unknown') {
        console.log('🔄 Calling YouTube Link Scrapper webhook for uniqueId:', uniqueId);
        
        // Show processing state
        setIsProcessingWebhook(true);
        
        // Call our server-side API instead of calling the webhook directly
        const response = await fetch('/api/webhook/youtube-link-scrapper', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uniqueid: uniqueId })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ YouTube Link Scrapper webhook called successfully, result:', result);
          
          // If YouTube data is available, show YouTube modules grid
          if (result.youtubeData) {
            console.log('🎬 YouTube data available, showing modules grid');
            setShowYouTubeModules(true);
          } else {
            console.log('⏳ YouTube data not ready yet, switching to modules tab');
            onTabChange('modules');
          }
        } else {
          const errorData = await response.json();
          console.error('❌ Webhook API call failed:', errorData);
          // Still switch to modules tab as fallback
          onTabChange('modules');
        }
      } else {
        console.warn('⚠️ No uniqueId available for webhook call');
      }
    } catch (error) {
      console.error('❌ Error calling YouTube Link Scrapper webhook:', error);
      // Don't block the UI, just log the error
    } finally {
      setIsProcessingWebhook(false);
    }
    
    // Switch to modules tab regardless of webhook success/failure
    onTabChange('modules');
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  if (isProcessingWebhook) {
    return (
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <InlineLoading
          type="webhook"
          title="Generating YouTube Content"
          subtitle="Processing your request and fetching personalized learning modules..."
          size="lg"
          showSteps={true}
          currentStep={2}
          totalSteps={3}
        />
        
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Processing Your Request</h3>
              <p className="text-sm text-blue-700">This may take up to 30 seconds to complete</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Analyzing your profile</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Fetching YouTube content</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Personalizing modules</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

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
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
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
          uniqueid={user?.uniqueId || dashboardData?.overview?.studentKey || ''}
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
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">YouTube Learning Videos</h2>
                <p className="text-red-100">Personalized content for your learning journey</p>
              </div>
            </div>
            <button
              onClick={handleBackToOverview}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 font-medium"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
        <YouTubeVideoList
          uniqueid={user?.uniqueId || dashboardData?.overview?.studentKey || ''}
          onVideoSelect={handleVideoSelect}
        />
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Today's Progress Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        variants={sectionVariants}
      >
        {/* Header with divider */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Today's progress</h3>
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="text-gray-600 text-lg">
              {courses.length > 0 ? Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length) : 0}% Complete - Keep going! 🚀
            </span>
          </div>
        </div>
        
                {/* Progress Train */}
        <div className="flex justify-center items-center w-full overflow-hidden relative">
          {/* Moving Train */}
          <motion.div 
            className="relative w-full"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 500,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <img 
              src="/studentDashboard/train.png" 
              alt="Progress Train" 
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Continue Learning Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        variants={sectionVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Continue Learning</h3>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                variants={cardVariants}
              >
                <div className="mb-4">
                  {/* Placeholder for course image */}
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2 text-gray-500 font-bold">{course.title.charAt(0).toUpperCase()}</div>
                      <div className="text-sm text-gray-600">{course.title}</div>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{course.duration}</span>
                  <span className="font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">{course.xp}</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700">{course.lessonsCompleted} Complete - Keep going!</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400 font-bold">B</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No courses available</h4>
            <p className="text-gray-600 mb-4">Start your learning journey by exploring available modules</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleBrowseModulesClick}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                Browse Modules
              </button>
              {user?.uniqueId && (
                <button
                  onClick={() => setShowYouTubeModules(true)}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  View YouTube Modules
                </button>
              )}
            </div>
          </div>
        )}

        {/* Learn More Button */}
        {courses.length > 0 && (
          <div className="text-center mt-8">
            <button 
              onClick={handleBrowseModulesClick}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <BookOpen className="w-5 h-5" />
              Learn more
            </button>
          </div>
        )}
      </motion.div>

      {/* Career Exploration Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6"
        variants={sectionVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Career Exploration</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover your future career path</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Personalized Career Options</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get career recommendations based on your interests and skills
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Detailed Learning Paths</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore comprehensive learning modules for your chosen career
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => router.push('/career-exploration')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg flex items-center gap-2 mx-auto"
          >
            <Briefcase className="w-5 h-5" />
            Explore Careers
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 