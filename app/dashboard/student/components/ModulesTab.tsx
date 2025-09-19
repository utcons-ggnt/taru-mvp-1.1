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
import N8NLoadingIndicator from '@/app/components/N8NLoadingIndicator';

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
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  
  // N8N Loading Indicator states
  const [n8nStatus, setN8nStatus] = useState<'idle' | 'triggering' | 'processing' | 'completed' | 'error'>('idle');
  const [n8nProgress, setN8nProgress] = useState(0);
  const [n8nMessage, setN8nMessage] = useState('');
  const [showN8nIndicator, setShowN8nIndicator] = useState(false);
  const [n8nStartTime, setN8nStartTime] = useState<number | null>(null);

  // Fetch YouTube data on component mount
  useEffect(() => {
    if (user?.uniqueId) {
      fetchYouTubeData();
    }
  }, [user?.uniqueId]);

  // Status validation function
  const validateN8nStatus = (currentStatus: string, startTime: number | null) => {
    if (currentStatus === 'processing' && startTime) {
      const elapsed = Date.now() - startTime;
      const maxProcessingTime = 2 * 60 * 1000; // 2 minutes
      
      if (elapsed > maxProcessingTime) {
        console.warn('⏰ N8N processing exceeded maximum time, marking as error');
        return 'error';
      }
    }
    return currentStatus;
  };

  // Cleanup effect for N8N polling
  useEffect(() => {
    return () => {
      // Cleanup any ongoing polling when component unmounts
      setShowN8nIndicator(false);
      setN8nStatus('idle');
    };
  }, []);

  // Effect to lock background scrolling when modals are open
  useEffect(() => {
    const lockScroll = () => {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Lock background scrolling
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
      
      // Store original values for cleanup
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    };

    if (showChat || showMcq) {
      const cleanup = lockScroll();
      
      // Cleanup function
      return cleanup;
    } else {
      // Restore scrolling when modals are closed
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
  }, [showChat, showMcq]);

  // Additional cleanup on component unmount
  useEffect(() => {
    return () => {
      // Ensure scrolling is restored when component unmounts
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, []);

  const fetchYouTubeData = async (isPolling = false) => {
    if (!user?.uniqueId) return;
    
    if (!isPolling) {
      setLoading(true);
      setError(null);
    }
    
    try {
      const response = await fetch(`/api/youtube-urls?uniqueid=${encodeURIComponent(user.uniqueId)}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          setYoutubeData(result.data);
          
          // If we're polling and got real data (not fallback), update N8N status
          if (isPolling && !result.isFallback) {
            console.log('✅ N8N processing completed successfully');
            setN8nProgress(100);
            setN8nStatus('completed');
            setN8nMessage('YouTube videos are ready for you to explore!');
            
            // Hide indicator after 2 minutes
            setTimeout(() => {
              setShowN8nIndicator(false);
            }, 120000);
          } else if (isPolling && result.isFallback) {
            console.log('⏳ N8N still processing, using fallback data');
            // Keep processing status if we're still getting fallback data
          }
        } else {
          if (!isPolling) {
            setError(result.message || 'Failed to fetch modules');
          } else {
            console.log('⏳ N8N still processing, no data available yet');
          }
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || `HTTP ${response.status}: Failed to fetch modules`;
        
        if (!isPolling) {
          setError(errorMessage);
        } else {
          console.warn('⚠️ Error during polling:', errorMessage);
          // Don't immediately fail during polling, let the timeout handle it
        }
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      if (!isPolling) {
        setError('Failed to fetch modules. Please try again.');
      } else {
        console.warn('⚠️ Network error during polling:', error);
        // Don't immediately fail during polling, let the timeout handle it
      }
    } finally {
      if (!isPolling) {
        setLoading(false);
      }
    }
  };

  const triggerYouTubeScraping = async () => {
    if (!user?.uniqueId) return;
    
    setScraping(true);
    setError(null);
    setSuccess(null);
    
    // Show N8N indicator
    setShowN8nIndicator(true);
    setN8nStatus('triggering');
    setN8nMessage('Starting YouTube content generation...');
    setN8nProgress(0);
    setN8nStartTime(Date.now());
    
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
        setSuccess(result.message || 'YouTube scraping initiated! Please wait for modules to be processed.');
        
        // Update N8N status to processing
        setN8nStatus('processing');
        setN8nMessage('N8N is generating YouTube videos for you...');
        
        console.log('🚀 N8N workflow triggered successfully:', {
          webhookSuccess: result.webhookSuccess,
          message: result.message
        });
        
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setN8nProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + Math.random() * 15;
          });
        }, 2000);
        
        // Start polling for results
        let pollCount = 0;
        const maxPolls = 24; // Maximum 2 minutes of polling (24 * 5 seconds)
        
        const pollForResults = async () => {
          try {
            pollCount++;
            console.log(`🔄 Polling attempt ${pollCount}/${maxPolls} for N8N results`);
            
            await fetchYouTubeData(true); // Use polling mode
            
            // Check current status using a ref or state callback to get fresh value
            setN8nStatus(currentStatus => {
              // Validate status based on timing
              const validatedStatus = validateN8nStatus(currentStatus, n8nStartTime);
              
              if (validatedStatus === 'error') {
                console.warn('⏰ N8N processing exceeded maximum time, stopping');
                clearInterval(progressInterval);
                setTimeout(() => {
                  setShowN8nIndicator(false);
                }, 3000);
                return 'error';
              }
              
              // Continue polling if status is still processing and we haven't exceeded max polls
              if (currentStatus === 'processing' && pollCount < maxPolls) {
                setTimeout(pollForResults, 5000);
                return currentStatus; // Keep current status
              } else if (pollCount >= maxPolls) {
                // Timeout after max polls
                console.warn('⏰ N8N polling timeout reached, stopping');
                clearInterval(progressInterval);
                setTimeout(() => {
                  setShowN8nIndicator(false);
                }, 3000);
                return 'error';
              }
              return currentStatus;
            });
          } catch (pollError) {
            console.error('Error polling for results:', pollError);
            clearInterval(progressInterval);
            setN8nStatus('error');
            setN8nMessage('Failed to check for results. Please try refreshing.');
            
            // Hide indicator after error
            setTimeout(() => {
              setShowN8nIndicator(false);
            }, 5000);
          }
        };
        
        // Start polling after a short delay
        setTimeout(pollForResults, 5000);
        
        } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP ${response.status}: Failed to trigger YouTube scraping`;
        
        console.error('❌ N8N trigger failed:', {
          status: response.status,
          error: errorMessage,
          details: errorData.details
        });
        
        setError(errorMessage);
        setN8nStatus('error');
        setN8nMessage(`Failed to trigger YouTube scraping: ${errorMessage}`);
        
        // Hide indicator after showing error
        setTimeout(() => {
          setShowN8nIndicator(false);
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Error triggering YouTube scraping:', error);
      
      let errorMessage = 'Failed to trigger YouTube scraping. Please try again.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        }
      }
      
      setError(errorMessage);
      setN8nStatus('error');
      setN8nMessage(errorMessage);
      
      // Hide indicator after showing error
      setTimeout(() => {
        setShowN8nIndicator(false);
      }, 5000);
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
        // Handle both string response and array response with HTML content
        let responseContent = '';
        if (Array.isArray(result.answer || result.response)) {
          // Extract HTML content from array format
          const htmlData = result.answer || result.response;
          if (htmlData.length > 0 && htmlData[0].text) {
            responseContent = htmlData[0].text;
          } else {
            responseContent = 'No response received';
          }
        } else {
          responseContent = result.answer || result.response || 'No response received';
        }
        setChatResponse(responseContent);
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

  // Function to parse HTML content and extract structured data
  const parseHtmlResponse = (htmlContent: string) => {
    try {
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      
      // Extract content from different sections - handle both old and new formats
      const title = doc.querySelector('title')?.textContent || '';
      
      // Try different selectors for header
      const header = doc.querySelector('header h1')?.textContent || 
                    doc.querySelector('h1')?.textContent || 
                    doc.querySelector('h2')?.textContent || '';
      
      // Try different selectors for main content
      const article = doc.querySelector('article p')?.textContent || 
                     doc.querySelector('p')?.textContent || '';
      
      // Try different selectors for footer/source acknowledgment
      const footer = doc.querySelector('footer h2')?.textContent || 
                    doc.querySelector('h2:nth-of-type(2)')?.textContent || '';
      const footerText = doc.querySelector('footer p')?.textContent || 
                        doc.querySelector('h2:nth-of-type(2) + p')?.textContent || '';
      
      // Try different selectors for follow-up questions section
      const sectionTitle = doc.querySelector('section h3')?.textContent || 
                          doc.querySelector('h2:nth-of-type(3)')?.textContent || '';
      const followUpQuestions = Array.from(doc.querySelectorAll('section ul li, ul li')).map(li => li.textContent || '');
      
      return {
        title,
        header,
        article,
        footer,
        footerText,
        sectionTitle,
        followUpQuestions
      };
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return {
        title: '',
        header: '',
        article: htmlContent, // Fallback to original content
        footer: '',
        footerText: '',
        sectionTitle: '',
        followUpQuestions: []
      };
    }
  };

  // Test function to demonstrate HTML parsing with sample data
  const testHtmlParsing = () => {
    const sampleHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Security Systems</title>
</head>
<body>
<h2>Answer Summary</h2>
<p>
<b>Antivirus software</b> scans your computer for known malware using special signatures and removes harmful files.<br> 
<b>Intrusion Detection Systems (IDS)</b> watch network data (NIDS) or computer logs/files (HIDS) to find unusual or suspicious activities and send alerts.<br> 
<b>Amazon GuardDuty</b> constantly checks AWS accounts using machine learning and data like network logs and activity records to spot threats automatically.<br> 
When any threat is found, these tools give details so you can quickly fix the problem and keep your system safe.
</p>

<h2>Source Acknowledgment</h2>
<p>✅ This is explained in the video you watched.</p>

<h2>Always Ask 3 Smart Follow-Up Questions</h2>
<ul>
<li>Want to learn how machine learning helps detect threats in GuardDuty?</li>
<li>Curious about the difference between network-based and host-based IDS?</li>
<li>Interested in how antivirus keeps up with new types of malware?</li>
</ul>

</body>
</html>`;
    
    const parsed = parseHtmlResponse(sampleHtml);
    console.log('Parsed HTML content:', parsed);
    return parsed;
  };

  // Function to render parsed HTML content
  const renderHtmlContent = (htmlContent: string) => {
    const parsed = parseHtmlResponse(htmlContent);
    
    return (
      <div className="space-y-4">
        {/* Header Section */}
        {parsed.header && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-3 h-3 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-blue-900">{parsed.header}</h2>
            </div>
          </div>
        )}
        
        {/* Main Article Content */}
        {parsed.article && (
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800 mb-2">Key Concepts</h3>
                <div 
                  className="text-gray-800 leading-relaxed text-sm [&_b]:font-bold [&_b]:text-gray-900 [&_br]:block [&_br]:mb-2 [&_b]:text-blue-700"
                  dangerouslySetInnerHTML={{ 
                    __html: parsed.article.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Footer Section */}
        {parsed.footer && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 text-gray-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-800">{parsed.footer}</h3>
            </div>
            {parsed.footerText && (
              <div 
                className="text-gray-600 text-xs bg-white/60 rounded-md p-2 border border-gray-200 [&_b]:font-bold [&_b]:text-gray-800 [&_br]:block [&_br]:mb-1"
                dangerouslySetInnerHTML={{ 
                  __html: parsed.footerText.replace(/\n/g, '<br>') 
                }}
              />
            )}
          </div>
        )}
        
        {/* Follow-up Questions Section */}
        {parsed.sectionTitle && parsed.followUpQuestions.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-3 h-3 text-purple-600" />
              </div>
              <h3 className="text-base font-semibold text-purple-900">{parsed.sectionTitle}</h3>
            </div>
            <div className="space-y-2">
              {parsed.followUpQuestions.map((question, index) => (
                <div key={index} className="flex items-start gap-2 group">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0 group-hover:bg-purple-600 transition-colors"></div>
                  <button
                    onClick={() => setChatQuery(question)}
                    className="text-left text-purple-800 hover:text-purple-900 hover:bg-purple-100 rounded-md p-2 transition-all duration-200 text-xs font-medium w-full border border-transparent hover:border-purple-200 hover:shadow-sm"
                  >
                    {question}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
                  onClick={() => fetchYouTubeData()}
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
                onClick={() => fetchYouTubeData()}
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
                              {isPlaying ? (
                                <iframe
                                  key={`playing-${chapterId}`}
                                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                                  title={chapter.videoTitle}
                                  className="w-full h-full"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                                  {/* Video Thumbnail */}
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                                    alt={chapter.videoTitle}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                                    }}
                                  />
                                  {/* Play Overlay */}
                                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <motion.button
                                      onClick={() => setPlayingVideo(chapterId)}
                                      className="p-6 bg-red-600 hover:bg-red-700 rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <Play className="w-12 h-12 text-white" />
                                    </motion.button>
                                  </div>
                                </div>
                              )}
                              
                              {/* Control Overlay */}
                              {isPlaying && (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                  <div className="flex gap-3">
                                    <motion.button
                                      onClick={() => setPlayingVideo(null)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 bg-white/90 rounded-full hover:bg-white hover:scale-110 transform transition-all"
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                    >
                                      <PauseCircle className="w-8 h-8 text-gray-800" />
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
                              )}
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 flex-shrink-0">
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
            <div className="p-8 flex-1 overflow-y-auto">
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
                                className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
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
                                  className="absolute opacity-0 w-0 h-0 pointer-events-none -z-10"
                                  style={{ 
                                    position: 'absolute', 
                                    left: '-9999px',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none'
                                  }}
                                />
                                <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-500'
                                    : 'border-gray-300 bg-white'
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-hidden">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8 flex-shrink-0">
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
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-gray-200 shadow-lg">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">AI Response</h4>
                          <p className="text-sm text-gray-500">Generated for Chapter {selectedChapter}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setChatResponse('')}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Clear response"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(chatResponse);
                            setSuccess('Response copied to clipboard!');
                            setTimeout(() => setSuccess(null), 3000);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy response"
                        >
                          <Download className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="relative">
                      <div 
                        className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        onScroll={(e) => {
                          const target = e.target as HTMLDivElement;
                          setShowScrollToTop(target.scrollTop > 100);
                        }}
                      >
                        <div className="p-6">
                        {chatLoading ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-4">
                              <div className="relative">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <Brain className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="text-center">
                                <p className="text-gray-600 font-medium">AI is thinking...</p>
                                <p className="text-sm text-gray-500">Generating response for Chapter {selectedChapter}</p>
                                <div className="flex items-center gap-1 mt-3">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                            renderHtmlContent(chatResponse)
                          )}
                        </div>
                      </div>
                      
                      {/* Fade overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none"></div>
                      
                      {/* Scroll to Top Button */}
                      {showScrollToTop && (
                        <button
                          onClick={(e) => {
                            const scrollContainer = (e.target as HTMLElement).closest('.overflow-y-auto') as HTMLDivElement;
                            scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="absolute bottom-4 right-4 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-10"
                          title="Scroll to top"
                        >
                          <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                        </button>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-3 bg-white/30 backdrop-blur-sm border-t border-gray-200 rounded-b-2xl">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>AI Generated Response</span>
                          {chatResponse && (
                            <span className="text-gray-400">
                              • {chatResponse.length} characters • {chatResponse.split(' ').length} words
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Just now
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="w-3 h-3" />
                            Chapter {selectedChapter}
                          </span>
                        </div>
                      </div>
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

      {/* N8N Loading Indicator */}
        <N8NLoadingIndicator
          isVisible={showN8nIndicator}
          status={n8nStatus}
          message={n8nMessage}
          progress={n8nProgress}
          startTime={n8nStartTime}
        />
    </div>
  );
} 