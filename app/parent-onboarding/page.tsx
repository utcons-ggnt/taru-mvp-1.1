'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RegistrationDataManager } from '@/lib/utils';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';
import { FloatingParticles, MorphingBlob } from '../components/FloatingElements';
import { ScrollProgress } from '../components/ScrollAnimations';

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
  const [availableStudents, setAvailableStudents] = useState<Array<{id: string; uniqueId: string; name: string; email: string; grade: string}>>([]);
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
        if (!formData.relationshipToStudent) newErrors.relationshipToStudent = 'Relationship to student is required';
        if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
          newErrors.contactNumber = 'Contact number must be 10 digits';
        }
        if (formData.alternateContactNumber && !/^\d{10}$/.test(formData.alternateContactNumber)) {
          newErrors.alternateContactNumber = 'Alternate contact number must be 10 digits';
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
        
        // Validate that the unique ID matches the selected student
        if (formData.linkedStudentId && formData.studentUniqueId) {
          const selectedStudent = availableStudents.find(student => student.id === formData.linkedStudentId);
          if (selectedStudent && selectedStudent.uniqueId !== formData.studentUniqueId) {
            newErrors.studentUniqueId = 'Student unique ID does not match the selected student';
          }
        }
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-populate student unique ID when student is selected
      if (field === 'linkedStudentId' && typeof value === 'string') {
        const selectedStudent = availableStudents.find(student => student.id === value);
        if (selectedStudent) {
          newData.studentUniqueId = selectedStudent.uniqueId;
        }
      }
      
      return newData;
    });
    
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
      console.log('📤 Submitting parent onboarding data:', {
        fullName: formData.fullName,
        relationshipToStudent: formData.relationshipToStudent,
        contactNumber: formData.contactNumber,
        occupation: formData.occupation,
        educationLevel: formData.educationLevel,
        preferredLanguage: formData.preferredLanguage,
        addressLine1: formData.addressLine1,
        cityVillage: formData.cityVillage,
        state: formData.state,
        pinCode: formData.pinCode,
        linkedStudentId: formData.linkedStudentId,
        studentUniqueId: formData.studentUniqueId,
        consentToAccessChildData: formData.consentToAccessChildData,
        agreeToTerms: formData.agreeToTerms
      });

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
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.error || 'Failed to submit onboarding data');
      }
    } catch (error: unknown) {
      console.error('❌ Onboarding submission error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      alert('Failed to submit onboarding data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.main 
        className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Enhanced Floating Background Elements */}
        <FloatingParticles 
          count={20} 
          colors={['#6D18CE', '#8B5CF6', '#A855F7', '#C084FC', '#EC4899', '#F59E0B']}
          className="z-0"
        />
        <MorphingBlob 
          className="top-20 right-10 z-0" 
          color="#8B5CF6" 
          size={300} 
        />
        <MorphingBlob 
          className="bottom-20 left-10 z-0" 
          color="#A855F7" 
          size={200} 
        />
        
        {/* Scroll Progress Indicator */}
        <ScrollProgress 
          color="linear-gradient(90deg, #6D18CE, #8B5CF6, #A855F7)"
          height="3px"
          className="shadow-lg z-50"
        />
        
        <motion.div 
          className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative overflow-hidden"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #FFFFFF 2px, transparent 2px),
                               radial-gradient(circle at 75% 75%, #FFFFFF 2px, transparent 2px)`,
              backgroundSize: '50px 50px, 80px 80px'
            }} />
          </div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Image src="/icons/logo.svg" alt="Logo" width={56} height={56} className="absolute top-4 left-4 w-14 h-14 object-contain" />
          </motion.div>
          
          <motion.div 
            className="mt-20 md:mt-32 relative z-10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold leading-snug md:leading-snug px-2 md:px-10">
              🎉 Welcome to Taru! <br />
              Your onboarding is complete!
            </h2>
            <motion.p 
              className="text-lg text-purple-100 mt-4 px-2 md:px-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              You're all set to monitor your child's learning journey!
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 md:mt-12 relative z-10" />
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="w-full md:w-1/2 bg-white px-4 sm:px-8 py-10 flex flex-col justify-center relative"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="max-w-md mx-auto w-full text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6, type: "spring", stiffness: 200 }}
            >
              <motion.span 
                className="text-3xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                ✅
              </motion.span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Onboarding Complete!
            </motion.h1>
            
            <motion.p 
              className="text-gray-600 mb-8 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              You can now monitor your child&apos;s learning progress and achievements
            </motion.p>
            
            <motion.button
              onClick={() => router.push('/dashboard/parent')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Continue to Dashboard
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.main>
    );
  }

  const renderStep1 = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Relationship to Student *
        </label>
        <select
          value={formData.relationshipToStudent}
          onChange={(e) => handleInputChange('relationshipToStudent', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <option value="">Select relationship</option>
          {relationships.map((rel) => (
            <option key={rel} value={rel}>{rel}</option>
          ))}
        </select>
        {errors.relationshipToStudent && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.relationshipToStudent}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Contact Number *
        </label>
        <input
          type="tel"
          value={formData.contactNumber}
          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter your contact number"
        />
        {errors.contactNumber && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.contactNumber}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Alternate Contact Number
        </label>
        <input
          type="tel"
          value={formData.alternateContactNumber}
          onChange={(e) => handleInputChange('alternateContactNumber', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter alternate contact number (optional)"
        />
        {errors.alternateContactNumber && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.alternateContactNumber}</motion.p>}
      </motion.div>


      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Occupation *
        </label>
        <input
          type="text"
          value={formData.occupation}
          onChange={(e) => handleInputChange('occupation', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter your occupation"
        />
        {errors.occupation && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.occupation}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Education Level *
        </label>
        <select
          value={formData.educationLevel}
          onChange={(e) => handleInputChange('educationLevel', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <option value="">Select education level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
        {errors.educationLevel && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.educationLevel}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Preferred Language *
        </label>
        <select
          value={formData.preferredLanguage}
          onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <option value="">Select preferred language</option>
          {languageOptions.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.preferredLanguage && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.preferredLanguage}</motion.p>}
      </motion.div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Address Line 1 *
        </label>
        <input
          type="text"
          value={formData.addressLine1}
          onChange={(e) => handleInputChange('addressLine1', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter your address"
        />
        {errors.addressLine1 && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.addressLine1}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Address Line 2
        </label>
        <input
          type="text"
          value={formData.addressLine2}
          onChange={(e) => handleInputChange('addressLine2', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter additional address details (optional)"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          City/Village *
        </label>
        <input
          type="text"
          value={formData.cityVillage}
          onChange={(e) => handleInputChange('cityVillage', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter your city or village"
        />
        {errors.cityVillage && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.cityVillage}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          State *
        </label>
        <select
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <option value="">Select state</option>
          {states.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {errors.state && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.state}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Pin Code *
        </label>
        <input
          type="text"
          value={formData.pinCode}
          onChange={(e) => handleInputChange('pinCode', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Enter your pin code"
        />
        {errors.pinCode && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.pinCode}</motion.p>}
      </motion.div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Information Card */}
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">ℹ️</span>
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">Student Linking</h4>
            <p className="text-xs text-blue-700">
              Select your child from the list below. The unique ID will be automatically filled. 
              This links your parent account to your child's learning progress.
            </p>
          </div>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Link with Student *
        </label>
        <select
          value={formData.linkedStudentId}
          onChange={(e) => handleInputChange('linkedStudentId', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
        >
          <option value="">Select a student</option>
          {isLoadingStudents ? (
            <option value="">Loading students...</option>
          ) : availableStudents.length === 0 ? (
            <option value="">No students found</option>
          ) : (
            availableStudents.map(student => (
              <option key={student.id} value={student.id}>
                {student.name} - {student.email} (ID: {student.uniqueId})
              </option>
            ))
          )}
        </select>
        {errors.linkedStudentId && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.linkedStudentId}</motion.p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <label className="block text-sm font-bold text-gray-700 mb-3">
          Student Unique ID *
        </label>
        <input
          type="text"
          value={formData.studentUniqueId}
          onChange={(e) => handleInputChange('studentUniqueId', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 bg-gray-50/80 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md"
          placeholder="Student unique ID (auto-filled when student is selected)"
          readOnly={!!formData.linkedStudentId}
        />
        {errors.studentUniqueId && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.studentUniqueId}</motion.p>}
      </motion.div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.div 
        className="bg-purple-50 border border-purple-200 rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-purple-800 mb-3">Data Access Consent</h3>
        <p className="text-sm text-purple-700 mb-4">
          By accepting this consent, you agree to access your child&apos;s learning data 
          to monitor their progress and provide support in their educational journey.
        </p>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.consentToAccessChildData}
            onChange={(e) => handleInputChange('consentToAccessChildData', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-purple-700">I consent to access my child&apos;s learning data *</span>
        </label>
        {errors.consentToAccessChildData && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.consentToAccessChildData}</motion.p>}
      </motion.div>

      <motion.div 
        className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Terms and Conditions</h3>
        <p className="text-sm text-gray-700 mb-4">
          Please read and accept our terms and conditions to continue using the platform.
        </p>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-gray-700">I agree to platform terms &amp; policies *</span>
        </label>
        {errors.agreeToTerms && <motion.p 
          className="text-red-500 text-sm mt-2 font-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >{errors.agreeToTerms}</motion.p>}
      </motion.div>
    </motion.div>
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
    <motion.main 
      className="min-h-screen flex flex-col md:flex-row overflow-hidden relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Floating Background Elements */}
      <FloatingParticles 
        count={25} 
        colors={['#6D18CE', '#8B5CF6', '#A855F7', '#C084FC', '#EC4899', '#F59E0B']}
        className="z-0"
      />
      <MorphingBlob 
        className="top-20 right-10 z-0" 
        color="#8B5CF6" 
        size={400} 
      />
      <MorphingBlob 
        className="bottom-20 left-10 z-0" 
        color="#A855F7" 
        size={300} 
      />
      
      {/* Scroll Progress Indicator */}
      <ScrollProgress 
        color="linear-gradient(90deg, #6D18CE, #8B5CF6, #A855F7)"
        height="3px"
        className="shadow-lg z-50"
      />
      
      {/* 🟪 Left Section - Enhanced Deep Purple Gradient */}
      <motion.section 
        className="w-full md:w-1/2 bg-gradient-to-br from-purple-700 via-purple-600 to-purple-500 px-6 py-8 text-white flex flex-col justify-between relative overflow-hidden"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #FFFFFF 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, #FFFFFF 2px, transparent 2px)`,
            backgroundSize: '50px 50px, 80px 80px'
          }} />
        </div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Image src="/icons/logo.svg" alt="Logo" width={48} height={48} className="absolute top-4 left-4 w-12 h-12 object-contain" />
        </motion.div>
        
        <motion.div 
          className="mt-16 relative z-10"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold leading-tight">
            Complete your <br />
            parent profile <br />
            and <span className="text-amber-400 font-extrabold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Monitor your<br />Child&apos;s Progress.</span>
          </h2>
          <motion.p 
            className="text-lg text-purple-100 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Track achievements, monitor progress, and support your child's learning journey
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Image src="/landingPage.png" alt="Mascot" width={224} height={256} className="w-56 md:w-64 mx-auto mt-8 relative z-10" />
        </motion.div>
      </motion.section>

      {/* ⬜ Right Section - Enhanced White with Grid */}
      <motion.section 
        className="w-full md:w-1/2 bg-white px-6 py-8 flex flex-col justify-center relative overflow-hidden"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      >
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-pink-50/20 to-blue-50/30 pointer-events-none" />
        <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-2xl" />
        
        {/* Google Translate */}
        <div className="absolute top-6 right-6 z-20">
        </div>

        <motion.div 
          className="max-w-md mx-auto w-full"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Enhanced Onboarding Form Container */}
          <motion.div 
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200/50 relative overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-blue-50/50 pointer-events-none" />
            
            <motion.div 
              className="text-center mb-6 relative z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Parent Onboarding
              </h1>
              <p className="text-gray-600 text-lg">
                Complete your profile to monitor your child&apos;s progress
              </p>
              
              <motion.div 
                className="flex justify-center mt-6 space-x-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
                {[
                  { step: 1, label: 'Personal Info' },
                  { step: 2, label: 'Address' },
                  { step: 3, label: 'Link Student' },
                  { step: 4, label: 'Consent' }
                ].map(({ step, label }, index) => (
                  <motion.div 
                    key={step} 
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2 + index * 0.1 }}
                  >
                    <motion.div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg transition-all duration-300 ${
                        currentStep >= step 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {step}
                    </motion.div>
                    <span className="text-xs text-gray-500 mt-2 font-medium">{label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

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
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.main>
  );
} 