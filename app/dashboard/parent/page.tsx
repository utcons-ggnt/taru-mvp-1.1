'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Image from 'next/image';
import { isValidProfilePictureUrl } from '@/lib/utils';
import ChatModal from '../student/components/ChatModal';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ChildProfile {
  name: string;
  grade: string;
  avatar: string;
  school?: string;
  email?: string;
  id?: string;
}

interface RecentActivity {
  moduleId: string;
  status: string;
  progress: number;
  xpEarned: number;
  lastAccessed: string;
}

interface DashboardData {
  student: ChildProfile;
  studentDashboard: {
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
    recentActivity: RecentActivity[];
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      date: string;
      read: boolean;
    }>;
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
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

// Avatar utility functions
const AVAILABLE_AVATARS = [
  '/avatars/Group.svg',
  '/avatars/Group-1.svg',
  '/avatars/Group-2.svg',
  '/avatars/Group-3.svg',
  '/avatars/Group-4.svg',
  '/avatars/Group-5.svg',
  '/avatars/Group-6.svg',
  '/avatars/Group-7.svg',
  '/avatars/Group-8.svg'
];

function getRandomAvatar(userId?: string): string {
  if (userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const index = Math.abs(hash) % AVAILABLE_AVATARS.length;
    return AVAILABLE_AVATARS[index];
  }
  const randomIndex = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
  return AVAILABLE_AVATARS[randomIndex];
}

export default function ParentDashboard() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<Array<{ label: string; value: string; icon: string }>>([]);
  const [analytics, setAnalytics] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelHovered, setIsRightPanelHovered] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>('/avatars/Group.svg');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Parent-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
    { id: 'child-progress', label: 'Child Progress', icon: '/icons/report.png' },
    { id: 'reports', label: 'Reports', icon: '/icons/rewards.png' },
    { id: 'messages', label: 'Messages', icon: '/icons/bot.png' },
    { id: 'settings', label: 'Settings', icon: '/icons/settings.png' },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleLogout = useCallback(async () => {
    try {
      console.log('🔍 Logging out...');
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        console.log('🔍 Logout successful');
        router.push('/login');
      } else {
        console.error('🔍 Logout failed');
      }
    } catch (error) {
      console.error('🔍 Logout error:', error);
      // Still redirect to login even if logout API fails
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    const fetchUserAndDashboard = async () => {
      try {
        console.log('🔍 Fetching parent dashboard data...');
        
        // Fetch user
        const userRes = await fetch('/api/auth/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          console.log('🔍 User data:', userData.user);
          
          if (userData.user.role !== 'parent') {
            console.log('🔍 User is not a parent, redirecting to login');
            router.push('/login');
            return;
          }
          
          // Store user data in state
          setUser(userData.user);
        } else {
          console.log('🔍 Failed to fetch user data, redirecting to login');
          router.push('/login');
          return;
        }
        
        // Fetch dashboard data
        const dashRes = await fetch('/api/dashboard/parent/overview');
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          console.log('🔍 Dashboard data:', dashData);
          setDashboardData(dashData);

          // Set child info
          if (dashData.student) {
            setChild({
              name: dashData.student.name || '',
              grade: dashData.student.grade || '',
              avatar: dashData.student.profilePicture || '',
              school: dashData.student.school || '',
              email: dashData.student.email || '',
              id: dashData.student.id || '',
            });
          }

          // Set stats from studentDashboard.overview
          const sd = dashData.studentDashboard || {};
          if (sd.overview) {
            setStats([
              { 
                label: 'Modules Completed', 
                value: `${sd.overview.completedModules || 0}/${sd.overview.totalModules || 0}`, 
                icon: '📚' 
              },
              { 
                label: 'Average Score', 
                value: `${sd.overview.averageScore || 0}%`, 
                icon: '🎯' 
              },
              { 
                label: 'Total XP Earned', 
                value: `${sd.overview.totalXp || 0} XP`, 
                icon: '⭐' 
              },
            ]);
          }

          // Set analytics from studentDashboard.recentActivity
          if (sd.recentActivity && Array.isArray(sd.recentActivity)) {
            const activityAnalytics = sd.recentActivity.map((activity: RecentActivity) => 
              Math.round((activity.progress || 0) * 100)
            );
            // Fill remaining days with decreasing values for visual effect
            while (activityAnalytics.length < 7) {
              activityAnalytics.unshift(Math.max(0, (activityAnalytics[0] || 0) - 10));
            }
            setAnalytics(activityAnalytics.slice(-7));
          } else {
            // Default analytics for empty state
            setAnalytics([20, 35, 45, 60, 55, 70, 80]);
          }

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
                title: 'Child Progress Update',
                message: `${dashData.student?.name || 'Your child'} completed Mathematics Basics module.`,
                type: 'success',
                date: new Date().toISOString(),
                read: false
              },
              {
                id: '2',
                title: 'Weekly Report Available',
                message: 'Your child\'s weekly learning report is now available for review.',
                type: 'info',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                read: false
              }
            ]);
          }
        } else {
          setChild(null);
          setStats([]);
          setAnalytics([]);
        }
      } catch {
        // Handle error silently and use dummy data
        setChild(null);
        setStats([]);
        setAnalytics([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndDashboard();
  }, [router]);

  // Fix React Hook dependency
  useEffect(() => {
    if (activeTab === 'logout' && !logoutTriggered.current) {
      logoutTriggered.current = true;
      handleLogout();
    }
    if (activeTab !== 'logout') {
      logoutTriggered.current = false;
    }
  }, [activeTab]);

  const getCompletionPercentage = () => {
    if (!dashboardData?.studentDashboard?.overview) return 0;
    const { completedModules, totalModules } = dashboardData.studentDashboard.overview;
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };

  const getRecentActivities = () => {
    if (!dashboardData?.studentDashboard?.recentActivity) return [];
    return dashboardData.studentDashboard.recentActivity.slice(0, 5).map((activity) => ({
      title: activity.moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: activity.status,
      progress: activity.progress,
      xpEarned: activity.xpEarned,
      date: new Date(activity.lastAccessed).toLocaleDateString(),
    }));
  };

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleAvatarSelect = async (avatarPath: string) => {
    setUserAvatar(avatarPath);
    setIsAvatarSelectorOpen(false);
    
    // Save avatar selection to backend
    try {
      const response = await fetch('/api/user/update-avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: avatarPath
        }),
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('✅ Avatar saved successfully');
      } else {
        console.error('❌ Failed to save avatar:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error saving avatar:', error);
    }
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

  // Handle clicks outside notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationOpen]);

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

  if (isLoading) {
    return (
      <ConsistentLoadingPage
        type="dashboard"
        title="Loading Parent Dashboard"
        subtitle="Preparing your child's learning overview..."
        tips={[
          'Loading your child\'s progress and achievements',
          'Preparing learning analytics and reports',
          'Setting up your monitoring dashboard'
        ]}
      />
    );
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
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress 
        color="linear-gradient(90deg, #6D18CE, #8B5CF6, #A855F7)"
        height="3px"
        className="shadow-lg z-50"
      />
      
      {/* Responsive Sidebar */}
      <div className={`transition-all duration-300 ${isNotificationOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          navItems={navItems}
          role="parent"
        />
      </div>
      
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
        
        {/* Enhanced Top Bar */}
        <div className={`flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-md border-b border-gray-200/50 relative shadow-sm transition-all duration-300 ${isNotificationOpen ? 'blur-sm pointer-events-none' : ''}`}>
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
                placeholder="Search child progress, reports, or settings..."
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
            <span className="text-lg font-bold text-gray-800">Parent Dashboard</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Enhanced Notification Bell */}
            <div className="relative" ref={notificationRef}>
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
            </div>
            
            {/* Enhanced User Profile Section */}
            <motion.div 
              className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-gray-200/50 flex items-center gap-3 group hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Enhanced Circular Avatar */}
              <motion.button 
                className="relative w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300 cursor-pointer"
                whileHover={{ rotate: 360 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.6 }}
                onClick={() => setIsAvatarSelectorOpen(true)}
                title="Change Avatar"
              >
                <Image src={userAvatar} alt="User Avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                
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
              </motion.button>
              
              {/* Enhanced User Info */}
              <div className="flex flex-col">
                <motion.span 
                  className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition-colors duration-300"
                  whileHover={{ x: 2 }}
                >
                  {user?.name || 'Parent'}
                </motion.span>
                <motion.span 
                  className="text-xs text-gray-600 group-hover:text-purple-500 transition-colors duration-300"
                  whileHover={{ x: 2 }}
                >
                  Parent
                </motion.span>
              </div>
              
              {/* Hover Arrow */}
              <motion.div
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                onClick={() => setActiveTab('settings')}
              >
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Main Content with Responsive Layout */}
        <div className="dashboard-content">
          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto">
            {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <>
                  {/* Welcome Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {/* Left side: Avatar and welcome text */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                          <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                            Welcome back, {user?.name || 'Parent'}!
                          </h2>
                          <p className="text-gray-600 text-lg sm:text-xl font-medium">
                            Monitor {child?.name || 'your child'}&apos;s learning journey
                          </p>
                        </div>
                      </div>
                      
                      {/* Right side: Stats cards */}
                      <div className="flex gap-4">
                        {/* Modules Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {stats.find(s => s.label === 'Modules Completed')?.value?.split('/')[1] || 0}
                          </div>
                          <div className="text-sm text-gray-900">Total Modules</div>
                        </div>
                        
                        {/* Progress Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {stats.find(s => s.label === 'Modules Completed')?.value?.split('/')[0] || 0}
                          </div>
                          <div className="text-sm text-gray-900">Completed</div>
                        </div>
                        
                        {/* XP Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {stats.find(s => s.label === 'Total XP Earned')?.value?.replace(' XP', '') || 0}
                          </div>
                          <div className="text-sm text-gray-900">XP Points</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Child Profile Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Profile</h3>
                    <div className="flex items-center gap-6">
                      {child?.avatar && isValidProfilePictureUrl(child.avatar) ? (
                        <Image 
                          src={child.avatar}
                          alt="Child Avatar" 
                          width={80} height={80}
                          className="w-20 h-20 rounded-full object-cover border-2 border-purple-500" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-2xl">
                          {child?.name ? child.name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-xl truncate flex items-center gap-2">
                          {child?.name || <span className="text-gray-400">No child linked</span>}
                          {child?.grade && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-semibold">Grade {child.grade}</span>}
                        </div>
                        {child?.school && <div className="text-xs text-gray-500 mt-1 truncate">🏫 {child.school}</div>}
                        {child?.email && <div className="text-xs text-gray-500 mt-1 truncate">✉️ {child.email}</div>}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Progress</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Learning Progress</span>
                      <span className="text-sm text-gray-700">{getCompletionPercentage()}% Complete - {getCompletionPercentage() >= 80 ? 'Excellent work!' : 'Keep going!'} 🚀</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${getCompletionPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                      {getRecentActivities().length > 0 ? getRecentActivities().map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${
                            activity.type === 'completed' ? 'bg-green-500' : 
                            activity.type === 'in-progress' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></span>
                          <span>{activity.title} - {Math.round(activity.progress * 100)}% progress</span>
                        </div>
                      )) : (
                        <div className="text-gray-500 text-sm">No recent activity</div>
                      )}
                    </div>
                  </div>

                  {/* Weekly Analytics */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Analytics</h3>
                    <div className="flex items-end gap-1 h-20">
                      {analytics.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-4 bg-purple-400 rounded-t transition-all duration-500" 
                            style={{ height: `${Math.max(h, 5)}%` }}
                          ></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'child-progress' && (
                <div className="space-y-6">
                  {/* Progress Overview */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Overview</h3>
                    {dashboardData?.studentDashboard ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 mb-2">{dashboardData.studentDashboard.overview.completedModules}</div>
                          <div className="text-sm text-gray-500">Modules Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.studentDashboard.overview.totalXp}</div>
                          <div className="text-sm text-gray-500">XP Points Earned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 mb-2">{Math.floor(dashboardData.studentDashboard.progress.totalTimeSpent / 60)}h</div>
                          <div className="text-sm text-gray-500">Total Learning Time</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500">No progress data available</div>
                    )}
                  </div>

                  {/* Badges and Achievements */}
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Badges</h3>
                    {dashboardData?.studentDashboard?.progress?.badgesEarned?.length && dashboardData.studentDashboard.progress.badgesEarned.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData.studentDashboard.progress.badgesEarned.map((badge, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">🏆</div>
                            <div>
                              <div className="font-medium text-gray-900">{badge.name}</div>
                              <div className="text-xs text-gray-500">{new Date(badge.earnedAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">🏆</div>
                        <p>No badges earned yet. Keep learning to unlock achievements!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'reports' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Reports</h3>
                  {dashboardData?.studentDashboard ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Performance Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Average Score:</span>
                              <span className="font-semibold">{dashboardData.studentDashboard.overview.averageScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Modules Completed:</span>
                              <span className="font-semibold">{dashboardData.studentDashboard.overview.completedModules}/{dashboardData.studentDashboard.overview.totalModules}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time Invested:</span>
                              <span className="font-semibold">{Math.floor(dashboardData.studentDashboard.progress.totalTimeSpent / 60)}h {dashboardData.studentDashboard.progress.totalTimeSpent % 60}m</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Learning Insights</h4>
                          <div className="space-y-2 text-sm text-green-800">
                            <div>✓ Consistent learning patterns</div>
                            <div>✓ Strong engagement with interactive content</div>
                            <div>✓ Good progress tracking</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h4 className="font-medium text-gray-700 mb-4">Recent Module Performance</h4>
                        <div className="space-y-3">
                          {dashboardData.studentDashboard.recentActivity.slice(0, 5).map((activity, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium text-gray-900">{activity.moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                                <div className="text-sm text-gray-500">Last accessed: {new Date(activity.lastAccessed).toLocaleDateString()}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-purple-600">{Math.round(activity.progress * 100)}%</div>
                                <div className="text-sm text-gray-500">{activity.xpEarned} XP</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p>No report data available yet. Reports will appear as your child progresses through modules.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages & Communication</h3>
                  <div className="space-y-4">
                    {dashboardData?.studentDashboard?.notifications?.length && dashboardData.studentDashboard.notifications.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Recent Notifications</h4>
                        {dashboardData.studentDashboard.notifications.map((notification) => (
                          <div key={notification.id} className={`p-4 rounded-lg border ${
                            notification.type === 'success' ? 'bg-green-50 border-green-200' :
                            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                            'bg-blue-50 border-blue-200'
                          }`}>
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{notification.title}</div>
                                <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(notification.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <div className="text-4xl mb-2">💬</div>
                        <p>No messages yet. Communication features will be available soon.</p>
                      </div>
                    )}
                    
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-700 mb-4">Quick Actions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                          <div className="font-medium text-purple-900">📧 Contact Teacher</div>
                          <div className="text-sm text-purple-700 mt-1">Send a message to your child&apos;s teacher</div>
                        </button>
                        <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                          <div className="font-medium text-blue-900">📅 Schedule Meeting</div>
                          <div className="text-sm text-blue-700 mt-1">Book a parent-teacher conference</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                        <select
                          value={language}
                          onChange={e => handleLanguageChange(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                        >
                          <option value="English (USA)">English (USA)</option>
                          <option value="हिन्दी">हिन्दी</option>
                          <option value="मराठी">मराठी</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Email notifications for progress updates</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Weekly progress reports</span>
                          </label>
                          <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                            <span className="ml-2 text-sm text-gray-700">SMS notifications for important updates</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
                    {child ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.name}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.grade}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.school}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.email}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        <p>No child information available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Fallback for unknown tab */}
              {![
                'overview',
                'child-progress',
                'reports',
                'messages',
                'settings',
                'logout',
              ].includes(activeTab) && (
                <div className="card text-center text-gray-500">
                  Coming soon!
                </div>
              )}
            </div>
          </main>
          
          {/* Right Panel */}
          <aside 
            className={`dashboard-right-panel ${isRightPanelOpen ? 'open' : ''} flex flex-col justify-between`}
            onMouseEnter={() => !isMobile && setIsRightPanelHovered(true)}
            onMouseLeave={() => !isMobile && setIsRightPanelHovered(false)}
          >
            {/* Arrow indicator for expandability - centered in collapsed state (desktop only) */}
            {!isMobile && (
              <div className={`flex justify-center items-center ${isRightPanelHovered ? 'h-16' : 'flex-1'}`}>
                <div 
                  className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 shadow-md"
                  style={{ transform: isRightPanelHovered ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            )}
            {/* Panel Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 p-4">
              {/* Close button for mobile */}
              {isMobile && (
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                  <button 
                    onClick={() => setIsRightPanelOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              {/* Desktop title */}
              {!isMobile && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4 transition-opacity duration-200"
                    style={{ opacity: isRightPanelHovered ? 1 : 0 }}>
                  Quick Actions
                </h3>
              )}
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}> 
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">View Progress Report</div>
                    <div className="text-xs text-gray-500">Latest updates</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}> 
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Contact Teacher</div>
                    <div className="text-xs text-gray-500">Send message</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
              <button 
                className={`btn btn-primary w-full mt-6 transition-opacity duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}
                onClick={() => setActiveTab('reports')}
              >
                View all reports
              </button>
            </div>
            
          </aside>
          
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
      {child && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          studentData={{
            name: child.name || 'Student',
            grade: child.grade,
            email: child.email,
            school: child.school,
            studentId: child.id,
          }}
        />
      )}

      {/* Floating FAB for right panel on mobile/tablet */}
      {isMobile && !isRightPanelOpen && (
        <button
          className="right-panel-fab"
          aria-label="Open Quick Actions"
          onClick={() => setIsRightPanelOpen(true)}
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Notification Overlay - Outside blurred content */}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-[10000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsNotificationOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Notifications Dropdown - Outside blurred content */}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div 
            className="fixed right-4 top-20 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[10001]"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
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
                    <Image src={userAvatar} alt="User Avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-sm">
                      {user?.name || 'Parent'}
                    </span>
                    <span className="text-xs text-gray-600">
                      Parent
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
                          <span className="font-medium">Hi {user?.name || 'Parent'}!</span> {notification.message}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {isAvatarSelectorOpen && (
          <>
            {/* Dark Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-[10002]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsAvatarSelectorOpen(false)}
            />
            
            {/* Avatar Selector Modal */}
            <motion.div 
              className="fixed inset-0 flex items-center justify-center z-[10003] p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full max-h-[80vh] overflow-hidden"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Choose Your Avatar</h3>
                    <button
                      onClick={() => setIsAvatarSelectorOpen(false)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Select an avatar that represents you</p>
                </div>

                {/* Avatar Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    {AVAILABLE_AVATARS.map((avatar, index) => (
                      <motion.button
                        key={avatar}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                          userAvatar === avatar 
                            ? 'border-purple-500 bg-purple-50 shadow-lg' 
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                        onClick={() => handleAvatarSelect(avatar)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="w-16 h-16 mx-auto relative">
                          <Image 
                            src={avatar} 
                            alt={`Avatar ${index + 1}`} 
                            fill 
                            className="rounded-full object-cover" 
                          />
                        </div>
                        
                        {/* Selected Indicator */}
                        {userAvatar === avatar && (
                          <motion.div
                            className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Click on any avatar to select it
                    </p>
                    <button
                      onClick={() => setIsAvatarSelectorOpen(false)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </motion.div>
  );
}