'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Award, 
  Zap, 
  Target, 
  CheckCircle, 
  Lock, 
  Sparkles, 
  Crown, 
  Medal, 
  Gift, 
  Flame, 
  Rocket, 
  Diamond,
  Heart,
  BookOpen,
  Brain,
  Lightbulb,
  Shield,
  Sword,
  Wand2,
  Calendar
} from 'lucide-react';

interface Badge {
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  xp: number;
  isLocked?: boolean;
}

interface RewardsTabProps {
  badges: Badge[];
  onTabChange?: (tab: string) => void;
}

export default function RewardsTab({ badges, onTabChange }: RewardsTabProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const categories = [
    { id: 'all', label: 'All Badges', icon: '🏆' },
    { id: 'academic', label: 'Academic', icon: '📚' },
    { id: 'creativity', label: 'Creativity', icon: '🎨' },
    { id: 'progress', label: 'Progress', icon: '📈' },
    { id: 'special', label: 'Special', icon: '⭐' },
  ];

  // Sample available badges (to show what can be earned)
  const availableBadges = [
    {
      name: 'Explorer Badge',
      description: 'Complete your first learning module',
      icon: '🧭',
      category: 'progress',
      earned: false,
      requirement: 'Complete 1 module',
      xp: 60,
      isLocked: true
    },
    {
      name: 'Thinker Badge',
      description: 'Excel in mathematics modules',
      icon: '🧠',
      category: 'academic',
      earned: false,
      requirement: 'Score 90+ in 3 math modules',
      xp: 75,
      isLocked: true
    },
    {
      name: 'Achiever Badge',
      description: 'Master science experiments',
      icon: '🎯',
      category: 'academic',
      earned: false,
      requirement: 'Complete 5 science modules',
      xp: 100,
      isLocked: true
    }
  ];

  const earnedBadges = badges.map(badge => ({
    name: badge.name,
    description: badge.description,
    icon: badge.icon || '🏅',
    category: 'earned',
    earned: true,
    earnedAt: badge.earnedAt,
    xp: badge.xp || 100,
    isLocked: false
  }));

  const allBadges = [...earnedBadges, ...availableBadges];
  const displayBadges = activeCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === activeCategory || (badge.earned && activeCategory === 'earned'));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    return `📅 ${month} ${day}`;
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </motion.div>
          <h2 className="text-5xl font-bold text-gray-900 flex items-center gap-3">
            <Crown className="w-12 h-12 text-purple-600" />
            My Rewards & Badges
            <Crown className="w-12 h-12 text-purple-600" />
          </h2>
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Sparkles className="w-12 h-12 text-yellow-500" />
          </motion.div>
        </div>
        <motion.p 
          className="text-gray-600 text-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          You&apos;ve earned <span className="font-bold text-purple-600 text-2xl">{earnedBadges.length}</span> badges so far!
        </motion.p>
      </motion.div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-6 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold">{earnedBadges.length}</div>
            <div className="text-purple-100 text-sm">Badges Earned</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{availableBadges.length}</div>
            <div className="text-purple-100 text-sm">Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold">{Math.round((earnedBadges.length / (earnedBadges.length + availableBadges.length)) * 100)}%</div>
            <div className="text-purple-100 text-sm">Completion</div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <motion.div 
        className="flex flex-wrap gap-3 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{category.icon}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Badges Grid */}
      {displayBadges.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {displayBadges.map((badge, index) => (
            <motion.div 
              key={index} 
              className={`relative bg-white rounded-2xl border-2 transition-all duration-300 group ${
                badge.earned
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg hover:shadow-xl'
                  : 'bg-gray-50 border-gray-200 hover:shadow-md'
              } ${badge.isLocked ? 'opacity-75' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              onHoverStart={() => setHoveredBadge(badge.name)}
              onHoverEnd={() => setHoveredBadge(null)}
            >
              {/* Badge Card */}
              <div className="p-6">
                {/* Badge Icon */}
                <div className="text-center mb-6">
                  {badge.isLocked ? (
                    <motion.div 
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-12 h-12 text-gray-500" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="w-24 h-24 mx-auto text-6xl flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.5 }
                      }}
                      animate={badge.earned ? {
                        scale: [1, 1.1, 1],
                        transition: { duration: 2, repeat: Infinity }
                      } : {}}
                    >
                      {badge.icon}
                    </motion.div>
                  )}
                </div>

                {/* Badge Name */}
                <motion.h3 
                  className="text-xl font-bold text-center text-gray-900 mb-4"
                  whileHover={{ scale: 1.05 }}
                >
                  {badge.name}
                </motion.h3>

                {/* Date and XP Row */}
                <motion.div 
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  {/* Date */}
                  <motion.div 
                    className="bg-white rounded-full px-4 py-2 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {badge.earned && 'earnedAt' in badge ? formatDate(badge.earnedAt) : 'Coming Soon'}
                    </span>
                  </motion.div>
                  
                  {/* XP */}
                  <motion.div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full px-4 py-2 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-xs text-white font-medium flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {badge.xp}+ XP
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Locked Overlay */}
              {badge.isLocked && (
                <div className="absolute inset-0 bg-gray-50 bg-opacity-50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2M12 4C11.45 4 11 4.45 11 5V6H13V5C13 4.45 12.55 4 12 4M8 8V20H16V8H8Z"/>
                    </svg>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No badges in this category yet</h3>
          <p className="text-gray-600">
            Keep learning to earn your first badge!
          </p>
        </div>
      )}

      {/* Encouragement Section */}
      {earnedBadges.length === 0 && (
        <div className="bg-blue-50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🌟</div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Start Your Badge Collection!</h3>
          <p className="text-blue-700 mb-4">
            Complete learning modules, take tests, and participate in activities to earn your first badge.
          </p>
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            onClick={() => onTabChange?.('modules')}
          >
            View Learning Modules
          </button>
        </div>
      )}

      {/* AI Buddy Help Section */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 max-w-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-lg">✌️</span>
            </div>
            <div className="text-sm text-gray-700">
              How can I help you
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">🤖</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 