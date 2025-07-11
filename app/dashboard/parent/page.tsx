'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ParentProfile {
  name: string;
  email: string;
}
interface ChildProfile {
  name: string;
  grade: string;
  avatar: string;
  school?: string;
  email?: string;
}

export default function ParentDashboard() {
  // Dummy data
  const dummyParent: ParentProfile = {
    name: 'Amit Sharma',
    email: 'amit.sharma@email.com',
  };
  const dummyChild: ChildProfile = {
    name: 'Riya Sharma',
    grade: '5th Grade',
    avatar: '/landingPage.png',
    school: 'Jio World School',
    email: 'riya.sharma@email.com',
  };
  const dummyStats = [
    { label: 'Ready Program', value: '45%', icon: '📚' },
    { label: 'AI Smart Assist', value: '0%', icon: '🤖' },
    { label: 'Range Analytics', value: 'Bar', icon: '📊' },
  ];
  const dummyAnalytics = [30, 60, 40, 80, 50, 70, 20];

  const [user, setUser] = useState<ParentProfile | null>(null);
  const [child, setChild] = useState<ChildProfile | null>(null);
  const [stats, setStats] = useState(dummyStats);
  const [analytics, setAnalytics] = useState(dummyAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
          setUser({ name: userData.user.name, email: userData.user.email });
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
          
          // Set child info if available
          if (dashData.student) {
            console.log('🔍 Setting child data:', dashData.student);
            setChild({
              name: dashData.student.name || dummyChild.name,
              grade: dashData.student.grade || dummyChild.grade,
              avatar: dashData.student.profilePicture || dummyChild.avatar,
              school: dashData.student.school || dummyChild.school,
              email: dashData.student.email || dummyChild.email,
            });
          } else {
            console.log('🔍 No student data found, using dummy data');
            setChild(dummyChild);
          }
          
          // Set stats if available
          if (dashData.overview) {
            console.log('🔍 Setting stats from overview:', dashData.overview);
            setStats([
              { label: 'Ready Program', value: `${dashData.overview.completionRate || 0}%`, icon: '📚' },
              { label: 'AI Smart Assist', value: `${dashData.overview.averageScore || 0}%`, icon: '🤖' },
              { label: 'Range Analytics', value: `${dashData.overview.totalXp || 0} XP`, icon: '📊' },
            ]);
          } else {
            console.log('🔍 No overview data found, using dummy stats');
            setStats(dummyStats);
          }
          
          // Set analytics if available - convert recent activity to analytics data
          if (dashData.recentActivity && Array.isArray(dashData.recentActivity)) {
            console.log('🔍 Setting analytics from recent activity:', dashData.recentActivity);
            const activityAnalytics = dashData.recentActivity.map((activity: any) => 
              Math.round((activity.progress || 0) * 100)
            );
            // Pad with zeros if less than 7 days
            while (activityAnalytics.length < 7) {
              activityAnalytics.push(0);
            }
            setAnalytics(activityAnalytics.slice(0, 7));
          } else {
            console.log('🔍 No recent activity found, using dummy analytics');
            setAnalytics(dummyAnalytics);
          }
        } else {
          console.log('🔍 Failed to fetch dashboard data, using dummy data');
          const errorText = await dashRes.text();
          console.error('🔍 Dashboard error:', errorText);
          setChild(dummyChild);
          setStats(dummyStats);
          setAnalytics(dummyAnalytics);
        }
      } catch (error) {
        console.error('🔍 Error fetching parent dashboard data:', error);
        setUser(dummyParent);
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
    <div className="min-h-screen bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <img src="/jio-logo.png" alt="Logo" className="w-8 h-8" />
            <span className="font-semibold text-gray-700 text-lg">
              Parent <span className="text-purple-600">Dashboard</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full bg-gray-100 p-2 hover:bg-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.5a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75V19.5z" />
              </svg>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
        {/* Your Children Card */}
        <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-6 mb-8 shadow-sm">
          <img 
            src={child?.avatar || '/landingPage.png'} 
            alt="Child Avatar" 
            className="w-20 h-20 rounded-full object-cover border-2 border-purple-500" 
            onError={(e) => {
              e.currentTarget.src = '/landingPage.png';
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-700 text-lg truncate">{child?.name}</div>
            <div className="text-xs text-gray-500 mt-1">Grade: <span className="font-medium text-gray-700">{child?.grade}</span></div>
            {child?.school && <div className="text-xs text-gray-500 mt-1 truncate">School: <span className="font-medium text-gray-700">{child.school}</span></div>}
            {child?.email && <div className="text-xs text-gray-500 mt-1 truncate">Email: <span className="font-medium text-gray-700">{child.email}</span></div>}
            <Link href="#" className="inline-block mt-3 text-xs text-purple-600 font-semibold hover:underline">View All Learners</Link>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6 flex flex-col items-center border border-gray-100">
              <span className="text-2xl mb-1">{stat.icon}</span>
              <span className="font-bold text-lg text-purple-600">{stat.value}</span>
              <span className="text-xs text-gray-500 text-center">{stat.label}</span>
            </div>
          ))}
        </div>
        {/* Analytics Bar (Dummy or Real) */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center relative mb-8">
          <div className="w-full h-24 flex items-end gap-2">
            {(analytics || dummyAnalytics).map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-4 bg-purple-400 rounded-t" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between w-full mt-2 text-xs text-gray-400">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
          {/* Floating Add Button */}
          <button className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-2xl">
            +
          </button>
        </div>
      </div>
    </div>
  );
} 