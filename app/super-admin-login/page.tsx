'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ConsistentLoadingPage from '../components/ConsistentLoadingPage';

export default function SuperAdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Track mouse position for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Verify that the user is actually a platform super admin
      if (data.user.role !== 'platform_super_admin') {
        throw new Error('Access denied. This login is restricted to Platform Super Administrators only.');
      }

      // Redirect to platform super admin dashboard
      router.push('/dashboard/platform-super-admin');
    } catch (err: unknown) {
      console.error('Super Admin login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen during authentication
  if (loading) {
    return (
      <ConsistentLoadingPage
        type="auth"
        title="Super Admin Authentication"
        subtitle="Verifying your super administrator credentials..."
        tips={[
          'Verifying super admin credentials',
          'Checking platform access permissions',
          'Redirecting to super admin dashboard'
        ]}
      />
    );
  }

  return (
    <motion.main 
      className="min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-red-900 via-red-800 to-red-900 p-4 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced Interactive Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Mouse-following gradient orbs */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-white/10 to-red-300/10 blur-3xl"
          animate={{
            x: mousePosition.x * 0.05 - 200,
            y: mousePosition.y * 0.05 - 200,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-orange-300/10 to-red-300/10 blur-2xl"
          animate={{
            x: mousePosition.x * -0.03 + 100,
            y: mousePosition.y * -0.03 + 100,
          }}
          transition={{ type: "spring", stiffness: 20, damping: 25 }}
        />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => {
          const basePosition = (i * 137.5) % 100;
          const left = (basePosition + (i * 23.7)) % 100;
          const top = (basePosition * 1.618 + (i * 31.2)) % 100;
          
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-white/30 rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 3 - 1) * 10, 0],
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: 3 + (i % 3) * 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: (i % 4) * 0.5,
              }}
            />
          );
        })}
      </div>

      {/* Main Login Container */}
      <motion.div 
        className="relative w-[500px] bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl border border-red-200"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="p-8 pb-6">
          <motion.div
            className="text-center mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Super Admin Access</h1>
            <p className="text-gray-600 text-sm">Platform Super Administrator Login</p>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-red-600 text-lg">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Restricted Access</h3>
                <p className="text-sm text-red-700 mt-1">
                  This login is exclusively for Platform Super Administrators. Unauthorized access attempts are logged and monitored.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Login Form */}
          <motion.form 
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Super Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter super admin email"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full h-12 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center">
                    <span className="text-red-600 text-sm mr-2">❌</span>
                    <span className="text-red-800 text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Button */}
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 20px 25px -5px rgba(220, 38, 38, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    <span>Authenticating...</span>
                  </motion.div>
                ) : (
                  <motion.span
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    🔐 Access Super Admin Dashboard
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.form>

          {/* Back to Regular Login */}
          <motion.div 
            className="text-center mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <motion.button
              onClick={() => router.push('/login')}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back to Regular Login
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.main>
  );
}
