'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

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
    summary?: string;
  };
}

export default function ResultSummary() {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  useEffect(() => {
    // Track mouse position for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const fetchAssessmentData = async () => {
    try {
      // Fetch assessment result with score summary
      const resultResponse = await fetch('/api/assessment/result');
      if (resultResponse.ok) {
        const resultData = await resultResponse.json();
        if (resultData.success && resultData.result) {
          // Update assessment with score summary
          setAssessment(prev => {
            if (!prev) return null;
            return {
              ...prev,
              diagnosticCompleted: true,
              diagnosticScore: resultData.result.score,
              diagnosticResults: {
                ...prev.diagnosticResults,
                summary: resultData.result.summary
              }
            };
          });
        }
      }

      // Fetch skills and interests data
      const response = await fetch('/api/assessment/skills-interests');
      if (response.ok) {
        const data = await response.json();
        setAssessment(prev => {
          if (!prev) return data.assessment;
          return {
            ...prev,
            ...data.assessment
          };
        });
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
    if (score >= 60) return { level: 'Intermediate', color: 'text-amber-700', bg: 'bg-amber-100' };
    return { level: 'Beginner', color: 'text-blue-600', bg: 'bg-blue-100' };
  };

  if (loading) {
    return (
      <ConsistentLoadingPage
        type="assessment"
        title="Loading Your Results"
        subtitle="Preparing your personalized assessment results and recommendations..."
        tips={[
          'Analyzing your responses',
          'Calculating your skill levels',
          'Generating personalized recommendations'
        ]}
      />
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
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Enhanced Interactive Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Mouse-following gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl"
          animate={{
            x: mousePosition.x * 0.05 - 200,
            y: mousePosition.y * 0.05 - 200,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-2xl"
          animate={{
            x: mousePosition.x * -0.03 + 100,
            y: mousePosition.y * -0.03 + 100,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 25 }}
        />
        
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const basePosition = (i * 137.5) % 100; // Golden ratio for better distribution
          const left = (basePosition + (i * 23.7)) % 100;
          const top = (basePosition * 1.618 + (i * 31.2)) % 100;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 3 - 1) * 10, 0],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.7, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3) * 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 4) * 0.5,
              }}
            />
          );
        })}
        
        {/* Floating geometric shapes */}
        {[...Array(6)].map((_, i) => {
          // Use deterministic positioning based on index to avoid hydration mismatch
          const basePosition = (i * 89.3) % 100; // Different multiplier for variety
          const left = (basePosition + (i * 41.7)) % 100;
          const top = (basePosition * 2.414 + (i * 19.8)) % 100;
          
          return (
            <motion.div
              key={`shape-${i}`}
              className="absolute w-3 h-3 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, (i % 5 - 2) * 8, 0],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 5 + (i % 4) * 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 3) * 0.8,
              }}
            />
          );
        })}
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            🎉 Assessment Complete!
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-400">
            Here&apos;s your personalized assessment result
          </p>
        </div>

        {/* Score and Summary Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Your Assessment Results
            </h2>
            {assessment.diagnosticScore && (
              <div className="inline-block bg-white/20 rounded-full px-6 py-3 mb-6">
                <span className="text-4xl font-bold text-white">{assessment.diagnosticScore}%</span>
                <p className="text-white/80 text-sm mt-1">Overall Score</p>
              </div>
            )}
          </div>
          
          {assessment.diagnosticCompleted && assessment.diagnosticResults?.summary && (
            <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                📋 Assessment Summary
              </h3>
              <p className="text-white text-lg leading-relaxed text-center">
                {assessment.diagnosticResults.summary}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => router.push('/career-exploration')}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-lg transition-all duration-300 hover:from-purple-700 hover:to-blue-700 hover:shadow-2xl hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <span className="text-2xl">🚀</span>
            Get My Career Path
          </button>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Discover personalized career recommendations based on your assessment results
          </p>
        </div>
      </div>
    </motion.div>
  );
} 