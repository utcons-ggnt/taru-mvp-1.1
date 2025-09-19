'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

interface CareerOption {
  ID: string;
  career: string;
  description: string;
}

export default function CareerExploration() {
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchCareerOptions();
  }, []);

  // Update scroll state when career options change
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollState();
    }
  }, [careerOptions]);

  const updateScrollState = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const scrollToIndex = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / (careerOptions.length || defaultCareerPaths.length);
    const scrollPosition = index * cardWidth;
    
    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    setCurrentScrollIndex(index);
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const cardWidth = container.scrollWidth / (careerOptions.length || defaultCareerPaths.length);
    const newIndex = Math.max(0, currentScrollIndex - 1);
    scrollToIndex(newIndex);
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const maxIndex = (careerOptions.length || defaultCareerPaths.length) - 1;
    const newIndex = Math.min(maxIndex, currentScrollIndex + 1);
    scrollToIndex(newIndex);
  };

  const handleScroll = () => {
    updateScrollState();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollRight) {
      scrollRight();
    } else if (isRightSwipe && canScrollLeft) {
      scrollLeft();
    }
  };

  const fetchCareerOptions = async () => {
    try {
      console.log('🔍 Fetching career options...');
      setLoading(true);
      const response = await fetch('/api/career-options');
      
      console.log('🔍 Career options API response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Career options data received:', data);
        
        // Handle the new webhook format
        if (data.success && data.careerOptions) {
          setCareerOptions(data.careerOptions);
        } else if (data.careerOptions) {
          setCareerOptions(data.careerOptions);
        } else {
          setCareerOptions([]);
        }
      } else {
        console.error('Failed to fetch career options:', response.status);
        setError('Failed to load career options');
      }
    } catch (err) {
      console.error('Error fetching career options:', err);
      setError('Failed to load career options');
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    router.push('/dashboard/student');
  };

  const handleLearnMore = useCallback((career: string, description: string) => {
    // Prevent double navigation
    if (isNavigating) {
      console.log('🔍 Learn More already navigating, ignoring duplicate click');
      return;
    }
    
    console.log('🔍 Learn More clicked for career:', { career, description });
    setIsNavigating(true);
    
    // Navigate to detailed career page with career path and description parameters
    router.push(`/career-details?careerPath=${encodeURIComponent(career)}&description=${encodeURIComponent(description)}`);
    
    // Reset navigation state after a short delay
    setTimeout(() => {
      setIsNavigating(false);
    }, 1000);
  }, [isNavigating, router]);

  if (loading) {
    return (
      <ConsistentLoadingPage
        type="general"
        title="Generating Career Options"
        subtitle="Our AI is analyzing your assessment results and creating personalized career recommendations..."
        tips={[
          'Processing your assessment responses',
          'Analyzing your interests and skills',
          'Matching you with suitable career paths',
          'Generating detailed career descriptions',
          'Preparing personalized recommendations'
        ]}
        extendedLoading={true}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <motion.div 
          className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-200"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-8xl mb-6"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⚠️
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8 text-lg">{error}</p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Default career paths if no data available
  const defaultCareerPaths = [
    {
      title: "Creative Explorer",
      description: "Design, animation, and storytelling could be your world! You have a natural talent for creative expression and visual communication.",
      icon: "🎨",
      hasLearnMore: true
    },
    {
      title: "Logical Leader", 
      description: "You're great with strategies - future entrepreneur or engineer? Your analytical thinking and problem-solving skills are exceptional.",
      icon: "⚙️",
      hasLearnMore: true
    },
    {
      title: "Science Detective",
      description: "You love to explore and experiment — maybe a future scientist! Your curiosity and methodical approach to discovery are remarkable.",
      icon: "🔬",
      hasLearnMore: true
    },
    {
      title: "Tech Innovator",
      description: "Technology and innovation fascinate you! You have the potential to create the next big breakthrough in the digital world.",
      icon: "💻",
      hasLearnMore: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-50"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Enhanced Header */}
        <motion.header 
          className="bg-white/90 backdrop-blur-2xl border-b border-purple-200/50 sticky top-0 z-50 shadow-lg"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-20">

              {/* Progress Steps with Labels */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-6 py-3 border border-purple-200/50">
                  {[
                    { step: 1, label: "Assessment", completed: true },
                    { step: 2, label: "Career Exploration", completed: true, current: true },
                    { step: 3, label: "Learning Path", completed: false }
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <motion.div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                          item.current
                            ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                            : item.completed
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                            : 'bg-gradient-to-r from-purple-300 to-blue-300'
                        }`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {item.completed && !item.current ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-white font-bold text-sm">{item.step}</span>
                        )}
                      </motion.div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-xs text-gray-500">
                          {item.current ? 'Current Step' : item.completed ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                      {index < 2 && (
                        <motion.div 
                          className="w-8 h-0.5 bg-gradient-to-r from-purple-300 to-blue-300"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ delay: 0.5 + index * 0.2, duration: 0.5 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl mb-8 shadow-2xl"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-4xl">🚀</span>
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your Future, Imagined!
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              Discover personalized career paths tailored just for you. 
              <span className="text-purple-600 font-semibold"> Let's explore what the future holds!</span>
            </motion.p>
          </motion.div>

          {/* Career Paths Section */}
          <motion.div
            className="mb-16"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Suggested Career Paths
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-4"></div>
              <p className="text-sm md:text-base text-gray-600 mb-2">
                Swipe or use the arrows to explore different career options
              </p>
            </div>

            {/* Scroller Container */}
            <div className="relative">
              {/* Scroll Navigation Buttons */}
              <motion.button
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                className={`absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  canScrollLeft
                    ? 'bg-white/90 hover:bg-white text-purple-600 hover:text-purple-700 hover:scale-110'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={canScrollLeft ? { scale: 1.1 } : {}}
                whileTap={canScrollLeft ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <motion.button
                onClick={scrollRight}
                disabled={!canScrollRight}
                className={`absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  canScrollRight
                    ? 'bg-white/90 hover:bg-white text-purple-600 hover:text-purple-700 hover:scale-110'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={canScrollRight ? { scale: 1.1 } : {}}
                whileTap={canScrollRight ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>

              {/* Career Cards Scroller */}
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 md:px-4 py-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
              {(careerOptions.length > 0 ? careerOptions : defaultCareerPaths).map((path, index) => {
                const isApiData = 'career' in path;
                const title = isApiData ? path.career : path.title;
                const description = isApiData ? path.description : path.description;
                const icon = isApiData ? '🎯' : path.icon;
                const hasLearnMore = isApiData ? true : path.hasLearnMore;
                
                return (
                  <motion.div
                    key={index}
                    className="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-100/50 hover:border-purple-200/50 flex-shrink-0 w-72 md:w-80 snap-center"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    {/* Decorative Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon */}
                      <motion.div 
                        className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <span className="text-3xl">{icon}</span>
                      </motion.div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                        {title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                        {description}
                      </p>

                      {/* Learn More Button */}
                      {hasLearnMore && (
                        <motion.button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleLearnMore(title, description);
                          }}
                          disabled={isNavigating}
                          className={`group/btn relative w-full py-4 px-6 rounded-2xl font-semibold text-white transition-all duration-300 ${
                            isNavigating 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cursor-pointer shadow-lg hover:shadow-xl'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="flex items-center justify-center gap-2">
                            {isNavigating ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Loading...
                              </>
                            ) : (
                              <>
                                Learn More
                                <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                              </>
                            )}
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              </div>

              {/* Scroll Indicators */}
              <div className="flex justify-center mt-8 space-x-2">
                {(careerOptions.length > 0 ? careerOptions : defaultCareerPaths).map((_, index) => (
                  <motion.button
                    key={index}
                    onClick={() => scrollToIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentScrollIndex
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 scale-125'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Done Button */}
          <motion.div 
            className="text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <motion.button
              onClick={handleDone}
              className="group relative inline-flex items-center justify-center px-12 py-6 text-xl font-bold text-white bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Content */}
              <span className="relative z-10 flex items-center gap-3">
                <span>Done! Let's Begin the Journey</span>
                <motion.svg 
                  className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </span>
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div>
  );
}