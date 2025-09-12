'use client';

import React from 'react';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

export default function LoadingPageDemo() {
  return (
    <ConsistentLoadingPage
      type="modules"
      title="Loading Your Learning Journey"
      subtitle="Preparing personalized content just for you..."
      showProgress={true}
      progress={65}
      tips={[
        'AI is analyzing your learning preferences',
        'Customizing content difficulty for you',
        'Loading interactive elements and quizzes'
      ]}
    />
  );
}