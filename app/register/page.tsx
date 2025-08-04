'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import SimpleGoogleTranslate from '../components/SimpleGoogleTranslate'

export default function Register() {
  const router = useRouter()
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
        setError('Student ID must start with "STU" (e.g., STUabc123def)')
        setIsLoading(false)
        return
      }
      if (studentId.length < 8) {
        setError('Student ID must be at least 8 characters long')
        setIsLoading(false)
        return
      }
    }

    // Validate organization type for organization registration
    if (selectedRole === 'organization') {
      const orgType = formData.classGrade.trim()
      if (orgType.length < 3) {
        setError('Organization type must be at least 3 characters long')
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
          } else if (selectedRole === 'teacher') {
            router.push('/dashboard/teacher');
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
      className="min-h-screen flex items-center justify-center overflow-hidden bg-[#6D18CE] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Registration Popup Container */}
      <motion.div 
        className="relative w-full max-w-[1400px] h-[800px] bg-[#6D18CE] rounded-[40px] flex"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Left Section - Purple Background with Content */}
        <motion.section 
          className="w-[577px] h-[800px] relative"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Jio Logo */}
          <motion.div
            className="absolute top-[64px] left-[63px]"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Image src="/jio-logo.png" alt="Jio Logo" width={68} height={68} className="w-[68px] h-[68px] object-contain" />
          </motion.div>
          
          {/* Main Text */}
          <motion.div 
            className="absolute top-[172px] left-[63px] w-[457.73px] h-[240px]"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <h2 className="text-[39.375px] leading-[48px] font-normal text-white flex items-center">
              Start your journey with just one click. Choose your role and unlock a world of learning.
            </h2>
          </motion.div>
          
          {/* Mascot Image */}
          <motion.div
            className="absolute top-[400px] left-[75px]"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Image src="/landingPage.png" alt="Mascot" width={407} height={352} className="w-[407px] h-[352px] object-contain" />
          </motion.div>
        </motion.section>

        {/* Right Section - White Form Card */}
        <motion.section 
          className="w-[823px] h-[800px] bg-white rounded-[40px] shadow-[-21px_0px_144px_#6219B5] relative"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Google Translate */}
          <motion.div 
            className="absolute top-[40px] right-[40px] z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <SimpleGoogleTranslate 
          className="text-white"
          buttonText="Translate"
          showIcon={true}
        />
          </motion.div>

          {/* Main Content Container */}
          <div className="px-[60px] py-[40px] h-full flex flex-col">
            {/* Role Selector Tabs */}
            <motion.div 
              className="w-full h-[56px] mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex bg-[#F2F4F7] rounded-xl p-1 h-full">
                {['student', 'teacher', 'parent', 'organization'].map((role, index) => (
                  <motion.button 
                    key={role}
                    onClick={() => handleRoleChange(role)}
                    className={`flex-1 px-4 py-3 rounded-lg font-normal text-[12px] transition-all duration-200 ${
                      selectedRole === role 
                        ? 'bg-white text-[#101828] shadow-sm' 
                        : 'text-[#667085]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Create Account Title */}
            <motion.h2 
              className="text-[24.7297px] leading-[30px] font-bold text-black mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Create Account
            </motion.h2>

            {/* Registration Form */}
            <motion.form 
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {/* Form Fields Container */}
              <div className="flex-1 space-y-3">
                {/* Full Name */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>

                {/* Guardian Name / Contact Person */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">
                    {selectedRole === 'organization' ? 'Contact Person' : 'Guardian Name'}
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleInputChange}
                    placeholder={selectedRole === 'organization' ? 'e.g., John Doe, HR Manager' : ''}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>

                {/* Class/Grade and Language - Side by side */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">
                      {selectedRole === 'student' ? 'Class/Grade' : 
                       selectedRole === 'teacher' ? 'Subject' : 
                       selectedRole === 'parent' ? 'Student ID' : 
                       selectedRole === 'organization' ? 'Organization Type' :
                       'Organization Type'}
                    </label>
                    <input
                      type="text"
                      name="classGrade"
                      value={formData.classGrade}
                      onChange={handleInputChange}
                      placeholder={selectedRole === 'parent' ? 'e.g., STUabc123def' : 
                                  selectedRole === 'organization' ? 'e.g., School, NGO, Company' : ''}
                      className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                      required
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">
                      {selectedRole === 'student' ? 'Language' : 
                       selectedRole === 'teacher' ? 'Experience' : 
                       selectedRole === 'parent' ? 'Location' : 
                       selectedRole === 'organization' ? 'Industry' :
                       'Industry'}
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      placeholder={selectedRole === 'organization' ? 'e.g., Education, Technology, Healthcare' : ''}
                      className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-[16.0016px] font-medium leading-[19px] text-[#C2C2C2] mb-1">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full border-b-[0.5px] border-[#C2C2C2] pb-1 text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="my-2 alert-error"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom Section */}
              <div className="mt-4 space-y-3">
                {/* Register Button */}
                <motion.button
                  type="submit"
                  className="w-full h-[50px] bg-[#6D18CE] text-white rounded-[90px] font-semibold text-[16.0016px] flex items-center justify-center"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
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
                        <span>Creating Account...</span>
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

                {/* Sign In Link */}
                <motion.div 
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 2.0, duration: 0.4 }}
                >
                  <span className="text-[13px] leading-[16px] text-black">Already have an account? </span>
                  <Link
                    href="/login"
                    className="text-[#6D18CE] hover:text-[#5A14B0] font-semibold text-[13px] transition-colors duration-200"
                  >
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      className="inline-block"
                    >
                      Sign in
                    </motion.span>
                  </Link>
                </motion.div>
              </div>
            </motion.form>
          </div>
        </motion.section>
      </motion.div>
    </motion.main>
  )
} 