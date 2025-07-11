import React from 'react';

export default function ProgressTrain({ percent }: { percent: number }) {
  // 1 car per 5% (max 20 cars)
  const cars = Math.round(percent / 5);
  return (
    <div className="flex items-center gap-1 w-full my-4">
      {[...Array(cars)].map((_, i) => (
        <span key={i} className="inline-block">
          <img src="/avatar.png" alt="Car" className="w-8 h-8 rounded-full border-2 border-purple-300 bg-white" />
        </span>
      ))}
      <span className="inline-block">
        <img src="/train-engine.png" alt="Train Engine" className="w-10 h-8" />
      </span>
      <div className="flex-1 border-b-2 border-gray-200 ml-2"></div>
    </div>
  );
} 