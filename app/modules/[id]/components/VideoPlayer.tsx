'use client';

import React, { useState, useRef, useEffect } from 'react';
import { VideoData } from '../types';
import { ClientN8NService } from '../services/ClientN8NService';
import { TranscriptService } from '../services/TranscriptService';

interface VideoPlayerProps {
  videoData?: VideoData;
  moduleId?: string;
  onVideoLoad?: (videoData: VideoData) => void;
  onTimeUpdate?: (currentTime: number) => void;
  onProgress?: (progress: number) => void;
  className?: string;
}

export default function VideoPlayer({
  videoData,
  moduleId,
  onVideoLoad,
  onTimeUpdate,
  onProgress,
  className = ''
}: VideoPlayerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [engagementData, setEngagementData] = useState({
    totalWatchTime: 0,
    playCount: 0,
    pauseCount: 0,
    seekCount: 0,
    lastInteraction: new Date()
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const n8nService = new ClientN8NService();
  const transcriptService = new TranscriptService();

  // Default demo video data if no videoData provided
  const defaultVideoData: VideoData = {
    id: 'demo-1',
    title: 'Introduction to Machine Learning',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: 1800,
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
  };

  const activeVideoData = videoData || defaultVideoData;

  useEffect(() => {
    // Set video URL from props or default
    setVideoUrl(activeVideoData.url);
    if (onVideoLoad) {
      onVideoLoad(activeVideoData);
    }
    
    // Send video start analytics to N8N
    sendVideoAnalytics('video_started', {
      videoId: activeVideoData.id,
      videoTitle: activeVideoData.title,
      moduleId: moduleId || 'unknown',
      timestamp: new Date().toISOString()
    });
  }, [activeVideoData, onVideoLoad, moduleId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime);
      }
      
      // Update progress
      if (duration > 0 && onProgress) {
        const progress = (video.currentTime / duration) * 100;
        onProgress(progress);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      
      // Send video loaded analytics
      sendVideoAnalytics('video_loaded', {
        videoId: activeVideoData.id,
        duration: video.duration,
        moduleId: moduleId || 'unknown',
        timestamp: new Date().toISOString()
      });
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setEngagementData(prev => ({
        ...prev,
        playCount: prev.playCount + 1,
        lastInteraction: new Date()
      }));
      
      // Send play analytics
      sendVideoAnalytics('video_play', {
        videoId: activeVideoData.id,
        currentTime: video.currentTime,
        moduleId: moduleId || 'unknown',
        timestamp: new Date().toISOString()
      });
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      setEngagementData(prev => ({
        ...prev,
        pauseCount: prev.pauseCount + 1,
        lastInteraction: new Date()
      }));
      
      // Send pause analytics
      sendVideoAnalytics('video_pause', {
        videoId: activeVideoData.id,
        currentTime: video.currentTime,
        totalWatchTime: engagementData.totalWatchTime,
        moduleId: moduleId || 'unknown',
        timestamp: new Date().toISOString()
      });
    };
    
    const handleLoadStart = () => setIsLoading(true);
    const handleError = () => setError('Failed to load video');

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('error', handleError);
    };
  }, [onTimeUpdate, onProgress, duration, activeVideoData.id, moduleId, engagementData.totalWatchTime]);

  // Track watch time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setEngagementData(prev => ({
          ...prev,
          totalWatchTime: prev.totalWatchTime + 1
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying]);

  const sendVideoAnalytics = async (event: string, data: any) => {
    try {
      const payload = {
        event,
        data,
        sessionId: `session_${Date.now()}`,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      // Send to N8N webhook for analytics
      await n8nService.generateResponse(
        `Video Analytics: ${event}`,
        {
          pdfContent: '',
          videoData: activeVideoData,
          currentTime: currentTime,
          selectedText: '',
          bookmarks: []
        },
        'general'
      );

      // If we have moduleId, also send transcript data to N8N
      if (moduleId) {
        try {
          const transcriptData = await transcriptService.getTranscript(moduleId, activeVideoData);
          if (transcriptData) {
            const currentSegment = transcriptService.getTranscriptSegmentAtTime(transcriptData, currentTime);
            
            await n8nService.sendTranscriptData(moduleId, activeVideoData, transcriptData, {
              action: 'video_analytics',
              userInteraction: event,
              currentTime: currentTime,
              selectedText: currentSegment?.text || '',
              segmentId: currentSegment?.id || '',
              analyticsData: payload
            });
          }
        } catch (error) {
          console.error('🔴 Error sending transcript data with analytics:', error);
        }
      }

      console.log(`📊 Video Analytics: ${event}`, payload);
    } catch (error) {
      console.error('Failed to send video analytics:', error);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Track seek events
    setEngagementData(prev => ({
      ...prev,
      seekCount: prev.seekCount + 1,
      lastInteraction: new Date()
    }));
    
    // Send seek analytics
    sendVideoAnalytics('video_seek', {
      videoId: activeVideoData.id,
      fromTime: currentTime,
      toTime: newTime,
      moduleId: moduleId || 'unknown',
      timestamp: new Date().toISOString()
    });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const normalizeUrl = (url: string) => {
    // Convert YouTube URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    return url;
  };

  const isYouTube = videoUrl.includes('youtube.com');

  // Don't render video if URL is empty
  if (!videoUrl) {
    return (
      <div className={`relative bg-black ${className}`}>
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading video...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative bg-black ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Video Container */}
      <div className="relative w-full h-full">
        {isYouTube ? (
          <iframe
            src={normalizeUrl(videoUrl)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            className="w-full h-full"
            poster={activeVideoData.thumbnail}
            controls={false}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white">Loading video...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Custom Controls */}
        {!isYouTube && showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-2">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-300 transition-colors"
                  >
                    {isMuted ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="text-white hover:text-gray-300 transition-colors"
                  title="Debug Info"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      {showDebug && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg text-sm max-w-xs">
          <h4 className="font-medium mb-2">Debug Info</h4>
          <div className="space-y-1">
            <div>URL: {videoUrl}</div>
            <div>Duration: {formatTime(duration)}</div>
            <div>Current Time: {formatTime(currentTime)}</div>
            <div>Volume: {Math.round(volume * 100)}%</div>
            <div>Muted: {isMuted ? 'Yes' : 'No'}</div>
            <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
            <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
            <div>Watch Time: {formatTime(engagementData.totalWatchTime)}</div>
            <div>Play Count: {engagementData.playCount}</div>
            <div>Pause Count: {engagementData.pauseCount}</div>
            <div>Seek Count: {engagementData.seekCount}</div>
            {error && <div className="text-red-400">Error: {error}</div>}
          </div>
        </div>
      )}

      {/* Video Info */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
        <h3 className="font-medium">{activeVideoData.title}</h3>
        <p className="text-sm text-gray-300">Duration: {formatTime(activeVideoData.duration)}</p>
        {moduleId && <p className="text-sm text-gray-300">Module: {moduleId}</p>}
      </div>
    </div>
  );
} 