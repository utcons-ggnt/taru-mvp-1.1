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
    const fallbackEmojis: { [key: string]: string } = {
      'overview': '📊',
      'modules': '📦',
      'diagnostic': '🧪',
      'progress': '📈',
      'rewards': '🏅',
      'settings': '⚙️',
      'logout': '🚪',
      'ai-buddy': '🤖'
    };
    
    const iconKey = label.toLowerCase().replace(/\s+/g, '-').replace(/[&]/g, '');
    const fallbackEmoji = fallbackEmojis[iconKey] || '📄';
    return <span className={combinedClassName}>{fallbackEmoji}</span>;
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

  // Check if we're on mobile on component mount
  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // If switching from mobile to desktop, ensure sidebar is visible
      if (!mobile && !isOpen) {
        // On desktop, sidebar should always be visible
        setIsHovered(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Add touch event handling for better mobile experience
    const handleTouchStart = (e: TouchEvent) => {
      // Prevent default touch behavior on sidebar elements
      if (e.target && (e.target as Element).closest('.sidebar-touch-area')) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, [isOpen]);

  const handleTabChange = (tabId: string) => {
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
          className="fixed top-4 left-4 z-60 p-2 bg-white rounded-lg shadow-lg border border-gray-200 md:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Menu className="w-6 h-6 text-gray-700" />
        </motion.button>
      )}

      {/* Overlay - Only visible on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
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
              fixed top-0 left-0 bottom-0 z-50 
              bg-white border-r border-gray-300 
              flex flex-col justify-between py-6 px-4
              sidebar-touch-area
              w-80
              ${isSidebarExpanded ? 'shadow-2xl' : ''}
            `}
            variants={sidebarVariants}
            initial={isOpen ? "open" : "closed"}
            animate={isOpen ? "open" : "closed"}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
          >
            <div>
              {/* Header with Logo and Close Button - Always show logo, but only show text when expanded */}
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
              
              {/* Navigation - Always show icons, but only show text when expanded */}
              <nav className="flex flex-col gap-4">
                {items.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 
                      font-medium text-gray-900 touch-manipulation
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
              
              {/* Logout Button - Always show icon, but only show text when expanded */}
              <motion.button
                onClick={() => handleTabChange('logout')}
                className="flex items-center gap-3 px-4 py-3 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 active:bg-red-200 font-medium touch-manipulation transition-all duration-200"
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
                  <IconRenderer icon="🚪" label="Logout" size={32} isActive={activeTab === 'logout'} />
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
              {/* Expanded state - Full AI Buddy section */}
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
                    <IconRenderer icon="🤖" label="AI Buddy" size={40} isActive={false} />
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
            fixed top-0 left-0 bottom-0 z-50 
            bg-white border-r border-gray-300 
            flex flex-col justify-between py-6 px-4
            sidebar-touch-area
            w-20
            ${isSidebarExpanded ? 'shadow-2xl' : ''}
          `}
          variants={sidebarVariants}
          initial="collapsed"
          animate={isHovered ? "expanded" : "collapsed"}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div>
            {/* Header with Logo and Close Button - Always show logo, but only show text when expanded */}
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
            
            {/* Navigation - Always show icons, but only show text when expanded */}
            <nav className="flex flex-col gap-4">
                              {items.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-3xl text-left transition-all duration-200 
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
            
            {/* Logout Button - Always show icon, but only show text when expanded */}
            <motion.button
              onClick={() => handleTabChange('logout')}
              className="flex items-center gap-3 px-4 py-2 mt-6 rounded-lg text-left text-red-600 hover:bg-red-100 active:bg-red-200 font-medium touch-manipulation transition-all duration-200"
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
                    <IconRenderer icon="🤖" label="AI Buddy" size={32} isActive={false} />
                  </motion.span>
                </motion.div>
              </motion.div>
            )}
            
            {/* Expanded state - Full AI Buddy section */}
            {isSidebarExpanded && (
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
                    <IconRenderer icon="🤖" label="AI Buddy" size={40} isActive={false} />
                  </motion.span>
                </motion.div>
                <motion.div 
                  className="text-sm font-semibold text-gray-900 text-center"
                  whileHover={{ scale: 1.05 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
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