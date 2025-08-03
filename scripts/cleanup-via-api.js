#!/usr/bin/env node

/**
 * API-based Database Cleanup Script
 * Uses the cleanup API endpoint to remove test data
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

async function previewCleanup() {
  console.log('🔍 Previewing test data to be cleaned...\n');
  
  try {
    const response = await makeRequest('/api/admin/cleanup-test-data', 'GET');
    
    if (response.status !== 200) {
      console.log('❌ Failed to preview cleanup:', response.body.error);
      return false;
    }
    
    const preview = response.body.preview;
    
    console.log('📊 Cleanup Preview:');
    console.log(`   Users to delete: ${preview.users.count}`);
    console.log(`   Students to delete: ${preview.students.count}`);
    console.log(`   Assessment responses to delete: ${preview.assessmentResponses.count}`);
    console.log(`   Student progress records to delete: ${preview.studentProgress.count}`);
    console.log(`   Total items to delete: ${response.body.totalToDelete}`);
    
    if (preview.users.count > 0) {
      console.log('\n🗑️  Users to be deleted:');
      preview.users.items.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
    }
    
    if (preview.students.count > 0) {
      console.log('\n🗑️  Students to be deleted:');
      preview.students.items.forEach((student, index) => {
        console.log(`   ${index + 1}. ${student.name} (${student.uniqueId})`);
      });
    }
    
    return response.body.totalToDelete > 0;
    
  } catch (error) {
    console.log('❌ Error previewing cleanup:', error.message);
    return false;
  }
}

async function performCleanup() {
  console.log('\n🧹 Performing cleanup...\n');
  
  try {
    const response = await makeRequest('/api/admin/cleanup-test-data', 'DELETE');
    
    if (response.status !== 200) {
      console.log('❌ Cleanup failed:', response.body.error);
      return false;
    }
    
    const result = response.body;
    
    console.log('✅ Cleanup completed successfully!');
    console.log('\n📊 Cleanup Results:');
    console.log(`   Users deleted: ${result.deleted.users}`);
    console.log(`   Students deleted: ${result.deleted.students}`);
    console.log(`   Assessment responses deleted: ${result.deleted.assessmentResponses}`);
    console.log(`   Student progress deleted: ${result.deleted.studentProgress}`);
    console.log(`   Total items deleted: ${result.summary.totalDeleted}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ Error during cleanup:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧹 Database Test Data Cleanup\n');
  console.log('⚠️  This will remove all test data from the database.');
  console.log('   Only test users and students will be deleted.');
  console.log('   Production data will be preserved.\n');
  
  // Preview what will be deleted
  const hasDataToClean = await previewCleanup();
  
  if (!hasDataToClean) {
    console.log('\n🎉 No test data found to clean up!');
    console.log('   Database is already clean.');
    return;
  }
  
  console.log('\n⚠️  Proceeding with cleanup in 3 seconds...');
  console.log('   Press Ctrl+C to cancel.\n');
  
  // Wait 3 seconds
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Perform the cleanup
  const success = await performCleanup();
  
  if (success) {
    console.log('\n🎊 Database cleanup completed successfully!');
    console.log('   All test data has been removed.');
    console.log('   Production data remains intact.');
  } else {
    console.log('\n❌ Cleanup failed. Please check the errors above.');
  }
}

main().catch(console.error);