// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:3000/api/chat',
  webhookUrl: process.env.N8N_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY',
  testMessage: 'Hello! Can you help me with my learning?',
  studentUniqueId: 'STUDEMO1', // Use existing demo student unique ID
  sessionId: 'test_session_' + Date.now(), // Generate test session ID
  studentData: {
    name: 'Test Student',
    email: 'test@example.com',
    grade: '7',
    school: 'Test School',
    uniqueId: 'STUDEMO1',
    timestamp: new Date().toISOString()
  }
};

async function testDirectWebhook() {
  console.log('🔗 Testing direct n8n webhook connection...');
  console.log('Webhook URL:', TEST_CONFIG.webhookUrl);
  console.log('Student Unique ID:', TEST_CONFIG.studentUniqueId);
  console.log('Session ID:', TEST_CONFIG.sessionId);
  
  try {
    // Convert to GET request with URL parameters
    const urlParams = new URLSearchParams({
      query: TEST_CONFIG.testMessage,
      name: TEST_CONFIG.studentData.name,
      email: TEST_CONFIG.studentData.email,
      grade: TEST_CONFIG.studentData.grade,
      school: TEST_CONFIG.studentData.school,
      uniqueId: TEST_CONFIG.studentData.uniqueId,
      timestamp: TEST_CONFIG.studentData.timestamp,
      studentUniqueId: TEST_CONFIG.studentUniqueId,
      sessionId: TEST_CONFIG.sessionId
    });
    
    const testUrl = `${TEST_CONFIG.webhookUrl}?${urlParams.toString()}`;
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log('Direct webhook status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct webhook response:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Direct webhook failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ Direct webhook error:', error.message);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('🔗 Testing API endpoint...');
  console.log('API URL:', TEST_CONFIG.apiUrl);
  console.log('Student Unique ID:', TEST_CONFIG.studentUniqueId);
  console.log('Session ID:', TEST_CONFIG.sessionId);
  
  try {
    const response = await fetch(TEST_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: TEST_CONFIG.testMessage,
        studentUniqueId: TEST_CONFIG.studentUniqueId,
        sessionId: TEST_CONFIG.sessionId,
        studentData: TEST_CONFIG.studentData
      }),
    });

    console.log('API endpoint status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API endpoint response:', JSON.stringify(data, null, 2));
      
      // Check if student unique ID is included in metadata
      if (data.metadata && data.metadata.studentUniqueId) {
        console.log('✅ Student Unique ID included in response metadata:', data.metadata.studentUniqueId);
      } else {
        console.log('⚠️  Student Unique ID not found in response metadata');
      }
      
      // Check if session ID is included in metadata
      if (data.metadata && data.metadata.sessionId) {
        console.log('✅ Session ID included in response metadata:', data.metadata.sessionId);
      } else {
        console.log('⚠️  Session ID not found in response metadata');
      }
      
      return true;
    } else {
      console.log('❌ API endpoint failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ API endpoint error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Starting n8n Integration Tests\n');
  console.log('Configuration:');
  console.log('- Webhook URL:', TEST_CONFIG.webhookUrl);
  console.log('- API URL:', TEST_CONFIG.apiUrl);
  console.log('- Test Message:', TEST_CONFIG.testMessage);
  console.log('- Student Data:', JSON.stringify(TEST_CONFIG.studentData, null, 2));
  console.log('\n' + '='.repeat(50) + '\n');

  const webhookSuccess = await testDirectWebhook();
  const apiSuccess = await testAPIEndpoint();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results Summary:');
  console.log('- Direct Webhook:', webhookSuccess ? '✅ PASS' : '❌ FAIL');
  console.log('- API Endpoint:', apiSuccess ? '✅ PASS' : '❌ FAIL');
  
  if (webhookSuccess && apiSuccess) {
    console.log('\n🎉 All tests passed! ChatModal integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Ensure your development server is running (npm run dev)');
    console.log('2. Check that N8N_WEBHOOK_URL is set in your .env.local file');
    console.log('3. Verify your n8n workflow is active and accessible');
    console.log('4. Test the webhook directly in n8n editor');
  }
  
  process.exit(webhookSuccess && apiSuccess ? 0 : 1);
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDirectWebhook, testAPIEndpoint, runTests }; 