'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActionType } from '../types';
import EnhancedTextTooltip from './EnhancedTextTooltip';

interface PDFViewerProps {
  onPDFReady?: (extractedText: string) => void;
  onTextSelection?: (action: ActionType, text: string, context?: string) => Promise<void>;
  apiKey?: string;
  className?: string;
}

export default function PDFViewer({
  onPDFReady,
  onTextSelection,
  apiKey,
  className = ''
}: PDFViewerProps) {
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isPDFReady, setIsPDFReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Demo content for testing
  const demoContent = `
# Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions without being explicitly programmed. It focuses on developing algorithms that can access data and use it to learn for themselves.

## Key Concepts

### 1. Supervised Learning
Supervised learning involves training a model on a labeled dataset, where the correct answers are provided. The model learns to map inputs to outputs based on these examples.

**Examples:**
- Image classification
- Spam detection
- Medical diagnosis

### 2. Unsupervised Learning
Unsupervised learning finds hidden patterns in data without labeled responses. The algorithm explores the data structure on its own.

**Examples:**
- Customer segmentation
- Anomaly detection
- Dimensionality reduction

### 3. Reinforcement Learning
Reinforcement learning involves an agent learning to make decisions by taking actions in an environment to achieve maximum cumulative reward.

**Examples:**
- Game playing
- Robotics
- Autonomous vehicles

## Applications

Machine learning has numerous applications across various industries:

1. **Healthcare**: Disease diagnosis, drug discovery, personalized medicine
2. **Finance**: Fraud detection, risk assessment, algorithmic trading
3. **E-commerce**: Recommendation systems, demand forecasting
4. **Transportation**: Self-driving cars, route optimization
5. **Entertainment**: Content recommendation, voice assistants

## Challenges

Despite its potential, machine learning faces several challenges:

- **Data Quality**: Poor quality data leads to poor model performance
- **Bias**: Models can inherit biases from training data
- **Interpretability**: Complex models are difficult to understand
- **Scalability**: Training large models requires significant computational resources

## Future Directions

The future of machine learning includes:

- **Federated Learning**: Training models across decentralized data sources
- **AutoML**: Automated machine learning pipeline design
- **Explainable AI**: Making AI decisions more transparent
- **Edge Computing**: Running ML models on edge devices

Machine learning continues to evolve rapidly, with new techniques and applications emerging regularly. Understanding these fundamental concepts provides a solid foundation for exploring this exciting field.
  `;

  useEffect(() => {
    // Load demo content for testing
    loadDemoContent();
  }, []);

  const loadDemoContent = () => {
    setPdfContent(demoContent);
    setIsPDFReady(true);
    if (onPDFReady) {
      onPDFReady(demoContent);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      // In a real implementation, you would use a PDF parsing library
      // For now, we'll simulate PDF processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, use the demo content
      setPdfContent(demoContent);
      setIsPDFReady(true);
      if (onPDFReady) {
        onPDFReady(demoContent);
      }
    } catch (error) {
      console.error('🔴 PDF processing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') {
      setShowTooltip(false);
      return;
    }

    const text = selection.toString().trim();
    setSelectedText(text);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowTooltip(true);
  };

  const handleAction = async (action: ActionType, text: string, context?: string) => {
    if (onTextSelection) {
      try {
        await onTextSelection(action, text, context);
      } catch (error) {
        console.error('🔴 Text action error:', error);
      }
    }
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">PDF Viewer</h3>
          {isPDFReady && (
            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 text-xs rounded-full">
              Ready
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Upload PDF
          </button>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleZoomOut}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto relative">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Processing PDF...</p>
            </div>
          </div>
        ) : isPDFReady ? (
          <div
            ref={containerRef}
            className="p-6"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
          >
            <div 
              className="prose prose-lg max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: pdfContent.replace(/\n/g, '<br>') }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No PDF Loaded
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Upload a PDF file to get started with AI-powered learning
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Upload PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && tooltipPosition && (
        <EnhancedTextTooltip
          text={selectedText}
          position={tooltipPosition}
          onClose={() => setShowTooltip(false)}
          onAction={handleAction}
          isLoading={false}
          apiKey={apiKey}
        />
      )}
    </div>
  );
} 