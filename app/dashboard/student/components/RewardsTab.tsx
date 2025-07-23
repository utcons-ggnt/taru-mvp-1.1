'use client';

import React, { useState } from 'react';

interface Badge {
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
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
      name: 'First Steps',
      description: 'Complete your first learning module',
      icon: '👣',
      category: 'progress',
      earned: false,
      requirement: 'Complete 1 module'
    },
    {
      name: 'Math Whiz',
      description: 'Excel in mathematics modules',
      icon: '🧮',
      category: 'academic',
      earned: false,
      requirement: 'Score 90+ in 3 math modules'
    },
    {
      name: 'Science Explorer',
      description: 'Master science experiments',
      icon: '🔬',
      category: 'academic',
      earned: false,
      requirement: 'Complete 5 science modules'
    },
    {
      name: 'Creative Genius',
      description: 'Show exceptional creativity',
      icon: '🎨',
      category: 'creativity',
      earned: false,
      requirement: 'Submit 3 creative projects'
    },
    {
      name: 'Study Streak',
      description: 'Learn consistently for 7 days',
      icon: '🔥',
      category: 'progress',
      earned: false,
      requirement: 'Study 7 days in a row'
    },
    {
      name: 'Helper Hero',
      description: 'Help fellow students learn',
      icon: '🤝',
      category: 'special',
      earned: false,
      requirement: 'Help 5 classmates'
    }
  ];

  const earnedBadges = badges.map(badge => ({
    name: badge.name,
    description: badge.description,
    icon: badge.icon || '🏅',
    category: 'earned',
    earned: true,
    earnedAt: badge.earnedAt
  }));

  const allBadges = [...earnedBadges, ...availableBadges];
  const displayBadges = activeCategory === 'all' 
    ? allBadges 
    : allBadges.filter(badge => badge.category === activeCategory || (badge.earned && activeCategory === 'earned'));

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h2>
        <p className="text-gray-600">
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
      <div className="flex flex-wrap gap-2">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayBadges.map((badge, index) => (
            <div key={index} className={`relative p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
              badge.earned 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' 
                : 'bg-gray-50 border-gray-200 opacity-75'
            }`}>
              {badge.earned && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className={`text-4xl mb-3 ${badge.earned ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <h3 className={`font-semibold mb-2 ${badge.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {badge.name}
                </h3>
                <p className={`text-sm mb-3 ${badge.earned ? 'text-gray-700' : 'text-gray-400'}`}>
                  {badge.description}
                </p>
                
                                 {badge.earned && 'earnedAt' in badge ? (
                   <div className="text-xs text-green-600 font-medium">
                     Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                   </div>
                 ) : !badge.earned && 'requirement' in badge ? (
                   <div className="text-xs text-gray-500">
                     {badge.requirement}
                   </div>
                 ) : null}
              </div>
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
    </div>
  );
} 