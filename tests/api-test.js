#!/usr/bin/env node

/**
 * API Endpoints Test Script
 * Tests all critical API endpoints for proper responses
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

const API_ENDPOINTS = [
  {
    name: 'Authentication - Me (Unauthorized)',
    path: '/api/auth/me',
    method: 'GET',
    expectedStatus: 401,
    description: 'Should return 401 without auth token'
  },
  {
    name: 'Authentication - Login (Invalid)',
    path: '/api/auth/login',
    method: 'POST',
    data: { email: 'invalid@test.com', password: 'wrong' },
    expectedStatus: 401,
    description: 'Should return 401 for invalid credentials'
  },
  {
    name: 'Registration - Missing Data',
    path: '/api/auth/register',
    method: 'POST',
    data: { email: 'test@test.com' },
    expectedStatus: 400,
    description: 'Should return 400 for missing required fields'
  },
  {
    name: 'Assessment Questions (Unauthorized)',
    path: '/api/assessment/questions',
    method: 'GET',
    expectedStatus: 401,
    description: 'Should require authentication'
  },
  {
    name: 'User Profile (Unauthorized)',
    path: '/api/user/profile',
    method: 'GET',
    expectedStatus: 401,
    description: 'Should require authentication'
  },
  {
    name: 'Student Onboarding (Unauthorized)',
    path: '/api/student/onboarding',
    method: 'POST',
    data: { fullName: 'Test' },
    expectedStatus: 401,
    description: 'Should require authentication'
  },
  {
    name: 'Assessment Status (Public)',
    path: '/api/test/assessment-status',
    method: 'GET',
    expectedStatus: 200,
    description: 'Should return assessment status without auth'
  }
];

async function testEndpoint(endpoint) {
  try {
    const response = await makeRequest(
      endpoint.path, 
      endpoint.method, 
      endpoint.data,
      endpoint.headers || {}
    );
    
    const statusMatch = response.status === endpoint.expectedStatus;
    
    console.log(`   Status: ${response.status} (expected: ${endpoint.expectedStatus}) ${statusMatch ? '✅' : '❌'}`);
    
    if (response.body && typeof response.body === 'object') {
      if (response.body.error) {
        console.log(`   Error: ${response.body.error}`);
      }
      if (response.body.message) {
        console.log(`   Message: ${response.body.message}`);
      }
    }
    
    return statusMatch;
  } catch (error) {
    console.log(`   ❌ Request failed: ${error.message}`);
    return false;
  }
}

async function testSpecificEndpoints() {
  console.log('🔍 Testing specific endpoint behaviors...\n');
  
  // Test valid registration
  console.log('📋 Testing Valid Registration');
  console.log('─'.repeat(40));
  const testUser = {
    email: `apitest-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'API Test User',
    role: 'student',
    classGrade: '10'
  };
  
  try {
    const regResponse = await makeRequest('/api/auth/register', 'POST', testUser);
    console.log(`   Status: ${regResponse.status} ${regResponse.status === 200 || regResponse.status === 201 ? '✅' : '❌'}`);
    if (regResponse.body.user) {
      console.log(`   Created: ${regResponse.body.user.name} (${regResponse.body.user.role})`);
      console.log(`   Requires Onboarding: ${regResponse.body.requiresOnboarding}`);
    }
  } catch (error) {
    console.log(`   ❌ Registration failed: ${error.message}`);
  }
  
  // Test valid login
  console.log('\n📋 Testing Valid Login');
  console.log('─'.repeat(40));
  try {
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: testUser.email,
      password: testUser.password
    });
    console.log(`   Status: ${loginResponse.status} ${loginResponse.status === 200 ? '✅' : '❌'}`);
    if (loginResponse.body.user) {
      console.log(`   Logged in: ${loginResponse.body.user.name}`);
      console.log(`   Requires Onboarding: ${loginResponse.body.requiresOnboarding}`);
      console.log(`   Requires Assessment: ${loginResponse.body.requiresAssessment}`);
      
      // Extract auth token for authenticated tests
      const setCookieHeader = loginResponse.headers['set-cookie'];
      let authToken = null;
      if (setCookieHeader) {
        const authCookie = setCookieHeader.find(cookie => cookie.startsWith('auth-token='));
        if (authCookie) {
          authToken = authCookie.split(';')[0].split('=')[1];
          console.log(`   Auth Token: Present ✅`);
          
          // Test authenticated endpoint
          console.log('\n📋 Testing Authenticated Profile Access');
          console.log('─'.repeat(40));
          try {
            const profileResponse = await makeRequest('/api/user/profile', 'GET', null, {
              'Cookie': `auth-token=${authToken}`
            });
            console.log(`   Status: ${profileResponse.status} ${profileResponse.status === 200 ? '✅' : '❌'}`);
            if (profileResponse.body.user) {
              console.log(`   Profile: ${profileResponse.body.user.fullName}`);
              console.log(`   Role: ${profileResponse.body.user.role}`);
            }
          } catch (error) {
            console.log(`   ❌ Profile request failed: ${error.message}`);
          }
        }
      }
    }
  } catch (error) {
    console.log(`   ❌ Login failed: ${error.message}`);
  }
}

async function runAPITests() {
  console.log('🌐 Starting API Endpoints Tests...\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test expected responses
  for (const endpoint of API_ENDPOINTS) {
    console.log(`📋 Testing: ${endpoint.name}`);
    console.log('─'.repeat(50));
    console.log(`   ${endpoint.method} ${endpoint.path}`);
    console.log(`   ${endpoint.description}`);
    
    const result = await testEndpoint(endpoint);
    if (result) {
      passed++;
      console.log(`✅ ${endpoint.name} PASSED\n`);
    } else {
      failed++;
      console.log(`❌ ${endpoint.name} FAILED\n`);
    }
  }
  
  // Test specific positive flows
  await testSpecificEndpoints();
  
  console.log('\n' + '='.repeat(60));
  console.log('🌐 API ENDPOINTS TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  return failed === 0;
}

if (require.main === module) {
  runAPITests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runAPITests };