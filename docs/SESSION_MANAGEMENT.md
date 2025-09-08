# Session Management System

## Overview

This comprehensive session management system preserves content, data, and results across navigation in your educational platform. It automatically saves and restores user state, assessment progress, module progress, and career exploration data.

## Key Features

### ✅ Complete State Preservation
- **Page Data**: Saves and restores content across all pages
- **Assessment Progress**: Preserves diagnostic and interest assessment data
- **Module Progress**: Tracks video progress, quiz answers, and completion status
- **Career Data**: Maintains career exploration and path selection
- **Navigation History**: Tracks user journey through the platform

### ✅ MongoDB Integration
- **Existing Data Migration**: Automatically migrates data from your existing collections
- **Real-time Sync**: Keeps session data synchronized with MongoDB
- **Performance Optimized**: Uses efficient queries and indexing

### ✅ Smart Data Loading
- **Priority Loading**: Loads saved state first, then falls back to fresh data
- **Automatic Migration**: Migrates existing data when needed
- **Error Handling**: Graceful fallbacks when data is unavailable

## Architecture

### Models Created

1. **UserSession** - Tracks user navigation and page data
2. **AssessmentSession** - Manages assessment progress and results
3. **ModuleSession** - Handles module progress and completion
4. **CareerSession** - Stores career exploration data

### Enhanced Models

- **Student** - Added session tracking fields
- **Assessment** - Added navigation state fields

### Services

- **SessionManager** - Centralized session management
- **useEnhancedSession** - React hook for session data
- **useNavigationWithState** - Navigation with state preservation

## Data Migration

The system automatically migrates data from your existing collections:

- `learning-path-student` → Career session data
- `Learning-path-responses` → Assessment results
- `n8nresults` → N8N analysis results
- `Career-Option-Generation` → Career options
- `students` → Student profile data
- `studentprogresses` → Progress tracking

## Usage Examples

### Basic Page State Management

```typescript
import { useNavigationWithState } from '@/lib/hooks/useNavigationWithState';

function MyComponent() {
  const { navigateWithState, savePageState, loadPageState } = useNavigationWithState();

  // Save current page state
  const saveState = async () => {
    await savePageState(window.location.pathname, {
      formData: formData,
      currentStep: currentStep,
      userInput: userInput
    });
  };

  // Navigate with state preservation
  const handleNavigation = async () => {
    await navigateWithState('/next-page', currentPageData);
  };
}
```

### Enhanced Session Data

```typescript
import { useEnhancedSession } from '@/lib/hooks/useEnhancedSession';

function Dashboard() {
  const { 
    sessionData, 
    getCareerPathData, 
    getAssessmentResults,
    getStudentProgress 
  } = useEnhancedSession();

  // Access career path data
  const careerData = getCareerPathData();
  
  // Access assessment results
  const assessmentResults = getAssessmentResults();
  
  // Access student progress
  const progress = getStudentProgress();
}
```

### Assessment State Management

```typescript
import { useAssessmentState } from '@/lib/hooks/useAssessmentState';

function AssessmentPage() {
  const { 
    state, 
    addAnswer, 
    updateProgress, 
    completeAssessment 
  } = useAssessmentState('diagnostic');

  // Add answer and save progress
  const handleAnswer = async (answer) => {
    await addAnswer(answer);
    await updateProgress(currentQuestion, totalQuestions);
  };
}
```

## API Endpoints

### Session Management
- `POST /api/session/save` - Save page data
- `GET /api/session/load?page=...` - Load page data
- `POST /api/session/migrate` - Migrate existing data

### Assessment Sessions
- `POST /api/session/assessment` - Save assessment progress
- `GET /api/session/assessment?assessmentType=...&studentId=...` - Load assessment progress

### Module Sessions
- `POST /api/session/module` - Save module progress
- `GET /api/session/module?moduleId=...&studentId=...` - Load module progress

### Career Sessions
- `POST /api/session/career` - Save career progress
- `GET /api/session/career?studentId=...` - Load career progress

## Implementation Status

### ✅ Completed
- [x] Session models created
- [x] Enhanced existing models
- [x] SessionManager service
- [x] React hooks for state management
- [x] API routes for session management
- [x] Data migration scripts
- [x] Frontend component integration
- [x] MongoDB data migration completed

### 📊 Migration Results
- **User Sessions**: 3 created
- **Assessment Sessions**: 2 migrated
- **Career Sessions**: 2 migrated
- **Students**: 3 processed

## Benefits

1. **Seamless Navigation**: Users never lose their progress
2. **Data Persistence**: All content and results are preserved
3. **Performance**: Fast loading with cached data
4. **Reliability**: Automatic fallbacks and error handling
5. **Scalability**: Efficient MongoDB queries and indexing

## Next Steps

1. **Test Navigation**: Verify state preservation across all pages
2. **Monitor Performance**: Check session data loading times
3. **Add Analytics**: Track user navigation patterns
4. **Optimize Queries**: Fine-tune MongoDB queries as needed

The session management system is now fully integrated and ready to preserve all content, data, and results across navigation in your educational platform!
