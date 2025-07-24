'use client';

import { useState } from 'react';
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
      className="min-h-screen flex flex-col md:flex-row overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
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
          <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="absolute top-4 left-4 w-12 h-12 object-contain" />
        </motion.div>
        
        <motion.div 
          className="mt-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
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
        >
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8" />
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
          {/* Login Form Container */}
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
              {t.loginTitle}
            </motion.h2>

            <motion.form 
              onSubmit={handleSubmit} 
              className="space-y-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <motion.input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.enterEmail}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.4 }}
                whileFocus={{ scale: 1.01, borderColor: "#7c3aed" }}
              />
              
              <motion.input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.enterPassword}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-gray-900 transition-all duration-300"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.4 }}
                whileFocus={{ scale: 1.01 }}
              />

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
                className="w-full bg-[#7F00FF] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#6B00E6] focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-base relative overflow-hidden"
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
                      {t.loggingIn}
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
              className="text-center mt-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.4 }}
            >
              <span className="text-gray-600 text-sm">{t.noAccount} </span>
              <motion.span
                onClick={() => router.push('/')}
                className="text-[#7F00FF] hover:text-[#6B00E6] font-semibold cursor-pointer text-sm transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.registerHere}
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.main>
  );
} 