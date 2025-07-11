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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'vocational' | 'life-skills'>('all');
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
    } catch (error) {
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

  const handleModuleClick = (moduleId: string) => {
    router.push(`/modules/${moduleId}`);
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
          <p className="text-xl text-gray-600 dark:text-gray-400">
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
                onClick={() => setActiveCategory(category.key as any)}
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl">{getCategoryIcon(selectedPath.category)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedPath.name}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedPath.category.charAt(0).toUpperCase() + selectedPath.category.slice(1)} Path
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedPath.description}
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedPath.totalModules}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Modules</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatDuration(selectedPath.totalDuration)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Duration</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {selectedPath.totalXpPoints}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">XP Points</div>
                    </div>
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Learning Milestones
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedPath.milestones.map((milestone, index) => (
                      <div
                        key={milestone.milestoneId}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          milestone.status === 'completed'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : milestone.status === 'in-progress'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : milestone.status === 'available'
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${getStatusColor(milestone.status)}`}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {milestone.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {milestone.description}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            milestone.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                            milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' :
                            milestone.status === 'available' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {getStatusText(milestone.status)}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        {milestone.status !== 'locked' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  milestone.status === 'completed' ? 'bg-green-500' :
                                  milestone.status === 'in-progress' ? 'bg-blue-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${milestone.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Module List */}
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Modules ({milestone.modules.length}):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {milestone.modules.map(moduleId => (
                              <button
                                key={moduleId}
                                onClick={() => handleModuleClick(moduleId)}
                                className="text-left p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                              >
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {moduleId}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>⏱️ {formatDuration(milestone.estimatedTime)}</span>
                          {milestone.prerequisites.length > 0 && (
                            <span>🔗 {milestone.prerequisites.length} prerequisites</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Select a Learning Path
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a path from the list to see detailed milestones and progress
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/recommended-modules')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
            >
              View Recommended Modules
            </button>
            <button
              onClick={() => router.push('/dashboard/student')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium transition-colors hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 