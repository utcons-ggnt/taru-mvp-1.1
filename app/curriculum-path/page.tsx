'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Milestone {
  milestoneId: string;
  name: string;
  description: string;
  modules: string[];
  estimatedTime: number;
  prerequisites: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed';
  progress: number;
}

interface LearningPath {
  pathId: string;
  name: string;
  description: string;
  category: string;
  targetGrade: string;
  careerGoal: string;
  milestones: Milestone[];
  totalModules: number;
  totalDuration: number;
  totalXpPoints: number;
}

export default function CurriculumPath() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const response = await fetch('/api/learning-paths');
      if (response.ok) {
        const data = await response.json();
        setLearningPaths(data.paths);
      } else {
        setError('Failed to load learning paths');
      }
    } catch {
      setError('Failed to load learning paths');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic': return '🎓';
      case 'vocational': return '🔧';
      case 'life-skills': return '💡';
      default: return '📚';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'available': return 'bg-yellow-500';
      case 'locked': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'available': return 'Available';
      case 'locked': return 'Locked';
      default: return 'Unknown';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const filteredPaths = learningPaths.filter(path => 
    activeCategory === 'all' || path.category === activeCategory
  );

  const handlePathSelect = (path: LearningPath) => {
    setSelectedPath(path);
  };

  const handleStartPath = (pathId: string) => {
    router.push(`/learning-path/${pathId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/student')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learning Paths
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Choose your learning journey and track your progress
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: 'all', label: 'All Paths', icon: '📚' },
              { key: 'academic', label: 'Academic', icon: '🎓' },
              { key: 'vocational', label: 'Vocational', icon: '🔧' },
              { key: 'life-skills', label: 'Life Skills', icon: '💡' }
            ].map(category => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Paths List */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Available Paths
            </h2>
            
            {filteredPaths.map(path => (
              <div
                key={path.pathId}
                onClick={() => handlePathSelect(path)}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-300 ${
                  selectedPath?.pathId === path.pathId
                    ? 'ring-2 ring-blue-500 shadow-xl'
                    : 'hover:shadow-xl hover:scale-105'
                }`}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-2xl">{getCategoryIcon(path.category)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {path.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {path.category.charAt(0).toUpperCase() + path.category.slice(1)}
                    </p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {path.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span>📚 {path.totalModules} modules</span>
                  <span>⏱️ {formatDuration(path.totalDuration)}</span>
                  <span>⭐ {path.totalXpPoints} XP</span>
                </div>

                {path.targetGrade && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Target Grade:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{path.targetGrade}</p>
                  </div>
                )}

                {path.careerGoal && (
                  <div className="mb-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Career Goal:</span>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{path.careerGoal}</p>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartPath(path.pathId);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
                >
                  Start Path
                </button>
              </div>
            ))}
          </div>

          {/* Selected Path Details */}
          <div className="lg:col-span-2">
            {selectedPath ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{getCategoryIcon(selectedPath.category)}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {selectedPath.name}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {selectedPath.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedPath.totalModules}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Modules</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatDuration(selectedPath.totalDuration)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total Duration</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedPath.totalXpPoints}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Total XP</div>
                    </div>
                  </div>

                  {selectedPath.targetGrade && (
                    <div className="mb-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Grade:</span>
                      <p className="text-lg text-gray-900 dark:text-white">{selectedPath.targetGrade}</p>
                    </div>
                  )}

                  {selectedPath.careerGoal && (
                    <div className="mb-6">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Career Goal:</span>
                      <p className="text-lg text-gray-900 dark:text-white">{selectedPath.careerGoal}</p>
                    </div>
                  )}
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Learning Milestones
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedPath.milestones.map((milestone, index) => (
                      <div
                        key={milestone.milestoneId}
                        className={`border-2 rounded-lg p-6 transition-all duration-300 ${
                          milestone.status === 'completed'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : milestone.status === 'in-progress'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : milestone.status === 'available'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-300 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              getStatusColor(milestone.status)
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {milestone.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              milestone.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                              milestone.status === 'in-progress' ? 'text-blue-600 dark:text-blue-400' :
                              milestone.status === 'available' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-gray-500 dark:text-gray-400'
                            }`}>
                              {getStatusText(milestone.status)}
                            </div>
                            {milestone.status !== 'locked' && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {milestone.progress}% complete
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Estimated Time:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDuration(milestone.estimatedTime)}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Modules:</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {milestone.modules.length} modules
                            </p>
                          </div>
                        </div>

                        {milestone.prerequisites.length > 0 && (
                          <div className="mt-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Prerequisites:</span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {milestone.prerequisites.map((prereq, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded text-xs"
                                >
                                  {prereq}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {milestone.status === 'available' && (
                          <button
                            onClick={() => handleStartPath(selectedPath.pathId)}
                            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
                          >
                            Start This Milestone
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Learning Path
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a learning path from the list to view detailed information and milestones.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 