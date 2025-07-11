'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const roleOptions = [
  { value: 'student', label: 'Student' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'parent', label: 'Parent' },
  { value: 'parent_org', label: 'Parent Organisation' },
  { value: 'admin', label: 'Admin' },
];

const initialProfile = {
  grade: '',
  subjectSpecialization: '',
  experienceYears: '',
  organisationName: '',
  address: '',
  contactNumber: '',
  studentId: '',
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string, uniqueId: string, name: string, email: string, grade: string}>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Handle role from URL parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && roleOptions.some(option => option.value === roleParam)) {
      setFormData(prev => ({ ...prev, role: roleParam }));
    }
  }, [searchParams]);

  // Fetch available students when role is parent
  useEffect(() => {
    if (formData.role === 'parent') {
      const fetchStudents = async () => {
        setIsLoadingStudents(true);
        try {
          const response = await fetch('/api/students/available');
          if (response.ok) {
            const data = await response.json();
            setAvailableStudents(data.students || []);
          }
        } catch (error) {
          console.error('Error fetching students:', error);
        } finally {
          setIsLoadingStudents(false);
        }
      };

      fetchStudents();
    }
  }, [formData.role]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'role') setProfile(initialProfile); // Reset profile fields on role change
    if (error) setError('');
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    // Prepare profile data based on role
    let profileData: Record<string, any> = {};
    if (formData.role === 'student') {
      profileData = {
        grade: profile.grade,
      };
    } else if (formData.role === 'teacher') {
      profileData = {
        subjectSpecialization: profile.subjectSpecialization,
        experienceYears: profile.experienceYears,
      };
    } else if (formData.role === 'parent') {
      profileData = {
        linkedStudentUniqueId: profile.studentId,
      };
    } else if (formData.role === 'parent_org') {
      profileData = {
        organisationName: profile.organisationName,
        address: profile.address,
        contactNumber: profile.contactNumber,
      };
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          profile: profileData,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Show success message
      setShowSuccess(true);
      
      // Auto-login after successful registration
      try {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        const loginData = await loginResponse.json();
        if (!loginResponse.ok) {
          throw new Error(loginData.error || 'Auto-login failed');
        }
        
        // Redirect based on role after a short delay
        setTimeout(() => {
          if (formData.role === 'student') {
            router.push('/student-onboarding');
          } else if (formData.role === 'parent') {
            router.push('/parent-onboarding');
          } else {
            router.push('/login');
          }
        }, 2000);
      } catch (loginError) {
        console.error('Auto-login failed:', loginError);
        // If auto-login fails, redirect to login page
        setTimeout(() => {
      router.push('/login');
        }, 2000);
      }

    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render dynamic profile fields based on role
  const renderProfileFields = () => {
    switch (formData.role) {
      case 'student':
        return (
            <div>
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade
              </label>
              <input
                id="grade"
                name="grade"
                type="text"
                value={profile.grade}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your grade"
              />
            </div>
        );
      case 'teacher':
        return (
          <>
            <div>
              <label htmlFor="subjectSpecialization" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject Specialization
              </label>
              <input
                id="subjectSpecialization"
                name="subjectSpecialization"
                type="text"
                value={profile.subjectSpecialization}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="e.g. Mathematics"
              />
            </div>
            <div>
              <label htmlFor="experienceYears" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                id="experienceYears"
                name="experienceYears"
                type="number"
                value={profile.experienceYears}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter years of experience"
              />
            </div>
          </>
        );
      case 'parent':
        return (
          <>
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link with Student *
              </label>
              <select
                id="studentId"
                name="studentId"
                value={profile.studentId}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                required
              >
                <option value="">Select a student</option>
                {isLoadingStudents ? (
                  <option value="">Loading students...</option>
                ) : availableStudents.length === 0 ? (
                  <option value="">No students found</option>
                ) : (
                  availableStudents.map(student => (
                    <option key={student.id} value={student.uniqueId}>
                      {student.name} - {student.uniqueId} (Grade {student.grade})
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select the student you want to link to your account using their unique student ID. Only students who have completed onboarding are shown.
              </p>
            </div>
          </>
        );
      case 'parent_org':
        return (
          <>
            <div>
              <label htmlFor="organisationName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organisation Name
              </label>
              <input
                id="organisationName"
                name="organisationName"
                type="text"
                value={profile.organisationName}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter organisation name"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={profile.address}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter organisation address"
              />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Number
              </label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                value={profile.contactNumber}
                onChange={handleProfileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter contact number"
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  if (showSuccess) {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h1>
          <p className="text-gray-600 mb-4">
            {formData.role === 'student' 
              ? 'Logging you in and redirecting to student onboarding...' 
              : formData.role === 'parent'
              ? 'Logging you in and redirecting to parent onboarding...'
              : 'Redirecting to login...'
            }
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">Join JioWorld Learning Platform</p>
              </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Your Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
                ))}
              </select>
            </div>

          {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your full name"
              required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Enter your email"
              required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Create a password"
              required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                placeholder="Confirm your password"
              required
              />
            </div>

          {/* Role-specific Profile Fields */}
            {renderProfileFields()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

              <button
                type="submit"
                disabled={isLoading}
            className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            href="/login"
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Login here
                </Link>
        </div>
      </div>
    </div>
  );
} 