'use client';

import React, { useState } from 'react';
import YouTubeUrlViewer from '../components/YouTubeUrlViewer';
import { Search, Play } from 'lucide-react';

export default function YouTubeDemo() {
  const [uniqueid, setUniqueid] = useState('STUMFKROFP65');
  const [inputValue, setInputValue] = useState('STUMFKROFP65');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (inputValue.trim()) {
      setIsLoading(true);
      setUniqueid(inputValue.trim());
      // Simulate loading state
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">YouTube URL Viewer Demo</h1>
              <p className="mt-2 text-gray-600">
                Fetch and display YouTube videos from the YoutubeUrl collection by uniqueid
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Play className="w-4 h-4" />
              <span>Interactive Demo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Search by Unique ID</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter uniqueid (e.g., STUMFKROFP65)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Try with the sample uniqueid: <code className="bg-gray-100 px-2 py-1 rounded">STUMFKROFP65</code>
          </p>
        </div>

        {/* Video Viewer */}
        {uniqueid && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <YouTubeUrlViewer
              uniqueid={uniqueid}
              autoPlay={false}
              showPlaylist={true}
              className="w-full"
            />
          </div>
        )}

        {/* Sample Data Display */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Structure</h3>
          <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-gray-700">
{`{
  "_id": "68c7bae0c73de3b7cb4a974f",
  "uniqueid": "STUMFKROFP65",
  "Module": [
    {
      "Chapter 1": {
        "videoUrl": "https://www.youtube.com/watch?v=d75upaDHSvY",
        "videoTitle": "Overview of the American Legal System"
      }
    },
    {
      "Chapter 2": {
        "videoUrl": "https://www.youtube.com/watch?v=IGyx5UEwgtA",
        "videoTitle": "Structure of the Court System: Crash Course Government and Politics #19"
      }
    }
    // ... more chapters
  ]
}`}
            </pre>
          </div>
        </div>

        {/* API Information */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">API Endpoint</h3>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <code className="text-sm text-gray-700">
                GET /api/youtube-urls?uniqueid=STUMFKROFP65
              </code>
            </div>
            <p className="text-sm text-gray-600">
              This endpoint fetches YouTube video data from the "YoutubeUrl" collection using the provided uniqueid parameter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
