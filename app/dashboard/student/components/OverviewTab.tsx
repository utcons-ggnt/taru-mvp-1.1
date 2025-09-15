'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Zap, Play, ChevronRight, Star, Clock, Users, Briefcase, Youtube, Brain, Trophy, BarChart3, Sparkles, ArrowRight, Activity, BookMarked } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OverviewTabProps {
  courses: any[];
  tests: any[];
  onTabChange: (tab: string) => void;
  dashboardData?: {
    overview?: {
      totalXp?: number;
      totalModules?: number;
      studentKey?: string;
    };
    progress?: {
      badgesEarned?: Array<{
        name: string;
        description: string;
        earnedAt: string;
      }>;
    };
  };
  user?: {
    uniqueId?: string;
  };
}

export default function OverviewTab({ 
  courses, 
  tests: _tests, 
  onTabChange, 
  dashboardData, 
  user
}: OverviewTabProps) {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Navigate to modules tab
  const handleBrowseModulesClick = () => {
    onTabChange('modules');
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Section */}
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.6, 0.3, 0.6]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300" />
                {getGreeting()}!
              </h1>
              <p className="text-blue-100 text-xl mb-4">Ready to continue your learning journey?</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Last active: {currentTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  <span>{dashboardData?.overview?.totalModules || 0} modules available</span>
                </div>
          </div>
            </motion.div>
          </div>
          
          <motion.div 
            className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6, type: "spring" }}
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <BookOpen className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Learning Modules */}
        <motion.div 
          className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBrowseModulesClick}
          onHoverStart={() => setHoveredCard('modules')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          {/* Hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
          <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BookOpen className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Learning Modules</h3>
                <p className="text-gray-600 dark:text-gray-400">Explore your courses</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Access your personalized learning modules with videos, quizzes, and interactive content.
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-purple-600 transition-colors">
                Click to explore
              </span>
              <motion.div
                animate={{ x: hoveredCard === 'modules' ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Progress Report */}
        <motion.div 
          className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange('progress')}
          onHoverStart={() => setHoveredCard('progress')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: -10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <BarChart3 className="w-7 h-7 text-green-600 dark:text-green-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Progress Report</h3>
                <p className="text-gray-600 dark:text-gray-400">Track your learning</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              View detailed analytics and track your learning progress across all modules.
          </p>
          
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-green-600 transition-colors">
                View progress
            </span>
              <motion.div
                animate={{ x: hoveredCard === 'progress' ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Rewards & Badges */}
        <motion.div 
          className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange('rewards')}
          onHoverStart={() => setHoveredCard('rewards')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
          <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Trophy className="w-7 h-7 text-yellow-600 dark:text-yellow-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rewards</h3>
                <p className="text-gray-600 dark:text-gray-400">Earn achievements</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Unlock badges and rewards as you complete modules and reach learning milestones.
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-yellow-600 transition-colors">
                View rewards
              </span>
              <motion.div
                animate={{ x: hoveredCard === 'rewards' ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div 
          className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange('settings')}
          onHoverStart={() => setHoveredCard('settings')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: -15, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Target className="w-7 h-7 text-gray-600 dark:text-gray-400" />
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h3>
                <p className="text-gray-600 dark:text-gray-400">Manage profile</p>
              </div>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Update your profile, preferences, and account settings to personalize your experience.
          </p>
          
          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-600 transition-colors">
                Manage settings
              </span>
              <motion.div
                animate={{ x: hoveredCard === 'settings' ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Learning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Total Modules</h4>
              <motion.p 
                className="text-3xl font-bold text-blue-600 dark:text-blue-400"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                {dashboardData?.overview?.totalModules || 0}
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Available to explore</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: -10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Total XP</h4>
              <motion.p 
                className="text-3xl font-bold text-green-600 dark:text-green-400"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
              >
                {dashboardData?.overview?.totalXp || 0}
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Experience points earned</p>
            </div>
            </div>
        </motion.div>

        <motion.div 
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.02, y: -2 }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </motion.div>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Badges Earned</h4>
              <motion.p 
                className="text-3xl font-bold text-purple-600 dark:text-purple-400"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
              >
                {dashboardData?.progress?.badgesEarned?.length || 0}
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Achievements unlocked</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
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
            <Brain className="w-10 h-10 text-purple-600 dark:text-purple-400" />
          </motion.div>
          
          <motion.h4 
            className="text-2xl font-bold text-gray-900 dark:text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            Ready to Start Learning?
          </motion.h4>
          
          <motion.p 
            className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
          >
            Begin your learning journey by exploring modules and completing interactive content.
          </motion.p>
          
          <motion.button
            onClick={handleBrowseModulesClick}
            className="group relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span>Start Learning</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}