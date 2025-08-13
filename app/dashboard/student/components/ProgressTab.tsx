'use client';

import React from 'react';

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
  const percent = progress.totalModules > 0 
    ? Math.round((progress.completedModules / progress.totalModules) * 100) 
    : 0;

  const weeklyGoal = 3000;
  const weeklyXP = 2150; // This would come from real data
  const weeklyProgress = Math.round((weeklyXP / weeklyGoal) * 100);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Magical Progress!</h2>
        {hasData && (
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            onClick={handleDownloadCSV}
          >
            Download Report
          </button>
        )}
      </div>

      {/* Weekly Goal & XP Progress */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Weekly Goal: {weeklyGoal.toLocaleString()} XP | You've earned {weeklyXP.toLocaleString()} XP this week!
          </h3>
        </div>
        
        {/* Progress Train */}
        <div className="flex justify-center items-center mb-6">
          <div className="w-full max-w-4xl">
            <img 
              src="/studentDashboard/train.png" 
              alt="Progress Train" 
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Time Spent Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Time Spent</h3>
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
                  strokeDasharray={`${Math.min(progress.totalTimeSpent / 360 * 100, 100)} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.floor(progress.totalTimeSpent / 60)}h/{Math.max(6, Math.floor(progress.totalTimeSpent / 60) + 2)}h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    </div>
  );
} 