#!/usr/bin/env node

const { spawn } = require('child_process');
const axios = require('axios');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 60000; // 1 minute

async function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  
  while (Date.now() - start < timeout) {
    try {
      await axios.get(`${url}/health`);
      console.log('✅ Server is ready');
      return true;
    } catch (error) {
      console.log('⏳ Waiting for server...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Server failed to start within timeout');
}

async function runTests() {
  console.log('🚀 Starting API Integration Test Suite...\n');
  
  let serverProcess;
  
  try {
    // Start the server
    console.log('📡 Starting test server...');
    serverProcess = spawn('node', ['server.js'], {
      cwd: path.join(__dirname, '..'),
      env: { ...process.env, NODE_ENV: 'test', PORT: '3000' },
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Handle server output
    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server running') || output.includes('Database connected')) {
        console.log(`📡 ${output.trim()}`);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('DeprecationWarning')) {
        console.error(`❌ Server Error: ${error.trim()}`);
      }
    });

    // Wait for server to be ready
    await waitForServer(BASE_URL);
    
    // Run the integration tests
    console.log('\n🧪 Running API Integration Tests...\n');
    
    const testProcess = spawn('npx', ['mocha', 'tests/api-integration.test.js', '--timeout', TEST_TIMEOUT.toString()], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });

    await new Promise((resolve, reject) => {
      testProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ All API integration tests passed!');
          resolve();
        } else {
          console.log(`\n❌ Tests failed with exit code ${code}`);
          reject(new Error(`Tests failed with exit code ${code}`));
        }
      });

      testProcess.on('error', (error) => {
        console.error('❌ Failed to run tests:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  } finally {
    // Clean up server process
    if (serverProcess) {
      console.log('\n🧹 Cleaning up server process...');
      serverProcess.kill('SIGTERM');
      
      // Force kill if it doesn't stop gracefully
      setTimeout(() => {
        if (!serverProcess.killed) {
          serverProcess.kill('SIGKILL');
        }
      }, 5000);
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n⚠️ Test execution interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️ Test execution terminated');
  process.exit(1);
});

// Run the tests
runTests().then(() => {
  console.log('\n🎉 Integration test suite completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Integration test suite failed:', error.message);
  process.exit(1);
});
