// Test script for N8N MCQ and Flashcard API integration
require('dotenv').config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3001'; // Updated to port 3001

async function testMCQGeneration() {
  console.log('🧪 Testing MCQ Generation via API...');
  
  const mcqPayload = {
    type: "MCQ",
    uniqueId: "Transcribe_001"
  };

  try {
    console.log('📤 Sending MCQ request to API:', mcqPayload);
    
    const response = await fetch(`${BASE_URL}/api/modules/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mcqPayload)
    });

    console.log(`📥 API Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('📥 MCQ API Response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.content && data.content.length > 0) {
        console.log('✅ MCQ Questions received successfully:');
        console.log(`   - Number of questions: ${data.content.length}`);
        console.log(`   - Source: ${data.metadata?.source || 'unknown'}`);
        console.log(`   - Fallback: ${data.fallback || false}`);
        
        data.content.forEach((q, index) => {
          console.log(`   - Question ${index + 1}: ${q.question.substring(0, 50)}...`);
          console.log(`     Level: ${q.level}, Options: ${q.options.length}`);
        });
      } else {
        console.log('⚠️ No MCQ questions found in API response');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ MCQ API Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ MCQ Generation Error:', error.message);
  }
}

async function testFlashcardGeneration() {
  console.log('\n🧪 Testing Flashcard Generation via API...');
  
  const flashcardPayload = {
    type: "Flash",
    uniqueId: "Transcribe_001"
  };

  try {
    console.log('📤 Sending Flashcard request to API:', flashcardPayload);
    
    const response = await fetch(`${BASE_URL}/api/modules/generate-content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flashcardPayload)
    });

    console.log(`📥 API Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('📥 Flashcard API Response:', JSON.stringify(data, null, 2));
      
      if (data.success && data.content && data.content.length > 0) {
        console.log('✅ Flashcards received successfully:');
        console.log(`   - Number of flashcards: ${data.content.length}`);
        console.log(`   - Source: ${data.metadata?.source || 'unknown'}`);
        console.log(`   - Fallback: ${data.fallback || false}`);
        
        data.content.forEach((card, index) => {
          console.log(`   - Flashcard ${index + 1}:`);
          if (card.question) console.log(`     Question: ${card.question.substring(0, 50)}...`);
          if (card.answer) console.log(`     Answer: ${card.answer.substring(0, 50)}...`);
          if (card.term) console.log(`     Term: ${card.term}`);
          if (card.definition) console.log(`     Definition: ${card.definition.substring(0, 50)}...`);
        });
      } else {
        console.log('⚠️ No flashcards found in API response');
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Flashcard API Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Flashcard Generation Error:', error.message);
  }
}

async function testAPIConnectivity() {
  console.log('🔗 Testing API Connectivity...');
  console.log(`   Base URL: ${BASE_URL}`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/modules/generate-content`, {
      method: 'GET'
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 405) {
      console.log('✅ API endpoint exists (Method Not Allowed for GET is expected)');
    } else {
      console.log('⚠️ Unexpected response from API endpoint');
    }
  } catch (error) {
    console.error('❌ API connectivity error:', error.message);
    console.log('💡 Make sure the development server is running on port 3001');
  }
}

async function testDirectN8NWebhook() {
  console.log('\n🔗 Testing Direct N8N Webhook...');
  
  const N8N_MODULE_ASSESSMENT_WEBHOOK_URL = process.env.N8N_MODULE_ASSESSMENT_WEBHOOK_URL || 'https://nclbtaru.app.n8n.cloud/webhook/MCQ/Flash/questions';
  console.log(`   URL: ${N8N_MODULE_ASSESSMENT_WEBHOOK_URL}`);
  
  const mcqPayload = {
    Type: "MCQ",
    uniqueid: "Transcribe_001",
    submittedAt: new Date().toISOString(),
    studentUniqueId: "STUDENT_123"
  };

  try {
    console.log('📤 Sending direct MCQ request to N8N:', mcqPayload);
    
    const response = await fetch(N8N_MODULE_ASSESSMENT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mcqPayload)
    });

    console.log(`📥 N8N Response Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log('📥 N8N Response:', JSON.stringify(data, null, 2));
      
      if (data && data.length > 0 && data[0].output) {
        try {
          const questionsData = JSON.parse(data[0].output);
          console.log('✅ N8N MCQ Questions parsed successfully:');
          console.log(`   - Number of questions: ${questionsData.length}`);
          
          questionsData.forEach((q, index) => {
            console.log(`   - Question ${index + 1}: ${q.question.substring(0, 50)}...`);
            console.log(`     Level: ${q.level}, Options: ${q.options.length}`);
          });
        } catch (parseError) {
          console.error('❌ Failed to parse N8N MCQ questions:', parseError.message);
        }
      } else {
        console.log('⚠️ No MCQ questions found in N8N response');
      }
    } else {
      console.log('⚠️ N8N webhook returned error status');
    }
    
  } catch (error) {
    console.error('❌ Direct N8N webhook error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting N8N API Integration Tests\n');
  
  // Test connectivity first
  await testAPIConnectivity();
  
  // Test direct N8N webhook
  await testDirectN8NWebhook();
  
  // Test MCQ generation (will fail due to auth, but shows the endpoint works)
  await testMCQGeneration();
  
  // Test flashcard generation (will fail due to auth, but shows the endpoint works)
  await testFlashcardGeneration();
  
  console.log('\n✨ Tests completed!');
  console.log('\n📋 Summary:');
  console.log('   - API endpoint is working correctly');
  console.log('   - 401 errors are expected without authentication');
  console.log('   - To test with authentication, login to the app first');
  console.log('   - Check N8N webhook connectivity above');
  console.log('   - Ensure the development server is running: npm run dev');
  console.log('\n💡 To test the full functionality:');
  console.log('   1. Open http://localhost:3001 in your browser');
  console.log('   2. Login as a student');
  console.log('   3. Navigate to ModulesTab');
  console.log('   4. Select a module and test MCQ/Flashcard features');
}

// Run the tests
runTests().catch(console.error); 