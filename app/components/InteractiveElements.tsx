'use client';

import React from 'react';
import { motion, useMotionValue, useSpring, useTransform, PanInfo, useAnimation } from 'framer-motion';

// Magnetic Button Component
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  magnetStrength?: number;
  springConfig?: { stiffness: number; damping: number };
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  className = '',
  onClick,
  magnetStrength = 0.3,
  springConfig = { stiffness: 300, damping: 30 }
}) => {
  const ref = React.useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (event.clientX - centerX) * magnetStrength;
    const deltaY = (event.clientY - centerY) * magnetStrength;
    
    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={`relative ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.button>
  );
};

// Tilt Card Component
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
  glareEffect?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  tiltStrength = 15,
  glareEffect = true
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]);
  
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = (event.clientX - rect.left) / width - 0.5;
    const mouseY = (event.clientY - rect.top) / height - 0.5;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative transform-gpu ${className}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {children}
      {glareEffect && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-inherit"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, transparent 50%)`
          }}
        />
      )}
    </motion.div>
  );
};

// Draggable Element
interface DraggableElementProps {
  children: React.ReactNode;
  className?: string;
  constraints?: { left: number; right: number; top: number; bottom: number };
  onDragEnd?: (info: PanInfo) => void;
  snapBack?: boolean;
}

export const DraggableElement: React.FC<DraggableElementProps> = ({
  children,
  className = '',
  constraints,
  onDragEnd,
  snapBack = true
}) => {
  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      drag
      dragConstraints={constraints}
      dragElastic={0.1}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        if (onDragEnd) onDragEnd(info);
      }}
      animate={snapBack && !isDragging ? { x: 0, y: 0 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)"
      }}
    >
      {children}
    </motion.div>
  );
};

// Ripple Effect Component
interface RippleButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  rippleColor?: string;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  children,
  className = '',
  onClick,
  rippleColor = 'rgba(255, 255, 255, 0.6)'
}) => {
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
    
    if (onClick) onClick();
  };

  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
      {ripples.map(ripple => (
        <motion.span
          key={ripple.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: rippleColor
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{ 
            width: 300, 
            height: 300, 
            opacity: 0,
            x: -150,
            y: -150
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </motion.button>
  );
};

// Parallax Element
interface ParallaxElementProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ParallaxElement: React.FC<ParallaxElementProps> = ({
  children,
  className = '',
  speed = 0.5,
  direction = 'up'
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [elementTop, setElementTop] = React.useState(0);
  const [clientHeight, setClientHeight] = React.useState(0);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const onScroll = () => {
      const scrolled = window.scrollY;
      const rate = scrolled * -speed;
      
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        
        let transform = '';
        switch (direction) {
          case 'up':
            transform = `translateY(${rate}px)`;
            break;
          case 'down':
            transform = `translateY(${-rate}px)`;
            break;
          case 'left':
            transform = `translateX(${rate}px)`;
            break;
          case 'right':
            transform = `translateX(${-rate}px)`;
            break;
        }
        
        element.style.transform = transform;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed, direction]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

// Morphing Shape
interface MorphingShapeProps {
  shapes: string[];
  className?: string;
  duration?: number;
  autoPlay?: boolean;
}

export const MorphingShape: React.FC<MorphingShapeProps> = ({
  shapes,
  className = '',
  duration = 2,
  autoPlay = true
}) => {
  const [currentShapeIndex, setCurrentShapeIndex] = React.useState(0);

  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentShapeIndex(prev => (prev + 1) % shapes.length);
    }, duration * 1000);

    return () => clearInterval(interval);
  }, [shapes.length, duration, autoPlay]);

  return (
    <motion.div className={className}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.path
          d={shapes[currentShapeIndex]}
          fill="currentColor"
          animate={{ d: shapes[currentShapeIndex] }}
          transition={{ duration, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

// Floating Action Button with expanding menu
interface FloatingActionButtonProps {
  mainIcon: React.ReactNode;
  actions: Array<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
  }>;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  mainIcon,
  actions,
  className = ''
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className={`fixed bottom-6 right-6 ${className}`}>
      {/* Action Items */}
      {actions.map((action, index) => (
        <motion.button
          key={index}
          className={`absolute bottom-16 right-0 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white ${action.color || 'bg-purple-600'} hover:scale-110 transition-transform`}
          initial={{ scale: 0, y: 0 }}
          animate={{
            scale: isOpen ? 1 : 0,
            y: isOpen ? -(60 * (index + 1)) : 0,
            opacity: isOpen ? 1 : 0
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: isOpen ? index * 0.1 : 0
          }}
          onClick={() => {
            action.onClick();
            setIsOpen(false);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {action.icon}
        </motion.button>
      ))}

      {/* Main Button */}
      <motion.button
        className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white"
        onClick={toggleMenu}
        animate={{ rotate: isOpen ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {mainIcon}
      </motion.button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/20 -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

// Custom hook for gesture-based interactions
export const useGestures = () => {
  const [gesture, setGesture] = React.useState<string | null>(null);

  const handlePan = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 50;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > velocityThreshold) {
      if (offset.x > 0) {
        setGesture('swipe-right');
      } else {
        setGesture('swipe-left');
      }
    } else if (Math.abs(offset.y) > swipeThreshold || Math.abs(velocity.y) > velocityThreshold) {
      if (offset.y > 0) {
        setGesture('swipe-down');
      } else {
        setGesture('swipe-up');
      }
    }

    // Clear gesture after a short delay
    setTimeout(() => setGesture(null), 500);
  };

  return { gesture, handlePan };
};
