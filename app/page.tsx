'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image';

const languages = ['English (USA)', 'हिन्दी', 'मराठी']

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    welcome: 'Welcome to JioWorld!',
    subtitle: 'Empowering Education Through Technology',
    getStarted: 'Get Started',
    login: 'Login',
    student: 'Student',
    teacher: 'Teacher',
    parent: 'Parent',
    organization: 'Organization',
    features: 'Features',
    personalizedLearning: 'Personalized Learning',
    progressTracking: 'Progress Tracking',
    parentMonitoring: 'Parent Monitoring',
    teacherTools: 'Teacher Tools',
  },
  'हिन्दी': {
    welcome: 'जिओवर्ल्ड में आपका स्वागत है',
    subtitle: 'प्रौद्योगिकी के माध्यम से शिक्षा को सशक्त बनाना',
    getStarted: 'शुरू करें',
    login: 'लॉगिन',
    student: 'छात्र',
    teacher: 'शिक्षक',
    parent: 'अभिभावक',
    organization: 'संगठन',
    features: 'विशेषताएं',
    personalizedLearning: 'व्यक्तिगत शिक्षण',
    progressTracking: 'प्रगति ट्रैकिंग',
    parentMonitoring: 'अभिभावक निगरानी',
    teacherTools: 'शिक्षक उपकरण',
  },
  'मराठी': {
    welcome: 'जिओवर्ल्ड मध्ये आपले स्वागत आहे',
    subtitle: 'तंत्रज्ञानाद्वारे शिक्षणाला सक्षम करणे',
    getStarted: 'सुरु करा',
    login: 'लॉगिन',
    student: 'विद्यार्थी',
    teacher: 'शिक्षक',
    parent: 'पालक',
    organization: 'संस्था',
    features: 'वैशिष्ट्ये',
    personalizedLearning: 'वैयक्तिक शिक्षण',
    progressTracking: 'प्रगती ट्रॅकिंग',
    parentMonitoring: 'पालक देखरेख',
    teacherTools: 'शिक्षक साधने',
  },
}

