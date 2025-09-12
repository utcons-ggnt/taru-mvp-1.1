'use client';

import React from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

// Parallax Scroll Component
interface ParallaxScrollProps {
  children: React.ReactNode;
  offset?: number;
  className?: string;
}

export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  offset = 50,
  className = ''
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  return (
    <motion.div ref={ref} style={{ y: springY }} className={className}>
      {children}
    </motion.div>
  );
};

// Scroll Progress Indicator
interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: string;
}

export const ScrollProgress: React.FC<ScrollProgressProps> = ({
  className = '',
  color = '#6D18CE',
  height = '4px'
}) => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      className={`fixed top-0 left-0 right-0 z-50 origin-left ${className}`}
      style={{
        scaleX,
        height,
        backgroundColor: color
      }}
    />
  );
};

// Scroll-triggered fade in
interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const ScrollFade: React.FC<ScrollFadeProps> = ({
  children,
  className = '',
  threshold = 0.3,
  delay = 0,
  direction = 'up'
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: `-${(1 - threshold) * 100}% 0px` as any 
  });

  const getInitialPosition = () => {
    switch (direction) {
      case 'down': return { y: -50 };
      case 'left': return { x: 50 };
      case 'right': return { x: -50 };
      default: return { y: 50 }; // up
    }
  };

  const variants = {
    hidden: { 
      opacity: 0,
      ...getInitialPosition()
    },
    visible: { 
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered scale animation
interface ScrollScaleProps {
  children: React.ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
  threshold?: number;
}

export const ScrollScale: React.FC<ScrollScaleProps> = ({
  children,
  className = '',
  scaleFrom = 0.8,
  scaleTo = 1,
  threshold = 0.3
}) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, threshold, 1], [scaleFrom, scaleTo, scaleTo]);
  const opacity = useTransform(scrollYProgress, [0, threshold], [0, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered rotation
interface ScrollRotateProps {
  children: React.ReactNode;
  className?: string;
  rotation?: number;
}

export const ScrollRotate: React.FC<ScrollRotateProps> = ({
  children,
  className = '',
  rotation = 360
}) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const rotate = useTransform(scrollYProgress, [0, 1], [0, rotation]);

  return (
    <motion.div
      ref={ref}
      style={{ rotate }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Staggered scroll reveal
interface ScrollStaggerProps {
  children: React.ReactNode[];
  className?: string;
  staggerDelay?: number;
  threshold?: number;
}

export const ScrollStagger: React.FC<ScrollStaggerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  threshold = 0.3
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { 
    once: true, 
    margin: `-${(1 - threshold) * 100}% 0px` as any 
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Scroll-triggered number counter
interface ScrollCounterProps {
  from: number;
  to: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}

export const ScrollCounter: React.FC<ScrollCounterProps> = ({
  from,
  to,
  duration = 2,
  className = '',
  suffix = '',
  prefix = ''
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    if (!isInView) return;

    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateCount = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (endTime - startTime), 1);
      const easeOutProgress = 1 - Math.pow(1 - progress, 3);
      const currentCount = Math.round(from + (to - from) * easeOutProgress);
      
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count}{suffix}
    </span>
  );
};

// Scroll-triggered text reveal
interface ScrollTextRevealProps {
  text: string;
  className?: string;
  revealDirection?: 'left' | 'right' | 'center';
}

export const ScrollTextReveal: React.FC<ScrollTextRevealProps> = ({
  text,
  className = '',
  revealDirection = 'left'
}) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const getClipPath = () => {
    switch (revealDirection) {
      case 'right':
        return {
          hidden: 'inset(0 0 0 100%)',
          visible: 'inset(0 0 0 0%)'
        };
      case 'center':
        return {
          hidden: 'inset(0 50% 0 50%)',
          visible: 'inset(0 0% 0 0%)'
        };
      default: // left
        return {
          hidden: 'inset(0 100% 0 0)',
          visible: 'inset(0 0% 0 0)'
        };
    }
  };

  const clipPath = getClipPath();

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.span
        className={className}
        initial={{ clipPath: clipPath.hidden }}
        animate={isInView ? { clipPath: clipPath.visible } : { clipPath: clipPath.hidden }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        {text}
      </motion.span>
    </div>
  );
};

// Scroll-triggered morphing background
interface ScrollMorphBackgroundProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
}

export const ScrollMorphBackground: React.FC<ScrollMorphBackgroundProps> = ({
  children,
  className = '',
  colors = ['#6D18CE', '#8B5CF6', '#A855F7', '#C084FC']
}) => {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const colorIndex = useTransform(scrollYProgress, [0, 1], [0, colors.length - 1]);
  
  const [currentColor, setCurrentColor] = React.useState(colors[0]);

  React.useEffect(() => {
    return colorIndex.onChange((latest) => {
      const index = Math.round(latest);
      if (colors[index]) {
        setCurrentColor(colors[index]);
      }
    });
  }, [colorIndex, colors]);

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={{
        backgroundColor: currentColor
      }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Scroll-triggered path drawing
interface ScrollPathDrawProps {
  path: string;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
}

export const ScrollPathDraw: React.FC<ScrollPathDrawProps> = ({
  path,
  className = '',
  strokeColor = '#6D18CE',
  strokeWidth = 2,
  fillColor = 'none'
}) => {
  const ref = React.useRef<SVGPathElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  const pathLength = React.useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return ref.current?.getTotalLength() || 0;
  }, []);

  return (
    <svg className={className} viewBox="0 0 100 100">
      <motion.path
        ref={ref}
        d={path}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill={fillColor}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        style={{
          pathLength: 0
        }}
      />
    </svg>
  );
};
