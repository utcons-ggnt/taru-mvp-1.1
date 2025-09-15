'use client';

import React, { useState, useEffect } from 'react';
import { Play, Clock, BookOpen, Award, Check, Pause } from 'lucide-react';
import InlineLoading from './InlineLoading';

interface Chapter {
  chapterKey: string;
  videoTitle: string;
  videoUrl: string;
}

interface Module {
  chapters: Chapter[];
}

interface YouTubeData {
  uniqueid: string;
  modules: Module[];
  createdAt: string;
  updatedAt: string;
}

interface YouTubeModulesGridProps {
  uniqueid: string;
  onModuleSelect?: (moduleIndex: number) => void;
  onVideoSelect?: (videoUrl: string, videoTitle: string) => void;
}

const YouTubeModulesGrid: React.FC<YouTubeModulesGridProps> = ({
  uniqueid,
  onModuleSelect,
  onVideoSelect
}) => {
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    fetchYouTubeData();
  }, [uniqueid]);

  const fetchYouTubeData = async (isRetry = false) => {
    if (!uniqueid || uniqueid === 'default') {
      setLoading(false);
      setError('No uniqueId available');
      return;
    }
    
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }
    
    try {
      console.log('🔍 YouTubeModulesGrid: Fetching data for uniqueid:', uniqueid);
      const response = await fetch(`/api/youtube-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      console.log('📊 YouTubeModulesGrid: API response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          // Show fallback content while scraper is processing
          setShowFallback(true);
          setError('Scraper is processing your content. Showing fallback modules while we wait...');
          startPolling();
          return;
        } else {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('📊 YouTubeModulesGrid: API response data:', data);
      
      if (data.success && data.data) {
        // Check if this is real data or fallback
        if (data.isFallback) {
          setShowFallback(true);
          setError('Using fallback content while scraper processes your personalized modules...');
          startPolling();
        } else {
          // Real data received, stop polling and show real content
          setYoutubeData(data.data);
          setShowFallback(false);
          setIsPolling(false);
          setError(null);
        }
      } else {
        setError(data.message || 'No video data available');
      }
    } catch (err) {
      console.error('❌ YouTubeModulesGrid: Error fetching YouTube data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch YouTube data');
      setShowFallback(true);
    } finally {
      if (!isRetry) {
        setLoading(false);
      }
    }
  };

  const startPolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    console.log('🔄 YouTubeModulesGrid: Starting polling for real data...');
    
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/youtube-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && !data.isFallback) {
            // Real data is now available
            console.log('✅ YouTubeModulesGrid: Real data received, stopping polling');
            setYoutubeData(data.data);
            setShowFallback(false);
            setIsPolling(false);
            setError(null);
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.warn('⚠️ YouTubeModulesGrid: Polling error:', err);
      }
    }, 5000); // Poll every 5 seconds

    // Stop polling after 5 minutes
    setTimeout(() => {
      if (isPolling) {
        console.log('⏰ YouTubeModulesGrid: Polling timeout, keeping fallback content');
        setIsPolling(false);
        clearInterval(pollInterval);
      }
    }, 300000); // 5 minutes
  };

  const handleModuleClick = (moduleIndex: number) => {
    if (onModuleSelect) {
      onModuleSelect(moduleIndex);
    }
  };

  const getTotalVideos = (module: Module): number => {
    return module.chapters.length;
  };

  const getModuleDuration = (module: Module): string => {
    // Estimate duration based on number of videos (assuming 10-15 min per video)
    const estimatedMinutes = module.chapters.length * 12;
    if (estimatedMinutes < 60) {
      return `${estimatedMinutes} min`;
    }
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = estimatedMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getModuleStatus = (moduleIndex: number): 'completed' | 'in-progress' | 'pending' => {
    // This would normally come from user progress data
    // For now, we'll simulate some statuses
    if (moduleIndex === 0) return 'in-progress';
    if (moduleIndex === 1) return 'completed';
    return 'pending';
  };

  const getModuleSubject = (moduleIndex: number): string => {
    const subjects = ['Math', 'Science', 'Economics', 'Art', 'Logic', 'Language'];
    return subjects[moduleIndex % subjects.length];
  };

  const getModuleXP = (module: Module): number => {
    // Calculate XP based on video count (20 XP per video)
    return module.chapters.length * 20;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <InlineLoading
          type="modules"
          title="Loading YouTube Modules"
          subtitle="Preparing your personalized learning modules..."
          size="md"
          showSteps={true}
          currentStep={2}
          totalSteps={3}
        />
        
        {/* Skeleton Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#F5F5F5] rounded-[16.7px] h-[229px] animate-pulse">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mt-1"></div>
                  </div>
                  <div className="h-6 bg-purple-200 rounded-full w-16"></div>
                </div>
                
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-6 bg-green-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <div className="h-11 bg-purple-200 rounded-[53px] flex-1"></div>
                  <div className="h-11 w-12 bg-gray-200 rounded-[53px]"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isPolling ? 'Processing Your Content...' : 'Unable to Load YouTube Modules'}
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        
        {isPolling && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <p className="text-sm text-gray-600">
              Checking for your personalized content every 5 seconds...
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <button
            onClick={() => {
              // Reset error state and try fetching again
              setError(null);
              fetchYouTubeData();
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium mr-3"
          >
            {isPolling ? 'Check Now' : 'Try Again'}
          </button>
          <div className="text-sm text-gray-500">
            {isPolling 
              ? 'We\'re processing your personalized learning modules. This may take a few minutes.'
              : 'If the problem persists, try clicking "Browse Learning Modules" first to generate videos.'
            }
          </div>
        </div>
      </div>
    );
  }

  if (!youtubeData || youtubeData.modules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Play className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No YouTube Modules Available</h3>
        <p className="text-gray-600 mb-4">
          No learning modules found for this user. The system will show fallback content instead.
        </p>
        <div className="text-sm text-gray-500 mb-4">
          Fallback modules are being loaded to ensure you have content to learn from.
        </div>
        <button
          onClick={() => {
            // Reset error state and try fetching again
            setError(null);
            fetchYouTubeData();
          }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* YouTube Modules Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[22.28px] font-bold text-black">YouTube Learning Modules</h2>
        <div className="text-sm text-gray-500">
          {youtubeData.modules.length} modules • {youtubeData.modules.reduce((sum, module) => sum + getTotalVideos(module), 0)} videos
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {youtubeData.modules.map((module, index) => {
          const status = getModuleStatus(index);
          const subject = getModuleSubject(index);
          const xp = getModuleXP(module);
          const duration = getModuleDuration(module);
          const videoCount = getTotalVideos(module);

          return (
            <div
              key={index}
              className="bg-[#F5F5F5] rounded-[16.7px] cursor-pointer hover:shadow-lg transition-all duration-200 group"
              onClick={() => handleModuleClick(index)}
            >
              <div className="p-6 space-y-4">
                {/* Module Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-[20.05px] font-bold text-black mb-2">
                      {subject} Module {index + 1}
                    </h3>
                    <p className="text-[11.14px] text-[#878787] leading-[18px]">
                      Explore interactive YouTube videos and learn through engaging content with hands-on activities!
                    </p>
                  </div>
                  
                  {/* XP Badge */}
                  <div className="bg-[#6D18CE] rounded-[111.4px] px-3 py-1 ml-4">
                    <span className="text-[10.45px] font-medium text-white">{xp} XP</span>
                  </div>
                </div>

                {/* Module Tags */}
                <div className="flex flex-wrap gap-2">
                  {/* Duration */}
                  <div className="bg-white rounded-[111.4px] px-3 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#787878]" />
                    <span className="text-[10.45px] font-medium text-[#787878]">{duration}</span>
                  </div>
                  
                  {/* Video Count */}
                  <div className="bg-[#00A679] rounded-[111.4px] px-3 py-1 flex items-center gap-1">
                    <Play className="w-3 h-3 text-white" />
                    <span className="text-[10.45px] font-medium text-white">{videoCount} Videos</span>
                  </div>
                  
                  {/* Badge */}
                  <div className="bg-white rounded-[111.4px] px-3 py-1 flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#787878]" />
                    <span className="text-[10.45px] font-medium text-[#787878]">YouTube Badge</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    className="flex-1 border border-[#6D18CE] rounded-[53.08px] py-3 px-6 text-[15.92px] font-medium text-[#6D18CE] hover:bg-[#6D18CE] hover:text-white transition-colors group-hover:bg-[#6D18CE] group-hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleModuleClick(index);
                    }}
                  >
                    🎥️ Start Learning
                  </button>
                  
                  {/* Status Icon */}
                  <div className={`w-[46.79px] h-[45.67px] rounded-[53.08px] flex items-center justify-center ${
                    status === 'completed' 
                      ? 'bg-[#00A679]' 
                      : status === 'in-progress'
                      ? 'bg-[#EEEDFF]'
                      : 'bg-white'
                  }`}>
                    {status === 'completed' && <Check className="w-6 h-6 text-white" />}
                    {status === 'in-progress' && <Pause className="w-6 h-6 text-[#4744FF]" />}
                    {status === 'pending' && <Play className="w-6 h-6 text-[#6D18CE]" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">YouTube Learning Content</h4>
            <p className="text-sm text-blue-700">Personalized video modules for enhanced learning</p>
          </div>
        </div>
        <div className="text-xs text-blue-600">
          Last updated: {new Date(youtubeData.updatedAt).toLocaleDateString()} • User ID: {youtubeData.uniqueid}
        </div>
      </div>
    </div>
  );
};

export default YouTubeModulesGrid;
