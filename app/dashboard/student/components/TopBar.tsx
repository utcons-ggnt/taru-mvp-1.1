import React from 'react';

export default function TopBar({ user, language, onLanguageChange }: { user: any, language: string, onLanguageChange: (lang: string) => void }) {
  return (
    <div className="flex items-center justify-between w-full px-6 py-4 bg-white border-b border-gray-200">
      {/* Search Bar */}
      <div className="flex-1 flex items-center">
        <input
          type="text"
          placeholder="Search"
          className="w-80 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300 text-sm text-gray-900"
        />
      </div>
      {/* Language Selector */}
      <div className="flex items-center gap-4">
        <select
          value={language}
          onChange={e => onLanguageChange(e.target.value)}
          className="border border-gray-400 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300 text-gray-900"
        >
          <option value="English (USA)">English (USA)</option>
          <option value="हिन्दी">हिन्दी</option>
          <option value="मराठी">मराठी</option>
        </select>
        {/* Notification Bell */}
        <button className="relative text-gray-900 hover:text-purple-600">
          <span className="text-2xl">🔔</span>
          {/* Notification dot */}
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        {/* User Avatar */}
        <div className="flex items-center gap-2">
          <img src="/avatar.png" alt="User Avatar" className="w-8 h-8 rounded-full border border-gray-300" />
          <span className="font-semibold text-gray-900 text-sm">{user?.name || 'Aanya'}</span>
        </div>
      </div>
    </div>
  );
} 