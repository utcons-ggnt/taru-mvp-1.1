'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const languages = ['English (USA)', 'हिन्दी', 'मराठी']

const translations: Record<string, Record<string, string>> = {
  'English (USA)': {
    onboardingTitle: 'Student Onboarding',
    subtitle: 'Complete your profile to get started',
    next: 'Next',
    previous: 'Previous',
    submit: 'Complete Onboarding',
    submitting: 'Submitting...',
    successTitle: 'Onboarding Complete!',
    successMessage: 'Your unique student ID is',
    continueToDashboard: 'Continue to Dashboard',
    shareWithParent: 'Share with Parent',
    copyCode: 'Copy Code',
    copied: 'Copied!',
    shareLink: 'Share Link',
    shareViaWhatsApp: 'Share via WhatsApp',
    shareViaEmail: 'Share via Email',
    shareInstructions: 'Share this ID with your parent to link their account',
  },
  'हिन्दी': {
    onboardingTitle: 'छात्र ऑनबोर्डिंग',
    subtitle: 'शुरू करने के लिए अपनी प्रोफ़ाइल पूरी करें',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'ऑनबोर्डिंग पूरी करें',
    submitting: 'सबमिट हो रहा है...',
    successTitle: 'ऑनबोर्डिंग पूरी!',
    successMessage: 'आपकी अद्वितीय छात्र आईडी है',
    continueToDashboard: 'डैशबोर्ड पर जाएं',
    shareWithParent: 'अभिभावक के साथ साझा करें',
    copyCode: 'कोड कॉपी करें',
    copied: 'कॉपी किया गया!',
    shareLink: 'लिंक साझा करें',
    shareViaWhatsApp: 'WhatsApp के माध्यम से साझा करें',
    shareViaEmail: 'ईमेल के माध्यम से साझा करें',
    shareInstructions: 'अपने अभिभावक के साथ इस आईडी को साझा करें',
  },
  'मराठी': {
    onboardingTitle: 'विद्यार्थी ऑनबोर्डिंग',
    subtitle: 'सुरु करण्यासाठी तुमची प्रोफाइल पूर्ण करा',
    next: 'पुढे',
    previous: 'मागे',
    submit: 'ऑनबोर्डिंग पूर्ण करा',
    submitting: 'सबमिट होत आहे...',
    successTitle: 'ऑनबोर्डिंग पूर्ण!',
    successMessage: 'तुमची अद्वितीय विद्यार्थी आयडी आहे',
    continueToDashboard: 'डॅशबोर्डवर जा',
    shareWithParent: 'पालकांसोबत सामायिक करा',
    copyCode: 'कोड कॉपी करा',
    copied: 'कॉपी केले!',
    shareLink: 'लिंक सामायिक करा',
    shareViaWhatsApp: 'WhatsApp द्वारे सामायिक करा',
    shareViaEmail: 'ईमेल द्वारे सामायिक करा',
    shareInstructions: 'त्यांचे खाते लिंक करण्यासाठी हे आयडी आपल्या पालकांसोबत सामायिक करा',
  },
}

interface StudentOnboardingData {
  // Personal Information (pre-filled from registration)
  fullName: string;
  nickname: string;
  dateOfBirth: string;
  age: number;
  gender: string;
  classGrade: string;
  schoolName: string;
  schoolId: string;
  
  // Preferences
  languagePreference: string;
  learningModePreference: string[];
  interestsOutsideClass: string[];
  preferredCareerDomains: string[];
  
  // Guardian Information
  guardianName: string;
  guardianContactNumber: string;
  guardianEmail: string;
  
  // Location and Technical
  location: string;
  deviceId: string;
  
  // Consent
  consentForDataUsage: boolean;
  termsAndConditionsAccepted: boolean;
  
  // Student ID
  uniqueId: string;
}

const languageOptions = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Other'
];

const learningModes = [
  'Visual Learning', 'Auditory Learning', 'Reading/Writing', 'Kinesthetic Learning',
  'Group Learning', 'Individual Learning', 'Online Learning', 'Hands-on Practice'
];

const interests = [
  'Sports', 'Music', 'Art', 'Reading', 'Technology', 'Science', 'Cooking', 'Travel',
  'Photography', 'Dancing', 'Gaming', 'Nature', 'Puzzles', 'Writing', 'Crafts', 'Other'
];

const careerDomains = [
  'Technology', 'Healthcare', 'Business', 'Arts', 'Science', 'Engineering',
  'Education', 'Law', 'Finance', 'Marketing', 'Design', 'Agriculture',
  'Sports', 'Media', 'Environment', 'Other'
];

