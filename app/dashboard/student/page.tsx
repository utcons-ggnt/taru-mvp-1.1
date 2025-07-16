'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import StatsCards from './components/StatsCards';
import ProgressTrain from './components/ProgressTrain';
import OverviewTab from './components/OverviewTab';
import ModulesTab from './components/ModulesTab';
import DiagnosticTestTab from './components/DiagnosticTestTab';
import ProgressTab from './components/ProgressTab';
import RewardsTab from './components/RewardsTab';
import SettingsTab from './components/SettingsTab';
import Image from 'next/image';

interface StudentProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    grade?: string;
    school?: string;
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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [language, setLanguage] = useState('English (USA)');
  const [assessmentData, setAssessmentData] = useState<DashboardData['assessment'] | null>(null);
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

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setDataLoading(true);
        const response = await fetch('/api/dashboard/student/overview');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Fetch assessment data separately for diagnostic tab
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!user) return;
      
      try {
        const response = await fetch('/api/assessment/diagnostic');
        if (response.ok) {
          const data = await response.json();
          setAssessmentData(data.assessment);
        }
      } catch (error) {
        console.error('Error fetching assessment data:', error);
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

  // Subject to image mapping for module cards
  const subjectImages: Record<string, string> = {
    Mathematics: '/math.png',
    Science: '/science.png',
    Arts: '/arts.png',
    Computer: '/computer.png',
    English: '/english.png',
    History: '/history.png',
    Geography: '/geography.png',
    Physics: '/physics.png',
    Chemistry: '/chemistry.png',
    Biology: '/biology.png',
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
  const dummyStats = { xp: 2340, badges: 7, modules: 12 };
  const dummyProgressPercent = 68;
  const dummyLearningModules = [
    {
      image: '/math.png',
      title: 'Mathematics basics',
      xp: 60,
      time: '20 min',
      progress: 60,
      enroll: false,
      moduleId: 'math-001',
    },
    {
      image: '/science.png',
      title: 'Science Experiments',
      xp: 50,
      time: '15 min',
      progress: 45,
      enroll: false,
      moduleId: 'science-001',
    },
    {
      image: '/arts.png',
      title: 'Creative Arts',
      xp: 75,
      time: '40 min',
      progress: 75,
      enroll: false,
      moduleId: 'arts-001',
    },
    {
      image: '/computer.png',
      title: 'Basic Computer',
      xp: 80,
      time: '30 min',
      progress: 80,
      enroll: false,
      moduleId: 'computer-001',
    },
  ];
  const dummyCourses = [
    { title: 'Mathematics basics', lessonsCompleted: '06/10 (60%)', duration: '20 min', xp: '60+ XP', color: '#FFD600' },
    { title: 'Science Experiments', lessonsCompleted: '04/10 (40%)', duration: '15 min', xp: '50+ XP', color: '#00C49A' },
    { title: 'Creative Arts', lessonsCompleted: '08/10 (80%)', duration: '40 min', xp: '75+ XP', color: '#2B6CB0' },
    { title: 'Basic Computer', lessonsCompleted: '10/10 (100%)', duration: '30 min', xp: '80+ XP', color: '#7C3AED' },
  ];
  const dummyTests = [
    { title: 'Mathematics basics', date: '30 Jul', color: '#FFD600' },
    { title: 'Science Experiments', date: '20 Jul', color: '#00C49A' },
    { title: 'Creative Arts', date: '10 Jul', color: '#2B6CB0' },
    { title: 'Basic Computer', date: '05 Jul', color: '#FF6B6B' },
    { title: 'AI Chat', date: '30 Jun', color: '#7C3AED' },
  ];
  const dummyProgress = {
    completedModules: 8,
    totalModules: 12,
    progressHistory: [60, 65, 70, 75, 80, 85, 90, 95],
    recentScores: [80, 85, 90, 88, 92],
    totalTimeSpent: 240,
  };
  const dummyBadges = [
    { name: 'Math Whiz', description: 'Completed all math modules', icon: '/math-badge.png', earnedAt: '2024-01-15' },
    { name: 'Science Star', description: 'Top score in science', icon: '/science-badge.png', earnedAt: '2024-01-10' },
    { name: 'Creative Champ', description: 'Excelled in creative arts', icon: '/arts-badge.png', earnedAt: '2024-01-05' },
    { name: 'Tech Guru', description: 'Mastered computer basics', icon: '/computer-badge.png', earnedAt: '2024-01-01' },
  ];
  const dummyProfile = {
    name: 'Aanya',
    email: 'aanya@student.com',
    grade: '7',
    school: 'Jio World School',
    language: 'English (USA)',
    studentKey: 'STU12345',
  };

  // Calculate real statistics from dashboard data, fallback to dummy
  const stats = dashboardData ? {
    xp: dashboardData.overview.totalXp || dummyStats.xp,
    badges: dashboardData.progress.badgesEarned?.length || dummyStats.badges,
    modules: dashboardData.overview.totalModules || dummyStats.modules,
  } : dummyStats;

  // Calculate real progress percentage, fallback to dummy
  const progressPercent = dashboardData?.overview 
    ? Math.round((dashboardData.overview.completedModules / Math.max(1, dashboardData.overview.totalModules)) * 100)
    : dummyProgressPercent;

  // Map recommended modules to learning cards with real data, fallback to dummy
  const learningModules = dashboardData?.recommendedModules && dashboardData.recommendedModules.length > 0
    ? dashboardData.recommendedModules.map((mod) => ({
        image: subjectImages[mod.subject] || '/math.png',
        title: mod.name,
        xp: mod.xpPoints,
        time: mod.estimatedDuration ? `${mod.estimatedDuration} min` : '',
        progress: 0, // Will be updated when we have progress data
        enroll: false,
        moduleId: mod.id,
      }))
    : dummyLearningModules;

  // Map recent activity to courses with real module names, fallback to dummy
  const courses = dashboardData?.recentActivity && dashboardData.recentActivity.length > 0
    ? dashboardData.recentActivity.map((activity) => {
        const matchedModule = dashboardData.recommendedModules.find(m => m.id === activity.moduleId);
        return {
          title: matchedModule?.name || activity.moduleId,
        lessonsCompleted: `${activity.progress || 0}%`,
        duration: activity.xpEarned ? `${activity.xpEarned} XP` : '',
        xp: activity.xpEarned ? `${activity.xpEarned} XP` : '',
          color: subjectColors[matchedModule?.subject || 'Mathematics'] || '#FFD600',
          status: activity.status,
        };
      })
    : dummyCourses;

  // Map assessment data to tests, fallback to dummy
  const tests: Test[] = assessmentData && assessmentData.diagnosticCompleted
    ? [{
        title: 'Learning Profile Assessment',
        date: assessmentData.assessmentCompletedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        color: '#7C3AED',
        score: assessmentData.diagnosticScore || 0
      }]
    : dummyTests;

  // Calculate real progress data, fallback to dummy
  const progressData = dashboardData?.overview 
    ? {
        completedModules: dashboardData.overview.completedModules || dummyProgress.completedModules,
        totalModules: dashboardData.overview.totalModules || dummyProgress.totalModules,
        progressHistory: calculateProgressHistory(dashboardData),
        recentScores: calculateRecentScores(dashboardData),
        totalTimeSpent: dashboardData.progress.totalTimeSpent || dummyProgress.totalTimeSpent,
      }
    : dummyProgress;

  // Map real badges data, fallback to dummy
  const badgesData = dashboardData?.progress?.badgesEarned && dashboardData.progress.badgesEarned.length > 0
    ? dashboardData.progress.badgesEarned.map((badge) => ({
        name: badge.name,
        description: badge.description,
        icon: '/badge-default.png', // Use default icon since badge.icon doesn't exist in the model
        earnedAt: badge.earnedAt
      }))
    : dummyBadges;

  // Map real profile data, fallback to dummy
  const profileData = user && dashboardData
    ? {
        name: dashboardData.overview.studentName || user.name || dummyProfile.name,
        email: user.email || dummyProfile.email,
        grade: dashboardData.overview.grade || dummyProfile.grade,
        school: dashboardData.overview.school || dummyProfile.school,
        language: language,
        studentKey: dashboardData.overview.studentKey || 'Not available',
      }
    : dummyProfile;

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

  if (isLoading || dataLoading) {
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
        <TopBar user={user} language={language} onLanguageChange={handleLanguageChange} />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <Image src="/avatar.png" alt="User Avatar" width={64} height={64} className="w-16 h-16 rounded-full border-2 border-purple-400" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {dashboardData.overview.studentName || user.name}!</h2>
                <p className="text-gray-700 text-sm">Ready for another fun quest? 🚀</p>
              </div>
            </div>
            <StatsCards xp={stats.xp} badges={stats.badges} modules={stats.modules} />
          </div>
          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Today&apos;s progress</span>
              <span className="text-sm text-gray-700">{progressPercent}% Complete - Keep going! 🚀</span>
            </div>
            <ProgressTrain percent={progressPercent} />
          </div>
          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <OverviewTab courses={courses} tests={tests} />
            )}
            {activeTab === 'modules' && (
              <ModulesTab modules={learningModules} />
            )}
            {activeTab === 'diagnostic' && (
              <DiagnosticTestTab />
            )}
            {activeTab === 'progress' && (
              <ProgressTab progress={progressData} />
            )}
            {activeTab === 'rewards' && (
              <RewardsTab badges={badgesData} />
            )}
            {activeTab === 'settings' && (
              <SettingsTab profile={profileData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 