'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationToastProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss
}) => {
  const getIcon = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastNotification['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
          border: 'border-emerald-200',
          icon: 'text-emerald-600',
          title: 'text-emerald-800',
          message: 'text-emerald-700',
          progress: 'bg-emerald-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-pink-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          title: 'text-amber-800',
          message: 'text-amber-700',
          progress: 'bg-amber-500'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          progress: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          title: 'text-gray-800',
          message: 'text-gray-700',
          progress: 'bg-gray-500'
        };
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      <AnimatePresence>
        {notifications.map((notification, index) => {
          const styles = getStyles(notification.type);
          const duration = notification.duration || 5000;

          return (
            <motion.div
              key={notification.id}
              layout
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ 
                opacity: 0, 
                x: 300, 
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                delay: index * 0.1
              }}
              className={`${styles.bg} ${styles.border} border rounded-xl shadow-lg backdrop-blur-sm p-4 relative overflow-hidden`}
            >
              {/* Progress Bar */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 ${styles.progress} rounded-full`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                onAnimationComplete={() => onDismiss(notification.id)}
              />

              {/* Content */}
              <div className="flex items-start gap-3">
                {/* Icon */}
                <motion.div
                  className={styles.icon}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  {getIcon(notification.type)}
                </motion.div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <motion.h4
                    className={`font-semibold ${styles.title} mb-1`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {notification.title}
                  </motion.h4>
                  {notification.message && (
                    <motion.p
                      className={`text-sm ${styles.message} leading-relaxed`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      {notification.message}
                    </motion.p>
                  )}

                  {/* Action Button */}
                  {notification.action && (
                    <motion.button
                      onClick={notification.action.onClick}
                      className={`mt-2 text-sm font-medium ${styles.icon} hover:underline focus:outline-none focus:underline`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {notification.action.label}
                    </motion.button>
                  )}
                </div>

                {/* Close Button */}
                <motion.button
                  onClick={() => onDismiss(notification.id)}
                  className={`${styles.icon} hover:bg-white/50 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "linear"
                }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook for managing toast notifications
export const useNotificationToast = () => {
  const [notifications, setNotifications] = React.useState<ToastNotification[]>([]);

  const addNotification = React.useCallback((notification: Omit<ToastNotification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newNotification: ToastNotification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const dismissNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const dismissAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = React.useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({ ...options, type: 'success', title, message });
  }, [addNotification]);

  const error = React.useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({ ...options, type: 'error', title, message });
  }, [addNotification]);

  const warning = React.useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({ ...options, type: 'warning', title, message });
  }, [addNotification]);

  const info = React.useCallback((title: string, message?: string, options?: Partial<ToastNotification>) => {
    return addNotification({ ...options, type: 'info', title, message });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    success,
    error,
    warning,
    info
  };
};

export default NotificationToast;
