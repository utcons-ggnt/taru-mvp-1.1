'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import ChatModal from '../student/components/ChatModal';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const router = useRouter();

  // Teacher-specific navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Manage Students', icon: '👥' },
    { id: 'assignments', label: 'Assign Tests', icon: '📝' },
    { id: 'analytics', label: 'Performance Analytics', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang) setLanguage(savedLang);
  }, []);

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

  // Fetch students data
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/teacher/students');
        if (response.ok) {
          const data = await response.json();
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
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (user && !showOnboarding) {
      fetchStudents();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
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
                      <div className="text-sm">
                        <div className="font-medium">{module.title}</div>
                        <div className="text-gray-500">{module.subject} • {module.duration} min • {module.points} pts</div>
                      </div>
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
                  type="date"
                  value={assignmentDueDate}
                  onChange={e => setAssignmentDueDate(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <textarea
                  value={assignmentInstructions}
                  onChange={e => setAssignmentInstructions(e.target.value)}
                  placeholder="Optional instructions for students..."
                  className="w-full border rounded px-3 py-2 h-20"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
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
            <div className="text-xs text-gray-600 text-center mt-1">Get teaching insights and support</div>
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
              placeholder="Search students, modules..."
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
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            {/* User Avatar */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 text-sm">
                {user.profile?.subjectSpecialization || 'Teacher'}
              </span>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
                <p className="text-gray-700 text-sm">
                  {user.profile?.subjectSpecialization} Teacher • {user.profile?.experienceYears} years experience
                </p>
              </div>
            </div>
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                <span className="text-2xl mb-1">👥</span>
                <span className="font-bold text-lg text-blue-600">{stats.totalStudents}</span>
                <span className="text-xs text-gray-500 text-center">Total Students</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                <span className="text-2xl mb-1">📈</span>
                <span className="font-bold text-lg text-green-600">{stats.averageProgress}</span>
                <span className="text-xs text-gray-500 text-center">Avg Modules</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border border-gray-100">
                <span className="text-2xl mb-1">🎯</span>
                <span className="font-bold text-lg text-purple-600">{stats.averageScore}%</span>
                <span className="text-xs text-gray-500 text-center">Avg Score</span>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStudents}</div>
                      <div className="text-sm text-gray-500">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">{stats.activeStudents}</div>
                      <div className="text-sm text-gray-500">Active Learners</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{stats.averageScore}%</div>
                      <div className="text-sm text-gray-500">Class Average</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Student Activity</h3>
                  {students.length > 0 ? (
                    <div className="space-y-3">
                      {students.slice(0, 5).map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-sm text-gray-500">{student.classGrade} • {student.schoolName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-semibold ${getProgressColor(student.totalModulesCompleted)}`}>
                              {student.totalModulesCompleted} modules
                            </div>
                            <div className="text-sm text-gray-500">{student.learningStreak} day streak</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No students enrolled yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Student Management</h3>
                    <button
                      onClick={() => setShowAssignmentModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Assign Test
                    </button>
                  </div>
                  
                  {students.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Student</th>
                            <th className="text-left py-3 px-4">Grade</th>
                            <th className="text-left py-3 px-4">Progress</th>
                            <th className="text-left py-3 px-4">Score</th>
                            <th className="text-left py-3 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map(student => (
                            <tr key={student.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                                    {student.fullName.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{student.fullName}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">{student.classGrade}</td>
                              <td className="py-3 px-4">
                                <div className={`font-semibold ${getProgressColor(student.totalModulesCompleted)}`}>
                                  {student.totalModulesCompleted} modules
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-sm ${getPerformanceColor(student.diagnosticScore)}`}>
                                  {student.diagnosticScore}%
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-sm ${
                                  student.learningStreak > 0 ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                                }`}>
                                  {student.learningStreak > 0 ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <div className="text-4xl mb-2">👥</div>
                      <p>No students enrolled yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Test Assignments</h3>
                    <button
                      onClick={() => setShowAssignmentModal(true)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Create New Assignment
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.slice(0, 6).map(module => (
                      <div key={module.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{module.title}</h4>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {module.subject}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Grade: {module.grade}</div>
                          <div>Duration: {module.duration} min</div>
                          <div>Points: {module.points}</div>
                          <div>Difficulty: {module.difficulty}</div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedModules([module.id]);
                            setShowAssignmentModal(true);
                          }}
                          className="w-full mt-3 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition-colors text-sm"
                        >
                          Assign to Students
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analytics</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Class Performance</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Average Score:</span>
                          <span className="font-semibold">{stats.averageScore}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Students:</span>
                          <span className="font-semibold">{stats.activeStudents}/{stats.totalStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Average Progress:</span>
                          <span className="font-semibold">{stats.averageProgress} modules</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Top Performers</h4>
                      <div className="space-y-2">
                        {students
                          .sort((a, b) => b.diagnosticScore - a.diagnosticScore)
                          .slice(0, 3)
                          .map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between text-sm">
                              <span>#{index + 1} {student.fullName}</span>
                              <span className="font-semibold text-green-700">{student.diagnosticScore}%</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Reports</h3>
                  
                  <div className="space-y-6">
                    <div className="border-b pb-6">
                      <h4 className="font-medium text-gray-700 mb-4">Performance Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded">
                          <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                          <div className="text-sm text-gray-600">Total Students</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-600">{stats.averageScore}%</div>
                          <div className="text-sm text-gray-600">Class Average</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-600">{stats.activeStudents}</div>
                          <div className="text-sm text-gray-600">Active Learners</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded">
                          <div className="text-2xl font-bold text-purple-600">{stats.averageProgress}</div>
                          <div className="text-sm text-gray-600">Avg Modules</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-700 mb-4">Student Progress Report</h4>
                      <div className="space-y-3">
                        {students.map(student => (
                          <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold">
                                {student.fullName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{student.fullName}</div>
                                <div className="text-sm text-gray-500">{student.classGrade}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                              <div className="text-center">
                                <div className={`font-semibold ${getProgressColor(student.totalModulesCompleted)}`}>
                                  {student.totalModulesCompleted}
                                </div>
                                <div className="text-gray-500">Modules</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-yellow-600">{student.totalXpEarned}</div>
                                <div className="text-gray-500">XP</div>
                              </div>
                              <div className="text-center">
                                <div className={`font-semibold ${getPerformanceColor(student.diagnosticScore).split(' ')[0]}`}>
                                  {student.diagnosticScore}%
                                </div>
                                <div className="text-gray-500">Score</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-blue-600">{student.learningStreak}</div>
                                <div className="text-gray-500">Streak</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{user.name}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">{user.email}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Specialization</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                          {user.profile?.subjectSpecialization || 'Not set'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                        <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                          {user.profile?.experienceYears || 'Not set'} years
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
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
                          <span className="ml-2 text-sm text-gray-700">Email notifications for student progress</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                          <span className="ml-2 text-sm text-gray-700">Weekly class performance reports</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                          <span className="ml-2 text-sm text-gray-700">SMS notifications for urgent updates</span>
                        </label>
                      </div>
                    </div>
                  </div>
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
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        studentData={{
          name: user.name || 'Teacher',
          grade: user.profile?.subjectSpecialization,
          email: user.email,
          school: 'JioWorld Learning',
          studentId: 'teacher_' + user.name?.toLowerCase().replace(/\s+/g, '_'),
        }}
      />
    </div>
  );
} 