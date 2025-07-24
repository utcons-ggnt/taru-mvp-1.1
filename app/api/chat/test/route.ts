import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY';
    
    console.log('Testing webhook connection to:', webhookUrl);
    
    // Simple test query
    const testQuery = 'Hello, this is a test connection';
    const testStudentData = {
      name: 'Test Student',
      email: 'test@example.com',
      grade: '7',
      school: 'Test School',
      studentId: 'test_123',
      timestamp: new Date().toISOString()
    };
    
    // Test with 30 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const urlParams = new URLSearchParams({
      query: testQuery,
      name: testStudentData.name,
      email: testStudentData.email,
      grade: testStudentData.grade,
      school: testStudentData.school,
      studentId: testStudentData.studentId,
      timestamp: testStudentData.timestamp
    });
    
    const getUrl = `${webhookUrl}?${urlParams.toString()}`;
    console.log('Test URL:', getUrl);
    
    const startTime = Date.now();
    
    const response = await fetch(getUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    const responseText = await response.text();
    
    console.log('Test response received in', responseTime, 'ms');
    console.log('Response status:', response.status);
    console.log('Response text:', responseText);
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch {
      parsedResponse = { raw: responseText };
    }
    
    return NextResponse.json({
      success: response.ok,
      webhookUrl: webhookUrl,
      responseTime: responseTime,
      status: response.status,
      statusText: response.statusText,
      response: parsedResponse,
      testQuery: testQuery,
      timestamp: new Date().toISOString()
    });
    
  } catch (catchError: unknown) {
    const error = catchError as Error & { code?: string };
    console.error('Webhook test failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = 'Timeout after 30 seconds';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Webhook URL not found';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused';
    } else {
      errorMessage = error.message || 'Connection failed';
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      errorName: error.name,
      errorCode: error.code,
      webhookUrl: process.env.N8N_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 