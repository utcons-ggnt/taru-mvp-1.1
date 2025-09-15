'use client';


import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNavigationWithState } from '@/lib/hooks/useNavigationWithState';
import { useCareerState } from '@/lib/hooks/useCareerState';
import { useEnhancedSession } from '@/lib/hooks/useEnhancedSession';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

interface Chapter {
  title: string;
}

interface Submodule {
  title: string;
  description: string;
  chapters: Chapter[];
}

interface LearningModule {
  module: string;
  description: string;
  submodules?: Submodule[];
}

interface CareerDetails {
  _id?: { $oid: string };
  uniqueid?: string;
  output?: {
    greeting: string;
    overview: string[];
    timeRequired: string;
    focusAreas: string[];
    learningPath: LearningModule[];
    finalTip: string;
  };
}

function CareerDetailsContent() {
  const [careerDetails, setCareerDetails] = useState<CareerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
  const [userInfo, setUserInfo] = useState<{
    name: string;
    id: string;
    avatar: string;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasFetchedCareerDetails, setHasFetchedCareerDetails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedPathId, setSavedPathId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerPath = searchParams.get('careerPath');
  const description = searchParams.get('description');

  useEffect(() => {
    // Track mouse position for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const toggleModule = (index: number) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedModules(newExpanded);
  };

  const saveLearningPath = async () => {
    if (!careerDetails || !careerPath) {
      setSaveError('No career details or path to save');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/learning-paths/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          careerDetails: careerDetails,
          careerPath: careerPath
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Learning path saved successfully:', result.pathId);
        setIsSaved(true);
        setSavedPathId(result.pathId);
        
        // Show success message for 3 seconds before navigating
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 3000);
      } else {
        console.error('❌ Failed to save learning path:', result.error);
        setSaveError(result.error || 'Failed to save learning path');
      }
    } catch (error) {
      console.error('❌ Error saving learning path:', error);
      setSaveError('Network error while saving learning path');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      // First try to get user info from session data
      if (sessionData?.student) {
        const student = sessionData.student;
        setUserInfo({
          name: student.name || student.firstName || 'Student',
          id: student.studentId || student.uniqueId || '0000',
          avatar: student.name?.charAt(0) || student.firstName?.charAt(0) || 'S'
        });
        return;
      }

      // If no session data, try API call
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user) {
          setUserInfo({
            name: userData.user.name || userData.user.firstName || 'User',
            id: userData.user.studentId || userData.user.id || '0000',
            avatar: userData.user.avatar || userData.user.profilePicture || userData.user.name?.charAt(0) || 'U'
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      // Set fallback user info
      setUserInfo({
        name: 'Student',
        id: '0000',
        avatar: 'S'
      });
    }
  };
  
  // Session management hooks
  const { navigateWithState, loadPageState, savePageState } = useNavigationWithState();
  const { state: careerState, addCareerPath, selectCareerPath } = useCareerState();
  const { 
    sessionData, 
    isLoading: sessionLoading, 
    isInitialized: sessionInitialized,
    getCareerPathData,
    migrateExistingData 
  } = useEnhancedSession();

  // Note: All data is now dynamically generated from N8N API

  const fetchCareerDetails = async () => {
    if (hasFetchedCareerDetails) {
      console.log('🔍 Career details already fetched, skipping...');
      return;
    }
    
    try {
      console.log('🔍 Fetching career details for:', { careerPath, description });
      setHasFetchedCareerDetails(true);
      setLoading(true);
      const response = await fetch('/api/career-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ careerPath, description }),
      });
      
      console.log('🔍 Career details API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Career details data:', data);
        
        if (data.success && data.careerDetails) {
          // Validate the career details structure
          const careerData = data.careerDetails;
          console.log('🔍 Career data structure:', careerData);
          console.log('🔍 Career data output:', careerData.output);
          console.log('🔍 Overview array:', careerData.output?.overview);
          console.log('🔍 Focus areas array:', careerData.output?.focusAreas);
          console.log('🔍 Learning path array:', careerData.output?.learningPath);
          
          if (careerData.output && typeof careerData.output === 'object') {
            // Data is in the correct format: { output: {...}, uniqueid: "..." }
            setCareerDetails(careerData);
            
            // Save to career state and page state
            await selectCareerPath(careerPath || '', careerData);
            await savePageState(window.location.pathname, { careerDetails: careerData });
          } else if (careerData && typeof careerData === 'object' && !careerData.output) {
            // Data might be directly the output object
            console.log('🔍 Treating careerData as direct output object');
            const formattedData = { output: careerData, uniqueid: 'unknown' };
            setCareerDetails(formattedData);
            
            // Save to career state and page state
            await selectCareerPath(careerPath || '', formattedData);
            await savePageState(window.location.pathname, { careerDetails: formattedData });
          } else {
            console.error('Invalid career details structure:', careerData);
            setError('Invalid career details format received from server');
          }
        } else {
          console.error('No career details in response:', data);
          setError(data.error || 'Failed to load career details');
        }
      } else {
        let errorMessage = 'Failed to load career details';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        console.error('Failed to fetch career details:', response.status, errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching career details:', err);
      setError('Failed to load career details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      console.log('🔍 Career details page initializing...', { careerPath, sessionInitialized });
      
      // Fetch user info first
      await fetchUserInfo();
      
      // If we have a career path, always try to fetch details (this ensures webhook is called)
      if (careerPath) {
        console.log('🔍 Career path found, fetching career details...');
        await fetchCareerDetails();
        return;
      }

      // Wait for session to initialize only if no career path
      if (!sessionInitialized) {
        console.log('🔍 Waiting for session to initialize...');
        return;
      }

      // Try to load saved state first
      const savedState = await loadPageState(window.location.pathname);
      if (savedState && savedState.careerDetails) {
        console.log('🔍 Loading saved career details...');
        setCareerDetails(savedState.careerDetails);
        setLoading(false);
        return;
      }

      // Try to load from enhanced session data
      const careerPathData = getCareerPathData();
      if (careerPathData) {
        console.log('🔍 Loading career data from session...');
        setCareerDetails(careerPathData);
        setLoading(false);
        return;
      }

      // Migrate existing data if available
      if (sessionData.student && !sessionData.careerPath) {
        console.log('🔍 Migrating existing data...');
        await migrateExistingData();
      }

      // This section is no longer needed since we handle career path above

      console.log('🔍 No career path specified, showing error...');
      setError('Career path not specified');
      setLoading(false);
    };

    initializePage();
  }, [careerPath, loadPageState, sessionInitialized, getCareerPathData, sessionData, migrateExistingData]);

  // Reset fetch flag when career path changes
  useEffect(() => {
    setHasFetchedCareerDetails(false);
  }, [careerPath]);

  // Fetch user info when session data changes
  useEffect(() => {
    if (sessionData?.student && !userInfo) {
      fetchUserInfo();
    }
  }, [sessionData, userInfo]);

  if (loading) {
    return (
      <ConsistentLoadingPage
        type="general"
        title="Generating Your Career Path"
        subtitle="We're analyzing your profile and creating a personalized career exploration guide tailored just for you..."
        tips={[
          'Analyzing your interests and skills',
          'Matching you with relevant career paths',
          'Preparing detailed career information'
        ]}
      />
    );
  }

  if (error || !careerDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-red-500 text-8xl mb-6">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error || 'Career details not found'}</p>
          <button
            onClick={() => router.push('/career-exploration')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Back to Career Options
          </button>
        </div>
      </div>
    );
  }

  // Extract output dynamically from N8N API response
  console.log('🔍 Career details state:', careerDetails);
  console.log('🔍 Output object:', careerDetails?.output);
  
  // Minimal fallback data (only used if N8N API completely fails)
  const defaultOutput = {
    greeting: "🌟 Welcome to your career exploration!",
    overview: ["Loading your personalized career information..."],
    timeRequired: "Loading...",
    focusAreas: ["Loading career focus areas..."],
    learningPath: [
      {
        module: "Loading career path...",
        description: "Please wait while we generate your personalized learning journey.",
        submodules: []
      }
    ],
    finalTip: "🚀 Your personalized career guidance is being prepared!"
  };

  // Use dynamic data from N8N API or fallback to defaults
  let output: {
    greeting: string;
    overview: string[];
    timeRequired: string;
    focusAreas: string[];
    learningPath: LearningModule[];
    finalTip: string;
  } = defaultOutput;
  
  // Extract data from N8N API response
  if (careerDetails?.output) {
    console.log('✅ Using N8N career details data');
    const apiOutput = careerDetails.output;
    
    output = {
      greeting: apiOutput.greeting || defaultOutput.greeting,
      overview: Array.isArray(apiOutput.overview) ? apiOutput.overview : defaultOutput.overview,
      timeRequired: apiOutput.timeRequired || defaultOutput.timeRequired,
      focusAreas: Array.isArray(apiOutput.focusAreas) ? apiOutput.focusAreas : defaultOutput.focusAreas,
      learningPath: Array.isArray(apiOutput.learningPath) ? apiOutput.learningPath : defaultOutput.learningPath,
      finalTip: apiOutput.finalTip || defaultOutput.finalTip
    };
  } else {
    console.log('⚠️ No N8N data available, using fallback');
  }

  // Only use fallback if we have completely empty data (API failed)
  if (!output.overview || output.overview.length === 0) {
    console.log('⚠️ No overview data available, using default fallback');
    output.overview = defaultOutput.overview;
  }
  
  if (!output.focusAreas || output.focusAreas.length === 0) {
    console.log('⚠️ No focus areas data available, using default fallback');
    output.focusAreas = defaultOutput.focusAreas;
  }
  
  if (!output.learningPath || output.learningPath.length === 0) {
    console.log('⚠️ No learning path data available, using default fallback');
    output.learningPath = defaultOutput.learningPath;
  }
  
  console.log('🔍 Career data loaded:', {
    source: careerDetails?.output ? 'N8N API' : 'Fallback',
    overview: output.overview?.length || 0,
    focusAreas: output.focusAreas?.length || 0,
    learningPath: output.learningPath?.length || 0
  });

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Enhanced Interactive Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Mouse-following gradient orbs */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-400/10 to-pink-400/10 blur-3xl"
            animate={{
              x: mousePosition.x * 0.05 - 200,
              y: mousePosition.y * 0.05 - 200,
            }}
            transition={{ type: "spring", stiffness: 30, damping: 20 }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-blue-400/10 to-indigo-400/10 blur-2xl"
            animate={{
              x: mousePosition.x * -0.03 + 100,
              y: mousePosition.y * -0.03 + 100,
            }}
            transition={{ type: "spring", stiffness: 20, damping: 25 }}
          />
          
          {/* Floating particles */}
          {[...Array(12)].map((_, i) => {
            // Use deterministic positioning based on index to avoid hydration mismatch
            const basePosition = (i * 137.5) % 100; // Golden ratio for better distribution
            const left = (basePosition + (i * 23.7)) % 100;
            const top = (basePosition * 1.618 + (i * 31.2)) % 100;
            
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-2 h-2 bg-gradient-to-r from-purple-400/30 to-pink-400/30 rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, (i % 3 - 1) * 10, 0],
                  scale: [1, 1.5, 1],
                  opacity: [0.2, 0.7, 0.2],
                }}
                transition={{
                  duration: 3 + (i % 3) * 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i % 4) * 0.5,
                }}
              />
            );
          })}
          
          {/* Floating geometric shapes */}
          {[...Array(6)].map((_, i) => {
            // Use deterministic positioning based on index to avoid hydration mismatch
            const basePosition = (i * 89.3) % 100; // Different multiplier for variety
            const left = (basePosition + (i * 41.7)) % 100;
            const top = (basePosition * 2.414 + (i * 19.8)) % 100;
            
            return (
              <motion.div
                key={`shape-${i}`}
                className="absolute w-3 h-3 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                }}
                animate={{
                  y: [0, -40, 0],
                  x: [0, (i % 5 - 2) * 8, 0],
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 5 + (i % 4) * 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: (i % 3) * 0.8,
                }}
              />
            );
          })}
        </div>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Career Explorer</span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWithState('/career-exploration', { careerDetails })}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                ← Back to Options
              </button>
              
              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {userInfo?.avatar || (userInfo === null ? '...' : 'U')}
                  </span>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {userInfo?.name || (userInfo === null ? 'Loading...' : 'Student')}
                  </div>
                  <div className="text-gray-500">
                    #{userInfo?.id || (userInfo === null ? '...' : '0000')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl mb-6">
            <span className="text-3xl">🧑🏻‍🎓</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {careerPath || 'Career Explorer'}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {userInfo?.name ? `Hi ${userInfo.name}! ` : ''}{output.greeting}
          </p>
          {isSaved && (
            <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Learning path saved successfully!
            </div>
          )}
        </div>

        {/* Why This Career Fits You */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why this career fits you
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
              {output.overview && output.overview.length > 0 ? (
                output.overview.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-sm font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No overview data available</div>
              )}
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">⏱️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Time to Master</h3>
                  <p className="text-2xl font-bold text-purple-600">{output.timeRequired}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Activities to Start Now */}
          <section className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Activities to Start Now</h3>
            </div>
            <div className="space-y-4">
              {output.focusAreas && output.focusAreas.length > 0 ? (
                output.focusAreas.slice(0, 4).map((activity, index) => {
                const colors = [
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500',
                  'from-purple-500 to-pink-500',
                  'from-blue-500 to-cyan-500'
                ];
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <div className={`w-4 h-4 bg-gradient-to-r ${colors[index % colors.length]} rounded-full`}></div>
                    <span className="text-gray-800 font-medium">{activity}</span>
                  </div>
                );
                })
              ) : (
                <div className="text-gray-500 italic">No focus areas data available</div>
              )}
            </div>
          </section>

          {/* Tools & Resources */}
          <section className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl">🛠️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Tools & Resources</h3>
            </div>
            <div className="space-y-4">
              {output.focusAreas && output.focusAreas.length > 3 ? (
                output.focusAreas.slice(3, 6).map((resource, index) => {
                const colors = [
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500',
                  'from-purple-500 to-pink-500'
                ];
                return (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                    <span className="text-gray-800 font-medium">{resource}</span>
                    <div className={`w-4 h-4 bg-gradient-to-r ${colors[index % colors.length]} rounded-full ml-auto`}></div>
                  </div>
                );
                })
              ) : (
                <div className="text-gray-500 italic">No additional resources data available</div>
              )}
            </div>
          </section>
        </div>

        {/* 3-Year Growth Timeline */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl mb-4">
                <span className="text-white text-2xl">📈</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{output.timeRequired} Growth Timeline</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your personalized learning journey to master this career path
              </p>
            </div>
            
            <div className="space-y-8">
              {output.learningPath && output.learningPath.length > 0 ? (
                output.learningPath.slice(0, 3).map((module, index) => {
                const colors = [
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500',
                  'from-purple-500 to-pink-500'
                ];
                const hasSubmodules = module.submodules && Array.isArray(module.submodules);
                
                const isExpanded = expandedModules.has(index);
                
                return (
                  <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex items-start space-x-6 p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${colors[index % colors.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white font-bold text-lg">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">
                            {module.module}
                          </h3>
                          {hasSubmodules && (
                            <button
                              onClick={() => toggleModule(index)}
                              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors duration-200"
                            >
                              <span className="text-sm font-medium">
                                {isExpanded ? 'Hide Details' : 'Show Details'}
                              </span>
                              <svg
                                className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">{module.description}</p>
                        
                        {/* Submodules */}
                        {hasSubmodules && isExpanded && (
                          <div className="space-y-4 animate-fadeIn">
                            {module.submodules?.map((submodule: Submodule, subIndex: number) => (
                              <div key={subIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-2">{submodule.title}</h4>
                                <p className="text-sm text-gray-600 mb-3">{submodule.description}</p>
                                
                                {/* Chapters */}
                                {submodule.chapters && Array.isArray(submodule.chapters) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {submodule.chapters.map((chapter: Chapter, chapterIndex: number) => (
                                      <div key={chapterIndex} className="flex items-center space-x-2 text-sm text-gray-700">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>{chapter.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
              ) : (
                <div className="text-gray-500 italic text-center py-8">No learning path data available</div>
              )}
            </div>
          </div>
        </section>

        {/* Motivational Messages */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {output.overview.slice(0, 3).map((message, index) => {
            const messages = [
              { emoji: '🎉', prefix: 'Great job!' },
              { emoji: '🌟', prefix: 'Amazing!' },
              { emoji: '💪', prefix: 'Excellent!' }
            ];
            const msg = messages[index] || messages[0];
            return (
              <div key={index} className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">{msg.emoji}</div>
                <p className="text-gray-800 font-medium">
                  {msg.prefix} {message}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Your Future is Bright! ✨</h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {output.finalTip}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigateWithState('/career-exploration', { careerDetails })}
                className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
              >
                Explore More Careers
              </button>
              <button
                onClick={saveLearningPath}
                disabled={isSaving || isSaved}
                className={`px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 ${
                  isSaving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : isSaved
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-purple-700 text-white hover:bg-purple-800'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Learning Path...
                  </>
                ) : isSaved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved! Redirecting...
                  </>
                ) : (
                  'Go to Dashboard'
                )}
              </button>
            </div>
            {saveError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <p className="text-sm">❌ {saveError}</p>
                <button
                  onClick={() => setSaveError(null)}
                  className="text-xs underline hover:no-underline mt-1"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Success Modal - Learning Path Saved */}
      {isSaved && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Learning Path Saved! 🎉</h3>
            <p className="text-gray-600 mb-4">
              Your personalized learning path for <strong>{careerPath}</strong> has been successfully saved to your dashboard.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-500">Path ID: {savedPathId}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/dashboard/student')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard Now
              </button>
              <button
                onClick={() => {
                  setIsSaved(false);
                  setSavedPathId(null);
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Continue Exploring
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Redirecting to dashboard in 3 seconds...
            </p>
          </div>
        </div>
      )}

      {/* Debug Info - Development only */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
          <div><strong>Career Data Status:</strong></div>
          <div>📊 Overview: {output.overview?.length || 0} items</div>
          <div>🎯 Focus Areas: {output.focusAreas?.length || 0} items</div>
          <div>📚 Learning Path: {output.learningPath?.length || 0} modules</div>
          <div>🔄 Source: {careerDetails?.output ? 'N8N API' : 'Fallback'}</div>
        </div>
      )}
      </motion.div>
    </>
  );
}

export default function CareerDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Loading Career Details</h3>
          <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
            Please wait while we load your personalized career exploration guide...
          </p>
        </div>
      </div>
    }>
      <CareerDetailsContent />
    </Suspense>
  );
}