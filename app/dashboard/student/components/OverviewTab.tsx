'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Zap, Play, ChevronRight, Star, Clock, Users } from 'lucide-react';

interface Course {
  title: string;
  lessonsCompleted: string;
  duration: string;
  xp: string;
  color: string;
}

interface Test {
  title: string;
  date: string;
  color: string;
}

interface OverviewTabProps {
  courses: Course[];
  tests: Test[];
  onTabChange: (tab: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OverviewTab({ courses, tests: _tests, onTabChange }: OverviewTabProps) {
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
      scale: 0.95
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

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const quickActions = [
    { 
      icon: Target, 
      title: 'Take Assessment', 
      description: 'Test your knowledge & skills', 
      action: 'diagnostic',
      gradient: 'from-blue-500 to-purple-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      icon: TrendingUp, 
      title: 'View Progress', 
      description: 'Track your learning journey', 
      action: 'progress',
      gradient: 'from-green-500 to-emerald-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    { 
      icon: Award, 
      title: 'Earn Rewards', 
      description: 'Unlock achievements & badges', 
      action: 'rewards',
      gradient: 'from-yellow-500 to-orange-600',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ];

  return (
    <motion.div 
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Welcome Banner */}
      <motion.div 
        className="gradient-primary rounded-2xl p-6 text-white relative overflow-hidden"
        variants={sectionVariants}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-4 right-4 opacity-20">
          <Zap className="w-24 h-24" />
        </div>
        <div className="relative z-10">
          <motion.h2 
            className="text-2xl font-bold mb-2 flex items-center gap-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Star className="w-6 h-6 text-yellow-400" />
            Keep Learning!
          </motion.h2>
          <motion.p 
            className="text-white/90 mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Continue your learning journey and unlock new achievements
          </motion.p>
          <motion.div 
            className="flex gap-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="glass-dark rounded-lg px-3 py-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">5 min/day</span>
            </div>
            <div className="glass-dark rounded-lg px-3 py-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">Join 10K+ learners</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Current Learning Section */}
      <motion.div variants={sectionVariants}>
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Continue Learning
            </h3>
            <p className="text-gray-600 mt-1">Pick up where you left off</p>
          </div>
          <motion.button
            onClick={() => onTabChange('modules')}
            className="btn-secondary flex items-center gap-2 text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
        
        {courses.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {courses.map((course, index) => (
              <motion.div 
                key={index} 
                className="card-modern group cursor-pointer"
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  y: -8,
                  transition: { 
                    duration: 0.3
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden"
                      style={{backgroundColor: course.color}}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <div className="absolute inset-0 bg-white bg-opacity-20"></div>
                      <BookOpen className="w-6 h-6 text-white relative z-10" />
                    </motion.div>
                    <motion.button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play className="w-4 h-4 text-gray-600" />
                    </motion.button>
                  </div>
                  
                  <motion.h4 
                    className="font-bold text-gray-900 mb-2 text-lg group-hover:text-purple-600 transition-colors duration-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                  >
                    {course.title}
                  </motion.h4>
                  
                  <motion.p 
                    className="text-gray-600 mb-4 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
                  >
                    Progress: {course.lessonsCompleted}
                  </motion.p>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                      transition={{ delay: 0.5 + index * 0.2, duration: 1 }}
                    />
                  </div>
                  
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <span>{course.xp}</span>
                      </div>
                    </div>
                    <motion.button 
                      className="text-purple-600 text-sm font-semibold hover:text-purple-700 flex items-center gap-1 transition-colors duration-200"
                      onClick={() => window.location.href = '#modules'}
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="card-modern p-8 text-center border-2 border-dashed border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50"
            variants={cardVariants}
            whileHover={{ 
              scale: 1.02,
              borderColor: "#9333ea",
              transition: { duration: 0.3 }
            }}
          >
            <motion.div 
              className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden"
              whileHover={{ 
                scale: 1.1,
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              <BookOpen className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-white bg-opacity-20"></div>
            </motion.div>
            
            <motion.h4 
              className="text-2xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              No Learning Modules Yet
            </motion.h4>
            
            <motion.p 
              className="text-gray-600 mb-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Start exploring recommended modules based on your interests and skill level. Begin your learning journey today!
            </motion.p>
            
            <motion.button 
              onClick={() => onTabChange('modules')}
              className="btn-modern btn-primary"
              whileHover={{ 
                scale: 1.05,
              }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Modules
            </motion.button>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Actions Section */}
      <motion.div variants={sectionVariants}>
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div>
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Quick Actions
            </h3>
            <p className="text-gray-600 mt-1">Boost your learning with these actions</p>
          </div>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {quickActions.map((item, index) => (
            <motion.div
              key={index}
              className="card-modern group cursor-pointer relative overflow-hidden"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.03,
                y: -5,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onTabChange(item.action)}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="p-6 relative z-10">
                <motion.div 
                  className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  <motion.div
                    className="absolute inset-0 bg-white bg-opacity-50 rounded-full scale-0 group-hover:scale-110 transition-transform duration-300"
                  />
                </motion.div>
                
                <motion.h4 
                  className="font-bold text-gray-900 mb-2 text-lg group-hover:text-purple-600 transition-colors duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                >
                  {item.title}
                </motion.h4>
                
                <motion.p 
                  className="text-gray-600 text-sm mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                >
                  {item.description}
                </motion.p>

                <motion.div 
                  className="flex items-center text-purple-600 font-semibold text-sm group-hover:text-purple-700 transition-colors duration-200"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1, duration: 0.4 }}
                >
                  <span>Get Started</span>
                  <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Learning Streak */}
      <motion.div 
        className="card-modern p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
        variants={sectionVariants}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-lg">Learning Streak</h4>
              <p className="text-gray-600 text-sm">Keep the momentum going!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">7</div>
            <div className="text-sm text-gray-600">days</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2 + i * 0.1, duration: 0.3 }}
            >
              <span className="text-white text-xs font-bold">{i + 1}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
} 