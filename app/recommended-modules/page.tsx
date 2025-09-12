'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

interface Module {
  moduleId: string;
  name: string;
  subject: string;
  category: string;
  description: string;
  learningObjectives: string[];
  recommendedFor: string[];
  xpPoints: number;
  estimatedDuration: number;
  difficulty: string;
  learningType: string;
  content: {
    type: string;
    name: string;
    description: string;
    duration: number;
    status: string;
  }[];
  prerequisites: string[];
  badges: {
    name: string;
    description: string;
    icon: string;
  }[];
  tags: string[];
}

interface RecommendedModules {
  academic: Module[];
  vocational: Module[];
  lifeSkills: Module[];
  all: Module[];
}

export default function RecommendedModules() {
  const [modules, setModules] = useState<Array<{
    id: string; 
    name: string; 
    subject: string; 
    description: string; 
    xpPoints: number; 
    estimatedDuration: number;
    difficulty: string;
    grade: string;
    tags: string[];
    videoUrl?: string;
    quizQuestions?: any[];
    contentTypes?: any[];
    gamification?: any;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | 'academic' | 'vocational' | 'lifeSkills'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchRecommendedModules();
  }, []);

  const fetchRecommendedModules = async () => {
    try {
      const response = await fetch('/api/modules/recommended');
      if (response.ok) {
        const data = await response.json();
        console.log('Recommended modules data:', data);
        
        if (data.success && data.modules) {
          // Transform API data to match component interface
          const transformedModules = data.modules.map((module: any) => ({
            id: module.id,
            name: module.title,
            subject: module.subject,
            description: module.description,
            xpPoints: module.points || 100,
            estimatedDuration: module.duration || 30,
            difficulty: module.difficulty || 'beginner',
            grade: module.grade || 'All',
            tags: module.tags || [],
            videoUrl: module.videoUrl,
            quizQuestions: module.quizQuestions || [],
            contentTypes: module.contentTypes || [],
            gamification: module.gamification || {}
          }));
          setModules(transformedModules);
        } else {
          console.warn('No modules data received from API');
        }
      } else {
        console.error('Failed to fetch recommended modules:', response.status);
      }
    } catch (error) {
      console.error('Error fetching recommended modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getLearningTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'quiz': return '❓';
      case 'story': return '📖';
      case 'interactive': return '🎮';
      case 'project': return '🔨';
      default: return '📚';
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

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const filteredModules = () => {
    if (!modules || !Array.isArray(modules)) return [];
    
    let moduleList = modules;
    
    if (searchTerm) {
      moduleList = moduleList.filter(module =>
        module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return moduleList;
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/modules/${moduleId}`);
  };

  if (isLoading) {
    return (
      <ConsistentLoadingPage
        type="modules"
        title="Loading Recommendations"
        subtitle="Preparing your personalized learning recommendations..."
        tips={[
          'Analyzing your learning profile',
          'Matching content to your interests',
          'Preparing personalized modules'
        ]}
      />
    );
  }

  if (!modules) { // Changed from error || !modules to !modules
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No recommended modules found. Please complete the assessment first.
          </p>
          <button
            onClick={() => router.push('/skill-assessment')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            Complete Assessment
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
            Recommended Modules
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Personalized learning modules based on your assessment results
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', icon: '📚' },
                { key: 'academic', label: 'Academic', icon: '🎓' },
                { key: 'vocational', label: 'Vocational', icon: '🔧' },
                { key: 'lifeSkills', label: 'Life Skills', icon: '💡' }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key as 'all' | 'academic' | 'vocational' | 'lifeSkills')}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
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
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules().map(module => (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module.id)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
            >
              {/* Module Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📚</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{module.subject}</span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    Recommended
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {module.name}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {module.description}
                </p>

                {/* Module Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span className="text-gray-700 dark:text-gray-300">{module.xpPoints} XP</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span className="text-gray-700 dark:text-gray-300">{formatDuration(module.estimatedDuration)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>📊</span>
                      <span className="text-gray-700 dark:text-gray-300">{module.grade}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                    {module.difficulty}
                  </span>
                </div>
              </div>

              {/* Module Content */}
              <div className="p-6">
                {/* Learning Objectives Placeholder */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What you&apos;ll learn:</h4>
                  <ul className="space-y-1">
                    <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Master key concepts in {module.subject}</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Apply knowledge through practical exercises</span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>Build confidence in {module.subject} skills</span>
                    </li>
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs">
                    {module.subject}
                  </span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs">
                    Recommended
                  </span>
                  {module.tags && module.tags.length > 0 ? (
                    module.tags.slice(0, 2).map((tag: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs">
                      Interactive
                    </span>
                  )}
                </div>
              </div>

              {/* Module Footer */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700">
                  Start Learning
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredModules().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No modules found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search terms or category filter
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/curriculum-path')}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700"
            >
              Explore Learning Paths
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