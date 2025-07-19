import React from 'react';
import Image from 'next/image';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'modules', label: 'My Learning Modules', icon: '📦' },
  { id: 'diagnostic', label: 'Take Diagnostic Test', icon: '🧪' },
  { id: 'progress', label: 'My Progress Report', icon: '📈' },
  { id: 'rewards', label: 'My Rewards & Badges', icon: '🏅' },
  { id: 'settings', label: 'Profile & Settings', icon: '⚙️' },
];

export default function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-gray-300 py-6 px-4 justify-between">
      <div>
        <div className="flex items-center mb-10">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <Image src="/jio-logo.png" alt="Jio Logo" width={32} height={32} className="w-8 h-8" />
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors font-medium text-gray-900 ${activeTab === item.id ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'}`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => onTabChange('logout')}
          className="flex items-center gap-3 px-4 py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 font-medium"
        >
          <span className="text-lg">🚪</span> Logout
        </button>
      </div>
      <div className="mt-10">
        <div className="bg-purple-100 rounded-xl p-4 flex flex-col items-center">
          <Image src="/ai-buddy.png" alt="AI Buddy" width={64} height={64} className="w-16 h-16 rounded-full mb-2" />
          <div className="text-sm font-semibold text-gray-900">Ask <span className="text-purple-600">AI Buddy</span></div>
        </div>
      </div>
    </aside>
  );
} 