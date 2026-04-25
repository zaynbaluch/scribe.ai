import { callAI } from '../src/services/ai-client.service';
import logger from '../src/lib/logger';

// Mock AI_SERVICE_URL for testing
process.env.AI_SERVICE_URL = 'http://localhost:9999'; 

async function runTest() {
  console.log('Starting AI robustness test...');
  
  try {
    // This should fail after 5 retries (since nothing is listening on 9999)
    await callAI({ url: '/test', method: 'GET' }, 3, 500);
  } catch (err: any) {
    console.log('Test completed. Final error (expected):', err.message);
  }
}

runTest();
