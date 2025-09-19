'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText, StaggeredText, GradientText, CharacterAnimation } from '../../components/TextAnimations';
import { TiltCard, MagneticButton } from '../../components/InteractiveElements';
import { StaggerContainer, StaggerItem } from '../../components/PageTransitions';
import { ScrollFade, ScrollCounter, ParallaxScroll, ScrollProgress } from '../../components/ScrollAnimations';
import VantaBackground from '../../components/VantaBackground';
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

interface TeacherProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  profile: {
    subjectSpecialization?: string;
    experienceYears?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface StudentData {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  classGrade: string;
  schoolName: string;
  uniqueId: string;
  onboardingCompleted: boolean;
  joinedAt: string;
  totalModulesCompleted: number;
  totalXpEarned: number;
  learningStreak: number;
  badgesEarned: number;
  assessmentCompleted: boolean;
  diagnosticCompleted: boolean;
  diagnosticScore: number;
}

interface ModuleData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  duration: number;
  points: number;
}

interface TeacherStats {
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  totalAssignments: number;
  averageScore: number;
}

// Avatar utility functions
const AVAILABLE_AVATARS = [
  '/avatars/Group-1.svg',
  '/avatars/Group-2.svg',
  '/avatars/Group-3.svg',
  '/avatars/Group-4.svg',
  '/avatars/Group-5.svg',
  '/avatars/Group-6.svg',
  '/avatars/Group-7.svg',
  '/avatars/Group-8.svg',
  '/avatars/Group.svg',
];

const getRandomAvatar = () => {
  return AVAILABLE_AVATARS[Math.floor(Math.random() * AVAILABLE_AVATARS.length)];
};

