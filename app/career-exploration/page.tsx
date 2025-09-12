'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();

  useEffect(() => {
    fetchCareerOptions();
  }, []);

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

  const handleLearnMore = (career: string, description: string) => {
    console.log('🔍 Learn More clicked for career:', { career, description });
    // Navigate to detailed career page with career path and description parameters
    router.push(`/career-details?careerPath=${encodeURIComponent(career)}&description=${encodeURIComponent(description)}`);
  };

  if (loading) {
    return (
      <ConsistentLoadingPage
        type="general"
        title="Loading Career Options"
        subtitle="Discovering personalized career paths for you..."
        tips={[
          'Analyzing your interests and skills',
          'Matching you with suitable careers',
          'Preparing personalized recommendations'
        ]}
      />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#6D18CE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-white mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white text-[#6D18CE] rounded-lg hover:bg-gray-100 transition-colors"
          >
            Try Again
          </button>
        </div>
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
    <div className="min-h-screen flex">
      {/* Left Panel - Purple */}
      <div className="w-[469px] bg-[#6D18CE] rounded-l-[40px] relative overflow-hidden">
        {/* Background Vectors */}
        <div className="absolute w-[948.59px] h-[467.12px] left-[311px] top-[-131px] opacity-60">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
        </div>
        <div className="absolute w-[948.59px] h-[467.12px] left-[-494px] top-[498.88px] opacity-60">
          <div className="w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-full"></div>
        </div>

        {/* Taru Logo */}
        <div className="absolute w-[68px] h-[68px] left-[63px] top-[64px] bg-white rounded-full flex items-center justify-center">
          <span className="text-[#6D18CE] font-bold text-xl">Taru</span>
        </div>

        {/* Students Details Title */}
        <div className="absolute left-[63px] top-[184px]">
          <h1 className="text-[39.375px] font-bold text-white leading-[48px]">
            Students Details
          </h1>
        </div>

        {/* Progress Indicators */}
        <div className="absolute left-[181px] top-[287px] flex flex-col space-y-[113px]">
          {/* Step 1 */}
          <div className="flex items-center">
            <div className="w-[45.81px] h-[45.81px] bg-white rounded-full flex items-center justify-center">
              <span className="text-[24.7297px] font-bold text-[#5B10B1]">1</span>
            </div>
            <div className="w-[222.53px] h-[2px] bg-white ml-4"></div>
          </div>
          
          {/* Step 2 */}
          <div className="flex items-center">
            <div className="w-[45.81px] h-[45.81px] bg-white rounded-full flex items-center justify-center">
              <span className="text-[24.7297px] font-bold text-[#5B10B1]">2</span>
            </div>
            <div className="w-[222.53px] h-[2px] bg-white ml-4"></div>
          </div>
          
          {/* Step 3 */}
          <div className="flex items-center">
            <div className="w-[45.81px] h-[45.81px] bg-white rounded-full flex items-center justify-center">
              <span className="text-[24.7297px] font-bold text-[#5B10B1]">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - White */}
      <div className="flex-1 bg-white rounded-r-[40px] relative shadow-[-21px_0px_144px_#5B10B1]">
        {/* Language Selector */}
        <div className="absolute right-[53px] top-[85px] flex items-center space-x-2">
          <span className="text-[15.9955px] font-semibold text-black">English (USA)</span>
          <div className="w-[26.6px] h-[26.6px] flex items-center justify-center">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="#8E8E8E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-[53px] pt-[78px]">
          {/* Main Title */}
          <h1 className="text-[34px] font-bold text-black leading-[41px] mb-[21px]">
            Your Future, Imagined!
          </h1>

          {/* Subtitle */}
          <h2 className="text-[24.7297px] font-bold text-[#6D18CE] leading-[30px] mb-[55px]">
            Suggested Career Paths
          </h2>

          {/* Career Path Cards Grid */}
          <div className="grid grid-cols-2 gap-[11px] mb-[53px]">
            {(careerOptions.length > 0 ? careerOptions.slice(0, 4) : defaultCareerPaths).map((path, index) => {
              const isApiData = 'career' in path;
              const title = isApiData ? path.career : path.title;
              const description = isApiData ? path.description : path.description;
              const icon = isApiData ? '🎯' : path.icon;
              const hasLearnMore = isApiData ? true : path.hasLearnMore;
              
              return (
                <div key={index} className="w-[299px] h-[185px] bg-[#F5F5F5] rounded-[14px] p-[27px] relative">
                  {/* Icon */}
                  <div className="w-[27px] h-[27px] mb-[11px] flex items-center justify-center">
                    <span className="text-[#6D18CE] text-xl">{icon}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-[18px] font-bold text-black leading-[22px] mb-[6px]">
                    {title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] text-[#878787] leading-[17px] mb-[26px]">
                    {description}
                  </p>

                  {/* Learn More Button */}
                  {hasLearnMore && (
                    <button 
                      onClick={() => handleLearnMore(title, description)}
                      className="absolute bottom-[27px] left-[27px] w-[73.78px] h-[23.93px] bg-[#6D18CE] rounded-[27.9506px] flex items-center justify-center hover:bg-[#5B10B1] transition-colors"
                    >
                      <span className="text-[8.38492px] font-medium text-white">Learn more</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Done Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDone}
              className="w-[514px] h-[69px] bg-[#6D18CE] rounded-[90px] flex items-center justify-center hover:bg-[#5B10B1] transition-colors"
            >
              <span className="text-[16.0016px] font-semibold text-white">Done! Let's Begin the Journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
