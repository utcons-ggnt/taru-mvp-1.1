'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isValidProfilePictureUrl } from '@/lib/utils';

interface ChildProfile {
  name: string;
  grade: string;
  avatar: string;
  school?: string;
  email?: string;
}

interface RecentActivity {
  progress: number;
  [key: string]: unknown;
}

export default function ParentDashboard() {
  const dummyChild: ChildProfile = {
    name: 'Sarah Doe',
    grade: 'Grade 8',
    avatar: '/landingPage.png',
    school: 'Springfield Middle School',
    email: 'sarah.doe@example.com',
  };
  const dummyStats = [
    { label: 'Ready Program', value: '45%', icon: '📚' },
    { label: 'AI Smart Assist', value: '0%', icon: '🤖' },
    { label: 'Range Analytics', value: 'Bar', icon: '📊' },
  ];
  const dummyAnalytics = [30, 60, 40, 80, 50, 70, 20];

  const [child, setChild] = useState<ChildProfile | null>(null);
  const [stats, setStats] = useState(dummyStats);
  const [analytics, setAnalytics] = useState(dummyAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const router = useRouter();

  // Parent-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'child-progress', label: 'Child Progress', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleLogout = async () => {
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
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) setLanguage(savedLang);
  }, []);

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

          // Use studentDashboard block for student-related data
          const sd = dashData.studentDashboard || {};
          // Set child info if available (from parent-specific field)
          if (dashData.student) {
            setChild({
              name: dashData.student.name || dummyChild.name,
              grade: dashData.student.grade || dummyChild.grade,
              avatar: dashData.student.profilePicture || dummyChild.avatar,
              school: dashData.student.school || dummyChild.school,
              email: dashData.student.email || dummyChild.email,
            });
          } else {
            setChild(dummyChild);
          }

          // Set stats from studentDashboard.overview
          if (sd.overview) {
            setStats([
              { label: 'Ready Program', value: `${sd.overview.completedModules || 0}/${sd.overview.totalModules || 0}`, icon: '📚' },
              { label: 'AI Smart Assist', value: `${sd.overview.averageScore || 0}%`, icon: '🤖' },
              { label: 'Range Analytics', value: `${sd.overview.totalXp || 0} XP`, icon: '📊' },
            ]);
          } else {
            setStats(dummyStats);
          }

          // Set analytics from studentDashboard.recentActivity
          if (sd.recentActivity && Array.isArray(sd.recentActivity)) {
            const activityAnalytics = sd.recentActivity.map((activity: RecentActivity) => 
              Math.round((activity.progress || 0) * 100)
            );
            while (activityAnalytics.length < 7) {
              activityAnalytics.push(0);
            }
            setAnalytics(activityAnalytics.slice(0, 7));
          } else {
            setAnalytics(dummyAnalytics);
          }
        } else {
          setChild(dummyChild);
          setStats(dummyStats);
          setAnalytics(dummyAnalytics);
        }
      } catch {
        // Handle error silently and use dummy data
        setChild(dummyChild);
        setStats(dummyStats);
        setAnalytics(dummyAnalytics);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-300 py-6 px-4 justify-between">
        <div>
          <div className="flex items-center mb-10">
            <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="w-12 h-12 mr-2" />
          </div>
          <nav className="flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors font-medium text-gray-900 ${activeTab === item.id ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'}`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 font-medium"
          >
            <span className="text-lg">🚪</span> Logout
          </button>
        </div>
        <div className="mt-10">
          <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center">
            <Image src="/ai-buddy.png" alt="AI Buddy" width={64} height={64} className="w-16 h-16 rounded-full mb-2" />
            <div className="text-sm font-semibold text-gray-900">Ask <span className="text-purple-600">AI Buddy</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-6 py-4 bg-white border-b border-gray-200">
          {/* Search Bar */}
          <div className="flex-1 flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
            />
          </div>
          {/* Language Selector */}
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
              <span className="font-semibold text-gray-900 text-sm">Parent</span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, Parent!</h2>
                <p className="text-gray-700 text-sm">Monitor your child's learning journey 🚀</p>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="flex gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                  <span className="text-2xl mb-1">{stat.icon}</span>
                  <span className="font-bold text-lg text-purple-600">{stat.value}</span>
                  <span className="text-xs text-gray-500 text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Child Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
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
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-gray-100" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-xl truncate flex items-center gap-2">
                  {child?.name}
                  <span className="ml-2 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-semibold">{child?.grade}</span>
                </div>
                {child?.school && <div className="text-xs text-gray-500 mt-1 truncate">🏫 {child.school}</div>}
                {child?.email && <div className="text-xs text-gray-500 mt-1 truncate">✉️ {child.email}</div>}
                <Link href="#" className="inline-block mt-3 text-xs text-purple-600 font-semibold hover:underline">View All Learners</Link>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-900">Today's progress</span>
              <span className="text-sm text-gray-700">{stats[0]?.value || '0%'} Complete - Keep going! 🚀</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-purple-500 h-4 rounded-full transition-all" style={{ width: stats[0]?.value || '0%' }}></div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span>Completed Math Basics module</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Earned "Quiz Master" badge</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                        <span>Progress increased by 10%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Weekly Analytics</h4>
                    <div className="flex items-end gap-1 h-20">
                      {analytics.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div className="w-4 bg-purple-400 rounded-t" style={{ height: `${h}%` }}></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
                      <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'child-progress' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Progress</h3>
                <p className="text-gray-600">Detailed progress reports and analytics will be displayed here.</p>
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>
                <p className="text-gray-600">Academic reports and performance summaries will be displayed here.</p>
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                <p className="text-gray-600">Communication with teachers and school will be displayed here.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
                <p className="text-gray-600">Account settings and preferences will be displayed here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 