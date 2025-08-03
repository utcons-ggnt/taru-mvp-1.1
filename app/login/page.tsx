'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const languages = ['English (USA)', 'हिन्दी', 'मराठी'];

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    welcomeBack: 'Welcome back to',
    jioWorldLearning: 'JioWorld Learning!',
    continueJourney: 'Continue your learning journey.',
    loginTitle: 'Sign In',
    enterEmail: 'Email address',
    enterPassword: 'Password',
    login: 'Sign In',
    loggingIn: 'Signing in...',
    noAccount: "Don't have an account?",
    registerHere: 'Register here'
  },
  'हिन्दी': {
    welcomeBack: 'वापस स्वागत है',
    jioWorldLearning: 'JioWorld Learning में!',
    continueJourney: 'अपनी सीखने की यात्रा जारी रखें।',
    loginTitle: 'साइन इन करें',
    enterEmail: 'ईमेल पता',
    enterPassword: 'पासवर्ड',
    login: 'साइन इन करें',
    loggingIn: 'साइन इन हो रहा है...',
    noAccount: 'कोई खाता नहीं है?',
    registerHere: 'यहाँ रजिस्टर करें'
  },
  'मराठी': {
    welcomeBack: 'परत स्वागत आहे',
    jioWorldLearning: 'JioWorld Learning मध्ये!',
    continueJourney: 'तुमचा शिकण्याचा प्रवास सुरू ठेवा.',
    loginTitle: 'साइन इन करा',
    enterEmail: 'ईमेल पत्ता',
    enterPassword: 'पासवर्ड',
    login: 'साइन इन करा',
    loggingIn: 'साइन इन होत आहे...',
    noAccount: 'खाते नाही?',
    registerHere: 'इथे नोंदणी करा'
  }
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('English (USA)');

  const t = translations[language] || translations['English (USA)'];

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Check if user needs onboarding first
      if (data.requiresOnboarding) {
        if (data.user.role === 'student') {
          router.push('/student-onboarding');
          return;
        } else if (data.user.role === 'parent') {
          router.push('/parent-onboarding');
          return;
        }
      }

      // Check if student needs to complete diagnostic assessment
      if (data.requiresAssessment && data.user.role === 'student') {
        router.push('/diagnostic-assessment');
        return;
      }

      // Redirect based on user role after onboarding and assessment checks
      if (data.user.role === 'student') {
        router.push('/dashboard/student');
      } else if (data.user.role === 'parent') {
        router.push('/dashboard/parent');
      } else if (data.user.role === 'teacher') {
        router.push('/dashboard/teacher');
      } else if (data.user.role === 'organization') {
        router.push('/dashboard/admin');
      } else {
        throw new Error('Unknown user role');
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.main 
      className="min-h-screen flex items-center justify-center overflow-hidden bg-[#6D18CE] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Main Login Popup Container */}
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
             <h2 className="text-[39.375px] leading-[48px] font-normal text-white">
               Start your journey with just one click. <br />
               Choose your role and <br />
               <span className="font-bold">unlock a world of learning.</span>
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
          {/* Language Selector */}
          <motion.div 
            className="absolute top-[40px] right-[40px] w-[145.6px] h-[26.6px] flex items-center gap-2 z-10"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-[15.9955px] font-semibold text-black bg-transparent border-none focus:outline-none cursor-pointer flex-1"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang} className="bg-white text-black">
                  {lang}
                </option>
              ))}
            </motion.select>
            <div className="w-[26.6px] h-[26.6px] flex items-center justify-center flex-shrink-0">
              <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <path d="M1 1L7 7L13 1" stroke="#8E8E8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>

          {/* Main Content Container */}
          <div className="relative w-full h-full">
            {/* Role Selector Tabs */}
            <motion.div 
              className="absolute top-[152px] left-[154px] w-[514px] h-[56px]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              <div className="flex bg-[#F2F4F7] rounded-xl p-1 h-full">
                {['Student', 'Teacher', 'Parent'].map((role, index) => (
                  <motion.button 
                    key={role}
                    className={`flex-1 px-6 py-3 rounded-lg font-normal text-[14px] transition-all duration-200 ${
                      index === 0 
                        ? 'bg-white text-[#101828] shadow-sm' 
                        : 'text-[#667085]'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
                  >
                    {role}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Welcome back Title */}
            <motion.h2 
              className="absolute top-[267px] left-[154px] text-[24.7297px] leading-[30px] font-bold text-black"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              Welcome back
            </motion.h2>

            {/* Welcome back Subtitle */}
            <motion.p 
              className="absolute top-[300px] left-[155px] w-[433px] text-[16px] leading-[32px] font-normal text-[#454545]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              Welcome back! Please enter your details.
            </motion.p>

            {/* Login Form */}
            <motion.form 
              onSubmit={handleSubmit}
              className="absolute top-[359px] left-[155px] w-[513px]"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              {/* Email Input */}
              <div className="relative mb-[15px]">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full h-[60px] px-[47px] border-[0.5px] border-[#C2C2C2] rounded-[70px] text-[16.0016px] leading-[19px] font-medium text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                />
              </div>

              {/* Password Input */}
              <div className="relative mb-[21px]">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full h-[60px] px-[47px] border-[0.5px] border-[#C2C2C2] rounded-[70px] text-[16.0016px] leading-[19px] font-medium text-black bg-transparent focus:outline-none focus:border-[#6D18CE] transition-colors"
                />
              </div>

              {/* Remember me and Forgot password */}
              <div className="flex justify-between items-center mb-[18px]">
                <div className="flex items-center gap-[6px]">
                  <input
                    type="checkbox"
                    className="w-[34px] h-[34px] border border-black rounded"
                  />
                  <span className="text-[13px] leading-[16px] font-normal text-black">Remember me</span>
                </div>
                <span className="text-[13px] leading-[16px] font-bold text-[#6D18CE] cursor-pointer hover:text-[#5A14B0] transition-colors">
                  Forgot password
                </span>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    className="mb-[18px] alert-error"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-[514px] h-[69px] bg-[#6D18CE] text-white rounded-[90px] font-semibold text-[16.0016px] flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                        style={{ borderTopColor: '#FFFFFF' }}
                      />
                      <span className="text-white">{t.loggingIn}</span>
                    </motion.div>
                  ) : (
                    <motion.span
                      key="login"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      Sign in
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            {/* Register Link */}
            <motion.div 
              className="absolute top-[655px] left-[308px] text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <span className="text-[13px] leading-[16px] font-normal text-black">Don&apos;t have an account? </span>
              <motion.span
                onClick={() => router.push('/register')}
                className="text-[#6D18CE] hover:text-[#5A14B0] font-semibold cursor-pointer text-[13px] transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign up
              </motion.span>
            </motion.div>
          </div>
        </motion.section>
      </motion.div>
    </motion.main>
  );
} 