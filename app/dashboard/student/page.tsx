'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import ModulesTab from './components/ModulesTab';
import DiagnosticTestTab from './components/DiagnosticTestTab';
import ProgressTab from './components/ProgressTab';
import RewardsTab from './components/RewardsTab';
import SettingsTab from './components/SettingsTab';
import ChatModal from './components/ChatModal';
import StatsCards from './components/StatsCards';
import Image from 'next/image';
import { motion } from 'framer-motion';

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
  uniqueId?: string; // Added for student unique ID
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
    diagnosticCompleted: boolean;
    diagnosticScore: number;
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
  const [language, setLanguage] = useState('English (USA)');
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
  


  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

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
            const studentResponse = await fetch('/api/student/profile');
            if (studentResponse.ok) {
              const studentData = await studentResponse.json();
              setUser({
                ...userData.user,
                uniqueId: studentData.uniqueId
              });
            } else {
              setUser(userData.user);
            }
          } catch (error) {
            console.error('Error fetching student profile:', error);
            setUser(userData.user);
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

  // Use data synchronization for assessment data
  const [assessmentData, setAssessmentData] = useState<DashboardData['assessment'] | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(true);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!user) return;
      try {
        setAssessmentLoading(true);
        const response = await fetch('/api/assessment/diagnostic');
        if (!response.ok) {
          throw new Error('Failed to fetch assessment data');
        }
        const data = await response.json();
        setAssessmentData(data.assessment);
      } catch (error) {
        console.error('Error fetching assessment data:', error);
      } finally {
        setAssessmentLoading(false);
      }
    };

    fetchAssessmentData();
  }, [user]);

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

  // Map assessment data to tests, show empty if no assessment completed
  const tests: Test[] = assessmentData?.diagnosticCompleted
    ? [{
        title: 'Learning Profile Assessment',
        date: assessmentData?.assessmentCompletedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        color: '#7C3AED',
        score: assessmentData.diagnosticScore || 0
      }]
    : [];

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
        earnedAt: badge.earnedAt
      }))
    : [];

  // Map real profile data, fallback to minimal
  const profileData = user && dashboardData
    ? {
        name: dashboardData.overview.studentName || user.name || '',
        email: user.email || '',
        grade: dashboardData.overview.grade || user.profile?.grade || '',
        school: dashboardData.overview.school || user.profile?.school || '',
        language: language,
        studentKey: dashboardData.overview.studentKey || 'Not available',
      }
    : { name: '', email: '', grade: '', school: '', language, studentKey: 'Not available' };

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
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
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
      title: 'Diagnostic Test',
      value: '0',
      subtitle: 'Assess your skills',
      icon: '/icons/diagnostic.png',
      color: 'bg-blue-400'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); // handleLogout is stable

  if (isLoading || dashboardLoading || assessmentLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#6D18CE]">
        <motion.div
          className="flex flex-col items-center justify-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"
            style={{ borderTopColor: '#FFFFFF' }}
          />
          <p className="mt-4 text-lg font-semibold">Loading your student dashboard...</p>
        </motion.div>
      </main>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        role="student"
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
                placeholder="Search courses, modules, or topics..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
              />
            </div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Dashboard</span>
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

              {/* Notifications Dropdown */}
              {isNotificationOpen && (
                <div className="notification-dropdown">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                              <span className="text-sm">{getNotificationIcon(notification.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatNotificationTime(notification.date)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <span className="text-4xl mb-2 block">🔔</span>
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <button className="text-xs text-purple-600 hover:text-purple-700 font-medium w-full text-center">
                        View all notifications
                      </button>
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
            
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <Image src="/avatar.png" alt="User Avatar" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
              <span className="hidden sm:block font-semibold text-gray-900 text-sm">
                {user.name} #{user._id?.toString().slice(-4) || '0000'}
              </span>
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
                          Welcome back, {user.name}!
                        </h2>
                        <p className="text-gray-700 text-sm sm:text-base">
                          {user.profile?.grade ? `Grade ${user.profile.grade}` : ''} 
                          {user.profile?.school ? ` • ${user.profile.school}` : ''}
                          {!user.profile?.grade && !user.profile?.school ? 'Ready for another fun quest? 🚀' : ''}
                        </p>
                      </div>
                    </div>
                    {/* Stats Cards */}
                    <div className="w-full lg:w-auto">
                      <StatsCards stats={statsCardsData} />
                    </div>
                  </div>

                  {/* Courses You're Taking Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Courses You&apos;re Taking</h3>
                    {courses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Course</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Progress</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700">XP Points</th>
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((course, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                                      style={{ backgroundColor: course.color }}
                                    >
                                      {course.icon}
                                    </div>
                                    <span className="font-medium text-gray-900">{course.title}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                          width: `${course.progress}%`, 
                                          backgroundColor: course.color 
                                        }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{course.lessonsCompleted}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{course.duration}</td>
                                <td className="py-3 px-4 text-sm font-medium text-purple-600">{course.xp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No courses in progress</h4>
                        <p className="text-gray-600 mb-4">Start your learning journey by exploring available modules</p>
                        <button 
                          onClick={() => setActiveTab('modules')}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Browse Modules
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Continue Learning Section */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
                    {continueLearningCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {continueLearningCourses.map((course, index) => (
                          <div 
                            key={index} 
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                                style={{ backgroundColor: course.color }}
                              >
                                {course.icon}
                              </div>
                              {course.isLocked && (
                                <span className="text-gray-400 text-lg">🔒</span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                              <span>{course.duration}</span>
                              <span className="font-medium text-purple-600">{course.xp} XP</span>
                            </div>
                            <button 
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                                course.isLocked 
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                  : 'bg-purple-600 text-white hover:bg-purple-700'
                              }`}
                              disabled={course.isLocked}
                            >
                              {course.isLocked ? 'Locked' : 'Enroll Now'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No recommended modules</h4>
                        <p className="text-gray-600 mb-4">Complete your diagnostic test to get personalized recommendations</p>
                        <button 
                          onClick={() => setActiveTab('diagnostic')}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Take Diagnostic Test
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
              {activeTab === 'modules' && <ModulesTab />}
              {activeTab === 'diagnostic' && <DiagnosticTestTab />}
              {activeTab === 'progress' && <ProgressTab progress={progressData} onTabChange={setActiveTab} />}
              {activeTab === 'rewards' && <RewardsTab badges={badgesData} onTabChange={setActiveTab} />}
              {activeTab === 'settings' && <SettingsTab profile={profileData} onProfileUpdate={handleProfileUpdate} />}
              {/* Fallback for unknown tab */}
              {![
                'overview',
                'modules',
                'diagnostic',
                'progress',
                'rewards',
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
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming Tests</h3>
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
                  Upcoming Tests
                </h3>
              )}
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
              <button 
                className={`btn btn-primary w-full mt-6 transition-opacity duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}
                onClick={() => setActiveTab('diagnostic')}
              >
                See all upcoming tests
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
      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        studentData={user}
      />

      {/* Floating FAB for right panel on mobile/tablet */}
      {isMobile && !isRightPanelOpen && (
        <button
          className="right-panel-fab"
          aria-label="Open Upcoming Tests"
          onClick={() => setIsRightPanelOpen(true)}
          onTouchStart={(e) => e.preventDefault()}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#f3e8ff',
            border: '2px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(124,58,237,0.25)',
            animation: 'pulse 2s infinite'
          }}
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      
    </div>
  );
} 