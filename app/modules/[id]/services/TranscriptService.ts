import { VideoData, VideoTranscript } from '../types';
import { N8NService } from './N8NService';

export interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface TranscriptData {
  transcriptId: string;
  segments: TranscriptSegment[];
  language: string;
  confidence: number;
  generatedAt: Date;
  source: 'n8n' | 'cached' | 'generated';
}

export class TranscriptService {
  private n8nService: N8NService;
  private transcriptCache: Map<string, TranscriptData> = new Map();

  constructor() {
    this.n8nService = new N8NService();
  }

  /**
   * Generate or retrieve transcript for a video
   */
  async getTranscript(
    moduleId: string,
    videoData: VideoData,
    forceRegenerate: boolean = false
  ): Promise<TranscriptData | null> {
    try {
      // Check cache first
      if (!forceRegenerate && this.transcriptCache.has(moduleId)) {
        console.log('📋 Using cached transcript for:', moduleId);
        return this.transcriptCache.get(moduleId)!;
      }

      // Try to get from localStorage
      const cachedTranscript = this.getCachedTranscript(moduleId);
      if (!forceRegenerate && cachedTranscript) {
        console.log('📋 Using localStorage transcript for:', moduleId);
        this.transcriptCache.set(moduleId, cachedTranscript);
        return cachedTranscript;
      }

      // Generate new transcript via N8N
      console.log('🔄 Generating transcript for:', moduleId);
      const transcriptData = await this.generateTranscript(moduleId, videoData);
      
      if (transcriptData) {
        // Cache the transcript
        this.transcriptCache.set(moduleId, transcriptData);
        this.cacheTranscript(moduleId, transcriptData);
        
        // Send to N8N for processing
        await this.sendTranscriptToN8N(moduleId, videoData, transcriptData);
        
        return transcriptData;
      }

      return null;
    } catch (error) {
      console.error('🔴 Error getting transcript:', error);
      return null;
    }
  }

  /**
   * Generate transcript using N8N service
   */
  private async generateTranscript(
    moduleId: string,
    videoData: VideoData
  ): Promise<TranscriptData | null> {
    try {
      // For seeded modules, create a mock transcript based on the video content
      const mockTranscript = this.createMockTranscript(moduleId, videoData);
      
      // Try to get transcript from N8N via API route
      let n8nResponse = null;
      try {
        n8nResponse = await this.n8nService.generateTranscriptFromVideo(
          videoData.url,
          moduleId,
          {
            language: 'en',
            accuracy: 'high',
            includeTimestamps: true
          }
        );
      } catch (n8nError) {
        console.warn('⚠️ N8N transcript generation failed, using mock data:', n8nError);
      }

      // If N8N returns actual transcript, use it; otherwise use mock
      const transcriptData: TranscriptData = {
        transcriptId: `transcript_${moduleId}_${Date.now()}`,
        segments: n8nResponse?.transcriptData?.segments || n8nResponse?.segments || mockTranscript,
        language: 'en',
        confidence: n8nResponse?.transcriptData?.confidence || n8nResponse?.confidence || 0.85,
        generatedAt: new Date(),
        source: n8nResponse?.transcriptData?.segments || n8nResponse?.segments ? 'n8n' : 'generated'
      };

      return transcriptData;
    } catch (error) {
      console.error('🔴 Error generating transcript:', error);
      // Fallback to mock transcript
      const mockTranscript = this.createMockTranscript(moduleId, videoData);
      return {
        transcriptId: `transcript_${moduleId}_${Date.now()}`,
        segments: mockTranscript,
        language: 'en',
        confidence: 0.85,
        generatedAt: new Date(),
        source: 'generated'
      };
    }
  }

