import { SpeechProgress } from '../types';

export class SpeechService {
  private audio: HTMLAudioElement | null = null;
  private currentText: string = '';
  private onProgressUpdate?: (progress: SpeechProgress) => void;
  private supportedLanguages = [
    { code: 'en-US', name: 'English (US)', voice: 'en-US-Neural2-A' },
    { code: 'hi-IN', name: 'Hindi', voice: 'hi-IN-Neural2-A' },
    { code: 'mr-IN', name: 'Marathi', voice: 'mr-IN-Neural2-A' },
    { code: 'es-ES', name: 'Spanish', voice: 'es-ES-Neural2-A' },
    { code: 'fr-FR', name: 'French', voice: 'fr-FR-Neural2-A' }
  ];

  constructor(onProgressUpdate?: (progress: SpeechProgress) => void) {
    this.onProgressUpdate = onProgressUpdate;
  }

  async speak(text: string, language: string = 'en-US', speed: number = 1.0): Promise<void> {
    try {
      // Stop any currently playing audio
      await this.stop();

      this.currentText = text;
      
      // Use Web Speech API for basic TTS
      if ('speechSynthesis' in window) {
        await this.speakWithWebAPI(text, language, speed);
      } else {
        // Fallback to audio file if Web Speech API not available
        await this.speakWithAudioFile(text, language, speed);
      }
    } catch (error) {
      console.error('🔴 Speech Error:', error);
      this.updateProgress({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        progress: 0,
        status: 'error'
      });
    }
  }

  private async speakWithWebAPI(text: string, language: string, speed: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = speed;
      utterance.volume = 1.0;

      // Find appropriate voice
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        this.updateProgress({
          isPlaying: true,
          currentTime: 0,
          duration: text.length * 50, // Rough estimate
          progress: 0,
          status: 'playing'
        });
      };

      utterance.onend = () => {
        this.updateProgress({
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          progress: 100,
          status: 'idle'
        });
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('🔴 Speech Synthesis Error:', event);
        this.updateProgress({
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          progress: 0,
          status: 'error'
        });
        reject(event);
      };

      speechSynthesis.speak(utterance);
    });
  }

  private async speakWithAudioFile(text: string, language: string, speed: number): Promise<void> {
    // This would integrate with a TTS service like Google Cloud TTS
    // For now, we'll use a placeholder implementation
    console.log('🎵 Audio file TTS not implemented yet');
    
    this.updateProgress({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      status: 'error'
    });
  }

  pause(): void {
    if (this.audio) {
      this.audio.pause();
      this.updateProgress({
        isPlaying: false,
        currentTime: this.audio.currentTime,
        duration: this.audio.duration,
        progress: (this.audio.currentTime / this.audio.duration) * 100,
        status: 'paused'
      });
    } else if ('speechSynthesis' in window) {
      speechSynthesis.pause();
      this.updateProgress({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        progress: 0,
        status: 'paused'
      });
    }
  }

  resume(): void {
    if (this.audio) {
      this.audio.play();
      this.updateProgress({
        isPlaying: true,
        currentTime: this.audio.currentTime,
        duration: this.audio.duration,
        progress: (this.audio.currentTime / this.audio.duration) * 100,
        status: 'playing'
      });
    } else if ('speechSynthesis' in window) {
      speechSynthesis.resume();
      this.updateProgress({
        isPlaying: true,
        currentTime: 0,
        duration: 0,
        progress: 0,
        status: 'playing'
      });
    }
  }

  async stop(): Promise<void> {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    this.updateProgress({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      progress: 0,
      status: 'idle'
    });
  }

  private updateProgress(progress: SpeechProgress): void {
    if (this.onProgressUpdate) {
      this.onProgressUpdate(progress);
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  // Convert text to speech URL (for advanced TTS services)
  async getSpeechURL(text: string, language: string = 'en-US'): Promise<string> {
    // This would integrate with Google Cloud TTS or similar service
    // For demo purposes, return a placeholder
    return `https://api.example.com/tts?text=${encodeURIComponent(text)}&lang=${language}`;
  }

  // Estimate speech duration
  estimateDuration(text: string, language: string = 'en-US'): number {
    // Rough estimate: 150 words per minute
    const words = text.split(' ').length;
    return (words / 150) * 60; // Duration in seconds
  }
} 