'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import ModulesTab from './components/ModulesTab';
import ProgressTab from './components/ProgressTab';
import RewardsTab from './components/RewardsTab';
import SettingsTab from './components/SettingsTab';
import ChatModal from './components/ChatModal';
import StatsCards from './components/StatsCards';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewTab from './components/OverviewTab';
import { TypewriterText, StaggeredText, GradientText, CharacterAnimation } from '../../components/TextAnimations';
import { TiltCard, MagneticButton } from '../../components/InteractiveElements';
import { StaggerContainer, StaggerItem } from '../../components/PageTransitions';
import { ScrollFade, ScrollCounter, ParallaxScroll, ScrollProgress } from '../../components/ScrollAnimations';
import { FloatingParticles, MorphingBlob } from '../../components/FloatingElements';
import ConsistentLoadingPage from '../../components/ConsistentLoadingPage';

// Add custom hook for responsive behavior
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      handleResize(); // Call once to set initial size
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
}

interface StudentProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    grade?: string;
    school?: string;
  };
  _id?: string; // Added for user ID
  uniqueId?: string | null; // Added for student unique ID
  fullName?: string; // Added for ModulesTab compatibility
  classGrade?: string; // Added for ModulesTab compatibility
}

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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

interface DashboardData {
  overview: {
    totalModules: number;
    completedModules: number;
    inProgressModules: number;
    totalXp: number;
    averageScore: number;
    studentName: string;
    grade: string;
    school: string;
    studentKey: string;
  };
  recentActivity: Array<{
    moduleId: string;
    status: string;
    progress: number;
    xpEarned: number;
    lastAccessed: string;
  }>;
  notifications: Notification[];
  recommendedModules: Array<{
    id: string;
    name: string;
    subject: string;
    description: string;
    xpPoints: number;
    estimatedDuration: number;
  }>;
  progress: {
    totalTimeSpent: number;
    badgesEarned: Array<{
      badgeId: string;
      name: string;
      description: string;
      earnedAt: string;
    }>;
    currentModule: unknown;
  };
  assessment?: {
    assessmentCompletedAt: string;
  };
}

// Define Test type
interface Test {
  title: string;
  date: string;
  color: string;
  score?: number;
}

// Define Course type for the courses section
interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
  progress: number;
  icon: string;
}

