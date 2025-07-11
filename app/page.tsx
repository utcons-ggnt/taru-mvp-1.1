'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('lang', lang)
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* 🎉 Welcome */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-white bg-opacity-90 rounded-3xl px-8 py-6 text-center shadow-2xl border border-purple-300 animate-pulse max-w-xl">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#6a0dad] mb-2">🎉 Welcome to JioWorld!</h2>
            <p className="text-gray-800 text-lg font-medium">You're all set to begin your journey 🚀</p>
          </div>
        </div>
      )}

      {/* 🟪 Left Panel */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
        <img src="/jio-logo.png" alt="Jio Logo" className="absolute top-4 left-4 w-14 h-14 object-contain" />
        <div className="mt-20 md:mt-32">
          <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
            Start your journey <br />
            with just one click. <br />
            Choose your role <br />
            and <span className="text-yellow-300 font-extrabold">Unlock a World<br />of Learning.</span>
          </h2>
        </div>
        <img src="/landingPage.png" alt="Mascot" className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
      </div>

      {/* ⬜ Right Panel */}
      <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center relative">
        {/* Language Selector */}
        <div className="absolute top-6 right-6 sm:top-6 sm:right-8 flex items-center gap-2 text-sm text-gray-700 z-20">
          <span role="img" aria-label="language" className="text-base sm:text-lg">🌐</span>
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Choose Your Role
            </h2>
            <p className="text-gray-700">
              Select your role to get started with JioWorld Learning
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <Link
              href="/register?role=student"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">👨‍🎓</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                {t.student}
              </h3>
              <p className="text-sm text-gray-700 mt-1">Start Learning</p>
            </Link>

            <Link
              href="/register?role=teacher"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">👨‍🏫</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                {t.teacher}
              </h3>
              <p className="text-sm text-gray-700 mt-1">Teach & Guide</p>
            </Link>

            <Link
              href="/register?role=parent"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                {t.parent}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Monitor Progress</p>
            </Link>

            <Link
              href="/register?role=parent_org"
              className="group p-6 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 text-center"
            >
              <div className="text-3xl mb-2">🏢</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">
                {t.organization}
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manage Institution</p>
            </Link>
        </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/register"
              className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center block"
            >
              {t.getStarted}
            </Link>
            
            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/login"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                {t.login}
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              {t.features}
            </h3>
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t.personalizedLearning}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t.progressTracking}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t.parentMonitoring}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                {t.teacherTools}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
