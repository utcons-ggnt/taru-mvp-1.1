'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dialog } from '@headlessui/react';

interface ParentOrgProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    organizationType?: string;
    industry?: string;
  };
}

export default function ParentOrgDashboard() {
  const [user, setUser] = useState<ParentOrgProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [organizationType, setOrganizationType] = useState('');
  const [industry, setIndustry] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'organization') {
            router.push('/login');
            return;
          }
          setUser(userData.user);
          // Show onboarding if profile is incomplete
          if (!userData.user.profile?.organizationType || !userData.user.profile?.industry) {
            setShowOnboarding(true);
            setOrganizationType(userData.user.profile?.organizationType || '');
            setIndustry(userData.user.profile?.industry || '');
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
    fetchUser();
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
          industry
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
      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onClose={() => {}} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Complete Your Organization Profile</Dialog.Title>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization Type</label>
                <select 
                  value={organizationType} 
                  onChange={e => setOrganizationType(e.target.value)} 
                  required 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Type</option>
                  <option value="School">School</option>
                  <option value="University">University</option>
                  <option value="Training Institute">Training Institute</option>
                  <option value="Corporate">Corporate</option>
                  <option value="NGO">NGO</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <select 
                  value={industry} 
                  onChange={e => setIndustry(e.target.value)} 
                  required 
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Industry</option>
                  <option value="Education">Education</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Government">Government</option>
                  <option value="Non-Profit">Non-Profit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={saving}>
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Organization Dashboard
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-400">
                Welcome back, {user.name}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-400">
                {user.profile?.organizationType || 'Organization not set'}
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
          {/* Organization Profile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Organization Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Organization Name</label>
                <p className="text-gray-900 dark:text-white">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Contact Email</label>
                <p className="text-gray-900 dark:text-white">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                <p className="text-gray-900 dark:text-white">{user.profile?.organizationType || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Industry</label>
                <p className="text-gray-900 dark:text-white">{user.profile?.industry || 'Not set'}</p>
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
                href="/students"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Manage Students
              </Link>
              <Link
                href="/teachers"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Manage Teachers
              </Link>
              <Link
                href="/analytics"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                View Analytics
              </Link>
              <Link
                href="/settings"
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-md transition-colors"
              >
                Organization Settings
              </Link>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Organization Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Students</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Teachers</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Courses Offered</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="text-lg font-semibold text-green-600">0%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Organization Overview */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Organization Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Enrolled Students</h3>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">0</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Active Courses</h3>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">0</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">Faculty Members</h3>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">0</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400">Assessments</h3>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>No recent activity</p>
              <p className="text-xs mt-1">Student enrollments, course completions, and staff activities will appear here</p>
            </div>
          </div>
        </div>

        {/* Student Performance */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Student Performance Overview
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>No performance data available</p>
              <p className="text-xs mt-1">Student progress, assessment scores, and learning analytics will appear here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 