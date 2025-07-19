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

    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let rawResponse;
    try {
      rawResponse = await webhookResponse.json();
      console.log('N8N Response:', JSON.stringify(rawResponse, null, 2));
    } catch (parseError) {
      console.error('Failed to parse n8n response as JSON:', parseError);
      rawResponse = { error: 'Invalid JSON response from n8n' };
    }

    const { responseText, geminiInput, geminiResponse, n8nOutput } = extractN8nResponse(rawResponse);

    if (webhookResponse.ok) {
      return NextResponse.json({
        success: true,
        response: responseText,
        n8nOutput: {
          fullResponse: rawResponse,
          processedResponse: n8nOutput,
          geminiInput,
          geminiResponse,
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
      console.error('Webhook failed:', webhookResponse.statusText);
      return NextResponse.json({
        success: false,
        error: 'Webhook call failed',
        fallback: true,
        response: "I'm here to help with your learning journey!",
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

// Utility to extract responses from various possible webhook response shapes
function extractN8nResponse(data: Record<string, unknown>) {
  // Handle error cases
  if (data?.error) {
    return {
      responseText: 'I\'m having trouble processing your request right now. Please try again later.',
      geminiInput: '',
      geminiResponse: 'Error: ' + data.error,
      n8nOutput: data
    };
  }

  const flat = flattenObject(data);
  const get = (keys: string[]) => keys.map(k => flat[k]).find(v => typeof v === 'string' && v.trim().length > 0);

  // Try to extract the AI response from various possible fields
  const responseText = get(['output', 'result', 'response', 'message', 'text', 'content', 'answer']) || 
                      'Thank you for your message! I\'ll get back to you soon.';
  
  // Try to extract the original query/input
  const geminiInput = get(['query', 'geminiInput', 'input', 'prompt', 'question']) || '';
  
  // Use the response text as the AI response
  const geminiResponse = responseText;

  // Extract the full n8n output for debugging
  const n8nOutput = data?.json || data?.data || data;

  console.log('Extracted response:', { responseText, geminiInput, geminiResponse });

  return { responseText, geminiInput, geminiResponse, n8nOutput };
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
