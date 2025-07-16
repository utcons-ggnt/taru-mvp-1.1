import React, { useState, useEffect } from 'react';

interface Answer {
  [key: number]: string | number;
}

interface DiagnosticResults {
  learningStyle: string;
  categoryScores: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    logical: number;
    creative: number;
  };
  overallScore: number;
}

interface Field {
  label: string;
  type: 'number' | 'choice';
  value?: number | string;
  options?: string[];
}

interface Step {
  type: 'start' | 'form' | 'shapes' | 'icons' | 'results';
  icon: string;
  title: string;
  subtitle?: string;
  fields?: Field[];
  suggestions?: Array<{ title: string; xp: number }>;
  button?: string;
  sequence?: string[];
  options?: Array<{ icon: string; label: string }>;
}

const steps: Step[] = [
  {
    title: "Let's discover how you love to learn!",
    subtitle: "Answer my magical questions and I'll find the perfect learning adventure for you!",
    icon: '🤖',
    button: 'Start the Magical game',
    type: 'start',
  },
  {
    title: 'Tell Me About You!',
    subtitle: "Let's get to know each other better",
    icon: '🤖',
    type: 'form',
    fields: [
      { label: 'How old are you?', type: 'number', value: 10 },
      { label: 'What grade are you in?', type: 'number', value: 5 },
      { label: 'How do you feel today?', type: 'choice', options: ['Happy', 'Excited', 'Calm', 'Curious'], value: 'Happy' },
    ],
  },
  {
    title: 'Which shape comes next?',
    icon: '🤖',
    type: 'shapes',
    sequence: ['🔴', '🔵', '🔴', '🔵', '🔴', '🔵', '?'],
    options: [
      { icon: '🔴', label: 'Red Circle' },
      { icon: '🔵', label: 'Blue Circle' },
      { icon: '🟣', label: 'Purple Circle' },
    ],
  },
  {
    title: 'What Makes You Excited?',
    icon: '🤖',
    type: 'icons',
    options: [
      { icon: '🎹', label: 'Music' },
      { icon: '🎨', label: 'Art' },
      { icon: '🧪', label: 'Science' },
      { icon: '📖', label: 'Reading' },
      { icon: '🏆', label: 'Sports' },
    ],
  },
  {
    title: 'Which one do you like the most?',
    icon: '🤖',
    type: 'icons',
    options: [
      { icon: '🐻', label: 'Watching a fun story' },
      { icon: '🧩', label: 'Solving a puzzle' },
      { icon: '🎨', label: 'Coloring a picture' },
    ],
  },
  {
    title: 'How do you love to learn?',
    icon: '🤖',
    type: 'icons',
    options: [
      { icon: '👂', label: 'By listening' },
      { icon: '👀', label: 'By looking at pictures' },
      { icon: '✍️', label: 'By doing things' },
    ],
  },
  {
    title: 'Choose your favorite subject!',
    icon: '🤖',
    type: 'icons',
    options: [
      { icon: '🔬', label: 'Science fun' },
      { icon: '🧮', label: 'Magic Math' },
      { icon: '🎭', label: 'Art & Craft' },
    ],
  },
  {
    title: ",You're a Visual Superstar! 🏆",
    subtitle: 'You learn best with fun visuals and bright colors!',
    icon: '🎉',
    type: 'results',
    suggestions: [
      { title: 'The Water Cycle', xp: 75 },
      { title: 'Shapes Adventure', xp: 50 },
      { title: 'Story of the Moon', xp: 30 },
    ],
    button: 'Try Again with Me!'
  },
];

