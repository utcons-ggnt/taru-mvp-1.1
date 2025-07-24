import React from 'react';
import { motion } from 'framer-motion';

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
      className="flex gap-4 flex-wrap"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat, index) => (
        <motion.div 
          key={index} 
          className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center border border-gray-100 min-w-[120px]"
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
            className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center mb-2`}
            whileHover={{ 
              scale: 1.1,
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.5 }
            }}
          >
            <motion.span 
              className="text-white text-sm"
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
          </motion.div>
          
          <motion.span 
            className="font-bold text-2xl text-gray-900"
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
            className="text-xs text-gray-500 text-center"
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
            className="text-xs text-gray-400 mt-1"
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