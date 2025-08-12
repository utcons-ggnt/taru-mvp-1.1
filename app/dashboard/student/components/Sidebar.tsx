import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';

// Helper function to render icons with fallback
const IconRenderer = ({ icon, label, size = 24, className = "", isActive = false }: { 
  icon: string; 
  label: string; 
  size?: number;
  className?: string;
  isActive?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Apply active/inactive color styling
  const colorClass = isActive ? 'text-white' : 'text-gray-500';
  const combinedClassName = `${className} ${colorClass}`;
  
  // If icon is an emoji (contains emoji characters), render as text
  if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon)) {
    return <span className={combinedClassName}>{icon}</span>;
  }
  
  // If image failed to load or doesn't start with '/', use emoji fallback
  if (imageError || !icon.startsWith('/')) {
    const fallbackIcons: { [key: string]: React.ReactElement } = {
      'overview': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'modules': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      'diagnostic': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      'progress': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      'rewards': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      'settings': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      'logout': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      ),
      'ai-buddy': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
        </svg>
      )
    };
    
    const iconKey = label.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
    const fallbackIcon = fallbackIcons[iconKey] || (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
    return <span className={combinedClassName}>{fallbackIcon}</span>;
  }
  
  // Render as Image component
  return (
    <Image 
      src={icon} 
      alt={label} 
      width={size} 
      height={size}
      className={`${combinedClassName} object-contain`}
      onError={() => setImageError(true)}
      style={{ minWidth: size, minHeight: size }}
    />
  );
};

// Default student navigation items
const defaultNavItems = [
  { id: 'overview', label: 'Overview', icon: '/icons/overview.png' },
  { id: 'modules', label: 'My Learning Modules', icon: '/icons/modules.png' },
  { id: 'diagnostic', label: 'Take Diagnostic Test', icon: '/icons/diagnostic.png' },
  { id: 'progress', label: 'My Progress Report', icon: '/icons/report.png' },
  { id: 'rewards', label: 'My Rewards & Badges', icon: '/icons/rewards.png' },
  { id: 'settings', label: 'Profile & Settings', icon: '/icons/profile.png' }
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
  navItems?: Array<{ id: string; label: string; icon: string }>;
  role?: 'student' | 'parent' | 'teacher' | 'admin';
}

