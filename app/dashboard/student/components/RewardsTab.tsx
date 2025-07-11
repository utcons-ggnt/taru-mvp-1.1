import React from 'react';

export default function RewardsTab({ badges }: { badges: Array<{ name: string; description: string; icon: string }> }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-purple-700">My Rewards & Badges</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {badges.map((badge, idx) => (
          <div key={idx} className="flex flex-col items-center bg-purple-50 rounded-lg p-4 shadow-sm">
            <img src={badge.icon} alt={badge.name} className="w-16 h-16 mb-2" />
            <div className="font-semibold text-gray-900">{badge.name}</div>
            <div className="text-xs text-gray-900 text-center mt-1">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
} 