'use client';

import React, { useState } from 'react';

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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <span className="text-4xl">🌟</span>
          <h2 className="text-4xl font-bold text-gray-900">My Rewards & Badges</h2>
          <span className="text-4xl">☁️</span>
        </div>
        <p className="text-gray-600 text-lg">
          You&apos;ve earned <span className="font-semibold text-purple-600">{earnedBadges.length}</span> badges so far!
        </p>
      </div>

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
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              activeCategory === category.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      {displayBadges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayBadges.map((badge, index) => (
            <div key={index} className={`relative bg-gray-50 rounded-xl border border-gray-200 transition-all hover:shadow-lg ${
              badge.isLocked ? 'opacity-75' : ''
            }`}>
              {/* Badge Card */}
              <div className="p-6">
                {/* Badge Icon */}
                <div className="text-center mb-4">
                  {badge.isLocked ? (
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V20C18 21.1 17.1 22 16 22H8C6.9 22 6 21.1 6 20V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2M12 4C11.45 4 11 4.45 11 5V6H13V5C13 4.45 12.55 4 12 4M8 8V20H16V8H8Z"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-20 h-20 mx-auto text-6xl flex items-center justify-center">
                      {badge.icon}
                    </div>
                  )}
                </div>

                {/* Badge Name */}
                <h3 className="text-lg font-bold text-center text-gray-900 mb-4">
                  {badge.name}
                </h3>

                {/* Date and XP Row */}
                <div className="flex items-center justify-between">
                  {/* Date */}
                  <div className="bg-white rounded-full px-3 py-1">
                    <span className="text-xs text-gray-600 font-medium">
                      {badge.earned && 'earnedAt' in badge ? formatDate(badge.earnedAt) : '📅 Coming Soon'}
                    </span>
                  </div>
                  
                  {/* XP */}
                  <div className="bg-purple-600 rounded-full px-3 py-1">
                    <span className="text-xs text-white font-medium">
                      {badge.xp}+ XP
                    </span>
                  </div>
                </div>
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
            </div>
          ))}
        </div>
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
    </div>
  );
} 