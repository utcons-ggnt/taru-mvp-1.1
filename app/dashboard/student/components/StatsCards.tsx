import React from 'react';

interface StatsCard {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}

interface StatsCardsProps {
  stats: StatsCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center border border-gray-100 min-w-[120px]">
          <div className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center mb-2`}>
            <span className="text-white text-sm">{stat.icon}</span>
          </div>
          <span className="font-bold text-2xl text-gray-900">{stat.value}</span>
          <span className="text-xs text-gray-500 text-center">{stat.title}</span>
          <span className="text-xs text-gray-400 mt-1">{stat.subtitle}</span>
        </div>
      ))}
    </div>
  );
} 