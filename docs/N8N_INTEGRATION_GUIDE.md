# n8n Integration Guide for ChatModal

This guide ensures accurate working of the n8n webhook integration with the ChatModal component.

## 🎯 Overview

The integration consists of:
1. **ChatModal** - React component that sends messages
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
- **Webhook Node** - Receives GET requests
- **AI Agent Node** - Uses AI Assistant
- **Respond to Webhook Node** - Returns AI response

Expected payload format:
```json
{
  "query": "User message here",
  "studentData": {
    "name": "Student Name",
    "email": "student@email.com",
    "grade": "7",
    "school": "School Name",
    "studentId": "123",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🧪 Testing the Integration

### 1. Run the Test Script
```bash
node scripts/test-n8n-integration.js
```

This will test:
- Direct webhook connection
- API endpoint functionality
- Response parsing

### 2. Manual Testing
1. Start your development server: `npm run dev`
2. Open the student dashboard
3. Click the chat button
4. Send a test message
5. Check browser console for logs

## 🔍 Debugging Features

### ChatModal Debug Tools
The ChatModal includes debug toggles:
- **"Show AI"** - Displays AI-BUDDY input/output
- **"Show Debug"** - Shows detailed metadata

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
```

### API Route Logging
Check server console for:
```
Received POST body: {...}
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
    "timestamp": "2024-01-15T10:30:00.000Z"
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

1. **User sends message** → ChatModal
2. **ChatModal** → API Route (`/api/chat`)
3. **API Route** → n8n Webhook
4. **n8n Workflow** → AI Assistant
5. **AI Response** → n8n → API Route → ChatModal
6. **Display** → User sees AI response with debug info

## 🛠️ Maintenance

### Regular Checks
1. **Test webhook connectivity** weekly
2. **Monitor response times** in metadata
3. **Check n8n workflow logs** for errors
4. **Verify environment variables** are set

### Updates
1. **n8n workflow changes** - Update webhook URL if needed
2. **API route changes** - Test with integration script
3. **ChatModal updates** - Verify response parsing

## 📞 Support

If issues persist:
1. Run the test script: `node scripts/test-n8n-integration.js`
2. Check browser console for detailed logs
3. Verify n8n workflow is active and accessible
4. Test direct webhook connection
5. Review this guide for common solutions 