'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import OverviewTab from './components/OverviewTab';
import ModulesTab from './components/ModulesTab';
import DiagnosticTestTab from './components/DiagnosticTestTab';
import ProgressTab from './components/ProgressTab';
import RewardsTab from './components/RewardsTab';
import SettingsTab from './components/SettingsTab';
import ChatModal from './components/ChatModal';
import StatsCards from './components/StatsCards';
import Image from 'next/image';

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

export default function StudentDashboard() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const router = useRouter();
  const logoutTriggered = useRef(false);

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
        
        // Set sample notifications (in a real app, this would come from the API)
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
            message: 'Don\'t forget to complete your Science quiz before tomorrow.',
            type: 'warning',
            date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            read: false
          },
          {
            id: '3',
            title: 'Achievement Unlocked!',
            message: 'Congratulations! You\'ve earned the "Quick Learner" badge.',
            type: 'success',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            read: true
          },
          {
            id: '4',
            title: 'Study Streak',
            message: 'Amazing! You\'ve maintained a 7-day learning streak. Keep it up!',
            type: 'success',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            read: false
          }
        ]);
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

  // Dummy data for fallback
  // const dummyLearningModules = [
  //   {
  //     image: '/math.png',
  //     title: 'Mathematics basics',
  //     xp: 60,
  //     time: '20 min',
  //     progress: 60,
  //     enroll: false,
  //     moduleId: 'math-001',
  //   },
  //   {
  //     image: '/science.png',
  //     title: 'Science Experiments',
  //     xp: 50,
  //     time: '15 min',
  //     progress: 45,
  //     enroll: false,
  //     moduleId: 'science-001',
  //   },
  //   {
  //     image: '/arts.png',
  //     title: 'Creative Arts',
  //     xp: 75,
  //     time: '40 min',
  //     progress: 75,
  //     enroll: false,
  //     moduleId: 'arts-001',
  //   },
  //   {
  //     image: '/computer.png',
  //     title: 'Basic Computer',
  //     xp: 80,
  //     time: '30 min',
  //     progress: 80,
  //     enroll: false,
  //     moduleId: 'computer-001',
  //   },
  // ];
  // const dummyCourses = [
  //   { title: 'Mathematics basics', lessonsCompleted: '06/10 (60%)', duration: '20 min', xp: '60+ XP', color: '#FFD600' },
  //   { title: 'Science Experiments', lessonsCompleted: '04/10 (40%)', duration: '15 min', xp: '50+ XP', color: '#00C49A' },
  //   { title: 'Creative Arts', lessonsCompleted: '08/10 (80%)', duration: '40 min', xp: '75+ XP', color: '#2B6CB0' },
  //   { title: 'Basic Computer', lessonsCompleted: '10/10 (100%)', duration: '30 min', xp: '80+ XP', color: '#7C3AED' },
  // ];
  // const dummyTests = [
  //   { title: 'Mathematics basics', date: '30 Jul', color: '#FFD600' },
  //   { title: 'Science Experiments', date: '20 Jul', color: '#00C49A' },
  //   { title: 'Creative Arts', date: '10 Jul', color: '#2B6CB0' },
  //   { title: 'Basic Computer', date: '05 Jul', color: '#FF6B6B' },
  //   { title: 'AI Chat', date: '30 Jun', color: '#7C3AED' },
  // ];
  // const dummyProgress = {
  //   completedModules: 8,
  //   totalModules: 12,
  //   progressHistory: [60, 65, 70, 75, 80, 85, 90, 95],
  //   recentScores: [80, 85, 90, 88, 92],
  //   totalTimeSpent: 240,
  // };
  // const dummyBadges = [
  //   { name: 'Math Whiz', description: 'Completed all math modules', icon: '/math-badge.png', earnedAt: '2024-01-15' },
  //   { name: 'Science Star', description: 'Top score in science', icon: '/science-badge.png', earnedAt: '2024-01-10' },
  //   { name: 'Creative Champ', description: 'Excelled in creative arts', icon: '/arts-badge.png', earnedAt: '2024-01-05' },
  //   { name: 'Tech Guru', description: 'Mastered computer basics', icon: '/computer-badge.png', earnedAt: '2024-01-01' },
  // ];
  // const dummyProfile = {
  //   name: 'Aanya',
  //   email: 'aanya@student.com',
  //   grade: '7',
  //   school: 'Jio World School',
  //   language: 'English (USA)',
  //   studentKey: 'STU12345',
  // };



  // Map recent activity to courses with real module names, fallback to 'Coming soon'
  const courses = dashboardData?.recentActivity && dashboardData.recentActivity.length > 0
    ? dashboardData.recentActivity.map((activity: { moduleId: string; progress: number }) => {
        const matchedModule = dashboardData.recommendedModules.find((m: { id: string; name: string }) => m.id === activity.moduleId);
        return {
          title: matchedModule?.name || activity.moduleId,
          lessonsCompleted: `${activity.progress || 0}%`,
          duration: '',
          xp: '',
          color: subjectColors[matchedModule?.subject || 'Mathematics'] || '#FFD600',
          progress: activity.progress,
        };
      })
    : [];

  // Map assessment data to tests, fallback to empty
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
      icon: '📚',
      color: 'bg-orange-500'
    },
    {
      title: 'Courses Completed',
      value: String(dashboardData.overview.completedModules || 0),
      subtitle: `${Math.round((dashboardData.overview.completedModules || 0) * 10)}+ XP`,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      title: 'Certificates Earned',
      value: String(dashboardData.progress?.badgesEarned?.length || 0),
      subtitle: 'Achievement Level',
      icon: '🎓',
      color: 'bg-blue-500'
    },
    {
      title: 'AI Chat Available',
      value: '24/7',
      subtitle: 'Learning Support',
      icon: '🤖',
      color: 'bg-yellow-500'
    }
  ] : [
    {
      title: 'Getting Started',
      value: '0',
      subtitle: 'Complete setup first',
      icon: '🚀',
      color: 'bg-gray-400'
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
      <main className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-4 sm:px-6 py-8 text-white flex flex-col justify-between relative">
          <Image src="/jio-logo.png" alt="Jio Logo" width={56} height={56} className="absolute top-4 left-4 w-12 h-12 sm:w-14 sm:h-14 object-contain" />
          <div className="mt-16 sm:mt-20 lg:mt-32">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight px-2 sm:px-4 lg:px-10">
              Loading your <br />
              student dashboard...
            </h2>
          </div>
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-48 sm:w-56 lg:w-64 mx-auto mt-6 sm:mt-8 lg:mt-12" />
        </div>
        <div className="w-full lg:w-1/2 bg-white px-4 sm:px-8 py-8 lg:py-10 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4 text-sm sm:text-base">Preparing your learning experience...</p>
      </div>
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
        isOpen={isMobileMenuOpen}
        onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />
      
      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 relative">
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 items-center max-w-md">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search"
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
                  {/* OverviewTab content */}
                  <OverviewTab courses={courses} tests={tests} onTabChange={setActiveTab} />
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
          
          {/* Right Panel - Desktop Only */}
          <aside className="dashboard-right-panel">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tests</h3>
            <div className="space-y-3">
              {tests.map((test, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div 
                    className="w-3 h-3 rounded-full" 
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
              className="btn btn-primary w-full mt-6"
              onClick={() => setActiveTab('diagnostic')}
            >
              Take Diagnostic Test
            </button>
          </aside>
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-300 flex items-center justify-center z-40 touch-manipulation hover:scale-105"
      >
        <span className="text-lg sm:text-xl">🤖</span>
      </button>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        studentData={user}
      />
    </div>
  );
} 