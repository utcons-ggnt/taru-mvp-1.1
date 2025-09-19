'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ResultSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  summary: string;
  onGetCareerPath: () => void;
}

export default function ResultSummaryModal({
  isOpen,
  onClose,
  score,
  totalQuestions,
  summary,
  onGetCareerPath
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

  // Simplified Score Summary Modal
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
          className="relative w-full max-w-2xl"
          style={{
            width: '600px',
            height: '500px',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '40px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 border border-purple-600 rounded-full flex items-center justify-center hover:bg-purple-50 transition-colors z-10"
            style={{
              border: '1px solid #6D18CE',
              borderRadius: '86.5455px'
            }}
          >
            <X className="w-5 h-5 text-purple-600" />
          </button>

          {/* Content Container */}
          <div className="flex flex-col items-center justify-center h-full px-8 py-12">
            {/* Thumbs Up Icon */}
            <div className="relative mb-8">
              <div
                className="w-20 h-20 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                style={{
                  background: '#562CAC',
                  borderRadius: '10px'
                }}
              >
                <span className="text-5xl">👍</span>
              </div>
            </div>

            {/* Your Score Text */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">🌟</span>
              <h2
                className="text-4xl font-bold text-black"
                style={{
                  fontFamily: 'Inter',
                  fontSize: '38px',
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
              className="text-8xl font-bold text-purple-600 mb-8"
              style={{
                fontFamily: 'Inter',
                fontSize: '100px',
                fontWeight: 700,
                lineHeight: '120px',
                color: '#6D18CE'
              }}
            >
              {score.toString().padStart(2, '0')}
            </div>

            {/* Summary Message */}
            <div
              className="text-center max-w-xl mb-10 px-4"
              style={{
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                color: '#303030'
              }}
            >
              {summary || "Great job! 🎉 You show strong skills in logical thinking and creativity. Your answers reveal a clear interest in engineering and design, with impressive problem-solving and storytelling abilities. Keep exploring coding, puzzles, and imaginative ideas — they align well with your career goals!"}
            </div>

            {/* Get Career Path Button */}
            <button
              onClick={onGetCareerPath}
              className="px-10 py-4 rounded-full text-white font-semibold hover:opacity-90 transition-opacity shadow-lg"
              style={{
                background: '#6D18CE',
                borderRadius: '47.6503px',
                fontFamily: 'Inter',
                fontSize: '16px',
                fontWeight: 600,
                minWidth: '200px',
                height: '50px'
              }}
            >
              Get My Career Path
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

