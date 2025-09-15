'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  BookOpen, 
  MessageCircle, 
  Brain, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Star,
  Clock,
  Trophy,
  Sparkles,
  Video,
  FileText,
  Users,
  TrendingUp,
  ChevronRight,
  X,
  Search,
  Filter,
  Grid3X3,
  List,
  PlayCircle,
  PauseCircle,
  Volume2,
  Maximize2,
  Share2,
  Heart,
  Bookmark,
  BookmarkCheck,
  Download,
  Eye,
  Target,
  Zap,
  Award,
  Lightbulb,
  Rocket,
  Globe,
  Lock,
  Unlock,
  ThumbsUp,
  Share,
  ExternalLink
} from 'lucide-react';

interface Chapter {
  chapterIndex: number;
  chapterKey: string;
    videoTitle: string;
  videoUrl: string;
}

interface YoutubeData {
  _id: string;
  uniqueid: string;
  chapters: Chapter[];
  totalChapters: number;
  createdAt: string;
  updatedAt: string;
}

interface MCQQuestion {
  Q: string;
  level: string;
  question: string;
  options: string[];
  answer: string;
}

interface ModulesTabProps {
  user: {
    uniqueId?: string | null;
    fullName?: string;
    classGrade?: string;
    
  } | null;
}

export default function ModulesTab({ user }: ModulesTabProps) {
  const [youtubeData, setYoutubeData] = useState<YoutubeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState<number | null>(null);
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showMcq, setShowMcq] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<'all' | 'basic' | 'intermediate' | 'advanced'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [showVideoControls, setShowVideoControls] = useState<string | null>(null);

  // Fetch YouTube data on component mount
  useEffect(() => {
    if (user?.uniqueId) {
      fetchYouTubeData();
    }
  }, [user?.uniqueId]);

  const fetchYouTubeData = async () => {
    if (!user?.uniqueId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/youtube-urls?uniqueid=${encodeURIComponent(user.uniqueId)}`);
      
        if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setYoutubeData(result.data);
        } else {
          setError(result.message || 'Failed to fetch modules');
        }
          } else {
        const errorData = await response.json();
        setError(errorData.message || `HTTP ${response.status}: Failed to fetch modules`);
        }
      } catch (error) {
      console.error('Error fetching YouTube data:', error);
      setError('Failed to fetch modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

  const triggerYouTubeScraping = async () => {
    if (!user?.uniqueId) return;
    
    setScraping(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/webhook/trigger-youtube-scraping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uniqueid: user.uniqueId })
      });

      if (response.ok) {
      const result = await response.json();
        setSuccess('YouTube scraping triggered successfully! Please wait for modules to be processed.');
        
        // Wait a bit then refresh the data
        setTimeout(() => {
          fetchYouTubeData();
        }, 10000); // Wait 10 seconds before checking for new data
        
        } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to trigger YouTube scraping');
      }
    } catch (error) {
      console.error('Error triggering YouTube scraping:', error);
      setError('Failed to trigger YouTube scraping. Please try again.');
    } finally {
      setScraping(false);
    }
  };

  const generateMCQ = async (chapterKey: string) => {
    setMcqLoading(true);
    setError(null);
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(null);
    
    try {
      const response = await fetch('/api/webhook/generate-mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chapterId: chapterKey }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setMcqQuestions(result.questions || []);
        setShowMcq(true);
        setShowChat(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to generate MCQ questions');
      }
    } catch (error) {
      console.error('Error generating MCQ:', error);
      setError('Failed to generate MCQ questions. Please try again.');
    } finally {
      setMcqLoading(false);
    }
  };

  const handleMCQAnswer = (questionId: string, answer: string) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitMCQ = () => {
    let correctAnswers = 0;
    mcqQuestions.forEach(question => {
      if (mcqAnswers[question.Q] === question.answer) {
        correctAnswers++;
      }
    });
    
    const score = Math.round((correctAnswers / mcqQuestions.length) * 100);
    setMcqScore(score);
    setMcqSubmitted(true);
  };

  const resetMCQ = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(null);
  };

  const handleChatQuery = async (chapterKey: string) => {
    if (!chatQuery.trim()) return;
    
    setChatLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/webhook/chat-transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify({ 
          query: chatQuery.trim(), 
          chapterId: chapterKey 
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setChatResponse(result.answer || result.response || 'No response received');
        setShowChat(true);
        setShowMcq(false);
        } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to process chat query');
      }
    } catch (error) {
      console.error('Error processing chat query:', error);
      setError('Failed to process chat query. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const getChapterId = (chapterKey: string) => {
    return chapterKey.replace('Chapter ', '');
  };

  const getVideoId = (url: string) => {
    if (!url || url === 'No link found') return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
  };

  // Filter and sort modules
  const filteredModules = React.useMemo(() => {
    if (!youtubeData?.chapters) return [];
    
    let modules = youtubeData.chapters;
    
    // Filter by search query
    if (searchQuery) {
      modules = modules.filter(chapter => {
        return chapter.videoTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
               chapter.chapterKey.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Filter by level
    if (filterLevel !== 'all') {
      modules = modules.filter(chapter => {
        // Simple level detection based on chapter number
        const chapterNum = chapter.chapterIndex;
        if (filterLevel === 'basic') return chapterNum <= 3;
        if (filterLevel === 'intermediate') return chapterNum > 3 && chapterNum <= 6;
        if (filterLevel === 'advanced') return chapterNum > 6;
        return true;
      });
    }
    
    // Sort modules
      switch (sortBy) {
        case 'title':
        modules.sort((a, b) => a.videoTitle.localeCompare(b.videoTitle));
        break;
        case 'oldest':
        modules.sort((a, b) => a.chapterIndex - b.chapterIndex);
        break;
        case 'newest':
        default:
        // Sort by chapter index descending (newest first)
        modules.sort((a, b) => b.chapterIndex - a.chapterIndex);
        break;
      }
    
    return modules;
  }, [youtubeData, searchQuery, filterLevel, sortBy]);

  const toggleFavorite = (chapterId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(chapterId)) {
        newFavorites.delete(chapterId);
      } else {
        newFavorites.add(chapterId);
      }
      return newFavorites;
    });
  };

  const markAsCompleted = (chapterId: string) => {
    setCompletedModules(prev => {
      const newCompleted = new Set(prev);
      if (newCompleted.has(chapterId)) {
        newCompleted.delete(chapterId);
      } else {
        newCompleted.add(chapterId);
      }
      return newCompleted;
    });
  };

  const toggleBookmark = (chapterId: string) => {
    setBookmarkedVideos(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(chapterId)) {
        newBookmarks.delete(chapterId);
      } else {
        newBookmarks.add(chapterId);
      }
      return newBookmarks;
    });
  };

  const toggleLike = (chapterId: string) => {
    setLikedVideos(prev => {
      const newLikes = new Set(prev);
      if (newLikes.has(chapterId)) {
        newLikes.delete(chapterId);
      } else {
        newLikes.add(chapterId);
      }
      return newLikes;
    });
  };

  const shareVideo = async (videoUrl: string, videoTitle: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: videoTitle,
          text: `Check out this learning video: ${videoTitle}`,
          url: videoUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(`${videoTitle} - ${videoUrl}`);
        setSuccess('Video link copied to clipboard!');
        setTimeout(() => setSuccess(null), 3000);
      } catch (error) {
        console.log('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-20 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
          </div>
        </div>
        
        <div className="relative px-6 py-12 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                  <h1 className="text-4xl font-bold mb-2">Learning Modules</h1>
                  <p className="text-blue-100 text-lg">Discover, learn, and master new skills</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchYouTubeData}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-6 h-6 text-blue-300" />
                  <span className="text-sm font-medium text-blue-100">Total Modules</span>
                </div>
                <div className="text-3xl font-bold">{youtubeData?.chapters?.length || 0}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-300" />
                  <span className="text-sm font-medium text-blue-100">Completed</span>
                </div>
                <div className="text-3xl font-bold">{completedModules.size}</div>
          </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-6 h-6 text-red-300" />
                  <span className="text-sm font-medium text-blue-100">Favorites</span>
                </div>
                <div className="text-3xl font-bold">{favorites.size}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-300" />
                  <span className="text-sm font-medium text-blue-100">Progress</span>
                </div>
                <div className="text-3xl font-bold">
                  {youtubeData?.chapters?.length ? Math.round((completedModules.size / youtubeData.chapters.length) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
                onClick={triggerYouTubeScraping}
                disabled={scraping || !user?.uniqueId}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl p-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-emerald-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {scraping ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Rocket className="w-8 h-8" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      {scraping ? 'Discovering New Content...' : 'Discover New Modules'}
                    </h3>
                    <p className="text-emerald-100 text-lg">
                      {scraping ? 'AI is finding the best learning content for you' : 'Let AI find personalized learning content'}
                    </p>
          </div>
        </div>
                <div className="absolute top-4 right-4">
                  <Sparkles className="w-6 h-6 text-white/60" />
      </div>
              </button>

              <button
                onClick={fetchYouTubeData}
                disabled={loading || !user?.uniqueId}
                className="group relative overflow-hidden bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl p-8 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-violet-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    {loading ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <BookOpen className="w-8 h-8" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold mb-2">
                      {loading ? 'Loading Your Library...' : 'Browse Your Library'}
                    </h3>
                    <p className="text-violet-100 text-lg">
                      {loading ? 'Fetching your personalized modules' : 'Explore your curated learning collection'}
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Globe className="w-6 h-6 text-white/60" />
                </div>
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">

          {/* Status Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Search and Filter Controls */}
          {youtubeData && youtubeData.chapters && youtubeData.chapters.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
            />
          </div>

                {/* Filters */}
                <div className="flex gap-3">
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value as any)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="basic">Basic</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title">Alphabetical</option>
                  </select>

                  <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <Grid3X3 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modules Display */}
          {youtubeData && youtubeData.chapters && youtubeData.chapters.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                  Your Learning Modules
                </h3>
                <span className="text-gray-500">
                  {filteredModules.length} of {youtubeData.totalChapters} modules
                </span>
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredModules.map((chapter, index) => {
                    const videoId = getVideoId(chapter.videoUrl);
                    const chapterId = getChapterId(chapter.chapterKey);
                    const isFavorite = favorites.has(chapterId);
                    const isCompleted = completedModules.has(chapterId);
                    const isPlaying = playingVideo === chapterId;
                    const isBookmarked = bookmarkedVideos.has(chapterId);
                    const isLiked = likedVideos.has(chapterId);
                    const isHovered = hoveredVideo === chapterId;
                    
                    return (
                      <motion.div 
                        key={index} 
                        className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onHoverStart={() => setHoveredVideo(chapterId)}
                        onHoverEnd={() => setHoveredVideo(null)}
                      >
                        {/* Video Section */}
                        <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200">
                          {videoId ? (
                            <>
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={chapter.videoTitle}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                <div className="flex gap-3">
                                  <motion.button
                                    onClick={() => setPlayingVideo(isPlaying ? null : chapterId)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-white/90 rounded-full hover:bg-white hover:scale-110 transform transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    {isPlaying ? (
                                      <PauseCircle className="w-8 h-8 text-gray-800" />
                                    ) : (
                                      <PlayCircle className="w-8 h-8 text-gray-800" />
                                    )}
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => window.open(chapter.videoUrl, '_blank')}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 bg-white/90 rounded-full hover:bg-white hover:scale-110 transform transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <ExternalLink className="w-6 h-6 text-gray-800" />
                                  </motion.button>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <div className="text-center">
                                <Video className="w-12 h-12 mx-auto mb-2" />
                                <p>Video not available</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="px-3 py-1 bg-black/70 text-white text-xs font-medium rounded-full backdrop-blur-sm">
                              {chapter.chapterKey}
                            </span>
                            {isCompleted && (
                              <span className="px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons Overlay */}
                          <div className="absolute top-4 right-4 flex gap-2">
                            <motion.button
                              onClick={() => toggleBookmark(chapterId)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                isBookmarked 
                                  ? 'bg-yellow-500 text-white' 
                                  : 'bg-black/70 text-white hover:bg-yellow-500'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </motion.button>
                            
                            <motion.button
                              onClick={() => toggleLike(chapterId)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                isLiked 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-black/70 text-white hover:bg-blue-500'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => shareVideo(chapter.videoUrl, chapter.videoTitle)}
                              className="p-2 rounded-full backdrop-blur-sm bg-black/70 text-white hover:bg-purple-500 transition-all"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Share className="w-4 h-4" />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => toggleFavorite(chapterId)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                isFavorite 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-black/70 text-white hover:bg-red-500'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                            </motion.button>
                            
                            <motion.button
                              onClick={() => markAsCompleted(chapterId)}
                              className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-black/70 text-white hover:bg-green-500'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </motion.button>
                      </div>
                      </div>
          
                        {/* Content Section */}
                        <div className="p-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {chapter.videoTitle}
                          </h4>
                          
                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{progress[chapterId] || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress[chapterId] || 0}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                <button
                              onClick={() => {
                                setSelectedChapter(chapter.chapterKey);
                                generateMCQ(chapter.chapterKey);
                              }}
                              disabled={mcqLoading}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 font-medium"
                            >
                              {mcqLoading && selectedChapter === chapter.chapterKey ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Brain className="w-4 h-4" />
                              )}
                              Quiz
          </button>
          
                            <button
                              onClick={() => {
                                setSelectedChapter(chapterId);
                                setShowChat(true);
                                setShowMcq(false);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Chat
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                                  </div>
              ) : (
                <div className="space-y-4">
                  {filteredModules.map((chapter, index) => {
                    const videoId = getVideoId(chapter.videoUrl);
                    const chapterId = getChapterId(chapter.chapterKey);
                    const isFavorite = favorites.has(chapterId);
                    const isCompleted = completedModules.has(chapterId);
                    
                    return (
                      <div 
                        key={index} 
                        className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-6">
                          {/* Video Thumbnail */}
                          <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {videoId ? (
                              <img
                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                alt={chapter.videoTitle}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Video className="w-8 h-8" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <PlayCircle className="w-6 h-6 text-white" />
              </div>
            </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                {chapter.chapterKey}: {chapter.videoTitle}
                              </h4>
                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => toggleFavorite(chapterId)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isFavorite 
                                      ? 'bg-red-100 text-red-600' 
                                      : 'text-gray-400 hover:bg-red-100 hover:text-red-600'
                                  }`}
                                >
                                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>
              <button
                                  onClick={() => markAsCompleted(chapterId)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    isCompleted 
                                      ? 'bg-green-100 text-green-600' 
                                      : 'text-gray-400 hover:bg-green-100 hover:text-green-600'
                                  }`}
                                >
                                  <CheckCircle className="w-4 h-4" />
              </button>
            </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                15 min
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                1.2k views
                              </span>
                              {isCompleted && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  Completed
                                </span>
          )}
                                  </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{progress[chapterId] || 0}%</span>
                                </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress[chapterId] || 0}%` }}
                                ></div>
                                      </div>
                                      </div>
          
                            {/* Action Buttons */}
                            <div className="flex gap-3">
            <button
                                onClick={() => {
                                  setSelectedChapter(chapter.chapterKey);
                                  generateMCQ(chapter.chapterKey);
                                }}
                                disabled={mcqLoading}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                              >
                                {mcqLoading && selectedChapter === chapter.chapterKey ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Brain className="w-4 h-4" />
                                )}
                                Take Quiz
            </button>
            
            <button
                                onClick={() => {
                                  setSelectedChapter(chapterId);
                                  setShowChat(true);
                                  setShowMcq(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                Ask Question
            </button>
          </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
      )}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-16 h-16 text-blue-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No Modules Available</h3>
                  <p className="text-gray-500 text-lg mb-8">
                    Start your learning journey by discovering new modules tailored to your interests and goals.
                  </p>
                  <button
                    onClick={triggerYouTubeScraping}
                    disabled={scraping || !user?.uniqueId}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {scraping ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Rocket className="w-5 h-5" />
                    )}
                    Discover New Modules
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* MCQ Modal */}
      {showMcq && selectedChapter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Brain className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">MCQ Quiz</h3>
                    <p className="text-purple-100">Chapter {selectedChapter} - Test your knowledge</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMcq(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              {mcqQuestions.length > 0 ? (
                <div className="space-y-6">
                  {mcqQuestions.map((question, index) => (
                    <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
                          Q{question.Q}
                        </div>
                        <div className={`px-4 py-2 text-sm font-semibold rounded-full ${
                          question.level === 'Basic' ? 'bg-green-100 text-green-800' :
                          question.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.level}
                        </div>
                        <div className="ml-auto">
                          <Target className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 leading-relaxed">
                          {question.question}
                        </h4>
                        
                        {/* Options */}
                        <div className="space-y-3">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = mcqAnswers[question.Q] === option;
                            const isCorrect = option === question.answer;
                            const isSubmitted = mcqSubmitted;
                            
                            return (
                              <label
                                key={optionIndex}
                                className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                } ${
                                  isSubmitted && isCorrect
                                    ? 'border-green-500 bg-green-50'
                                    : isSubmitted && isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-50'
                                    : ''
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${question.Q}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => handleMCQAnswer(question.Q, option)}
                                  disabled={isSubmitted}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300'
                                } ${
                                  isSubmitted && isCorrect
                                    ? 'border-green-500 bg-green-500'
                                    : isSubmitted && isSelected && !isCorrect
                                    ? 'border-red-500 bg-red-500'
                                    : ''
                                }`}>
                                  {isSelected && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className={`flex-1 ${
                                  isSubmitted && isCorrect
                                    ? 'text-green-800 font-semibold'
                                    : isSubmitted && isSelected && !isCorrect
                                    ? 'text-red-800 font-semibold'
                                    : 'text-gray-700'
                                }`}>
                                  {option}
                                </span>
                                {isSubmitted && isCorrect && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                                )}
                                {isSubmitted && isSelected && !isCorrect && (
                                  <X className="w-5 h-5 text-red-600" />
                                )}
                              </label>
                            );
                          })}
                          </div>
                          </div>
                        </div>
                  ))}
                  
                  {/* Submit Button */}
                  {!mcqSubmitted && (
                    <div className="flex justify-center pt-6">
                      <button
                        onClick={submitMCQ}
                        disabled={Object.keys(mcqAnswers).length !== mcqQuestions.length}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <Brain className="w-5 h-5" />
                        Submit Quiz
                        <span className="text-sm opacity-75">
                          ({Object.keys(mcqAnswers).length}/{mcqQuestions.length} answered)
                        </span>
                      </button>
                      </div>
                  )}
                  
                  {/* Results */}
                  {mcqSubmitted && mcqScore !== null && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                          <Trophy className="w-8 h-8 text-white" />
                    </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Completed!</h3>
                        <div className="text-4xl font-bold text-green-600 mb-2">{mcqScore}%</div>
                        <p className="text-gray-600 mb-4">
                          You scored {mcqScore}% on this quiz
                        </p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={resetMCQ}
                            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300"
                          >
                            Retake Quiz
                          </button>
                          <button
                            onClick={() => setShowMcq(false)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
                    <Brain className="w-12 h-12 text-purple-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h4>
                  <p className="text-gray-500">No MCQ questions have been generated for this chapter yet.</p>
                </div>
              )}
            </div>
            </div>
          </div>
        )}

      {/* Chat Modal */}
      {showChat && selectedChapter && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <MessageCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-1">AI Learning Assistant</h3>
                    <p className="text-emerald-100">Chapter {selectedChapter} - Ask anything about this topic</p>
                  </div>
            </div>
              <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                  <X className="w-6 h-6" />
              </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Chat Input */}
                <div className="bg-gradient-to-r from-gray-50 to-emerald-50 rounded-2xl p-6 border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Ask a question about this chapter:
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={chatQuery}
                        onChange={(e) => setChatQuery(e.target.value)}
                        placeholder="e.g., What is the main concept of this chapter? How does this work?"
                        className="w-full pl-4 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-900 bg-white text-lg"
                        onKeyPress={(e) => e.key === 'Enter' && handleChatQuery(selectedChapter)}
                      />
                    </div>
              <button
                      onClick={() => handleChatQuery(selectedChapter)}
                      disabled={chatLoading || !chatQuery.trim()}
                      className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl"
                    >
                      {chatLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          Ask
                        </div>
                      )}
              </button>
                  </div>
                </div>
                
                {/* Chat Response */}
                {chatResponse && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">AI Response:</h4>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                        {chatResponse}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Quick Questions */}
                <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Questions:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      "What is the main concept?",
                      "How does this work?",
                      "What are the key points?",
                      "Can you explain this simply?"
                    ].map((question, index) => (
              <button
                        key={index}
                        onClick={() => setChatQuery(question)}
                        className="p-3 text-left bg-white hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 text-gray-700 hover:text-blue-700"
              >
                        {question}
              </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}
    </div>
  );
} 