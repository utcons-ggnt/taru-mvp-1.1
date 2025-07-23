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
          setUser(userData.user);
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

  // Stats cards data with proper fallbacks
  const statsCardsData = dashboardData?.overview ? [
    {
      title: 'Courses in Progress',
      value: dashboardData.overview.inProgressModules || 0,
      subtitle: `${Math.round((dashboardData.overview.inProgressModules || 0) * 7.5)}+ XP`,
      icon: '📚',
      color: 'bg-orange-500'
    },
    {
      title: 'Courses Completed',
      value: dashboardData.overview.completedModules || 0,
      subtitle: `${Math.round((dashboardData.overview.completedModules || 0) * 10)}+ XP`,
      icon: '✅',
      color: 'bg-green-500'
    },
    {
      title: 'Certificates Earned',
      value: dashboardData.progress?.badgesEarned?.length || 0,
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
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
          <Image src="/jio-logo.png" alt="Jio Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
              Loading your <br />
              student dashboard...
            </h2>
          </div>
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
        </div>
        <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>
      </main>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-6 py-4 bg-white border-b border-gray-200">
          {/* Search Bar */}
          <div className="flex-1 flex items-center">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search"
                className="w-80 pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
              />
            </div>
          </div>
          {/* Language Selector and User */}
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="border border-gray-400 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
            >
              <option value="English (USA)">English (USA)</option>
              <option value="हिन्दी">हिन्दी</option>
              <option value="मराठी">मराठी</option>
            </select>
            {/* Notification Bell */}
            <button className="relative text-gray-900 hover:text-purple-600">
              <span className="text-2xl">🔔</span>
              {/* Notification dot */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <Image src="/avatar.png" alt="User Avatar" width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
              <span className="font-semibold text-gray-900 text-sm">
                {user.name} #{user._id?.toString().slice(-4) || '0000'}
              </span>
            </div>
          </div>
        </div>
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Tab Content */}
          <div className="mt-0">
            {activeTab === 'overview' && (
              <>
                {/* Welcome Section and Stats only for Overview */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name}!
                      </h2>
                      <p className="text-gray-700 text-sm">
                        {user.profile?.grade ? `Grade ${user.profile.grade}` : ''} 
                        {user.profile?.school ? ` • ${user.profile.school}` : ''}
                        {!user.profile?.grade && !user.profile?.school ? 'Ready for another fun quest? 🚀' : ''}
                      </p>
                    </div>
                  </div>
                  {/* Stats Cards */}
                  <StatsCards stats={statsCardsData} />
                </div>
                {/* OverviewTab content */}
                <OverviewTab courses={courses} tests={tests} onTabChange={setActiveTab} />
              </>
            )}
            {activeTab === 'modules' && <ModulesTab />}
            {activeTab === 'diagnostic' && <DiagnosticTestTab />}
            {activeTab === 'progress' && <ProgressTab progress={progressData} onTabChange={setActiveTab} />}
            {activeTab === 'rewards' && <RewardsTab badges={badgesData} onTabChange={setActiveTab} />}
            {activeTab === 'settings' && <SettingsTab profile={profileData} />}
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
              <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
                Coming soon!
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Right Panel - Upcoming Tests */}
      <aside className="w-80 bg-white border-l border-gray-300 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Tests</h3>
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
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
          className="w-full mt-6 bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          onClick={() => setActiveTab('diagnostic')}
        >
          Take Diagnostic Test
        </button>
      </aside>
      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center z-40"
      >
        <span className="text-xl">🤖</span>
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