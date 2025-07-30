'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../student/components/Sidebar';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';

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
  // const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelHovered, setIsRightPanelHovered] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const router = useRouter();
  const logoutTriggered = useRef(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Teacher-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Manage Students', icon: '👥' },
    { id: 'assignments', label: 'Assign Tests', icon: '📝' },
    { id: 'analytics', label: 'Performance Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
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

  useEffect(() => {
    const fetchUser = async () => {
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

  // Fetch students data and dashboard stats
  useEffect(() => {
    const fetchStudentsAndStats = async () => {
      try {
        const [studentsResponse, statsResponse] = await Promise.all([
          fetch('/api/teacher/students'),
          fetch('/api/teacher/dashboard-stats')
        ]);
        
        if (studentsResponse.ok) {
          const data = await studentsResponse.json();
          setStudents(data.students || []);
          
          // Calculate stats
          const totalStudents = data.students?.length || 0;
          const activeStudents = data.students?.filter((s: StudentData) => s.totalModulesCompleted > 0).length || 0;
          const totalProgress = data.students?.reduce((sum: number, s: StudentData) => sum + s.totalModulesCompleted, 0) || 0;
          const averageProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;
          const totalScores = data.students?.reduce((sum: number, s: StudentData) => sum + s.diagnosticScore, 0) || 0;
          const averageScore = totalStudents > 0 ? Math.round(totalScores / totalStudents) : 0;
          
          setStats({
            totalStudents,
            activeStudents,
            averageProgress,
            totalAssignments: 0, // TODO: Implement assignments tracking
            averageScore
          });
        }
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setDashboardStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching students and stats:', error);
      }
    };

    if (user && !showOnboarding) {
      fetchStudentsAndStats();
    }
  }, [user, showOnboarding]);

  // Fetch modules for assignment
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch('/api/teacher/assign-test');
        if (response.ok) {
          const data = await response.json();
          setModules(data.modules || []);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };

    if (user && !showOnboarding) {
      fetchModules();
    }
  }, [user, showOnboarding]);

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

  const handleAssignTest = async () => {
    if (selectedStudents.length === 0 || selectedModules.length === 0) {
      alert('Please select both students and modules for assignment');
      return;
    }

    try {
      const response = await fetch('/api/teacher/assign-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudents,
          moduleIds: selectedModules,
          dueDate: assignmentDueDate || null,
          instructions: assignmentInstructions
        })
      });

      if (response.ok) {
        alert('Test assigned successfully!');
        setShowAssignmentModal(false);
        setSelectedStudents([]);
        setSelectedModules([]);
        setAssignmentInstructions('');
        setAssignmentDueDate('');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error assigning test:', error);
      alert('Failed to assign test');
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getProgressColor = (modules: number) => {
    if (modules >= 5) return 'text-green-600';
    if (modules >= 2) return 'text-yellow-600';
    return 'text-red-600';
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
              <span className="text-amber-400 font-extrabold">teacher dashboard...</span>
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
                  Preparing your teaching portal...
                </h2>
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">Loading your classroom management dashboard</p>
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
                <label className="block text-sm font-medium mb-1">Subject Specialization</label>
                <select
                  value={subjectSpecialization}
                  onChange={e => setSubjectSpecialization(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Arts">Arts</option>
                  <option value="Physical Education">Physical Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={e => setExperienceYears(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 transition-colors"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Assignment Modal */}
      <Dialog open={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <Dialog.Title className="text-lg font-bold mb-4">Assign Test to Students</Dialog.Title>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Students Selection */}
              <div>
                <h3 className="font-medium mb-3">Select Students</h3>
                <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.userId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.userId]);
                          } else {
                            setSelectedStudents(selectedStudents.filter(id => id !== student.userId));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{student.fullName} ({student.classGrade})</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Modules Selection */}
              <div>
                <h3 className="font-medium mb-3">Select Modules</h3>
                <div className="max-h-60 overflow-y-auto border rounded p-3 space-y-2">
                  {modules.map(module => (
                    <label key={module.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(module.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModules([...selectedModules, module.id]);
                          } else {
                            setSelectedModules(selectedModules.filter(id => id !== module.id));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{module.title} ({module.subject})</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Due Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={assignmentDueDate}
                  onChange={e => setAssignmentDueDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructions (Optional)</label>
                <textarea
                  value={assignmentInstructions}
                  onChange={e => setAssignmentInstructions(e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Add any specific instructions for the students..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTest}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Assign Test
              </button>
            </div>
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
        role="teacher"
      />
      
      {/* Main Dashboard Content */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-top-bar">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-white">Teacher Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="English (USA)">🇺🇸 English (USA)</option>
              <option value="Hindi">🇮🇳 Hindi</option>
              <option value="Gujarati">🇮🇳 Gujarati</option>
            </select>
            
            {/* User Menu */}
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block">{user.name}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="dashboard-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Students</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Students</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.activeStudents}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📈</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Score</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.averageScore}%</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <span className="text-2xl">📝</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Assign Test</p>
                      <p className="text-sm text-gray-600">Create new assignment</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('students')}
                    className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <span className="text-2xl">👥</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Manage Students</p>
                      <p className="text-sm text-gray-600">View student progress</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <span className="text-2xl">📈</span>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Analytics</p>
                      <p className="text-sm text-gray-600">Performance insights</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {students.slice(0, 5).map(student => (
                    <div key={student.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.fullName}</p>
                        <p className="text-sm text-gray-600">Completed {student.totalModulesCompleted} modules</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{student.diagnosticScore}%</p>
                        <p className="text-xs text-gray-500">Diagnostic Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Assign Test
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Grade</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Modules Completed</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Diagnostic Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {student.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.fullName}</p>
                                <p className="text-sm text-gray-600">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{student.classGrade}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${getProgressColor(student.totalModulesCompleted)}`}>
                              {student.totalModulesCompleted}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(student.diagnosticScore)}`}>
                              {student.diagnosticScore}%
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.totalModulesCompleted > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {student.totalModulesCompleted > 0 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {activeTab === 'assignments' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Tests</h3>
              <p className="text-gray-600">Assignment management interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
              <p className="text-gray-600">Analytics dashboard will be implemented here.</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports</h3>
              <p className="text-gray-600">Report generation interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="English (USA)">🇺🇸 English (USA)</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                    <option value="Gujarati">🇮🇳 Gujarati</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject Specialization</label>
                  <input
                    type="text"
                    value={subjectSpecialization}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="text"
                    value={experienceYears}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}
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
            {/* Close button for mobile */}
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                <button 
                  onClick={() => setIsRightPanelOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:border-gray-300 transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {/* Desktop title */}
            {!isMobile && (
              <h3 className="text-lg font-semibold text-gray-900 mb-4 transition-opacity duration-200"
                  style={{ opacity: isRightPanelHovered ? 1 : 0 }}>
                Quick Actions
              </h3>
            )}
            <div className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}> 
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-blue-500"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">Assign Test</div>
                  <div className="text-xs text-gray-500">Create assignment</div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 shadow-sm hover:bg-purple-50 cursor-pointer transition-all duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}> 
                <div className="w-3 h-3 rounded-full flex-shrink-0 bg-green-500"></div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">View Reports</div>
                  <div className="text-xs text-gray-500">Class analytics</div>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
            <button 
              className={`btn btn-primary w-full mt-6 transition-opacity duration-200 ${isMobile ? '' : (isRightPanelHovered ? '' : 'opacity-0 pointer-events-none')}`}
              onClick={() => setActiveTab('assignments')}
            >
              Manage assignments
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

      {/* Floating FAB for right panel on mobile/tablet */}
      {isMobile && !isRightPanelOpen && (
        <button
          className="right-panel-fab"
          aria-label="Open Quick Actions"
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