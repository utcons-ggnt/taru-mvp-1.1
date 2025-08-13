'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SimpleGoogleTranslate from '../components/SimpleGoogleTranslate';
import { RegistrationDataManager } from '@/lib/utils';

interface ParentOnboardingData {
  // Personal Information
  fullName: string;
  relationshipToStudent: string;
  contactNumber: string;
  alternateContactNumber: string;
  email: string;
  occupation: string;
  educationLevel: string;
  preferredLanguage: string;
  
  // Address Information
  addressLine1: string;
  addressLine2: string;
  cityVillage: string;
  state: string;
  pinCode: string;
  
  // Student Linking
  linkedStudentId: string;
  studentUniqueId: string;
  
  // Consent
  consentToAccessChildData: boolean;
  agreeToTerms: boolean;
}

const relationships = [
  'Father', 'Mother', 'Guardian', 'Other'
];

const educationLevels = [
  'Primary School', 'Secondary School', 'High School', 'Diploma', 
  'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'
];

const languageOptions = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Other'
];

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli',
  'Daman and Diu', 'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands'
];

export default function ParentOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState<ParentOnboardingData>({
    fullName: '',
    relationshipToStudent: '',
    contactNumber: '',
    alternateContactNumber: '',
    email: '',
    occupation: '',
    educationLevel: '',
    preferredLanguage: '',
    addressLine1: '',
    addressLine2: '',
    cityVillage: '',
    state: '',
    pinCode: '',
    linkedStudentId: '',
    studentUniqueId: '',
    consentToAccessChildData: false,
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string; name: string; email: string}>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const router = useRouter();

  // Fetch available students for linking and pre-fill form data
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const response = await fetch('/api/students/available');
        if (response.ok) {
          const data = await response.json();
          setAvailableStudents(data.students || []);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    const fetchUserAndRegistrationData = async () => {
      try {
        // Get user data from API
        const userResponse = await fetch('/api/auth/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user = userData.user;
          
          // Get registration data using utility function
          const registrationData = RegistrationDataManager.getRegistrationData();
          
          // Pre-fill form with existing data and registration data
          setFormData(prev => ({
            ...prev,
            fullName: user.name || registrationData?.fullName || '',
            email: user.email || registrationData?.email || '',
            preferredLanguage: user.profile?.language || registrationData?.language || '',
            // Try to link student if student ID was provided during registration
            linkedStudentId: registrationData?.classGrade || '', // classGrade contains student ID for parents
            studentUniqueId: registrationData?.classGrade || '',
          }));
          
          console.log('🔍 Pre-filled parent form data:', {
            userData: user,
            registrationData: registrationData
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchStudents();
    fetchUserAndRegistrationData();
  }, []);

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.relationshipToStudent) newErrors.relationshipToStudent = 'Relationship to student is required';
        if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
          newErrors.contactNumber = 'Contact number must be 10 digits';
        }
        if (formData.alternateContactNumber && !/^\d{10}$/.test(formData.alternateContactNumber)) {
          newErrors.alternateContactNumber = 'Alternate contact number must be 10 digits';
        }
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.occupation.trim()) newErrors.occupation = 'Occupation is required';
        if (!formData.educationLevel) newErrors.educationLevel = 'Education level is required';
        if (!formData.preferredLanguage) newErrors.preferredLanguage = 'Preferred language is required';
        break;
      
      case 2:
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
        if (!formData.cityVillage.trim()) newErrors.cityVillage = 'City/Village is required';
        if (!formData.state) newErrors.state = 'State is required';
        if (!formData.pinCode.trim()) newErrors.pinCode = 'Pin code is required';
        if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
          newErrors.pinCode = 'Pin code must be 6 digits';
        }
        break;
      
      case 3:
        if (!formData.linkedStudentId) newErrors.linkedStudentId = 'Please select a student to link';
        if (!formData.studentUniqueId.trim()) newErrors.studentUniqueId = 'Student unique ID is required';
        break;
      
      case 4:
        if (!formData.consentToAccessChildData) {
          newErrors.consentToAccessChildData = 'Consent to access child\'s learning data is required';
        }
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to platform terms & policies';
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

  const handleInputChange = (field: keyof ParentOnboardingData, value: string | boolean) => {
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

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/parent/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSuccess(true);
        
        // Clear registration data after successful onboarding
        RegistrationDataManager.clearRegistrationData();
        
        setTimeout(() => {
          router.push('/dashboard/parent');
        }, 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit onboarding data');
      }
    } catch (error: unknown) {
      console.error('Onboarding submission error:', error);
      alert('Failed to submit onboarding data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
        <div className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative">
          <Image src="/icons/logo.svg" alt="Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Complete!</h1>
            <p className="text-gray-600 mb-6">
              You can now monitor your child&apos;s learning progress
            </p>
            <button
              onClick={() => router.push('/dashboard/parent')}
              className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Continue to Dashboard
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
          Full Name *
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => handleInputChange('fullName', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your full name"
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship to Student *
        </label>
        <select
          value={formData.relationshipToStudent}
          onChange={(e) => handleInputChange('relationshipToStudent', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select relationship</option>
          {relationships.map((rel) => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
        {errors.relationshipToStudent && <p className="text-red-500 text-sm mt-1">{errors.relationshipToStudent}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact Number *
        </label>
        <input
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your contact number"
        />
        {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alternate Contact Number
        </label>
        <input
          type="tel"
          value={formData.alternateContactNumber}
          onChange={(e) => handleInputChange('alternateContactNumber', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter alternate contact number (optional)"
        />
        {errors.alternateContactNumber && <p className="text-red-500 text-sm mt-1">{errors.alternateContactNumber}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your email (optional)"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation *
        </label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your occupation"
        />
        {errors.occupation && <p className="text-red-500 text-sm mt-1">{errors.occupation}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Education Level *
        </label>
        <select
          value={formData.educationLevel}
          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select education level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.educationLevel && <p className="text-red-500 text-sm mt-1">{errors.educationLevel}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Language *
        </label>
        <select
          value={formData.preferredLanguage}
          onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select preferred language</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.preferredLanguage && <p className="text-red-500 text-sm mt-1">{errors.preferredLanguage}</p>}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 1 *
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your address"
        />
        {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address Line 2
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter additional address details (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          City/Village *
        </label>
        <input
          type="text"
          value={formData.cityVillage}
          onChange={(e) => handleInputChange('cityVillage', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your city or village"
        />
        {errors.cityVillage && <p className="text-red-500 text-sm mt-1">{errors.cityVillage}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          State *
        </label>
        <select
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pin Code *
        </label>
        <input
          type="text"
          value={formData.pinCode}
          onChange={(e) => handleInputChange('pinCode', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter your pin code"
        />
        {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link with Student *
        </label>
        <select
          value={formData.linkedStudentId}
          onChange={(e) => handleInputChange('linkedStudentId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          <option value="">Select a student</option>
          {isLoadingStudents ? (
            <option value="">Loading students...</option>
          ) : availableStudents.length === 0 ? (
            <option value="">No students found</option>
          ) : (
            availableStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.email}
              </option>
            ))
          )}
        </select>
        {errors.linkedStudentId && <p className="text-red-500 text-sm mt-1">{errors.linkedStudentId}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Student Unique ID *
        </label>
        <input
          type="text"
          value={formData.studentUniqueId}
          onChange={(e) => handleInputChange('studentUniqueId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
          placeholder="Enter student's unique ID"
        />
        {errors.studentUniqueId && <p className="text-red-500 text-sm mt-1">{errors.studentUniqueId}</p>}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-800 mb-2">Data Access Consent</h3>
        <p className="text-sm text-purple-700 mb-3">
          By accepting this consent, you agree to access your child&apos;s learning data 
          to monitor their progress and provide support in their educational journey.
        </p>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.consentToAccessChildData}
            onChange={(e) => handleInputChange('consentToAccessChildData', e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-purple-700">I consent to access my child&apos;s learning data *</span>
        </label>
        {errors.consentToAccessChildData && <p className="text-red-500 text-sm mt-1">{errors.consentToAccessChildData}</p>}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Terms and Conditions</h3>
        <p className="text-sm text-gray-700 mb-3">
          Please read and accept our terms and conditions to continue using the platform.
        </p>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-700">I agree to platform terms &amp; policies *</span>
        </label>
        {errors.agreeToTerms && <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms}</p>}
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
        <Image src="/icons/logo.svg" alt="Logo" width={48} height={48} className="absolute top-4 left-4 w-12 h-12 object-contain" />
        <div className="mt-16">
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Complete your <br />
            parent profile <br />
            and <span className="text-amber-400 font-extrabold">Monitor your<br />Child&apos;s Progress.</span>
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
        {/* Google Translate */}
        <div className="absolute top-6 right-6 z-20">
                      <SimpleGoogleTranslate className="text-white" buttonText="Translate" showIcon={true} />
        </div>

        <div className="max-w-md mx-auto w-full">
          {/* Onboarding Form Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Parent Onboarding
              </h1>
              <p className="text-gray-600 text-sm">
                Complete your profile to monitor your child&apos;s progress
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
                  Previous
                </button>
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-[#7F00FF] text-white rounded-lg hover:bg-[#6B00E6] transition-all duration-200"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-[#7F00FF] text-white rounded-lg hover:bg-[#6B00E6] disabled:opacity-50 transition-all duration-200"
                  >
                    {isSubmitting ? 'Submitting...' : 'Complete Onboarding'}
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