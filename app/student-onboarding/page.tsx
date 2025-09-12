'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { RegistrationDataManager } from '@/lib/utils';
import { StudentKeyGenerator } from '@/lib/studentKeyGenerator';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';



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
  const [autoFilledFields, setAutoFilledFields] = useState<{[key: string]: boolean}>({});
  const router = useRouter();



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
    const message = `Hi! My Taru Learning student ID is: ${uniqueId}. Please use this ID to link your parent account.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = 'My Taru Learning Student ID';
    const body = `Hi! My Taru Learning student ID is: ${uniqueId}. Please use this ID to link your parent account.`;
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  const shareViaLink = () => {
    const shareUrl = `${window.location.origin}/register?role=parent&studentId=${uniqueId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Taru Learning Student ID',
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

  // Fetch existing user data and registration data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          const user = userData.user;
          
          // Get registration data using utility function
          const registrationData = RegistrationDataManager.getRegistrationData();
          
          // Pre-fill form with existing data and registration data
          const newFormData = {
            ...formData,
            fullName: user.name || registrationData?.fullName || '',
            classGrade: user.profile?.grade || registrationData?.classGrade || '',
            languagePreference: user.profile?.language || registrationData?.language || '',
            location: user.profile?.location || registrationData?.location || '',
            guardianName: user.profile?.guardianName || registrationData?.guardianName || '',
            guardianEmail: registrationData?.email || '',
            // Age will be calculated from date of birth
            // Keep other fields empty for user to fill
          };
          
          setFormData(newFormData);
          
          // Track which fields were auto-filled
          const autoFilled: {[key: string]: boolean} = {};
          if (registrationData?.fullName) autoFilled.fullName = true;
          if (registrationData?.classGrade) autoFilled.classGrade = true;
          if (registrationData?.language) autoFilled.languagePreference = true;
          if (registrationData?.location) autoFilled.location = true;
          if (registrationData?.guardianName) autoFilled.guardianName = true;
          if (registrationData?.email) autoFilled.guardianEmail = true;
          
          setAutoFilledFields(autoFilled);
          
          console.log('🔍 Pre-filled form data:', {
            userData: user,
            registrationData: registrationData,
            autoFilledFields: autoFilled
          });
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
        // Basic info and guardian info validation
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
        if (!formData.languagePreference) newErrors.languagePreference = 'Language preference is required';
        if (!formData.schoolId.trim()) newErrors.schoolId = 'School ID is required';
        if (formData.learningModePreference.length === 0) {
          newErrors.learningModePreference = 'Please select at least one learning mode';
        }
        break;
      
      case 2:
        if (!formData.guardianContactNumber.trim()) {
          newErrors.guardianContactNumber = 'Guardian contact number is required';
        }
        if (formData.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guardianEmail)) {
          newErrors.guardianEmail = 'Please enter a valid email address';
        }
        break;
      
      case 3:
        // Privacy and consent validation
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
      setCurrentStep(prev => Math.min(prev + 1, 3));
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
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Generate unique student ID using centralized generator
      const generatedUniqueId = StudentKeyGenerator.generate();
      
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
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()));
      console.log('🔍 Response url:', response.url);

      if (response.ok) {
        const result = await response.json();
        console.log('🔍 Success result:', result);
        setUniqueId(result.uniqueId || generatedUniqueId);
        setIsSuccess(true);
        
        // Clear registration data after successful onboarding
        RegistrationDataManager.clearRegistrationData();
        
        // Auto-redirect to interest assessment after 3 seconds
        setTimeout(() => {
          router.push('/interest-assessment');
        }, 3000);
      } else {
        let errorData: any = {};
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const responseText = await response.text();
          console.error('🔍 Error response text:', responseText);
          
          if (responseText && responseText.trim() !== '') {
            try {
              errorData = JSON.parse(responseText);
              console.error('🔍 Parsed error response:', errorData);
            } catch (parseError) {
              console.error('🔍 Failed to parse error response as JSON:', parseError);
              errorData = { error: responseText };
            }
          } else {
            console.error('🔍 Empty error response received');
            errorData = { error: 'Empty response from server' };
          }
          
          // Extract error message with fallbacks
          errorMessage = errorData?.error || 
                        errorData?.message || 
                        errorData?.details || 
                        (typeof errorData === 'string' ? errorData : '') ||
                        `Server error (${response.status})`;
                        
        } catch (responseError) {
          console.error('🔍 Failed to read error response:', responseError);
          errorMessage = `Failed to read server response (${response.status})`;
        }
        
        console.error('🔍 Final error message:', errorMessage);
        throw new Error(errorMessage);
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
      <ConsistentLoadingPage
        type="general"
        title="Loading Profile"
        subtitle="Setting up your personalized learning profile..."
        tips={[
          'Loading your registration data',
          'Preparing your student profile',
          'Setting up your learning preferences'
        ]}
      />
    );
  }


  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-[#8B3DFF] to-[#6D18CE] px-6 py-8 text-white flex flex-col relative">
                  <Image src="/icons/logo.svg" alt="Logo" width={60} height={60} className="w-15 h-15 object-contain mb-8" />
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 px-4">
            Welcome to <span className="text-white/90">Taru!</span>
          </h1>
          <p className="text-xl px-4 text-white/80">Your onboarding is complete!</p>
        </div>
        </div>
        <div className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Complete!</h1>
            <p className="text-gray-600 mb-4">
              Your unique student ID is
            </p>
            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold text-purple-700">{uniqueId}</p>
            </div>
            
            {/* Share Instructions */}
            <p className="text-sm text-gray-600 mb-4">
              Share this ID with your parent to link their account
            </p>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📋</span>
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
              
              <button
                onClick={shareViaLink}
                className="flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">🔗</span>
                Share Link
              </button>
            </div>

            {/* Social Share Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📱</span>
                Share via WhatsApp
              </button>
              
              <button
                onClick={shareViaEmail}
                className="flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <span className="text-lg">📧</span>
                Share via Email
              </button>
            </div>

            {/* Redirect Message */}
            <div className="text-center mb-4">
              <p className="text-gray-600 text-sm">
                Redirecting to interest assessment in 3 seconds...
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/interest-assessment')}
                className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Take Interest Assessment Now
              </button>
              <button
                onClick={() => router.push('/dashboard/student')}
                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          Full Name
          {autoFilledFields.fullName && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Auto-filled from registration
            </span>
          )}
        </label>
        <input
          type="text"
          value={formData.fullName}
          disabled
          className={`w-full px-4 py-2 border rounded-lg ${
            autoFilledFields.fullName 
              ? 'border-green-300 bg-green-50 text-green-700' 
              : 'border-gray-300 bg-gray-50 text-gray-500'
          }`}
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
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          Class/Grade
          {autoFilledFields.classGrade && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Auto-filled from registration
            </span>
          )}
        </label>
        <input
          type="text"
          value={formData.classGrade}
          disabled
          className={`w-full px-4 py-2 border rounded-lg ${
            autoFilledFields.classGrade 
              ? 'border-green-300 bg-green-50 text-green-700' 
              : 'border-gray-300 bg-gray-50 text-gray-500'
          }`}
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
          By accepting this consent, you agree to allow Taru Learning to collect, process, and use your learning data 
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
      {/* 🟪 Left Section - Students Details */}
      <section className="w-full md:w-1/2 bg-gradient-to-br from-[#8B3DFF] to-[#6D18CE] px-6 py-8 text-white flex flex-col relative">
        <Image src="/icons/logo.svg" alt="Logo" width={60} height={60} className="w-15 h-15 object-contain mb-8" />
        
        <div className="flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-12 px-4">
            Students <span className="text-white/90">Details</span>
          </h1>
          
          {/* Progress Steps */}
          <div className="px-4 space-y-6">
            {[
              { step: 1, label: 'Personal Information', description: 'Basic details about you' },
              { step: 2, label: 'Learning Preferences', description: 'How you like to learn' },
              { step: 3, label: 'Guardian Details', description: 'Parent/Guardian information' },
              { step: 4, label: 'Consent & Terms', description: 'Agreements and permissions' }
            ].map(({ step, label, description }) => (
              <div key={step} className="flex items-start">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    step === currentStep 
                      ? 'bg-white text-purple-600' 
                      : step < currentStep 
                        ? 'bg-white/80 text-purple-600' 
                        : 'bg-white/20 text-white/60'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-px h-8 mt-4 ${
                      step < currentStep ? 'bg-white/80' : 'bg-white/20'
                    }`} />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className={`text-sm font-semibold ${
                    step === currentStep 
                      ? 'text-white' 
                      : step < currentStep 
                        ? 'text-white/90' 
                        : 'text-white/60'
                  }`}>
                    {label}
                  </h3>
                  <p className={`text-xs mt-1 ${
                    step === currentStep 
                      ? 'text-white/80' 
                      : step < currentStep 
                        ? 'text-white/70' 
                        : 'text-white/50'
                  }`}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⬜ Right Section - Getting to Know You */}
      <section className="w-full md:w-1/2 bg-white px-8 py-8 flex flex-col relative">


        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8 relative">
            <div className="absolute top-0 right-0">
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Getting to Know You
              </h1>
          </div>

          {/* Form Content */}
          <div className="space-y-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold text-purple-600 mb-6">Basic Info</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      value={formData.fullName}
                      disabled
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.guardianName}
                      onChange={(e) => handleInputChange('guardianName', e.target.value)}
                      placeholder="Guardian Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                    {errors.guardianName && <p className="text-red-500 text-sm mt-1">{errors.guardianName}</p>}
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                    {!formData.dateOfBirth && (
                      <div className="absolute inset-0 flex items-center px-4 pointer-events-none text-gray-400">
                        dd/mm/yyyy
                      </div>
                    )}
                    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                  </div>
                  <div>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="Location / City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                  </div>
                  <div>
                    <select
                      value={formData.languagePreference}
                      onChange={(e) => handleInputChange('languagePreference', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    >
                      <option value="">Language</option>
                      {languageOptions.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                    {errors.languagePreference && <p className="text-red-500 text-sm mt-1">{errors.languagePreference}</p>}
              </div>
            </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-purple-600 mb-6">School & Learning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <select
                        value={formData.classGrade}
                        onChange={(e) => handleInputChange('classGrade', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      >
                        <option value="">Select Grade</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.schoolName}
                        onChange={(e) => handleInputChange('schoolName', e.target.value)}
                        placeholder="School Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.schoolId}
                        onChange={(e) => handleInputChange('schoolId', e.target.value)}
                        placeholder="School ID"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      />
                      {errors.schoolId && <p className="text-red-500 text-sm mt-1">{errors.schoolId}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.interestsOutsideClass.join(', ')}
                        onChange={(e) => handleInputChange('interestsOutsideClass', e.target.value.split(', ').filter(i => i.trim()))}
                        placeholder="Favourite Subjects"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={formData.learningModePreference.join(', ')}
                        onChange={(e) => handleInputChange('learningModePreference', e.target.value.split(', ').filter(i => i.trim()))}
                        placeholder="Preferred Learning Style (Games, Stories, Videos)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                      />
                      {errors.learningModePreference && <p className="text-red-500 text-sm mt-1">{errors.learningModePreference}</p>}
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-[#8B3DFF] to-[#6D18CE] text-white px-12 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Explore your Strengths
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold text-purple-600 mb-6">Guardian Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <input
                      type="tel"
                      value={formData.guardianContactNumber}
                      onChange={(e) => handleInputChange('guardianContactNumber', e.target.value)}
                      placeholder="Guardian Contact Number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                    {errors.guardianContactNumber && <p className="text-red-500 text-sm mt-1">{errors.guardianContactNumber}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => handleInputChange('guardianEmail', e.target.value)}
                      placeholder="Guardian Email (Optional)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                    />
                    {errors.guardianEmail && <p className="text-red-500 text-sm mt-1">{errors.guardianEmail}</p>}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold text-purple-600 mb-6">Privacy & Consent</h2>
            <div className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Data Usage Consent</h3>
                    <p className="text-sm text-purple-700 mb-3">
                      By accepting this consent, you agree to allow Taru Learning to collect, process, and use your learning data 
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
              </div>
            )}

            {currentStep > 1 && (
              <div className="flex justify-between pt-4">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-gradient-to-r from-[#8B3DFF] to-[#6D18CE] text-white rounded-lg hover:shadow-lg transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-[#8B3DFF] to-[#6D18CE] text-white rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
} 