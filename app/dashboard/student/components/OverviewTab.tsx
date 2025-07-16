import React from 'react';

interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
}

interface Test {
  title: string;
  date: string;
  color: string;
}

export default function OverviewTab({ courses, tests }: { courses: Course[]; tests: Test[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Overview Cards and Course Table */}
      <div className="md:col-span-2">
        <div className="flex gap-4 mb-6">
          <div className="bg-purple-100 rounded-xl px-6 py-4 text-center flex-1">
            <div className="text-2xl font-bold text-purple-700">03</div>
            <div className="text-xs text-gray-900 mt-1">Course in Progress</div>
          </div>
          <div className="bg-purple-100 rounded-xl px-6 py-4 text-center flex-1">
            <div className="text-2xl font-bold text-purple-700">06</div>
            <div className="text-xs text-gray-900 mt-1">Course Completed</div>
          </div>
          <div className="bg-purple-100 rounded-xl px-6 py-4 text-center flex-1">
            <div className="text-2xl font-bold text-purple-700">12</div>
            <div className="text-xs text-gray-900 mt-1">Certificates Earned</div>
          </div>
          <div className="bg-purple-100 rounded-xl px-6 py-4 text-center flex-1">
            <div className="text-2xl font-bold text-purple-700">100</div>
            <div className="text-xs text-gray-900 mt-1">AI Avatar Support</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Course You&apos;re taking</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-900 font-bold">
                <th className="py-2">Course title</th>
                <th className="py-2">Lessons Completed</th>
                <th className="py-2">Duration</th>
                <th className="py-2">XP Points</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, idx) => (
                <tr key={idx} className="border-t border-gray-200">
                  <td className="py-2 flex items-center gap-2 text-gray-900 font-semibold">
                    <span className={`w-4 h-4 rounded-full inline-block`} style={{background: course.color}}></span>
                    {course.title}
                  </td>
                  <td className="py-2 text-gray-900 font-semibold">{course.lessonsCompleted}</td>
                  <td className="py-2 text-gray-900 font-semibold">{course.duration}</td>
                  <td className="py-2 text-gray-900 font-semibold">{course.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Right: Upcoming Tests */}
      <div>
        <div className="bg-white rounded-xl shadow-sm p-6 mb-4">
          <h3 className="font-semibold text-gray-900 mb-4">Upcoming Tests</h3>
          <ul className="space-y-3">
            {tests.map((test, idx) => (
              <li key={idx} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold" style={{background: test.color}}></span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{test.title}</div>
                  <div className="text-xs text-gray-900">{test.date}</div>
                </div>
              </li>
            ))}
          </ul>
          <button className="w-full mt-6 bg-black text-white py-2 rounded-lg font-semibold text-sm">See All Upcoming Tests</button>
        </div>
      </div>
    </div>
  );
} 