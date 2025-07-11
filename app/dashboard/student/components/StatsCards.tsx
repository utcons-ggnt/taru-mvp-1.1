import React from 'react';

export default function StatsCards({ xp, badges, modules }: { xp: number, badges: number, modules: number }) {
  return (
    <div className="flex gap-6 justify-center my-6">
      <div className="bg-purple-100 rounded-xl px-8 py-6 text-center shadow-sm">
        <div className="text-3xl font-bold text-purple-700">{xp}</div>
        <div className="text-sm text-gray-900 mt-1">XP Points</div>
      </div>
      <div className="bg-purple-100 rounded-xl px-8 py-6 text-center shadow-sm">
        <div className="text-3xl font-bold text-purple-700">{badges.toString().padStart(2, '0')}</div>
        <div className="text-sm text-gray-900 mt-1">Badges</div>
      </div>
      <div className="bg-purple-100 rounded-xl px-8 py-6 text-center shadow-sm">
        <div className="text-3xl font-bold text-purple-700">{modules}</div>
        <div className="text-sm text-gray-900 mt-1">Modules</div>
      </div>
    </div>
  );
} 