'use client';

import React from 'react';

interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
  progress: number;
}

interface Test {
  title: string;
  date: string;
  color: string;
  score?: number;
}

interface OverviewTabProps {
  courses: Course[];
  tests: Test[];
  onTabChange?: (tab: string) => void;
}

export default function OverviewTab({ courses, tests, onTabChange }: OverviewTabProps) {
  return (
    <div className="space-y-8">
      {/* Current Learning Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
                 {courses.length > 0 ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {courses.map((course, index) => (
               <div key={index} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                 <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{backgroundColor: course.color}}>
                   <span className="text-2xl text-white">📚</span>
                 </div>
                 <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                 <p className="text-sm text-gray-600 mb-4">Progress: {course.lessonsCompleted}</p>
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-gray-500">{course.duration} • {course.xp}</span>
                   <button 
                     className="text-purple-600 text-sm font-medium hover:text-purple-700"
                     onClick={() => window.location.href = '#modules'}
                   >
                     Continue
                   </button>
                 </div>
               </div>
             ))}
           </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h4 className="text-xl font-semibold text-gray-800 mb-2">Ready to Start Learning?</h4>
            <p className="text-gray-600 mb-4">
              Complete your diagnostic assessment to get personalized learning modules.
            </p>
                         <button 
               className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
               onClick={() => onTabChange?.('diagnostic')}
             >
               Take Diagnostic Test
             </button>
          </div>
        )}
      </div>

      {/* Recommended Modules Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Mathematics Basics</h4>
            <p className="text-sm text-gray-600 mb-4">Build strong foundation in math concepts</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">30 min • 50 XP</span>
                             <button 
                 className="text-blue-600 text-sm font-medium hover:text-blue-700"
                 onClick={() => onTabChange?.('modules')}
               >
                 Start
               </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🔬</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Science Experiments</h4>
            <p className="text-sm text-gray-600 mb-4">Explore the world through experiments</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">25 min • 40 XP</span>
                             <button 
                 className="text-green-600 text-sm font-medium hover:text-green-700"
                 onClick={() => onTabChange?.('modules')}
               >
                 Start
               </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Creative Arts</h4>
            <p className="text-sm text-gray-600 mb-4">Express yourself through creative projects</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">45 min • 60 XP</span>
                             <button 
                 className="text-purple-600 text-sm font-medium hover:text-purple-700"
                 onClick={() => onTabChange?.('modules')}
               >
                 Start
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {tests.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm">
            {tests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: test.color }}
                  ></div>
                  <div>
                    <p className="font-medium text-gray-900">{test.title}</p>
                    <p className="text-sm text-gray-500">Completed on {test.date}</p>
                  </div>
                </div>
                {test.score && (
                  <div className="text-right">
                    <p className={`font-semibold ${
                      test.score >= 90 ? 'text-accessible-success' : 
                      test.score >= 80 ? 'text-accessible-info' : 
                      test.score >= 70 ? 'text-accessible-warning' : 'text-accessible-error'
                    }`}>{test.score}%</p>
                    <p className="text-xs text-accessible-muted">Score</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-4xl mb-4">📈</div>
            <p className="text-accessible-muted">Your learning activity will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
} 