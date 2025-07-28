'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { saveAs } from 'file-saver';

interface AdminProfile {
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<AdminProfile | null>(null);
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
  const router = useRouter();
  const logoutTriggered = useRef(false);

  // Admin-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Manage Users', icon: '👥' },
    { id: 'content', label: 'Content Management', icon: '📝' },
    { id: 'organisations', label: 'Organisations', icon: '🏢' },
    { id: 'system', label: 'System Settings', icon: '⚙️' },
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
          // Show onboarding if profile is incomplete
          if (!userData.user.profile?.organizationType || !userData.user.profile?.contactEmail) {
            setShowOnboarding(true);
            setOrganizationType(userData.user.profile?.organizationType || '');
            setContactEmail(userData.user.profile?.contactEmail || '');
            setContactPhone(userData.user.profile?.contactPhone || '');
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

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const handleDownloadAllProgress = async () => {
    try {
      const response = await fetch('/api/admin/export-student-progress');
      if (!response.ok) throw new Error('Failed to fetch student progress');
      const csv = await response.text();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'all_student_progress.csv');
    } catch {
      alert('Failed to download student progress.');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800">
        {/* 🟪 Left Section - Content */}
        <section className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 text-white flex flex-col justify-between relative min-h-screen lg:min-h-0">
          <div>
            <Image src="/jio-logo.png" alt="Jio Logo" width={60} height={60} className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain" />
          </div>
          
          <div className="mt-16 sm:mt-20 lg:mt-32 px-2 sm:px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Loading your <br />
              <span className="text-amber-400 font-extrabold">admin dashboard...</span>
            </h2>
          </div>
          
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-64 lg:h-64 mx-auto mt-4 sm:mt-6 lg:mt-2">
            <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-full h-full object-contain" />
          </div>
        </section>

        {/* ⬜ Right Section - White Card */}
        <section className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center relative min-h-screen lg:min-h-screen">
          <div className="max-w-2xl mx-auto w-full px-4 sm:px-0 h-full flex flex-col">
            {/* Loading Container - White Card */}
            <div 
              className="bg-white rounded-4xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full backdrop-blur-sm flex-1 flex flex-col justify-center items-center relative"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                backgroundPosition: '0 0, 0 0'
              }}
            >
              <div className="w-full max-w-md text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Preparing your admin portal...
                </h2>
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading your system management dashboard</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* Onboarding Modal */}
      <Dialog open={showOnboarding} onClose={() => {}} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Complete Your Profile</Dialog.Title>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization Type</label>
                <input type="text" value={organizationType} onChange={e => setOrganizationType(e.target.value)} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} required className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold" disabled={saving}>{saving ? 'Saving...' : 'Save & Continue'}</button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Responsive Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        navItems={navItems}
        role="admin"
      />
      
      {/* Main Content Area */}
      <div className="dashboard-main bg-gray-50">
        {/* Top Bar */}
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 relative">
          {/* Search Bar - Hidden on mobile, shown on tablet+ */}
          <div className="hidden sm:flex flex-1 items-center max-w-md">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search users, content, settings..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
              />
            </div>
          </div>
          
          {/* Mobile: Logo and User Info */}
          <div className="flex sm:hidden items-center flex-1 justify-center ml-12">
            <span className="text-lg font-bold text-gray-800">Admin Dashboard</span>
          </div>
          
          {/* Language Selector and User */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Selector - Hidden on mobile */}
            <select
              value={language}
              onChange={e => handleLanguageChange(e.target.value)}
              className="hidden sm:block border border-gray-400 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
            >
              <option value="English (USA)">English (USA)</option>
              <option value="हिन्दी">हिन्दी</option>
              <option value="मराठी">मराठी</option>
            </select>
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                className="relative text-gray-900 hover:text-purple-600 transition-colors p-2 rounded-full hover:bg-gray-50 touch-manipulation"
              >
                <span className="text-xl sm:text-2xl">🔔</span>
                {/* Notification dot */}
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
            
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <Image src="/avatar.png" alt="Admin Avatar" width={32} height={32} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
              <span className="hidden sm:block font-semibold text-gray-900 text-sm">System Administrator</span>
            </div>
          </div>
        </div>
        
        {/* Main Content with Responsive Layout */}
        <div className="dashboard-content">
          {/* Main Panel */}
          <main className="flex-1 overflow-y-auto">
            {/* Welcome Section */}
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
                  <p className="text-gray-700 text-sm sm:text-base">System Administrator • Full System Access</p>
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex gap-4">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors"
                  onClick={handleDownloadAllProgress}
                >
                  Download All Student Progress (CSV)
                </button>
              </div>
            </div>

                  {/* Tab Content */}
            <div className="space-y-6">
              {activeTab === 'overview' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Admin Information
                      </h2>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Name</label>
                          <p className="text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Email</label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Role</label>
                          <p className="text-gray-900">System Administrator</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Permissions</label>
                          <p className="text-gray-900">Full System Access</p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        System Statistics
                      </h2>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Users</span>
                          <span className="text-lg font-semibold text-gray-900">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Organisations</span>
                          <span className="text-lg font-semibold text-gray-900">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Tests</span>
                          <span className="text-lg font-semibold text-gray-900">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">System Status</span>
                          <span className="text-lg font-semibold text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Overview */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      System Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-600">Students</h3>
                        <p className="text-2xl font-bold text-blue-900">0</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-600">Teachers</h3>
                        <p className="text-2xl font-bold text-green-900">0</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-purple-600">Organisations</h3>
                        <p className="text-2xl font-bold text-purple-900">0</p>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-orange-600">Tests</h3>
                        <p className="text-2xl font-bold text-orange-900">0</p>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      System Health
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Database Status</span>
                        <span className="text-sm text-green-600 font-medium">Connected</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">API Status</span>
                        <span className="text-sm text-green-600 font-medium">Operational</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Storage Usage</span>
                        <span className="text-sm text-blue-600 font-medium">0%</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p>User management features coming soon</p>
                  </div>
                </div>
              )}
              {activeTab === 'content' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Management</h3>
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📝</div>
                    <p>Content management features coming soon</p>
                  </div>
                </div>
              )}
              {activeTab === 'organisations' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organisation Management</h3>
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">🏢</div>
                    <p>Organisation management features coming soon</p>
                  </div>
                </div>
              )}
              {activeTab === 'system' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h3>
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">⚙️</div>
                    <p>System settings features coming soon</p>
                  </div>
                </div>
              )}
            </div>
          </main>
          
          {/* Right Panel */}
          <aside 
            className={`dashboard-right-panel ${isRightPanelOpen ? 'open' : ''} flex flex-col justify-between`}
            onMouseEnter={() => window.innerWidth >= 1024 && setIsRightPanelHovered(true)}
            onMouseLeave={() => window.innerWidth >= 1024 && setIsRightPanelHovered(false)}
          >
            {/* Arrow indicator for expandability - centered in collapsed state */}
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
            {/* Panel Content */}
            <div className="flex-1 flex flex-col transition-all duration-300 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 transition-opacity duration-200"
                  style={{ opacity: isRightPanelHovered ? 1 : 0 }}>
                System Actions
              </h3>
              <div className="space-y-3">
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isRightPanelHovered ? '' : 'opacity-0 pointer-events-none'}`}> 
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Export Data</div>
                    <div className="text-xs text-gray-500">Download reports</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
                <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isRightPanelHovered ? '' : 'opacity-0 pointer-events-none'}`}> 
                  <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500"></div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">System Health</div>
                    <div className="text-xs text-gray-500">Monitor status</div>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
              <button 
                className={`btn btn-primary w-full mt-6 transition-opacity duration-200 ${isRightPanelHovered ? '' : 'opacity-0 pointer-events-none'}`}
                onClick={handleDownloadAllProgress}
              >
                Export all data
              </button>
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

      {/* Floating FAB for right panel on mobile/tablet */}
      {typeof window !== 'undefined' && window.innerWidth < 1024 && !isRightPanelOpen && (
        <button
          className="right-panel-fab"
          aria-label="Open System Actions"
          onClick={() => setIsRightPanelOpen(true)}
        >
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
} 