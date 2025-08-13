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
import SimpleGoogleTranslate from '../../components/SimpleGoogleTranslate';
import OverviewTab from './components/OverviewTab';

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
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-3 rounded-full border-0 bg-gray-100 text-gray-400 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm"
              />
            </div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Dashboard</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
           
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={handleNotificationClick}
                className="relative text-gray-900 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-gray-50 touch-manipulation"
              >
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="30.24" height="30.24" transform="translate(0.899902 1.38086)" fill="#F5F5F5"/>
                  <path d="M16.0204 3.90039C13.6812 3.90039 11.4378 4.82964 9.7837 6.48371C8.12963 8.13778 7.20039 10.3812 7.20039 12.7204V17.1657C7.20057 17.3611 7.15527 17.554 7.06809 17.7289L4.90467 22.0545C4.79899 22.2658 4.74908 22.5006 4.7597 22.7367C4.77032 22.9727 4.8411 23.2021 4.96533 23.4031C5.08956 23.6041 5.2631 23.77 5.46948 23.885C5.67586 24.0001 5.90823 24.0604 6.14451 24.0604H25.8963C26.1325 24.0604 26.3649 24.0001 26.5713 23.885C26.7777 23.77 26.9512 23.6041 27.0754 23.4031C27.1997 23.2021 27.2705 22.9727 27.2811 22.7367C27.2917 22.5006 27.2418 22.2658 27.1361 22.0545L24.9739 17.7289C24.8863 17.5541 24.8406 17.3612 24.8404 17.1657V12.7204C24.8404 10.3812 23.9111 8.13778 22.2571 6.48371C20.603 4.82964 18.3596 3.90039 16.0204 3.90039ZM16.0204 27.8404C15.2384 27.8408 14.4755 27.5987 13.8368 27.1473C13.1982 26.696 12.7153 26.0577 12.4546 25.3204H19.5862C19.3255 26.0577 18.8426 26.696 18.2039 27.1473C17.5653 27.5987 16.8024 27.8408 16.0204 27.8404Z" fill="#A5A5A5"/>
                  <circle cx="23.58" cy="6.27336" r="5.78118" fill="#FDBB30"/>
                  <path d="M21.8094 7.82227V7.15526L23.579 5.42054C23.7482 5.24964 23.8893 5.09782 24.0021 4.96508C24.1149 4.83234 24.1995 4.70375 24.2559 4.57931C24.3124 4.45487 24.3406 4.32213 24.3406 4.1811C24.3406 4.02015 24.3041 3.88244 24.2311 3.76795C24.158 3.6518 24.0577 3.56221 23.9299 3.49916C23.8021 3.43611 23.657 3.40458 23.4944 3.40458C23.3268 3.40458 23.1799 3.43942 23.0538 3.50911C22.9277 3.57714 22.8298 3.6742 22.7601 3.80031C22.6921 3.92641 22.6581 4.07657 22.6581 4.25078H21.7795C21.7795 3.92724 21.8534 3.646 22.0011 3.40707C22.1487 3.16814 22.352 2.98314 22.6108 2.85206C22.8713 2.72098 23.17 2.65544 23.5068 2.65544C23.8486 2.65544 24.1489 2.71932 24.4078 2.84708C24.6666 2.97484 24.8674 3.14989 25.0101 3.37223C25.1544 3.59456 25.2266 3.84842 25.2266 4.13381C25.2266 4.32462 25.1901 4.51211 25.1171 4.69629C25.0441 4.88046 24.9155 5.08454 24.7313 5.30854C24.5488 5.53254 24.2924 5.80382 23.9623 6.12239L23.0837 7.01588V7.05073H25.3037V7.82227H21.8094Z" fill="white"/>
                </svg>
                {/* Notification count */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

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
            
            {/* User Profile Section */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center gap-3">
              {/* Circular Avatar */}
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Image src="/studentDashboard/avatar.png" alt="User Avatar" width={36} height={36} className="w-9 h-9 rounded-full object-cover" />
              </div>
              
              {/* User Info */}
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
                      {/* Left side: Avatar and quest text */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                          <Image src="/studentDashboard/avatar.png" alt="Student Avatar" fill className="rounded-full object-cover" />
                        </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                            Welcome back, {user.name}!
                          </h2>
                          <p className="text-gray-600 text-lg sm:text-xl font-medium">
                            Ready for another fun quest?
                          </p>
                        </div>
                      </div>
                      
                      {/* Right side: Stats cards */}
                      <div className="flex gap-4">
                        {/* XP Points Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {dashboardData?.overview?.totalXp || 0}
                          </div>
                          <div className="text-sm text-gray-900">XP Points</div>
                        </div>
                        
                        {/* Badges Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {dashboardData?.progress?.badgesEarned?.length || 0}
                          </div>
                          <div className="text-sm text-gray-900">Badges</div>
                        </div>
                        
                        {/* Modules Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {dashboardData?.overview?.totalModules || 0}
                          </div>
                          <div className="text-sm text-gray-900">Modules</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <OverviewTab 
                    courses={courses}
                    tests={tests}
                    onTabChange={setActiveTab}
                    dashboardData={dashboardData}
                  />
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

      {/* Floating AI Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 flex items-center justify-center"
        aria-label="Open AI Chat"
        style={{
          boxShadow: '0 4px 12px rgba(124,58,237,0.3)'
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
        </svg>
      </button>
      
    </div>
  );
} 