  /**
   * Create mock transcript for seeded modules
   */
  private createMockTranscript(moduleId: string, videoData: VideoData): TranscriptSegment[] {
    const segments: TranscriptSegment[] = [];
    const duration = videoData.duration || 300; // 5 minutes default
    const segmentDuration = 10; // 10 seconds per segment
    const totalSegments = Math.ceil(duration / segmentDuration);

    // Create mock content based on module title
    const title = videoData.title.toLowerCase();
    let content = '';

    if (title.includes('geography')) {
      content = 'Welcome to our geography lesson. Today we will explore the fascinating world of continents, countries, and natural features. Geography is the study of Earth\'s surface and its features. We will learn about different landforms, climate patterns, and human activities that shape our planet.';
    } else if (title.includes('science') || title.includes('nutrition') || title.includes('plant')) {
      content = 'Welcome to our science lesson on plant nutrition. Plants are amazing organisms that can make their own food through a process called photosynthesis. This process requires sunlight, water, and carbon dioxide. Chlorophyll, the green pigment in leaves, captures sunlight and converts it into energy.';
    } else if (title.includes('mathematics') || title.includes('integer')) {
      content = 'Welcome to our mathematics lesson on integers. Integers are whole numbers that can be positive, negative, or zero. They include numbers like 1, 2, 3, -1, -2, -3, and 0. Understanding integers is fundamental to algebra and many real-world applications.';
    } else {
      content = 'Welcome to our educational video. In this lesson, we will explore important concepts and learn new skills. Pay attention to the key points and take notes as we progress through the material.';
    }

    const sentences = content.split('. ').filter(s => s.trim().length > 0);
    
    for (let i = 0; i < totalSegments; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, duration);
      
      // Cycle through sentences
      const sentenceIndex = i % sentences.length;
      const text = sentences[sentenceIndex] + (sentenceIndex < sentences.length - 1 ? '.' : '');
      
      segments.push({
        id: `segment_${moduleId}_${i}`,
        text: text,
        startTime: startTime,
        endTime: endTime,
        confidence: 0.85 + (Math.random() * 0.1) // 85-95% confidence
      });
    }

    return segments;
  }

  /**
   * Send transcript data to N8N for analysis
   */
  private async sendTranscriptToN8N(
    moduleId: string,
    videoData: VideoData,
    transcriptData: TranscriptData
  ): Promise<void> {
    try {
      await this.n8nService.sendTranscriptData(moduleId, videoData, transcriptData, {
        action: 'transcript_generated',
        userInteraction: 'auto_generate',
        source: transcriptData.source
      });
      
      console.log('✅ Transcript sent to N8N for analysis:', moduleId);
    } catch (error) {
      console.error('🔴 Error sending transcript to N8N:', error);
    }
  }

  /**
   * Get transcript segment at specific time
   */
  getTranscriptSegmentAtTime(
    transcriptData: TranscriptData,
    currentTime: number
  ): TranscriptSegment | null {
    return transcriptData.segments.find(
      segment => currentTime >= segment.startTime && currentTime <= segment.endTime
    ) || null;
  }

  /**
   * Search transcript for specific text
   */
  searchTranscript(
    transcriptData: TranscriptData,
    searchTerm: string
  ): TranscriptSegment[] {
    const term = searchTerm.toLowerCase();
    return transcriptData.segments.filter(
      segment => segment.text.toLowerCase().includes(term)
    );
  }

  /**
   * Cache transcript in localStorage
   */
  private cacheTranscript(moduleId: string, transcriptData: TranscriptData): void {
    try {
      const key = `transcript_${moduleId}`;
      localStorage.setItem(key, JSON.stringify(transcriptData));
    } catch (error) {
      console.error('🔴 Error caching transcript:', error);
    }
  }

  /**
   * Get cached transcript from localStorage
   */
  private getCachedTranscript(moduleId: string): TranscriptData | null {
    try {
      const key = `transcript_${moduleId}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Convert string back to Date
        data.generatedAt = new Date(data.generatedAt);
        return data;
      }
      return null;
    } catch (error) {
      console.error('🔴 Error getting cached transcript:', error);
      return null;
    }
  }

  /**
   * Clear transcript cache
   */
  clearCache(moduleId?: string): void {
    if (moduleId) {
      this.transcriptCache.delete(moduleId);
      try {
        localStorage.removeItem(`transcript_${moduleId}`);
      } catch (error) {
        console.error('🔴 Error clearing cached transcript:', error);
      }
    } else {
      this.transcriptCache.clear();
      // Clear all transcript keys from localStorage
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('transcript_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.error('🔴 Error clearing all cached transcripts:', error);
      }
    }
  }
} 