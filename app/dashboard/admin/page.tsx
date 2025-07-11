'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'admin') {
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Welcome back, {user.name}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-400">
                System Administrator
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Admin Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Role</label>
                <p className="text-gray-900 dark:text-white">System Administrator</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions</label>
                <p className="text-gray-900 dark:text-white">Full System Access</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/content"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Manage Content
              </Link>
              <Link
                href="/admin/organisations"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Manage Organisations
              </Link>
              <Link
                href="/admin/system"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                System Settings
              </Link>
            </div>
          </div>

          {/* System Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Organisations</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Tests</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">System Status</span>
                <span className="text-lg font-semibold text-green-600">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Students</h3>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">0</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Teachers</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">0</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Organisations</h3>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">0</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Tests</h3>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Activity
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>No recent system activity</p>
              <p className="text-xs mt-1">User registrations, content updates, and system changes will appear here</p>
            </div>
          </div>
        </div>

        {/* Content Management */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Content Management
              </h2>
              <Link
                href="/admin/content/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Create Content
              </Link>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>No content created yet</p>
              <p className="text-xs mt-1">Create diagnostic tests, educational content, and system announcements</p>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
                <span className="text-sm text-green-600 font-medium">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Status</span>
                <span className="text-sm text-green-600 font-medium">Operational</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Storage Usage</span>
                <span className="text-sm text-blue-600 font-medium">0%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 