import React from 'react';

export default function SettingsTab({ profile }: { profile: { name: string; email: string; grade: string; school: string; language: string; studentKey: string } }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-purple-700">Profile & Settings</h2>
      <div className="space-y-3">
        <div><span className="font-semibold text-gray-900">Name:</span> {profile.name}</div>
        <div><span className="font-semibold text-gray-900">Email:</span> {profile.email}</div>
        <div><span className="font-semibold text-gray-900">Student Key:</span> <span className="font-mono text-purple-600">{profile.studentKey}</span></div>
        <div><span className="font-semibold text-gray-900">Grade:</span> {profile.grade}</div>
        <div><span className="font-semibold text-gray-900">School:</span> {profile.school}</div>
        <div><span className="font-semibold text-gray-900">Language:</span> {profile.language}</div>
      </div>
    </div>
  );
} 