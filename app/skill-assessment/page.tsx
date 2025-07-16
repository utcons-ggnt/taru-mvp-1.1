'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SkillAssessmentData {
  languagePreference: string;
  enableVoiceInstructions: boolean;
  preferredLearningStyle: string[];
  bestLearningEnvironment: string[];
  subjectsILike: string[];
  topicsThatExciteMe: string[];
  howISpendFreeTime: string[];
  thingsImConfidentDoing: string[];
  thingsINeedHelpWith: string[];
  dreamJobAsKid: string;
  currentCareerInterest: string[];
  peopleIAdmire: string[];
  whatImMostProudOf: string;
  ifICouldFixOneProblem: string;
}

const languages = [
  'English', 'Hindi', 'Spanish', 'French', 'German', 'Chinese', 'Arabic', 'Other'
];

const learningStyles = [
  { id: 'visual', label: 'Visual Learning', icon: '👁️', description: 'I learn best by seeing pictures, diagrams, and videos' },
  { id: 'auditory', label: 'Auditory Learning', icon: '👂', description: 'I learn best by listening and talking' },
  { id: 'reading', label: 'Reading/Writing', icon: '📖', description: 'I learn best by reading and writing' },
  { id: 'kinesthetic', label: 'Hands-on Learning', icon: '✋', description: 'I learn best by doing and moving around' }
];

const learningEnvironments = [
  { id: 'quiet', label: 'Quiet Space', icon: '🤫', image: '/images/quiet-space.jpg' },
  { id: 'group', label: 'Group Study', icon: '👥', image: '/images/group-study.jpg' },
  { id: 'outdoor', label: 'Outdoor Learning', icon: '🌳', image: '/images/outdoor-learning.jpg' },
  { id: 'technology', label: 'Technology-Rich', icon: '💻', image: '/images/tech-learning.jpg' },
  { id: 'creative', label: 'Creative Space', icon: '🎨', image: '/images/creative-space.jpg' },
  { id: 'structured', label: 'Structured Classroom', icon: '🏫', image: '/images/classroom.jpg' }
];

const subjects = [
  'Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education',
  'Computer Science', 'Literature', 'Philosophy', 'Economics', 'Psychology', 'Sociology', 'Biology',
  'Chemistry', 'Physics', 'Astronomy', 'Engineering', 'Design', 'Cooking', 'Gardening', 'Sports'
];

const excitingTopics = [
  { id: 'space', label: 'Space & Astronomy', icon: '🚀', description: 'Exploring the universe and planets' },
  { id: 'robots', label: 'Robots & AI', icon: '🤖', description: 'How machines think and work' },
  { id: 'nature', label: 'Nature & Animals', icon: '🦁', description: 'Wildlife and ecosystems' },
  { id: 'oceans', label: 'Oceans & Marine Life', icon: '🐋', description: 'Underwater world exploration' },
  { id: 'inventions', label: 'Inventions & Technology', icon: '💡', description: 'How things are created' },
  { id: 'cultures', label: 'Different Cultures', icon: '🌍', description: 'People and traditions worldwide' },
  { id: 'music', label: 'Music & Sound', icon: '🎵', description: 'Creating and understanding music' },
  { id: 'art', label: 'Art & Creativity', icon: '🎨', description: 'Expressing through colors and shapes' }
];

const freeTimeActivities = [
  { id: 'reading', label: 'Reading Books', icon: '📚', description: 'Getting lost in stories' },
  { id: 'gaming', label: 'Playing Games', icon: '🎮', description: 'Video games and board games' },
  { id: 'sports', label: 'Sports & Exercise', icon: '⚽', description: 'Running, playing, staying active' },
  { id: 'drawing', label: 'Drawing & Art', icon: '✏️', description: 'Creating with colors and lines' },
  { id: 'music', label: 'Music & Singing', icon: '🎤', description: 'Playing instruments or singing' },
  { id: 'cooking', label: 'Cooking & Baking', icon: '👨‍🍳', description: 'Making delicious food' },
  { id: 'puzzles', label: 'Puzzles & Brain Games', icon: '🧩', description: 'Solving problems and riddles' },
  { id: 'nature', label: 'Nature Walks', icon: '🌿', description: 'Exploring outdoors' }
];

