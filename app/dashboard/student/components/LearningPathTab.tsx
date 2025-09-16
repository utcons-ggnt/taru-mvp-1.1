'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Target, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ExternalLink,
  Star,
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Award,
  Zap,
  Lightbulb,
  Rocket,
  Globe,
  Lock,
  Unlock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LearningPath {
  _id: string;
  studentId: string;
  careerPath: string;
  description: string;
  learningModules: Array<{
    module: string;
    description: string;
    submodules?: Array<{
      title: string;
      description: string;
      chapters?: Array<{
        title: string;
      }>;
    }>;
  }>;
  timeRequired: string;
  focusAreas: string[];
  createdAt: string;
  updatedAt: string;
}

interface LearningPathTabProps {
  user: {
    uniqueId?: string;
    name?: string;
  } | null;
  onTabChange?: (tab: string) => void;
}

export default function LearningPathTab({ user, onTabChange }: LearningPathTabProps) {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const router = useRouter();

  // Fetch saved learning paths
  const fetchLearningPaths = async () => {
    if (!user?.uniqueId) {
      console.log('🔍 No user uniqueId available for fetching learning paths');
      setLoading(false);
      return;
    }
    
    try {
      console.log('🔍 Fetching learning paths for user:', user.uniqueId);
      setLoading(true);
      const response = await fetch(`/api/learning-paths?studentId=${user.uniqueId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Learning paths API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Learning paths data received:', data);
        setLearningPaths(data.learningPaths || []);
        
        // Set the most recent path as current if none is selected
        if (data.learningPaths?.length > 0 && !currentPath) {
          setCurrentPath(data.learningPaths[0]);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch learning paths:', response.status, errorData);
        setError('Failed to load learning paths');
      }
    } catch (err) {
      console.error('Error fetching learning paths:', err);
      setError('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  // Save learning path from career details
  const saveLearningPath = async (careerPath: string, description: string, learningModules: any[], timeRequired: string, focusAreas: string[]) => {
    if (!user?.uniqueId) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/learning-paths/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.uniqueId,
          careerPath,
          description,
          learningModules,
          timeRequired,
          focusAreas
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Learning path saved successfully!');
        await fetchLearningPaths(); // Refresh the list
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save learning path');
      }
    } catch (err) {
      console.error('Error saving learning path:', err);
      setError('Failed to save learning path');
    } finally {
      setSaving(false);
    }
  };

  // Delete learning path
  const deleteLearningPath = async (pathId: string) => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess('Learning path deleted successfully!');
        await fetchLearningPaths(); // Refresh the list
        
        // If we deleted the current path, select another one
        if (currentPath?._id === pathId) {
          setCurrentPath(learningPaths.length > 1 ? learningPaths[1] : null);
        }
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to delete learning path');
      }
    } catch (err) {
      console.error('Error deleting learning path:', err);
      setError('Failed to delete learning path');
    }
  };

  // Set active learning path
  const setActivePath = async (path: LearningPath) => {
    try {
      const response = await fetch(`/api/learning-paths/${path._id}/set-active`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId: user?.uniqueId }),
      });

      if (response.ok) {
        setCurrentPath(path);
        setSuccess('Learning path activated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Failed to activate learning path');
      }
    } catch (err) {
      console.error('Error setting active path:', err);
      setError('Failed to activate learning path');
    }
  };

  useEffect(() => {
    if (user?.uniqueId) {
      console.log('🔍 User uniqueId available, fetching learning paths...', user.uniqueId);
      fetchLearningPaths();
    } else {
      console.log('🔍 No user uniqueId available yet, waiting...');
      setLoading(false);
    }
  }, [user?.uniqueId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  if (!user?.uniqueId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600">Please log in to view your learning paths.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
      </div>

      <motion.div 
        className="relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-w-7xl mx-auto m-8 border border-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Enhanced Header */}
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-6">
            <motion.div
              className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Target className="w-10 h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Star className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            <div>
              <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Learning Paths
              </h2>
              <p className="text-gray-600 text-xl">Your personalized career learning journey</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  {learningPaths.length} Paths Available
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  AI-Powered
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              onClick={() => router.push('/career-exploration')}
              className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl overflow-hidden"
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="w-6 h-6 relative z-10" />
              <span className="font-semibold text-lg relative z-10">Choose New Path</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Error and Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-4 shadow-lg"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Something went wrong</h4>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
          {success && (
            <motion.div 
              className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 rounded-2xl flex items-center gap-4 shadow-lg"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, type: "spring" }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-1">Success!</h4>
                <p className="text-sm">{success}</p>
              </div>
              <button
                onClick={() => setSuccess(null)}
                className="p-2 hover:bg-green-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Learning Paths List */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {learningPaths.length === 0 ? (
            <div className="col-span-2 text-center py-20">
              <motion.div 
                className="relative w-32 h-32 bg-gradient-to-br from-purple-100 via-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Target className="w-16 h-16 text-purple-500" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                No Learning Paths Yet
              </h3>
              <p className="text-gray-600 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Embark on your personalized learning journey by exploring career options and creating your first AI-powered learning path tailored just for you.
              </p>
              <motion.button
                onClick={() => router.push('/career-exploration')}
                className="group relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-12 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center gap-3">
                  <Rocket className="w-6 h-6" />
                  Explore Career Options
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </motion.button>
            </div>
          ) : (
            learningPaths.map((path, index) => (
              <motion.div
                key={path._id}
                className={`group relative bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 rounded-3xl p-8 border-2 transition-all duration-500 overflow-hidden ${
                  currentPath?._id === path._id 
                    ? 'border-purple-500 shadow-2xl scale-105' 
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-2xl'
                }`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-full translate-y-12 -translate-x-12"></div>
                
                {/* Active Badge */}
                {currentPath?._id === path._id && (
                  <motion.div 
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Star className="w-4 h-4" />
                    Active Path
                  </motion.div>
                )}

                {/* Path Header */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          currentPath?._id === path._id 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                            : 'bg-gradient-to-r from-purple-400 to-blue-400'
                        }`}>
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1">{path.careerPath}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(path.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-base mb-4 leading-relaxed line-clamp-2">{path.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-full">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">{path.timeRequired}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">{path.learningModules.length} modules</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Actions */}
                    <div className="flex gap-2 ml-6">
                      {currentPath?._id !== path._id && (
                        <motion.button
                          onClick={() => setActivePath(path)}
                          className="group p-3 text-purple-600 hover:bg-purple-100 rounded-xl transition-all duration-300 border border-purple-200 hover:border-purple-300"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => deleteLearningPath(path._id)}
                        className="group p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-300"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Enhanced Focus Areas */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      Focus Areas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {path.focusAreas.slice(0, 3).map((area, idx) => (
                        <motion.span
                          key={idx}
                          className="px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 text-sm font-medium rounded-full border border-purple-200 hover:border-purple-300 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                        >
                          {area}
                        </motion.span>
                      ))}
                      {path.focusAreas.length > 3 && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full border border-gray-200">
                          +{path.focusAreas.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Enhanced Learning Modules Preview */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      Learning Modules
                    </h4>
                    <div className="space-y-3">
                      {path.learningModules.slice(0, 2).map((module, idx) => (
                        <motion.div 
                          key={idx} 
                          className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-gray-100 hover:border-purple-200 transition-all duration-300"
                          whileHover={{ x: 5 }}
                        >
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-700 font-medium truncate">{module.module}</span>
                        </motion.div>
                      ))}
                      {path.learningModules.length > 2 && (
                        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg text-center">
                          +{path.learningModules.length - 2} more modules available
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Enhanced View Details Button */}
                  <motion.button
                    onClick={() => router.push(`/career-details?careerPath=${encodeURIComponent(path.careerPath)}&description=${encodeURIComponent(path.description)}`)}
                    className="group w-full py-4 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 hover:from-purple-100 hover:via-blue-100 hover:to-indigo-100 text-purple-700 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 border border-purple-200 hover:border-purple-300 shadow-lg hover:shadow-xl"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ExternalLink className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    View Full Details
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Enhanced Current Path Details */}
        {currentPath && (
          <motion.div 
            className="mt-12 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-purple-200 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-blue-200/30 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/30 to-purple-200/30 rounded-full translate-y-16 -translate-x-16"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    Current Learning Path
                  </h3>
                  <p className="text-xl font-semibold text-gray-800">{currentPath.careerPath}</p>
                </div>
              </div>
              
              <p className="text-gray-700 text-lg mb-8 leading-relaxed max-w-4xl">{currentPath.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-purple-200">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Duration</p>
                    <p className="text-lg font-bold text-gray-800">{currentPath.timeRequired}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-blue-200">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Modules</p>
                    <p className="text-lg font-bold text-gray-800">{currentPath.learningModules.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-white/60 rounded-2xl border border-indigo-200">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Focus Areas</p>
                    <p className="text-lg font-bold text-gray-800">{currentPath.focusAreas.length}</p>
                  </div>
                </div>
              </div>

              <motion.button
                onClick={() => onTabChange?.('modules')}
                className="group relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 shadow-2xl hover:shadow-3xl flex items-center gap-4 overflow-hidden"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Rocket className="w-6 h-6 relative z-10" />
                <span className="relative z-10">Start Learning Journey</span>
                <ArrowRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
