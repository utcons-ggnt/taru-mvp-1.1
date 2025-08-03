#!/usr/bin/env node

/**
 * Database Connectivity and Model Test Script
 * Tests database connections and model operations
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
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
            body: jsonBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
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

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  try {
    const response = await makeRequest('/api/test/assessment-status');
    
    if (response.status === 200) {
      console.log('✅ Database connection successful');
      console.log(`   Students found: ${response.body.totalStudents || 0}`);
      return true;
    } else {
      console.log(`❌ Database connection failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Database connection error: ${error.message}`);
    return false;
  }
}

async function testUserModel() {
  console.log('🔍 Testing User model (via registration)...');
  try {
    const testUser = {
      email: `dbtest-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      name: 'DB Test User',
      role: 'student',
      classGrade: '10'
    };

    const response = await makeRequest('/api/auth/register', 'POST', testUser);
    
    if (response.status === 201 || response.status === 200) {
      console.log('✅ User model working correctly');
      console.log(`   Created user: ${response.body.user?.name}`);
      console.log(`   User ID: ${response.body.user?._id}`);
      console.log(`   Role: ${response.body.user?.role}`);
      return true;
    } else {
      console.log(`❌ User model test failed: ${response.status} - ${response.body.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ User model error: ${error.message}`);
    return false;
  }
}

async function testStudentModel() {
  console.log('🔍 Testing Student model (via assessment status)...');
  try {
    const response = await makeRequest('/api/test/assessment-status');
    
    if (response.status === 200) {
      const students = response.body.students || [];
      console.log('✅ Student model working correctly');
      console.log(`   Students in database: ${students.length}`);
      
      if (students.length > 0) {
        const student = students[0];
        console.log(`   Sample student: ${student.fullName}`);
        console.log(`   Unique ID: ${student.uniqueId}`);
        console.log(`   Onboarding completed: ${student.onboardingCompleted}`);
      }
      return true;
    } else {
      console.log(`❌ Student model test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Student model error: ${error.message}`);
    return false;
  }
}

async function testAssessmentResponseModel() {
  console.log('🔍 Testing AssessmentResponse model...');
  try {
    const response = await makeRequest('/api/test/assessment-status');
    
    if (response.status === 200) {
      const students = response.body.students || [];
      const studentsWithAssessments = students.filter(s => s.hasAssessmentResponse);
      
      console.log('✅ AssessmentResponse model working correctly');
      console.log(`   Students with assessment responses: ${studentsWithAssessments.length}`);
      
      if (studentsWithAssessments.length > 0) {
        const student = studentsWithAssessments[0];
        console.log(`   Sample: ${student.fullName} - ${student.responsesCount} responses`);
        console.log(`   Assessment completed: ${student.assessmentCompleted}`);
        console.log(`   Generated questions: ${student.generatedQuestionsCount}`);
      }
      return true;
    } else {
      console.log(`❌ AssessmentResponse model test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ AssessmentResponse model error: ${error.message}`);
    return false;
  }
}

async function runDatabaseTests() {
  console.log('🗄️  Starting Database Tests...\n');
  
  const tests = [
    { name: 'Database Connection', func: testDatabaseConnection },
    { name: 'User Model', func: testUserModel },
    { name: 'Student Model', func: testStudentModel },
    { name: 'AssessmentResponse Model', func: testAssessmentResponseModel }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Running: ${test.name}`);
    console.log('─'.repeat(40));
    
    try {
      const result = await test.func();
      if (result) {
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
  
  console.log('\n' + '='.repeat(50));
  console.log('🗄️  DATABASE TEST RESULTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests Passed: ${passed}`);
  console.log(`❌ Tests Failed: ${failed}`);
  console.log(`🎯 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  return failed === 0;
}

if (require.main === module) {
  runDatabaseTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runDatabaseTests };