'use client';

import React from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Star, Trophy, Zap, Target, Flame, Crown, Gem, Rocket } from 'lucide-react';

// XP Progress Bar with Level System
interface XPProgressBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  maxXP,
  level,
  className = ''
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const controls = useAnimation();
  
  const progress = (currentXP / maxXP) * 100;

  React.useEffect(() => {
    if (isInView) {
      controls.start({ width: `${progress}%` });
    }
  }, [isInView, progress, controls]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Level Badge */}
      <motion.div
        className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg"
        initial={{ scale: 0, rotate: -180 }}
        animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
      >
        {level}
      </motion.div>

      {/* Progress Container */}
      <div className="bg-gray-200 rounded-full h-6 overflow-hidden relative">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Progress Fill */}
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden"
          initial={{ width: 0 }}
          animate={controls}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>

        {/* XP Text */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm drop-shadow-lg">
          {currentXP}/{maxXP} XP
        </div>
      </div>

      {/* Floating Stars */}
      {progress >= 100 && (
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{
            y: [0, -10, 0],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
        </motion.div>
      )}
    </div>
  );
};

// Achievement Badge Component
interface AchievementBadgeProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  title,
  description,
  icon,
  rarity,
  unlocked,
  className = ''
}) => {
  const getRarityStyles = () => {
    switch (rarity) {
      case 'common':
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-700',
          glow: 'shadow-gray-200'
        };
      case 'rare':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-300',
          text: 'text-blue-700',
          glow: 'shadow-blue-200'
        };
      case 'epic':
        return {
          bg: 'bg-purple-100',
          border: 'border-purple-300',
          text: 'text-purple-700',
          glow: 'shadow-purple-200'
        };
      case 'legendary':
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-orange-100',
          border: 'border-yellow-400',
          text: 'text-yellow-800',
          glow: 'shadow-yellow-300'
        };
    }
  };

  const styles = getRarityStyles();

  return (
    <motion.div
      className={`relative p-4 rounded-xl border-2 ${styles.bg} ${styles.border} ${styles.text} ${className} ${
        unlocked ? styles.glow : 'opacity-50'
      }`}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Rarity Indicator */}
      <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
        rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
        rarity === 'epic' ? 'bg-purple-500' :
        rarity === 'rare' ? 'bg-blue-500' : 'bg-gray-500'
      }`} />

      {/* Icon */}
      <motion.div
        className="text-3xl mb-2"
        animate={unlocked ? {
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      <p className="text-xs opacity-75">{description}</p>

      {/* Unlock Animation */}
      {unlocked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}
    </motion.div>
  );
};

// Streak Counter with Fire Animation
interface StreakCounterProps {
  count: number;
  type: 'daily' | 'weekly' | 'monthly';
  className?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  count,
  type,
  className = ''
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'daily':
        return { icon: Flame, color: 'from-orange-400 to-red-500', label: 'Day Streak' };
      case 'weekly':
        return { icon: Target, color: 'from-blue-400 to-purple-500', label: 'Week Streak' };
      case 'monthly':
        return { icon: Crown, color: 'from-purple-400 to-pink-500', label: 'Month Streak' };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <motion.div
      className={`relative bg-gradient-to-br ${config.color} text-white p-4 rounded-xl shadow-lg ${className}`}
      whileHover={{ scale: 1.05 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Fire Particles */}
      {count > 0 && (
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                bottom: '10%'
              }}
              animate={{
                y: [0, -50, -100],
                opacity: [1, 0.8, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-center">
        <Icon className="w-8 h-8 mx-auto mb-2" />
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm opacity-90">{config.label}</div>
      </div>

      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

// Power-up Card Component
interface PowerUpCardProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  cost: number;
  owned: number;
  onPurchase: () => void;
  className?: string;
}

export const PowerUpCard: React.FC<PowerUpCardProps> = ({
  name,
  description,
  icon,
  cost,
  owned,
  onPurchase,
  className = ''
}) => {
  return (
    <motion.div
      className={`bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 ${className}`}
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Icon with Glow */}
      <motion.div
        className="text-4xl mb-3 text-center"
        whileHover={{ scale: 1.2, rotate: 10 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon}
      </motion.div>

      {/* Name */}
      <h3 className="font-bold text-lg mb-2 text-center">{name}</h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 text-center">{description}</p>

      {/* Cost and Owned */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm">
          <span className="text-gray-500">Cost: </span>
          <span className="font-bold text-purple-600">{cost} XP</span>
        </div>
        <div className="text-sm">
          <span className="text-gray-500">Owned: </span>
          <span className="font-bold text-green-600">{owned}</span>
        </div>
      </div>

      {/* Purchase Button */}
      <motion.button
        onClick={onPurchase}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Purchase
      </motion.button>
    </motion.div>
  );
};

// Leaderboard Component
interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  avatar: string;
  badge?: string;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  className?: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  entries,
  className = ''
}) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Gem className="w-5 h-5 text-orange-500" />;
      default: return <span className="text-lg font-bold text-gray-500">#{rank}</span>;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-center">🏆 Leaderboard</h3>
      
      <div className="space-y-3">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.rank}
            className={`flex items-center p-3 rounded-lg ${
              entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
            }`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8 h-8 mr-3">
              {getRankIcon(entry.rank)}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold mr-3">
              {entry.name.charAt(0).toUpperCase()}
            </div>

            {/* Name and Score */}
            <div className="flex-1">
              <div className="font-semibold">{entry.name}</div>
              <div className="text-sm text-gray-500">{entry.score} points</div>
            </div>

            {/* Badge */}
            {entry.badge && (
              <div className="text-2xl">{entry.badge}</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Quest Card Component
interface QuestCardProps {
  title: string;
  description: string;
  reward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  onClaim: () => void;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  title,
  description,
  reward,
  progress,
  maxProgress,
  completed,
  onClaim,
  className = ''
}) => {
  const progressPercent = (progress / maxProgress) * 100;

  return (
    <motion.div
      className={`bg-white rounded-xl p-4 shadow-lg border-2 ${
        completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
      } ${className}`}
      whileHover={{ y: -3, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-lg">{title}</h3>
        <div className="text-right">
          <div className="text-sm text-gray-500">Reward</div>
          <div className="font-bold text-purple-600">{reward} XP</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">{description}</p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>{progress}/{maxProgress}</span>
        </div>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Action Button */}
      {completed ? (
        <motion.button
          onClick={onClaim}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-semibold"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🎉 Claim Reward!
        </motion.button>
      ) : (
        <div className="w-full bg-gray-200 text-gray-500 py-2 px-4 rounded-lg font-semibold text-center">
          {progressPercent.toFixed(0)}% Complete
        </div>
      )}
    </motion.div>
  );
};

// Floating Action Button with Animation
interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  color?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  label,
  color = 'from-purple-500 to-pink-500',
  className = ''
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r ${color} text-white rounded-full shadow-2xl flex items-center justify-center z-50 ${className}`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      animate={{
        y: [0, -10, 0],
        boxShadow: [
          '0 10px 25px rgba(0,0,0,0.2)',
          '0 20px 40px rgba(0,0,0,0.3)',
          '0 10px 25px rgba(0,0,0,0.2)'
        ]
      }}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        },
        boxShadow: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {icon}
      {label && (
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {label}
        </motion.div>
      )}
    </motion.button>
  );
};
