'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWindowSize } from '@/lib/hooks/useWindowSize';
import Sidebar from '../student/components/Sidebar';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { saveAs } from 'file-saver';
import { motion, AnimatePresence } from 'framer-motion';
import { TypewriterText, StaggeredText, GradientText, CharacterAnimation } from '../../components/TextAnimations';
import { TiltCard, MagneticButton } from '../../components/InteractiveElements';
import { StaggerContainer, StaggerItem } from '../../components/PageTransitions';
import { ScrollFade, ScrollCounter, ParallaxScroll, ScrollProgress } from '../../components/ScrollAnimations';
import { FloatingParticles, MorphingBlob } from '../../components/FloatingElements';
import ConsistentLoadingPage from '../../components/ConsistentLoadingPage';

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

// Module Management Interface Component
interface Module {
  _id: string;
  moduleId: string;
  title: string;
  subject: string;
  grade: string;
  difficulty: string;
  duration: number;
  points: number;
  description: string;
  content: string;
  learningObjectives: string[];
  prerequisites: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completionStats?: {
    totalAttempts: number;
    completedAttempts: number;
    completionRate: number;
    avgScore: number;
  };
}

interface ModuleManagementState {
  modules: Module[];
  loading: boolean;
  searchTerm: string;
  subjectFilter: string;
  gradeFilter: string;
  difficultyFilter: string;
  statusFilter: string;
  currentPage: number;
  totalPages: number;
  selectedModules: string[];
  showCreateModal: boolean;
  showEditModal: boolean;
  editingModule: Module | null;
  showBulkActions: boolean;
}

