import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface StatCard {
  icon: string;
  value: string;
  title: string;
  subtitle: string;
  color: string;
}

interface StatsCardsProps {
  stats: StatCard[];
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="stats-grid w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className="card p-3 sm:p-4 flex flex-col items-center text-center min-w-0 touch-manipulation"
          variants={cardVariants}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { 
              duration: 0.3
            }
          }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div 
            className={`w-7 h-7 sm:w-8 sm:h-8 ${stat.color} rounded-full flex items-center justify-center mb-2`}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 }
            }}
          >
            {stat.icon.startsWith('/') ? (
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.2
                }}
              >
                <Image 
                  src={stat.icon} 
                  alt={stat.title}
                  width={20}
                  height={20}
                  className="w-5 h-5 sm:w-6 sm:h-6"
                />
              </motion.div>
            ) : (
              <motion.span 
                className="text-white text-xs sm:text-sm"
                animate={{ 
                  scale: [1, 1.1, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: index * 0.2
                }}
              >
                {stat.icon}
              </motion.span>
            )}
          </motion.div>
          
          <motion.span 
            className="font-bold text-lg sm:text-2xl text-gray-900 leading-tight"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.3 + index * 0.1,
              duration: 0.4,
              type: "spring",
              stiffness: 200
            }}
          >
            {stat.value}
          </motion.span>
          
          <motion.span 
            className="text-xs text-gray-500 text-center mt-1 leading-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.4 + index * 0.1,
              duration: 0.3
            }}
          >
            {stat.title}
          </motion.span>
          
          <motion.span 
            className="text-xs text-white mt-1 leading-tight bg-purple-500 rounded-lg px-2 py-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: 0.5 + index * 0.1,
              duration: 0.3
            }}
          >
            {stat.subtitle}
          </motion.span>
        </motion.div>
      ))}
    </motion.div>
  );
} 