const confidentActivities = [
  { id: 'math', label: 'Solving Math Problems', icon: '🔢', description: 'Numbers and calculations' },
  { id: 'writing', label: 'Writing Stories', icon: '✍️', description: 'Creating with words' },
  { id: 'drawing', label: 'Drawing Pictures', icon: '🎨', description: 'Making art' },
  { id: 'speaking', label: 'Speaking in Public', icon: '🗣️', description: 'Talking to groups' },
  { id: 'helping', label: 'Helping Others', icon: '🤝', description: 'Supporting friends and family' },
  { id: 'organizing', label: 'Organizing Things', icon: '📦', description: 'Keeping things neat' },
  { id: 'sports', label: 'Playing Sports', icon: '🏃', description: 'Physical activities' },
  { id: 'technology', label: 'Using Technology', icon: '💻', description: 'Computers and devices' }
];

const needHelpWith = [
  { id: 'math', label: 'Math Problems', icon: '🔢', description: 'Complex calculations' },
  { id: 'writing', label: 'Writing Essays', icon: '✍️', description: 'Long writing assignments' },
  { id: 'speaking', label: 'Speaking in Public', icon: '🗣️', description: 'Presentations and speeches' },
  { id: 'reading', label: 'Reading Comprehension', icon: '📖', description: 'Understanding what I read' },
  { id: 'science', label: 'Science Experiments', icon: '🧪', description: 'Lab work and experiments' },
  { id: 'history', label: 'Remembering Dates', icon: '📅', description: 'Historical facts and dates' },
  { id: 'art', label: 'Art Projects', icon: '🎨', description: 'Creative assignments' },
  { id: 'technology', label: 'Computer Skills', icon: '💻', description: 'Using software and apps' }
];

const careerInterests = [
  'Technology', 'Healthcare', 'Business', 'Arts', 'Science', 'Engineering', 'Education', 'Law',
  'Finance', 'Marketing', 'Design', 'Agriculture', 'Sports', 'Media', 'Environment', 'Cooking',
  'Fashion', 'Architecture', 'Psychology', 'Social Work', 'Music', 'Dance', 'Photography', 'Writing'
];

const admiredPeople = [
  { id: 'einstein', label: 'Albert Einstein', icon: '🧠', description: 'Scientist who changed physics' },
  { id: 'gandhi', label: 'Mahatma Gandhi', icon: '🕊️', description: 'Peaceful leader for freedom' },
  { id: 'curie', label: 'Marie Curie', icon: '⚛️', description: 'Pioneering scientist' },
  { id: 'mandela', label: 'Nelson Mandela', icon: '✊', description: 'Fighter for equality' },
  { id: 'jobs', label: 'Steve Jobs', icon: '🍎', description: 'Technology innovator' },
  { id: 'mother', label: 'My Mother', icon: '👩', description: 'The strongest person I know' },
  { id: 'father', label: 'My Father', icon: '👨', description: 'My role model' },
  { id: 'teacher', label: 'My Teacher', icon: '👩‍🏫', description: 'Someone who inspires me' }
];

// Add type definitions for SpeechRecognition and SpeechRecognitionEvent if missing
// @ts-expect-error: SpeechRecognition is not available in all browsers
type SpeechRecognition = typeof window.SpeechRecognition;
// @ts-expect-error: SpeechRecognitionEvent is not available in all browsers
type SpeechRecognitionEvent = typeof window.SpeechRecognitionEvent;

