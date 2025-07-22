import React from 'react';
import { saveAs } from 'file-saver';

interface Progress {
  completedModules: number;
  totalModules: number;
  progressHistory: unknown[];
  recentScores: unknown[];
  // Add other properties as needed
}

export default function ProgressTab({ progress }: { progress: Progress }) {
  const percent = Math.round((progress.completedModules / progress.totalModules) * 100);

  const handleDownloadCSV = () => {
    const rows = [
      ['Modules Completed', 'Total Modules', 'Percent Complete'],
      [progress.completedModules, progress.totalModules, percent + '%'],
      [],
      ['Progress History'],
      ...progress.progressHistory.map((val, idx) => [`Step ${idx + 1}`, val]),
      [],
      ['Recent Test Scores'],
      ...progress.recentScores.map((score, idx) => [`Test ${idx + 1}`, score + '%'])
    ];
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'progress_report.csv');
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Progress Report</h2>
      <button
        className="mb-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded"
        onClick={handleDownloadCSV}
      >
        Download CSV
      </button>
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
          {progress.progressHistory.map((val, idx) => (
            <div key={idx} className="h-2 w-6 rounded bg-purple-400 mr-1" style={{ height: `${val as number * 2}px` }} />
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="font-semibold text-gray-900 mb-2">Recent Test Scores</div>
        <div className="flex gap-2 items-end h-20">
          {progress.recentScores.map((score, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Test {idx + 1}</span>
              <span className="text-sm font-medium text-purple-700">{score as number}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 