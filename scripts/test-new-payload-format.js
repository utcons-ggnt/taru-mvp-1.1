// Test script for new N8N GET request format
console.log('🧪 Testing New N8N GET Request Format');

const N8N_WEBHOOK_URL = 'https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions';

// Test the new GET request format
const testRequests = [
  {
    name: 'MCQ Test',
    params: {
      uniqueID: 'TRANSCRIBE_003',
      submittedAt: '2025-07-31T17:11:33.528+05:30'
    }
  },
  {
    name: 'Flash Test',
    params: {
      uniqueID: 'TRANSCRIBE_003',
      submittedAt: '2025-07-31T17:11:33.528+05:30'
    }
  }
];

async function testDirectN8NWebhook() {
  console.log('\n📤 Testing Direct N8N Webhook Calls:');
  
  for (const test of testRequests) {
    try {
      console.log(`\n🔍 Testing ${test.name}:`);
      
      const params = new URLSearchParams(test.params);
      const webhookUrl = `${N8N_WEBHOOK_URL}?${params.toString()}`;
      console.log('   URL:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('   Response Text:', responseText);
        
        if (responseText.trim()) {
          try {
            const data = JSON.parse(responseText);
            console.log('   Parsed JSON:', JSON.stringify(data, null, 2));
          } catch (parseError) {
            console.log('   Non-JSON response (raw text)');
          }
        } else {
          console.log('   Empty response');
        }
      } else {
        const errorText = await response.text();
        console.log('   Error Response:', errorText);
      }
    } catch (error) {
      console.error(`   ❌ Error testing ${test.name}:`, error.message);
    }
  }
}

async function testAPIEndpoint() {
  console.log('\n📤 Testing API Endpoint (will fail without auth):');
  
  const BASE_URL = 'http://localhost:3001';
  
  for (const test of testRequests) {
    try {
      console.log(`\n🔍 Testing ${test.name} via API:`);
      
      const response = await fetch(`${BASE_URL}/api/modules/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: test.name.toLowerCase().includes('mcq') ? 'mcq' : 'flash',
          uniqueId: 'TRANSCRIBE_003'
        })
      });
      
      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   Response:', JSON.stringify(data, null, 2));
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.log('   Error Response:', JSON.stringify(errorData, null, 2));
      }
    } catch (error) {
      console.error(`   ❌ Error testing ${test.name}:`, error.message);
    }
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting payload format tests...\n');
  
  // Test direct N8N webhook
  await testDirectN8NWebhook();
  
  // Test API endpoint
  await testAPIEndpoint();
  
  console.log('\n✅ GET request format tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - New GET request format: Query parameters with uniqueID and submittedAt');
  console.log('   - Fixed uniqueID: "TRANSCRIBE_003"');
  console.log('   - Type values: "mcq" and "flash" (lowercase)');
  console.log('   - API endpoint requires authentication');
  console.log('   - Direct N8N calls should work with GET requests');
}

// Run the tests
runTests().catch(console.error); 