'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit: () => void;
  }
}

interface SimpleGoogleTranslateProps {
  className?: string;
  buttonText?: string;
  showIcon?: boolean;
}

export default function SimpleGoogleTranslate({ 
  className = '',
  buttonText = 'Translate',
  showIcon = true
}: SimpleGoogleTranslateProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Only load script once
    if (scriptLoaded.current) return;

    // Initialize Google Translate
    window.googleTranslateElementInit = function() {
      if (elementRef.current) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,mr,ta,te,kn,gu,bn,ml,or,pa,as,ur',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        }, elementRef.current.id);
      }
    };

    // Load Google Translate script
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
    };
    script.onerror = () => {
      console.error('Failed to load Google Translate script');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && (
        <svg className="w-5 h-5 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      )}
      <span className="text-sm font-medium">{buttonText}</span>
      <div 
        ref={elementRef}
        id="google_translate_element"
        className="inline-block"
      />
    </div>
  );
} 