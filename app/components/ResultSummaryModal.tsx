'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Bell } from 'lucide-react';
import { useEffect } from 'react';

interface QuestionProgress {
  questionNumber: number;
  status: 'completed' | 'in-progress' | 'pending';
}

interface ResultSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  summary: string;
  onGetCareerPath: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  currentQuestion?: string;
  questionLevel?: string;
  questionNumber?: number;
  progress?: QuestionProgress[];
  showQuestionInterface?: boolean;
}

export default function ResultSummaryModal({
  isOpen,
  onClose,
  score,
  totalQuestions,
  summary,
  onGetCareerPath,
  onPrevious,
  onSubmit,
  currentQuestion,
  questionLevel,
  questionNumber,
  progress,
  showQuestionInterface = false
}: ResultSummaryModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // If showQuestionInterface is true, show the question interface
  if (showQuestionInterface) {
    return <QuestionInterfaceModal 
      isOpen={isOpen}
      onClose={onClose}
      onGetCareerPath={onGetCareerPath}
      onPrevious={onPrevious}
      onSubmit={onSubmit}
      currentQuestion={currentQuestion}
      questionLevel={questionLevel}
      questionNumber={questionNumber}
      progress={progress}
    />;
  }

  // Score Summary Modal (default)
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.44)',
          backdropFilter: 'blur(17px)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Main Modal Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-4xl"
          style={{
            width: '793.86px',
            height: '630px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '40px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 border border-purple-600 rounded-full flex items-center justify-center hover:bg-purple-50 transition-colors z-10"
            style={{
              border: '1px solid #6D18CE',
              borderRadius: '86.5455px'
            }}
          >
            <X className="w-5 h-5 text-purple-600" />
          </button>

          {/* Thumbs Up Icon and Score Display */}
          <div className="flex flex-col items-center pt-16 pb-8">
            {/* Thumbs Up Icon */}
            <div className="relative mb-6">
              <div
                className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center"
                style={{
                  background: '#562CAC',
                  borderRadius: '10px'
                }}
              >
                <span className="text-4xl">👍</span>
              </div>
            </div>

            {/* Your Score Text */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-4xl">🌟</span>
              <h2
                className="text-4xl font-bold text-black"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '38.14px',
                  fontWeight: 700,
                  lineHeight: '46px'
                }}
              >
                Your Score
              </h2>
              <span className="text-4xl">🌟</span>
            </div>

            {/* Score Number */}
            <div
              className="text-9xl font-bold text-purple-600 mb-8"
              style={{
                fontFamily: 'Inter',
                fontSize: '118.59px',
                fontWeight: 700,
                lineHeight: '144px',
                color: '#6D18CE'
              }}
            >
              {score.toString().padStart(2, '0')}
            </div>

            {/* Congratulatory Message */}
            <div
              className="text-center max-w-2xl px-8 mb-8"
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 700,
                lineHeight: '25px',
                color: '#303030'
              }}
            >
              {summary || "Great job! 🎉 You show strong skills in logical thinking and creativity. Your answers reveal a clear interest in engineering and design, with impressive problem-solving and storytelling abilities. Keep exploring coding, puzzles, and imaginative ideas — they align well with your career goals!"}
            </div>

            {/* Get Career Path Button */}
            <button
              onClick={onGetCareerPath}
              className="px-8 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity"
              style={{
                background: '#6D18CE',
                borderRadius: '47.6503px',
                fontFamily: 'Inter',
                fontSize: '14.29px',
                fontWeight: 500,
                width: '185px',
                height: '41px'
              }}
            >
              Get my career path
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Separate component for question interface
function QuestionInterfaceModal({
  isOpen,
  onClose,
  onGetCareerPath,
  onPrevious,
  onSubmit,
  currentQuestion,
  questionLevel,
  questionNumber,
  progress
}: {
  isOpen: boolean;
  onClose: () => void;
  onGetCareerPath: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  currentQuestion?: string;
  questionLevel?: string;
  questionNumber?: number;
  progress?: QuestionProgress[];
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#2AC073', text: '#2AC073', border: '#2AC073' };
      case 'in-progress':
        return { bg: '#4744FF', text: '#4744FF', border: '#4744FF' };
      default:
        return { bg: '#878787', text: '#878787', border: '#878787' };
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{
          background: 'rgba(0, 0, 0, 0.44)',
          backdropFilter: 'blur(17px)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Main Container */}
        <div 
          className="relative mx-auto w-full max-w-7xl"
          style={{
            width: 'min(1400px, 95vw)',
            height: 'min(905px, 90vh)',
            background: '#FFFFFF',
            borderRadius: '40px',
            marginTop: '20px'
          }}
        >
          {/* Background Vectors */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Top Right Vector */}
            <div
              className="absolute opacity-60"
              style={{
                width: '948.59px',
                height: '467.12px',
                right: '-254px',
                top: '-97px',
                background: 'linear-gradient(135deg, #E5E5E5 0%, #F0F0F0 100%)',
                borderRadius: '20px'
              }}
            />
            {/* Bottom Left Vector */}
            <div
              className="absolute opacity-60"
              style={{
                width: '948.59px',
                height: '467.12px',
                left: '-254px',
                bottom: '-97px',
                background: 'linear-gradient(135deg, #E5E5E5 0%, #F0F0F0 100%)',
                borderRadius: '20px'
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-4 md:px-16 py-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-gray-300 rounded-full"
                style={{ background: 'url(image.png)' }}
              />
              <div
                className="relative hidden md:block"
                style={{
                  width: 'min(352px, 25vw)',
                  height: '50.39px',
                  background: '#F5F5F5',
                  borderRadius: '100px'
                }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <span
                  className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '16px',
                    fontWeight: 500
                  }}
                >
                  Search
                </span>
              </div>
            </div>

            {/* User Profile & Notifications */}
            <div className="flex items-center gap-4">
              {/* Notification */}
              <div className="relative">
                <div
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"
                  style={{ background: '#F5F5F5' }}
                >
                  <Bell className="w-6 h-6 text-gray-600" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center"
                  style={{ background: '#FDBB30' }}
                >
                  <span className="text-white text-xs font-semibold">2</span>
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 bg-purple-600 rounded-full flex items-center justify-center"
                  style={{ background: '#6C18CD' }}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                </div>
                <div>
                  <div
                    className="font-bold text-black"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '17.3px',
                      fontWeight: 700
                    }}
                  >
                    Aanya
                  </div>
                  <div
                    className="text-gray-500"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '11.19px',
                      fontWeight: 400
                    }}
                  >
                    #0022
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 border border-purple-600 rounded-full flex items-center justify-center hover:bg-purple-50"
                style={{
                  border: '1px solid #6D18CE',
                  borderRadius: '86.5455px'
                }}
              >
                <X className="w-5 h-5 text-purple-600" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10 px-4 md:px-16 py-4">
            <div className="flex items-center justify-between">
              {/* Progress Lines */}
              <div className="flex items-center gap-0">
                {Array.from({ length: 10 }, (_, i) => (
                  <div
                    key={i}
                    className="h-1"
                    style={{
                      width: '75px',
                      background: '#E2E2E2'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Question Progress Items */}
            <div className="flex items-center justify-between mt-4 overflow-x-auto">
              {progress?.map((item, index) => {
                const colors = getStatusColor(item.status);
                return (
                  <div key={index} className="flex flex-col items-center min-w-0 flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mb-2"
                      style={{
                        background: item.status === 'completed' ? colors.bg : 'transparent',
                        border: `1px solid ${colors.border}`
                      }}
                    >
                      {item.status === 'completed' ? (
                        <div className="w-4 h-4 bg-white rounded-full" />
                      ) : item.status === 'in-progress' ? (
                        <div className="w-4 h-4 bg-white rounded-full" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <div
                      className="text-center mb-2"
                      style={{
                        fontFamily: 'Inter',
                        fontSize: '11px',
                        color: '#878787'
                      }}
                    >
                      Question {item.questionNumber} of 10
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: item.status === 'completed' ? '#EAFFF4' : 
                                   item.status === 'in-progress' ? '#EEEDFF' : 'transparent',
                        color: colors.text,
                        border: item.status === 'pending' ? `1px solid ${colors.border}` : 'none',
                        fontFamily: 'Inter',
                        fontSize: '9.38px'
                      }}
                    >
                      {getStatusText(item.status)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question Section */}
          <div className="relative z-10 px-4 md:px-16 py-8">
            <div className="text-center">
              <div
                className="text-gray-500 mb-4"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '16px',
                  fontWeight: 400
                }}
              >
                Level- {questionLevel}
              </div>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
                <div
                  className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center"
                  style={{
                    background: '#562CAC',
                    borderRadius: '10px'
                  }}
                >
                  <span
                    className="text-white font-bold"
                    style={{
                      fontFamily: 'Inter',
                      fontSize: '31.67px',
                      fontWeight: 700
                    }}
                  >
                    {questionNumber}
                  </span>
                </div>
                <div
                  className="text-center max-w-3xl px-4"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 'clamp(16px, 4vw, 20px)',
                    fontWeight: 700,
                    lineHeight: '30px',
                    color: '#000000'
                  }}
                >
                  {currentQuestion || "In a baseball match, the sequence of player's rotation is Outfielder, Pitcher, Catcher, Outfielder, Pitcher, Catcher.... Who comes next?"}
                </div>
              </div>

              {/* Answer Input */}
              <div
                className="mx-auto p-6 rounded-2xl w-full max-w-4xl"
                style={{
                  width: 'min(891px, 90vw)',
                  height: '223px',
                  background: '#F5F5F5',
                  borderRadius: '15px'
                }}
              >
                <div
                  className="text-gray-600"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: '14px',
                    lineHeight: '25px',
                    fontWeight: 400
                  }}
                >
                  Hello! I'm your AI reading assistant. Upload a PDF and I'll help you understand and interact with the content. You can ask me to explain sentences, define words or simply read text aloud.
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 px-4 md:px-16 py-8">
            {onPrevious && (
              <button
                onClick={onPrevious}
                className="px-6 py-3 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
                style={{
                  background: '#F5F5F5',
                  borderRadius: '47.6503px',
                  fontFamily: 'Inter',
                  fontSize: '14.29px',
                  fontWeight: 500,
                  width: '105px',
                  height: '41px'
                }}
              >
                Previous
              </button>
            )}
            
            {onSubmit && (
              <button
                onClick={onSubmit}
                className="px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
                style={{
                  background: '#6D18CE',
                  borderRadius: '47.6503px',
                  fontFamily: 'Inter',
                  fontSize: '14.29px',
                  fontWeight: 500,
                  width: '105px',
                  height: '41px'
                }}
              >
                Submit
              </button>
            )}
            
            <button
              onClick={onGetCareerPath}
              className="px-6 py-3 rounded-full text-white hover:opacity-90 transition-opacity"
              style={{
                background: '#2AC073',
                borderRadius: '47.6503px',
                fontFamily: 'Inter',
                fontSize: '14.29px',
                fontWeight: 500,
                width: '155px',
                height: '41px'
              }}
            >
              Get My Career
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
