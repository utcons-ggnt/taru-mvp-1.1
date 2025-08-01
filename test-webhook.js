const testWebhook = async (url) => {
  try {
    console.log(`Testing webhook: ${url}`);
    const response = await fetch(url + '?query=test&name=Test&email=test@test.com&grade=10&school=Test&uniqueId=test123&timestamp=2024-01-01T00:00:00.000Z&studentUniqueId=test123&sessionId=session123');
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const text = await response.text();
    console.log(`Response (first 200 chars): ${text.substring(0, 200)}...`);
    
    if (response.ok) {
      try {
        const json = JSON.parse(text);
        console.log('✅ Valid JSON response received!');
        return true;
      } catch (e) {
        console.log('❌ Response is not valid JSON');
        return false;
      }
    } else {
      console.log('❌ Webhook returned error status');
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
};

const testAllWebhooks = async () => {
  const webhooks = [
    'https://nclbtaru.app.n8n.cloud/webhook/AI-BUDDY-MAIN',
    'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY',
    'https://aviadigitalmind.app.n8n.cloud/webhook/AI-BUDDY-MAIN'
  ];
  
  console.log('Testing webhook URLs...\n');
  
  for (const webhook of webhooks) {
    console.log('='.repeat(60));
    const isWorking = await testWebhook(webhook);
    if (isWorking) {
      console.log(`🎉 WORKING WEBHOOK: ${webhook}`);
    }
    console.log('');
  }
};

testAllWebhooks(); 