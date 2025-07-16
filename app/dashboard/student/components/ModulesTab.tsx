'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Clock, Star, CheckCircle, XCircle, Users, Code, FileText, Trophy, Brain, Target, Award } from 'lucide-react';
import { useAutoDataSync } from '@/lib/DataSyncProvider';
import { DataSyncEvents } from '@/lib/dataSync';

// YouTube API types
declare global {
  interface Window {
    YT: {
      Player: {
        new (element: string | HTMLElement, config: Record<string, unknown>): {
          getCurrentTime(): number;
          getDuration(): number;
          getPlaybackRate(): number;
          getPlayerState(): number;
        };
      };
      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
  }
}

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
  
  const playerRef = useRef<{
    getCurrentTime(): number;
    getDuration(): number;
    getPlaybackRate(): number;
    getPlayerState(): number;
  } | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use data synchronization for modules
  const { data: modulesData } = useAutoDataSync(
    DataSyncEvents.MODULE_UPDATED,
    async () => {
      const response = await fetch('/api/modules/recommended');
      if (!response.ok) {
        throw new Error('Failed to fetch modules');
      }
      const data = await response.json();
      return data.modules || [];
    },
    'modules',
    []
  );

  // Update modules state when data changes
  useEffect(() => {
    if (modulesData) {
      setModules(modulesData);
      setLoading(false);
      
      // Load progress for each module
      modulesData.forEach((module: Module) => {
        loadModuleProgress(module.id);
      });
    }
  }, [modulesData]);

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

  const onYouTubeReady = (event: { target: { getCurrentTime: () => number; getDuration: () => number; getPlaybackRate: () => number; getPlayerState: () => number } }) => {
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
        
        const isActuallyWatching = playerState === window.YT.PlayerState.PLAYING;
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
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      // Video started playing
      setVideoEngagement(prev => ({
        ...prev,
        isPlaying: true
      }));
    } else if (playerState === window.YT.PlayerState.PAUSED || 
               playerState === window.YT.PlayerState.ENDED) {
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
      const response = await fetch(`/api/modules/${selectedModule.id}/progress`, {
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
    if (selectedModule?.contentTypes.interactive) {
      setShowInteractive(true);
    } else if (selectedModule?.contentTypes.project) {
      setShowProject(true);
    } else if (selectedModule?.contentTypes.peerLearning) {
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
    if (selectedModule?.contentTypes.project) {
      setShowProject(true);
    } else if (selectedModule?.contentTypes.peerLearning) {
      setShowPeerLearning(true);
    } else {
      setShowQuiz(true);
    }
  };

  const handleProjectSubmit = async () => {
    if (!selectedModule) return;
    
    try {
      setSavingProgress(true);
      const response = await fetch(`/api/modules/${selectedModule.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectSubmission: {
            title: projectSubmission.title,
            content: projectSubmission.content,
            submissionType: selectedModule.contentTypes.project?.submissionType || 'text'
          }
        })
      });
      
      if (response.ok) {
        setShowProject(false);
        
        // Move to next content type
        if (selectedModule.contentTypes.peerLearning) {
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
      const response = await fetch(`/api/modules/${selectedModule.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoProgress,
          quizAttempts,
          feedback,
          interactiveProgress: interactiveState.completed ? interactiveState : undefined,
          projectSubmission: projectSubmission.title ? projectSubmission : undefined,
          peerLearningProgress: peerLearningState.participationCount > 0 ? peerLearningState : undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update local progress
        setModuleProgress(prev => ({
          ...prev,
          [selectedModule.id]: data.progress
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
    if (progress.quizAttempts.length > 0) percentage += 15;
    if (progress.feedback.trim()) percentage += 10;
    
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const progressStatus = getProgressStatus(module.id);
          const progressPercentage = getProgressPercentage(module.id);
          const progress = moduleProgress[module.id];

          return (
            <div key={module.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {module.points} pts
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
                  {Object.keys(module.contentTypes || {}).map((type) => (
                    <span
                      key={type}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full"
                    >
                      {getContentTypeIcon(type)}
                      {type}
                    </span>
                  ))}
                </div>
              </div>

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
              {progress?.gamificationProgress && module.gamification?.quests?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">Quests:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {progress.gamificationProgress.quests.map((quest, index) => (
                      <span
                        key={quest.questId}
                        className={`px-2 py-1 text-xs rounded-full ${
                          quest.completed 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {quest.current}/{module.gamification.quests[index]?.target}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {module.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => startModule(module)}
                  disabled={progressStatus === 'completed'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    progressStatus === 'completed'
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {progressStatus === 'completed' ? 'Completed' : 'Start'}
                </button>
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
                  <iframe
                    src={selectedModule.videoUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      // Initialize YouTube IFrame API
                      if (window.YT) {
                        new window.YT.Player('youtube-player', {
                          events: {
                            onReady: onYouTubeReady,
                            onStateChange: onYouTubeStateChange
                          }
                        });
                      }
                    }}
                  ></iframe>
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
                    {selectedModule.contentTypes.interactive?.type} Exercise
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
                      Interactive {selectedModule.contentTypes.interactive?.type} content would be displayed here
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
                    {selectedModule.contentTypes.project?.title}
                  </h4>
                  <p className="text-gray-600 mb-4">
                    {selectedModule.contentTypes.project?.description}
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <h5 className="font-semibold text-gray-900 mb-3">Requirements:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                      {selectedModule.contentTypes.project?.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-yellow-600 mr-2">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
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
                    {selectedModule.contentTypes.peerLearning?.discussionTopics.map((topic, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <p className="text-gray-700 font-medium">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Collaboration Tasks</h4>
                  <div className="space-y-3">
                    {selectedModule.contentTypes.peerLearning?.collaborationTasks.map((task, index) => (
                      <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-blue-700 font-medium">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold text-gray-900">Group Size: {selectedModule.contentTypes.peerLearning?.groupSize} students</span>
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
      {showQuiz && selectedModule && selectedModule.quizQuestions && (
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
                    {selectedModule.quizQuestions[currentQuestionIndex].question}
                  </h4>
                  <div className="space-y-3">
                    {selectedModule.quizQuestions[currentQuestionIndex].options.map((option, index) => (
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
    </div>
  );
} 