export default function TeacherDashboard() {
  const [user, setUser] = useState<TeacherProfile | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [modules, setModules] = useState<ModuleData[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    activeStudents: 0,
    averageProgress: 0,
    totalAssignments: 0,
    averageScore: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [subjectSpecialization, setSubjectSpecialization] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelHovered, setIsRightPanelHovered] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState('/avatars/Group-1.svg');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Teacher-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
    { id: 'students', label: 'My Students', icon: '/icons/profile.png' },
    { id: 'modules', label: 'Learning Modules', icon: '/icons/modules.png' },
    { id: 'assignments', label: 'Assignments', icon: '/icons/report.png' },
    { id: 'analytics', label: 'Analytics', icon: '/icons/rewards.png' },
    { id: 'settings', label: 'Settings', icon: '/icons/settings.png' },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
    
    // Initialize avatar
    const savedAvatar = localStorage.getItem('teacherAvatar');
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    } else {
      setUserAvatar(getRandomAvatar());
    }
    
    // Initialize notifications
    setNotifications([
      {
        id: '1',
        title: 'New Student Joined',
        message: 'A new student has joined your class and completed their profile setup.',
        date: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        read: false,
        type: 'success'
      },
      {
        id: '2',
        title: 'Assignment Submitted',
        message: '3 students have submitted their latest assignment. Review their work.',
        date: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: false,
        type: 'info'
      },
      {
        id: '3',
        title: 'Progress Report Ready',
        message: 'Weekly progress report for your class is now available for download.',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true,
        type: 'info'
      }
    ]);
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleAvatarSelect = (avatar: string) => {
    setUserAvatar(avatar);
    // Here you would typically save to backend
    localStorage.setItem('teacherAvatar', avatar);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  useEffect(() => {
    const fetchUserAndDashboard = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'teacher') {
            router.push('/login');
            return;
          }
          setUser(userData.user);
          
          // Show onboarding if profile is incomplete
          if (!userData.user.profile?.subjectSpecialization || !userData.user.profile?.experienceYears) {
            setShowOnboarding(true);
            setSubjectSpecialization(userData.user.profile?.subjectSpecialization || '');
            setExperienceYears(userData.user.profile?.experienceYears || '');
          } else {
            // Fetch dashboard statistics
            try {
              const statsResponse = await fetch('/api/teacher/dashboard-stats');
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setDashboardStats(statsData);
                setStats(statsData);
              }
            } catch (error) {
              console.error('Error fetching dashboard stats:', error);
            }
            
            // Fetch students
            try {
              const studentsResponse = await fetch('/api/teacher/students');
              if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                setStudents(studentsData.students || []);
              }
            } catch (error) {
              console.error('Error fetching students:', error);
            }
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

    fetchUserAndDashboard();
  }, [router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectSpecialization,
          experienceYears
        })
      });
      if (response.ok) {
        setShowOnboarding(false);
        window.location.reload();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  if (isLoading) {
    return <ConsistentLoadingPage type="dashboard" title="Loading your teacher dashboard..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div 
      className="dashboard-container min-h-screen relative overflow-hidden"
    >
      {/* Background Elements */}
      <VantaBackground>
        <ScrollProgress />
      
      {/* Responsive Sidebar */}
      <div className={`${isNotificationOpen ? 'blur-sm' : ''} transition-all duration-300`}>
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          navItems={navItems}
          role="teacher"
        />
      </div>
      
      {/* Main Content Area */}
      <div className="dashboard-main relative min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        {/* Top Bar */}
        <div className="relative z-10 flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-blue-500/5"></div>
          
          {/* Animated Border */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 items-center max-w-md">
            <motion.div 
              className="relative w-full"
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search students, assignments..."
                className="w-full pl-10 pr-4 py-3 rounded-full border-0 bg-white/60 backdrop-blur-sm text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/80 transition-all duration-200 text-sm shadow-sm"
              />
            </motion.div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Teacher Dashboard</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            <motion.button
              className="relative p-2 rounded-full bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-200 shadow-sm"
              onClick={handleNotificationClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.div>
              )}
              
              {/* Pulsing Effect */}
              {unreadCount > 0 && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-red-500/20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
            
            {/* User Profile Section */}
            <motion.div 
              className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-gray-200/50 flex items-center gap-3 hover:bg-white/80 transition-all duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAvatarSelectorOpen(true)}
            >
              {/* Animated Avatar */}
              <motion.div 
                className="relative w-10 h-10 rounded-full overflow-hidden"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Image 
                  src={userAvatar} 
                  alt="Teacher Avatar" 
                  width={40} 
                  height={40} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Online Status Indicator */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
              </motion.div>
              
              {/* User Info */}
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">
                  {user.name}
                </span>
                <span className="text-xs text-gray-600">
                  Teacher
                </span>
              </div>
              
              {/* Hover Arrow */}
              <motion.div
                className="text-gray-400"
                animate={{ x: [0, 2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <motion.div 
                          className="relative w-16 h-16 sm:w-20 sm:h-20"
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                          </div>
                          {/* Glow Effect */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-lg"></div>
                        </motion.div>
                        
                        <div>
                          <StaggeredText
                            text={`Welcome back, ${user.name}!`}
                            className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1"
                            delay={0.1}
                          />
                          <TypewriterText
                            text="Teaching dashboard"
                            className="text-gray-600 text-lg sm:text-xl font-medium"
                            delay={1000}
                          />
                        </div>
                      </div>
                
                      {/* Right side: Stats cards */}
                      <div className="flex gap-4">
                        {/* Students Card */}
                        <TiltCard className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-purple-200/50 min-w-[140px] min-h-[100px] flex flex-col justify-center">
                        <ScrollCounter
                          from={0}
                          to={stats.totalStudents || 0}
                          duration={2}
                          className="text-3xl font-bold text-purple-600"
                        />
                          <div className="text-sm text-gray-900 font-medium">Total Students</div>
                        </TiltCard>
                        
                        {/* Active Students Card */}
                        <TiltCard className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 shadow-sm border border-blue-200/50 min-w-[140px] min-h-[100px] flex flex-col justify-center">
                        <ScrollCounter
                          from={0}
                          to={stats.activeStudents || 0}
                          duration={2}
                          className="text-3xl font-bold text-blue-600"
                        />
                          <div className="text-sm text-gray-900 font-medium">Active Students</div>
                        </TiltCard>
                
                        {/* Average Progress Card */}
                        <TiltCard className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-200/50 min-w-[140px] min-h-[100px] flex flex-col justify-center">
                        <ScrollCounter
                          from={0}
                          to={stats.averageProgress || 0}
                          duration={2}
                          className="text-3xl font-bold text-green-600"
                        />
                          <div className="text-sm text-gray-900 font-medium">Avg Progress</div>
                        </TiltCard>
                      </div>
                </div>
              </div>

                  {/* Dashboard Stats Grid */}
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <StaggerItem>
                      <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                          <MagneticButton className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 text-sm font-medium shadow-lg">
                            Add New Student
                          </MagneticButton>
                          <MagneticButton className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 text-sm font-medium shadow-lg">
                            Create Assignment
                          </MagneticButton>
                          <MagneticButton className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-medium shadow-lg">
                            View Reports
                          </MagneticButton>
                        </div>
                      </TiltCard>
                    </StaggerItem>

                    {/* Class Overview */}
                    <StaggerItem>
                      <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Overview</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Total Assignments</span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{stats.totalAssignments || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Score</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">{stats.averageScore || 0}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Active Modules</span>
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">{modules.length || 0}</span>
                          </div>
                        </div>
                      </TiltCard>
                    </StaggerItem>

                    {/* Recent Activity */}
                    <StaggerItem>
                      <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="space-y-3">
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">New student joined</div>
                            <div className="text-xs text-gray-500">2 minutes ago</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">Assignment submitted</div>
                            <div className="text-xs text-gray-500">1 hour ago</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            <div className="font-medium">Progress report generated</div>
                            <div className="text-xs text-gray-500">6 hours ago</div>
                          </div>
                        </div>
                      </TiltCard>
                    </StaggerItem>
                  </StaggerContainer>
                </>
          )}

          {activeTab === 'students' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Students</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p>Student management interface coming soon...</p>
                              </div>
                            </div>
              )}
              
              {activeTab === 'modules' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Modules</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p>Module management interface coming soon...</p>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Assignments</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Assignment management interface coming soon...</p>
                  </div>
            </div>
          )}

          {activeTab === 'analytics' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <p>Analytics interface coming soon...</p>
            </div>
            </div>
          )}

          {activeTab === 'settings' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>Settings interface coming soon...</p>
              </div>
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
                  Class Alerts
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
                <div className={`text-center text-gray-400 text-sm py-8 transition-opacity duration-200 ${isMobile ? '' : 'opacity-0 pointer-events-none'}`} 
                     style={!isMobile ? { opacity: isRightPanelHovered ? 1 : 0 } : {}}>
                  No class alerts
              </div>
            </div>
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

      {/* Onboarding Modal */}
      <Dialog
        open={showOnboarding}
        onClose={() => {}}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-md rounded-2xl bg-white p-6">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
              Complete Your Profile
            </Dialog.Title>
            
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Specialization
                </label>
                <select
                  value={subjectSpecialization}
                  onChange={(e) => setSubjectSpecialization(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
      </div>

              <div className="flex gap-3 pt-4">
        <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
        </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

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
                      {user?.name || 'Teacher'}
                    </span>
                    <span className="text-xs text-gray-600">
                      Teacher
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
                          <span className="font-medium">Hi {user?.name || 'Teacher'}!</span> {notification.message}
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
      
      </VantaBackground>
    </div>
  );
} 
