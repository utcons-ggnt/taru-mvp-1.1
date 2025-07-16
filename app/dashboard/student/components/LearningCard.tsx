import React from 'react';
import Image from 'next/image';

interface LearningCardProps {
  image: string;
  title: string;
  xp: number;
  time: string;
  progress: number;
  enroll?: boolean;
}

export default function LearningCard({ image, title, xp, time, progress, enroll }: LearningCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 w-72 flex flex-col items-center">
      <Image src={image} alt={title} width={128} height={96} className="w-32 h-24 object-cover rounded-xl mb-3" />
      <div className="w-full flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">{xp}+ XP</span>
      </div>
      <div className="w-full flex items-center text-xs text-gray-900 mb-2">
        <span className="mr-2">⏱ {time}</span>
        {enroll ? null : <span className="ml-auto">{progress}% Complete</span>}
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
        <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${progress}%` }}></div>
      </div>
      {enroll && (
        <button className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm mt-2">Enroll Now</button>
      )}
    </div>
  );
} 