'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  Download, 
  BarChart3, 
  PieChart, 
  Activity,
  Calendar,
  Star,
  Zap,
  Trophy,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Sparkles
} from 'lucide-react';

interface Progress {
  completedModules: number;
  totalModules: number;
  progressHistory: number[];
  recentScores: number[];
  totalTimeSpent: number;
}

interface ProgressTabProps {
  progress: Progress;
  onTabChange?: (tab: string) => void;
}

export default function ProgressTab({ progress, onTabChange }: ProgressTabProps) {
  const [animatedPercent, setAnimatedPercent] = useState(0);
  const [animatedWeeklyProgress, setAnimatedWeeklyProgress] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const percent = progress.totalModules > 0 
    ? Math.round((progress.completedModules / progress.totalModules) * 100) 
    : 0;

  const weeklyGoal = 3000;
  const weeklyXP = 2150; // This would come from real data
  const weeklyProgress = Math.round((weeklyXP / weeklyGoal) * 100);

  // Animate progress bars on mount
  useEffect(() => {
    const timer1 = setTimeout(() => setAnimatedPercent(percent), 500);
    const timer2 = setTimeout(() => setAnimatedWeeklyProgress(weeklyProgress), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [percent, weeklyProgress]);

  const handleDownloadCSV = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Modules Completed', progress.completedModules],
      ['Total Modules', progress.totalModules],
      ['Completion Percentage', `${percent}%`],
      ['Total Time Spent (minutes)', progress.totalTimeSpent],
      ['Average Recent Score', progress.recentScores.length > 0 ? Math.round(progress.recentScores.reduce((a, b) => a + b, 0) / progress.recentScores.length) : 0]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learning_progress_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasData = progress.completedModules > 0 || progress.totalTimeSpent > 0 || progress.recentScores.length > 0;

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Trophy className="w-6 h-6 text-purple-600" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              My Magical Progress!
            </h2>
            <p className="text-gray-600 text-lg">Track your learning journey and achievements</p>
          </div>
        </div>
        
        {hasData && (
          <motion.button
            className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            onClick={handleDownloadCSV}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            Download Report
          </motion.button>
        )}
      </motion.div>

      {/* Weekly Goal & XP Progress */}
      <motion.div 
        className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center mb-8">
          <motion.h3 
            className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Target className="w-7 h-7 text-purple-600" />
            Weekly Goal: {weeklyGoal.toLocaleString()} XP
          </motion.h3>
          <motion.p 
            className="text-lg text-gray-600 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            You've earned <span className="font-bold text-green-600">{weeklyXP.toLocaleString()}</span> XP this week!
          </motion.p>
          
          {/* Animated Progress Bar */}
          <div className="relative w-full max-w-2xl mx-auto">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${animatedWeeklyProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
            <motion.div 
              className="text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {animatedWeeklyProgress}% Complete
            </motion.div>
          </div>
        </div>
        
        {/* Progress Train */}
        <motion.div 
          className="flex justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-full max-w-4xl">
            <img 
              src="/studentDashboard/train.png" 
              alt="Progress Train" 
              className="w-full h-auto"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Time Spent Card */}
        <motion.div 
          className="group bg-white rounded-2xl shadow-lg p-8 border border-gray-200 hover:shadow-xl transition-all duration-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05, y: -5 }}
          onHoverStart={() => setHoveredCard('time')}
          onHoverEnd={() => setHoveredCard(null)}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-6"
              whileHover={{ rotate: 10, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Clock className="w-8 h-8 text-purple-600" />
            </motion.div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-6">Time Spent</h3>
            
            <div className="relative w-40 h-40 mx-auto mb-6">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${Math.min(progress.totalTimeSpent / 360 * 100, 100)}, 100` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  className="text-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                >
                  <div className="text-3xl font-bold text-gray-900">
                    {Math.floor(progress.totalTimeSpent / 60)}h
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.max(6, Math.floor(progress.totalTimeSpent / 60) + 2)}h goal
                  </div>
                </motion.div>
              </div>
            </div>
            
            <motion.p 
              className="text-lg text-gray-600 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {progress.totalTimeSpent} minutes total
            </motion.p>
          </div>
        </motion.div>

        {/* Modules Completed Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Modules Completed</h3>
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeDasharray={`${Math.min(percent, 100)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {progress.completedModules}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Earned Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Badges Earned</h3>
          <div className="space-y-3">
            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium text-center">
              Math Master
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium text-center">
              Science Explorer
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium text-center">
              Creative Thinker
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Button */}
      <div className="text-center">
        <button 
          className="bg-purple-600 text-white px-8 py-4 rounded-lg hover:bg-purple-700 transition-colors font-medium text-lg"
          onClick={() => onTabChange?.('modules')}
        >
          Continue learning
        </button>
      </div>

    

      {/* Additional Progress Details (Hidden by default, can be expanded) */}
      {hasData && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{progress.completedModules}</div>
              <div className="text-sm text-gray-500">Modules Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{progress.totalModules}</div>
              <div className="text-sm text-gray-500">Total Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{percent}%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 