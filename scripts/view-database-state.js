#!/usr/bin/env node

/**
 * View Database State
 * Shows current users and their assessment data
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

async function viewDatabaseState() {
  console.log('📊 Current Database State\n');
  
  try {
    // Get assessment status
    const statusResponse = await makeRequest('/api/test/assessment-status');
    
    if (statusResponse.status === 200) {
      const data = statusResponse.body;
      
      console.log('👥 Users Overview:');
      console.log(`   Total Students: ${data.totalStudents}`);
      console.log(`   Students with Assessment Responses: ${data.studentsWithResponses || 0}`);
      console.log(`   Completed Assessments: ${data.students?.filter(s => s.assessmentCompleted).length || 0}`);
      
      if (data.students && data.students.length > 0) {
        console.log('\n📋 Student Details:');
        data.students.forEach((student, index) => {
          console.log(`\n   ${index + 1}. ${student.fullName} (${student.uniqueId})`);
          console.log(`      Onboarding: ${student.onboardingCompleted ? '✅ Completed' : '❌ Pending'}`);
          console.log(`      Assessment: ${student.assessmentCompleted ? '✅ Completed' : '❌ Pending'}`);
          console.log(`      Responses: ${student.responsesCount || 0}`);
          console.log(`      Generated Questions: ${student.generatedQuestionsCount || 0}`);
          
          if (student.assessmentCompleted) {
            console.log(`      Learning Style: ${student.learningStyle || 'N/A'}`);
            console.log(`      Score: ${student.score || 'N/A'}`);
          }
        });
      }
      
      // Get detailed assessment data
      console.log('\n🔍 Detailed Assessment Data:');
      const assessmentDataResponse = await makeRequest('/api/assessment/seed');
      
      if (assessmentDataResponse.status === 200 && assessmentDataResponse.body.success) {
        const assessmentData = assessmentDataResponse.body.data;
        
        if (Array.isArray(assessmentData)) {
          assessmentData.forEach((assessment, index) => {
            console.log(`\n   ${index + 1}. Student: ${assessment.uniqueId}`);
            console.log(`      Assessment Type: ${assessment.assessmentType}`);
            console.log(`      Responses Count: ${assessment.responsesCount}`);
            console.log(`      Completed: ${assessment.isCompleted ? '✅ Yes' : '❌ No'}`);
            
            if (assessment.result) {
              console.log(`      Learning Style: ${assessment.result.learningStyle || 'N/A'}`);
              console.log(`      Score: ${assessment.result.score || 'N/A'}`);
              console.log(`      Type: ${assessment.result.type || 'N/A'}`);
            }
          });
        } else {
          console.log('   Single assessment data:', assessmentData);
        }
      } else {
        console.log('   No detailed assessment data available');
      }
      
    } else {
      console.log('❌ Failed to fetch database status');
    }
    
  } catch (error) {
    console.error('❌ Error viewing database state:', error.message);
  }
}

async function main() {
  await viewDatabaseState();
  console.log('\n🎊 Database state overview completed!');
}

main(); 