'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface VantaBackgroundProps {
  children: React.ReactNode;
  className?: string;
  color2?: number;
  colorMode?: string;
  birdSize?: number;
  wingSpan?: number;
  separation?: number;
  cohesion?: number;
  quantity?: number;
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
}

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
  className?: string;
}

interface MorphingBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

declare global {
  interface Window {
    THREE: any;
    VANTA: any;
  }
}

const VantaBackground: React.FC<VantaBackgroundProps> = ({
  children,
  className = '',
  color2 = 0x1c00ff,
  colorMode = "lerpGradient",
  birdSize = 1.70,
  wingSpan = 19.00,
  separation = 24.00,
  cohesion = 22.00,
  quantity = 4.00,
  mouseControls = true,
  touchControls = true,
  gyroControls = false,
  minHeight = 200,
  minWidth = 200,
  scale = 1,
  scaleMobile = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const vantaRef = useRef<any>(null);

  useEffect(() => {
    const loadVanta = async () => {
      // Load Three.js first
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = '/three.r134.min.js';
        threeScript.async = true;
        document.head.appendChild(threeScript);
        
        await new Promise((resolve) => {
          threeScript.onload = resolve;
        });
      }

      // Load Vanta.js
      if (!window.VANTA) {
        const vantaScript = document.createElement('script');
        vantaScript.src = '/vanta.birds.min.js';
        vantaScript.async = true;
        document.head.appendChild(vantaScript);
        
        await new Promise((resolve) => {
          vantaScript.onload = resolve;
        });
      }

      // Initialize Vanta BIRDS effect
      if (containerRef.current && window.VANTA && window.THREE) {
        // Clean up previous instance
        if (vantaRef.current) {
          vantaRef.current.destroy();
        }

        vantaRef.current = window.VANTA.BIRDS({
          el: containerRef.current,
          THREE: window.THREE,
          mouseControls,
          touchControls,
          gyroControls,
          minHeight,
          minWidth,
          scale,
          scaleMobile,
          color2,
          colorMode,
          birdSize,
          wingSpan,
          separation,
          cohesion,
          quantity
        });
      }
    };

    loadVanta();

    // Cleanup function
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
      }
    };
  }, [
    color2,
    colorMode,
    birdSize,
    wingSpan,
    separation,
    cohesion,
    quantity,
    mouseControls,
    touchControls,
    gyroControls,
    minHeight,
    minWidth,
    scale,
    scaleMobile
  ]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className}`}
      style={{ position: 'relative' }}
    >
      {children}
    </div>
  );
};

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  colors = ['#8B5CF6', '#A855F7', '#EC4899'],
  className = ''
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              backgroundColor: color,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay,
            }}
          />
        );
      })}
    </div>
  );
};

export const MorphingBlob: React.FC<MorphingBlobProps> = ({
  className = '',
  color = '#8B5CF6',
  size = 200
}) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}40, ${color}20, transparent)`,
      }}
      animate={{
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 180, 360],
        borderRadius: ['50%', '30%', '70%', '50%'],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export default VantaBackground;