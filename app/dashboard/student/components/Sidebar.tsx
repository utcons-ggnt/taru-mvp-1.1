import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'modules', label: 'My Learning Modules', icon: '📦' },
  { id: 'diagnostic', label: 'Take Diagnostic Test', icon: '🧪' },
  { id: 'progress', label: 'My Progress Report', icon: '📈' },
  { id: 'rewards', label: 'My Rewards & Badges', icon: '🏅' },
  { id: 'settings', label: 'Profile & Settings', icon: '⚙️' },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ activeTab, onTabChange, isOpen = false, onToggle }: SidebarProps) {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // Close mobile menu after selection
    if (onToggle && window.innerWidth < 768) {
      onToggle();
    }
  };

  const sidebarVariants = {
    closed: {
      x: "-100vw",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40
      }
    }
  };

  const overlayVariants = {
    closed: {
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <motion.button
        onClick={onToggle}
        className="md:hidden fixed top-4 left-4 z-60 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        <motion.aside 
          className={`
            fixed md:static top-0 left-0 bottom-0 z-50 
            w-80 md:w-64 bg-white border-r border-gray-300 
            flex flex-col justify-between py-6 px-4
            md:transform-none
            ${isOpen ? 'shadow-2xl' : ''}
          `}
          variants={sidebarVariants}
          initial={window?.innerWidth < 768 ? "closed" : "open"}
          animate={window?.innerWidth < 768 ? (isOpen ? "open" : "closed") : "open"}
        >
          <div>
            {/* Header with Logo and Close Button */}
            <motion.div 
              className="flex items-center justify-between mb-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex items-center">
                <motion.div 
                  className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image src="/jio-logo.png" alt="Jio Logo" width={32} height={32} className="w-8 h-8" />
                </motion.div>
                <div className="hidden md:block">
                  <span className="text-lg font-bold text-gray-800">Taru2</span>
                </div>
              </div>
              
              {/* Mobile Close Button */}
              <motion.button
                onClick={onToggle}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-gray-600" />
              </motion.button>
            </motion.div>
            
            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 md:py-2 rounded-lg text-left transition-all duration-200 
                    font-medium text-gray-900 touch-manipulation
                    ${activeTab === item.id 
                      ? 'bg-purple-600 text-white shadow-md' 
                      : 'hover:bg-purple-100 active:bg-purple-200'
                    }
                  `}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 5,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span 
                    className="text-lg md:text-base"
                    animate={activeTab === item.id ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.span>
                  <span className="text-sm md:text-sm">{item.label}</span>
                  {activeTab === item.id && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>
            
            {/* Logout Button */}
            <motion.button
              onClick={() => handleTabChange('logout')}
              className="flex items-center gap-3 px-4 py-3 md:py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 active:bg-red-200 font-medium touch-manipulation transition-all duration-200"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + navItems.length * 0.1, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                x: 5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span 
                className="text-lg md:text-base"
                whileHover={{ rotate: [0, -20, 20, 0] }}
                transition={{ duration: 0.5 }}
              >
                🚪
              </motion.span> 
              <span className="text-sm md:text-sm">Logout</span>
            </motion.button>
          </div>
          
          {/* AI Buddy Section */}
          <motion.div 
            className="mt-10"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <motion.div 
              className="bg-purple-100 rounded-xl p-4 flex flex-col items-center cursor-pointer touch-manipulation"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(147, 51, 234, 0.3)",
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div 
                className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-2"
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -10, 10, 0],
                  transition: { duration: 0.5 }
                }}
              >
                <motion.span 
                  className="text-2xl text-white"
                  animate={{ 
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  🤖
                </motion.span>
              </motion.div>
              <motion.div 
                className="text-sm font-semibold text-gray-900 text-center"
                whileHover={{ scale: 1.05 }}
              >
                Ask <span className="text-purple-600">AI Buddy</span>
              </motion.div>
              <motion.p 
                className="text-xs text-gray-600 text-center mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.4 }}
              >
                Get instant help with your studies
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.aside>
      </AnimatePresence>
    </>
  );
} 