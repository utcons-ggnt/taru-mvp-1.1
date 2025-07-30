'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Image from 'next/image';
import { isValidProfilePictureUrl } from '@/lib/utils';
import ChatModal from '../student/components/ChatModal';

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
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Parent-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'child-progress', label: 'Child Progress', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
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
    // Toggle notification panel
  };

  // Unused notification functions - commented out to fix ESLint warnings
  // const markNotificationAsRead = (notificationId: string) => {
  //   setNotifications(prev => 
  //     prev.map(n => 
  //       n.id === notificationId ? { ...n, read: true } : n
  //     )
  //   );
  // };

  // const markAllNotificationsAsRead = () => {
  //   setNotifications(prev => 
  //     prev.map(n => ({ ...n, read: true }))
  //   );
  // };

  // const getNotificationIcon = (type: Notification['type']) => {
  //   switch (type) {
  //     case 'success': return '✅';
  //     case 'warning': return '⚠️';
  //     case 'error': return '❌';
  //     default: return 'ℹ️';
  //   }
  // };

  // const getNotificationColor = (type: Notification['type']) => {
  //   switch (type) {
  //     case 'success': return 'text-green-600 bg-green-50 border-green-200';
  //     case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
  //     case 'error': return 'text-red-600 bg-red-50 border-red-200';
  //     default: return 'text-blue-600 bg-blue-50 border-blue-200';
  //   }
  // };

  // const formatNotificationTime = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
  //   if (diffInHours < 1) return 'Just now';
  //   if (diffInHours < 24) return `${diffInHours}h ago`;
  //   const diffInDays = Math.floor(diffInHours / 24);
  //   return `${diffInDays}d ago`;
  // };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800">
        {/* 🟪 Left Section - Content */}
        <section className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 text-white flex flex-col justify-between relative min-h-screen lg:min-h-0">
          <div>
            <Image src="/jio-logo.png" alt="Jio Logo" width={60} height={60} className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain" />
          </div>
          
          <div className="mt-16 sm:mt-20 lg:mt-32 px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Loading your <br />
              <span className="text-amber-400 font-extrabold">parent dashboard...</span>
            </h2>
          </div>
          
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-64 lg:h-64 mx-auto mt-4 sm:mt-6 lg:mt-2">
            <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-full h-full object-contain" />
          </div>
        </section>

        {/* ⬜ Right Section - White Card */}
        <section className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center relative min-h-screen lg:min-h-screen">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-0 h-full flex flex-col">
            {/* Loading Container - White Card */}
            <div 
              className="bg-white rounded-4xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full backdrop-blur-sm flex-1 flex flex-col justify-center items-center relative"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                backgroundPosition: '0 0, 0 0'
              }}
            >
              <div className="w-full max-w-md text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Preparing your parent portal...
                </h2>
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading your child&apos;s learning dashboard</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        navItems={navItems}
        role="parent"
      />
      
      {/* Main Content Area */}
      <div className="dashboard-main bg-gray-50">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 relative">
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 items-center max-w-md">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search child progress, reports..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
              />
            </div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Parent Dashboard</span>
          </div>
          
          {/* Language Selector and User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* AI Buddy Icon Button with Caption */}
            <div className="hidden sm:flex items-center mr-1">
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-full bg-purple-100 border border-purple-200 shadow hover:bg-purple-200 transition-all duration-200"
                aria-label="Open AI Buddy Chat"
                type="button"
              >
                <span className="text-2xl">🤖</span>
              </button>
              <span className="ml-2 text-sm font-medium text-purple-700 select-none">AI Buddy</span>
            </div>
            {/* Language Selector - Hidden on mobile */}
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="hidden sm:block border border-gray-400 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
            >
              <option value="English (USA)">English (USA)</option>
              <option value="हिन्दी">हिन्दी</option>
              <option value="मराठी">मराठी</option>
            </select>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="relative text-gray-900 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-gray-50 touch-manipulation"
              >
                <span className="text-xl sm:text-2xl">🔔</span>
                {/* Notification count */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <Image src="/avatar.png" alt="Parent Avatar" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
              <span className="hidden sm:block font-semibold text-gray-900 text-sm">Parent</span>
            </div>
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
                  {/* Welcome Section and Stats only for Overview */}
                  <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          Welcome back, Parent!
                        </h2>
                        <p className="text-gray-700 text-sm sm:text-base">
                          Monitor {child?.name || 'your child'}&apos;s learning journey 🚀
                        </p>
                      </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="w-full lg:w-auto">
                      <div className="stats-grid">
                        {stats.length > 0 ? stats.map((stat) => (
                          <div key={stat.label} className="card p-3 sm:p-4 flex flex-col items-center text-center min-w-0">
                            <span className="text-xl sm:text-2xl mb-1">{stat.icon}</span>
                            <span className="font-bold text-base sm:text-lg text-purple-600">{stat.value}</span>
                            <span className="text-xs text-gray-500 text-center leading-tight">{stat.label}</span>
                          </div>
                        )) : (
                          <div className="card p-3 sm:p-4 flex flex-col items-center text-center min-w-0">
                            <span className="text-2xl mb-1">📚</span>
                            <span className="font-bold text-lg text-gray-400">--</span>
                            <span className="text-xs text-gray-500 text-center">No data yet</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Child Profile Card */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">Today&apos;s progress</span>
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
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
                  <div className="bg-white rounded-xl shadow-sm p-6">
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
    </div>
  );
}