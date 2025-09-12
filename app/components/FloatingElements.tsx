'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Floating Particles Background
interface FloatingParticlesProps {
  count?: number;
  className?: string;
  colors?: string[];
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  count = 20,
  className = '',
  colors = ['#6D18CE', '#8B5CF6', '#A855F7', '#C084FC', '#DDD6FE']
}) => {
  const particles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 2,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));
  }, [count, colors]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full opacity-20"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Floating Icons
interface FloatingIconsProps {
  icons: React.ReactNode[];
  className?: string;
  density?: number;
}

export const FloatingIcons: React.FC<FloatingIconsProps> = ({
  icons,
  className = '',
  density = 10
}) => {
  const floatingIcons = React.useMemo(() => {
    return Array.from({ length: density }, (_, i) => ({
      id: i,
      icon: icons[Math.floor(Math.random() * icons.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      scale: Math.random() * 0.5 + 0.5,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 8
    }));
  }, [icons, density]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {floatingIcons.map((item) => (
        <motion.div
          key={item.id}
          className="absolute text-purple-300 opacity-10"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `scale(${item.scale})`
          }}
          animate={{
            y: [0, -50, 0],
            rotate: [0, 360],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear"
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};

// Morphing Blob
interface MorphingBlobProps {
  className?: string;
  color?: string;
  size?: number;
}

export const MorphingBlob: React.FC<MorphingBlobProps> = ({
  className = '',
  color = '#8B5CF6',
  size = 200
}) => {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color}40, transparent)`
      }}
      animate={{
        scale: [1, 1.2, 0.8, 1],
        rotate: [0, 180, 360],
        x: [0, 50, -30, 0],
        y: [0, -30, 40, 0]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

// Animated Grid Background
interface AnimatedGridProps {
  className?: string;
  gridSize?: number;
  lineColor?: string;
  animate?: boolean;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  className = '',
  gridSize = 50,
  lineColor = '#e5e7eb',
  animate = true
}) => {
  return (
    <div className={`absolute inset-0 ${className}`}>
      <svg
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(${lineColor} 1px, transparent 1px),
            linear-gradient(90deg, ${lineColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`
        }}
      >
        {animate && (
          <motion.defs>
            <motion.pattern
              id="grid-pattern"
              width={gridSize}
              height={gridSize}
              patternUnits="userSpaceOnUse"
              animate={{
                x: [0, gridSize],
                y: [0, gridSize]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <path
                d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
                fill="none"
                stroke={lineColor}
                strokeWidth="1"
              />
            </motion.pattern>
          </motion.defs>
        )}
      </svg>
    </div>
  );
};

// Floating Bubbles
interface FloatingBubblesProps {
  count?: number;
  className?: string;
  colors?: string[];
  speed?: number;
}

export const FloatingBubbles: React.FC<FloatingBubblesProps> = ({
  count = 15,
  className = '',
  colors = ['rgba(109, 24, 206, 0.1)', 'rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)'],
  speed = 1
}) => {
  const bubbles = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 20,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: (Math.random() * 10 + 10) / speed,
      delay: Math.random() * 5
    }));
  }, [count, colors, speed]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            background: bubble.color,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            backdropFilter: 'blur(1px)'
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(bubble.id) * 50, 0],
            scale: [0.5, 1, 0.5],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Constellation Background
interface ConstellationProps {
  className?: string;
  nodeCount?: number;
  connectionDistance?: number;
  nodeColor?: string;
  lineColor?: string;
}

export const Constellation: React.FC<ConstellationProps> = ({
  className = '',
  nodeCount = 30,
  connectionDistance = 150,
  nodeColor = '#8B5CF6',
  lineColor = '#8B5CF6'
}) => {
  const [nodes, setNodes] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
  }>>([]);

  React.useEffect(() => {
    const initialNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    }));
    setNodes(initialNodes);

    const animate = () => {
      setNodes(prevNodes => 
        prevNodes.map(node => ({
          ...node,
          x: (node.x + node.vx + window.innerWidth) % window.innerWidth,
          y: (node.y + node.vy + window.innerHeight) % window.innerHeight
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, [nodeCount]);

  const connections = React.useMemo(() => {
    const conns: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const distance = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
        );
        
        if (distance < connectionDistance) {
          conns.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            opacity: 1 - distance / connectionDistance
          });
        }
      }
    }
    
    return conns;
  }, [nodes, connectionDistance]);

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <svg className="w-full h-full">
        {/* Connections */}
        {connections.map((conn, index) => (
          <line
            key={index}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke={lineColor}
            strokeWidth="1"
            opacity={conn.opacity * 0.3}
          />
        ))}
        
        {/* Nodes */}
        {nodes.map((node) => (
          <circle
            key={node.id}
            cx={node.x}
            cy={node.y}
            r="2"
            fill={nodeColor}
            opacity="0.6"
          />
        ))}
      </svg>
    </div>
  );
};
