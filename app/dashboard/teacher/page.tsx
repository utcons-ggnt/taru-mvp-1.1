'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
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

interface TeacherProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    subjectSpecialization?: string;
    experienceYears?: string;
  };
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
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

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
          <p className="mt-4 text-lg font-semibold">Loading your teacher dashboard...</p>
        </motion.div>
      </main>
    );
  }

  if (!user) {
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
        navItems={navItems}
        role="teacher"
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
            <span className="text-lg font-bold text-gray-800">Teacher Dashboard</span>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector */}
            <div className="hidden sm:block">
            </div>
            
            {/* User Profile Section */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center gap-3">
              {/* Circular Avatar */}
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
          </div>
              
              {/* User Info */}
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">
                  {user.name}
                </span>
                <span className="text-xs text-gray-600">
                  Teacher
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
                      {/* Left side: Avatar and welcome text */}
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                          <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                    </div>
                  </div>
                        <div>
                          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-1">
                            Welcome back, {user.name}!
                          </h2>
                          <p className="text-gray-600 text-lg sm:text-xl font-medium">
                            Teaching dashboard
                          </p>
                  </div>
                </div>
                
                      {/* Right side: Stats cards */}
                      <div className="flex gap-4">
                        {/* Students Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {stats.totalStudents || 0}
                    </div>
                          <div className="text-sm text-gray-900">Total Students</div>
                    </div>
                        
                        {/* Active Students Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-purple-600">
                            {stats.activeStudents || 0}
                  </div>
                          <div className="text-sm text-gray-900">Active Students</div>
                </div>
                
                        {/* Average Progress Card */}
                        <div className="bg-gray-100 rounded-xl p-6 shadow-sm border border-gray-100 min-w-[140px] min-h-[100px] hover:bg-purple-50 transition-colors flex flex-col justify-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {stats.averageProgress || 0}%
                    </div>
                          <div className="text-sm text-gray-900">Avg Progress</div>
                    </div>
                  </div>
                </div>
              </div>

                  {/* Dashboard Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                          Add New Student
                  </button>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                          Create Assignment
                  </button>
                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          View Reports
                  </button>
                </div>
              </div>

                    {/* Class Overview */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Overview</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total Assignments</span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{stats.totalAssignments || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{stats.averageScore || 0}%</span>
                      </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Active Modules</span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{modules.length || 0}</span>
                      </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
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
            </div>
                  </div>
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
    </div>
  );
} 