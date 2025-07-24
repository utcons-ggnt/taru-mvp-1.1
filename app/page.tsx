'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

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
    console.log('Role changed to:', role);
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

    // Validate student ID format for parent registration
    if (selectedRole === 'parent') {
      const studentId = formData.classGrade.trim()
      if (!studentId.startsWith('STU')) {
        setError('Student ID must start with "STU (e.g., STUabc123def)')
        setIsLoading(false)
        return
      }
      if (studentId.length < 8) {
        setError('Student ID must be at least 8 characters long')
        setIsLoading(false)
        return
      }
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
        linkedStudentUniqueId: formData.classGrade.trim(),
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
    <motion.main 
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🎉 Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="bg-white bg-opacity-90 rounded-3xl px-6 py-4 md:px-8 md:py-6 text-center shadow-2xl border border-purple-300 max-w-sm md:max-w-xl"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.8, y: -50, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.6
              }}
            >
              <motion.h2 
                className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#6a0dad] mb-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                🎉 Welcome to JioWorld!
              </motion.h2>
              <motion.p 
                className="text-sm md:text-base lg:text-lg text-gray-800 font-medium"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                You&apos;re all set to begin your journey 🚀
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🟪 Left Section - Deep Purple Gradient */}
      <motion.section 
        className="w-full md:w-1/2 bg-gradient-to-br from-[#7F00FF] to-[#E100FF] px-6 py-8 text-white flex flex-col justify-between relative"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Image src="/jio-logo.png" alt="Jio Logo" width={60} height={60} className="absolute top-4 left-4 w-18 h-18 object-contain" />
        </motion.div>
        
        <motion.div 
          className="mt-32"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-5xl font-bold leading-tight">
            Start your journey <br />
            with just one click. <br />
            Choose your role <br />
            and <span className="text-amber-400 font-extrabold">Unlock a World<br />of Learning.</span>
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="w-80 h-80 md:w-64 md:h-64 mx-auto mt-2"
        >
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-full h-full object-contain" />
        </motion.div>
      </motion.section>

      {/* ⬜ Right Section - White with Grid */}
      <motion.section 
        className="w-full md:w-1/2 bg-white px-6 py-8 flex flex-col justify-center relative" 
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Language Selector */}
        <motion.div 
          className="absolute top-6 right-6 flex items-center gap-2 text-sm text-gray-700 z-20"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <span role="img" aria-label="language" className="text-base">🌐</span>
          <motion.select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="border border-gray-300 px-3 py-1.5 rounded-md text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            whileFocus={{ scale: 1.02 }}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </motion.select>
        </motion.div>

        <motion.div 
          className="max-w-md mx-auto w-full"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Registration Form Container */}
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            transition={{ duration: 0.3 }}
          >
            <motion.h2 
              className="text-2xl font-bold text-gray-900 mb-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Create Account
            </motion.h2>

            {/* Role Selector Tabs */}
            <motion.div 
              className="mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['student', 'teacher', 'parent', 'organization'].map((role, index) => (
                  <motion.button 
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`flex-1 px-3 py-2 rounded-md font-medium text-xs transition-all duration-200 border-2 ${
                      selectedRole === role 
                        ? 'bg-white text-gray-900 shadow-sm font-semibold border-purple-500' 
                        : 'text-gray-600 hover:text-gray-900 border-transparent'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                  >
                    {role === 'organization' ? 'Organisation' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Registration Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {/* Full Name */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                <motion.input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01, borderColor: "#7c3aed" }}
                />
              </motion.div>

              {/* Guardian Name */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
              >
                <motion.input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={handleInputChange}
                  placeholder="Guardian Name"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Class/Grade and Language - Side by side on md+ */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.4 }}
              >
                <div>
                  <motion.input
                    type="text"
                    name="classGrade"
                    value={formData.classGrade}
                    onChange={handleInputChange}
                    placeholder={
                      selectedRole === 'student' ? 'Class/Grade' : 
                      selectedRole === 'teacher' ? 'Subject' : 
                      selectedRole === 'parent' ? 'Student ID (e.g., STUabc123def)' : 
                      'Organization Type'
                    }
                    className="w-full px-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black transition-all duration-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  {selectedRole === 'parent' && (
                    <motion.p 
                      className="text-xs text-gray-600 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      Enter the student ID provided by your child
                    </motion.p>
                  )}
                </div>
                <div>
                  <motion.input
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
                    className="w-full px-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black transition-all duration-300"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                </div>
              </motion.div>

              {/* Location */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
              >
                <motion.input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.6, duration: 0.4 }}
              >
                <motion.input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.7, duration: 0.4 }}
              >
                <motion.input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.4 }}
              >
                <motion.input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="alert-error"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Register Button */}
              <motion.button
                type="submit"
                className="w-full bg-[#7F00FF] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#6B00E6] focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-base relative overflow-hidden"
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(127, 0, 255, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Account...
                    </motion.div>
                  ) : (
                    <motion.span
                      key="register"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Register
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            {/* Sign In Link */}
            <motion.div 
              className="text-center mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 2.0, duration: 0.4 }}
            >
              <span className="text-gray-700 text-sm">Already have an account? </span>
              <Link
                href="/login"
                className="text-[#7F00FF] hover:text-[#6B00E6] font-semibold text-sm transition-colors duration-200"
              >
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="inline-block"
                >
                  Sign in
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.main>
  )
}