export default function StudentOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uniqueId, setUniqueId] = useState('');
  const [language, setLanguage] = useState('English (USA)');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<StudentOnboardingData>({
    fullName: '',
    nickname: '',
    dateOfBirth: '',
    age: 0,
    gender: '',
    classGrade: '',
    schoolName: 'Demo School', // Auto-filled based on entity
    schoolId: '',
    languagePreference: '',
    learningModePreference: [],
    interestsOutsideClass: [],
    preferredCareerDomains: [],
    guardianName: '',
    guardianContactNumber: '',
    guardianEmail: '',
    location: '',
    deviceId: 'device_' + Math.random().toString(36).substr(2, 9),
    consentForDataUsage: false,
    termsAndConditionsAccepted: false,
    uniqueId: '' // Initialize uniqueId
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(uniqueId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Hi! My JioWorld Learning student ID is: ${uniqueId}. Please use this ID to link your parent account.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'My JioWorld Learning Student ID';
    const body = `Hi! My JioWorld Learning student ID is: ${uniqueId}. Please use this ID to link your parent account.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const shareViaLink = () => {
    const shareUrl = `${window.location.origin}/register?role=parent&studentId=${uniqueId}`;
    if (navigator.share) {
      navigator.share({
        title: 'JioWorld Learning Student ID',
        text: `My student ID: ${uniqueId}`,
        url: shareUrl
      });
    } else {
      // Fallback to copying the link
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Fetch existing user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          const user = userData.user;
          
          // Pre-fill form with existing data
          setFormData(prev => ({
            ...prev,
            fullName: user.name || '',
            classGrade: user.profile?.grade || '',
            // Age will be calculated from date of birth
            // Keep other fields empty for user to fill
          }));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Calculate age when date of birth changes
  useEffect(() => {
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.dateOfBirth]);

  // Auto-detect location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ 
            ...prev, 
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
          }));
        },
        () => {
          setFormData(prev => ({ ...prev, location: 'Location not available' }));
        }
      );
    }
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        // Only validate additional fields not collected during registration
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.schoolId.trim()) newErrors.schoolId = 'School ID is required';
        break;
      
      case 2:
        if (!formData.languagePreference) newErrors.languagePreference = 'Language preference is required';
        if (formData.learningModePreference.length === 0) {
          newErrors.learningModePreference = 'Please select at least one learning mode';
        }
        break;
      
      case 3:
        if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
        if (!formData.guardianContactNumber.trim()) {
          newErrors.guardianContactNumber = 'Guardian contact number is required';
        }
        if (formData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail)) {
          newErrors.guardianEmail = 'Please enter a valid email address';
        }
        break;
      
      case 4:
        if (!formData.consentForDataUsage) {
          newErrors.consentForDataUsage = 'Data usage consent is required';
        }
        if (!formData.termsAndConditionsAccepted) {
          newErrors.termsAndConditionsAccepted = 'Terms and conditions must be accepted';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof StudentOnboardingData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  const handleMultiSelect = (field: keyof StudentOnboardingData, value: string) => {
    const currentValues = formData[field] as string[];
    if (currentValues.includes(value)) {
      handleInputChange(field, currentValues.filter(v => v !== value));
    } else {
      handleInputChange(field, [...currentValues, value]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Generate unique student ID
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
      const generatedUniqueId = `STU${timestamp}${randomStr}`;
      
      // Update form data with generated unique ID
      const formDataWithUniqueId = {
        ...formData,
        uniqueId: generatedUniqueId
      };
      
      console.log('🔍 Submitting form data:', formDataWithUniqueId);
      
      const formDataToSend = new FormData();
      
      // Append all form data including uniqueId
      for (const [key, value] of Object.entries(formDataWithUniqueId)) {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, String(value));
        }
      }

      console.log('🔍 FormData entries:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`🔍 ${key}:`, value);
      }

      const response = await fetch('/api/student/onboarding', {
        method: 'POST',
        body: formDataToSend,
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Success result:', result);
        setUniqueId(result.uniqueId || generatedUniqueId);
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        console.error('🔍 Error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: unknown) {
      console.error('🔍 Onboarding submission error:', error);
      console.error('🔍 Error message:', error instanceof Error ? error.message : 'Unknown error');
      alert(`Failed to submit onboarding data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
          <Image src="/jio-logo.png" alt="Jio Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
              Loading your profile...
            </h2>
          </div>
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
        </div>
        <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </main>
    );
  }

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
          <Image src="/jio-logo.png" alt="Jio Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
          <div className="mt-20 md:mt-32">
            <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
              🎉 Welcome to JioWorld! <br />
              Your onboarding is complete!
            </h2>
          </div>
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 md:mt-12" />
        </div>
        <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.successTitle}</h1>
            <p className="text-gray-600 mb-4">
              {t.successMessage}
            </p>
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold text-purple-700">{uniqueId}</p>
            </div>
            
            {/* Share Instructions */}
            <p className="text-sm text-gray-600 mb-4">
              {t.shareInstructions}
            </p>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📋</span>
                {copied ? t.copied : t.copyCode}
              </button>
              
              <button
                onClick={shareViaLink}
                className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">🔗</span>
                {t.shareLink}
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📱</span>
                {t.shareViaWhatsApp}
              </button>
              
              <button
                onClick={shareViaEmail}
                className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📧</span>
                {t.shareViaEmail}
              </button>
            </div>

            <button
              onClick={() => router.push('/dashboard/student')}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              {t.continueToDashboard}
            </button>
          </div>
        </div>
      </main>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name (Pre-filled)
        </label>
        <input
          type="text"
          value={formData.fullName}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nickname
        </label>
        <input
          type="text"
          value={formData.nickname}
          onChange={(e) => handleInputChange('nickname', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your nickname"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth *
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Age
        </label>
        <input
          type="number"
          value={formData.age}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gender *
        </label>
        <select
          value={formData.gender}
          onChange={(e) => handleInputChange('gender', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Class/Grade (Pre-filled)
        </label>
        <input
          type="text"
          value={formData.classGrade}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          School Name (Auto-filled)
        </label>
        <input
          type="text"
          value={formData.schoolName}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          School ID *
        </label>
        <input
          type="text"
          value={formData.schoolId}
          onChange={(e) => handleInputChange('schoolId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your school ID"
        />
        {errors.schoolId && <p className="text-red-500 text-sm mt-1">{errors.schoolId}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Language Preference *
        </label>
        <select
          value={formData.languagePreference}
          onChange={(e) => handleInputChange('languagePreference', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select preferred language</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.languagePreference && <p className="text-red-500 text-sm mt-1">{errors.languagePreference}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Learning Mode Preferences * (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {learningModes.map((mode) => (
            <label key={mode} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.learningModePreference.includes(mode)}
                onChange={() => handleMultiSelect('learningModePreference', mode)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-800">{mode}</span>
            </label>
          ))}
        </div>
        {errors.learningModePreference && <p className="text-red-500 text-sm mt-1">{errors.learningModePreference}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Interests Outside Class (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {interests.map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.interestsOutsideClass.includes(interest)}
                onChange={() => handleMultiSelect('interestsOutsideClass', interest)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-800">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Career Domains (Select all that apply)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {careerDomains.map((domain) => (
            <label key={domain} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.preferredCareerDomains.includes(domain)}
                onChange={() => handleMultiSelect('preferredCareerDomains', domain)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-800">{domain}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guardian Name *
        </label>
        <input
          type="text"
          value={formData.guardianName}
          onChange={(e) => handleInputChange('guardianName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter guardian's full name"
        />
        {errors.guardianName && <p className="text-red-500 text-sm mt-1">{errors.guardianName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guardian Contact Number *
        </label>
        <input
          type="tel"
          value={formData.guardianContactNumber}
          onChange={(e) => handleInputChange('guardianContactNumber', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter guardian's contact number"
        />
        {errors.guardianContactNumber && <p className="text-red-500 text-sm mt-1">{errors.guardianContactNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Guardian Email
        </label>
        <input
          type="email"
          value={formData.guardianEmail}
          onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter guardian's email (optional)"
        />
        {errors.guardianEmail && <p className="text-red-500 text-sm mt-1">{errors.guardianEmail}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location (Auto-detected)
        </label>
        <input
          type="text"
          value={formData.location}
          disabled
          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Data Usage Consent</h3>
        <p className="text-sm text-purple-700 mb-3">
          By accepting this consent, you agree to allow JioWorld Learning to collect, process, and use your learning data 
          to provide personalized educational experiences and track your progress.
        </p>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.consentForDataUsage}
            onChange={(e) => handleInputChange('consentForDataUsage', e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-purple-700">I consent to the collection and use of my learning data *</span>
        </label>
        {errors.consentForDataUsage && <p className="text-red-500 text-sm mt-1">{errors.consentForDataUsage}</p>}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
        <p className="text-sm text-gray-700 mb-3">
          Please read and accept our terms and conditions to continue using the platform.
        </p>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.termsAndConditionsAccepted}
            onChange={(e) => handleInputChange('termsAndConditionsAccepted', e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
                      <span className="text-sm text-gray-800">I accept the terms and conditions *</span>
        </label>
        {errors.termsAndConditionsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAndConditionsAccepted}</p>}
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row overflow-hidden">
      {/* 🟪 Left Section - Deep Purple Gradient */}
      <section className="w-full md:w-1/2 bg-gradient-to-br from-[#7F00FF] to-[#E100FF] px-6 py-8 text-white flex flex-col justify-between relative">
        <Image src="/jio-logo.png" alt="Jio Logo" width={48} height={48} className="absolute top-4 left-4 w-12 h-12 object-contain" />
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Complete your <br />
            student profile <br />
            and <span className="text-amber-400 font-extrabold">Unlock your<br />Learning Journey.</span>
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
          {/* Onboarding Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {t.onboardingTitle}
              </h1>
              <p className="text-gray-600 text-sm">
                {t.subtitle}
              </p>
              <div className="flex justify-center mt-4">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`w-3 h-3 rounded-full mx-1 ${
                      step === currentStep ? 'bg-[#7F00FF]' : 
                      step < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {renderCurrentStep()}

              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {t.previous}
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-[#7F00FF] text-white rounded-lg hover:bg-[#6B00E6] transition-all duration-200"
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#7F00FF] text-white rounded-lg hover:bg-[#6B00E6] disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? t.submitting : t.submit}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
} 