export default function SkillAssessment() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SkillAssessmentData>({
    languagePreference: '',
    enableVoiceInstructions: false,
    preferredLearningStyle: [],
    bestLearningEnvironment: [],
    subjectsILike: [],
    topicsThatExciteMe: [],
    howISpendFreeTime: [],
    thingsImConfidentDoing: [],
    thingsINeedHelpWith: [],
    dreamJobAsKid: '',
    currentCareerInterest: [],
    peopleIAdmire: [],
    whatImMostProudOf: '',
    ifICouldFixOneProblem: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const router = useRouter();

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!formData.languagePreference) newErrors.languagePreference = 'Please select a language preference';
        if (formData.preferredLearningStyle.length === 0) {
          newErrors.preferredLearningStyle = 'Please select at least one learning style';
        }
        if (formData.bestLearningEnvironment.length === 0) {
          newErrors.bestLearningEnvironment = 'Please select at least one learning environment';
        }
        break;
      
      case 2:
        if (formData.subjectsILike.length === 0) {
          newErrors.subjectsILike = 'Please select at least one subject you like';
        }
        if (formData.topicsThatExciteMe.length === 0) {
          newErrors.topicsThatExciteMe = 'Please select at least one exciting topic';
        }
        if (formData.howISpendFreeTime.length === 0) {
          newErrors.howISpendFreeTime = 'Please select at least one free time activity';
        }
        break;
      
      case 3:
        if (formData.thingsImConfidentDoing.length === 0) {
          newErrors.thingsImConfidentDoing = 'Please select at least one thing you\'re confident doing';
        }
        if (formData.thingsINeedHelpWith.length === 0) {
          newErrors.thingsINeedHelpWith = 'Please select at least one area where you need help';
        }
        if (!formData.dreamJobAsKid.trim()) {
          newErrors.dreamJobAsKid = 'Please tell us your dream job as a kid';
        }
        if (formData.currentCareerInterest.length === 0) {
          newErrors.currentCareerInterest = 'Please select at least one current career interest';
        }
        break;
      
      case 4:
        if (formData.peopleIAdmire.length === 0) {
          newErrors.peopleIAdmire = 'Please select at least one person you admire';
        }
        if (!formData.whatImMostProudOf.trim()) {
          newErrors.whatImMostProudOf = 'Please tell us what you\'re most proud of';
        }
        if (!formData.ifICouldFixOneProblem.trim()) {
          newErrors.ifICouldFixOneProblem = 'Please tell us what problem you\'d like to fix';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof SkillAssessmentData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMultiSelect = (field: keyof SkillAssessmentData, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const startSpeechRecognition = (field: string) => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as unknown as typeof window & { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: unknown) => {
        const transcript = (event as SpeechRecognitionEvent).results[0][0].transcript;
        handleInputChange(field as keyof SkillAssessmentData, transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        alert('Speech recognition error. Please try again.');
      };

      recognition.start();
    } else {
      alert('Speech recognition is not supported in this browser');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/assessment/skills-interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/diagnostic-assessment');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit assessment');
      }
    } catch (error) {
      console.error('Assessment submission error:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Skill & Interest Form
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Let&apos;s get to know you better! This will help us create your perfect learning experience.
        </p>
      </div>

      {/* Language Preference */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Language Preference
        </label>
        <select
          value={formData.languagePreference}
          onChange={(e) => handleInputChange('languagePreference', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.languagePreference ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
        >
          <option value="">Select your preferred language</option>
          {languages.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        {errors.languagePreference && (
          <p className="text-red-500 text-sm mt-2">{errors.languagePreference}</p>
        )}
      </div>

      {/* Voice Instructions Toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Enable Voice Instructions
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Get audio guidance throughout your learning journey
          </p>
        </div>
        <button
          onClick={() => handleInputChange('enableVoiceInstructions', !formData.enableVoiceInstructions)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            formData.enableVoiceInstructions ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              formData.enableVoiceInstructions ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Preferred Learning Style */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preferred Learning Style
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningStyles.map(style => (
            <button
              key={style.id}
              onClick={() => handleMultiSelect('preferredLearningStyle', style.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.preferredLearningStyle.includes(style.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{style.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{style.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.preferredLearningStyle && (
          <p className="text-red-500 text-sm mt-2">{errors.preferredLearningStyle}</p>
        )}
      </div>

      {/* Best Learning Environment */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Best Learning Environment
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {learningEnvironments.map(env => (
            <button
              key={env.id}
              onClick={() => handleMultiSelect('bestLearningEnvironment', env.id)}
              className={`p-4 border-2 rounded-lg text-center transition-all ${
                formData.bestLearningEnvironment.includes(env.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="text-3xl mb-2">{env.icon}</div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{env.label}</h4>
            </button>
          ))}
        </div>
        {errors.bestLearningEnvironment && (
          <p className="text-red-500 text-sm mt-2">{errors.bestLearningEnvironment}</p>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          What Interests You?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Tell us about the subjects and topics that make you excited to learn!
        </p>
      </div>

      {/* Subjects I Like */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Subjects I Like
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {subjects.map(subject => (
            <button
              key={subject}
              onClick={() => handleMultiSelect('subjectsILike', subject)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.subjectsILike.includes(subject)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">{subject}</span>
            </button>
          ))}
        </div>
        {errors.subjectsILike && (
          <p className="text-red-500 text-sm mt-2">{errors.subjectsILike}</p>
        )}
      </div>

      {/* Topics That Excite Me */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Topics That Excite Me
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {excitingTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => handleMultiSelect('topicsThatExciteMe', topic.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.topicsThatExciteMe.includes(topic.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{topic.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{topic.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.topicsThatExciteMe && (
          <p className="text-red-500 text-sm mt-2">{errors.topicsThatExciteMe}</p>
        )}
      </div>

      {/* How I Spend Free Time */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How I Spend Free Time
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freeTimeActivities.map(activity => (
            <button
              key={activity.id}
              onClick={() => handleMultiSelect('howISpendFreeTime', activity.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.howISpendFreeTime.includes(activity.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{activity.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.howISpendFreeTime && (
          <p className="text-red-500 text-sm mt-2">{errors.howISpendFreeTime}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Your Strengths & Goals
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Help us understand what you&apos;re good at and what you want to improve!
        </p>
      </div>

      {/* Things I'm Confident Doing */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Things I&apos;m Confident Doing
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {confidentActivities.map(activity => (
            <button
              key={activity.id}
              onClick={() => handleMultiSelect('thingsImConfidentDoing', activity.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.thingsImConfidentDoing.includes(activity.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{activity.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{activity.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.thingsImConfidentDoing && (
          <p className="text-red-500 text-sm mt-2">{errors.thingsImConfidentDoing}</p>
        )}
      </div>

      {/* Things I Need Help With */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Things I Need Help With
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {needHelpWith.map(item => (
            <button
              key={item.id}
              onClick={() => handleMultiSelect('thingsINeedHelpWith', item.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.thingsINeedHelpWith.includes(item.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.thingsINeedHelpWith && (
          <p className="text-red-500 text-sm mt-2">{errors.thingsINeedHelpWith}</p>
        )}
      </div>

      {/* Dream Job as a Kid */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Dream Job as a Kid
        </label>
        <input
          type="text"
          value={formData.dreamJobAsKid}
          onChange={(e) => handleInputChange('dreamJobAsKid', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.dreamJobAsKid ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
          placeholder="e.g., Astronaut, Doctor, Teacher, Artist..."
        />
        {errors.dreamJobAsKid && (
          <p className="text-red-500 text-sm mt-2">{errors.dreamJobAsKid}</p>
        )}
      </div>

      {/* Current Career Interest */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Career Interest
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {careerInterests.map(career => (
            <button
              key={career}
              onClick={() => handleMultiSelect('currentCareerInterest', career)}
              className={`p-3 border-2 rounded-lg text-center transition-all ${
                formData.currentCareerInterest.includes(career)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <span className="font-medium text-gray-900 dark:text-white">{career}</span>
            </button>
          ))}
        </div>
        {errors.currentCareerInterest && (
          <p className="text-red-500 text-sm mt-2">{errors.currentCareerInterest}</p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Final Thoughts
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Share your inspirations and dreams with us!
        </p>
      </div>

      {/* People I Admire */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          People I Admire
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admiredPeople.map(person => (
            <button
              key={person.id}
              onClick={() => handleMultiSelect('peopleIAdmire', person.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                formData.peopleIAdmire.includes(person.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{person.icon}</span>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{person.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{person.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {errors.peopleIAdmire && (
          <p className="text-red-500 text-sm mt-2">{errors.peopleIAdmire}</p>
        )}
      </div>

      {/* What I'm Most Proud Of */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          What I&apos;m Most Proud Of
        </label>
        <div className="relative">
          <textarea
            value={formData.whatImMostProudOf}
            onChange={(e) => handleInputChange('whatImMostProudOf', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.whatImMostProudOf ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            rows={4}
            placeholder="Tell us about something you&apos;re really proud of..."
          />
          <button
            onClick={() => startSpeechRecognition('whatImMostProudOf')}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            🎤
          </button>
        </div>
        {errors.whatImMostProudOf && (
          <p className="text-red-500 text-sm mt-2">{errors.whatImMostProudOf}</p>
        )}
      </div>

      {/* If I Could Fix One Problem */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
          If I Could Fix One Problem
        </label>
        <div className="relative">
          <textarea
            value={formData.ifICouldFixOneProblem}
            onChange={(e) => handleInputChange('ifICouldFixOneProblem', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.ifICouldFixOneProblem ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
            rows={4}
            placeholder="If you could fix one problem in the world, what would it be? (Use your own words, it&apos;s your dream!)"
          />
          <button
            onClick={() => startSpeechRecognition('ifICouldFixOneProblem')}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isListening ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}
          >
            🎤
          </button>
        </div>
        {errors.ifICouldFixOneProblem && (
          <p className="text-red-500 text-sm mt-2">{errors.ifICouldFixOneProblem}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-300 dark:from-blue-700 dark:to-purple-700 transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white dark:bg-gray-800 shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 dark:text-gray-300 sm:text-lg sm:leading-7">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </div>
              <div className="flex justify-between">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    Previous
                  </button>
                )}
                {currentStep < 4 && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Next
                  </button>
                )}
                {currentStep === 4 && (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}