'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Confetti Effect
interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  className?: string;
}

export const ConfettiEffect: React.FC<ConfettiProps> = ({
  trigger,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -10,
    color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][Math.floor(Math.random() * 6)],
    shape: Math.random() > 0.5 ? 'circle' : 'square',
    size: Math.random() * 8 + 4,
    rotation: Math.random() * 360
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {confettiPieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '50%' : '0%',
            transform: `rotate(${piece.rotation}deg)`
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [piece.rotation, piece.rotation + 360],
            scale: [1, 0.5, 0]
          }}
          transition={{
            duration: 3,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Star Burst Effect
interface StarBurstProps {
  trigger: boolean;
  position: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
}

export const StarBurstEffect: React.FC<StarBurstProps> = ({
  trigger,
  position,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  const stars = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) * (Math.PI / 180),
    distance: Math.random() * 100 + 50
  }));

  return (
    <div className={`fixed pointer-events-none z-50 ${className}`}>
      {stars.map((star) => {
        const x = position.x + Math.cos(star.angle) * star.distance;
        const y = position.y + Math.sin(star.angle) * star.distance;
        
        return (
          <motion.div
            key={star.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full"
            style={{
              left: x,
              top: y
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [1, 1, 0],
              x: [0, Math.cos(star.angle) * 20],
              y: [0, Math.sin(star.angle) * 20]
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: Math.random() * 0.3
            }}
          />
        );
      })}
    </div>
  );
};

// Floating Hearts Effect
interface FloatingHeartsProps {
  trigger: boolean;
  count?: number;
  onComplete?: () => void;
  className?: string;
}

export const FloatingHeartsEffect: React.FC<FloatingHeartsProps> = ({
  trigger,
  count = 10,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  const hearts = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 100,
    size: Math.random() * 20 + 10,
    color: ['#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className={`fixed inset-0 pointer-events-none z-50 ${className}`}>
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            width: heart.size,
            height: heart.size,
            color: heart.color
          }}
          animate={{
            y: [-100, -window.innerHeight - 100],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 360],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 4,
            ease: "easeOut",
            delay: Math.random() * 2
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Magic Sparkles Effect
interface MagicSparklesProps {
  trigger: boolean;
  position: { x: number; y: number };
  onComplete?: () => void;
  className?: string;
}

export const MagicSparklesEffect: React.FC<MagicSparklesProps> = ({
  trigger,
  position,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: position.x + (Math.random() - 0.5) * 100,
    y: position.y + (Math.random() - 0.5) * 100,
    size: Math.random() * 6 + 2,
    color: ['#FFD700', '#FFA500', '#FF69B4', '#00BFFF'][Math.floor(Math.random() * 4)]
  }));

  return (
    <div className={`fixed pointer-events-none z-50 ${className}`}>
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            width: sparkle.size,
            height: sparkle.size,
            backgroundColor: sparkle.color,
            borderRadius: '50%'
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 1, 0],
            x: [0, (Math.random() - 0.5) * 50],
            y: [0, (Math.random() - 0.5) * 50]
          }}
          transition={{
            duration: 2,
            ease: "easeOut",
            delay: Math.random() * 0.5
          }}
        />
      ))}
    </div>
  );
};

// Level Up Effect
interface LevelUpEffectProps {
  trigger: boolean;
  level: number;
  onComplete?: () => void;
  className?: string;
}

export const LevelUpEffect: React.FC<LevelUpEffectProps> = ({
  trigger,
  level,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center pointer-events-none z-50 ${className}`}>
      {/* Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 3 }}
      />

      {/* Level Up Text */}
      <motion.div
        className="relative text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
          animate={{
            textShadow: [
              '0 0 20px rgba(255, 215, 0, 0.5)',
              '0 0 40px rgba(255, 215, 0, 0.8)',
              '0 0 20px rgba(255, 215, 0, 0.5)'
            ]
          }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          LEVEL UP!
        </motion.h1>
        <motion.div
          className="text-4xl font-bold text-yellow-500 mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Level {level}
        </motion.div>
      </motion.div>

      {/* Floating Stars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 2) * 40}%`
          }}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 360],
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            ease: "easeOut"
          }}
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
};

// Combo Effect
interface ComboEffectProps {
  trigger: boolean;
  combo: number;
  onComplete?: () => void;
  className?: string;
}

export const ComboEffect: React.FC<ComboEffectProps> = ({
  trigger,
  combo,
  onComplete,
  className = ''
}) => {
  const [isActive, setIsActive] = React.useState(false);

  React.useEffect(() => {
    if (trigger) {
      setIsActive(true);
      const timer = setTimeout(() => {
        setIsActive(false);
        if (onComplete) onComplete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isActive) return null;

  return (
    <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 ${className}`}>
      <motion.div
        className="text-center"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {combo}x COMBO!
        </motion.div>
        
        {/* Combo Multiplier Effect */}
        <motion.div
          className="text-2xl font-bold text-yellow-500 mt-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          +{combo * 10} XP
        </motion.div>
      </motion.div>
    </div>
  );
};
