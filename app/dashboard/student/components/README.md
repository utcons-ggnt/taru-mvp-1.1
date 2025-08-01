# Student Dashboard Components

## ModulesTab.tsx

The ModulesTab component provides a comprehensive learning module interface for students with the following features:

### Key Features

1. **Module Display**
   - Grid layout showing all available learning modules
   - Progress tracking for each module
   - Visual indicators for completion status
   - Module metadata (duration, points, quests)

2. **AI-Powered Learning Tools**
   - **AI Assistant**: Interactive chat interface for questions and explanations
   - **Advanced Learning Interface**: Multi-modal learning with PDF and video support
   - **AI-Generated Content**: Automatic flashcard and MCQ generation
   - **Text-to-Speech**: Audio playback of content and responses
   - **Smart Text Selection**: Context-aware actions (explain, define, translate, summarize)

3. **Video Learning**
   - YouTube video integration using react-youtube
   - Real-time engagement tracking
   - Progress monitoring with engagement metrics
   - Automatic progress saving
   - Enhanced video learning interface with AI integration

4. **Interactive Learning Activities**
   - Support for multiple content types:
     - Video lessons
     - Interactive exercises
     - Project submissions
     - Peer learning activities
     - Knowledge quizzes
   - AI-generated flashcards and practice questions
   - Interactive text selection with AI actions

5. **Progress Tracking**
   - Video watch time tracking
   - Quiz score calculation
   - Interactive exercise completion
   - Project submission tracking
   - Peer learning participation
   - AI-powered learning analytics

6. **Gamification**
   - Quest system with progress tracking
   - Points earning system
   - Badge achievements
   - Learning streaks

7. **Assessment & Feedback**
   - Multiple choice quizzes
   - Real-time scoring
   - Detailed feedback collection
   - AI-powered insights
   - AI-generated practice questions

8. **Advanced Features**
   - **Bookmarks Panel**: Save and organize important content
   - **Advanced Feature Panel**: PDF processing and analysis
   - **Speech Progress Indicator**: Audio playback controls
   - **Multi-language Support**: Text-to-speech in multiple languages

### Technical Implementation

#### Dependencies
- `react-youtube`: YouTube video player integration
- `lucide-react`: Icon components
- `react-card-flip`: Flashcard animations
- `react-speech-recognition`: Voice input support
- Custom API endpoints for data management
- N8N webhook integration for AI services

#### State Management
- Module data and progress tracking
- Video engagement metrics
- Quiz state management
- Modal visibility controls

#### API Integration
- `/api/modules/recommended`: Fetch available modules
- `/api/modules/[id]/progress`: Save and retrieve progress
- JWT authentication for secure access
- N8N webhooks for AI-powered features:
  - `N8N_WEBHOOK_URL`: General AI chat and responses (https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN)
  - `N8N_MODULE_ASSESSMENT_WEBHOOK_URL`: MCQ and flashcard generation (https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions)
  - `N8N_LEARNING_PATH_WEBHOOK_URL`: Learning path recommendations (https://nclbtaru.app.n8n.cloud/webhook/learnign-path)
  - `N8N_ASSESSMENT_WEBHOOK_URL`: Assessment generation (https://nclbtaru.app.n8n.cloud/webhook/learnign-path)

#### Error Handling
- Graceful fallbacks for missing data
- Loading states and error messages
- Safe navigation with optional chaining

### Usage

The component is automatically loaded in the student dashboard and provides:

1. **Module Selection**: Students can browse and select modules to start learning
2. **Progress Monitoring**: Real-time progress tracking across all learning activities
3. **Interactive Learning**: Multi-modal learning experience with video, exercises, and assessments
4. **Gamification**: Engaging quest system and point-based rewards

### Data Structure

Modules follow a comprehensive schema including:
- Basic metadata (title, description, subject, grade)
- Content types (video, interactive, project, peer learning)
- Assessment questions and answers
- Gamification elements (quests, badges, points)
- AI-powered features and adaptive learning

### Future Enhancements

- Real-time collaborative features
- Advanced AI-powered recommendations
- Enhanced gamification elements
- Mobile-optimized interface
- Offline learning capabilities

## Transcript Integration

The application now supports transcript generation and analysis for seeded modules:

### Features:
- **Automatic Transcript Generation**: Creates transcripts for seeded modules using N8N
- **Transcript Caching**: Stores transcripts in localStorage for performance
- **Real-time Analytics**: Sends transcript data to N8N during video interactions
- **Interactive Transcript**: Click on transcript segments to jump to video timestamps

### Data Sent to N8N:
- **Transcript ID**: Unique identifier for each transcript
- **Video Metadata**: Title, URL, duration, module ID
- **Transcript Segments**: Text, timestamps, confidence scores
- **User Interactions**: Clicks, video events, current playback time
- **Context Information**: Selected text, current segment, user actions

### API Endpoints:
- `POST /api/modules/[id]/transcript` - Generate or send transcript data
- `GET /api/modules/[id]/transcript` - Get transcript information

### Components:
- `TranscriptService` - Handles transcript generation and caching
- `VideoLearningInterface` - Displays interactive transcript
- `VideoPlayer` - Sends transcript data with video analytics

### N8N Integration:
- **Transcript Generation**: Sends video URLs to N8N for transcript creation
- **Transcript Analysis**: Sends transcript data for AI-powered analysis
- **Real-time Context**: Provides current video time and selected text to N8N
- **User Interaction Tracking**: Monitors how users interact with transcript segments 