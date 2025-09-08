'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Zap, Play, ChevronRight, Star, Clock, Users, Briefcase } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
  icon: string; // Added icon property
  progress: number; // Added progress property
}

interface Test {
  title: string;
  date: string;
  color: string;
}

interface OverviewTabProps {
  courses: Course[];
  tests: Test[];
  onTabChange: (tab: string) => void;
  dashboardData?: {
    overview?: {
      totalXp?: number;
      totalModules?: number;
    };
    progress?: {
      badgesEarned?: Array<{
        name: string;
        description: string;
        earnedAt: string;
      }>;
    };
  };
}

export default function OverviewTab({ courses, tests: _tests, onTabChange, dashboardData }: OverviewTabProps) {
  const router = useRouter();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Today's Progress Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        variants={sectionVariants}
      >
        {/* Header with divider */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Today's progress</h3>
          <div className="flex items-center gap-3">
            <div className="w-px h-6 bg-gray-300"></div>
            <span className="text-gray-600 text-lg">
              {courses.length > 0 ? Math.round(courses.reduce((acc, course) => acc + course.progress, 0) / courses.length) : 0}% Complete - Keep going! 🚀
            </span>
          </div>
        </div>
        
                {/* Progress Train */}
        <div className="flex justify-center items-center w-full overflow-hidden relative">
          {/* Moving Train */}
          <motion.div 
            className="relative w-full"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 500,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <img 
              src="/studentDashboard/train.png" 
              alt="Progress Train" 
              className="w-full h-auto"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Continue Learning Section */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        variants={sectionVariants}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Continue Learning</h3>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.slice(0, 3).map((course, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                variants={cardVariants}
              >
                <div className="mb-4">
                  {/* Placeholder for course image */}
                  <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                    <div className="text-center">
                      <div className="text-2xl mb-2 text-gray-500 font-bold">{course.title.charAt(0).toUpperCase()}</div>
                      <div className="text-sm text-gray-600">{course.title}</div>
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                  <span>{course.duration}</span>
                  <span className="font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">{course.xp}</span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-700">{course.lessonsCompleted} Complete - Keep going!</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400 font-bold">B</span>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No courses available</h4>
            <p className="text-gray-600 mb-4">Start your learning journey by exploring available modules</p>
            <button 
              onClick={() => onTabChange('modules')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Modules
            </button>
          </div>
        )}

        {/* Learn More Button */}
        {courses.length > 0 && (
          <div className="text-center mt-8">
            <button 
              onClick={() => onTabChange('modules')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg"
            >
              Learn more
            </button>
          </div>
        )}
      </motion.div>

      {/* Career Exploration Section */}
      <motion.div 
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-700 p-6"
        variants={sectionVariants}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Career Exploration</h3>
              <p className="text-gray-600 dark:text-gray-400">Discover your future career path</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Personalized Career Options</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Get career recommendations based on your interests and skills
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white">Detailed Learning Paths</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Explore comprehensive learning modules for your chosen career
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => router.push('/career-exploration')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg flex items-center gap-2 mx-auto"
          >
            <Briefcase className="w-5 h-5" />
            Explore Careers
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 