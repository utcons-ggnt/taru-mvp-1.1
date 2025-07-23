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
        <h2 className="text-2xl font-bold text-gray-900">Progress Report</h2>
        {hasData && (
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            onClick={handleDownloadCSV}
          >
            Download Report
          </button>
        )}
      </div>

      {hasData ? (
        <>
          {/* Overall Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accessible-link mb-2">{progress.completedModules}</div>
                <div className="text-sm text-accessible-muted">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accessible-info mb-2">{progress.totalModules}</div>
                <div className="text-sm text-accessible-muted">Total Modules</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accessible-success mb-2">{percent}%</div>
                <div className="text-sm text-accessible-muted">Completion Rate</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{percent}% Complete</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-3 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500" 
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Time Spent */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Investment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-accessible-warning mb-2">
                  {Math.floor(progress.totalTimeSpent / 60)}h {progress.totalTimeSpent % 60}m
                </div>
                <div className="text-sm text-accessible-muted">Total Learning Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accessible-info mb-2">
                  {progress.completedModules > 0 ? Math.round(progress.totalTimeSpent / progress.completedModules) : 0}m
                </div>
                <div className="text-sm text-accessible-muted">Average Time per Module</div>
              </div>
            </div>
          </div>

          {/* Progress History */}
          {progress.progressHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress History</h3>
              <div className="flex items-end justify-between h-32 gap-2">
                {progress.progressHistory.map((val, idx) => (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-sm transition-all duration-300 hover:from-purple-600 hover:to-purple-400" 
                      style={{ height: `${Math.max(val as number, 5)}%` }}
                    ></div>
                    <div className="text-xs text-gray-600 mt-2">Week {idx + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Scores */}
          {progress.recentScores.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {progress.recentScores.map((score, idx) => (
                  <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-xl font-bold mb-1 ${
                      score >= 90 ? 'text-accessible-success' : 
                      score >= 80 ? 'text-accessible-info' : 
                      score >= 70 ? 'text-accessible-warning' : 'text-accessible-error'
                    }`}>
                      {score as number}%
                    </div>
                    <div className="text-xs text-accessible-muted">Test {idx + 1}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-accessible-secondary">
                  Average Score: <span className="font-semibold text-accessible-link">
                    {Math.round(progress.recentScores.reduce((a, b) => a + b, 0) / progress.recentScores.length)}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-12 text-center">
          <div className="text-6xl mb-6">📊</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Learning Journey Starts Here</h3>
          <p className="text-gray-700 mb-8 max-w-md mx-auto">
            Complete learning modules and take assessments to see your progress unfold. Your achievements and improvements will be tracked here.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Track completion</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Monitor scores</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Time analytics</span>
              </div>
            </div>
                         <button 
               className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
               onClick={() => onTabChange?.('modules')}
             >
               Start Learning Now
             </button>
          </div>
        </div>
      )}
    </div>
  );
} 