import React from 'react';

export default function ProgressTab({ progress }: { progress: any }) {
  const percent = Math.round((progress.completedModules / progress.totalModules) * 100);
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Progress Report</h2>
      <div className="mb-4">
        <div className="text-lg font-semibold text-gray-900 mb-1">Modules Completed: {progress.completedModules} / {progress.totalModules}</div>
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-4 bg-purple-500" style={{ width: `${percent}%` }}></div>
        </div>
        <div className="text-xs text-gray-900 mt-1">{percent}% complete</div>
      </div>
      <div className="mt-6">
        <div className="font-semibold text-gray-900 mb-2">Progress History</div>
        <div className="flex gap-2 items-end h-24">
          {progress.progressHistory.map((val: number, idx: number) => (
            <div key={idx} className="w-6 bg-purple-300 rounded-t" style={{ height: `${val}%` }}>
              <div className="text-xs text-center text-purple-900">{val}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="font-semibold text-gray-900 mb-2">Recent Test Scores</div>
        <div className="flex gap-2 items-end h-20">
          {progress.recentScores.map((score: number, idx: number) => (
            <div key={idx} className="w-8 bg-green-300 rounded-t" style={{ height: `${score}%` }}>
              <div className="text-xs text-center text-green-900">{score}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 