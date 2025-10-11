'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowSize } from '@/lib/hooks/useWindowSize';

interface Branch {
  _id: string;
  branchName: string;
  branchCode: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  principalName: string;
  principalEmail: string;
  isActive: boolean;
  createdAt: string;
}

interface Teacher {
  _id: string;
  fullName: string;
  email: string;
  subjectSpecialization: string;
  experienceYears: number;
  schoolName: string;
  isActive: boolean;
  createdAt: string;
}

interface DashboardStats {
  totalBranches: number;
  totalTeachers: number;
  totalStudents: number;
  pendingInvitations: number;
}

export default function OrganizationAdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showTeacherInviteForm, setShowTeacherInviteForm] = useState(false);
  const [branchFormData, setBranchFormData] = useState({
    branchName: '',
    branchCode: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    phoneNumber: '',
    email: '',
    principalName: '',
    principalEmail: '',
    principalPhone: ''
  });
  const [teacherInviteData, setTeacherInviteData] = useState({
    email: '',
    name: '',
    branchId: '',
    subjectSpecialization: '',
    experienceYears: '',
    gradeLevels: [] as string[],
    subjects: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Organization Admin navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
    { id: 'branches', label: 'Branches', icon: '/icons/rewards.png' },
    { id: 'teachers', label: 'Teachers', icon: '/icons/profile.png' },
    { id: 'reports', label: 'Reports', icon: '/icons/report.png' },
    { id: 'audit', label: 'Audit Logs', icon: '/icons/settings.png' },
  ];

  useEffect(() => {
    const fetchUserAndDashboard = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          if (userData.user.role !== 'organization') {
            router.push('/login');
            return;
          }
          setUser(userData.user);
          
          // Fetch dashboard statistics
          try {
            const statsResponse = await fetch('/api/organization/dashboard-stats');
            if (statsResponse.ok) {
              const statsData = await statsResponse.json();
              setDashboardStats(statsData);
            }
          } catch (error) {
            console.error('Error fetching dashboard stats:', error);
          }

          // Fetch branches
          try {
            const branchesResponse = await fetch('/api/organization/branches');
            if (branchesResponse.ok) {
              const branchesData = await branchesResponse.json();
              setBranches(branchesData.branches || []);
            }
          } catch (error) {
            console.error('Error fetching branches:', error);
          }

          // Fetch teachers
          try {
            const teachersResponse = await fetch('/api/organization/teachers');
            if (teachersResponse.ok) {
              const teachersData = await teachersResponse.json();
              setTeachers(teachersData.teachers || []);
            }
          } catch (error) {
            console.error('Error fetching teachers:', error);
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

    fetchUserAndDashboard();
  }, [router]);

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/organization/branches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(branchFormData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setBranches(prev => [data.branch, ...prev]);
        setShowBranchForm(false);
        setBranchFormData({
          branchName: '',
          branchCode: '',
          address: '',
          city: '',
          state: '',
          country: 'India',
          phoneNumber: '',
          email: '',
          principalName: '',
          principalEmail: '',
          principalPhone: ''
        });
        alert('Branch created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Error creating branch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/organization/invite-teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(teacherInviteData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setShowTeacherInviteForm(false);
        setTeacherInviteData({
          email: '',
          name: '',
          branchId: '',
          subjectSpecialization: '',
          experienceYears: '',
          gradeLevels: [],
          subjects: []
        });
        alert('Teacher invitation sent successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error inviting teacher:', error);
      alert('Error inviting teacher');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Organization Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome, {user?.name}
              </div>
              <button
                onClick={() => {
                  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  router.push('/login');
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm">
          <div className="p-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <img src={item.icon} alt={item.label} className="w-5 h-5 mr-3" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              
              {/* Stats Cards */}
              {dashboardStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <img src="/icons/rewards.png" alt="Branches" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Branches</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBranches}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <img src="/icons/profile.png" alt="Teachers" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTeachers}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <img src="/icons/overview.png" alt="Students" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <img src="/icons/report.png" alt="Invitations" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingInvitations}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Branches</h2>
                <button
                  onClick={() => setShowBranchForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Branch
                </button>
              </div>

              {/* Branch Form Modal */}
              {showBranchForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Branch</h3>
                    <form onSubmit={handleBranchSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                        <input
                          type="text"
                          required
                          value={branchFormData.branchName}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, branchName: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Branch Code</label>
                        <input
                          type="text"
                          required
                          value={branchFormData.branchCode}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, branchCode: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                          type="text"
                          required
                          value={branchFormData.address}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, address: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">City</label>
                          <input
                            type="text"
                            required
                            value={branchFormData.city}
                            onChange={(e) => setBranchFormData(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">State</label>
                          <input
                            type="text"
                            required
                            value={branchFormData.state}
                            onChange={(e) => setBranchFormData(prev => ({ ...prev, state: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={branchFormData.phoneNumber}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          required
                          value={branchFormData.email}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Principal Name</label>
                        <input
                          type="text"
                          required
                          value={branchFormData.principalName}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, principalName: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Principal Email</label>
                        <input
                          type="email"
                          required
                          value={branchFormData.principalEmail}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, principalEmail: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Principal Phone</label>
                        <input
                          type="tel"
                          required
                          value={branchFormData.principalPhone}
                          onChange={(e) => setBranchFormData(prev => ({ ...prev, principalPhone: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowBranchForm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Creating...' : 'Create Branch'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Branches List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">All Branches</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {branches.map((branch) => (
                        <tr key={branch._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{branch.branchName}</div>
                              <div className="text-sm text-gray-500">{branch.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{branch.branchCode}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{branch.city}, {branch.state}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{branch.principalName}</div>
                              <div className="text-sm text-gray-500">{branch.principalEmail}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              branch.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {branch.isActive ? 'Active' : 'Inactive'}
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

          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Teachers</h2>
                <button
                  onClick={() => setShowTeacherInviteForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Invite Teacher
                </button>
              </div>

              {/* Teacher Invite Form Modal */}
              {showTeacherInviteForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Invite Teacher</h3>
                    <form onSubmit={handleTeacherInviteSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          required
                          value={teacherInviteData.email}
                          onChange={(e) => setTeacherInviteData(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input
                          type="text"
                          required
                          value={teacherInviteData.name}
                          onChange={(e) => setTeacherInviteData(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Branch</label>
                        <select
                          required
                          value={teacherInviteData.branchId}
                          onChange={(e) => setTeacherInviteData(prev => ({ ...prev, branchId: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Branch</option>
                          {branches.map((branch) => (
                            <option key={branch._id} value={branch._id}>{branch.branchName}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subject Specialization</label>
                        <input
                          type="text"
                          required
                          value={teacherInviteData.subjectSpecialization}
                          onChange={(e) => setTeacherInviteData(prev => ({ ...prev, subjectSpecialization: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Experience Years</label>
                        <input
                          type="number"
                          required
                          value={teacherInviteData.experienceYears}
                          onChange={(e) => setTeacherInviteData(prev => ({ ...prev, experienceYears: e.target.value }))}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowTeacherInviteForm(false)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Send Invitation'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Teachers List */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">All Teachers</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {teachers.map((teacher) => (
                        <tr key={teacher._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{teacher.fullName}</div>
                              <div className="text-sm text-gray-500">{teacher.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.subjectSpecialization}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.experienceYears} years</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{teacher.schoolName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              teacher.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                            }`}>
                              {teacher.isActive ? 'Active' : 'Inactive'}
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

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Reports and analytics will be available here.</p>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600">Audit logs and system activity will be available here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
