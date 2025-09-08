'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  summary: string;
  onGetCareerPath: () => void;
}

export default function ScoreModal({
  isOpen,
  onClose,
  score,
  summary,
  onGetCareerPath
}: ScoreModalProps) {
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'rgba(0, 0, 0, 0.44)',
          backdropFilter: 'blur(17px)'
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative mx-4 w-full max-w-4xl"
          style={{
            width: 'min(793.86px, 95vw)',
            height: 'min(630px, 80vh)',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '40px'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10"
            style={{
              width: '40px',
              height: '40px',
              border: '1px solid #6D18CE',
              borderRadius: '86.5455px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white'
            }}
          >
            <X className="w-5 h-5 text-purple-600" />
          </button>

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

          {/* Content Container */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 md:px-8 py-8 md:py-12">
            {/* Thumbs Up Emoji */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 7.61 }}
              transition={{ delay: 0.2, type: "spring", damping: 10 }}
              className="text-8xl mb-4"
              style={{ transform: 'rotate(7.61deg)' }}
            >
              👍
            </motion.div>

            {/* Your Score Text with Stars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4"
            >
              <span className="text-4xl">🌟</span>
              <h2
                id="modal-title"
                className="text-2xl sm:text-4xl font-bold text-black"
                style={{
                  fontFamily: 'Inter',
                  fontSize: 'clamp(24px, 6vw, 38.1358px)',
                  lineHeight: '46px',
                  fontWeight: 700
                }}
              >
                Your Score
              </h2>
              <span className="text-4xl">🌟</span>
            </motion.div>

            {/* Score Display */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: "spring", damping: 8 }}
              className="mb-6"
            >
              <span
                className="text-6xl sm:text-9xl font-bold"
                style={{
                  color: '#6D18CE',
                  fontFamily: 'Inter',
                  fontSize: 'clamp(60px, 15vw, 118.585px)',
                  lineHeight: '144px',
                  fontWeight: 700
                }}
              >
                {score.toString().padStart(2, '0')}
              </span>
            </motion.div>

            {/* Summary Message */}
            <motion.p
              id="modal-description"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center max-w-2xl mb-8 px-4"
              style={{
                fontFamily: 'Inter',
                fontSize: 'clamp(14px, 3vw, 16px)',
                lineHeight: '25px',
                fontWeight: 700,
                color: '#303030'
              }}
            >
              {summary || "Great job! 🎉 You show strong skills in logical thinking and creativity. Your answers reveal a clear interest in engineering and design, with impressive problem-solving and storytelling abilities. Keep exploring coding, puzzles, and imaginative ideas — they align well with your career goals!"}
            </motion.p>

            {/* Get Career Path Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={onGetCareerPath}
              className="px-8 py-4 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
              style={{
                background: '#6D18CE',
                borderRadius: '47.6503px',
                fontFamily: 'Inter',
                fontSize: '14.2946px',
                lineHeight: '17px',
                fontWeight: 500,
                width: '185px',
                height: '41px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              Get my career path
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
