'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AssessmentData {
  languagePreference: string;
  enableVoiceInstructions: boolean;
  preferredLearningStyle: string[];
  bestLearningEnvironment: string[];
  subjectsILike: string[];
  topicsThatExciteMe: string[];
  howISpendFreeTime: string[];
  thingsImConfidentDoing: string[];
  thingsINeedHelpWith: string[];
  dreamJobAsKid: string;
  currentCareerInterest: string[];
  peopleIAdmire: string[];
  whatImMostProudOf: string;
  ifICouldFixOneProblem: string;
  diagnosticCompleted: boolean;
  diagnosticScore: number;
  diagnosticResults: {
    learningStyle: string;
    skillLevels: {[key: string]: number};
    interestAreas: string[];
    recommendedModules: string[];
  };
}

export default function ResultSummary() {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      const response = await fetch('/api/assessment/skills-interests');
      if (response.ok) {
        const data = await response.json();
        setAssessment(data.assessment);
      } else {
        // setError('Failed to load assessment data'); // This line was removed as per the edit hint
      }
    } catch {
      // setError('Failed to load assessment data'); // This line was removed as per the edit hint
    } finally {
      setLoading(false);
    }
  };

  const getLearningStyleDescription = (style: string) => {
    switch (style) {
      case 'reading-writing':
        return 'You learn best through reading and writing activities. You enjoy working with text, taking notes, and expressing ideas through writing.';
      case 'logical-mathematical':
        return 'You learn best through logical thinking and problem-solving. You enjoy working with numbers, patterns, and systematic approaches.';
      case 'visual-spatial':
        return 'You learn best through visual and hands-on activities. You enjoy working with images, diagrams, and physical objects.';
      case 'balanced':
        return 'You learn well through a variety of approaches. You can adapt to different learning styles and methods.';
      default:
        return 'You have a unique learning style that combines different approaches.';
    }
  };

  const getSkillLevelDescription = (score: number) => {
    if (score >= 80) return { level: 'Advanced', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 60) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Beginner', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Oops!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No assessment data found. Please complete the assessment first.
          </p>
          <button
            onClick={() => router.push('/skill-assessment')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Your Learning Profile
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Here&apos;s what we learned about you and your personalized learning recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Language & Voice Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Preferences
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Language:</span>
                  <p className="font-medium text-gray-900 dark:text-white">{assessment.languagePreference}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Voice Instructions:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {assessment.enableVoiceInstructions ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Style */}
            {assessment.diagnosticCompleted && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Your Learning Style
                </h2>
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    {assessment.diagnosticResults.learningStyle.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {getLearningStyleDescription(assessment.diagnosticResults.learningStyle)}
                </p>
              </div>
            )}

            {/* Interests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Your Interests
              </h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Favorite Subjects:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {assessment.subjectsILike.slice(0, 5).map(subject => (
                      <span key={subject} className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-xs">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Career Interests:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {assessment.currentCareerInterest.slice(0, 3).map(career => (
                      <span key={career} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-xs">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Skills & Strengths */}
          <div className="lg:col-span-2 space-y-6">
            {/* Diagnostic Results */}
            {assessment.diagnosticCompleted && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Your Skills Assessment
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(assessment.diagnosticResults.skillLevels).map(([category, score]) => {
                    const skillInfo = getSkillLevelDescription(score);
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${skillInfo.bg} ${skillInfo.color}`}>
                            {skillInfo.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{score}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Strengths & Areas for Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Your Strengths
                </h3>
                <div className="space-y-2">
                  {assessment.thingsImConfidentDoing.slice(0, 4).map(activity => (
                    <div key={activity} className="flex items-center space-x-2">
                      <span className="text-green-500">•</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Growth */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-blue-500 mr-2">📈</span>
                  Areas for Growth
                </h3>
                <div className="space-y-2">
                  {assessment.thingsINeedHelpWith.slice(0, 4).map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <span className="text-blue-500">•</span>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Personal Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Insights
              </h3>
              <div className="space-y-4">
                {assessment.dreamJobAsKid && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Dream Job as a Kid:</span>
                    <p className="font-medium text-gray-900 dark:text-white">&quot;{assessment.dreamJobAsKid}&quot;</p>
                  </div>
                )}
                {assessment.whatImMostProudOf && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">What You&apos;re Most Proud Of:</span>
                    <p className="font-medium text-gray-900 dark:text-white">&quot;{assessment.whatImMostProudOf}&quot;</p>
                  </div>
                )}
                {assessment.ifICouldFixOneProblem && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Problem You&apos;d Like to Fix:</span>
                    <p className="font-medium text-gray-900 dark:text-white">&quot;{assessment.ifICouldFixOneProblem}&quot;</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/recommended-modules')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700"
            >
              View Recommended Modules
            </button>
            <button
              onClick={() => router.push('/curriculum-path')}
              className="px-8 py-4 bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700"
            >
              Explore Learning Paths
            </button>
            <button
              onClick={() => router.push('/dashboard/student')}
              className="px-8 py-4 bg-gray-600 text-white rounded-lg font-medium transition-colors hover:bg-gray-700"
            >
              Go to Dashboard
            </button>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your learning profile will help us recommend the best modules and learning paths for you!
          </p>
        </div>
      </div>
    </div>
  );
} 