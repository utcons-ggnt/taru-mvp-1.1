import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return handleRequest('POST', request);
}

export async function GET(request: NextRequest) {
  return handleRequest('GET', request);
}

async function handleRequest(method: 'GET' | 'POST', request: NextRequest) {
  try {
    let webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY';
    let query = '';
    let studentData: Record<string, unknown> = {};

    if (method === 'POST') {
      const body = await request.json();
      console.log('Received POST body:', JSON.stringify(body, null, 2));

      query = body.query || body.message;
      studentData = body.studentData || {};
      if (body.webhookUrl) webhookUrl = body.webhookUrl;
    } else {
      const { searchParams } = new URL(request.url);
      query = searchParams.get('query') || searchParams.get('message') || '';
      studentData = {
        name: searchParams.get('name') || '',
        email: searchParams.get('email') || '',
        grade: searchParams.get('grade') || '',
        school: searchParams.get('school') || '',
        studentId: searchParams.get('studentId') || '',
        timestamp: searchParams.get('timestamp') || new Date().toISOString()
      };
      if (searchParams.get('webhookUrl')) webhookUrl = searchParams.get('webhookUrl')!;
    }

    if (!query) {
      return NextResponse.json({ error: 'Message or query is required' }, { status: 400 });
    }
    if (!studentData || !studentData.name) {
      return NextResponse.json({ error: 'Student name is required' }, { status: 400 });
    }

    const payload = {
      query,
      studentData,
    };

    // Enhanced error handling with timeout
    let rawResponse;
    let webhookResponse;
    
    try {
      console.log('Attempting to connect to webhook:', webhookUrl);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      // Convert payload to URL parameters for GET request
      const urlParams = new URLSearchParams({
        query: payload.query,
        name: payload.studentData.name as string,
        email: payload.studentData.email as string,
        grade: payload.studentData.grade as string,
        school: payload.studentData.school as string,
        studentId: payload.studentData.studentId as string,
        timestamp: payload.studentData.timestamp as string
      });
      
      const getUrl = `${webhookUrl}?${urlParams.toString()}`;
      
      webhookResponse = await fetch(getUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      try {
        rawResponse = await webhookResponse.json();
        console.log('N8N Response:', JSON.stringify(rawResponse, null, 2));
      } catch (parseError) {
        console.error('Failed to parse n8n response as JSON:', parseError);
        rawResponse = { error: 'Invalid JSON response from n8n' };
      }
    } catch (fetchError) {
      console.error('Webhook connection failed:', fetchError);
      
      // Return immediate fallback response for network errors
      return NextResponse.json({
        success: true,
        response: generateFallbackResponse(query, studentData),
        fallback: true,
                 n8nOutput: {
           fullResponse: null,
           processedResponse: null,
           aiInput: query,
           aiResponse: 'Offline mode - using built-in responses',
           timestamp: new Date().toISOString(),
           studentContext: {
             name: studentData.name,
             grade: studentData.grade,
             school: studentData.school
           }
         },
        metadata: {
          method,
          webhookStatus: 0,
          responseTime: Date.now(),
          messageLength: query.length,
          studentDataProvided: !!studentData,
          webhookUrl: webhookUrl,
          timestamp: new Date().toISOString(),
          error: 'Webhook unreachable - using fallback mode'
        }
      });
    }

    const { responseText, aiInput, aiResponse, n8nOutput } = extractN8nResponse(rawResponse);

    if (webhookResponse.ok) {
      return NextResponse.json({
        success: true,
        response: responseText,
        n8nOutput: {
          fullResponse: rawResponse,
          processedResponse: n8nOutput,
          aiInput,
          aiResponse,
          timestamp: new Date().toISOString(),
          studentContext: {
            name: studentData.name,
            grade: studentData.grade,
            school: studentData.school
          }
        },
        metadata: {
          method,
          webhookStatus: webhookResponse.status,
          responseTime: Date.now(),
          messageLength: query.length,
          studentDataProvided: !!studentData,
          webhookUrl: webhookUrl,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('Webhook failed:', webhookResponse.status, webhookResponse.statusText);
      console.log('Using intelligent fallback response for query:', query);
      
      return NextResponse.json({
        success: true,
        response: generateFallbackResponse(query, studentData),
        fallback: true,
                 n8nOutput: {
           fullResponse: rawResponse,
           processedResponse: null,
           aiInput: query,
           aiResponse: 'Intelligent fallback response (n8n unavailable)',
           timestamp: new Date().toISOString(),
           studentContext: {
             name: studentData.name,
             grade: studentData.grade,
             school: studentData.school
           }
         },
        metadata: {
          method,
          webhookStatus: webhookResponse.status,
          responseTime: Date.now(),
          messageLength: query.length,
          studentDataProvided: !!studentData,
          webhookUrl: webhookUrl,
          timestamp: new Date().toISOString(),
          error: `Webhook returned ${webhookResponse.status} - using fallback mode`
        },
        n8nError: {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          raw: rawResponse
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      success: false,
      response: "I'm having trouble connecting right now. Please try again later.",
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Generate intelligent fallback responses
function generateFallbackResponse(query: string, studentData: Record<string, unknown>): string {
  const studentName = studentData.name as string || 'there';
  const lowerQuery = query.toLowerCase();
  
  // Match common queries with appropriate responses
  if (lowerQuery.includes('help') || lowerQuery.includes('assist')) {
    return `Hi ${studentName}! I'm here to help you with your learning journey. I can assist you with understanding your modules, tracking your progress, and answering questions about your courses.`;
  }
  
  if (lowerQuery.includes('progress') || lowerQuery.includes('score')) {
    return `${studentName}, you can check your progress in the Progress tab of your dashboard. Keep up the great work on your learning journey!`;
  }
  
  if (lowerQuery.includes('module') || lowerQuery.includes('course')) {
    return `Great question about modules, ${studentName}! You can find your recommended modules in the Learning Path section. Each module is tailored to your learning style and interests.`;
  }
  
  if (lowerQuery.includes('grade') || lowerQuery.includes('assessment')) {
    return `${studentName}, your assessments and grades are available in your dashboard. Remember, every assessment is a step forward in your learning journey!`;
  }
  
  // Default friendly response
  return `Hello ${studentName}! I'm your AI learning assistant. While I'm working in offline mode right now, I'm still here to help! You can ask me about your learning progress, modules, or any questions about your educational journey.`;
}

// Utility to extract responses from various possible webhook response shapes
function extractN8nResponse(data: Record<string, unknown>) {
  // Handle error cases
  if (data?.error) {
    return {
      responseText: 'I\'m having trouble processing your request right now. Please try again later.',
      aiInput: '',
      aiResponse: 'Error: ' + data.error,
      n8nOutput: data
    };
  }

  const flat = flattenObject(data);
  const get = (keys: string[]) => keys.map(k => flat[k]).find(v => typeof v === 'string' && v.trim().length > 0);

  // Try to extract the AI response from various possible fields
  let responseText = get(['output', 'result', 'response', 'message', 'text', 'content', 'answer']);
  
  // Check if data is an array and extract from first element
  if (!responseText && Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (firstItem && typeof firstItem === 'object') {
      const flatFirst = flattenObject(firstItem);
      const getFromFirst = (keys: string[]) => keys.map(k => flatFirst[k]).find(v => typeof v === 'string' && v.trim().length > 0);
      responseText = getFromFirst(['output', 'result', 'response', 'message', 'text', 'content', 'answer']) || 
                    Object.values(flatFirst).find(v => typeof v === 'string' && v.trim().length > 20) as string;
    }
  }
  
  // Fallback to default message
  responseText = responseText || 'Thank you for your message! I\'ll get back to you soon.';
  
  // Try to extract the original query/input
  const aiInput = get(['query', 'aiInput', 'input', 'prompt', 'question']) || '';
  
  // Use the response text as the AI response
  const aiResponse = responseText;

  // Extract the full n8n output for debugging
  const n8nOutput = data?.json || data?.data || data;

  console.log('Extracted response:', { responseText, aiInput, aiResponse });

  return { responseText, aiInput, aiResponse, n8nOutput };
}

// Flattens a nested object into a single-level key map
function flattenObject(obj: Record<string, unknown>, parent = '', res: Record<string, unknown> = {}) {
  for (const key in obj) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key] as Record<string, unknown>, propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}
