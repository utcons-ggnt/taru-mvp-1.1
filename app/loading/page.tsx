import React from 'react';

const Spinner = () => (
  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" style={{ borderTopColor: '#FFFFFF' }} />
);

const LoadingPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#6D18CE]">
      <div className="flex flex-col items-center justify-center text-white">
        <Spinner />
        <p className="mt-4 text-lg font-semibold">Loading your dashboard...</p>
      </div>
    </div>
  );
};

export default LoadingPage;