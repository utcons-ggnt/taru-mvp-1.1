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

      // Redirect based on user role
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
      className="min-h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🟪 Left Section - Content */}
      <motion.section 
        className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 text-white flex flex-col justify-between relative min-h-screen lg:min-h-0"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Image src="/jio-logo.png" alt="Jio Logo" width={60} height={60} className="absolute top-4 left-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-18 lg:h-18 object-contain" />
        </motion.div>
        
        <motion.div 
          className="mt-16 sm:mt-20 lg:mt-32 px-2 sm:px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
            {t.welcomeBack} <br />
            <span className="text-amber-400 font-extrabold">{t.jioWorldLearning}</span><br />
            {t.continueJourney}
          </h2>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-64 lg:h-64 mx-auto mt-4 sm:mt-6 lg:mt-2"
        >
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-full h-full object-contain" />
        </motion.div>
      </motion.section>

      {/* ⬜ Right Section - White Card */}
      <motion.section 
        className="w-full lg:w-1/2 px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-center relative min-h-screen lg:min-h-screen"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="max-w-2xl mx-auto w-full px-4 sm:px-0 h-full flex flex-col"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Login Form Container - White Card */}
          <motion.div 
            className="bg-white rounded-4xl shadow-2xl p-4 sm:p-6 lg:p-8 border border-white/20 w-full backdrop-blur-sm flex-1 flex flex-col justify-center items-center relative"
            style={{
              backgroundImage: `
                linear-gradient(rgba(128, 128, 128, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              backgroundPosition: '0 0, 0 0'
            }}
            whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}
            transition={{ duration: 0.3 }}
          >
            {/* Language Selector - Inside White Card */}
            <motion.div 
              className="absolute top-4 right-4 flex items-center gap-2 text-sm text-gray-700 z-20"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <span role="img" aria-label="language" className="text-sm sm:text-base">🌐</span>
              <motion.select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="border border-gray-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                whileFocus={{ scale: 1.02 }}
              >
                {languages.map((lang) => (
                  <option key={lang} value={lang} className="bg-white text-gray-900">
                    {lang}
                  </option>
                ))}
              </motion.select>
            </motion.div>

            <div className="w-full max-w-md">
              <motion.h2 
                className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {t.loginTitle}
              </motion.h2>

                             <motion.form 
                 onSubmit={handleSubmit} 
                 className="space-y-10 sm:space-y-10"
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 transition={{ delay: 0.9, duration: 0.6 }}
               >
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.4 }}
                >
                  <motion.input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.enterEmail}
                    required
                    className="w-full px-3 py-2.5 sm:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300 touch-manipulation"
                    whileFocus={{ scale: 1.01, borderColor: "#7c3aed" }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.4 }}
                >
                  <motion.input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.enterPassword}
                    required
                    className="w-full px-3 py-2.5 sm:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300 touch-manipulation"
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

                <motion.button
                   type="submit"
                   disabled={loading}
                   className="btn btn-primary w-full py-3 sm:py-3 text-sm sm:text-base font-extrabold relative overflow-hidden touch-manipulation rounded-full"
                   whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(127, 0, 255, 0.4)" }}
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
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span className="text-xs sm:text-sm">{t.loggingIn}</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="login"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        {t.login}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.form>

              <motion.div 
                className="text-center mt-4 sm:mt-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.4 }}
              >
                <span className="text-gray-700 text-xs sm:text-sm">{t.noAccount} </span>
                <motion.span
                  onClick={() => router.push('/')}
                  className="text-[#7F00FF] hover:text-[#6B00E6] font-semibold cursor-pointer text-xs sm:text-sm transition-colors duration-200 touch-manipulation"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.registerHere}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.main>
  );
} 