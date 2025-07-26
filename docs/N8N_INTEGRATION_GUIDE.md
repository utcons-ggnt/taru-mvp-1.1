# n8n Integration Guide for ChatModal

This guide ensures accurate working of the n8n webhook integration with the ChatModal component.

## 🎯 Overview

The integration consists of:
1. **ChatModal** - React component that sends messages with student unique ID and session ID
2. **API Route** (`/api/chat`) - Handles communication with n8n
3. **n8n Workflow** - AI-BUDDY workflow with AI Assistant

## 🔧 Setup Requirements

### 1. Environment Variables
Create a `.env.local` file in your project root:

```env
N8N_WEBHOOK_URL=https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY
```

### 2. n8n Workflow Structure
Your n8n workflow should have:
- **Webhook Node** - Receives GET requests with student unique ID and session ID
- **AI Agent Node** - Uses AI Assistant
- **Respond to Webhook Node** - Returns AI response

Expected payload format:
```json
{
  "query": "User message here",
  "studentUniqueId": "STUDEMO1",
  "sessionId": "session_1705123456789_abc123def",
  "studentData": {
    "name": "Student Name",
    "email": "student@email.com",
    "grade": "7",
    "school": "School Name",
    "uniqueId": "STUDEMO1",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Key Features**: 
- Each chat message includes the student's unique ID from MongoDB, allowing your n8n workflow to fetch detailed student information and provide personalized responses.
- Each chat session has a unique session ID that persists throughout the conversation, enabling session-based context and tracking.

## 🧪 Testing the Integration

### 1. Run the Test Script
```bash
node scripts/test-n8n-integration.js
```

This will test:
- Direct webhook connection with student unique ID and session ID
- API endpoint functionality with student unique ID and session ID
- Response parsing and metadata verification

### 2. Manual Testing
1. Start your development server: `npm run dev`
2. Open the student dashboard
3. Click the chat button
4. Send a test message
5. Check browser console for logs including student unique ID and session ID

## 🔍 Debugging Features

### ChatModal Debug Tools
The ChatModal includes debug toggles:
- **"Show AI"** - Displays AI-BUDDY input/output
- **"Show Debug"** - Shows detailed metadata including student unique ID and session ID

### Console Logging
Check browser console for:
```
Chat API Response: {...}
N8N Output: {...}
AI-BUDDY Input: "..."
AI-BUDDY Response: "..."
Response Metadata: {...}
Webhook URL used: "..."
Response time: 1234
Student Unique ID: STUDEMO1
Session ID: session_1705123456789_abc123def
```

### API Route Logging
Check server console for:
```
Received POST body: {...}
Payload being sent to N8N: {...}
N8N Response: {...}
Extracted response: {...}
```

## 🚨 Common Issues & Solutions

### 1. 400 Bad Request
**Cause**: Missing required fields
**Solution**: Ensure `query` and `studentData.name` are provided

### 2. n8n Not Triggering
**Causes**:
- Webhook URL incorrect
- Workflow not activated
- Network connectivity issues

**Solutions**:
1. Verify webhook URL in n8n
2. Activate the workflow
3. Test direct webhook connection

### 3. Invalid JSON Response
**Cause**: n8n returning non-JSON response
**Solution**: Check n8n workflow output format

### 4. Fallback Response
**Cause**: n8n webhook unavailable
**Solution**: 
1. Check n8n workflow status
2. Verify webhook URL
3. Check network connectivity

## 📊 Response Format

### Successful Response
```json
{
  "success": true,
  "response": "AI response text",
  "n8nOutput": {
    "fullResponse": {...},
    "processedResponse": {...},
    "aiInput": "Original query",
    "aiResponse": "AI response",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "studentContext": {
      "name": "Student Name",
      "grade": "7",
      "school": "School Name"
    }
  },
  "metadata": {
    "method": "POST",
    "webhookStatus": 200,
    "responseTime": 1234,
    "messageLength": 25,
    "studentDataProvided": true,
    "webhookUrl": "https://...",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "studentUniqueId": "STUDEMO1"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description",
  "fallback": true,
  "response": "Fallback message",
  "n8nError": {
    "status": 500,
    "statusText": "Internal Server Error",
    "raw": {...}
  }
}
```

## 🔄 Workflow

1. **User opens chat** → ChatModal generates session ID and fetches student unique ID from MongoDB
2. **User sends message** → ChatModal sends message with student unique ID and session ID
3. **ChatModal** → API Route (`/api/chat`) with student unique ID and session ID
4. **API Route** → n8n Webhook with student unique ID and session ID
5. **n8n Workflow** → AI Assistant (can fetch student data using unique ID and maintain session context)
6. **AI Response** → n8n → API Route → ChatModal
7. **Display** → User sees AI response with debug info including session ID

## 🆕 Student Unique ID Feature

### Purpose
- **Student Identification**: Each student has a unique identifier in MongoDB
- **Data Fetching**: Allows n8n workflow to fetch detailed student information
- **Personalization**: Enables personalized responses based on student profile
- **Analytics**: Tracks student interactions and learning patterns

### Format
Student unique IDs follow the pattern: `STU` + random alphanumeric string
Example: `STUDEMO1`, `STUPRIYA1`, `STUAMIT1`

### Usage in n8n
You can use the student unique ID in your n8n workflow to:
- Fetch student profile from MongoDB
- Access learning progress and preferences
- Retrieve assessment results and diagnostic data
- Provide personalized learning recommendations
- Track conversation history per student

### Student Data Available
When you receive a student unique ID, you can fetch:
- **Profile Information**: Name, grade, school, language preference
- **Learning Preferences**: Learning modes, interests, career domains
- **Progress Data**: Completed modules, XP earned, badges
- **Assessment Results**: Diagnostic scores, skill levels
- **Onboarding Status**: Completion status and preferences

## 🆕 Session ID Feature

### Purpose
- **Session Tracking**: Each chat session has a unique identifier
- **Conversation Context**: Enables session-based conversation history
- **User Experience**: Maintains context throughout a chat session
- **Analytics**: Tracks individual chat sessions and their duration

### Format
Session IDs follow the pattern: `session_` + timestamp + `_` + random string
Example: `session_1705123456789_abc123def`

### Usage in n8n
You can use the session ID in your n8n workflow to:
- Maintain conversation context across multiple messages
- Track session duration and engagement
- Store session-specific data or preferences
- Implement session-based features like conversation history
- Analyze user behavior patterns per session

### Session Data Available
When you receive a session ID, you can:
- **Track Session Start**: When the chat modal is opened
- **Monitor Session Duration**: Time between first and last message
- **Store Session Context**: Conversation history, user preferences during session
- **Session Analytics**: Message count, response times, engagement metrics

## 🛠️ Maintenance

### Regular Checks
1. **Test webhook connectivity** weekly
2. **Monitor response times** in metadata
3. **Check n8n workflow logs** for errors
4. **Verify environment variables** are set
5. **Verify student unique ID tracking** in n8n

### Updates
1. **n8n workflow changes** - Update webhook URL if needed
2. **API route changes** - Test with integration script
3. **ChatModal updates** - Verify response parsing and student unique ID fetching

## 📞 Support

If issues persist:
1. Run the test script: `node scripts/test-n8n-integration.js`
2. Check browser console for detailed logs including student unique ID
3. Verify n8n workflow is active and accessible
4. Test direct webhook connection
5. Review this guide for common solutions 