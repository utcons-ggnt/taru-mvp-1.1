const testChatAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Hello, how are you?',
        studentData: {
          name: 'Test Student',
          email: 'test@example.com',
          grade: '10',
          school: 'Test School',
          uniqueId: 'test123',
          timestamp: new Date().toISOString()
        },
        studentUniqueId: 'test123',
        sessionId: 'session123'
      }),
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Chat API is working!');
      console.log('Response:', data.response);
      if (data.fallback) {
        console.log('⚠️ Using fallback response (N8N webhook may be down)');
      }
    } else {
      console.log('❌ Chat API returned error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing chat API:', error.message);
  }
};

testChatAPI(); 