export default function Sidebar({ activeTab, onTabChange, isOpen = false, onToggle, navItems }: SidebarProps) {
  // Use provided navItems or fall back to default student items
  const items = navItems || defaultNavItems;
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile on component mount and window resize
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      

      
      // If switching from mobile to desktop, ensure sidebar is visible
      if (!mobile && !isOpen) {
        setIsHovered(false);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener with debouncing
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [isOpen]);

  const handleTabChange = (tabId: string) => {
    if (tabId === 'logout') {
      // Handle logout
      onTabChange('logout');
      return;
    }
    
    onTabChange(tabId);
    // Close sidebar after selection on mobile only
    if (onToggle && isMobile) {
      onToggle();
    }
  };

  const sidebarVariants = {
    closed: {
      x: "-100%",
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
    },
    collapsed: {
      width: "80px",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 40
      }
    },
    expanded: {
      width: "320px",
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

  // Determine sidebar state based on screen size and interaction
  const isSidebarExpanded = isMobile ? isOpen : isHovered;

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      {isMobile && (
        <motion.button
          onClick={onToggle}
          className="fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          title={`Mobile Mode - ${isOpen ? 'Open' : 'Closed'}`}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </motion.button>
      )}

      {/* Overlay - Only visible on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-[45] md:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      {isMobile ? (
        <AnimatePresence>
          <motion.aside 
            className={`
              fixed top-0 left-0 bottom-0 z-[50] 
              bg-white border-r border-gray-300 
              flex flex-col justify-between py-6 px-4
              w-80
              ${isSidebarExpanded ? 'shadow-2xl' : ''}
            `}
            variants={sidebarVariants}
            initial={isOpen ? "open" : "closed"}
            animate={isOpen ? "open" : "closed"}
            style={{ touchAction: 'pan-y' }}
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
                  <motion.div 
                    className="block"
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-lg font-bold text-gray-800">Taru2</span>
                  </motion.div>
                </div>
                
                {/* Close Button - Only visible on mobile */}
                <motion.button
                  onClick={onToggle}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-600" />
                </motion.button>
              </motion.div>
              
              {/* Navigation */}
              <nav className="flex flex-col gap-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 
                      font-medium text-gray-900
                      ${activeTab === item.id 
                        ? 'bg-purple-600 text-white shadow-md' 
                        : 'hover:bg-purple-50 active:bg-purple-100'
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
                      className="text-lg"
                      animate={activeTab === item.id ? { 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0]
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <IconRenderer icon={item.icon} label={item.label} size={32} isActive={activeTab === item.id} />
                    </motion.span>
                    <motion.span 
                      className="text-sm"
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
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
                className="flex items-center gap-3 px-4 py-3 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 active:bg-red-200 font-medium transition-all duration-200"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + items.length * 0.1, duration: 0.4 }}
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </motion.span> 
                <motion.span 
                  className="text-sm"
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              </motion.button>
            </div>
            
            {/* AI Buddy Section */}
            <motion.div 
              className="mt-auto"
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
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
                    </svg>
                  </motion.span>
                </motion.div>
                <motion.div 
                  className="text-sm font-semibold text-gray-900 text-center"
                  whileHover={{ scale: 1.05 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Ask <span className="text-purple-600">AI Buddy</span>
                </motion.div>
                <motion.p 
                  className="text-xs text-gray-600 text-center mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0, duration: 0.4 }}
                >
                  Get instant help with your studies
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.aside>
        </AnimatePresence>
      ) : (
        // Desktop sidebar - always visible
        <motion.aside 
          className={`
            fixed top-0 left-0 bottom-0 z-[50] 
            bg-white border-r border-gray-300 
            flex flex-col justify-between py-6 px-4
            w-20
            ${isSidebarExpanded ? 'shadow-2xl' : ''}
          `}
          variants={sidebarVariants}
          initial="collapsed"
          animate={isHovered ? "expanded" : "collapsed"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ touchAction: 'pan-y' }}
        >
          <div>
            {/* Header with Logo */}
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
                <motion.div 
                  className="hidden md:block"
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-lg font-bold text-gray-800">Taru2</span>
                </motion.div>
              </div>
            </motion.div>
            
            {/* Navigation */}
            <nav className="flex flex-col gap-4">
              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-3xl text-left transition-all duration-200 
                    font-medium text-gray-900
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
                    x: 0,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.span 
                    className="text-base"
                    animate={activeTab === item.id ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <IconRenderer icon={item.icon} label={item.label} size={28} isActive={activeTab === item.id} />
                  </motion.span>
                  <motion.span 
                    className="text-sm"
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
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
              className="flex items-center gap-3 px-4 py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 active:bg-red-200 font-medium transition-all duration-200"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + items.length * 0.1, duration: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                x: 0,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span 
                className="text-base"
                whileHover={{ rotate: [0, -20, 20, 0] }}
                transition={{ duration: 0.5 }}
              >
                <IconRenderer icon="/icons/logout.png" label="Logout" size={28} isActive={activeTab === 'logout'} />
              </motion.span> 
              <motion.span 
                className="text-sm"
                animate={{ opacity: isHovered ? 1 : 0 }}
                transition={{ duration: 0.2 }}
              >
                Logout
              </motion.span>
            </motion.button>
          </div>
          
          {/* AI Buddy Section */}
          <motion.div 
            className="mt-auto"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {/* Collapsed state - Only icon visible */}
            {!isSidebarExpanded && (
              <motion.div 
                className="flex justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                <motion.div 
                  className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.5 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.span 
                    className="text-xl text-white"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
                    </svg>
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
            
            {/* Expanded state - Full AI Buddy section */}
            {isSidebarExpanded && (
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
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h6" />
                    </svg>
                  </motion.span>
                </motion.div>
                <motion.div 
                  className="text-sm font-semibold text-gray-900 text-center"
                  whileHover={{ scale: 1.05 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Ask <span className="text-purple-600">AI Buddy</span>
                </motion.div>
                <motion.p 
                  className="text-xs text-gray-600 text-center mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ delay: isHovered ? 0 : 1, duration: 0.4 }}
                >
                  Get instant help with your studies
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </motion.aside>
      )}
    </>
  );
} 