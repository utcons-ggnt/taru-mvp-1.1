'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ParentProfile {
  name: string;
  email: string;
  role: string;
  profile: {
    linkedStudentId?: string;
    phone?: string;
  };
}

interface Student {
  _id: string;
  name: string;
  email: string;
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
  grade: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  description: string;
  submittedDate?: string;
}

interface TeacherMessage {
  id: string;
  from: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface ProgressReport {
  subject: string;
  currentGrade: string;
  improvement: number;
  attendance: number;
  assignmentsCompleted: number;
  totalAssignments: number;
}

export default function ParentDashboard() {
  const [user, setUser] = useState<ParentProfile | null>(null);
  const [linkedStudent, setLinkedStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'parent') {
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
        const response = await fetch('/api/dashboard/parent/overview');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
          setLinkedStudent(data.student);
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
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600 dark:text-green-400';
    if (grade.includes('B')) return 'text-blue-600 dark:text-blue-400';
    if (grade.includes('C')) return 'text-yellow-600 dark:text-yellow-400';
    if (grade.includes('D') || grade.includes('F')) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const calculateAverageScore = () => {
    if (!dashboardData?.overview?.averageScore) return 0;
    return Math.round(dashboardData.overview.averageScore);
  };

  const getUnreadMessagesCount = () => {
    if (!dashboardData?.notifications) return 0;
    return dashboardData.notifications.filter((n: any) => !n.read).length;
  };

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Parent Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user.name}! Monitor your child's progress
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                Parent Account
                </p>
              </div>
              <div className="relative">
                <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {getUnreadMessagesCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getUnreadMessagesCount()}
              </span>
                  )}
                </button>
              </div>
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

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'progress', name: 'Progress Report', icon: '📈' },
              { id: 'assignments', name: 'Assignments', icon: '📝' },
              { id: 'results', name: 'Test Results', icon: '📋' },
              { id: 'messages', name: 'Teacher Messages', icon: '💬' },
              { id: 'calendar', name: 'Calendar', icon: '📅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Student Info Banner */}
            {linkedStudent && (
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
              <div>
                    <h2 className="text-2xl font-bold mb-2">Student: {linkedStudent.name}</h2>
                    <p className="text-blue-100">
                      Grade {dashboardData.student.grade || 'Not set'} •
                      {dashboardData.student.school ? ` ${dashboardData.student.school}` : ' School not set'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">Overall Performance</p>
                    <p className="text-3xl font-bold">{calculateAverageScore()}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
              </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{calculateAverageScore()}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Tests</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dashboardData.overview.completedTests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Assignments</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {dashboardData.overview.pendingAssignments}
                    </p>
                </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{getUnreadMessagesCount()}</p>
                  </div>
                </div>
              </div>
          </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                    href="/schedule-meeting"
                    className="flex items-center justify-between w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📅</span>
                      <div>
                        <p className="font-medium">Schedule Parent Meeting</p>
                        <p className="text-sm opacity-90">Meet with teachers</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
              </Link>
                  
              <Link
                    href="/view-report-card"
                    className="flex items-center justify-between w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white p-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <p className="font-medium">View Report Card</p>
                        <p className="text-sm opacity-90">Detailed progress report</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
              </Link>
                  
              <Link
                    href="/contact-teacher"
                    className="flex items-center justify-between w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-4 rounded-lg transition-all transform hover:scale-105"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💬</span>
                      <div>
                        <p className="font-medium">Contact Teacher</p>
                        <p className="text-sm opacity-90">Send message to teacher</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
              </Link>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Test Results
                </h2>
                <div className="space-y-4">
                  {dashboardData.testResults.slice(0, 3).map((test: any) => (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{test.testName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${getGradeColor(test.grade)}`}>{typeof test.score === 'number' ? test.score : 0}% ({test.grade})</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{test.date}</p>
                      </div>
                    </div>
                  ))}
                  {dashboardData.testResults.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-600 dark:text-gray-400">No recent test results</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Test results will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subject Progress Report</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dashboardData.progressReports.map((report: any, index: number) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{report.subject}</h3>
                        <span className={`text-lg font-bold ${getGradeColor(report.currentGrade)}`}>
                          {report.currentGrade}
                        </span>
        </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Improvement</span>
                            <span className={`font-medium ${report.improvement >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {report.improvement >= 0 ? '+' : ''}{report.improvement}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${report.improvement >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.abs(report.improvement)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Attendance</span>
                            <span className="font-medium text-gray-900 dark:text-white">{report.attendance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${report.attendance}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Assignments</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {report.assignmentsCompleted}/{report.totalAssignments}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(report.assignmentsCompleted / report.totalAssignments) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Assignment Status</h2>
              </div>
              <div className="p-6">
                {dashboardData.assignments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.assignments.map((assignment: any) => (
                      <div key={assignment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assignment.description}</p>
                            <div className="flex items-center mt-2 space-x-4">
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Subject: {assignment.subject}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Due: {assignment.dueDate}
                              </span>
                              {assignment.submittedDate && (
                                <span className="text-sm text-green-600 dark:text-green-400">
                                  Submitted: {assignment.submittedDate}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {assignment.status}
                            </span>
                          </div>
                        </div>
                        {assignment.status === 'overdue' && (
                          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-200">
                              ⚠️ This assignment is overdue. Please encourage your child to complete it as soon as possible.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
              </div>
            ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No assignments available</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Assignments will appear here when assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Results</h2>
              </div>
              <div className="p-6">
                {dashboardData.testResults.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.testResults.map((test: any) => (
                      <div key={test.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{test.testName}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Subject: {test.subject} • Questions: {test.totalQuestions}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Date: {test.date}
                            </p>
                          </div>
                          <div className="ml-4 text-right">
                            <div className={`text-2xl font-bold ${getGradeColor(test.grade)}`}>
                              {typeof test.score === 'number' ? test.score : 0}% ({test.grade})
                            </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                              {typeof test.score === 'number' ? test.score >= 90 ? 'Excellent performance!' : 
                               test.score >= 80 ? 'Good work!' : 
                               test.score >= 70 ? 'Keep practicing!' : 'Needs improvement' : 'Needs improvement'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${typeof test.score === 'number' ? test.score : 0}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                            View Detailed Analysis
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No test results available</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Test results will appear here when available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Teacher Messages</h2>
              </div>
              <div className="p-6">
                {dashboardData.teacherMessages.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.teacherMessages.map((message: any) => (
                      <div key={message.id} className={`border rounded-lg p-4 ${message.read ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700' : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">{message.subject}</h3>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                                {message.priority}
                              </span>
                              {!message.read && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  New
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{message.from}</p>
                            <p className="text-gray-900 dark:text-white">{message.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{message.date}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                            Reply
                          </button>
                          <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                            Mark as Read
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">No messages from teachers</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Teacher messages will appear here</p>
              </div>
            )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Academic Calendar</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upcoming Events</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Parent-Teacher Conference</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Jan 25, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Math Test</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Jan 28, 2024</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Science Fair</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Feb 5, 2024</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Assignment Deadlines</h3>
                    <div className="space-y-3">
                      {dashboardData.assignments.filter((a: any) => a.status === 'pending').slice(0, 3).map((assignment: any) => (
                        <div key={assignment.id} className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{assignment.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Due: {assignment.dueDate}</p>
                          </div>
                        </div>
                      ))}
          </div>
        </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">School Holidays</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Winter Break</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Dec 20 - Jan 5</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Spring Break</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Mar 15 - Mar 22</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 