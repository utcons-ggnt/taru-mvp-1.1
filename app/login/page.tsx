'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const languages = ['English (USA)', 'हिन्दी', 'मराठी']

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    loginTitle: 'Login to Your Account',
    enterEmail: 'Enter your email',
    enterPassword: 'Enter your password',
    login: 'Login',
    loggingIn: 'Logging in...',
    noAccount: "Don't have an account?",
    registerHere: 'Register here',
    welcomeBack: 'Welcome back to',
    jioWorldLearning: 'JioWorld Learning!',
    continueJourney: 'Log in to continue your journey 🚀',
  },
  'हिन्दी': {
    loginTitle: 'अपने खाते में लॉगिन करें',
    enterEmail: 'अपना ईमेल दर्ज करें',
    enterPassword: 'अपना पासवर्ड दर्ज करें',
    login: 'लॉगिन',
    loggingIn: 'लॉगिन हो रहा है...',
    noAccount: 'खाता नहीं है?',
    registerHere: 'यहां रजिस्टर करें',
    welcomeBack: 'वापस आने पर स्वागत है',
    jioWorldLearning: 'जिओवर्ल्ड लर्निंग!',
    continueJourney: 'अपनी यात्रा जारी रखने के लिए लॉगिन करें 🚀',
  },
  'मराठी': {
    loginTitle: 'तुमच्या खात्यात लॉगिन करा',
    enterEmail: 'तुमचा ईमेल टाका',
    enterPassword: 'तुमचा पासवर्ड टाका',
    login: 'लॉगिन',
    loggingIn: 'लॉगिन होत आहे...',
    noAccount: 'खाते नाही?',
    registerHere: 'येथे नोंदणी करा',
    welcomeBack: 'परत येण्याबद्दल स्वागत आहे',
    jioWorldLearning: 'जिओवर्ल्ड लर्निंग!',
    continueJourney: 'तुमची प्रवास सुरू ठेवण्यासाठी लॉगिन करा 🚀',
  },
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English (USA)');
  const router = useRouter();

  const t = translations[language]

  useEffect(() => {
    const savedLang = localStorage.getItem('lang')
    if (savedLang) setLanguage(savedLang)
  }, [])

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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

      console.log('Login response:', data);
      
      const user = data.user;
      if (!user) throw new Error('No user returned from login');

      // Check if user needs onboarding
      if (data.requiresOnboarding) {
        if (user.role === 'student') {
          console.log('Student needs onboarding, redirecting to student onboarding');
          router.push('/student-onboarding');
          return;
        } else if (user.role === 'parent') {
          console.log('Parent needs onboarding, redirecting to parent onboarding');
          router.push('/parent-onboarding');
          return;
        }
      }

      // Handle role-based redirection
      if (user.role === 'student') {
        console.log('Redirecting to student dashboard');
        router.push('/dashboard/student');
      } else if (user.role === 'parent') {
        console.log('Redirecting to parent dashboard');
        router.push('/dashboard/parent');
      } else if (user.role === 'teacher') {
        console.log('Redirecting to teacher dashboard');
        router.push('/dashboard/teacher');
      } else if (user.role === 'parent_org') {
        console.log('Redirecting to parent-org dashboard');
        router.push('/dashboard/parent-org');
      } else if (user.role === 'admin') {
        console.log('Redirecting to admin dashboard');
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
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* 🟪 Left Section - Deep Purple Gradient */}
      <section className="w-full md:w-1/2 bg-gradient-to-br from-[#7F00FF] to-[#E100FF] px-6 py-8 text-white flex flex-col justify-between relative">
        <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="absolute top-4 left-4 w-12 h-12 object-contain" />
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            {t.welcomeBack} <br />
            <span className="text-yellow-300 font-extrabold">{t.jioWorldLearning}</span><br />
            {t.continueJourney}
          </h2>
        </div>
        <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8" />
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
          {/* Login Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t.loginTitle}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.enterEmail}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.enterPassword}
                required
                className="w-full px-3 py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-base bg-transparent placeholder:text-gray-600 text-black"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7F00FF] text-white font-semibold py-3 px-6 rounded-full hover:bg-[#6B00E6] focus:ring-4 focus:ring-purple-200 transition-all duration-200 text-base"
              >
                {loading ? t.loggingIn : t.login}
              </button>
            </form>

            <div className="text-center mt-6">
              <span className="text-gray-600 text-sm">{t.noAccount} </span>
              <span
                onClick={() => router.push('/')}
                className="text-[#7F00FF] hover:text-[#6B00E6] font-semibold cursor-pointer text-sm"
              >
                {t.registerHere}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 