#!/usr/bin/env node

/**
 * Comprehensive Flow Test Script
 * Tests the complete student onboarding and assessment flow
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test Student',
  role: 'student',
  classGrade: '10'
};

let authToken = null;
let studentData = null;

// Utility function to make HTTP requests
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

// Test functions
async function testHealthCheck() {
  console.log('🔍 Testing server health...');
  try {
    const response = await makeRequest('/api/auth/me');
    if (response.status === 401) {
      console.log('✅ Server is running and authentication is working');
      return true;
    } else {
      console.log(`⚠️  Unexpected response: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  try {
    const response = await makeRequest('/api/auth/register', 'POST', TEST_USER);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ User registration successful');
      console.log(`   User: ${response.body.user?.name} (${response.body.user?.email})`);
      console.log(`   Requires Onboarding: ${response.body.requiresOnboarding}`);
      return true;
    } else {
      console.log(`❌ Registration failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Registration error: ${error.message}`);
    return false;
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  try {
    const response = await makeRequest('/api/auth/login', 'POST', {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    if (response.status === 200) {
      // Extract auth token from Set-Cookie header
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const authCookie = setCookieHeader.find(cookie => cookie.startsWith('auth-token='));
        if (authCookie) {
          authToken = authCookie.split(';')[0].split('=')[1];
        }
      }
      
      console.log('✅ User login successful');
      console.log(`   User: ${response.body.user?.name}`);
      console.log(`   Requires Onboarding: ${response.body.requiresOnboarding}`);
      console.log(`   Requires Assessment: ${response.body.requiresAssessment}`);
      console.log(`   Auth Token: ${authToken ? 'Present' : 'Missing'}`);
      
      studentData = response.body.user;
      return true;
    } else {
      console.log(`❌ Login failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Login error: ${error.message}`);
    return false;
  }
}

async function testUserProfile() {
  console.log('🔍 Testing user profile endpoint...');
  try {
    const response = await makeRequest('/api/user/profile', 'GET', null, {
      'Cookie': `auth-token=${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✅ User profile retrieval successful');
      console.log(`   Full Name: ${response.body.user?.fullName}`);
      console.log(`   Role: ${response.body.user?.role}`);
      console.log(`   Email: ${response.body.user?.email}`);
      return true;
    } else {
      console.log(`❌ Profile retrieval failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Profile error: ${error.message}`);
    return false;
  }
}

async function testOnboardingFlow() {
  console.log('🔍 Testing student onboarding...');
  try {
    const onboardingData = {
      fullName: TEST_USER.name,
      nickname: 'Tester',
      dateOfBirth: '2005-01-15',
      age: 19,
      gender: 'male',
      classGrade: TEST_USER.classGrade,
      schoolName: 'Test High School',
      schoolId: 'SCH001',
      languagePreference: 'English',
      learningModePreference: ['Visual Learning'],
      interestsOutsideClass: ['Science', 'Technology'],
      preferredCareerDomains: ['Engineering'],
      guardianName: 'Test Guardian',
      guardianContactNumber: '1234567890',
      guardianEmail: 'guardian@example.com',
      location: 'Test City',
      deviceId: 'test-device-001',
      relationship: 'parent',
      consentForDataUsage: true,
      termsAndConditionsAccepted: true
    };

    const response = await makeRequest('/api/student/onboarding', 'POST', onboardingData, {
      'Cookie': `auth-token=${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✅ Student onboarding successful');
      console.log(`   Unique ID: ${response.body.uniqueId}`);
      console.log(`   Message: ${response.body.message}`);
      return true;
    } else {
      console.log(`❌ Onboarding failed: ${response.status} - ${response.body.error}`);
      console.log(`   Response body:`, response.body);
      return false;
    }
  } catch (error) {
    console.log(`❌ Onboarding error: ${error.message}`);
    return false;
  }
}

async function testAssessmentQuestions() {
  console.log('🔍 Testing assessment questions endpoint...');
  try {
    const response = await makeRequest('/api/assessment/questions', 'GET', null, {
      'Cookie': `auth-token=${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✅ Assessment questions retrieval successful');
      console.log(`   Question: ${response.body.question?.question?.substring(0, 50)}...`);
      console.log(`   Type: ${response.body.question?.type}`);
      console.log(`   Question Number: ${response.body.currentQuestion}/${response.body.totalQuestions}`);
      console.log(`   Progress: ${response.body.progress}%`);
      return response.body.question;
    } else {
      console.log(`❌ Assessment questions failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Assessment questions error: ${error.message}`);
    return false;
  }
}

async function testAssessmentSubmission(question) {
  console.log('🔍 Testing assessment answer submission...');
  try {
    const answer = question.type === 'MCQ' ? 
      (question.options ? question.options[0] : 'Option A') : 
      'This is a test answer for the open-ended question.';

    const response = await makeRequest('/api/assessment/questions', 'POST', {
      questionId: question.id,
      answer: answer,
      questionNumber: 1
    }, {
      'Cookie': `auth-token=${authToken}`
    });
    
    if (response.status === 200) {
      console.log('✅ Assessment answer submission successful');
      console.log(`   Message: ${response.body.message}`);
      console.log(`   Completed: ${response.body.completed || false}`);
      if (response.body.nextQuestion) {
        console.log(`   Next Question: ${response.body.nextQuestion}`);
      }
      return true;
    } else {
      console.log(`❌ Assessment submission failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Assessment submission error: ${error.message}`);
    return false;
  }
}

async function testAssessmentStatus() {
  console.log('🔍 Testing assessment status endpoint...');
  try {
    const response = await makeRequest('/api/test/assessment-status', 'GET');
    
    if (response.status === 200) {
      console.log('✅ Assessment status retrieval successful');
      console.log(`   Total Students: ${response.body.totalStudents}`);
      if (response.body.students && response.body.students.length > 0) {
        const student = response.body.students[0];
        console.log(`   Sample Student: ${student.fullName} (${student.uniqueId})`);
        console.log(`   Onboarding Complete: ${student.onboardingCompleted}`);
        console.log(`   Assessment Complete: ${student.assessmentCompleted}`);
        console.log(`   Generated Questions: ${student.generatedQuestionsCount}`);
      }
      return true;
    } else {
      console.log(`❌ Assessment status failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Assessment status error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Comprehensive Flow Tests...\n');
  
  const tests = [
    { name: 'Server Health Check', func: testHealthCheck },
    { name: 'User Registration', func: testUserRegistration },
    { name: 'User Login', func: testUserLogin },
    { name: 'User Profile', func: testUserProfile },
    { name: 'Student Onboarding', func: testOnboardingFlow },
    { name: 'Assessment Questions', func: testAssessmentQuestions },
    { name: 'Assessment Status', func: testAssessmentStatus }
  ];
  
  let passed = 0;
  let failed = 0;
  let question = null;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.func();
      if (result) {
        if (test.name === 'Assessment Questions') {
          question = result;
        }
        passed++;
        console.log(`✅ ${test.name} PASSED`);
      } else {
        failed++;
        console.log(`❌ ${test.name} FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${test.name} ERROR: ${error.message}`);
    }
  }
  
  // Test assessment submission if we have a question
  if (question) {
    console.log(`\n📋 Running: Assessment Answer Submission`);
    console.log('─'.repeat(50));
    try {
      const result = await testAssessmentSubmission(question);
      if (result) {
        passed++;
        console.log(`✅ Assessment Answer Submission PASSED`);
      } else {
        failed++;
        console.log(`❌ Assessment Answer Submission FAILED`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ Assessment Answer Submission ERROR: ${error.message}`);
    }
  }
  
  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`📊 Total Tests: ${passed + failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED - System is working correctly!');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed - Check the errors above`);
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };