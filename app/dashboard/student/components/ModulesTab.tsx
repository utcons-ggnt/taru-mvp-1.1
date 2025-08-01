'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Star, CheckCircle, XCircle, Users, Code, FileText, Trophy, Brain, Target, Award, MessageCircle, BookOpen, Lightbulb, Mic, Volume2 } from 'lucide-react';
import YouTube from 'react-youtube';

// Import AI-powered components
import AIAssistant from '../../../modules/[id]/components/AIAssistant';
import VideoLearningInterface from '../../../modules/[id]/components/VideoLearningInterface';
import AdvancedLearningInterface from '../../../modules/[id]/components/AdvancedLearningInterface';
import FlashCard from '../../../modules/[id]/components/FlashCard';
import BookmarksPanel from '../../../modules/[id]/components/BookmarksPanel';
import AdvancedFeaturePanel from '../../../modules/[id]/components/AdvancedFeaturePanel';
import { N8NService } from '../../../modules/[id]/services/N8NService';
import { SpeechService } from '../../../modules/[id]/services/SpeechService';

// Import types
import { 
  ActionType, 
  Message, 
  VideoData, 
  FlashCardType, 
  BookmarkItem, 
  ExplanationResult, 
  SpeechProgress, 
  MCQQuestion, 
  LearningContext, 
  AIResponse 
} from '../../../modules/[id]/types';

interface Module {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: string;
  duration: number;
  videoUrl: string;
  points: number;
  tags: string[];
  learningType: 'video' | 'interactive' | 'project' | 'quiz' | 'peer' | 'hybrid';
  contentTypes: {
    video?: {
      url: string;
      duration: number;
      engagementThreshold: number;
    };
    interactive?: {
      type: 'coding' | 'simulation' | 'drag-drop' | 'matching' | 'fill-blank';
      content: Record<string, unknown>;
      attempts: number;
    };
    project?: {
      title: string;
      description: string;
      requirements: string[];
      submissionType: 'text' | 'file' | 'link';
      rubric: Array<{
        criterion: string;
        points: number;
        description: string;
      }>;
    };
    peerLearning?: {
      discussionTopics: string[];
      groupSize: number;
      collaborationTasks: string[];
    };
  };
  adaptiveFeatures: {
    difficultyAdjustment: boolean;
    personalizedPath: boolean;
    skillGaps: string[];
    prerequisites: string[];
    nextModules: string[];
  };
  gamification: {
    quests: Array<{
      id: string;
      title: string;
      description: string;
      type: 'watch' | 'complete' | 'score' | 'collaborate' | 'create';
      target: number;
      reward: number;
    }>;
    badges: string[];
    leaderboard: boolean;
    streaks: boolean;
  };
  quizQuestions?: QuizQuestion[];
  aiFeatures: {
    realTimeAssessment: boolean;
    personalizedFeedback: boolean;
    adaptiveQuestions: boolean;
    learningPathRecommendation: boolean;
  };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  skillTags: string[];
}

interface VideoProgress {
  watchTime: number;
  completed: boolean;
}

interface QuizAttempt {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  difficulty: 'easy' | 'medium' | 'hard';
  skillTags: string[];
}

interface ModuleProgress {
  moduleId: string;
  videoProgress: VideoProgress;
  quizAttempts: QuizAttempt[];
  quizScore: number;
  interactiveProgress?: {
    type: string;
    attempts: number;
    completed: boolean;
    score: number;
    timeSpent: number;
  };
  projectSubmission?: {
    title: string;
    content: string;
    totalScore: number;
    status: string;
  };
  peerLearningProgress?: {
    participationCount: number;
    completedTasks: string[];
  };
  gamificationProgress: {
    quests: Array<{
      questId: string;
      current: number;
      completed: boolean;
    }>;
    badges: Array<{
      badgeId: string;
      name: string;
      earnedAt: Date;
    }>;
  };
  aiAssessment: {
    realTimeScore: number;
    skillGaps: string[];
    recommendations: string[];
  };
  feedback: string;
  pointsEarned: number;
  completed: boolean;
}

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

export default function ModulesTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showInteractive, setShowInteractive] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [showPeerLearning, setShowPeerLearning] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizResults, setQuizResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState('');
  const [videoProgress, setVideoProgress] = useState<VideoProgress>({ watchTime: 0, completed: false });
  const [loading, setLoading] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [moduleProgress, setModuleProgress] = useState<{ [key: string]: ModuleProgress }>({});
  
  // AI-Powered Learning State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAdvancedLearning, setShowAdvancedLearning] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [learningMode, setLearningMode] = useState<'video' | 'pdf' | 'interactive'>('video');
  const [selectedText, setSelectedText] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [flashcards, setFlashcards] = useState<FlashCardType[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [currentMcqIndex, setCurrentMcqIndex] = useState(0);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [speechProgress, setSpeechProgress] = useState<SpeechProgress>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    status: 'idle'
  });
  
  // AI Services
  const n8nService = useRef<N8NService | null>(null);
  const speechService = useRef<SpeechService | null>(null);
  
  // Enhanced video tracking state
  const [videoEngagement, setVideoEngagement] = useState({
    totalDuration: 0,
    actualWatchTime: 0,
    playbackRate: 1,
    seekCount: 0,
    lastSeekTime: 0,
    isPlaying: false,
    engagementScore: 0
  });
  
  // Interactive exercise state
  const [interactiveState] = useState({
    currentExercise: 0,
    attempts: 0,
    maxAttempts: 3,
    completed: false,
    score: 0,
    timeSpent: 0,
    lastAttemptAt: new Date(),
    content: null
  });
  
  // Project submission state
  const [projectSubmission, setProjectSubmission] = useState({
    title: '',
    content: '',
    files: [] as File[],
    links: [] as string[]
  });
  
  // Peer learning state
  const [peerLearningState] = useState({
    participationCount: 0,
    completedTasks: [],
    discussionTopics: [],
    collaborationTasks: [],
    groupSize: 4,
    peerFeedback: [],
    lastActivityAt: new Date()
  });
  
  const playerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize AI Services
  useEffect(() => {
    n8nService.current = new N8NService();
    speechService.current = new SpeechService(setSpeechProgress);
  }, []);

  // AI-Powered Learning Functions
  const handleTextSelection = async (action: ActionType, text: string, context?: string) => {
    if (!n8nService.current) return;

    try {
      let response = '';
      
      switch (action) {
        case 'read':
          if (speechService.current) {
            await speechService.current.speak(text);
          }
          response = `Reading: "${text}"`;
          break;
        case 'explain':
          const explanation = await n8nService.current.generateResponse(
            context || `Explain this: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = explanation.content;
          break;
        case 'define':
          const definition = await n8nService.current.generateResponse(
            `Define this term: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = definition.content;
          break;
        case 'translate':
          const translation = await n8nService.current.generateResponse(
            `Translate this to Hindi: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = translation.content;
          break;
        case 'summarize':
          const summary = await n8nService.current.generateResponse(
            `Summarize this: ${text}`,
            { pdfContent: '', videoData: null, currentTime: 0, selectedText: text, bookmarks }
          );
          response = summary.content;
          break;
      }
      
      // You can display this response in a toast or modal
      console.log('AI Response:', response);
    } catch (error) {
      console.error('Error processing text action:', error);
    }
  };

  const generateLearningContent = async (moduleContent: string) => {
    if (!n8nService.current) return;

    setIsGeneratingContent(true);
    try {
      // Generate flashcards
      const flashcardData = await n8nService.current.generateFlashcards(moduleContent, 3);
      const formattedFlashcards: FlashCardType[] = flashcardData.map((item: any, index: number) => ({
        id: `flashcard-${index}`,
        front: item.front,
        back: item.back,
        difficulty: item.difficulty || 'medium',
        category: item.category || 'general',
        tags: item.tags || []
      }));
      setFlashcards(formattedFlashcards);

      // Generate MCQ questions
      const mcqData = await n8nService.current.generateMCQs(moduleContent, 5);
      const formattedMCQs: MCQQuestion[] = mcqData.map((item: any, index: number) => ({
        id: `mcq-${index}`,
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || 'medium'
      }));
      setMcqQuestions(formattedMCQs);
    } catch (error) {
      console.error('Error generating learning content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const handleAddBookmark = (bookmark: BookmarkItem) => {
    setBookmarks(prev => [...prev, bookmark]);
  };

  const handleRemoveBookmark = (bookmarkId: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
  };

  // Fetch modules data
  useEffect(() => {
    const fetchModules = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/modules/recommended');
        if (!response.ok) {
          throw new Error('Failed to fetch modules');
        }
        const data = await response.json();
        
        if (data.success && data.modules) {
          const modules = data.modules || [];
          setModules(modules);
          
          // Load progress for each module
          modules.forEach((module: Module) => {
            loadModuleProgress(module.moduleId);
          });
        } else {
          console.error('Invalid response format:', data);
          setModules([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching modules:', error);
        setLoading(false);
        setModules([]);
      }
    };

    fetchModules();
  }, []);

  const loadModuleProgress = async (moduleId: string) => {
    try {
      const response = await fetch(`/api/modules/${moduleId}/progress`);
      const data = await response.json();
      
      if (data.success && data.progress) {
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: data.progress
        }));
      }
    } catch (error) {
      console.error('Error loading module progress:', error);
    }
  };

  const startModule = (module: Module) => {
    setSelectedModule(module);
    setShowVideoModal(true);
    setVideoProgress({ watchTime: 0, completed: false });
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults([]);
    setFeedback('');
  };

  const markAsCompletedAndStartQuiz = (module: Module) => {
    setSelectedModule(module);
    // Skip video and mark as completed
    setVideoProgress({ watchTime: module.duration || 0, completed: true });
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setQuizResults([]);
    setFeedback('');
    // Go directly to quiz
    setShowQuiz(true);
  };

  const onYouTubeReady = (event: { target: any }) => {
    playerRef.current = event.target;
    const duration = event.target.getDuration();
    
    setVideoEngagement(prev => ({
      ...prev,
      totalDuration: duration
    }));
    
    // Start progress tracking
    progressIntervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const duration = playerRef.current.getDuration();
        const playbackRate = playerRef.current.getPlaybackRate();
        const playerState = playerRef.current.getPlayerState();
        
        const isActuallyWatching = playerState === 1; // PLAYING state
        const timeSinceLastUpdate = 2; // 2 seconds interval
        
        setVideoEngagement(prev => {
          let actualWatchTime = prev.actualWatchTime;
          
          if (isActuallyWatching) {
            // Only count time if video is actually playing
            actualWatchTime += timeSinceLastUpdate / playbackRate;
          }
          
          // Calculate engagement score (0-100)
          const watchPercentage = (actualWatchTime / duration) * 100;
          const playbackPenalty = playbackRate > 1.5 ? (playbackRate - 1.5) * 20 : 0; // Penalty for high speed
          const seekPenalty = prev.seekCount * 5; // Penalty for seeking
          
          const engagementScore = Math.max(0, Math.min(100, 
            watchPercentage - playbackPenalty - seekPenalty
          ));
          
          // Update video progress for UI
          const completed = actualWatchTime >= duration * 0.8; // 80% actual watch time = completed
          setVideoProgress({
            watchTime: actualWatchTime,
            completed
          });
          
          return {
            ...prev,
            actualWatchTime,
            playbackRate,
            isPlaying: isActuallyWatching,
            engagementScore
          };
        });
      }
    }, 2000);
  };

  const onYouTubeStateChange = (event: { data: number }) => {
    const playerState = event.data;
    
    if (playerState === 1) { // PLAYING
      // Video started playing
      setVideoEngagement(prev => ({
        ...prev,
        isPlaying: true
      }));
    } else if (playerState === 2 || playerState === 0) { // PAUSED or ENDED
      // Video paused or ended - save progress
      setVideoEngagement(prev => ({
        ...prev,
        isPlaying: false
      }));
      saveVideoProgress();
    }
  };

  // Enhanced save function with engagement data
  const saveVideoProgress = async () => {
    if (!selectedModule) return;
    
    try {
      setSavingProgress(true);
      const response = await fetch(`/api/modules/${selectedModule.moduleId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoProgress: {
            watchTime: videoEngagement.actualWatchTime,
            totalDuration: videoEngagement.totalDuration,
            completed: videoEngagement.actualWatchTime >= videoEngagement.totalDuration * 0.8,
            engagementScore: videoEngagement.engagementScore,
            playbackRate: videoEngagement.playbackRate,
            seekCount: videoEngagement.seekCount
          }
        })
      });
      
      if (response.ok) {
        console.log('Video progress saved with engagement data');
      }
    } catch (error) {
      console.error('Error saving video progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleVideoComplete = () => {
    setShowVideoModal(false);
    
    // Check if module has interactive content
    if (selectedModule?.contentTypes?.interactive) {
      setShowInteractive(true);
    } else if (selectedModule?.contentTypes?.project) {
      setShowProject(true);
    } else if (selectedModule?.contentTypes?.peerLearning) {
      setShowPeerLearning(true);
    } else {
      setShowQuiz(true);
    }
    
    // Clear interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  };

  const handleInteractiveComplete = () => {
    setShowInteractive(false);
    
    // Move to next content type
    if (selectedModule?.contentTypes?.project) {
      setShowProject(true);
    } else if (selectedModule?.contentTypes?.peerLearning) {
      setShowPeerLearning(true);
    } else {
      setShowQuiz(true);
    }
  };

  const handleProjectSubmit = async () => {
    if (!selectedModule) return;
    
    try {
      setSavingProgress(true);
      const response = await fetch(`/api/modules/${selectedModule.moduleId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSubmission: {
            title: projectSubmission.title,
            content: projectSubmission.content,
            submissionType: selectedModule.contentTypes?.project?.submissionType || 'text'
          }
        })
      });
      
      if (response.ok) {
        setShowProject(false);
        
        // Move to next content type
        if (selectedModule.contentTypes?.peerLearning) {
          setShowPeerLearning(true);
        } else {
          setShowQuiz(true);
        }
      }
    } catch (error) {
      console.error('Error submitting project:', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const handlePeerLearningComplete = () => {
    setShowPeerLearning(false);
    setShowQuiz(true);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < (selectedModule?.quizQuestions?.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed, calculate results
      const results = selectedAnswers.map((answer, index) => {
        const question = selectedModule?.quizQuestions?.[index];
        return question ? answer === question.correctAnswer : false;
      });
      setQuizResults(results);
      setShowQuiz(false);
      setShowFeedback(true);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedModule) return;

    const quizAttempts: QuizAttempt[] = selectedAnswers.map((answer, index) => {
      const question = selectedModule?.quizQuestions?.[index];
      return {
        questionIndex: index,
        selectedAnswer: answer,
        isCorrect: quizResults[index],
        timeSpent: 30, // Assuming 30 seconds per question
        difficulty: question?.difficulty || 'medium',
        skillTags: question?.skillTags || []
      };
    });

    try {
      setSavingProgress(true);
      const response = await fetch(`/api/modules/${selectedModule.moduleId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
          videoProgress,
          quizAttempts,
          feedback,
          interactiveProgress: interactiveState.completed ? interactiveState : undefined,
          projectSubmission: projectSubmission.title ? projectSubmission : undefined,
          peerLearningProgress: peerLearningState.participationCount > 0 ? {
          participationCount: peerLearningState.participationCount,
          completedTasks: peerLearningState.completedTasks || []
        } : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local progress
        setModuleProgress(prev => ({
          ...prev,
          [selectedModule.moduleId]: data.progress
        }));
        
        setShowFeedback(false);
        setSelectedModule(null);
      }
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setSavingProgress(false);
    }
  };

  const getProgressStatus = (moduleId: string) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return 'not-started';
    if (progress.completed) return 'completed';
    if (progress.videoProgress.watchTime > 0 || progress.interactiveProgress || progress.projectSubmission) return 'in-progress';
    return 'not-started';
  };

  const getProgressPercentage = (moduleId: string) => {
    const progress = moduleProgress[moduleId];
    if (!progress) return 0;
    if (progress.completed) return 100;
    
    let percentage = 0;
    if (progress.videoProgress.completed) percentage += 25;
    if (progress.interactiveProgress?.completed) percentage += 25;
    if (progress.projectSubmission) percentage += 25;
    if (Array.isArray(progress.quizAttempts) && progress.quizAttempts.length > 0) percentage += 15;
    if (progress.feedback && progress.feedback.trim()) percentage += 10;
    
    return percentage;
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Clock className="w-4 h-4" />;
      case 'interactive': return <Code className="w-4 h-4" />;
      case 'project': return <FileText className="w-4 h-4" />;
      case 'peer': return <Users className="w-4 h-4" />;
      case 'quiz': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-12 text-center">
        <div className="text-6xl mb-6">📚</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Learning Modules Available</h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          There are currently no learning modules available. Please check back later or contact your administrator.
        </p>
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>Video lessons</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Interactive exercises</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Progress tracking</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const progressStatus = getProgressStatus(module.moduleId);
          const progressPercentage = getProgressPercentage(module.moduleId);
          const progress = moduleProgress[module.moduleId];

          return (
            <div key={module.moduleId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration || 0} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {module.points || 0} pts
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      {module.gamification?.quests?.length || 0} quests
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {progressStatus === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {progressStatus === 'in-progress' && (
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>

              {/* Content Types */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Learning Activities:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {module.contentTypes && Object.keys(module.contentTypes).length > 0 ? (
                    Object.keys(module.contentTypes).map((type) => (
                      <span
                        key={type}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                      >
                        {getContentTypeIcon(type)}
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      <Clock className="w-4 h-4" />
                      video
                    </span>
                  )}
                </div>
              </div>

              {/* AI-Powered Learning Tools */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">AI Learning Tools:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setShowAIAssistant(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                    title="AI Assistant - Get help and explanations"
                  >
                    <MessageCircle className="w-3 h-3" />
                    AI Assistant
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setShowAdvancedLearning(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                    title="Advanced Learning Interface"
                  >
                    <BookOpen className="w-3 h-3" />
                    Advanced Learning
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModule(module);
                      setShowBookmarks(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                    title="Manage bookmarks and notes"
                  >
                    <BookOpen className="w-3 h-3" />
                    Bookmarks
                  </button>
                                     <button
                     onClick={() => {
                       setSelectedModule(module);
                       setShowAdvancedFeatures(true);
                     }}
                     className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                     title="Advanced features and tools"
                   >
                     <Lightbulb className="w-3 h-3" />
                     Advanced Features
                   </button>
                   <button
                     onClick={() => {
                       setSelectedModule(module);
                       generateLearningContent(module.description);
                     }}
                     className="flex items-center gap-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
                     title="Generate AI flashcards and practice questions"
                   >
                     <Brain className="w-3 h-3" />
                     Generate AI Content
                   </button>
                </div>
              </div>

              {/* Test Out Information */}
              {progressStatus !== 'completed' && (
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500 mt-0.5">💡</span>
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">Quick Test Option Available</p>
                      <p className="text-xs text-orange-700">
                        Already familiar with this topic? Use &quot;Test Out&quot; to skip the lesson and take the quiz directly to earn your points!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Gamification Progress */}
              {progress?.gamificationProgress?.quests && module.gamification?.quests && module.gamification.quests.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-700">Quests:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {progress.gamificationProgress.quests.map((quest, index) => {
                      const questDef = module.gamification.quests[index];
                      if (!questDef || typeof questDef.target !== 'number' || !questDef.title) return null;
                      const target = questDef.target;
                      const current = Math.min(Math.round(quest.current || 0), target);
                      return (
                        <span
                          key={quest.questId}
                          className={`px-2 py-1 text-xs rounded-full ${
                            quest.completed 
                              ? 'bg-green-100 text-green-700 font-bold' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          title={questDef.title}
                          aria-label={questDef.title}
                        >
                          {quest.completed ? '✓ Completed' : `${current}/${target}`}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {module.tags && module.tags.length > 0 ? (
                    module.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      {module.subject || 'General'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {progressStatus !== 'completed' && (
                    <>
                      <button
                        onClick={() => markAsCompletedAndStartQuiz(module)}
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                        title="Skip lesson and take quiz directly"
                      >
                        Test Out
                      </button>
                      <button
                        onClick={() => startModule(module)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                      >
                        Start Lesson
                      </button>
                    </>
                  )}
                  {progressStatus === 'completed' && (
                    <button
                      disabled
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-green-100 text-green-700 cursor-not-allowed"
                    >
                      Completed
                    </button>
                  )}
                </div>
              </div>

              {progress && progress.pointsEarned > 0 && (
                <div className="mt-3 p-2 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    Earned {progress.pointsEarned} points
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-900">{selectedModule.title}</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="relative pb-[56.25%] h-0 mb-6">
                  <div className="absolute top-0 left-0 w-full h-full rounded-lg">
                    {extractYouTubeId(selectedModule.videoUrl) ? (
                      <YouTube
                        videoId={extractYouTubeId(selectedModule.videoUrl)}
                        opts={{
                          height: '100%',
                          width: '100%',
                          playerVars: {
                            autoplay: 0,
                            modestbranding: 1,
                            rel: 0
                          }
                        }}
                        onReady={onYouTubeReady}
                        onStateChange={onYouTubeStateChange}
                        className="w-full h-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">Video not available</p>
                          <p className="text-sm text-gray-400 mt-2">Invalid video URL</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Engagement Metrics */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Engagement Metrics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block text-xs uppercase tracking-wide">Watch Time</span>
                      <p className="font-semibold text-lg">{Math.round(videoEngagement.actualWatchTime / 60)} min</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block text-xs uppercase tracking-wide">Engagement</span>
                      <p className="font-semibold text-lg">{Math.round(videoEngagement.engagementScore)}%</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block text-xs uppercase tracking-wide">Playback Rate</span>
                      <p className="font-semibold text-lg">{videoEngagement.playbackRate}x</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-gray-600 block text-xs uppercase tracking-wide">Seeks</span>
                      <p className="font-semibold text-lg">{videoEngagement.seekCount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip Video
              </button>
              <button
                onClick={handleVideoComplete}
                disabled={!videoProgress.completed}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  videoProgress.completed
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal */}
      {showInteractive && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-blue-50">
              <h3 className="text-xl font-semibold text-gray-900">Interactive Exercise</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedModule.contentTypes?.interactive?.type || 'Interactive'} Exercise
                  </h4>
                  <p className="text-gray-600">
                    Complete the interactive exercise to continue with your learning journey.
                  </p>
                </div>
                
                {/* Interactive content would be rendered here */}
                <div className="bg-gray-50 p-8 rounded-lg mb-6 border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <Code className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      Interactive {selectedModule.contentTypes?.interactive?.type || 'learning'} content would be displayed here
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      This could include drag-and-drop exercises, coding challenges, or simulations
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={handleInteractiveComplete}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Complete Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Modal */}
      {showProject && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-green-50">
              <h3 className="text-xl font-semibold text-gray-900">Project Submission</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedModule.contentTypes?.project?.title || 'Project Assignment'}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedModule.contentTypes?.project?.description || 'Complete this project to demonstrate your understanding of the concepts learned.'}
                  </p>
                  
                  {selectedModule.contentTypes?.project?.requirements && selectedModule.contentTypes.project.requirements.length > 0 && (
                    <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                      <h5 className="font-semibold text-gray-900 mb-3">Requirements:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                        {selectedModule.contentTypes.project.requirements.map((req, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-amber-700 mr-2">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={projectSubmission.title}
                      onChange={(e) => setProjectSubmission(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                      placeholder="Enter your project title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      value={projectSubmission.content}
                      onChange={(e) => setProjectSubmission(prev => ({ ...prev, content: e.target.value }))}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-900"
                      placeholder="Describe your project in detail..."
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowProject(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip Project
              </button>
              <button
                onClick={handleProjectSubmit}
                disabled={!projectSubmission.title || !projectSubmission.content}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  projectSubmission.title && projectSubmission.content
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Submit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Peer Learning Modal */}
      {showPeerLearning && selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-purple-50">
              <h3 className="text-xl font-semibold text-gray-900">Peer Learning</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Discussion Topics</h4>
                  <div className="space-y-3">
                    {selectedModule.contentTypes?.peerLearning?.discussionTopics && selectedModule.contentTypes.peerLearning.discussionTopics.length > 0 ? (
                      selectedModule.contentTypes.peerLearning.discussionTopics.map((topic, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                          <p className="text-gray-700 font-medium">{topic}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <p className="text-gray-700 font-medium">Discuss the key concepts learned in this module</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Tasks</h4>
                  <div className="space-y-3">
                    {selectedModule.contentTypes?.peerLearning?.collaborationTasks && selectedModule.contentTypes.peerLearning.collaborationTasks.length > 0 ? (
                      selectedModule.contentTypes.peerLearning.collaborationTasks.map((task, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                          <p className="text-blue-700 font-medium">{task}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-blue-700 font-medium">Work together to solve problems related to this module</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-amber-700" />
                    <span className="font-semibold text-gray-900">Group Size: {selectedModule.contentTypes?.peerLearning?.groupSize || 4} students</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Work together with your peers to complete these collaborative activities.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={handlePeerLearningComplete}
                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Complete Peer Learning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedModule && selectedModule.quizQuestions && selectedModule.quizQuestions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-orange-50">
              <h3 className="text-xl font-semibold text-gray-900">Knowledge Check</h3>
              <p className="text-sm text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} of {selectedModule.quizQuestions.length}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">
                    {selectedModule.quizQuestions[currentQuestionIndex]?.question || 'Question not available'}
                  </h4>
                  <div className="space-y-3">
                    {selectedModule.quizQuestions[currentQuestionIndex]?.options?.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuizAnswer(index)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                          selectedAnswers[currentQuestionIndex] === index
                            ? 'border-orange-500 bg-orange-50 text-orange-900'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowQuiz(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip Quiz
              </button>
              <button
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  selectedAnswers[currentQuestionIndex] !== undefined
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex === (selectedModule.quizQuestions.length - 1) ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-indigo-50">
              <h3 className="text-xl font-semibold text-gray-900">Module Feedback</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How was your learning experience?
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Share your thoughts about this module, what you learned, and any suggestions for improvement..."
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900">Your feedback helps improve the learning experience!</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Your insights help us create better content and learning paths for all students.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => setShowFeedback(false)}
                className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Skip Feedback
              </button>
              <button
                onClick={handleFeedbackSubmit}
                disabled={savingProgress}
                className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {savingProgress ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
                 </div>
       )}

       {/* AI Assistant Modal */}
       {showAIAssistant && selectedModule && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">AI Learning Assistant</h3>
               <button
                 onClick={() => setShowAIAssistant(false)}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
               <AIAssistant
                 isPDFReady={false}
                 pdfContent={selectedModule.description}
                 onTextSelection={handleTextSelection}
                 className="h-full"
               />
             </div>
           </div>
         </div>
       )}

       {/* Advanced Learning Interface Modal */}
       {showAdvancedLearning && selectedModule && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">Advanced Learning Interface</h3>
               <button
                 onClick={() => setShowAdvancedLearning(false)}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
               <AdvancedLearningInterface className="h-full" />
             </div>
           </div>
         </div>
       )}

       {/* Video Learning Interface Modal */}
       {showVideoModal && selectedModule && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-green-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">Enhanced Video Learning</h3>
               <button
                 onClick={() => setShowVideoModal(false)}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
               <VideoLearningInterface 
                 className="h-full" 
                 moduleId={selectedModule?.moduleId}
                 videoData={selectedModule?.contentTypes?.video ? {
                   id: selectedModule.moduleId,
                   title: selectedModule.title,
                   url: selectedModule.contentTypes.video.url,
                   duration: selectedModule.contentTypes.video.duration,
                   thumbnail: `https://img.youtube.com/vi/${extractYouTubeId(selectedModule.contentTypes.video.url)}/maxresdefault.jpg`
                 } : undefined}
               />
             </div>
           </div>
         </div>
       )}

       {/* Bookmarks Panel Modal */}
       {showBookmarks && selectedModule && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-green-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">Bookmarks & Notes</h3>
               <button
                 onClick={() => setShowBookmarks(false)}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
               <BookmarksPanel
                 isOpen={showBookmarks}
                 onClose={() => setShowBookmarks(false)}
                 bookmarks={bookmarks}
                 onAddBookmark={handleAddBookmark}
                 onRemoveBookmark={handleRemoveBookmark}
               />
             </div>
           </div>
         </div>
       )}

       {/* Advanced Features Panel Modal */}
       {showAdvancedFeatures && selectedModule && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-orange-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">Advanced Learning Features</h3>
               <button
                 onClick={() => setShowAdvancedFeatures(false)}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden">
               <AdvancedFeaturePanel
                 isVisible={showAdvancedFeatures}
                 onToggle={() => setShowAdvancedFeatures(false)}
                 pdfContent={selectedModule.description}
                 apiKey=""
                 onExplanationResult={(result) => console.log('Explanation result:', result)}
               />
             </div>
           </div>
         </div>
       )}

       {/* AI-Generated Flashcards Modal */}
       {flashcards.length > 0 && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-purple-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">AI-Generated Flashcards</h3>
               <button
                 onClick={() => setFlashcards([])}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-hidden p-6">
               <div className="flex items-center justify-between mb-4">
                 <span className="text-sm text-gray-600">
                   Card {currentFlashcardIndex + 1} of {flashcards.length}
                 </span>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1))}
                     disabled={currentFlashcardIndex === 0}
                     className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                   >
                     Previous
                   </button>
                   <button
                     onClick={() => setCurrentFlashcardIndex(Math.min(flashcards.length - 1, currentFlashcardIndex + 1))}
                     disabled={currentFlashcardIndex === flashcards.length - 1}
                     className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                   >
                     Next
                   </button>
                 </div>
               </div>
               <div className="flex justify-center">
                 <FlashCard
                   flashcard={flashcards[currentFlashcardIndex]}
                   onFlip={() => {}}
                   onRestart={() => setCurrentFlashcardIndex(0)}
                   onSpeak={(text) => speechService.current?.speak(text)}
                   className="w-full max-w-md"
                 />
               </div>
             </div>
           </div>
         </div>
       )}

       {/* AI-Generated MCQ Modal */}
       {mcqQuestions.length > 0 && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
             <div className="p-4 border-b border-gray-200 bg-blue-50 flex justify-between items-center">
               <h3 className="text-xl font-semibold text-gray-900">AI-Generated Practice Questions</h3>
               <button
                 onClick={() => setMcqQuestions([])}
                 className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
               >
                 <XCircle className="w-6 h-6" />
               </button>
             </div>
             <div className="flex-1 overflow-y-auto p-6">
               <div className="mb-6">
                 <h4 className="text-lg font-semibold text-gray-900 mb-4">
                   {mcqQuestions[currentMcqIndex]?.question}
                 </h4>
                 <div className="space-y-3">
                   {mcqQuestions[currentMcqIndex]?.options.map((option, index) => (
                     <button
                       key={index}
                       onClick={() => {
                         // Handle answer selection
                         console.log('Selected answer:', index);
                       }}
                       className="w-full p-4 text-left rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                     >
                       <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm text-gray-600">
                   Question {currentMcqIndex + 1} of {mcqQuestions.length}
                 </span>
                 <div className="flex gap-2">
                   <button
                     onClick={() => setCurrentMcqIndex(Math.max(0, currentMcqIndex - 1))}
                     disabled={currentMcqIndex === 0}
                     className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50"
                   >
                     Previous
                   </button>
                   <button
                     onClick={() => setCurrentMcqIndex(Math.min(mcqQuestions.length - 1, currentMcqIndex + 1))}
                     disabled={currentMcqIndex === mcqQuestions.length - 1}
                     className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                   >
                     Next
                   </button>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       {/* Loading Indicator for AI Content Generation */}
       {isGeneratingContent && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
           <div className="bg-white rounded-lg p-8 flex flex-col items-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
             <p className="text-lg font-semibold text-gray-900">Generating AI Learning Content...</p>
             <p className="text-sm text-gray-600 mt-2">Creating flashcards and practice questions</p>
           </div>
         </div>
       )}
     </div>
   );
 } 