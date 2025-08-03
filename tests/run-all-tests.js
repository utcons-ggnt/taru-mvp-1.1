#!/usr/bin/env node

/**
 * Master Test Runner
 * Executes all test suites and provides comprehensive results
 */

const { runAPITests } = require('./api-test');
const { runDatabaseTests } = require('./database-test');
const { runTests: runFlowTests } = require('./flow-test');

const COLORS = {
  RED: '\x1b[31m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  BLUE: '\x1b[34m',
  MAGENTA: '\x1b[35m',
  CYAN: '\x1b[36m',
  WHITE: '\x1b[37m',
  RESET: '\x1b[0m'
};

function colorize(text, color) {
  return `${color}${text}${COLORS.RESET}`;
}

async function checkServerStatus() {
  const http = require('http');
  
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/me',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.on('timeout', () => {
      resolve(false);
    });
    
    req.end();
  });
}

async function runAllTests() {
  console.log(colorize('🚀 COMPREHENSIVE TEST SUITE', COLORS.CYAN));
  console.log(colorize('='.repeat(60), COLORS.CYAN));
  console.log('Testing complete application flow and functionality\n');
  
  // Check server status first
  console.log(colorize('🔍 Checking server status...', COLORS.YELLOW));
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log(colorize('❌ Server is not running on localhost:3001', COLORS.RED));
    console.log(colorize('   Please start the development server with: npm run dev', COLORS.YELLOW));
    process.exit(1);
  }
  
  console.log(colorize('✅ Server is running and accessible\n', COLORS.GREEN));
  
  const testSuites = [
    {
      name: 'API Endpoints Test',
      icon: '🌐',
      func: runAPITests,
      description: 'Tests all API endpoints for proper responses and authentication'
    },
    {
      name: 'Database Connectivity Test',
      icon: '🗄️',
      func: runDatabaseTests,
      description: 'Tests database connections and model operations'
    },
    {
      name: 'End-to-End Flow Test',
      icon: '🔄',
      func: runFlowTests,
      description: 'Tests complete user journey from registration to dashboard'
    }
  ];
  
  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (let i = 0; i < testSuites.length; i++) {
    const suite = testSuites[i];
    
    console.log(colorize(`\n${suite.icon} TEST SUITE ${i + 1}/${testSuites.length}: ${suite.name}`, COLORS.MAGENTA));
    console.log(colorize('='.repeat(60), COLORS.MAGENTA));
    console.log(colorize(suite.description, COLORS.WHITE));
    console.log('');
    
    const startTime = Date.now();
    
    try {
      const success = await suite.func();
      const duration = Date.now() - startTime;
      
      results.push({
        name: suite.name,
        icon: suite.icon,
        success: success,
        duration: duration
      });
      
      if (success) {
        totalPassed++;
        console.log(colorize(`\n✅ ${suite.name} COMPLETED SUCCESSFULLY`, COLORS.GREEN));
      } else {
        totalFailed++;
        console.log(colorize(`\n❌ ${suite.name} FAILED`, COLORS.RED));
      }
      
      console.log(colorize(`⏱️  Duration: ${duration}ms`, COLORS.CYAN));
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      results.push({
        name: suite.name,
        icon: suite.icon,
        success: false,
        duration: duration,
        error: error.message
      });
      
      totalFailed++;
      console.log(colorize(`\n❌ ${suite.name} ERROR: ${error.message}`, COLORS.RED));
      console.log(colorize(`⏱️  Duration: ${duration}ms`, COLORS.CYAN));
    }
  }
  
  // Final Results Summary
  console.log('\n' + colorize('='.repeat(80), COLORS.CYAN));
  console.log(colorize('🏁 COMPREHENSIVE TEST RESULTS SUMMARY', COLORS.CYAN));
  console.log(colorize('='.repeat(80), COLORS.CYAN));
  
  // Individual suite results
  console.log(colorize('\n📊 Test Suite Results:', COLORS.WHITE));
  console.log(colorize('─'.repeat(40), COLORS.WHITE));
  
  for (const result of results) {
    const status = result.success ? 
      colorize('✅ PASSED', COLORS.GREEN) : 
      colorize('❌ FAILED', COLORS.RED);
    
    console.log(`${result.icon} ${result.name}: ${status} (${result.duration}ms)`);
    
    if (result.error) {
      console.log(colorize(`   Error: ${result.error}`, COLORS.RED));
    }
  }
  
  // Overall statistics
  console.log(colorize('\n📈 Overall Statistics:', COLORS.WHITE));
  console.log(colorize('─'.repeat(40), COLORS.WHITE));
  console.log(`${colorize('✅ Test Suites Passed:', COLORS.GREEN)} ${totalPassed}`);
  console.log(`${colorize('❌ Test Suites Failed:', COLORS.RED)} ${totalFailed}`);
  console.log(`${colorize('📊 Total Test Suites:', COLORS.BLUE)} ${totalPassed + totalFailed}`);
  
  const successRate = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
  const rateColor = successRate === 100 ? COLORS.GREEN : successRate >= 80 ? COLORS.YELLOW : COLORS.RED;
  console.log(`${colorize('🎯 Success Rate:', COLORS.BLUE)} ${colorize(successRate + '%', rateColor)}`);
  
  const totalDuration = results.reduce((sum, result) => sum + result.duration, 0);
  console.log(`${colorize('⏱️  Total Duration:', COLORS.BLUE)} ${totalDuration}ms`);
  
  // Final verdict
  console.log('\n' + colorize('🎭 FINAL VERDICT:', COLORS.CYAN));
  console.log(colorize('─'.repeat(40), COLORS.CYAN));
  
  if (totalFailed === 0) {
    console.log(colorize('🎉 ALL TESTS PASSED - SYSTEM IS FULLY FUNCTIONAL!', COLORS.GREEN));
    console.log(colorize('✅ Application is ready for production use', COLORS.GREEN));
    console.log(colorize('🚀 All critical flows verified and working correctly', COLORS.GREEN));
  } else {
    console.log(colorize(`⚠️  ${totalFailed} test suite(s) failed`, COLORS.YELLOW));
    console.log(colorize('🔧 Please review the errors above and fix any issues', COLORS.YELLOW));
    console.log(colorize('📋 Re-run tests after making corrections', COLORS.YELLOW));
  }
  
  console.log('\n' + colorize('='.repeat(80), COLORS.CYAN));
  
  // Exit with appropriate code
  process.exit(totalFailed === 0 ? 0 : 1);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error(colorize('❌ Unhandled rejection:', COLORS.RED), error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(colorize('❌ Uncaught exception:', COLORS.RED), error);
  process.exit(1);
});

// Run all tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };