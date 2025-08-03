# N8N Webhook Integration Specifications
## JioWorld Learning Platform

---

### Table of Contents
1. [Overview](#overview)
2. [Webhook Endpoints](#webhook-endpoints)
3. [Technical Specifications](#technical-specifications)
4. [Testing Procedures](#testing-procedures)
5. [Environment Setup](#environment-setup)

---

## Overview

This document provides complete specifications for all N8N webhook integrations in the JioWorld Learning platform. Each webhook endpoint includes detailed input/output formats, error handling procedures, and testing guidelines.

**Platform**: JioWorld Learning Platform  
**Integration Type**: N8N Webhook Services  
**Version**: 1.0  
**Last Updated**: January 2025  

---

## Webhook Endpoints

### 1. AI Chat Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN`
- **Method**: GET
- **Purpose**: AI-powered chat responses for student interactions
- **Timeout**: 30 seconds

**Input Format (URL Parameters):**
```
query=Student's question or message
name=Student Name
email=student@email.com
grade=Grade Level
school=School Name
uniqueId=Student Unique ID
timestamp=2025-01-27T10:30:00.000Z
studentUniqueId=STUDENT_123
sessionId=SESSION_456
```

**Expected Output:**
```json
{
  "output": "AI response text",
  "result": "Alternative response field",
  "response": "Another response field",
  "message": "Message field",
  "text": "Text field",
  "content": "Content field",
  "answer": "Answer field"
}
```

**Example Request:**
```
GET https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN?query=What%20is%20photosynthesis&name=John%20Doe&email=john@school.com&grade=10&school=High%20School&uniqueId=STU123&timestamp=2025-01-27T10:30:00.000Z&studentUniqueId=STUDENT_123&sessionId=SESSION_456
```

---

### 2. MCQ/Flashcard Generation Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions`
- **Method**: GET
- **Purpose**: Generate multiple choice questions and flashcards from module content
- **Timeout**: 30 seconds

**Input Format (URL Parameters):**
```
uniqueID=TRANSCRIBE_003
submittedAt=2025-01-27T10:30:00.000Z
```

**Expected Output for MCQ:**
```json
[
  {
    "output": "[\n  {\n    \"Q\": \"1\",\n    \"level\": \"Basic\",\n    \"question\": \"Why does the sun appear to set in the evening?\",\n    \"options\": [\n      \"Because the sun moves around the earth\",\n      \"Because the earth rotates on its axis\",\n      \"Because the moon moves in front of the sun\",\n      \"Because the sun goes to sleep\"\n    ],\n    \"answer\": \"Because the earth rotates on its axis\"\n  },\n  {\n    \"Q\": \"2\",\n    \"level\": \"Medium\",\n    \"question\": \"What causes stars to appear brighter or dimmer?\",\n    \"options\": [\n      \"Their size only\",\n      \"Their color\",\n      \"Their distance from the earth\",\n      \"The weather\"\n    ],\n    \"answer\": \"Their distance from the earth\"\n  }\n]"
  }
]
```

**Expected Output for Flashcards:**
```json
[
  {
    "output": "[\n  {\n    \"question\": \"What is the difference between learning and memorization?\",\n    \"answer\": \"Learning involves understanding and applying concepts, while memorization is just recalling facts.\",\n    \"explanation\": \"True learning requires critical thinking and the ability to apply knowledge in new situations.\"\n  },\n  {\n    \"term\": \"Active Learning\",\n    \"definition\": \"A learning approach where students engage with the material through discussion, practice, and application.\",\n    \"explanation\": \"Active learning has been shown to improve retention and understanding compared to passive methods.\"\n  }\n]"
  }
]
```

**Example Request:**
```
GET https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions?uniqueID=TRANSCRIBE_003&submittedAt=2025-01-27T10:30:00.000Z
```

---

### 3. Assessment Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/assessment-questions`
- **Method**: POST
- **Purpose**: Process assessment results and store generated questions
- **Content-Type**: application/json

**Input Format (JSON Body):**
```json
{
  "uniqueId": "STUDENT_123",
  "generatedQuestions": [
    {
      "question": "What is the capital of France?",
      "options": ["London", "Paris", "Berlin", "Madrid"],
      "answer": "Paris",
      "difficulty": "Basic"
    },
    {
      "question": "Which planet is closest to the sun?",
      "options": ["Venus", "Mercury", "Earth", "Mars"],
      "answer": "Mercury",
      "difficulty": "Basic"
    }
  ],
  "status": "completed"
}
```

**Expected Output:**
```json
{
  "success": true,
  "message": "Questions generated and stored successfully",
  "studentId": "STUDENT_123",
  "questionsCount": 2
}
```

**Example Request:**
```bash
curl -X POST https://nclbtaru.app.n8n.cloud/webhook/assessment-questions \
  -H "Content-Type: application/json" \
  -d '{
    "uniqueId": "STUDENT_123",
    "generatedQuestions": [...],
    "status": "completed"
  }'
```

---

### 4. Student Onboarding Assessment Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/assessment-questions`
- **Method**: GET
- **Purpose**: Generate initial assessment questions for new student onboarding
- **Timeout**: 30 seconds

**Input Format (URL Parameters):**
```
uniqueId=STUDENT_123
name=John Doe
grade=10
school=High School
submittedAt=2025-01-27T10:30:00.000Z
```

**Expected Output:**
```json
{
  "questions": [
    {
      "id": "1",
      "question": "What is your favorite subject?",
      "type": "multiple_choice",
      "options": ["Math", "Science", "English", "History"],
      "difficulty": "Basic"
    },
    {
      "id": "2",
      "question": "How do you prefer to learn?",
      "type": "multiple_choice",
      "options": ["Visual", "Auditory", "Reading", "Hands-on"],
      "difficulty": "Basic"
    }
  ],
  "status": "success"
}
```

**Example Request:**
```
GET https://nclbtaru.app.n8n.cloud/webhook/assessment-questions?uniqueId=STUDENT_123&name=John%20Doe&grade=10&school=High%20School&submittedAt=2025-01-27T10:30:00.000Z
```

---

### 5. Learning Path Generation Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/learnign-path`
- **Method**: POST
- **Purpose**: Generate personalized learning paths based on assessment results
- **Content-Type**: application/json

**Input Format (JSON Body):**
```json
{
  "studentId": "STUDENT_123",
  "assessmentResults": {
    "math": 85,
    "science": 70,
    "english": 90,
    "history": 75
  },
  "preferences": {
    "learningStyle": "visual",
    "difficulty": "medium",
    "subjects": ["math", "science"]
  },
  "grade": "10"
}
```

**Expected Output:**
```json
{
  "learningPath": [
    {
      "moduleId": "MATH_001",
      "title": "Advanced Mathematics",
      "difficulty": "Medium",
      "estimatedDuration": "2 weeks",
      "prerequisites": [],
      "description": "Advanced mathematical concepts and problem-solving"
    },
    {
      "moduleId": "SCIENCE_101",
      "title": "Science Fundamentals",
      "difficulty": "Basic",
      "estimatedDuration": "3 weeks",
      "prerequisites": [],
      "description": "Core scientific principles and methodology"
    }
  ],
  "recommendations": [
    "Focus on science improvement - current score: 70%",
    "Continue with advanced math - strong performance: 85%",
    "Consider English literature for enrichment"
  ],
  "estimatedCompletionTime": "5 weeks"
}
```

**Example Request:**
```bash
curl -X POST https://nclbtaru.app.n8n.cloud/webhook/learnign-path \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STUDENT_123",
    "assessmentResults": {...},
    "preferences": {...}
  }'
```

---

### 6. Module Assessment Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions`
- **Method**: POST
- **Purpose**: Evaluate module completion and provide detailed feedback
- **Content-Type**: application/json

**Input Format (JSON Body):**
```json
{
  "moduleId": "MODULE_123",
  "studentId": "STUDENT_456",
  "responses": [
    {
      "questionId": "Q1",
      "selectedAnswer": "Option B",
      "correctAnswer": "Option B",
      "isCorrect": true,
      "timeSpent": 45
    },
    {
      "questionId": "Q2",
      "selectedAnswer": "Option A",
      "correctAnswer": "Option C",
      "isCorrect": false,
      "timeSpent": 30
    }
  ],
  "score": 85,
  "totalQuestions": 10,
  "timeSpent": 450
}
```

**Expected Output:**
```json
{
  "evaluation": {
    "overallScore": 85,
    "percentage": 85.0,
    "strengths": ["Mathematics", "Problem Solving", "Critical Thinking"],
    "weaknesses": ["Reading Comprehension", "Time Management"],
    "recommendations": [
      "Practice reading exercises to improve comprehension",
      "Focus on vocabulary building",
      "Work on time management skills"
    ]
  },
  "nextSteps": [
    {
      "action": "review",
      "module": "READING_101",
      "priority": "high",
      "reason": "Low performance in reading comprehension"
    },
    {
      "action": "continue",
      "module": "MATH_201",
      "priority": "medium",
      "reason": "Strong performance in mathematics"
    }
  ],
  "certificate": {
    "eligible": true,
    "grade": "B+",
    "message": "Congratulations! You've successfully completed this module."
  }
}
```

---

### 7. Transcript Generation Webhook

**Endpoint Details:**
- **URL**: `https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN`
- **Method**: POST
- **Purpose**: Generate transcripts and summaries from video content
- **Content-Type**: application/json

**Input Format (JSON Body):**
```json
{
  "videoUrl": "https://example.com/video.mp4",
  "moduleId": "MODULE_123",
  "studentId": "STUDENT_456",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "language": "en",
  "quality": "high"
}
```

**Expected Output:**
```json
{
  "transcript": "This is the complete transcript text extracted from the video content. It includes all spoken words, timestamps, and speaker identification where available.",
  "summary": "Key points and main concepts covered in the video content. This provides a concise overview of the material presented.",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
  "duration": "00:15:30",
  "confidence": 0.95,
  "segments": [
    {
      "start": "00:00:00",
      "end": "00:02:30",
      "text": "Introduction to the topic...",
      "speaker": "Instructor"
    },
    {
      "start": "00:02:31",
      "end": "00:05:00",
      "text": "Main content begins...",
      "speaker": "Instructor"
    }
  ],
  "metadata": {
    "language": "en",
    "quality": "high",
    "processingTime": "45 seconds"
  }
}
```

---

## Technical Specifications

### Response Standards

**Success Response Format:**
```json
{
  "success": true,
  "data": {
    // Response data specific to each endpoint
  },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error information",
  "timestamp": "2025-01-27T10:30:00.000Z",
  "requestId": "req_123456789"
}
```

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful response |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Timeout Configuration

- **Default Timeout**: 30 seconds
- **Retry Logic**: 3 attempts with exponential backoff
- **Fallback Content**: Automatic generation if webhook fails
- **Circuit Breaker**: Prevents cascading failures

### Error Handling

**Network Errors:**
- Automatic retry with exponential backoff
- Fallback to cached responses when available
- Graceful degradation with offline content

**Parse Errors:**
- JSON validation before processing
- Graceful handling of malformed responses
- Detailed error logging for debugging

**Authentication Errors:**
- JWT token validation
- Automatic token refresh when possible
- Clear error messages for expired tokens

---

## Environment Setup

### Required Environment Variables

```env
# N8N Webhook URLs
N8N_WEBHOOK_URL=https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN
N8N_MODULE_ASSESSMENT_WEBHOOK_URL=https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions
N8N_LEARNING_PATH_WEBHOOK_URL=https://nclbtaru.app.n8n.cloud/webhook/learnign-path
N8N_ASSESSMENT_WEBHOOK_URL=https://nclbtaru.app.n8n.cloud/webhook/assessment-questions

# Development Settings
SKIP_N8N_WEBHOOK=true
NODE_ENV=development

# Authentication
JWT_SECRET=your-secret-key
MONGODB_URI=mongodb://localhost:27017/jioworld

# Timeout Settings
N8N_TIMEOUT=30000
N8N_RETRY_ATTEMPTS=3
```

### Configuration Files

**Development Configuration (.env.local):**
```env
# Development-specific settings
SKIP_N8N_WEBHOOK=true
N8N_TIMEOUT=10000
DEBUG=true
```

**Production Configuration (.env.production):**
```env
# Production settings
SKIP_N8N_WEBHOOK=false
N8N_TIMEOUT=30000
DEBUG=false
```

---

## Testing Procedures

### Manual Testing

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Test Each Webhook Endpoint:**
   - Use provided test scripts in `/scripts/` directory
   - Verify input/output formats
   - Check error handling scenarios

3. **Authentication Testing:**
   - Test with valid JWT tokens
   - Test with expired tokens
   - Test with invalid tokens

### Automated Testing

**Test Scripts Available:**
- `test-n8n-mcq-flashcard.js` - MCQ and flashcard generation
- `test-transcript-integration.js` - Transcript generation
- `test-new-payload-format.js` - Payload format validation
- `test-transcript-fix.js` - Transcript processing fixes

**Running Tests:**
```bash
# Run all tests
node scripts/run-all-tests.js

# Run specific test
node scripts/test-n8n-mcq-flashcard.js
```

### Test Scenarios

**Positive Test Cases:**
- Valid input with expected output
- All required fields provided
- Proper authentication
- Network connectivity

**Negative Test Cases:**
- Missing required fields
- Invalid data formats
- Network timeouts
- Authentication failures
- Malformed responses

**Edge Cases:**
- Empty responses
- Very large payloads
- Special characters in input
- Unicode text handling

---

## Troubleshooting Guide

### Common Issues

**1. Webhook Timeout Errors**
- **Symptom**: 30-second timeout errors
- **Solution**: Check N8N workflow performance, increase timeout if needed
- **Prevention**: Optimize workflow efficiency

**2. Authentication Failures**
- **Symptom**: 401 Unauthorized errors
- **Solution**: Verify JWT token validity and expiration
- **Prevention**: Implement proper token refresh logic

**3. Parse Errors**
- **Symptom**: JSON parsing failures
- **Solution**: Validate N8N response format
- **Prevention**: Implement response validation

**4. Network Connectivity**
- **Symptom**: Connection refused or timeout
- **Solution**: Check N8N service availability
- **Prevention**: Implement health checks and monitoring

### Debug Information

**Logging Levels:**
- **DEBUG**: Detailed request/response logging
- **INFO**: General operation logging
- **WARN**: Warning conditions
- **ERROR**: Error conditions with stack traces

**Monitoring Metrics:**
- Response times
- Success/failure rates
- Error types and frequencies
- Webhook availability

---

## Security Considerations

### Data Protection
- All sensitive data encrypted in transit (HTTPS)
- JWT tokens for authentication
- Input validation and sanitization
- Rate limiting to prevent abuse

### Access Control
- Role-based access control (RBAC)
- Student data isolation
- Audit logging for all operations
- Secure session management

### Compliance
- GDPR compliance for student data
- FERPA compliance for educational records
- Data retention policies
- Privacy impact assessments

---

## Performance Optimization

### Caching Strategy
- Cache frequently requested content
- Implement cache invalidation
- Use CDN for static content
- Database query optimization

### Scalability
- Horizontal scaling capability
- Load balancing support
- Database connection pooling
- Asynchronous processing

### Monitoring
- Real-time performance metrics
- Alert systems for failures
- Capacity planning tools
- Performance regression testing

---

## Support and Maintenance

### Documentation
- API documentation updates
- Integration guides
- Troubleshooting procedures
- Best practices documentation

### Maintenance Schedule
- Regular security updates
- Performance monitoring
- Capacity planning
- Backup and recovery procedures

### Contact Information
- Technical support: tech-support@jioworld.com
- Emergency contact: emergency@jioworld.com
- Documentation: docs.jioworld.com

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: March 2025  
**Author**: Development Team  
**Approved By**: Technical Lead 