export default function Home() {
  const router = useRouter()
  const [language, setLanguage] = useState('English (USA)')
  const [showWelcome, setShowWelcome] = useState(false)
  const [selectedRole, setSelectedRole] = useState('student')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [profile, setProfile] = useState({
    grade: '',
    subjectSpecialization: '',
    experienceYears: '',
    organisationName: '',
    address: '',
    contactNumber: '',
    studentId: '',
  })
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string; uniqueId: string; name: string; email: string; grade: string}>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const t = translations[language]

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

  // Fetch available students when role is parent
  useEffect(() => {
    if (selectedRole === 'parent') {
      const fetchStudents = async () => {
        setIsLoadingStudents(true)
        try {
          const response = await fetch('/api/students/available')
          if (response.ok) {
            const data = await response.json()
            setAvailableStudents(data.students || [])
          }
        } catch (error) {
          console.error('Error fetching students:', error)
        } finally {
          setIsLoadingStudents(false)
        }
      }

      fetchStudents()
    }
  }, [selectedRole])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleRoleChange = (role: string) => {
    setSelectedRole(role)
    setProfile({
      grade: '',
      subjectSpecialization: '',
      experienceYears: '',
      organisationName: '',
      address: '',
      contactNumber: '',
      studentId: '',
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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({ ...prev, [name]: value }))
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
        grade: profile.grade,
      }
    } else if (selectedRole === 'teacher') {
      profileData = {
        subjectSpecialization: profile.subjectSpecialization,
        experienceYears: profile.experienceYears,
      }
    } else if (selectedRole === 'parent') {
      profileData = {
        linkedStudentUniqueId: profile.studentId,
      }
    } else if (selectedRole === 'parent_org') {
      profileData = {
        organisationName: profile.organisationName,
        address: profile.address,
        contactNumber: profile.contactNumber,
      }
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
    <main className="min-h-screen bg-gradient-to-br from-purple-700 to-purple-500 flex flex-col md:flex-row overflow-hidden">
      {/* 🎉 Welcome */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white bg-opacity-90 rounded-3xl px-6 py-4 md:px-8 md:py-6 text-center shadow-2xl border border-purple-300 animate-pulse max-w-sm md:max-w-xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#6a0dad] mb-2">🎉 Welcome to JioWorld!</h2>
            <p className="text-sm md:text-base lg:text-lg text-gray-800 font-medium">You&apos;re all set to begin your journey 🚀</p>
          </div>
        </div>
      )}

      {/* 🟪 Purple Section */}
      <section className="w-full md:w-3/5 lg:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8 text-white flex flex-col justify-between relative">
        <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="absolute top-1 left-1 sm:top-2 sm:left-2 md:top-3 md:left-3 w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain" />
        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
            Start your journey <br />
            with just one click. <br />
            Choose your role <br />
            and <span className="text-yellow-300 font-extrabold">Unlock a World<br />of Learning.</span>
          </h2>
        </div>
        <Image src="/landingPage.png" alt="Mascot" width={192} height={192} className="w-24 sm:w-28 md:w-32 lg:w-40 xl:w-48 mx-auto mt-1 sm:mt-2 md:mt-3 lg:mt-4" />
      </section>

      {/* ⬜ White Section */}
      <section className="w-full md:w-2/5 lg:w-1/2 bg-white px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8 flex flex-col justify-center relative rounded-2xl sm:rounded-3xl md:rounded-3xl shadow-xl md:shadow-2xl md:ml-1 lg:ml-2 xl:ml-4 md:mr-1 lg:mr-2 xl:mr-4 md:my-1 lg:my-2 xl:my-4">
        {/* Language Selector */}
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 md:top-3 md:right-3 lg:top-4 lg:right-4 flex items-center gap-1 text-xs text-gray-700 z-20">
          <span role="img" aria-label="language" className="text-xs">🌐</span>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-300 px-1 py-1 rounded-md text-xs bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto w-full">
          <div className="text-center mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Choose Your Role
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              Select your role to get started with JioWorld Learning
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <div className="flex justify-center space-x-1 sm:space-x-2 md:space-x-3 flex-wrap">
              <button 
                onClick={() => handleRoleChange('student')}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 font-semibold rounded-lg text-sm sm:text-base md:text-lg transition-all duration-200 ${
                  selectedRole === 'student' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.student}
              </button>
              <button 
                onClick={() => handleRoleChange('teacher')}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 font-semibold rounded-lg text-sm sm:text-base md:text-lg transition-all duration-200 ${
                  selectedRole === 'teacher' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.teacher}
              </button>
              <button 
                onClick={() => handleRoleChange('parent')}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 font-semibold rounded-lg text-sm sm:text-base md:text-lg transition-all duration-200 ${
                  selectedRole === 'parent' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {t.parent}
              </button>
              <button 
                onClick={() => handleRoleChange('parent_org')}
                className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-2 md:py-3 font-semibold rounded-lg text-sm sm:text-base md:text-lg transition-all duration-200 ${
                  selectedRole === 'parent_org' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Parent Org
              </button>
            </div>
          </div>

          {/* Registration Form */}
          <form id="register-form" onSubmit={handleSubmit} className="mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 text-center">
              Create Account
            </h3>
            
            <div className="space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
              {/* Full Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
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
                  className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
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
                  className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
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
                  className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                  required
                />
              </div>

              {/* Role-specific fields */}
              {selectedRole === 'student' && (
                <div>
                  <input
                    type="text"
                    name="grade"
                    value={profile.grade}
                    onChange={handleProfileChange}
                    placeholder="Grade"
                    className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                  />
                </div>
              )}

              {selectedRole === 'teacher' && (
                <>
                  <div>
                    <input
                      type="text"
                      name="subjectSpecialization"
                      value={profile.subjectSpecialization}
                      onChange={handleProfileChange}
                      placeholder="Subject Specialization"
                      className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="experienceYears"
                      value={profile.experienceYears}
                      onChange={handleProfileChange}
                      placeholder="Years of Experience"
                      className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                    />
                  </div>
                </>
              )}

              {selectedRole === 'parent' && (
                <div>
                  <select
                    name="studentId"
                    value={profile.studentId}
                    onChange={handleProfileChange}
                    className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
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
                </div>
              )}

              {selectedRole === 'parent_org' && (
                <>
                  <div>
                    <input
                      type="text"
                      name="organisationName"
                      value={profile.organisationName}
                      onChange={handleProfileChange}
                      placeholder="Organization Name"
                      className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      placeholder="Address"
                      className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={profile.contactNumber}
                      onChange={handleProfileChange}
                      placeholder="Contact Number"
                      className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
                    />
                  </div>
                </>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>
          </form>

          {/* Action Buttons */}
          <div className="space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
            <button
              type="submit"
              form="register-form"
              className="w-full bg-purple-600 text-white font-semibold py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 lg:px-6 rounded-lg hover:bg-purple-700 transition-colors text-center block text-sm sm:text-base md:text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
            
            <div className="text-center">
              <span className="text-gray-600 text-sm sm:text-base md:text-lg">Already have an account? </span>
              <Link
                href="/login"
                className="text-purple-600 hover:text-purple-700 font-semibold text-sm sm:text-base md:text-lg"
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