// Define Continue Learning Course type
interface ContinueLearningCourse {
  title: string;
  duration: string;
  xp: number;
  isLocked: boolean;
  icon: string;
  color: string;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [youtubeLoading, setYoutubeLoading] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelHovered, setIsRightPanelHovered] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Function to fetch YouTube data with comprehensive error handling
  const fetchYouTubeData = async (uniqueId: string) => {
    // Input validation
    if (!uniqueId || typeof uniqueId !== 'string' || uniqueId.trim() === '') {
      console.error('❌ Cannot fetch YouTube data: uniqueId is invalid:', uniqueId);
      setYoutubeData(null);
      return;
    }

    // Prevent multiple concurrent requests
    if (youtubeLoading) {
      console.log('⏳ YouTube data fetch already in progress, skipping...');
      return;
    }

    try {
      setYoutubeLoading(true);
      console.log('🔍 Fetching YouTube data for uniqueId:', uniqueId);
      
      const apiUrl = `/api/youtube-data`;
      console.log('🌐 API URL:', apiUrl);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      clearTimeout(timeoutId);
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (response.ok) {
        let result;
        try {
          result = await response.json();
          console.log('✅ YouTube data API response:', result);
        } catch (jsonError) {
          console.error('❌ Failed to parse successful response as JSON:', jsonError);
          const textResponse = await response.text();
          console.log('📄 Raw successful response:', textResponse);
          setYoutubeData(null);
          return;
        }
        
        if (result && typeof result === 'object' && result.success && result.data) {
          console.log('✅ Setting YouTube data:', result.data);
          setYoutubeData(result.data);
        } else {
          console.log('📭 No YouTube data available yet:', result?.message || 'No valid data in response');
          setYoutubeData(null);
        }
      } else {
        // Handle non-200 responses
        let errorData = {
          status: response.status,
          statusText: response.statusText,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
        
        try {
          const responseText = await response.text();
          console.log('📄 Error response body:', responseText);
          
          if (responseText && responseText.trim() !== '') {
            try {
              const parsedError = JSON.parse(responseText);
              errorData = { ...errorData, ...parsedError };
            } catch (parseError) {
              console.log('⚠️ Error response is not JSON, using as text');
              errorData.message = responseText;
            }
          }
        } catch (readError) {
          console.error('❌ Error reading error response:', readError);
        }
        
        console.error('❌ YouTube data fetch failed:', errorData);
        
        if (response.status === 404) {
          console.log('📭 No YouTube data found (404), might need to trigger scrapping');
        } else if (response.status >= 500) {
          console.log('🔥 Server error, might be temporary');
        } else if (response.status === 401 || response.status === 403) {
          console.log('🔒 Authentication/authorization error');
        }
        
        setYoutubeData(null);
      }
    } catch (error: any) {
      // Handle network errors, timeouts, etc.
      if (error.name === 'AbortError') {
        console.error('❌ YouTube data fetch timed out after 10 seconds');
      } else {
        console.error('❌ Network error fetching YouTube data:', {
          name: error?.name,
          message: error?.message,
          stack: error?.stack
        });
      }
      setYoutubeData(null);
    } finally {
      setYoutubeLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user data from the server
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'student') {
            router.push('/login');
            return;
          }
          
          // Fetch student profile to get unique ID
          try {
            console.log('🔍 Fetching student profile...');
            const studentResponse = await fetch('/api/student/profile');
            console.log('📊 Student profile response status:', studentResponse.status);
            
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              console.log('✅ Student data received:', studentData);
              
              const userWithProfile = {
                ...userData.user,
                uniqueId: studentData.uniqueId,
                fullName: studentData.fullName,
                classGrade: studentData.classGrade,
                schoolName: studentData.schoolName
              };
              
              setUser(userWithProfile);
              
              // If we have a uniqueId, fetch YouTube data
              if (studentData.uniqueId) {
                fetchYouTubeData(studentData.uniqueId);
              }
              
            } else {
              const errorData = await studentResponse.json();
              console.error('❌ Student profile fetch failed:', errorData);
              
              // Check if the error is due to missing student profile
              if (errorData.error === 'Student profile not found') {
                console.log('🔄 Student profile not found, redirecting to onboarding...');
                router.push('/student-onboarding');
                return;
              }
              
              // Set user without uniqueId, components will handle the fallback
              setUser({
                ...userData.user,
                uniqueId: null // Explicitly set to null so components know it's missing
              });
            }
          } catch (error) {
            console.error('❌ Error fetching student profile:', error);
            // Set user without uniqueId, components will handle the fallback
            setUser({
              ...userData.user,
              uniqueId: null // Explicitly set to null so components know it's missing
            });
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Use data synchronization for dashboard data
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setDashboardLoading(true);
        const response = await fetch('/api/dashboard/student/overview');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
        
        // Fetch real notifications
        try {
          const notificationsResponse = await fetch('/api/notifications');
          if (notificationsResponse.ok) {
            const notificationsData = await notificationsResponse.json();
            setNotifications(notificationsData.notifications || []);
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          // Fallback to sample notifications if API fails
          setNotifications([
            {
              id: '1',
              title: 'New Module Available!',
              message: 'Mathematics Advanced Topics is now available in your learning path.',
              type: 'info',
              date: new Date().toISOString(),
              read: false
            },
            {
              id: '2',
              title: 'Quiz Reminder',
              message: 'Don&apos;t forget to complete your Science quiz before tomorrow.',
              type: 'warning',
              date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
              read: false
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Function to test API connectivity
  const testApiConnectivity = async () => {
    if (!user?.uniqueId) {
      console.error('❌ No uniqueId available for API test');
      return;
    }

    try {
      console.log('🧪 Testing API connectivity...');
      
      // Test the YouTube API endpoint directly
      const testUrl = `/api/youtube-data?uniqueid=${encodeURIComponent(user.uniqueId)}`;
      console.log('🌐 Testing URL:', testUrl);
      
      const response = await fetch(testUrl);
      const responseText = await response.text();
      
      console.log('📊 API Test Results:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
      
      // Try to parse as JSON
      if (responseText) {
        try {
          const jsonData = JSON.parse(responseText);
          console.log('✅ Parsed JSON response:', jsonData);
        } catch (e) {
          console.log('❌ Response is not valid JSON');
        }
      }
      
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
    }
  };

  // Function to trigger YouTube scrapping
  const triggerYouTubeScrapping = async () => {
    if (!user?.uniqueId) {
      console.error('❌ No uniqueId available for scrapping');
      return;
    }

    try {
      console.log('🚀 Getting current student data for uniqueId:', user.uniqueId);
      
      const response = await fetch('/api/webhook/trigger-current-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Current student data retrieved successfully:', result);
        
        // Wait a bit then try to fetch YouTube data again
        setTimeout(() => {
          if (user.uniqueId) {
            fetchYouTubeData(user.uniqueId);
          }
        }, 5000); // Wait 5 seconds before checking for new data
        
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = {
            status: response.status,
            statusText: response.statusText,
            message: 'Failed to parse error response as JSON'
          };
        }
        console.error('❌ Failed to get current student data:', errorData);
      }
    } catch (error) {
      console.error('❌ Error getting current student data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        uniqueId: user?.uniqueId
      });
    }
  };

  // Assessment data removed - diagnostic tab no longer available

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Subject to color mapping
  const subjectColors: Record<string, string> = {
    Mathematics: '#FFD600',
    Science: '#00C49A',
    Arts: '#2B6CB0',
    Computer: '#7C3AED',
    English: '#FF6B6B',
    History: '#F59E0B',
    Geography: '#10B981',
    Physics: '#EF4444',
    Chemistry: '#8B5CF6',
    Biology: '#06B6D4',
  };

  // Map recent activity to courses with real module names, show empty state if no data
  const courses: Course[] = dashboardData?.recentActivity && dashboardData.recentActivity.length > 0
    ? dashboardData.recentActivity.map((activity: { moduleId: string; progress: number }) => {
        const matchedModule = dashboardData.recommendedModules.find((m: { id: string; name: string }) => m.id === activity.moduleId);
        return {
          title: matchedModule?.name || activity.moduleId,
          lessonsCompleted: `${activity.progress || 0}%`,
          duration: `${Math.round((activity.progress || 0) * 0.3)} min`,
          xp: `${Math.round((activity.progress || 0) * 0.8)}+ XP`,
          color: subjectColors[matchedModule?.subject || 'Mathematics'] || '#FFD600',
          progress: activity.progress,
          icon: getSubjectIcon(matchedModule?.subject || 'Mathematics')
        };
      })
    : [];

  // Continue Learning courses - use real recommended modules or show empty state
  const continueLearningCourses: ContinueLearningCourse[] = dashboardData?.recommendedModules && dashboardData.recommendedModules.length > 0
    ? dashboardData.recommendedModules.slice(0, 6).map((module) => ({
        title: module.name,
        duration: `${module.estimatedDuration || 30} min`,
        xp: module.xpPoints || 50,
        isLocked: false,
        icon: getSubjectIcon(module.subject),
        color: subjectColors[module.subject] || '#FFD600'
      }))
    : [];

  // Tests array - no diagnostic tests available
  const tests: Test[] = [];

  // Calculate real progress data, fallback to empty/default
  const progressData = dashboardData?.overview 
    ? {
        completedModules: dashboardData.overview.completedModules || 0,
        totalModules: dashboardData.overview.totalModules || 0,
        progressHistory: calculateProgressHistory(dashboardData),
        recentScores: calculateRecentScores(dashboardData),
        totalTimeSpent: dashboardData.progress.totalTimeSpent || 0,
      }
    : { completedModules: 0, totalModules: 0, progressHistory: [], recentScores: [], totalTimeSpent: 0 };

  // Map real badges data, fallback to empty
  const badgesData = dashboardData?.progress?.badgesEarned && dashboardData.progress.badgesEarned.length > 0
    ? dashboardData.progress.badgesEarned.map((badge: DashboardData['progress']['badgesEarned'][number]) => ({
        name: badge.name,
        description: badge.description,
        icon: '/badge-default.png',
        earnedAt: badge.earnedAt,
        xp: 100 // Default XP value for earned badges
      }))
    : [];

  // Map real profile data, fallback to minimal
  const profileData = user && dashboardData
    ? {
        name: dashboardData.overview.studentName || user.name || '',
        email: user.email || '',
        grade: dashboardData.overview.grade || user.profile?.grade || '',
        school: dashboardData.overview.school || user.profile?.school || '',
        language: 'English', // Default language
        studentKey: dashboardData.overview.studentKey || 'Not available',
      }
    : { name: '', email: '', grade: '', school: '', language: 'English', studentKey: 'Not available' };

  // Helper function to get subject icon
  function getSubjectIcon(subject: string): string {
    const iconMap: Record<string, string> = {
      'Mathematics': '📐',
      'Science': '🧪',
      'Arts': '🎨',
      'Computer': '💻',
      'English': '📚',
      'History': '🏛️',
      'Geography': '🌍',
      'Physics': '⚡',
      'Chemistry': '🧬',
      'Biology': '🌱'
    };
    return iconMap[subject] || '📄';
  }

  // Handle profile updates
  const handleProfileUpdate = async (updatedProfile: Partial<typeof profileData>) => {
    // Update the user state immediately for optimistic UI updates
    if (user) {
      setUser(prev => prev ? {
        ...prev,
        name: updatedProfile.name || prev.name,
        profile: {
          ...prev.profile,
          grade: updatedProfile.grade || prev.profile?.grade,
          school: updatedProfile.school || prev.profile?.school,
        }
      } : prev);
    }

    // Refresh dashboard data to get the latest information
    try {
      const response = await fetch('/api/dashboard/student/overview');
      if (!response.ok) {
        throw new Error('Failed to fetch updated dashboard data');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    }
  };

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
      case 'warning': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
      case 'error': return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      default: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Stats cards data with proper fallbacks
  const statsCardsData = dashboardData?.overview ? [
    {
      title: 'Courses in Progress',
      value: String(dashboardData.overview.inProgressModules || 0),
      subtitle: `${Math.round((dashboardData.overview.inProgressModules || 0) * 7.5)}+ XP`, 
      icon: '/icons/courseinprogress.png',
      color: 'bg-orange-500'
    },
    {
      title: 'Courses Completed',
      value: String(dashboardData.overview.completedModules || 0),
      subtitle: `${Math.round((dashboardData.overview.completedModules || 0) * 10)}+ XP`,
      icon: '/icons/coursescompleted.png',
      color: 'bg-green-500'
    },
    {
      title: 'Certificates Earned',
      value: String(dashboardData.progress?.badgesEarned?.length || 0),
      subtitle: 'Achievement Level',
      icon: '/icons/certificatesearned.png',
      color: 'bg-blue-500'
    },
    {
      title: 'AI Avatar Support',
      value: '24/7',
      subtitle: 'Learning Support',
      icon: '/icons/bot.png',
      color: 'bg-yellow-500'
    }
  ] : [
    {
      title: 'Getting Started',
      value: '0',
      subtitle: 'Start your learning journey',
      icon: '/icons/overview.png',
      color: 'bg-gray-400'
    },
    {
      title: 'Available Modules',
      value: '0',
      subtitle: 'Explore learning content',
      icon: '/icons/modules.png',
      color: 'bg-purple-400'
    },
    {
      title: 'AI Avatar Support',
      value: '24/7',
      subtitle: 'Learning Support',
      icon: '/icons/bot.png',
      color: 'bg-yellow-500'
    }
  ];

  // Helper function to calculate progress history
  function calculateProgressHistory(data: DashboardData): number[] {
    if (!data.overview) return [0];
    
    const total = data.overview.totalModules;
    const completed = data.overview.completedModules;
    
    if (total === 0) return [0];
    
    // Create a simple progress history based on completion rate
    const baseProgress = Math.round((completed / total) * 100);
    return [baseProgress * 0.6, baseProgress * 0.7, baseProgress * 0.8, baseProgress * 0.9, baseProgress];
  }

  // Helper function to calculate recent scores
  function calculateRecentScores(data: DashboardData): number[] {
    if (!data.recentActivity || data.recentActivity.length === 0) return [0];
    
    // Calculate scores based on recent activity progress
    return data.recentActivity
      .slice(-5)
      .map(activity => Math.round(activity.progress))
      .filter(score => score > 0);
  }

  // Fix React Hook dependency
  useEffect(() => {
    if (activeTab === 'logout' && !logoutTriggered.current) {
      logoutTriggered.current = true;
      handleLogout();
    }
    if (activeTab !== 'logout') {
      logoutTriggered.current = false;
    }
  }, [activeTab]); // handleLogout is stable

  if (isLoading || dashboardLoading) {
    return (
      <ConsistentLoadingPage
        type="dashboard"
        title="Loading Dashboard"
        subtitle="Preparing your personalized learning environment..."
        tips={[
          'Loading your progress and achievements',
          'Preparing personalized recommendations',
          'Setting up your learning environment'
        ]}
      />
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  return (
    <motion.div 
      className="dashboard-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Enhanced Floating Background Elements */}
      <FloatingParticles 
        count={25} 
        colors={['#6D18CE', '#8B5CF6', '#A855F7', '#C084FC', '#EC4899', '#F59E0B']}
        className="z-0"
      />
      <MorphingBlob 
        className="top-20 right-10 z-0" 
        color="#8B5CF6" 
        size={350} 
      />
      <MorphingBlob 
        className="bottom-20 left-10 z-0" 
        color="#A855F7" 
        size={250} 
      />
      <MorphingBlob 
        className="top-1/2 left-1/4 z-0" 
        color="#EC4899" 
        size={180} 
      />
      
      {/* Additional Particle Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Floating Geometric Shapes */}
        {[...Array(8)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const left = (i * 73) % 100;
          const top = (i * 97) % 100;
          const xOffset = (i * 23) % 20 - 10;
          const duration = 6 + (i % 4);
          const delay = (i % 3) * 0.5;
          
          return (
            <motion.div
              key={`shape-${i}`}
              className="absolute w-4 h-4 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, xOffset, 0],
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
            />
          );
        })}
        
        {/* Floating Lines */}
        {[...Array(5)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const left = (i * 67) % 100;
          const top = (i * 89) % 100;
          const width = 100 + (i * 37) % 200;
          const xOffset = (i * 41) % 100 - 50;
          const duration = 4 + (i % 3);
          const delay = (i % 4) * 0.5;
          
          return (
            <motion.div
              key={`line-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}px`,
              }}
              animate={{
                x: [0, xOffset, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay,
              }}
            />
          );
        })}
      </div>

      
      {/* Scroll Progress Indicator */}
      <ScrollProgress 
        color="linear-gradient(90deg, #6D18CE, #8B5CF6, #A855F7)"
        height="3px"
        className="shadow-lg z-50"
      />
      
      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        role="student"
      />
      
      {/* Main Content Area */}
         <div className="dashboard-main bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5">
             <div className="absolute inset-0" style={{
               backgroundImage: `radial-gradient(circle at 25% 25%, #8B5CF6 2px, transparent 2px),
                                radial-gradient(circle at 75% 75%, #A855F7 2px, transparent 2px),
                                radial-gradient(circle at 50% 50%, #EC4899 1px, transparent 1px)`,
               backgroundSize: '50px 50px, 80px 80px, 30px 30px'
             }} />
           </div>
           
           {/* Floating Orbs */}
           <div className="absolute inset-0 pointer-events-none">
             {[...Array(3)].map((_, i) => (
               <motion.div
                 key={`orb-${i}`}
                 className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-xl"
                 style={{
                   left: `${20 + i * 30}%`,
                   top: `${10 + i * 20}%`,
                 }}
                 animate={{
                   y: [0, -20, 0],
                   x: [0, 10, 0],
                   scale: [1, 1.1, 1],
                 }}
                 transition={{
                   duration: 4 + i,
                   repeat: Infinity,
                   ease: "easeInOut",
                   delay: i * 0.5,
                 }}
               />
             ))}
           </div>
        {/* Enhanced Top Bar */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50 relative shadow-sm">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          
          {/* Animated Border */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          {/* Enhanced Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 items-center max-w-md">
            <motion.div 
              className="relative w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </motion.svg>
              <input
                type="text"
                placeholder="Search modules, topics, or questions..."
                className="w-full pl-10 pr-4 py-3 rounded-full border-0 bg-gradient-to-r from-gray-100 to-purple-50/50 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all duration-300 text-sm shadow-sm hover:shadow-md"
              />
              {/* Search Glow Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 pointer-events-none"
                whileFocus={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Dashboard</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
           
            
             {/* Enhanced Notification Bell */}
            <div className="relative">
               <motion.button 
                onClick={handleNotificationClick}
                 className="relative text-gray-900 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 touch-manipulation group"
                 whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
                 whileTap={{ scale: 0.95 }}
                 transition={{ duration: 0.2 }}
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="30.24" height="30.24" transform="translate(0.899902 1.38086)" fill="#F5F5F5"/>
                  <path d="M16.0204 3.90039C13.6812 3.90039 11.4378 4.82964 9.7837 6.48371C8.12963 8.13778 7.20039 10.3812 7.20039 12.7204V17.1657C7.20057 17.3611 7.15527 17.554 7.06809 17.7289L4.90467 22.0545C4.79899 22.2658 4.74908 22.5006 4.7597 22.7367C4.77032 22.9727 4.8411 23.2021 4.96533 23.4031C5.08956 23.6041 5.2631 23.77 5.46948 23.885C5.67586 24.0001 5.90823 24.0604 6.14451 24.0604H25.8963C26.1325 24.0604 26.3649 24.0001 26.5713 23.885C26.7777 23.77 26.9512 23.6041 27.0754 23.4031C27.1997 23.2021 27.2705 22.9727 27.2811 22.7367C27.2917 22.5006 27.2418 22.2658 27.1361 22.0545L24.9739 17.7289C24.8863 17.5541 24.8406 17.3612 24.8404 17.1657V12.7204C24.8404 10.3812 23.9111 8.13778 22.2571 6.48371C20.603 4.82964 18.3596 3.90039 16.0204 3.90039ZM16.0204 27.8404C15.2384 27.8408 14.4755 27.5987 13.8368 27.1473C13.1982 26.696 12.7153 26.0577 12.4546 25.3204H19.5862C19.3255 26.0577 18.8426 26.696 18.2039 27.1473C17.5653 27.5987 16.8024 27.8408 16.0204 27.8404Z" fill="#A5A5A5"/>
                  <circle cx="23.58" cy="6.27336" r="5.78118" fill="#FDBB30"/>
                  <path d="M21.8094 7.82227V7.15526L23.579 5.42054C23.7482 5.24964 23.8893 5.09782 24.0021 4.96508C24.1149 4.83234 24.1995 4.70375 24.2559 4.57931C24.3124 4.45487 24.3406 4.32213 24.3406 4.1811C24.3406 4.02015 24.3041 3.88244 24.2311 3.76795C24.158 3.6518 24.0577 3.56221 23.9299 3.49916C23.8021 3.43611 23.657 3.40458 23.4944 3.40458C23.3268 3.40458 23.1799 3.43942 23.0538 3.50911C22.9277 3.57714 22.8298 3.6742 22.7601 3.80031C22.6921 3.92641 22.6581 4.07657 22.6581 4.25078H21.7795C21.7795 3.92724 21.8534 3.646 22.0011 3.40707C22.1487 3.16814 22.352 2.98314 22.6108 2.85206C22.8713 2.72098 23.17 2.65544 23.5068 2.65544C23.8486 2.65544 24.1489 2.71932 24.4078 2.84708C24.6666 2.97484 24.8674 3.14989 25.0101 3.37223C25.1544 3.59456 25.2266 3.84842 25.2266 4.13381C25.2266 4.32462 25.1901 4.51211 25.1171 4.69629C25.0441 4.88046 24.9155 5.08454 24.7313 5.30854C24.5488 5.53254 24.2924 5.80382 23.9623 6.12239L23.0837 7.01588V7.05073H25.3037V7.82227H21.8094Z" fill="white"/>
                </svg>
                 {/* Enhanced Notification count */}
                {unreadCount > 0 && (
                   <motion.span 
                     className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg"
                     animate={{ 
                       scale: [1, 1.2, 1],
                       rotate: [0, 5, -5, 0]
                     }}
                     transition={{ 
                       duration: 2, 
                       repeat: Infinity, 
                       ease: "easeInOut" 
                     }}
                   >
                    {unreadCount > 9 ? '9+' : unreadCount}
                   </motion.span>
                 )}
                 
                 {/* Pulsing Ring Effect */}
                 {unreadCount > 0 && (
                   <motion.div
                     className="absolute inset-0 rounded-full border-2 border-orange-400/50"
                     animate={{
                       scale: [1, 1.3, 1],
                       opacity: [0.8, 0, 0.8],
                     }}
                     transition={{
                       duration: 2,
                       repeat: Infinity,
                       ease: "easeInOut",
                     }}
                   />
                 )}
               </motion.button>

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      {/* Purple Notification Bell */}
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="30.24" height="30.24" transform="translate(0.899902 1.38086)" fill="#F5F5F5"/>
                          <path d="M16.0204 3.90039C13.6812 3.90039 11.4378 4.82964 9.7837 6.48371C8.12963 8.13778 7.20039 10.3812 7.20039 12.7204V17.1657C7.20057 17.3611 7.15527 17.554 7.06809 17.7289L4.90467 22.0545C4.79899 22.2658 4.74908 22.5006 4.7597 22.7367C4.77032 22.9727 4.8411 23.2021 4.96533 23.4031C5.08956 23.6041 5.2631 23.77 5.46948 23.885C5.67586 24.0001 5.90823 24.0604 6.14451 24.0604H25.8963C26.1325 24.0604 26.3649 24.0001 26.5713 23.885C26.7777 23.77 26.9512 23.6041 27.0754 23.4031C27.1997 23.2021 27.2705 22.9727 27.2811 22.7367C27.2917 22.5006 27.2418 22.2658 27.1361 22.0545L24.9739 17.7289C24.8863 17.5541 24.8406 17.3612 24.8404 17.1657V12.7204C24.8404 10.3812 23.9111 8.13778 22.2571 6.48371C20.603 4.82964 18.3596 3.90039 16.0204 3.90039ZM16.0204 27.8404C15.2384 27.8408 14.4755 27.5987 13.8368 27.1473C13.1982 26.696 12.7153 26.0577 12.4546 25.3204H19.5862C19.3255 26.0577 18.8426 26.696 18.2039 27.1473C17.5653 27.5987 16.8024 27.8408 16.0204 27.8404Z" fill="#A5A5A5"/>
                          <circle cx="23.58" cy="6.27336" r="5.78118" fill="#FDBB30"/>
                          <path d="M21.8094 7.82227V7.15526L23.579 5.42054C23.7482 5.24964 23.8893 5.09782 24.0021 4.96508C24.1149 4.83234 24.1995 4.70375 24.2559 4.57931C24.3124 4.45487 24.3406 4.32213 24.3406 4.1811C24.3406 4.02015 24.3041 3.88244 24.2311 3.76795C24.158 3.6518 24.0577 3.56221 23.9299 3.49916C23.8021 3.43611 23.657 3.40458 23.4944 3.40458C23.3268 3.40458 23.1799 3.43942 23.0538 3.50911C22.9277 3.57714 22.8298 3.6742 22.7601 3.80031C22.6921 3.92641 22.6581 4.07657 22.6581 4.25078H21.7795C21.7795 3.92724 21.8534 3.646 22.0011 3.40707C22.1487 3.16814 22.352 2.98314 22.6108 2.85206C22.8713 2.72098 23.17 2.65544 23.5068 2.65544C23.8486 2.65544 24.1489 2.71932 24.4078 2.84708C24.6666 2.97484 24.8674 3.14989 25.0101 3.37223C25.1544 3.59456 25.2266 3.84842 25.2266 4.13381C25.2266 4.32462 25.1901 4.51211 25.1171 4.69629C25.0441 4.88046 24.9155 5.08454 24.7313 5.30854C24.5488 5.53254 24.2924 5.80382 23.9623 6.12239L23.0837 7.01588V7.05073H25.3037V7.82227H21.8094Z" fill="white"/>
                        </svg>
                      </div>
                      
                      {/* User Avatar and Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                          <Image src="/studentDashboard/avatar.png" alt="User Avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-sm">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-600">
                            #{user._id?.toString().slice(-4) || '0000'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto bg-gray-50">
                    {notifications.length > 0 ? (
                      notifications.map((notification, index) => (
                        <div
                          key={notification.id}
                          className="bg-white mx-3 my-2 rounded-lg shadow-sm border border-gray-100 p-3 cursor-pointer hover:shadow-md transition-all duration-200"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            {/* Purple Circle Icon */}
                            <div className="w-3 h-3 bg-purple-600 rounded-full flex-shrink-0 mt-1"></div>
                            
                            <div className="flex-1 min-w-0">
                              {/* Notification Header */}
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatNotificationTime(notification.date)}
                                  </span>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </div>
                              
                              {/* Notification Content */}
                              <div className="text-sm text-gray-700">
                                <span className="font-medium">Hi {user.name}!</span> {notification.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                          Share
                        </button>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Overlay to close dropdown */}
              {isNotificationOpen && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationOpen(false)}
                ></div>
              )}
            </div>
            
             {/* Enhanced User Profile Section */}
             <motion.div 
               className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200/50 flex items-center gap-3 group hover:shadow-xl transition-all duration-300"
               whileHover={{ scale: 1.02, y: -2 }}
               whileTap={{ scale: 0.98 }}
             >
               {/* Enhanced Circular Avatar */}
               <motion.div 
                 className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300"
                 whileHover={{ rotate: 360 }}
                 transition={{ duration: 0.6 }}
               >
                <Image src="/studentDashboard/avatar.png" alt="User Avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                 
                 {/* Online Status Indicator */}
                 <motion.div
                   className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                   animate={{ scale: [1, 1.2, 1] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                 />
                 
                 {/* Glow Effect */}
                 <motion.div
                   className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/50 to-pink-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                   animate={{ rotate: 360 }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 />
               </motion.div>
               
               {/* Enhanced User Info */}
              <div className="flex flex-col">
                 <motion.span 
                   className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition-colors duration-300"
                   whileHover={{ x: 2 }}
                 >
                  {user.name}
                 </motion.span>
                 <motion.span 
                   className="text-xs text-gray-600 group-hover:text-purple-500 transition-colors duration-300"
                   whileHover={{ x: 2 }}
                 >
                  #{user._id?.toString().slice(-4) || '0000'}
                 </motion.span>
              </div>
               
               {/* Hover Arrow */}
               <motion.div
                 className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                 animate={{ x: [0, 3, 0] }}
                 transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
               >
                 <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                 </svg>
               </motion.div>
             </motion.div>
          </div>
        </div>
        
        {/* Debug Info Panel - Development Only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-4 rounded-lg text-xs font-mono max-w-sm max-h-96 overflow-y-auto">
            <h3 className="font-bold mb-2 text-green-400">Debug Info v2.1</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>User:</span>
                <span className={user ? 'text-green-400' : 'text-yellow-400'}>
                  {user ? 'Loaded' : 'Loading...'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>UniqueId:</span>
                <span className={user?.uniqueId ? 'text-green-400' : 'text-red-400'}>
                  {user?.uniqueId || 'Not available'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>User Role:</span>
                <span>{user?.role || 'Unknown'}</span>
              </div>
              
              <div className="flex justify-between">
                <span>User Email:</span>
                <span className="text-xs truncate">{user?.email || 'Unknown'}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Processing:</span>
                <span className={youtubeLoading ? 'text-yellow-400' : 'text-gray-400'}>
                  {youtubeLoading ? 'Yes' : 'No'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>Progress:</span>
                <span>{dashboardData?.overview ? `${dashboardData.overview.completedModules}/${dashboardData.overview.totalModules}` : '0/0'}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isLoading || dashboardLoading || youtubeLoading ? 'text-yellow-400' : 'text-green-400'}>
                  {isLoading ? 'Loading' : dashboardLoading ? 'Fetching Data' : youtubeLoading ? 'Loading YouTube' : 'Idle'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>YouTube Data:</span>
                <span className={youtubeData ? 'text-green-400' : 'text-red-400'}>
                  {youtubeData ? `${youtubeData.totalChapters} chapters` : 'Not available'}
                </span>
              </div>
              
              {user?.uniqueId && (
                <div className="pt-2 border-t border-gray-600">
                  <div className="text-xs text-gray-300 mb-1">API Test:</div>
                  <div className="text-xs break-all">
                    /api/youtube-data?uniqueid={user.uniqueId}
                  </div>
                </div>
              )}
            </div>
            
            {!youtubeData && user?.uniqueId && (
              <button 
                onClick={triggerYouTubeScrapping}
                className="mt-3 w-full px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-600"
                disabled={youtubeLoading}
              >
                {youtubeLoading ? 'Processing...' : 'Trigger YouTube Scrapping'}
              </button>
            )}
            
            {user?.uniqueId && (
              <>
                <button 
                  onClick={() => fetchYouTubeData(user.uniqueId!)}
                  className="mt-1 w-full px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-600"
                  disabled={youtubeLoading}
                >
                  {youtubeLoading ? 'Loading...' : 'Retry YouTube Fetch'}
                </button>
                
                <button 
                  onClick={testApiConnectivity}
                  className="mt-1 w-full px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                >
                  Test API Connectivity
                </button>
                
                <button 
                  onClick={() => {
                    console.log('🔄 Force refreshing page to clear cache...');
                    window.location.reload();
                  }}
                  className="mt-1 w-full px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                >
                  Force Refresh Page
                </button>
                
                <button 
                  onClick={async () => {
                    console.log('🧪 Testing YouTube data structure...');
                    try {
                      const response = await fetch('/api/test-youtube-structure');
                      if (response.ok) {
                        const result = await response.json();
                        console.log('✅ Structure test result:', result);
                        alert(`Structure test ${result.success ? 'PASSED' : 'FAILED'}!\nCheck console for details.`);
                      } else {
                        let errorData;
                        try {
                          errorData = await response.json();
                        } catch (jsonError) {
                          errorData = {
                            status: response.status,
                            statusText: response.statusText,
                            message: 'Failed to parse error response as JSON'
                          };
                        }
                        console.error('❌ Structure test failed:', errorData);
                        alert(`Structure test failed! Status: ${response.status}\nCheck console for details.`);
                      }
                    } catch (error) {
                      console.error('❌ Structure test failed:', error);
                      alert('Structure test failed! Check console for details.');
                    }
                  }}
                  className="mt-1 w-full px-2 py-1 bg-cyan-600 text-white rounded text-xs hover:bg-cyan-700"
                >
                  Test Data Structure
                </button>
              </>
            )}
          </div>
        )}

        {/* Main Content with Responsive Layout */}
        <div className="dashboard-content relative">
          {/* Content Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient Orbs */}
            {[...Array(4)].map((_, i) => {
              // Use deterministic positioning based on index to avoid hydration mismatch
              const left = (i * 79) % 100;
              const top = (i * 83) % 100;
              const xOffset = (i * 47) % 50 - 25;
              const yOffset = (i * 53) % 50 - 25;
              const duration = 8 + (i % 4);
              const delay = (i % 3) * 0.5;
              
              return (
                <motion.div
                  key={`content-orb-${i}`}
                  className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-purple-400/5 to-pink-400/5 blur-3xl"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                  animate={{
                    x: [0, xOffset, 0],
                    y: [0, yOffset, 0],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay,
                  }}
                />
              );
            })}
            
            {/* Floating Dots */}
            {[...Array(12)].map((_, i) => {
              // Use deterministic positioning based on index to avoid hydration mismatch
              const left = (i * 71) % 100;
              const top = (i * 91) % 100;
              const duration = 3 + (i % 2);
              const delay = (i % 5) * 0.4;
              
              return (
                <motion.div
                  key={`content-dot-${i}`}
                  className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay,
                  }}
                />
              );
            })}
          </div>
          {/* Main Panel */}
          <main className="flex-1">
            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div 
                className="space-y-6"
                key={activeTab}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >

              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Welcome Section */}
                  <motion.div 
                    className="mb-6"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left side: Avatar and quest text */}
                      <motion.div 
                        className="flex items-center gap-4"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                      >
                        <motion.div 
                          className="relative w-16 h-16 sm:w-20 sm:h-20"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Image src="/studentDashboard/avatar.png" alt="Student Avatar" fill className="rounded-full object-cover shadow-lg hover-bounce" />
                        </motion.div>
                        <div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                          >
                            <StaggeredText
                              text={`Welcome back, ${user.name}!`}
                              className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1"
                              delay={0.2}
                              staggerDelay={0.05}
                              animationType="fadeUp"
                            />
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                          >
                            <TypewriterText
                              text="Ready for another fun quest?"
                              className="text-gray-600 text-lg sm:text-xl font-medium"
                              delay={0.8}
                              speed={0.04}
                              cursor={false}
                            />
                          </motion.div>
                        </div>
                      </motion.div>
                      
                      {/* Right side: Stats cards */}
                       <motion.div 
                         className="flex gap-4"
                         initial={{ opacity: 0, x: 30 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.3, duration: 0.6 }}
                       >
                        {/* XP Points Card */}
                        <TiltCard className="min-w-[140px]" tiltStrength={8} glareEffect={true}>
                          <motion.div 
                            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-sm border border-purple-200 min-h-[100px] hover:shadow-md transition-all duration-300 flex flex-col justify-center hover-bounce group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                          >
                            <motion.div
                              className="text-3xl font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300"
                              animate={{ 
                                scale: [1, 1.05, 1],
                                textShadow: [
                                  "0 0 0px rgba(147, 51, 234, 0)",
                                  "0 0 10px rgba(147, 51, 234, 0.3)",
                                  "0 0 0px rgba(147, 51, 234, 0)"
                                ]
                              }}
                              transition={{ 
                                duration: 2, 
                                repeat: Infinity, 
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                            >
                              <ScrollCounter
                                from={0}
                                to={dashboardData?.overview?.totalXp || 0}
                                duration={2}
                                className=""
                              />
                            </motion.div>
                            <div className="text-sm text-purple-700 font-medium">XP Points</div>
                          </motion.div>
                        </TiltCard>
                        
                        {/* Badges Card */}
                        <motion.div 
                          className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-sm border border-emerald-200 min-w-[140px] min-h-[100px] hover:shadow-md transition-all duration-300 flex flex-col justify-center hover-bounce group"
                          whileHover={{ scale: 1.02, y: -2 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.6 }}
                        >
                          <motion.div 
                            className="text-3xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300"
                            animate={{ 
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 1.5
                            }}
                          >
                            {dashboardData?.progress?.badgesEarned?.length || 0}
                          </motion.div>
                          <div className="text-sm text-emerald-700 font-medium">Badges</div>
                        </motion.div>
                        
                        {/* Modules Card */}
                        <motion.div 
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-sm border border-blue-200 min-w-[140px] min-h-[100px] hover:shadow-md transition-all duration-300 flex flex-col justify-center hover-bounce group"
                          whileHover={{ scale: 1.02, y: -2 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6, duration: 0.6 }}
                        >
                          <motion.div 
                            className="text-3xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300"
                            animate={{ 
                              scale: [1, 1.05, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 2
                            }}
                          >
                            {dashboardData?.overview?.totalModules || 0}
                          </motion.div>
                          <div className="text-sm text-blue-700 font-medium">Modules</div>
                        </motion.div>
                      </motion.div>
                          </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                  <OverviewTab 
                    courses={courses}
                    tests={tests}
                    onTabChange={setActiveTab}
                    dashboardData={dashboardData}
                    user={user ? { uniqueId: user.uniqueId || undefined } : undefined}
                    youtubeData={youtubeData}
                    youtubeLoading={youtubeLoading}
                    onTriggerYouTubeScrapping={triggerYouTubeScrapping}
                  />
                  </motion.div>
                </motion.div>
              )}
              {activeTab === 'modules' && <ModulesTab user={user} />}
              {activeTab === 'progress' && <ProgressTab progress={progressData} onTabChange={setActiveTab} />}
              {activeTab === 'rewards' && <RewardsTab badges={badgesData} onTabChange={setActiveTab} />}
              {activeTab === 'settings' && <SettingsTab profile={profileData} onProfileUpdate={handleProfileUpdate} />}
              {/* Fallback for unknown tab */}
              {![
                'overview',
                'modules',
                'progress',
                'rewards',
                'settings',
                'logout',
              ].includes(activeTab) && (
                <div className="card text-center text-gray-500">
                  Coming soon!
                </div>
              )}
              </motion.div>
            </AnimatePresence>
          </main>
          
          {/* Enhanced Right Panel */}
          <motion.aside 
            className={`dashboard-right-panel ${isRightPanelOpen ? 'open' : ''} flex flex-col justify-between`}
            onMouseEnter={() => !isMobile && setIsRightPanelHovered(true)}
            onMouseLeave={() => !isMobile && setIsRightPanelHovered(false)}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Enhanced Arrow indicator for expandability - centered in collapsed state (desktop only) */}
            {!isMobile && (
              <motion.div 
                className={`flex justify-center items-center ${isRightPanelHovered ? 'h-16' : 'flex-1'}`}
                animate={{ 
                  scale: isRightPanelHovered ? 1.05 : 1,
                  y: isRightPanelHovered ? -5 : 0
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-300 hover:text-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, 0]
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 4px 8px rgba(0,0,0,0.1)",
                      "0 8px 16px rgba(139, 92, 246, 0.2)",
                      "0 4px 8px rgba(0,0,0,0.1)"
                    ]
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  style={{ transform: isRightPanelHovered ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.div>
              </motion.div>
            )}
            {/* Panel Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 p-4">
              {/* Title and Close button for mobile */}
                <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 transition-opacity duration-200"
                    style={{ opacity: isMobile ? 1 : (isRightPanelHovered ? 1 : 0) }}>
                  Upcoming Tests
                </h3>
                {isMobile && (
                  <button 
                    onClick={() => setIsRightPanelOpen(false)}
                    className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {tests.length === 0 && (
                  <div className={`text-center text-gray-400 text-sm py-8 transition-opacity duration-200 ${isMobile ? '' : 'opacity-0 pointer-events-none'}`} 
                       style={!isMobile ? { opacity: isRightPanelHovered ? 1 : 0 } : {}}>
                    No upcoming tests
                  </div>
                )}
                {tests.map((test, index) => (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}> 
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: test.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">{test.title}</div>
                      <div className="text-xs text-gray-500">{test.date}</div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                ))}
              </div>
            </div>
            
          </motion.aside>
          
          {/* Mobile Right Panel Overlay */}
          {isRightPanelOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setIsRightPanelOpen(false)}
            />
          )}
          
        </div>
      </div>

      {/* Chat Modal */}
      {user && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          studentData={{
            name: user.name,
            email: user.email,
            uniqueId: user.uniqueId || undefined,
            grade: user.profile?.grade,
            school: user.profile?.school,
            studentId: user._id
          }}
        />
      )}


      {/* Enhanced Floating AI Chat Button */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center group overflow-hidden"
        aria-label="Open AI Chat"
        whileHover={{ 
          scale: 1.15,
          rotate: [0, -15, 15, 0],
          boxShadow: "0 25px 50px rgba(124, 58, 237, 0.6)"
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -12, 0],
          opacity: 1,
          scale: 1,
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
          opacity: { delay: 1, duration: 0.6, ease: "easeOut" },
          scale: { delay: 1, duration: 0.6, ease: "easeOut" }
        }}
        initial={{ opacity: 0, scale: 0, y: 100 }}
      >
        {/* Pulsing Ring Effect */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 0, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Background Gradient Animation */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Chat Icon */}
        <motion.svg 
          className="w-7 h-7 text-white z-10 relative group-hover:scale-110 transition-transform duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
        </motion.svg>

        {/* Notification Dot */}
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.button>
      
    </motion.div>
  );
} 