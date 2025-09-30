'use client';

import React from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-white text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h1 className="text-3xl font-bold mb-2">Critical Error</h1>
              <p className="text-red-100 text-lg">
                We encountered a critical error. Please try refreshing the page.
              </p>
            </div>

            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-red-800 mb-1">Error Details</h3>
                <p className="text-red-700 text-sm">
                  {error.message || 'An unexpected error occurred'}
                </p>
                {error.digest && (
                  <p className="text-red-600 text-xs mt-1">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={reset}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-700 transition-all"
                >
                  Try Again
                </button>

                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a
                  href="/"
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-700 transition-all"
                >
                  Go Home
                </a>
              </div>

              <div className="text-center mt-6 text-gray-600">
                <p className="text-sm">
                  If the problem persists, please{' '}
                  <a
                    href="mailto:support@taru.com"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    contact our support team
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
