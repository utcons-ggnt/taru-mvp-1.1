'use client';

import React from 'react';

const StudentDetails = () => {
  return (
    <div className="relative w-[1400px] h-[800px] left-[19836px] top-[664px] bg-[#6D18CE] rounded-[40px]">
      {/* Frame 1 - Main white content area */}
      <div className="absolute w-[931px] h-[800px] left-[469px] top-0 bg-white shadow-[-21px_0px_144px_#5B10B1] rounded-[40px]">
        
        {/* Background decorative vectors */}
        <div className="absolute w-[948.59px] h-[467.12px] left-[311px] top-[-131px] opacity-60">
          {/* Vector11111 1 - placeholder for background image */}
        </div>
        <div className="absolute w-[948.59px] h-[467.12px] left-[-494px] top-[498.88px] opacity-60">
          {/* Vector11111 2 - placeholder for background image */}
        </div>

        {/* Language Selector */}
        <div className="absolute w-[145.6px] h-[26.6px] left-[697px] top-[85px]">
          <span className="absolute w-[107px] h-[19px] left-0 top-[3.77px] font-inter font-semibold text-[15.9955px] leading-[19px] flex items-center text-black">
            English (USA)
          </span>
          <div className="absolute w-[26.6px] h-[26.6px] left-[119px] top-0 transform rotate-180">
            {/* Arrow up icon */}
            <div className="absolute left-[6.67%] right-[6.67%] top-[26.66%] bottom-[33.34%] bg-[#8E8E8E] transform rotate-180"></div>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="absolute w-[375px] h-[41px] left-[53px] top-[78px] font-inter font-bold text-[34px] leading-[41px] flex items-center text-black">
          Your Future, Imagined!
        </h1>
        
        <h2 className="absolute w-[295px] h-[30px] left-[53px] top-[140px] font-inter font-bold text-[24.7297px] leading-[30px] flex items-center text-[#6D18CE]">
          Suggested Career Paths
        </h2>

        {/* Career Path Cards */}
        <div className="grid grid-cols-2 gap-4 absolute left-[161px] top-[225px] w-[609px] h-[383px]">
          {/* Creative Explorer Card */}
          <div className="w-[299px] h-[185px] bg-[#F5F5F5] rounded-[14px] relative">
            <div className="absolute w-[27px] h-[27px] left-[33px] top-[30px]">
              {/* Creative Explorer icon */}
              <div className="absolute left-[12.17%] right-[11.1%] top-[11.13%] bottom-[12.48%]">
                <div className="absolute left-[12.17%] right-[26.23%] top-[25.89%] bottom-[12.48%] border-[1.5px] border-[#6D18CE]"></div>
                <div className="absolute left-[63.66%] right-[11.1%] top-[11.13%] bottom-[63.64%] bg-[#6D18CE] border-[1.5px] border-[#6D18CE]"></div>
                <div className="absolute left-[38.34%] right-[49.16%] top-[48.57%] bottom-[38.93%] border-[1.5px] border-[#6D18CE]"></div>
              </div>
            </div>
            <h3 className="absolute w-[344px] h-[22px] left-[67px] top-[33px] font-inter font-bold text-[18px] leading-[22px] flex items-center text-black">
              Creative Explorer
            </h3>
            <p className="absolute w-[200px] h-[51px] left-[67px] top-[61px] font-inter font-normal text-[14px] leading-[17px] text-[#878787]">
              Design, animation, and storytelling could be your world!
            </p>
            <button className="absolute w-[73.78px] h-[23.93px] left-[67px] top-[132px] bg-[#6D18CE] rounded-[27.9506px]">
              <span className="absolute w-[46px] h-[10px] left-[13.96px] top-[6.98px] font-inter font-medium text-[8.38492px] leading-[10px] flex items-center text-center text-white">
                Learn more
              </span>
            </button>
          </div>

          {/* Logical Leader Card */}
          <div className="w-[299px] h-[185px] bg-[#F5F5F5] rounded-[14px] relative">
            <div className="absolute w-[27px] h-[27px] left-[33px] top-[30px]">
              {/* Logical Leader icon */}
              <div className="absolute left-[8.33%] right-[4.17%] top-[8.33%] bottom-[4.17%] bg-[#6D18CE]"></div>
            </div>
            <h3 className="absolute w-[232px] h-[22px] left-[67px] top-[33px] font-inter font-bold text-[18px] leading-[22px] flex items-center text-black">
              Logical Leader
            </h3>
            <p className="absolute w-[214px] h-[51px] left-[67px] top-[61px] font-inter font-normal text-[14px] leading-[17px] text-[#878787]">
              You're great with strategies future entrepreneur or engineer?
            </p>
            <button className="absolute w-[73.78px] h-[23.93px] left-[67px] top-[132px] bg-[#6D18CE] rounded-[27.9506px]">
              <span className="absolute w-[46px] h-[10px] left-[13.96px] top-[6.98px] font-inter font-medium text-[8.38492px] leading-[10px] flex items-center text-center text-white">
                Learn more
              </span>
            </button>
          </div>

          {/* Science Detective Card */}
          <div className="w-[299px] h-[185px] bg-[#F5F5F5] rounded-[14px] relative">
            <div className="absolute w-[27px] h-[27px] left-[33px] top-[30px]">
              {/* Science Detective icon */}
              <div className="absolute left-[12.38%] right-[12.38%] top-[12.5%] bottom-[12.5%] bg-[#6D18CE]"></div>
            </div>
            <h3 className="absolute w-[232px] h-[22px] left-[67px] top-[33px] font-inter font-bold text-[18px] leading-[22px] flex items-center text-black">
              Science Detective
            </h3>
            <p className="absolute w-[214px] h-[51px] left-[67px] top-[61px] font-inter font-normal text-[14px] leading-[17px] text-[#878787]">
              You love to explore and experiment — maybe a future scientist!
            </p>
            <button className="absolute w-[73.78px] h-[23.93px] left-[67px] top-[132px] bg-[#6D18CE] rounded-[27.9506px]">
              <span className="absolute w-[46px] h-[10px] left-[13.96px] top-[6.98px] font-inter font-medium text-[8.38492px] leading-[10px] flex items-center text-center text-white">
                Learn more
              </span>
            </button>
          </div>

          {/* You are special because Card */}
          <div className="w-[299px] h-[185px] bg-[#F5F5F5] rounded-[14px] relative">
            <h3 className="absolute w-[245px] h-[22px] left-[33px] top-[33px] font-inter font-bold text-[18px] leading-[22px] flex items-center text-black">
              You are special because
            </h3>
            <p className="absolute w-[226px] h-[51px] left-[33px] top-[61px] font-inter font-normal text-[14px] leading-[17px] text-[#878787]">
              You think creatively, lead with kindness, and love to learn with visuals and stories.
            </p>
          </div>
        </div>

        {/* Main CTA Button */}
        <button className="absolute w-[514px] h-[69px] left-[208px] top-[663px] bg-[#6D18CE] rounded-[90px]">
          <span className="absolute w-[231px] h-[19px] left-[142px] top-[26px] font-inter font-semibold text-[16.0016px] leading-[19px] flex items-center text-center text-white">
            Done! Let's Begin the Journey
          </span>
        </button>
      </div>

      {/* Left Panel - Purple background with progress indicator */}
      <div className="absolute w-[469px] h-[800px] left-0 top-0 bg-[#6D18CE] rounded-l-[40px]">
        {/* Taru Logo */}
        <div className="absolute w-[68px] h-[68px] left-[63px] top-[64px] bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xl">J</span>
        </div>

        {/* Students Details Title */}
        <h1 className="absolute w-[457.73px] h-[48px] left-[63px] top-[184px] font-inter font-bold text-[39.375px] leading-[48px] flex items-center text-white">
          Students Details
        </h1>

        {/* Progress Indicator */}
        <div className="absolute w-[271.15px] h-[45.81px] left-[181px] top-[287px] transform rotate-90">
          {/* Progress Line */}
          <div className="absolute w-[222.53px] h-[2px] left-[24.38px] top-[27.25px] bg-white transform rotate-90"></div>
          
          {/* Progress Circles */}
          <div className="absolute w-[45.81px] h-[45.81px] left-0 top-0 bg-white rounded-full flex items-center justify-center">
            <span className="font-inter font-bold text-[24.7297px] leading-[30px] text-[#5B10B1]">1</span>
          </div>
          <div className="absolute w-[45.81px] h-[45.81px] left-0 top-[113.13px] bg-white rounded-full flex items-center justify-center">
            <span className="font-inter font-bold text-[24.7297px] leading-[30px] text-[#5B10B1]">2</span>
          </div>
          <div className="absolute w-[45.81px] h-[45.81px] left-0 top-[225.33px] bg-white rounded-full flex items-center justify-center">
            <span className="font-inter font-bold text-[24.7297px] leading-[30px] text-[#5B10B1]">3</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
