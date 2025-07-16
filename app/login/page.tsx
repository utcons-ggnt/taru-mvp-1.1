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
    <main className="min-h-screen bg-gradient-to-br from-purple-700 to-purple-500 flex flex-col md:flex-row overflow-hidden">
      {/* 🟪 Purple Section */}
      <section className="w-full md:w-3/5 lg:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8 text-white flex flex-col justify-between relative">
        <Image src="/jio-logo.png" alt="Jio Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
        <div className="mt-8 sm:mt-12 md:mt-16 lg:mt-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight px-1 sm:px-2 md:px-4 lg:px-6 xl:px-8">
            {t.welcomeBack} <br />
            <span className="text-yellow-300 font-extrabold">{t.jioWorldLearning}</span><br />
            {t.continueJourney}
          </h2>
        </div>
        <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
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
              {t.loginTitle}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-700">
              Welcome back! Please sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1 sm:space-y-2 md:space-y-3 lg:space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.enterEmail}
              required
              className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.enterPassword}
              required
              className="w-full px-2 py-1 sm:py-2 md:py-3 border-b-2 border-gray-300 focus:border-purple-500 outline-none text-sm sm:text-base md:text-lg bg-transparent"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white font-semibold py-2 sm:py-3 md:py-4 px-2 sm:px-3 md:px-4 lg:px-6 rounded-lg hover:bg-purple-700 transition-colors text-center block text-sm sm:text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.loggingIn : t.login}
            </button>
          </form>

          <div className="text-center mt-3 sm:mt-4 md:mt-6 lg:mt-8">
            <span className="text-gray-600 text-sm sm:text-base md:text-lg">{t.noAccount} </span>
            <span
              onClick={() => router.push('/')}
              className="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer text-sm sm:text-base md:text-lg"
            >
              {t.registerHere}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
} 