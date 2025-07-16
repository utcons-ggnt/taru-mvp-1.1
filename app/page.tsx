'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image';

const languages = ['English (USA)', 'हिन्दी', 'मराठी']

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState('English (USA)')
  const [showWelcome, setShowWelcome] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student')
  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    classGrade: '',
    language: '',
    location: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
    
    // Show welcome modal on first visit
    const hasVisited = localStorage.getItem('hasVisited')
    if (!hasVisited) {
      setShowWelcome(true)
      localStorage.setItem('hasVisited', 'true')
      setTimeout(() => setShowWelcome(false), 3000)
    }
  }, [])



  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setFormData({
      fullName: '',
      guardianName: '',
      classGrade: '',
      language: '',
      location: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
    setError('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    // Prepare profile data based on role
    let profileData: Record<string, string> = {}
    if (selectedRole === 'student') {
      profileData = {
        grade: formData.classGrade,
        language: formData.language,
        location: formData.location,
        guardianName: formData.guardianName,
      }
    } else if (selectedRole === 'teacher') {
      profileData = {
        subjectSpecialization: formData.classGrade,
        experienceYears: formData.language,
        location: formData.location,
      }
    } else if (selectedRole === 'parent') {
      profileData = {
        linkedStudentUniqueId: formData.classGrade,
        location: formData.location,
        guardianName: formData.guardianName,
      }
    } else if (selectedRole === 'organization') {
      profileData = {
        organizationType: formData.classGrade,
        industry: formData.language,
        location: formData.location,
      }
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: selectedRole,
          profile: profileData,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Show success message and auto-login
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
          if (selectedRole === 'student') {
            router.push('/student-onboarding');
          } else if (selectedRole === 'parent') {
            router.push('/parent-onboarding');
          } else if (selectedRole === 'organization') {
            router.push('/dashboard/admin');
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

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* 🎉 Welcome */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-90 rounded-3xl px-6 py-4 md:px-8 md:py-6 text-center shadow-2xl border border-purple-300 animate-pulse max-w-sm md:max-w-xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#6a0dad] mb-2">🎉 Welcome to JioWorld!</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-800 font-medium">You&apos;re all set to begin your journey 🚀</p>
          </div>
        </div>
      )}

      {/* 🟪 Left Section - Deep Purple Gradient */}
      <section className="w-full md:w-1/2 bg-gradient-to-br from-[#7F00FF] to-[#E100FF] px-6 py-8 text-white flex flex-col justify-between relative">
        <Image src="/jio-logo.png" alt="Jio Logo" width={60} height={60} className="absolute top-4 left-4 w-18 h-18 object-contain" />
        <div className="mt-32">
          <h2 className="text-5xl md:text-5xl font-bold leading-tight">
            Start your journey <br />
            with just one click. <br />
            Choose your role <br />
            and <span className="text-yellow-300 font-extrabold">Unlock a World<br />of Learning.</span>
          </h2>
        </div>
        <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-80 h-80 md:w-64 md:h-64 mx-auto mt-2" />
      </section>

      {/* ⬜ Right Section - White with Grid */}
      <section className="w-full md:w-1/2 bg-white px-6 py-8 flex flex-col justify-center relative" style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}>
        {/* Language Selector */}
        <div className="absolute top-6 right-6 flex items-center gap-2 text-sm text-gray-700 z-20">
          <span role="img" aria-label="language" className="text-base">🌐</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="max-w-md mx-auto w-full">
          {/* Registration Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Create Account
            </h2>

            {/* Role Selector Tabs */}
            <div className="mb-6">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => handleRoleChange('student')}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 ${
                    selectedRole === 'student' 
                      ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Student
                </button>
                <button 
                  onClick={() => handleRoleChange('teacher')}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 ${
                    selectedRole === 'teacher' 
                      ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Teacher
                </button>
                <button 
                  onClick={() => handleRoleChange('parent')}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 ${
                    selectedRole === 'parent' 
                      ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Parent
                </button>
                <button 
                  onClick={() => handleRoleChange('organization')}
                  className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 ${
                    selectedRole === 'organization' 
                      ? 'bg-white text-gray-900 shadow-sm font-semibold' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Organisation
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Guardian Name */}
              <div>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  placeholder="Guardian Name"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Class/Grade and Language - Side by side on md+ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="classGrade"
                    value={formData.classGrade}
                    onChange={handleInputChange}
                    placeholder={
                      selectedRole === 'student' ? 'Class/Grade' : 
                      selectedRole === 'teacher' ? 'Subject' : 
                      selectedRole === 'parent' ? 'Student ID' : 
                      'Organization Type'
                    }
                    className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                    required
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder={
                      selectedRole === 'student' ? 'Language' : 
                      selectedRole === 'teacher' ? 'Experience' : 
                      selectedRole === 'parent' ? 'Location' : 
                      'Industry'
                    }
                    className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-[#7F00FF] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#6B00E6] focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">Already have an account? </span>
              <Link
                href="/login"
                className="text-[#7F00FF] hover:text-[#6B00E6] font-semibold text-sm"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
