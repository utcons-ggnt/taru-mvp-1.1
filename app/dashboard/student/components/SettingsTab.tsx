import React, { useState } from 'react';

interface ProfileData {
  name: string;
  email: string;
  grade: string;
  school: string;
  language: string;
  studentKey: string;
}

interface SettingsTabProps {
  profile: ProfileData;
  onProfileUpdate?: (updatedProfile: Partial<ProfileData>) => void;
}

export default function SettingsTab({ profile, onProfileUpdate }: SettingsTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<ProfileData>({
    name: profile.name,
    email: profile.email,
    grade: profile.grade,
    school: profile.school,
    language: profile.language,
    studentKey: profile.studentKey,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedProfile.name,
          grade: editedProfile.grade,
          school: editedProfile.school,
          language: editedProfile.language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      
      // Update the profile data using the response data
      if (onProfileUpdate && data.profile) {
        onProfileUpdate({
          name: data.profile.name,
          grade: data.profile.grade,
          school: data.profile.school,
          language: data.profile.language,
        });
      }

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile({
      name: profile.name,
      email: profile.email,
      grade: profile.grade,
      school: profile.school,
      language: profile.language,
      studentKey: profile.studentKey,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Profile & Settings</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium border border-purple-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {/* Name Field */}
        <div>
          <span className="font-medium text-gray-700">Name:</span>{' '}
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              placeholder="Enter your name"
            />
          ) : (
            <span className="text-gray-900">{profile.name}</span>
          )}
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <span className="font-medium text-gray-700">Email:</span>{' '}
          <span className="text-gray-900">{profile.email}</span>
          {isEditing && (
            <span className="ml-2 text-xs text-gray-500 italic">(Email cannot be changed)</span>
          )}
        </div>

        {/* Student Key (Read-only) */}
        <div>
          <span className="font-medium text-gray-700">Student Key:</span>{' '}
          <span className="font-mono text-purple-700 bg-purple-50 px-2 py-1 rounded text-sm">{profile.studentKey}</span>
          {isEditing && (
            <span className="ml-2 text-xs text-gray-500 italic">(Student Key cannot be changed)</span>
          )}
        </div>

        {/* Grade Field */}
        <div>
          <span className="font-medium text-gray-700">Grade:</span>{' '}
          {isEditing ? (
            <select
              value={editedProfile.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
            >
              <option value="">Select Grade</option>
              <option value="1st Grade">1st Grade</option>
              <option value="2nd Grade">2nd Grade</option>
              <option value="3rd Grade">3rd Grade</option>
              <option value="4th Grade">4th Grade</option>
              <option value="5th Grade">5th Grade</option>
              <option value="6th Grade">6th Grade</option>
              <option value="7th Grade">7th Grade</option>
              <option value="8th Grade">8th Grade</option>
              <option value="9th Grade">9th Grade</option>
              <option value="10th Grade">10th Grade</option>
              <option value="11th Grade">11th Grade</option>
              <option value="12th Grade">12th Grade</option>
            </select>
          ) : (
            <span className="text-gray-900">{profile.grade}</span>
          )}
        </div>

        {/* School Field */}
        <div>
          <span className="font-medium text-gray-700">School:</span>{' '}
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.school}
              onChange={(e) => handleInputChange('school', e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
              placeholder="Enter your school name"
            />
          ) : (
            <span className="text-gray-900">{profile.school}</span>
          )}
        </div>

        {/* Language Field */}
        <div>
          <span className="font-medium text-gray-700">Language:</span>{' '}
          {isEditing ? (
            <select
              value={editedProfile.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="ml-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 bg-white"
            >
              <option value="">Select Language</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bengali">Bengali</option>
              <option value="Telugu">Telugu</option>
              <option value="Marathi">Marathi</option>
              <option value="Tamil">Tamil</option>
              <option value="Gujarati">Gujarati</option>
              <option value="Kannada">Kannada</option>
              <option value="Malayalam">Malayalam</option>
              <option value="Punjabi">Punjabi</option>
            </select>
          ) : (
            <span className="text-gray-900">{profile.language}</span>
          )}
        </div>
      </div>

      {/* Edit Mode Buttons */}
      {isEditing && (
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
} 