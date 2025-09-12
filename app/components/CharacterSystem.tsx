'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Character Avatar with Expressions
interface CharacterAvatarProps {
  level: number;
  xp: number;
  maxXP: number;
  mood: 'happy' | 'excited' | 'thinking' | 'sleepy' | 'confused';
  className?: string;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  level,
  xp,
  maxXP,
  mood,
  className = ''
}) => {
  const getMoodExpression = () => {
    switch (mood) {
      case 'happy':
        return { eyes: '😊', mouth: '😄' };
      case 'excited':
        return { eyes: '🤩', mouth: '😆' };
      case 'thinking':
        return { eyes: '🤔', mouth: '😐' };
      case 'sleepy':
        return { eyes: '😴', mouth: '😴' };
      case 'confused':
        return { eyes: '😕', mouth: '😟' };
      default:
        return { eyes: '😊', mouth: '😄' };
    }
  };

  const expression = getMoodExpression();
  const progress = (xp / maxXP) * 100;

  return (
    <motion.div
      className={`relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      animate={{
        y: [0, -5, 0],
        rotate: [0, 2, -2, 0]
      }}
      transition={{
        y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Level Badge */}
      <motion.div
        className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        {level}
      </motion.div>

      {/* Character Face */}
      <div className="text-6xl text-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {expression.eyes}
        </motion.div>
      </div>

      {/* XP Progress Ring */}
      <div className="absolute inset-0 rounded-full border-4 border-gray-200">
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-purple-500"
          style={{
            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progress * 3.6 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((progress * 3.6 - 90) * Math.PI / 180)}%)`
          }}
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </div>

      {/* Floating Hearts */}
      {mood === 'excited' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-red-400 text-xl"
              style={{
                left: `${30 + i * 20}%`,
                top: '10%'
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeOut"
              }}
            >
              ❤️
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Pet Companion
interface PetCompanionProps {
  type: 'cat' | 'dog' | 'dragon' | 'unicorn';
  name: string;
  happiness: number;
  className?: string;
}

export const PetCompanion: React.FC<PetCompanionProps> = ({
  type,
  name,
  happiness,
  className = ''
}) => {
  const getPetEmoji = () => {
    switch (type) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'dragon': return '🐉';
      case 'unicorn': return '🦄';
      default: return '🐱';
    }
  };

  const getHappinessColor = () => {
    if (happiness >= 80) return 'from-green-400 to-emerald-500';
    if (happiness >= 60) return 'from-yellow-400 to-orange-500';
    if (happiness >= 40) return 'from-orange-400 to-red-500';
    return 'from-red-400 to-pink-500';
  };

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${getHappinessColor()} rounded-xl p-4 shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      animate={{
        y: [0, -3, 0],
        rotate: [0, 1, -1, 0]
      }}
      transition={{
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {/* Pet */}
      <div className="text-4xl text-center mb-2">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {getPetEmoji()}
        </motion.div>
      </div>

      {/* Name */}
      <div className="text-center font-bold text-white text-sm mb-2">{name}</div>

      {/* Happiness Bar */}
      <div className="bg-white/30 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${happiness}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Happiness Text */}
      <div className="text-center text-white text-xs mt-1">
        {happiness}% Happy
      </div>

      {/* Floating Bubbles */}
      {happiness >= 80 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/50 rounded-full"
              style={{
                left: `${20 + i * 60}%`,
                bottom: '10%'
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.8,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// Skill Tree Node
interface SkillTreeNodeProps {
  skill: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  onUpgrade: () => void;
  className?: string;
}

export const SkillTreeNode: React.FC<SkillTreeNodeProps> = ({
  skill,
  level,
  maxLevel,
  unlocked,
  onUpgrade,
  className = ''
}) => {
  const canUpgrade = unlocked && level < maxLevel;

  return (
    <motion.div
      className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center cursor-pointer ${className} ${
        unlocked
          ? 'bg-gradient-to-br from-purple-400 to-pink-500 border-purple-600 text-white'
          : 'bg-gray-200 border-gray-400 text-gray-500'
      }`}
      whileHover={unlocked ? { scale: 1.1 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      onClick={unlocked ? onUpgrade : undefined}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Skill Icon */}
      <div className="text-2xl">
        {skill === 'speed' && '⚡'}
        {skill === 'strength' && '💪'}
        {skill === 'wisdom' && '🧠'}
        {skill === 'creativity' && '🎨'}
        {skill === 'teamwork' && '🤝'}
        {skill === 'leadership' && '👑'}
      </div>

      {/* Level Indicator */}
      {unlocked && (
        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {level}
        </div>
      )}

      {/* Upgrade Animation */}
      {canUpgrade && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-yellow-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}

      {/* Lock Icon */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-lg">🔒</div>
        </div>
      )}
    </motion.div>
  );
};

// Mini Game Component
interface MiniGameProps {
  type: 'memory' | 'reaction' | 'pattern';
  onComplete: (score: number) => void;
  className?: string;
}

export const MiniGame: React.FC<MiniGameProps> = ({
  type,
  onComplete,
  className = ''
}) => {
  const [gameState, setGameState] = React.useState<'waiting' | 'playing' | 'completed'>('waiting');
  const [score, setScore] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(10);

  React.useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState('completed');
      onComplete(score);
    }
  }, [gameState, timeLeft, score, onComplete]);

  const startGame = () => {
    setGameState('playing');
    setTimeLeft(10);
    setScore(0);
  };

  const handleClick = () => {
    if (gameState === 'playing') {
      setScore(score + 1);
    }
  };

  return (
    <motion.div
      className={`bg-white rounded-xl p-6 shadow-lg ${className}`}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-xl font-bold mb-4 text-center">
        {type === 'memory' && '🧠 Memory Game'}
        {type === 'reaction' && '⚡ Reaction Test'}
        {type === 'pattern' && '🔢 Pattern Match'}
      </h3>

      {gameState === 'waiting' && (
        <motion.button
          onClick={startGame}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Game
        </motion.button>
      )}

      {gameState === 'playing' && (
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-4">
            Score: {score}
          </div>
          <div className="text-lg text-gray-600 mb-4">
            Time: {timeLeft}s
          </div>
          <motion.button
            onClick={handleClick}
            className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-2xl font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            CLICK!
          </motion.button>
        </div>
      )}

      {gameState === 'completed' && (
        <div className="text-center">
          <div className="text-3xl mb-4">🎉</div>
          <div className="text-xl font-bold text-green-600 mb-2">
            Game Complete!
          </div>
          <div className="text-lg text-gray-600">
            Final Score: {score}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Collectible Item
interface CollectibleItemProps {
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  collected: boolean;
  onCollect: () => void;
  className?: string;
}

export const CollectibleItem: React.FC<CollectibleItemProps> = ({
  name,
  rarity,
  icon,
  collected,
  onCollect,
  className = ''
}) => {
  const getRarityColor = () => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-500';
      case 'epic': return 'from-purple-400 to-purple-500';
      case 'legendary': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <motion.div
      className={`relative p-4 rounded-xl border-2 ${className} ${
        collected
          ? `bg-gradient-to-br ${getRarityColor()} text-white border-transparent`
          : 'bg-gray-100 text-gray-500 border-gray-300'
      }`}
      whileHover={!collected ? { scale: 1.05 } : {}}
      whileTap={!collected ? { scale: 0.95 } : {}}
      onClick={!collected ? onCollect : undefined}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Icon */}
      <div className="text-4xl text-center mb-2">{icon}</div>

      {/* Name */}
      <div className="text-center font-semibold text-sm">{name}</div>

      {/* Rarity Badge */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
        rarity === 'legendary' ? 'bg-yellow-400' :
        rarity === 'epic' ? 'bg-purple-500' :
        rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
      }`} />

      {/* Collection Animation */}
      {collected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  );
};
