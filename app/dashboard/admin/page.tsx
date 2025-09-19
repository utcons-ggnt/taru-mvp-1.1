'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText, StaggeredText, GradientText, CharacterAnimation } from '../../components/TextAnimations';
import { TiltCard, MagneticButton } from '../../components/InteractiveElements';
import { StaggerContainer, StaggerItem } from '../../components/PageTransitions';
import { ScrollFade, ScrollCounter, ParallaxScroll, ScrollProgress } from '../../components/ScrollAnimations';
import { FloatingParticles, MorphingBlob } from '../../components/VantaBackground';
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

interface AdminProfile {
  name: string;
  email: string;
  role: string;
  _id?: string;
  avatar?: string;
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

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [organizationType, setOrganizationType] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelHovered, setIsRightPanelHovered] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string>('/avatars/Group.svg');
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Admin-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
    { id: 'users', label: 'Manage Users', icon: '/icons/profile.png' },
    { id: 'content', label: 'Content Management', icon: '/icons/modules.png' },
    { id: 'organisations', label: 'Organisations', icon: '/icons/rewards.png' },
    { id: 'system', label: 'System Settings', icon: '/icons/settings.png' },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  useEffect(() => {
    const fetchUserAndStats = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'admin') {
            router.push('/login');
            return;
          }
          setUser(userData.user);
          // Show onboarding if profile is incomplete
          if (!userData.user.profile?.organizationType || !userData.user.profile?.contactEmail) {
            setShowOnboarding(true);
            setOrganizationType(userData.user.profile?.organizationType || '');
            setContactEmail(userData.user.profile?.contactEmail || '');
            setContactPhone(userData.user.profile?.contactPhone || '');
          } else {
            // Fetch dashboard statistics
            try {
              const statsResponse = await fetch('/api/admin/dashboard-stats');
              if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setDashboardStats(statsData);
              }
            } catch (error) {
              console.error('Error fetching dashboard stats:', error);
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

    fetchUserAndStats();
  }, [router]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationType,
          contactEmail,
          contactPhone
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
        title="Loading Admin Dashboard"
        subtitle="Preparing your administrative control panel..."
        tips={[
          'Loading system statistics and metrics',
          'Preparing user management tools',
          'Setting up administrative controls'
        ]}
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div 
      className="dashboard-container"
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
          role="admin"
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
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"
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
                placeholder="Search users, modules, or settings..."
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
            <span className="text-lg font-bold text-gray-800">Admin Dashboard</span>
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
                  {user.name}
                </motion.span>
                <motion.span 
                  className="text-xs text-gray-600 group-hover:text-purple-500 transition-colors duration-300"
                  whileHover={{ x: 2 }}
                >
                  Admin
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
        <div className={`dashboard-content relative transition-all duration-300 ${isNotificationOpen ? 'blur-sm pointer-events-none' : ''}`}>
          {/* Content Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient Orbs */}
            {[...Array(4)].map((_, i) => {
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
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div 
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
                        {/* Left side: Avatar and welcome text */}
                        <motion.div 
                          className="flex items-center gap-4"
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                        >
                          <motion.button 
                            className="relative w-16 h-16 sm:w-20 sm:h-20"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsAvatarSelectorOpen(true)}
                            title="Change Avatar"
                          >
                            <Image src={userAvatar} alt="Admin Avatar" fill className="rounded-full object-cover shadow-lg hover-bounce" />
                          </motion.button>
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
                                text="System administration dashboard"
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
                          {/* Users Card */}
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
                                  to={dashboardStats?.totalUsers || 0}
                                  duration={2}
                                  className=""
                                />
                              </motion.div>
                              <div className="text-sm text-purple-700 font-medium">Total Users</div>
                            </motion.div>
                          </TiltCard>
                          
                          {/* Organizations Card */}
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
                              {dashboardStats?.totalOrganizations || 0}
                            </motion.div>
                            <div className="text-sm text-emerald-700 font-medium">Organizations</div>
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
                              {dashboardStats?.totalModules || 0}
                            </motion.div>
                            <div className="text-sm text-blue-700 font-medium">Modules</div>
                          </motion.div>
                        </motion.div>
                      </div>
                    </motion.div>

                  {/* Dashboard Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Add New User
                        </button>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Create Module
                        </button>
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          System Backup
                        </button>
                      </div>
                      </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Database</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Online</span>
                      </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">API Services</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>
                      </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Storage</span>
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">75%</span>
                      </div>
                    </div>
                  </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">New user registered</div>
                          <div className="text-xs text-gray-500">2 minutes ago</div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">Module updated</div>
                          <div className="text-xs text-gray-500">1 hour ago</div>
                      </div>
                        <div className="text-sm text-gray-600">
                          <div className="font-medium">System backup completed</div>
                          <div className="text-xs text-gray-500">6 hours ago</div>
                      </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'users' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Users</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p>User management interface coming soon...</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'content' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Management</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>Content management interface coming soon...</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'organisations' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizations</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p>Organization management interface coming soon...</p>
                  </div>
                </div>
              )}
              
              {activeTab === 'system' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h2>
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>System settings interface coming soon...</p>
                  </div>
                </div>
              )}
                </motion.div>
              </AnimatePresence>
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
                  System Alerts
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
                  No system alerts
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
                  Organization Type
                </label>
                <select
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="">Select Organization Type</option>
                  <option value="school">School</option>
                  <option value="college">College</option>
                  <option value="university">University</option>
                  <option value="training">Training Institute</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter contact email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter contact phone"
                />
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
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-600">
                      Admin
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
      
    </div>
  );
} 
