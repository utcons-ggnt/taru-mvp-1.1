import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'modules', label: 'My Learning Modules', icon: '📦' },
  { id: 'diagnostic', label: 'Take Diagnostic Test', icon: '🧪' },
  { id: 'progress', label: 'My Progress Report', icon: '📈' },
  { id: 'rewards', label: 'My Rewards & Badges', icon: '🏅' },
  { id: 'settings', label: 'Profile & Settings', icon: '⚙️' },
];

export default function Sidebar({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) {
  return (
    <motion.aside 
      className="flex flex-col h-full w-64 bg-white border-r border-gray-300 py-6 px-4 justify-between"
      initial={{ x: -264, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <motion.div 
          className="flex items-center mb-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <motion.div 
            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-3"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Image src="/jio-logo.png" alt="Jio Logo" width={32} height={32} className="w-8 h-8" />
          </motion.div>
        </motion.div>
        
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors font-medium text-gray-900 ${activeTab === item.id ? 'bg-purple-600 text-white' : 'hover:bg-purple-100'}`}
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
                className="text-lg"
                animate={activeTab === item.id ? { 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {item.icon}
              </motion.span>
              <span>{item.label}</span>
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
        
        <motion.button
          onClick={() => onTabChange('logout')}
          className="flex items-center gap-3 px-4 py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 font-medium"
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
            className="text-lg"
            whileHover={{ rotate: [0, -20, 20, 0] }}
            transition={{ duration: 0.5 }}
          >
            🚪
          </motion.span> 
          Logout
        </motion.button>
      </div>
      
      <motion.div 
        className="mt-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div 
          className="bg-purple-100 rounded-xl p-4 flex flex-col items-center cursor-pointer"
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
            className="text-sm font-semibold text-gray-900"
            whileHover={{ scale: 1.05 }}
          >
            Ask <span className="text-purple-600">AI Buddy</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.aside>
  );
} 