'use client';

import React, { useState, useEffect } from 'react';
import { Play, Loader2, AlertCircle, Youtube, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface Chapter {
  chapterIndex: number;
  chapterKey: string;
  videoTitle: string;
  videoUrl: string;
}

interface YouTubeData {
  _id: string;
  uniqueid: string;
  chapters: Chapter[];
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
}

interface YouTubeUrlViewerProps {
  uniqueid: string;
  autoPlay?: boolean;
  showPlaylist?: boolean;
  className?: string;
}

export default function YouTubeUrlViewer({ 
  uniqueid, 
  autoPlay = false, 
  showPlaylist = true,
  className = '' 
}: YouTubeUrlViewerProps) {
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (uniqueid) {
      fetchYouTubeData();
    }
  }, [uniqueid]);

  const fetchYouTubeData = async () => {
    if (!uniqueid) {
      setLoading(false);
      setError('No uniqueid provided');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 YouTubeUrlViewer: Fetching data for uniqueid:', uniqueid);
      
      const response = await fetch(`/api/youtube-urls?uniqueid=${encodeURIComponent(uniqueid)}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('📊 YouTubeUrlViewer: API response:', result);
        
        if (result.success && result.data) {
          setYoutubeData(result.data);
        } else {
          setError(result.message || 'Failed to fetch YouTube data');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || `HTTP ${response.status}: Failed to fetch data`);
      }
    } catch (err) {
      console.error('❌ YouTubeUrlViewer: Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from YouTube URL
  const extractVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Convert YouTube URL to embed URL
  const getEmbedUrl = (videoUrl: string): string => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return '';
    
    const params = new URLSearchParams({
      rel: '0', // Don't show related videos
      modestbranding: '1', // Modest YouTube branding
      showinfo: '0', // Don't show video info
      fs: '1', // Allow fullscreen
      cc_load_policy: '1', // Show captions by default
      iv_load_policy: '3', // Don't show annotations
      autohide: '1', // Auto-hide controls
    });
    
    if (autoPlay) {
      params.append('autoplay', '1');
    }
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Youtube className="w-8 h-8 text-white" />
            </div>
            <Loader2 className="w-6 h-6 animate-spin text-red-500 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Video Player</h3>
          <p className="text-gray-600">Fetching videos for uniqueid: {uniqueid}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Videos</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchYouTubeData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!youtubeData || !youtubeData.chapters.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Youtube className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Videos Found</h3>
          <p className="text-gray-600">No YouTube videos found for uniqueid: {uniqueid}</p>
        </div>
      </div>
    );
  }

  const currentVideo = youtubeData.chapters[currentVideoIndex];
  const embedUrl = getEmbedUrl(currentVideo.videoUrl);

  return (
    <div className={`w-full ${className}`}>
      {/* Video Player Container */}
      <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
        {/* Video Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Youtube className="w-6 h-6" />
              <div>
                <h2 className="text-lg font-semibold">{currentVideo.videoTitle}</h2>
                <p className="text-red-100 text-sm">
                  {currentVideo.chapterKey} • Video {currentVideoIndex + 1} of {youtubeData.totalChapters}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <a
                href={currentVideo.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-red-700 rounded-lg transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Video iframe */}
        <div className={`relative ${isFullscreen ? 'h-full' : 'aspect-video'} bg-black`}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={currentVideo.videoTitle}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center text-white">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p>Unable to load video</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Playlist */}
      {showPlaylist && youtubeData.chapters.length > 1 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Video Playlist</h3>
          <div className="grid gap-3">
            {youtubeData.chapters.map((chapter, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  index === currentVideoIndex
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleVideoSelect(index)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === currentVideoIndex
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {chapter.videoTitle}
                    </h4>
                    <p className="text-sm text-gray-500">{chapter.chapterKey}</p>
                  </div>
                  {index === currentVideoIndex && (
                    <div className="text-red-500 text-sm font-medium">Now Playing</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Unique ID: <code className="bg-gray-200 px-2 py-1 rounded">{youtubeData.uniqueid}</code></span>
          <span>Total Videos: {youtubeData.totalChapters}</span>
        </div>
      </div>
    </div>
  );
}
