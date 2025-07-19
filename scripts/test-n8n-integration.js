const fetch = require('node-fetch');

// Test configuration
const TEST_CONFIG = {
  apiUrl: 'http://localhost:3000/api/chat',
  webhookUrl: process.env.N8N_WEBHOOK_URL || 'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY',
  testMessage: 'Hello! Can you help me with my learning?',
  studentData: {
    name: 'Test Student',
    email: 'test@example.com',
    grade: '7',
    school: 'Test School',
    studentId: 'test123',
    timestamp: new Date().toISOString()
  }
};

async function testDirectWebhook() {
  console.log('🔗 Testing direct n8n webhook connection...');
  console.log('Webhook URL:', TEST_CONFIG.webhookUrl);
  
  try {
    const response = await fetch(TEST_CONFIG.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: TEST_CONFIG.testMessage,
        studentData: TEST_CONFIG.studentData
      })
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
  console.log('\n🌐 Testing API endpoint...');
  console.log('API URL:', TEST_CONFIG.apiUrl);
  
  try {
    const response = await fetch(TEST_CONFIG.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: TEST_CONFIG.testMessage,
        studentData: TEST_CONFIG.studentData
      })
    });

    console.log('API status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API response:', JSON.stringify(data, null, 2));
      
      // Check if n8n integration worked
      if (data.success && data.n8nOutput) {
        console.log('✅ n8n integration successful!');
        console.log('AI-BUDDY Input:', data.n8nOutput.geminiInput);
        console.log('AI-BUDDY Response:', data.n8nOutput.geminiResponse);
      } else if (data.fallback) {
        console.log('⚠️ Using fallback response (n8n unavailable)');
      }
      
      return true;
    } else {
      console.log('❌ API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
    return false;
  }
}

async function testGETEndpoint() {
  console.log('\n🔍 Testing GET endpoint...');
  
  try {
    const response = await fetch(TEST_CONFIG.apiUrl);
    console.log('GET status:', response.status, response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ GET response:', data);
      return true;
    } else {
      console.log('❌ GET failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ GET error:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting n8n Integration Tests...\n');
  
  const results = {
    directWebhook: await testDirectWebhook(),
    apiEndpoint: await testAPIEndpoint(),
    getEndpoint: await testGETEndpoint()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Direct Webhook:', results.directWebhook ? '✅ PASS' : '❌ FAIL');
  console.log('API Endpoint:', results.apiEndpoint ? '✅ PASS' : '❌ FAIL');
  console.log('GET Endpoint:', results.getEndpoint ? '✅ PASS' : '❌ FAIL');
  
  if (results.directWebhook && results.apiEndpoint) {
    console.log('\n🎉 All critical tests passed! n8n integration is working correctly.');
  } else if (results.apiEndpoint) {
    console.log('\n⚠️ API is working but n8n webhook may have issues. Check webhook URL and n8n workflow.');
  } else {
    console.log('\n❌ Critical issues detected. Check your setup and try again.');
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testDirectWebhook, testAPIEndpoint, testGETEndpoint, runAllTests }; 