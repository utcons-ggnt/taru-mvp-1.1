'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const languages = ['English (USA)', 'हिन्दी', 'मराठी']

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    dashboardTitle: 'Student Dashboard',
    welcomeBack: 'Welcome back',
    readyToLearn: 'Ready to learn?',
    overview: 'Overview',
    assignments: 'Assignments',
    results: 'Test Results',
    notifications: 'Notifications',
    logout: 'Logout',
    grade: 'Grade',
    notSet: 'Not set',
  },
  'हिन्दी': {
    dashboardTitle: 'छात्र डैशबोर्ड',
    welcomeBack: 'वापस आने पर स्वागत है',
    readyToLearn: 'सीखने के लिए तैयार?',
    overview: 'अवलोकन',
    assignments: 'कार्य',
    results: 'परीक्षा परिणाम',
    notifications: 'सूचनाएं',
    logout: 'लॉगआउट',
    grade: 'ग्रेड',
    notSet: 'सेट नहीं',
  },
  'मराठी': {
    dashboardTitle: 'विद्यार्थी डॅशबोर्ड',
    welcomeBack: 'परत येण्याबद्दल स्वागत आहे',
    readyToLearn: 'शिकण्यासाठी तयार?',
    overview: 'आढावा',
    assignments: 'कार्ये',
    results: 'चाचणी निकाल',
    notifications: 'सूचना',
    logout: 'लॉगआउट',
    grade: 'ग्रेड',
    notSet: 'सेट नाही',
  },
}

interface StudentProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    grade?: string;
    school?: string;
  };
}

interface TestResult {
  id: string;
  testName: string;
  score: number;
  totalQuestions: number;
  date: string;
  subject: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  description: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [language, setLanguage] = useState('English (USA)');
  const router = useRouter();

  const t = translations[language]

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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const calculateAverageScore = () => {
    if (!dashboardData?.overview?.averageScore) return 0;
    return Math.round(dashboardData.overview.averageScore);
  };

  if (isLoading || dataLoading) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
          <img src="/jio-logo.png" alt="Jio Logo" className="absolute top-4 left-4 w-14 h-14 object-contain" />
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
              Loading your <br />
              student dashboard...
            </h2>
          </div>
          <img src="/landingPage.png" alt="Mascot" className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
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
    <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* 🟪 Left Panel */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
        <img src="/jio-logo.png" alt="Jio Logo" className="absolute top-4 left-4 w-14 h-14 object-contain" />
        <div className="mt-20 md:mt-32">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
            Welcome back, <br />
            <span className="text-yellow-300 font-extrabold">{user.name}!</span><br />
            Ready to continue your <br />
            learning journey?
          </h2>
        </div>
        <img src="/landingPage.png" alt="Mascot" className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
      </div>

      {/* ⬜ Right Panel */}
      <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center relative">
        {/* Language Selector */}
        <div className="absolute top-6 right-6 sm:top-6 sm:right-8 flex items-center gap-2 text-sm text-gray-700 z-20">
          <span role="img" aria-label="language" className="text-base sm:text-lg">🌐</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t.dashboardTitle}
            </h1>
            <p className="text-gray-600">
              {t.welcomeBack}, {user.name}! {t.readyToLearn}
            </p>
            <div className="mt-4 text-sm text-gray-500">
              {t.grade}: {user.profile?.grade || t.notSet}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'overview', name: t.overview, icon: '📊' },
                { id: 'assignments', name: t.assignments, icon: '📝' },
                { id: 'results', name: t.results, icon: '📈' },
                { id: 'notifications', name: t.notifications, icon: '🔔' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{calculateAverageScore()}%</div>
                    <div className="text-sm text-purple-700">Average Score</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData.assignments?.filter((a: any) => a.status === 'completed').length || 0}
                    </div>
                    <div className="text-sm text-green-700">Completed Tasks</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">Recent Activity</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    {dashboardData.recentActivity?.slice(0, 3).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <span>•</span>
                        <span>{activity.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {dashboardData.assignments?.slice(0, 5).map((assignment: any) => (
                  <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assignment.subject}</p>
                    <p className="text-xs text-gray-500">Due: {assignment.dueDate}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'results' && (
              <div className="space-y-4">
                {dashboardData.testResults?.slice(0, 5).map((result: any) => (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-gray-900">{result.testName}</h3>
                      <span className="text-lg font-bold text-purple-600">{result.score}%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{result.subject}</p>
                    <p className="text-xs text-gray-500">{result.date}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {dashboardData.notifications?.slice(0, 5).map((notification: any) => (
                  <div key={notification.id} className={`border rounded-lg p-4 ${
                    notification.read ? 'border-gray-200 bg-gray-50' : 'border-purple-200 bg-purple-50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{notification.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 