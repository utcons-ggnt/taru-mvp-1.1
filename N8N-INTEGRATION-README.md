# N8N Webhook Integration for MCQ and Flashcard Features

## Overview

This document describes the integration of N8N webhook for MCQ (Multiple Choice Questions) and Flashcard generation in the ModulesTab component of the JioWorld Learning platform.

## Webhook Configuration

### Environment Variables

The following environment variable is required in `.env.local`:

```env
N8N_MODULE_ASSESSMENT_WEBHOOK_URL=https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions
```

### Webhook URL

- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions`
- **Method**: POST
- **Content-Type**: application/json

## Data Format

### Request Format

#### For MCQ Generation:
```json
{
  "Type": "MCQ",
  "uniqueid": "Transcribe_001",
  "submittedAt": "2025-07-30T17:48:41.273+05:30",
  "studentUniqueId": "STUDENT_123"
}
```

#### For Flashcard Generation:
```json
{
  "Type": "Flash",
  "uniqueid": "Transcribe_001",
  "submittedAt": "2025-07-30T17:48:41.273+05:30",
  "studentUniqueId": "STUDENT_123"
}
```

### Response Format

The N8N workflow should return data in the following format:

```json
[
  {
    "output": "[\n  {\n    \"Q\": \"1\",\n    \"level\": \"Basic\",\n    \"question\": \"Why does the sun appear to set in the evening?\",\n    \"options\": [\n      \"Because the sun moves around the earth\",\n      \"Because the earth rotates on its axis\",\n      \"Because the moon moves in front of the sun\",\n      \"Because the sun goes to sleep\"\n    ],\n    \"answer\": \"Because the earth rotates on its axis\"\n  },\n  {\n    \"Q\": \"2\",\n    \"level\": \"Medium\",\n    \"question\": \"What causes stars to appear brighter or dimmer in the night sky?\",\n    \"options\": [\n      \"Their size only\",\n      \"Their color\",\n      \"Their distance from the earth\",\n      \"The weather\"\n    ],\n    \"answer\": \"Their distance from the earth\"\n  }\n]"
  }
]
```

## Implementation Details

### Files Modified

1. **`app/modules/[id]/types/index.ts`**
   - Updated `MCQQuestion` interface to match N8N response format
   - Added `N8NAssessmentResponse` interface

2. **`app/modules/[id]/services/N8NService.ts`**
   - Updated `generateMCQs()` method to use new webhook format
   - Updated `generateFlashcards()` method to use new webhook format
   - Added proper error handling and response parsing

3. **`app/dashboard/student/components/ModulesTab.tsx`**
   - Added MCQ state management
   - Added flashcard state management
   - Implemented MCQ quiz interface with scoring
   - Implemented flashcard navigation interface
   - Added loading states and error handling

### Key Features

#### MCQ Functionality
- **Question Generation**: Automatically generates 5 MCQ questions based on module content
- **Interactive Quiz**: Students can select answers and submit for scoring
- **Score Calculation**: Automatic scoring with percentage and correct answer count
- **Review Mode**: Shows correct answers and explanations after submission
- **Retry Option**: Students can retry the same questions or generate new ones

#### Flashcard Functionality
- **Flashcard Generation**: Creates flashcards based on module content
- **Navigation**: Previous/Next navigation with progress indicators
- **Multiple Formats**: Supports various flashcard formats (Q&A, term/definition, etc.)
- **Progress Tracking**: Visual indicators for current flashcard position

### State Management

#### MCQ State
```typescript
const [mcqLoading, setMcqLoading] = useState(false);
const [mcqQuestions, setMcqQuestions] = useState<MCQQuestion[]>([]);
const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
const [mcqSubmitted, setMcqSubmitted] = useState(false);
const [mcqScore, setMcqScore] = useState(0);
```

#### Flashcard State
```typescript
const [flashcardLoading, setFlashcardLoading] = useState(false);
const [flashcardData, setFlashcardData] = useState<any[]>([]);
const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
```

## Usage

### For Students

1. **Access MCQ Feature**:
   - Navigate to ModulesTab
   - Select a module
   - Click on "MCQ" tab
   - Click "Generate MCQ Questions"
   - Answer questions and submit for scoring

2. **Access Flashcard Feature**:
   - Navigate to ModulesTab
   - Select a module
   - Click on "Flashcard" tab
   - Click "Create Flashcards"
   - Navigate through flashcards using Previous/Next buttons

### For Developers

#### Generating MCQ Questions
```typescript
const questions = await n8nService.generateMCQs(
  selectedModule.uniqueID,
  user?.uniqueId
);
```

#### Generating Flashcards
```typescript
const flashcards = await n8nService.generateFlashcards(
  selectedModule.uniqueID,
  user?.uniqueId
);
```

## Error Handling

The implementation includes comprehensive error handling:

1. **Network Errors**: Fallback responses when webhook is unavailable
2. **Parse Errors**: Graceful handling of malformed JSON responses
3. **Loading States**: Visual feedback during API calls
4. **Empty Responses**: Proper handling when no questions/flashcards are returned

## Testing

### Manual Testing
1. Start the development server
2. Navigate to student dashboard
3. Select a module
4. Test MCQ generation and quiz functionality
5. Test flashcard generation and navigation

### Environment Setup
Ensure the following environment variables are set:
- `N8N_MODULE_ASSESSMENT_WEBHOOK_URL`
- `MONGODB_URI`
- `JWT_SECRET`

## Troubleshooting

### Common Issues

1. **No Questions Generated**:
   - Check webhook URL in environment variables
   - Verify N8N workflow is running
   - Check browser console for error messages

2. **Parse Errors**:
   - Verify N8N response format matches expected structure
   - Check that response contains valid JSON in the `output` field

3. **CORS Issues**:
   - Ensure webhook URL is accessible
   - Check if N8N workflow allows cross-origin requests

### Debug Information

The implementation includes extensive console logging:
- Request payloads sent to N8N
- Response data received from N8N
- Error messages and stack traces
- State changes and user interactions

## Future Enhancements

1. **Offline Support**: Cache generated questions for offline access
2. **Progress Tracking**: Save quiz scores and flashcard progress
3. **Customization**: Allow students to customize question difficulty
4. **Analytics**: Track learning progress and performance metrics
5. **Export**: Allow students to export questions and flashcards

## Support

For technical support or questions about the N8N integration:
1. Check the browser console for error messages
2. Verify environment variable configuration
3. Test webhook URL accessibility
4. Review N8N workflow configuration 