export default function DiagnosticTestTab() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const current = steps[step];

  // Check if diagnostic is already completed
  useEffect(() => {
    const checkDiagnosticStatus = async () => {
      try {
        const response = await fetch('/api/assessment/diagnostic');
        if (response.ok) {
          const data = await response.json();
          if (data.assessment?.diagnosticCompleted) {
            setResults(data.assessment.diagnosticResults);
            setStep(steps.length - 1); // Go to results step
          }
        }
      } catch (error) {
        console.error('Error checking diagnostic status:', error);
      }
    };

    checkDiagnosticStatus();
  }, []);

  const handleAnswer = (questionIndex: number, answer: string | number) => {
    setAnswers((prev: Answer) => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const calculateResults = (): DiagnosticResults => {
    // Simple scoring algorithm based on answers
    let visualScore = 0;
    let auditoryScore = 0;
    let kinestheticScore = 0;
    let logicalScore = 0;
    let creativeScore = 0;

    // Analyze answers and calculate scores
    Object.values(answers).forEach((answer: string | number) => {
      if (typeof answer === 'string') {
        if (answer.includes('visual') || answer.includes('picture') || answer.includes('color')) {
          visualScore += 20;
        }
        if (answer.includes('listen') || answer.includes('sound') || answer.includes('music')) {
          auditoryScore += 20;
        }
        if (answer.includes('doing') || answer.includes('hands') || answer.includes('move')) {
          kinestheticScore += 20;
        }
        if (answer.includes('puzzle') || answer.includes('logic') || answer.includes('solve')) {
          logicalScore += 20;
        }
        if (answer.includes('creative') || answer.includes('art') || answer.includes('story')) {
          creativeScore += 20;
        }
      }
    });

    // Determine learning style
    const scores = { visualScore, auditoryScore, kinestheticScore, logicalScore, creativeScore };
    const learningStyle = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b))[0];

    return {
      learningStyle: learningStyle.replace('Score', ''),
      categoryScores: {
        visual: visualScore,
        auditory: auditoryScore,
        kinesthetic: kinestheticScore,
        logical: logicalScore,
        creative: creativeScore
      },
      overallScore: Math.round((visualScore + auditoryScore + kinestheticScore + logicalScore + creativeScore) / 5)
    };
  };

  const submitDiagnostic = async () => {
    setIsSubmitting(true);
    try {
      const diagnosticResults = calculateResults();
      
      const response = await fetch('/api/assessment/diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnosticResults,
          answers
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
        setStep(steps.length - 1);
      } else {
        console.error('Failed to submit diagnostic');
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === steps.length - 2) {
      // Last step before results - submit diagnostic
      submitDiagnostic();
    } else {
      setStep(step + 1);
    }
  };

  // Stepper rendering
  const renderStepper = () => (
    <div className="flex items-center justify-center gap-4 mb-10">
      {steps.map((s, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${
            idx < step ? 'border-green-400 bg-green-100 text-green-600' : idx === step ? 'border-purple-500 bg-white text-purple-600' : 'border-gray-300 bg-white text-gray-400'
          }`}>{idx < step ? '✔️' : idx === step ? '🔒' : '🔒'}</div>
          <div className={`text-xs mt-1 ${idx < step ? 'text-green-500' : idx === step ? 'text-purple-600' : 'text-gray-900'}`}>{
            idx < step ? 'Completed' : idx === step ? 'In Progress' : 'Pending'
          }</div>
          <div className="text-xs text-gray-900">Step {idx + 1} of {steps.length}</div>
        </div>
      ))}
    </div>
  );

  // Main content rendering
  const renderContent = () => {
    if (current.type === 'start') {
      return (
        <div className="flex flex-col items-center justify-center mt-10">
          <span className="text-6xl mb-4">{current.icon}</span>
          <h1 className="text-3xl font-bold mb-2 text-center">{current.title}</h1>
          <p className="text-gray-900 mb-6 text-center">{current.subtitle}</p>
          <button 
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-purple-700" 
            onClick={handleNext}
          >
            🚀 {current.button}
          </button>
        </div>
      );
    }

    if (current.type === 'form') {
      return (
        <div className="flex flex-col items-center mt-10">
          <span className="text-6xl mb-4">{current.icon}</span>
          <h1 className="text-3xl font-bold mb-2 text-center">{current.title}</h1>
          <p className="text-gray-900 mb-6 text-center">{current.subtitle}</p>
          <div className="flex gap-6 mb-8">
            {current.fields?.map((field: Field, index: number) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 flex flex-col items-center min-w-[160px]">
                <div className="text-sm font-semibold mb-2 text-gray-900">{field.label}</div>
                {field.type === 'number' && (
                  <div className="flex items-center gap-2">
                    <button 
                      className="bg-purple-100 text-purple-600 rounded-full w-8 h-8"
                      onClick={() => {
                        const currentValue = typeof answers[index] === 'number' ? answers[index] as number : 
                                           typeof field.value === 'number' ? field.value : 0;
                        handleAnswer(index, Math.max(1, currentValue - 1));
                      }}
                    >-</button>
                    <span className="text-2xl font-bold">{answers[index] || field.value}</span>
                    <button 
                      className="bg-purple-100 text-purple-600 rounded-full w-8 h-8"
                      onClick={() => {
                        const currentValue = typeof answers[index] === 'number' ? answers[index] as number : 
                                           typeof field.value === 'number' ? field.value : 0;
                        handleAnswer(index, Math.min(99, currentValue + 1));
                      }}
                    >+</button>
                  </div>
                )}
                {field.type === 'choice' && (
                  <div className="flex gap-2 flex-wrap">
                    {field.options?.map((option: string) => (
                      <button 
                        key={option} 
                        className={`px-4 py-1 rounded-full border-2 font-semibold text-sm ${
                          answers[index] === option 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'bg-white text-gray-900 border-gray-300'
                        }`}
                        onClick={() => handleAnswer(index, option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button 
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-purple-700" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Next Step'}
          </button>
        </div>
      );
    }

    if (current.type === 'results' && results) {
      return (
        <div className="flex flex-col items-center mt-10">
          <span className="text-6xl mb-4">{current.icon}</span>
          <h1 className="text-3xl font-bold mb-2 text-center">{current.title}</h1>
          <p className="text-gray-900 mb-6 text-center">{current.subtitle}</p>
          
          {/* Learning Style Result */}
          <div className="bg-purple-50 rounded-xl p-6 mb-6 text-center">
            <h3 className="text-xl font-semibold mb-2">Your Learning Style</h3>
            <p className="text-2xl font-bold text-purple-600 capitalize">{results.learningStyle}</p>
            <p className="text-sm text-gray-600 mt-2">
              You learn best through {results.learningStyle} activities
            </p>
          </div>

          {/* Category Scores */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.entries(results.categoryScores).map(([category, score]) => (
              <div key={category} className="bg-white rounded-lg p-4 text-center border">
                <div className="text-lg font-semibold capitalize">{category}</div>
                <div className="text-2xl font-bold text-purple-600">{score}</div>
              </div>
            ))}
          </div>

          {/* Suggestions */}
          {current.suggestions && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-center">Recommended for You</h3>
              <div className="space-y-3">
                {current.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3">
                    <span className="font-medium">{suggestion.title}</span>
                    <span className="text-purple-600 font-semibold">{suggestion.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow hover:bg-purple-700" 
            onClick={() => window.location.reload()}
          >
            {current.button}
          </button>
        </div>
      );
    }

    return null;
  };

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center mt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Analyzing your learning profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      {renderStepper()}
      {renderContent()}
    </div>
  );
} 