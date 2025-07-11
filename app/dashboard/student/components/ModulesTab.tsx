import React from 'react';
import LearningCard from './LearningCard';

interface Module {
  image: string;
  title: string;
  xp: number;
  time: string;
  progress: number;
  enroll?: boolean;
}

export default function ModulesTab({ modules }: { modules: Module[] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">My Learning Modules</h3>
      <div className="flex gap-6 flex-wrap">
        {modules.map((mod, idx) => (
          <LearningCard key={idx} {...mod} enroll={true} />
        ))}
      </div>
    </div>
  );
} 