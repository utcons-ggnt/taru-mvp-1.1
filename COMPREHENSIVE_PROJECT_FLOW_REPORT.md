# 🎓 Taru - Comprehensive Project Flow Report

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Authentication & Authorization Flow](#authentication--authorization-flow)
5. [Student Journey Flow](#student-journey-flow)
6. [Assessment System](#assessment-system)
7. [Learning Path Generation](#learning-path-generation)
8. [Module System](#module-system)
9. [API Endpoints Overview](#api-endpoints-overview)
10. [Data Models & Relationships](#data-models--relationships)
11. [Session Management](#session-management)
12. [Real-time Features](#real-time-features)
13. [Integration Points](#integration-points)
14. [Security Implementation](#security-implementation)
15. [Performance Optimizations](#performance-optimizations)

---

## Project Overview

**Taru** is an AI-powered educational platform that provides personalized learning experiences for students, parents, teachers, and educational organizations. The platform uses advanced assessment systems, AI-generated learning paths, and real-time progress tracking to create adaptive educational journeys.

### Key Features
- **Multi-role Platform**: Students, Parents, Teachers, Organizations, Admins
- **AI-Powered Personalization**: Smart assessments and adaptive learning paths
- **Real-time Synchronization**: Live updates across all devices
- **Comprehensive Assessment System**: Interest, diagnostic, and skill assessments
- **Gamified Learning**: XP system, badges, and progress tracking
- **Session Management**: Robust state persistence and recovery

---

## System Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS
- **AI Integration**: N8N workflows for content generation
- **Real-time**: Custom session management system

### Architecture Diagram
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Student App   │    │   Parent App    │    │  Teacher App    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Progress      │    │ • Class Mgmt    │
│ • Learning      │    │ • Reports       │    │ • Analytics     │
│ • Assessment    │    │ • Notifications │    │ • Content       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   API Gateway   │
                    │                 │
                    │ • Authentication│
                    │ • Real-time Sync│
                    │ • File Upload   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   MongoDB       │
                    │                 │
                    │ • User Data     │
                    │ • Learning Data │
                    │ • Analytics     │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   N8N AI        │
                    │                 │
                    │ • Content Gen   │
                    │ • Assessments   │
                    │ • Learning Paths│
                    └─────────────────┘
```

---

## User Roles & Permissions

### 1. Student
**Capabilities:**
- Complete onboarding and assessments
- Access personalized learning paths
- Take modules and track progress
- Use AI chat assistant
- View achievements and XP

**Permissions:**
- `student_profile`: read, update
- `modules`: read, complete
- `assessments`: read, submit
- `progress`: read
- `learning_paths`: read, save

### 2. Parent
**Capabilities:**
- Monitor child's progress
- View reports and analytics
- Link to student account
- Receive notifications

**Permissions:**
- `parent_profile`: read, update
- `child_progress`: read
- `child_teachers`: read
- `organization_info`: read
- `notifications`: read, update

### 3. Teacher
**Capabilities:**
- Manage student accounts
- Track class progress
- Generate reports
- Bulk import students
- Create assignments

**Permissions:**
- `teacher_profile`: read, update
- `students`: read, create, update, bulk_import
- `student_progress`: read, export
- `assignments`: create, read, update, delete
- `reports`: read, export

### 4. Organization Admin
**Capabilities:**
- Manage organization settings
- Invite teachers and students
- View organization-wide analytics
- Manage branches
- Audit logs

**Permissions:**
- `organization_profile`: read, update
- `branches`: create, read, update, delete
- `teachers`: create, read, update, invite, manage
- `students`: read, export
- `reports`: read, export, generate
- `audit_logs`: read
- `invitations`: create, read, manage

### 5. Platform Super Admin
**Capabilities:**
- Manage all organizations
- System-wide analytics
- Platform settings
- Override capabilities

**Permissions:**
- `psa_profile`: read, update
- `organizations`: read, approve, reject, suspend
- `audit_logs`: read, export, monitor
- `system_override`: execute
- `platform_settings`: read, update
- `all_data`: read, export

---

## Authentication & Authorization Flow

### Registration Process
1. **User Registration** (`/api/auth/register`)
   - Validate input (name, email, password, role)
   - Check for existing users
   - Role-specific validation (e.g., parent linking to student)
   - Create user with hashed password
   - Generate JWT token with onboarding flags
   - Set HTTP-only cookie

2. **Role-Specific Onboarding Flags**
   - Students: `requiresOnboarding = true`
   - Parents: `requiresOnboarding = true`
   - Others: `requiresOnboarding = false`

### Login Process
1. **Authentication** (`/api/auth/login`)
   - Validate credentials
   - Check password using bcrypt
   - Determine onboarding/assessment requirements
   - Generate JWT with user context
   - Set secure HTTP-only cookie

2. **Onboarding/Assessment Checks**
   - **Students**: Check onboarding completion → interest assessment → diagnostic assessment
   - **Parents**: Check onboarding completion
   - **Organizations**: Check onboarding completion

### Middleware Protection
- **Route Protection**: Dashboard routes, assessments, modules
- **Role-based Access**: Each role can only access their specific routes
- **Onboarding Redirects**: Automatic redirects to required onboarding steps
- **Token Validation**: JWT verification on protected routes

### Session Management
- **JWT Tokens**: 7-day expiration with refresh capability
- **HTTP-only Cookies**: Secure token storage
- **Session Persistence**: State management across page reloads
- **Auto-logout**: Inactive session handling

---

## Student Journey Flow

### 1. Registration & Initial Setup
```
Registration → Email Verification → Role Selection → Basic Profile
```

### 2. Student Onboarding Flow
```
Student Onboarding (3 Steps):
├── Step 1: Personal Information
│   ├── Full Name, Nickname
│   ├── Date of Birth, Age, Gender
│   ├── Class Grade, School Information
│   └── Guardian Details
├── Step 2: Preferences & Interests
│   ├── Language Preference
│   ├── Learning Mode Preferences
│   ├── Interests Outside Class
│   └── Preferred Career Domains
└── Step 3: Consent & Technical
    ├── Data Usage Consent
    ├── Terms & Conditions
    ├── Device ID
    └── Location (optional)
```

### 3. Assessment Flow
```
Interest Assessment (4 Steps):
├── Step 1: Broad Interest Clusters
│   └── Select from 14 predefined clusters
├── Step 2: Cluster Deep Dive
│   └── Detailed questions per selected cluster
├── Step 3: Personality Insights
│   ├── Learning Style Preferences
│   ├── Challenge Approach
│   └── Core Values
└── Step 4: Career Direction
    ├── Dream Career
    ├── Exciting Career Types
    └── Career Attraction Factors

Diagnostic Assessment:
├── AI-Generated Questions (via N8N)
├── Fallback Questions (if N8N fails)
├── Real-time Progress Tracking
├── Answer Persistence
└── Result Calculation & Analysis
```

### 4. Learning Path Generation
```
Assessment Results → AI Analysis (N8N) → Personalized Learning Path → Module Recommendations
```

### 5. Module Learning Flow
```
Module Selection → Session Creation → Content Consumption → Progress Tracking → XP/Achievement Updates
```

---

## Assessment System

### Interest Assessment
**Purpose**: Understand student's interests, personality, and career aspirations

**Data Collected**:
- Broad interest clusters (14 categories)
- Cluster-specific deep dive responses
- Learning style preferences
- Challenge approach patterns
- Core values identification
- Career direction and aspirations

**API Endpoint**: `/api/student/interest-assessment`

### Diagnostic Assessment
**Purpose**: Evaluate academic skills and knowledge levels

**Features**:
- AI-generated questions via N8N integration
- Fallback question system
- Real-time progress tracking
- Answer persistence across sessions
- Adaptive difficulty based on responses

**API Endpoints**:
- `/api/assessment/questions` - Get questions and submit answers
- `/api/assessment/diagnostic` - Complete assessment and get results
- `/api/assessment/result` - Retrieve assessment results

### Assessment Data Flow
```
Student Starts Assessment → Load Previous Progress → Generate/Get Questions → 
Submit Answers → Save Progress → Calculate Results → Generate Learning Path
```

---

## Learning Path Generation

### AI-Powered Generation
**Primary Method**: N8N Workflow Integration
- Sends student profile and assessment data to N8N
- Receives personalized learning path with milestones
- Creates structured learning journey

**Fallback Method**: Rule-based Generation
- Uses predefined templates based on student interests
- Creates basic learning paths when AI is unavailable
- Ensures system reliability

### Learning Path Structure
```json
{
  "pathId": "LP_timestamp_random",
  "name": "Personalized Learning Path",
  "description": "AI-generated path based on assessment",
  "milestones": [
    {
      "milestoneId": "MIL_1",
      "name": "Foundation Skills",
      "description": "Build core competencies",
      "modules": ["module1", "module2"],
      "estimatedTime": 120,
      "status": "available",
      "progress": 0
    }
  ],
  "totalModules": 15,
  "totalDuration": 1800,
  "totalXpPoints": 500
}
```

### API Endpoints
- `/api/learning-paths/generate` - Generate new learning path
- `/api/learning-paths` - Get learning paths for student
- `/api/learning-paths/save` - Save learning path responses
- `/api/learning-paths/responses` - Get/save learning path responses

---

## Module System

### Module Structure
```json
{
  "uniqueID": "MOD_001",
  "title": "Introduction to Mathematics",
  "description": "Basic mathematical concepts",
  "subject": "Mathematics",
  "grade": "6",
  "difficulty": "beginner",
  "duration": 45,
  "videoUrl": "https://youtube.com/watch?v=...",
  "transcribe": "Video transcription text",
  "points": 100,
  "tags": ["math", "basics", "grade6"]
}
```

### Module Learning Flow
1. **Module Selection**: Student chooses from recommended modules
2. **Session Creation**: Initialize learning session with progress tracking
3. **Content Consumption**: Video watching with transcription
4. **Progress Updates**: Real-time progress saving
5. **Completion**: Mark module as completed, award XP
6. **Next Module**: Suggest next module in learning path

### Session Management
- **Session Creation**: `/api/session/create`
- **Progress Tracking**: `/api/session/update-progress`
- **Session Recovery**: Automatic session restoration
- **State Persistence**: LocalStorage + Database backup

### API Endpoints
- `/api/modules/recommended` - Get recommended modules
- `/api/modules/generate-content` - Generate module content
- `/api/session/get-active-session` - Get current session
- `/api/session/update-progress` - Update learning progress

---

## API Endpoints Overview

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user data

### Student Endpoints
- `POST /api/student/onboarding` - Complete student onboarding
- `POST /api/student/interest-assessment` - Submit interest assessment
- `GET /api/student/profile` - Get student profile
- `POST /api/student/profile` - Update student profile

### Assessment Endpoints
- `GET /api/assessment/questions` - Get assessment questions
- `POST /api/assessment/diagnostic` - Submit diagnostic assessment
- `GET /api/assessment/result` - Get assessment results
- `POST /api/assessment/result` - Save assessment results

### Learning Path Endpoints
- `POST /api/learning-paths/generate` - Generate learning path
- `GET /api/learning-paths` - Get learning paths
- `POST /api/learning-paths/save` - Save learning path
- `GET /api/learning-paths/responses` - Get learning path responses
- `POST /api/learning-paths/responses` - Save learning path responses

### Module Endpoints
- `GET /api/modules/recommended` - Get recommended modules
- `GET /api/modules/generate-content` - Generate module content
- `POST /api/modules/generate-content` - Generate module content (POST)

### Session Endpoints
- `GET /api/session/get-active-session` - Get active session
- `POST /api/session/get-active-session` - Get active session (POST)
- `POST /api/session/update-progress` - Update session progress

### Chat/AI Endpoints
- `GET /api/chat` - AI chat interface
- `POST /api/chat` - AI chat interface (POST)

### Teacher Endpoints
- `GET /api/teacher/students` - Get teacher's students
- `POST /api/teacher/students` - Create new student
- `POST /api/teacher/bulk-import-students` - Bulk import students
- `GET /api/teacher/students/export-credentials` - Export student credentials

### Organization Endpoints
- `GET /api/organization/branches` - Get organization branches
- `POST /api/organization/branches` - Create new branch
- `GET /api/organization/teachers` - Get organization teachers
- `POST /api/organization/invite-teacher` - Invite teacher

### Webhook Endpoints
- `POST /api/webhook/chat-transcribe` - Chat transcription webhook
- `POST /api/webhook/trigger-current-student` - Trigger student data webhook
- `POST /api/learning-paths/webhook` - Learning path generation webhook

---

## Data Models & Relationships

### Core Models

#### User Model
```typescript
interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'student' | 'teacher' | 'parent' | 'organization' | 'admin' | 'platform_super_admin';
  profile: Record<string, any>;
  avatar?: string;
  firstTimeLogin: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Student Model
```typescript
interface IStudent {
  userId: string; // References User._id
  uniqueId: string; // Generated unique identifier
  fullName: string;
  nickname?: string;
  dateOfBirth: Date;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  classGrade: string;
  schoolName: string;
  schoolId: string;
  languagePreference: string;
  learningModePreference: string[];
  interestsOutsideClass: string[];
  preferredCareerDomains: string[];
  guardian: {
    name: string;
    contactNumber: string;
    email?: string;
  };
  onboardingCompleted: boolean;
  interestAssessmentCompleted: boolean;
  // Interest assessment data
  broadInterestClusters: string[];
  clusterDeepDive: Record<string, any>;
  personalityInsights: {
    learningStyle: string[];
    challengeApproach: string;
    coreValues: string[];
  };
  careerDirection: {
    dreamCareer: string;
    excitingCareerTypes: string[];
    careerAttraction: string;
  };
  // Session management
  currentSession: {
    sessionId: string;
    currentPage: string;
    lastActivity: Date;
  };
  navigationHistory: Array<{
    page: string;
    timestamp: Date;
    data: any;
  }>;
}
```

#### LearningPath Model
```typescript
interface ILearningPath {
  pathId: string;
  uniqueId: string; // References Student.uniqueId
  name: string;
  description: string;
  category: 'academic' | 'vocational' | 'life-skills';
  targetGrade: string;
  careerGoal: string;
  milestones: Array<{
    milestoneId: string;
    name: string;
    description: string;
    modules: string[];
    estimatedTime: number;
    prerequisites: string[];
    status: 'locked' | 'available' | 'in-progress' | 'completed';
    progress: number;
    submodules: Array<{
      title: string;
      description: string;
      chapters: Array<{
        title: string;
        description: string;
        estimatedTime: number;
        resources: string[];
        completed: boolean;
      }>;
      completed: boolean;
    }>;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skills: string[];
    learningObjectives: string[];
  }>;
  totalModules: number;
  totalDuration: number;
  totalXpPoints: number;
  isActive: boolean;
  source: 'n8n' | 'fallback' | 'manual' | 'ai-generated';
  studentProgress: {
    currentMilestone: string;
    completedMilestones: string[];
    totalTimeSpent: number;
    lastAccessed: Date;
    completionPercentage: number;
  };
}
```

#### Module Model
```typescript
interface IModule {
  _id: string;
  uniqueID: string;
  title: string;
  description: string;
  subject: string;
  grade: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  videoUrl: string;
  transcribe?: string;
  points: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### AssessmentResponse Model
```typescript
interface IAssessmentResponse {
  _id: string;
  uniqueId: string; // References Student.uniqueId
  assessmentType: 'diagnostic' | 'interest' | 'skill';
  questions: Array<{
    questionId: string;
    question: string;
    answer: string;
    timestamp: Date;
  }>;
  answers: Record<string, any>;
  scores: Record<string, number>;
  overallScore: number;
  percentageScore: number;
  learningStyle: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number;
}
```

### Model Relationships
```
User (1) ←→ (1) Student
User (1) ←→ (1) Teacher
User (1) ←→ (1) Parent
User (1) ←→ (1) Organization

Student (1) ←→ (N) LearningPath
Student (1) ←→ (N) AssessmentResponse
Student (1) ←→ (N) ModuleSession
Student (1) ←→ (N) StudentProgress

LearningPath (1) ←→ (N) Module (through milestones)
Module (1) ←→ (N) ModuleSession
```

---

## Session Management

### Session Architecture
The platform implements a robust session management system that ensures data persistence and recovery across browser sessions.

### Key Components

#### 1. ClientSessionService
- **Purpose**: Manages client-side session state
- **Features**: 
  - State persistence in localStorage
  - Automatic state recovery
  - Cross-tab synchronization
  - Offline support

#### 2. SessionManager
- **Purpose**: Server-side session management
- **Features**:
  - Database session storage
  - Session validation
  - Automatic cleanup
  - Multi-device support

#### 3. Custom Hooks
- **useEnhancedSession**: Enhanced session management with persistence
- **useNavigationWithState**: Navigation with state preservation
- **useAssessmentState**: Assessment-specific state management
- **useModuleState**: Module learning state management

### Session Flow
```
User Action → Update Local State → Save to localStorage → 
Sync to Database → Broadcast to Other Tabs → Update UI
```

### Data Persistence Strategy
1. **Primary Storage**: MongoDB database
2. **Backup Storage**: localStorage for offline access
3. **Recovery Mechanism**: Automatic data recovery on page load
4. **Conflict Resolution**: Server state takes precedence

---

## Real-time Features

### Live Updates
- **Progress Tracking**: Real-time progress updates across devices
- **Session Synchronization**: Multi-tab session synchronization
- **Notification System**: Real-time notifications for parents/teachers
- **Chat Integration**: Live AI chat responses

### State Management
- **Global State**: React Context for application state
- **Local State**: Component-level state management
- **Persistent State**: Database-backed state persistence
- **Recovery State**: Automatic state recovery mechanisms

---

## Integration Points

### N8N Integration
**Purpose**: AI-powered content generation and assessment

**Endpoints**:
- Learning path generation
- Assessment question generation
- Module content creation
- Chat responses

**Webhook URLs**:
- `N8N_WEBHOOK_URL`: Main chat interface
- `N8N_MODULE_ASSESSMENT_WEBHOOK_URL`: Module assessment generation
- `N8N_LEARNING_PATH_WEBHOOK_URL`: Learning path generation

### YouTube Integration
- **Video Content**: Module videos hosted on YouTube
- **Transcription**: Automatic video transcription
- **Analytics**: Video engagement tracking

### MongoDB Integration
- **Primary Database**: All application data
- **Collections**: Users, Students, LearningPaths, Modules, etc.
- **Indexing**: Optimized queries with proper indexing
- **Aggregation**: Complex analytics queries

---

## Security Implementation

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **HTTP-only Cookies**: Prevents XSS attacks
- **Password Hashing**: bcrypt with salt rounds
- **Token Expiration**: 7-day token lifetime
- **Secure Headers**: CSRF protection, secure cookies

### Authorization Security
- **Role-based Access Control**: Granular permissions
- **Route Protection**: Middleware-based route protection
- **API Security**: Token validation on all protected endpoints
- **Data Isolation**: Users can only access their own data

### Data Security
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection Prevention**: Mongoose ODM protection
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: SameSite cookie attributes

### Privacy Compliance
- **Data Encryption**: Sensitive data encryption
- **Consent Management**: Explicit user consent
- **Data Retention**: Configurable data retention policies
- **Audit Logging**: Comprehensive audit trails

---

## Performance Optimizations

### Frontend Optimizations
- **Code Splitting**: Dynamic imports for route-based splitting
- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Next.js Image component
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Browser caching strategies

### Backend Optimizations
- **Database Indexing**: Optimized MongoDB indexes
- **Query Optimization**: Efficient database queries
- **Caching**: Redis caching for frequently accessed data
- **API Optimization**: Response compression and pagination
- **CDN Integration**: Static asset delivery

### Real-time Optimizations
- **State Management**: Efficient state updates
- **Debouncing**: Input debouncing for API calls
- **Throttling**: Rate limiting for API endpoints
- **Connection Pooling**: Database connection optimization

---

## Conclusion

Taru represents a comprehensive, AI-powered educational platform with sophisticated user management, assessment systems, and personalized learning experiences. The platform's architecture supports scalability, security, and real-time collaboration while maintaining a focus on user experience and educational effectiveness.

### Key Strengths
1. **Comprehensive User Management**: Multi-role system with granular permissions
2. **AI-Powered Personalization**: Advanced assessment and learning path generation
3. **Robust Session Management**: Reliable state persistence and recovery
4. **Real-time Features**: Live updates and synchronization
5. **Security-First Design**: Comprehensive security implementation
6. **Scalable Architecture**: Modern tech stack with performance optimizations

### Future Enhancements
1. **Mobile App Development**: Native mobile applications
2. **Advanced Analytics**: Machine learning insights
3. **Gamification Expansion**: Enhanced reward systems
4. **Collaborative Features**: Peer learning and group activities
5. **Content Marketplace**: User-generated content platform

---

*This report provides a comprehensive overview of the Taru platform's architecture, features, and implementation details. For specific technical implementation details, refer to the individual source files and API documentation.*
