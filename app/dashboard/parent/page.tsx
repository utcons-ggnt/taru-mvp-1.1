'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { isValidProfilePictureUrl } from '@/lib/utils';
import ChatModal from '../student/components/ChatModal';

interface ChildProfile {
  name: string;
  grade: string;
  avatar: string;
  school?: string;
  email?: string;
  id?: string;
}

interface RecentActivity {
  moduleId: string;
  status: string;
  progress: number;
  xpEarned: number;
  lastAccessed: string;
}

interface DashboardData {
  student: ChildProfile;
  studentDashboard: {
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
    recentActivity: RecentActivity[];
    notifications: Array<{
      id: string;
      title: string;
      message: string;
      type: string;
      date: string;
      read: boolean;
    }>;
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
  };
}

export default function ParentDashboard() {
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [stats, setStats] = useState<Array<{ label: string; value: string; icon: string }>>([]);
  const [analytics, setAnalytics] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('English (USA)');
  const [isChatOpen, setIsChatOpen] = useState(false);
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
          setDashboardData(dashData);

          // Set child info
          if (dashData.student) {
            setChild({
              name: dashData.student.name || '',
              grade: dashData.student.grade || '',
              avatar: dashData.student.profilePicture || '',
              school: dashData.student.school || '',
              email: dashData.student.email || '',
              id: dashData.student.id || '',
            });
          }

          // Set stats from studentDashboard.overview
          const sd = dashData.studentDashboard || {};
          if (sd.overview) {
            setStats([
              { 
                label: 'Modules Completed', 
                value: `${sd.overview.completedModules || 0}/${sd.overview.totalModules || 0}`, 
                icon: '📚' 
              },
              { 
                label: 'Average Score', 
                value: `${sd.overview.averageScore || 0}%`, 
                icon: '🎯' 
              },
              { 
                label: 'Total XP Earned', 
                value: `${sd.overview.totalXp || 0} XP`, 
                icon: '⭐' 
              },
            ]);
          }

          // Set analytics from studentDashboard.recentActivity
          if (sd.recentActivity && Array.isArray(sd.recentActivity)) {
            const activityAnalytics = sd.recentActivity.map((activity: RecentActivity) => 
              Math.round((activity.progress || 0) * 100)
            );
            // Fill remaining days with decreasing values for visual effect
            while (activityAnalytics.length < 7) {
              activityAnalytics.unshift(Math.max(0, (activityAnalytics[0] || 0) - 10));
            }
            setAnalytics(activityAnalytics.slice(-7));
          } else {
            // Default analytics for empty state
            setAnalytics([20, 35, 45, 60, 55, 70, 80]);
          }
        } else {
          setChild(null);
          setStats([]);
          setAnalytics([]);
        }
      } catch {
        // Handle error silently and use dummy data
        setChild(null);
        setStats([]);
        setAnalytics([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserAndDashboard();
  }, [router]);

  const getCompletionPercentage = () => {
    if (!dashboardData?.studentDashboard?.overview) return 0;
    const { completedModules, totalModules } = dashboardData.studentDashboard.overview;
    return totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
  };

  const getRecentActivities = () => {
    if (!dashboardData?.studentDashboard?.recentActivity) return [];
    return dashboardData.studentDashboard.recentActivity.slice(0, 5).map((activity) => ({
      title: activity.moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      type: activity.status,
      progress: activity.progress,
      xpEarned: activity.xpEarned,
      date: new Date(activity.lastAccessed).toLocaleDateString(),
    }));
  };

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
          <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:bg-purple-200 transition-colors" onClick={() => setIsChatOpen(true)}>
            <div className="w-16 h-16 bg-purple-600 rounded-full mb-2 flex items-center justify-center text-white text-2xl">🤖</div>
            <div className="text-sm font-semibold text-gray-900">Ask <span className="text-purple-600">AI Buddy</span></div>
            <div className="text-xs text-gray-600 text-center mt-1">Get insights about your child&apos;s learning</div>
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
                <p className="text-gray-700 text-sm">Monitor {child?.name || 'your child'}&apos;s learning journey 🚀</p>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="flex gap-4">
              {stats.length > 0 ? stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                  <span className="text-2xl mb-1">{stat.icon}</span>
                  <span className="font-bold text-lg text-purple-600">{stat.value}</span>
                  <span className="text-xs text-gray-500 text-center">{stat.label}</span>
                </div>
              )) : (
                <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                  <span className="text-2xl mb-1">📚</span>
                  <span className="font-bold text-lg text-gray-400">--</span>
                  <span className="text-xs text-gray-500 text-center">No data yet</span>
                </div>
              )}
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
                <div className="w-20 h-20 rounded-full border-2 border-gray-200 bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-2xl">
                  {child?.name ? child.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-xl truncate flex items-center gap-2">
                  {child?.name || <span className="text-gray-400">No child linked</span>}
                  {child?.grade && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-700 font-semibold">Grade {child.grade}</span>}
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
              <span className="font-semibold text-gray-900">Today&apos;s progress</span>
              <span className="text-sm text-gray-700">{getCompletionPercentage()}% Complete - {getCompletionPercentage() >= 80 ? 'Excellent work!' : 'Keep going!'} 🚀</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
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
                      {getRecentActivities().length > 0 ? getRecentActivities().map((activity, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <span className={`w-2 h-2 rounded-full ${
                            activity.type === 'completed' ? 'bg-green-500' : 
                            activity.type === 'in-progress' ? 'bg-blue-500' : 'bg-purple-500'
                          }`}></span>
                          <span>{activity.title} - {Math.round(activity.progress * 100)}% progress</span>
                        </div>
                      )) : (
                        <div className="text-gray-500 text-sm">No recent activity</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Weekly Analytics</h4>
                    <div className="flex items-end gap-1 h-20">
                      {analytics.map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-4 bg-purple-400 rounded-t transition-all duration-500" 
                            style={{ height: `${Math.max(h, 5)}%` }}
                          ></div>
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
              <div className="space-y-6">
                {/* Progress Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress Overview</h3>
                  {dashboardData?.studentDashboard ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">{dashboardData.studentDashboard.overview.completedModules}</div>
                        <div className="text-sm text-gray-500">Modules Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.studentDashboard.overview.totalXp}</div>
                        <div className="text-sm text-gray-500">XP Points Earned</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">{Math.floor(dashboardData.studentDashboard.progress.totalTimeSpent / 60)}h</div>
                        <div className="text-sm text-gray-500">Total Learning Time</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">No progress data available</div>
                  )}
                </div>

                                 {/* Badges and Achievements */}
                 <div className="bg-white rounded-xl shadow-sm p-6">
                   <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements & Badges</h3>
                   {dashboardData?.studentDashboard?.progress?.badgesEarned?.length && dashboardData.studentDashboard.progress.badgesEarned.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {dashboardData.studentDashboard.progress.badgesEarned.map((badge, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">🏆</div>
                          <div>
                            <div className="font-medium text-gray-900">{badge.name}</div>
                            <div className="text-xs text-gray-500">{new Date(badge.earnedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">🏆</div>
                      <p>No badges earned yet. Keep learning to unlock achievements!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Reports</h3>
                {dashboardData?.studentDashboard ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Performance Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Average Score:</span>
                            <span className="font-semibold">{dashboardData.studentDashboard.overview.averageScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Modules Completed:</span>
                            <span className="font-semibold">{dashboardData.studentDashboard.overview.completedModules}/{dashboardData.studentDashboard.overview.totalModules}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time Invested:</span>
                            <span className="font-semibold">{Math.floor(dashboardData.studentDashboard.progress.totalTimeSpent / 60)}h {dashboardData.studentDashboard.progress.totalTimeSpent % 60}m</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Learning Insights</h4>
                        <div className="space-y-2 text-sm text-green-800">
                          <div>✓ Consistent learning patterns</div>
                          <div>✓ Strong engagement with interactive content</div>
                          <div>✓ Good progress tracking</div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium text-gray-700 mb-4">Recent Module Performance</h4>
                      <div className="space-y-3">
                        {dashboardData.studentDashboard.recentActivity.slice(0, 5).map((activity, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">{activity.moduleId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                              <div className="text-sm text-gray-500">Last accessed: {new Date(activity.lastAccessed).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-purple-600">{Math.round(activity.progress * 100)}%</div>
                              <div className="text-sm text-gray-500">{activity.xpEarned} XP</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p>No report data available yet. Reports will appear as your child progresses through modules.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'messages' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages & Communication</h3>
                                 <div className="space-y-4">
                   {dashboardData?.studentDashboard?.notifications?.length && dashboardData.studentDashboard.notifications.length > 0 ? (
                     <div className="space-y-3">
                       <h4 className="font-medium text-gray-700">Recent Notifications</h4>
                       {dashboardData.studentDashboard.notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 rounded-lg border ${
                          notification.type === 'success' ? 'bg-green-50 border-green-200' :
                          notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                          'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{notification.title}</div>
                              <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(notification.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">💬</div>
                      <p>No messages yet. Communication features will be available soon.</p>
                    </div>
                  )}
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-700 mb-4">Quick Actions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
                        <div className="font-medium text-purple-900">📧 Contact Teacher</div>
                        <div className="text-sm text-purple-700 mt-1">Send a message to your child&apos;s teacher</div>
                      </button>
                      <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                        <div className="font-medium text-blue-900">📅 Schedule Meeting</div>
                        <div className="text-sm text-blue-700 mt-1">Book a parent-teacher conference</div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language Preference</label>
                      <select
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        <option value="English (USA)">English (USA)</option>
                        <option value="हिन्दी">हिन्दी</option>
                        <option value="मराठी">मराठी</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Email notifications for progress updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Weekly progress reports</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="ml-2 text-sm text-gray-700">SMS notifications for important updates</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Child Information</h3>
                  {child ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Child Name</label>
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.name}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.grade}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.school}</div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{child.email}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <p>No child information available</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors flex items-center justify-center z-40"
      >
        <span className="text-xl">🤖</span>
      </button>

      {/* Chat Modal for AI Buddy */}
      {child && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          studentData={{
            name: child.name || 'Student',
            grade: child.grade,
            email: child.email,
            school: child.school,
            studentId: child.id,
          }}
        />
      )}
    </div>
  );
} 