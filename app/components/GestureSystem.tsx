'use client';

import React from 'react';
import { motion, PanInfo, useDragControls, useMotionValue, useTransform } from 'framer-motion';

// Swipe gesture component
interface SwipeGestureProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  className?: string;
}

export const SwipeGesture: React.FC<SwipeGestureProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
  className = ''
}) => {
  const handleDragEnd = (event: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Check horizontal swipes
    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (offset.x < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
    
    // Check vertical swipes
    if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > 500) {
      if (offset.y > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (offset.y < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  };

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
    >
      {children}
    </motion.div>
  );
};

// Pull to refresh component
interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 80,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const y = useMotionValue(0);
  
  const handleDrag = (event: any, info: PanInfo) => {
    if (info.offset.y > 0) {
      y.set(info.offset.y);
      setPullDistance(info.offset.y);
    }
  };

  const handleDragEnd = async (event: any, info: PanInfo) => {
    if (info.offset.y > threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        y.set(0);
      }
    } else {
      setPullDistance(0);
      y.set(0);
    }
  };

  const refreshIconRotation = useTransform(
    y,
    [0, threshold],
    [0, 180]
  );

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-gradient-to-b from-purple-100 to-transparent"
        style={{
          height: Math.min(pullDistance, threshold),
          opacity: pullDistance > 20 ? 1 : 0
        }}
        transition={{ opacity: { duration: 0.2 } }}
      >
        <motion.div
          style={{ rotate: refreshIconRotation }}
          className="text-purple-600"
        >
          {isRefreshing ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"
            />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ y }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Long press gesture
interface LongPressProps {
  children: React.ReactNode;
  onLongPress: () => void;
  duration?: number;
  className?: string;
}

export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  duration = 500,
  className = ''
}) => {
  const [isPressed, setIsPressed] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePressStart = () => {
    setIsPressed(true);
    timeoutRef.current = setTimeout(() => {
      onLongPress();
      setIsPressed(false);
    }, duration);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={className}
      onPointerDown={handlePressStart}
      onPointerUp={handlePressEnd}
      onPointerLeave={handlePressEnd}
      animate={{
        scale: isPressed ? 0.95 : 1,
        opacity: isPressed ? 0.8 : 1
      }}
      transition={{ duration: 0.1 }}
    >
      {children}
      {isPressed && (
        <motion.div
          className="absolute inset-0 bg-purple-500 rounded-lg opacity-20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: duration / 1000 }}
        />
      )}
    </motion.div>
  );
};

// Pinch to zoom gesture
interface PinchZoomProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  className?: string;
}

export const PinchZoom: React.FC<PinchZoomProps> = ({
  children,
  minScale = 0.5,
  maxScale = 3,
  className = ''
}) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(Math.max(scale + delta, minScale), maxScale);
    setScale(newScale);
  };

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className={`relative overflow-hidden ${className}`} onWheel={handleWheel}>
      <motion.div
        drag
        dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
        animate={{
          scale,
          x: position.x,
          y: position.y
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onDoubleClick={resetTransform}
        className="cursor-grab active:cursor-grabbing"
      >
        {children}
      </motion.div>
      
      {/* Scale indicator */}
      {scale !== 1 && (
        <motion.div
          className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Math.round(scale * 100)}%
        </motion.div>
      )}
    </div>
  );
};

// Sortable list with drag and drop
interface SortableItem {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (newOrder: SortableItem[]) => void;
  className?: string;
}

export const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  className = ''
}) => {
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [reorderedItems, setReorderedItems] = React.useState(items);

  React.useEffect(() => {
    setReorderedItems(items);
  }, [items]);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    onReorder(reorderedItems);
  };

  const handleDragOver = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) return;

    const draggedIndex = reorderedItems.findIndex(item => item.id === draggedItem);
    const targetIndex = reorderedItems.findIndex(item => item.id === targetId);

    const newItems = [...reorderedItems];
    const [draggedElement] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedElement);

    setReorderedItems(newItems);
  };

  return (
    <div className={className}>
      {reorderedItems.map((item, index) => (
        <motion.div
          key={item.id}
          layoutId={item.id}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragStart={() => handleDragStart(item.id)}
          onDragEnd={handleDragEnd}
          onDragOver={() => handleDragOver(item.id)}
          whileDrag={{ 
            scale: 1.02, 
            zIndex: 1000,
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}
          animate={{
            opacity: draggedItem === item.id ? 0.8 : 1
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="cursor-grab active:cursor-grabbing"
        >
          {item.content}
        </motion.div>
      ))}
    </div>
  );
};

// Double tap gesture
interface DoubleTapProps {
  children: React.ReactNode;
  onDoubleTap: () => void;
  delay?: number;
  className?: string;
}

export const DoubleTap: React.FC<DoubleTapProps> = ({
  children,
  onDoubleTap,
  delay = 300,
  className = ''
}) => {
  const [tapCount, setTapCount] = React.useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleTap = () => {
    setTapCount(prev => prev + 1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (tapCount + 1 === 2) {
        onDoubleTap();
      }
      setTapCount(0);
    }, delay);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={className}
      onTap={handleTap}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.div>
  );
};

// Custom hook for gesture detection
export const useGestureDetection = () => {
  const [currentGesture, setCurrentGesture] = React.useState<string | null>(null);
  const [gestureData, setGestureData] = React.useState<any>(null);

  const detectSwipe = React.useCallback((info: PanInfo) => {
    const { offset, velocity } = info;
    const threshold = 50;
    const velocityThreshold = 500;

    if (Math.abs(offset.x) > threshold || Math.abs(velocity.x) > velocityThreshold) {
      const direction = offset.x > 0 ? 'right' : 'left';
      setCurrentGesture(`swipe-${direction}`);
      setGestureData({ direction, distance: Math.abs(offset.x), velocity: Math.abs(velocity.x) });
    } else if (Math.abs(offset.y) > threshold || Math.abs(velocity.y) > velocityThreshold) {
      const direction = offset.y > 0 ? 'down' : 'up';
      setCurrentGesture(`swipe-${direction}`);
      setGestureData({ direction, distance: Math.abs(offset.y), velocity: Math.abs(velocity.y) });
    }

    // Clear gesture after a delay
    setTimeout(() => {
      setCurrentGesture(null);
      setGestureData(null);
    }, 1000);
  }, []);

  const detectPinch = React.useCallback((scale: number) => {
    setCurrentGesture('pinch');
    setGestureData({ scale });
  }, []);

  const detectLongPress = React.useCallback(() => {
    setCurrentGesture('long-press');
    setGestureData({ timestamp: Date.now() });
  }, []);

  return {
    currentGesture,
    gestureData,
    detectSwipe,
    detectPinch,
    detectLongPress
  };
};
