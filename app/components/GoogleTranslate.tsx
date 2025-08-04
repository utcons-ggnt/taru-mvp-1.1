'use client';

import { useEffect, useState, useRef } from 'react';

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit: () => void;
    googleTranslateLoaded?: boolean;
  }
}

interface GoogleTranslateProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  variant?: 'floating' | 'inline' | 'minimal' | 'header';
  showLabel?: boolean;
  className?: string;
}

let translateElementCounter = 0;

export default function GoogleTranslate({ 
  position = 'bottom-right', 
  variant = 'floating',
  showLabel = false,
  className = ''
}: GoogleTranslateProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const elementId = useRef(`google_translate_element_${++translateElementCounter}`);

  useEffect(() => {
    const loadGoogleTranslate = () => {
      // Check if Google Translate is already loaded
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        initializeTranslateElement();
        return;
      }

      // Check if script is already loading/loaded
      if (window.googleTranslateLoaded) {
        // Wait for the script to finish loading
        const checkInterval = setInterval(() => {
          if (window.google && window.google.translate) {
            clearInterval(checkInterval);
            initializeTranslateElement();
          }
        }, 100);
        return;
      }

      // Mark as loading
      window.googleTranslateLoaded = true;

      // Initialize Google Translate callback
      window.googleTranslateElementInit = function() {
        // Initialize all translate elements on the page
        const elements = document.querySelectorAll('[id^="google_translate_element_"]');
        elements.forEach((element) => {
          if (element && !element.hasChildNodes()) {
            try {
              new window.google.translate.TranslateElement({
                pageLanguage: 'en',
                includedLanguages: 'en,hi,mr,ta,te,kn,gu,bn,ml,or,pa,as,ur',
                layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false,
              }, element.id);
            } catch (error) {
              console.error('Error initializing Google Translate for element:', element.id, error);
            }
          }
        });
        setIsLoaded(true);
      };

      // Load Google Translate script if not already present
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        const script = document.createElement('script');
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        script.onerror = () => {
          console.error('Failed to load Google Translate script');
          window.googleTranslateLoaded = false;
        };
        document.head.appendChild(script);
      }
    };

    const initializeTranslateElement = () => {
      const element = document.getElementById(elementId.current);
      if (element && !element.hasChildNodes() && window.google && window.google.translate) {
        try {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,ta,te,kn,gu,bn,ml,or,pa,as,ur',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          }, elementId.current);
          setIsLoaded(true);
        } catch (error) {
          console.error('Error initializing Google Translate:', error);
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadGoogleTranslate, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'fixed top-4 left-4';
      case 'top-right':
        return 'fixed top-4 right-4';
      case 'bottom-left':
        return 'fixed bottom-4 left-4';
      default:
        return 'fixed bottom-4 right-4';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'floating':
        return 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg hover:shadow-xl';
      case 'inline':
        return 'bg-white border border-gray-200 shadow-sm';
      case 'minimal':
        return 'bg-transparent';
      case 'header':
        return 'bg-blue-100 border border-blue-200 shadow hover:bg-blue-200';
      default:
        return 'bg-white border border-gray-200 shadow-sm';
    }
  };

  if (variant === 'header') {
    return (
      <div className={`${className}`}>
        <div className="relative">
          {/* Header Translate Button */}
          <button
            onClick={() => {
              const translateElement = document.getElementById(elementId.current);
              if (translateElement) {
                const select = translateElement.querySelector('select');
                if (select) {
                  select.click();
                } else {
                  // If no select found, try to trigger the translate widget
                  const translateWidget = translateElement.querySelector('.goog-te-combo');
                  if (translateWidget) {
                    (translateWidget as HTMLElement).click();
                  }
                }
              }
            }}
            className={`${getVariantClasses()} w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300`}
            aria-label="Translate Page"
            title="Translate Page"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </button>
          
          {/* Hidden Google Translate Element */}
          <div 
            id={elementId.current} 
            className="hidden"
          />
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`${getPositionClasses()} z-50 ${className}`}>
        <div className="relative">
          {/* Floating Action Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`${getVariantClasses()} w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300`}
            title="Translate Page"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
              />
            </svg>
          </button>

          {/* Expanded Translate Widget */}
          {isExpanded && (
            <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px] animate-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Translate Page</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div 
                id={elementId.current} 
                className="w-full"
              />
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>Powered by Google Translate</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={`${getPositionClasses()} z-50 ${className}`}>
        <div 
          id={elementId.current} 
          className="opacity-0 hover:opacity-100 transition-opacity duration-300"
        />
      </div>
    );
  }

  // Default inline variant
  return (
    <div className={`${getPositionClasses()} z-50 ${className}`}>
      {showLabel && (
        <div className="mb-2 text-sm font-medium text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
          🌐 Translate
        </div>
      )}
      <div 
        id={elementId.current} 
        className={`${getVariantClasses()} rounded-lg p-2 transition-all duration-200 hover:shadow-md`}
      />
    </div>
  );
} 