function ModuleManagementInterface() {
  const [state, setState] = useState<ModuleManagementState>({
    modules: [],
    loading: true,
    searchTerm: '',
    subjectFilter: 'all',
    gradeFilter: 'all',
    difficultyFilter: 'all',
    statusFilter: 'all',
    currentPage: 1,
    totalPages: 1,
    selectedModules: [],
    showCreateModal: false,
    showEditModal: false,
    editingModule: null,
    showBulkActions: false
  });

  const [newModule, setNewModule] = useState({
    title: '',
    subject: '',
    grade: '',
    difficulty: '',
    duration: 30,
    points: 100,
    description: '',
    content: '',
    learningObjectives: [] as string[],
    prerequisites: [] as string[],
    tags: [] as string[],
    isActive: true
  });

  const [stats, setStats] = useState({
    totalModules: 0,
    activeModules: 0,
    totalPoints: 0,
    avgDuration: 0,
    subjectBreakdown: {} as Record<string, number>,
    gradeBreakdown: {} as Record<string, number>,
    difficultyBreakdown: {} as Record<string, number>
  });

  // Fetch modules data
  const fetchModules = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const params = new URLSearchParams({
        page: state.currentPage.toString(),
        limit: '10',
        ...(state.subjectFilter !== 'all' && { subject: state.subjectFilter }),
        ...(state.gradeFilter !== 'all' && { grade: state.gradeFilter }),
        ...(state.difficultyFilter !== 'all' && { difficulty: state.difficultyFilter }),
        ...(state.statusFilter !== 'all' && { status: state.statusFilter })
      });

      const response = await fetch(`/api/admin/modules?${params}`);
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          modules: data.modules,
          totalPages: data.pagination.pages,
          loading: false
        }));
        setStats({
          totalModules: data.statistics.totalModules,
          activeModules: data.statistics.activeModules,
          totalPoints: data.statistics.totalPoints,
          avgDuration: data.statistics.avgDuration,
          subjectBreakdown: data.statistics.subjectBreakdown,
          gradeBreakdown: data.statistics.gradeBreakdown,
          difficultyBreakdown: data.statistics.difficultyBreakdown
        });
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.currentPage, state.subjectFilter, state.gradeFilter, state.difficultyFilter, state.statusFilter]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Handle module actions
  const handleModuleAction = async (moduleId: string, action: string, data?: any) => {
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, action, data })
      });

      if (response.ok) {
        await fetchModules(); // Refresh the list
        return true;
      }
    } catch (error) {
      console.error('Error performing module action:', error);
    }
    return false;
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/modules?moduleId=${moduleId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchModules();
        }
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  };

  const handleCreateModule = async () => {
    try {
      const response = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModule)
      });

      if (response.ok) {
        setState(prev => ({ ...prev, showCreateModal: false }));
        setNewModule({
          title: '',
          subject: '',
          grade: '',
          difficulty: '',
          duration: 30,
          points: 100,
          description: '',
          content: '',
          learningObjectives: [],
          prerequisites: [],
          tags: [],
          isActive: true
        });
        await fetchModules();
      }
    } catch (error) {
      console.error('Error creating module:', error);
    }
  };

  const filteredModules = state.modules.filter(module => 
    module.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
    module.subject.toLowerCase().includes(state.searchTerm.toLowerCase())
  );

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education'];
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Content Management</h2>
            <p className="text-gray-600 mt-1">Create, edit, and manage learning modules for your organization</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setState(prev => ({ ...prev, showBulkActions: !prev.showBulkActions }))}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Bulk Actions
            </button>
            <button
              onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create Module
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.totalModules}</div>
            <div className="text-sm text-blue-700">Total Modules</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{stats.activeModules}</div>
            <div className="text-sm text-green-700">Active Modules</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{stats.totalPoints}</div>
            <div className="text-sm text-purple-700">Total Points</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{Math.round(stats.avgDuration)}</div>
            <div className="text-sm text-orange-700">Avg Duration (min)</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search modules by title, description, or subject..."
              value={state.searchTerm}
              onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={state.subjectFilter}
            onChange={(e) => setState(prev => ({ ...prev, subjectFilter: e.target.value, currentPage: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={state.gradeFilter}
            onChange={(e) => setState(prev => ({ ...prev, gradeFilter: e.target.value, currentPage: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Grades</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <select
            value={state.difficultyFilter}
            onChange={(e) => setState(prev => ({ ...prev, difficultyFilter: e.target.value, currentPage: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </div>

        {/* Bulk Actions */}
        {state.showBulkActions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {state.selectedModules.length} modules selected
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200">
                  Export
                </button>
                <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                  Activate
                </button>
                <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  Deactivate
                </button>
                <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200">
                  Duplicate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modules Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
        {state.loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading modules...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setState(prev => ({ ...prev, selectedModules: filteredModules.map(m => m._id) }));
                        } else {
                          setState(prev => ({ ...prev, selectedModules: [] }));
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModules.map((module) => (
                  <tr key={module._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={state.selectedModules.includes(module._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setState(prev => ({ ...prev, selectedModules: [...prev.selectedModules, module._id] }));
                          } else {
                            setState(prev => ({ ...prev, selectedModules: prev.selectedModules.filter(id => id !== module._id) }));
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{module.title}</div>
                        <div className="text-sm text-gray-500">{module.points} points • {module.duration} min</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {module.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {module.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        module.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        module.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        module.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {module.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        module.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {module.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {module.completionStats ? (
                        <div>
                          <div>{module.completionStats.completionRate}% completion</div>
                          <div className="text-xs text-gray-500">{module.completionStats.totalAttempts} attempts</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No data</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setState(prev => ({ ...prev, showEditModal: true, editingModule: module }))}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleModuleAction(module.moduleId, module.isActive ? 'deactivate' : 'activate')}
                          className="text-green-600 hover:text-green-900"
                        >
                          {module.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleModuleAction(module.moduleId, 'duplicate')}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.moduleId)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                disabled={state.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                disabled={state.currentPage === state.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{state.currentPage}</span> of{' '}
                  <span className="font-medium">{state.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                    disabled={state.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                    disabled={state.currentPage === state.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Module Modal */}
      {state.showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Create New Module</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newModule.title}
                    onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <select
                    value={newModule.subject}
                    onChange={(e) => setNewModule(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
                  <select
                    value={newModule.grade}
                    onChange={(e) => setNewModule(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Grade</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={newModule.difficulty}
                    onChange={(e) => setNewModule(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Difficulty</option>
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newModule.duration}
                    onChange={(e) => setNewModule(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <input
                    type="number"
                    value={newModule.points}
                    onChange={(e) => setNewModule(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newModule.content}
                  onChange={(e) => setNewModule(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter the module content here..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newModule.isActive}
                  onChange={(e) => setNewModule(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active (available to students)
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setState(prev => ({ ...prev, showCreateModal: false }))}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateModule}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Module
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
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
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [studentFormData, setStudentFormData] = useState({
    name: '',
    email: '',
    classGrade: '',
    schoolName: ''
  });
  const [bulkImportData, setBulkImportData] = useState('');
  const router = useRouter();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 1024;

  // Avatar utility functions
  const AVAILABLE_AVATARS = [
    '/avatars/Group.svg',
    '/avatars/Group-1.svg',
    '/avatars/Group-2.svg',
    '/avatars/Group-3.svg',
    '/avatars/Group-4.svg',
    '/avatars/Group-5.svg',
    '/avatars/Group-6.svg',
    '/avatars/Group-7.svg',
    '/avatars/Group-8.svg'
  ];

  function getRandomAvatar(userId?: string): string {
    if (!userId) return AVAILABLE_AVATARS[0];
    
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const randomIndex = Math.abs(hash) % AVAILABLE_AVATARS.length;
    return AVAILABLE_AVATARS[randomIndex];
  }

  // Organization Admin navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
    { id: 'users', label: 'Users', icon: '/icons/profile.png' },
    { id: 'content', label: 'Content Management', icon: '/icons/modules.png' },
    { id: 'branches', label: 'Branches', icon: '/icons/rewards.png' },
    { id: 'teachers', label: 'Teachers', icon: '/icons/profile.png' },
    { id: 'analytics', label: 'Analytics', icon: '/icons/report.png' },
    { id: 'announcements', label: 'Announcements', icon: '/icons/bot.png' },
    { id: 'settings', label: 'Settings', icon: '/icons/settings.png' },
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

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teacher/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(studentFormData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setShowStudentForm(false);
        setStudentFormData({
          name: '',
          email: '',
          classGrade: '',
          schoolName: ''
        });
        alert('Student created successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Error creating student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/teacher/bulk-import-students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ csvData: bulkImportData }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setShowBulkImport(false);
        setBulkImportData('');
        alert(`Successfully imported ${data.importedCount} students!`);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error importing students:', error);
      alert('Error importing students');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportCredentials = async () => {
    try {
      const response = await fetch('/api/teacher/students/export-credentials', {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, 'student-credentials.csv');
      } else {
        alert('Error exporting credentials');
      }
    } catch (error) {
      console.error('Error exporting credentials:', error);
      alert('Error exporting credentials');
    }
  };

  if (isLoading) {
    return (
      <ConsistentLoadingPage
        type="dashboard"
        title="Loading Organization Dashboard"
        subtitle="Setting up your organization management interface..."
        tips={[
          'Loading organization data',
          'Preparing user management tools',
          'Setting up analytics dashboard'
        ]}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">OA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Organization Dashboard
                </h1>
                <p className="text-sm text-gray-500">Organization Management Center</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold text-gray-900">{user?.name}</span>
              </div>
              <motion.button
                onClick={() => {
                  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                  router.push('/login');
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:from-gray-700 hover:to-gray-800"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={false}
          onToggle={() => {}}
          navItems={navItems}
          role="admin"
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Organization Overview
                  </h2>
                  <div className="text-sm text-gray-500">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </div>
              </StaggerItem>
              
              {/* Enhanced Stats Cards */}
              {dashboardStats && (
                <StaggerItem>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <TiltCard className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                        <img src="/icons/rewards.png" alt="Branches" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Branches</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalBranches}</p>
                      </div>
                    </div>
                    </TiltCard>

                    <TiltCard className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                        <img src="/icons/profile.png" alt="Teachers" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTeachers}</p>
                      </div>
                    </div>
                    </TiltCard>

                    <TiltCard className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                        <img src="/icons/overview.png" alt="Students" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalStudents}</p>
                      </div>
                    </div>
                    </TiltCard>

                    <TiltCard className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/20">
                    <div className="flex items-center">
                        <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                        <img src="/icons/report.png" alt="Invitations" className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Pending Invitations</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.pendingInvitations}</p>
                      </div>
                    </div>
                    </TiltCard>
                  </div>
                </StaggerItem>
              )}
            </StaggerContainer>
          )}

          {activeTab === 'users' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    User Management
                  </h2>
                  <div className="flex space-x-3">
                    <MagneticButton
                      onClick={() => setShowStudentForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      + Add Student
                    </MagneticButton>
                    <MagneticButton
                      onClick={() => setShowBulkImport(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      📊 Bulk Import
                    </MagneticButton>
                    <MagneticButton
                      onClick={exportCredentials}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      📥 Export Credentials
                    </MagneticButton>
                </div>
                </div>
              </StaggerItem>

              {/* Student Form Modal */}
              {showStudentForm && (
                <Dialog open={showStudentForm} onClose={() => setShowStudentForm(false)} className="relative z-50">
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-2xl">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Add New Student</Dialog.Title>
                      <form onSubmit={handleStudentSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            required
                            value={studentFormData.name}
                            onChange={(e) => setStudentFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={studentFormData.email}
                            onChange={(e) => setStudentFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Class Grade</label>
                          <input
                            type="text"
                            required
                            value={studentFormData.classGrade}
                            onChange={(e) => setStudentFormData(prev => ({ ...prev, classGrade: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                          <input
                            type="text"
                            required
                            value={studentFormData.schoolName}
                            onChange={(e) => setStudentFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowStudentForm(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Creating...' : 'Create Student'}
                          </button>
                        </div>
                      </form>
                    </Dialog.Panel>
                  </div>
                </Dialog>
              )}

              {/* Bulk Import Modal */}
              {showBulkImport && (
                <Dialog open={showBulkImport} onClose={() => setShowBulkImport(false)} className="relative z-50">
                  <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                  <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
                      <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">Bulk Import Students</Dialog.Title>
                      <form onSubmit={handleBulkImport} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">CSV Data</label>
                          <textarea
                            value={bulkImportData}
                            onChange={(e) => setBulkImportData(e.target.value)}
                            rows={10}
                            placeholder="Paste CSV data here (Name, Email, Class Grade, School Name)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          />
            </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            type="button"
                            onClick={() => setShowBulkImport(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {isSubmitting ? 'Importing...' : 'Import Students'}
                          </button>
                        </div>
                      </form>
                    </Dialog.Panel>
                  </div>
                </Dialog>
              )}

              <StaggerItem>
                <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Student Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Add Individual Student</h4>
                      <p className="text-sm text-blue-700">Create a single student account with custom details.</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Bulk Import</h4>
                      <p className="text-sm text-green-700">Import multiple students from CSV data at once.</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Export Credentials</h4>
                      <p className="text-sm text-purple-700">Download student login credentials as CSV file.</p>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
          )}

          {activeTab === 'content' && (
            <ModuleManagementInterface />
          )}

          {activeTab === 'branches' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
              <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Branch Management
                  </h2>
                  <MagneticButton
                  onClick={() => setShowBranchForm(true)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    + Add Branch
                  </MagneticButton>
              </div>
              </StaggerItem>

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
              <StaggerItem>
                <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
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
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
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

          {activeTab === 'analytics' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Organization Analytics
                </h2>
              </StaggerItem>
              <StaggerItem>
                <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">User Engagement</h4>
                      <p className="text-sm text-blue-700">Track student and teacher activity, login patterns, and platform usage.</p>
              </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Learning Progress</h4>
                      <p className="text-sm text-green-700">Monitor student progress, module completion rates, and performance trends.</p>
            </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Branch Performance</h4>
                      <p className="text-sm text-purple-700">Compare performance across different branches and locations.</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Resource Utilization</h4>
                      <p className="text-sm text-orange-700">Analyze platform usage, feature adoption, and resource efficiency.</p>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
          )}

          {activeTab === 'announcements' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Announcements
                </h2>
              </StaggerItem>
              <StaggerItem>
                <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Communication Center</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Send Announcements</h4>
                      <p className="text-sm text-blue-700">Create and send announcements to teachers, students, or specific groups.</p>
              </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Notification Management</h4>
                      <p className="text-sm text-green-700">Manage notification preferences and delivery settings for your organization.</p>
            </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-2">Message Templates</h4>
                      <p className="text-sm text-purple-700">Create and manage reusable message templates for common communications.</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-medium text-orange-900 mb-2">Delivery Reports</h4>
                      <p className="text-sm text-orange-700">Track message delivery status and engagement metrics.</p>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
          )}

          {activeTab === 'settings' && (
            <StaggerContainer className="space-y-6">
              <StaggerItem>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Organization Settings
                </h2>
              </StaggerItem>
              <StaggerItem>
                <TiltCard className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Organization Profile</h4>
                      <p className="text-sm text-gray-600">Update organization details, logo, and branding information.</p>
        </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">User Permissions</h4>
                      <p className="text-sm text-gray-600">Configure role-based permissions and access controls.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Theme Customization</h4>
                      <p className="text-sm text-gray-600">Customize the platform appearance and branding for your organization.</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Integration Settings</h4>
                      <p className="text-sm text-gray-600">Configure third-party integrations and API connections.</p>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            </StaggerContainer>
          )}
        </div>
      </div>
    </div>
  );
}
