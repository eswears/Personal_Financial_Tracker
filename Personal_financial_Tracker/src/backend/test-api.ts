import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:3001/api';
const USER_ID = 'test-user-' + Date.now();

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  message: string;
  responseTime?: number;
}

const results: TestResult[] = [];

async function testEndpoint(
  method: string,
  endpoint: string,
  data?: any,
  headers?: any
): Promise<void> {
  const startTime = Date.now();
  try {
    const config: any = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'x-user-id': USER_ID,
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    results.push({
      endpoint,
      method,
      status: 'PASS',
      message: `Status: ${response.status}`,
      responseTime
    });

    console.log(`✅ ${method} ${endpoint} - ${responseTime}ms`);
  } catch (error: any) {
    results.push({
      endpoint,
      method,
      status: 'FAIL',
      message: error.message
    });
    console.error(`❌ ${method} ${endpoint} - ${error.message}`);
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...\n');

  // Test Health Endpoint
  console.log('📍 Testing Health Check...');
  await testEndpoint('GET', '/../health');

  // Test Transactions
  console.log('\n📍 Testing Transaction Endpoints...');
  
  // Create transaction
  await testEndpoint('POST', '/transactions', {
    date: new Date().toISOString(),
    description: 'Test transaction',
    amount: -50.00,
    category: 'Food & Dining',
    type: 'expense',
    account: 'Test Account'
  });

  // Get all transactions
  await testEndpoint('GET', '/transactions');
  
  // Get transactions with filters
  await testEndpoint('GET', '/transactions?limit=5&category=Food & Dining');

  // Test Analytics
  console.log('\n📍 Testing Analytics Endpoints...');
  
  await testEndpoint('GET', '/analytics/summary');
  await testEndpoint('GET', '/analytics/categories');
  await testEndpoint('GET', '/analytics/trends');
  await testEndpoint('GET', '/analytics/budget-comparison');

  // Test Dashboard
  console.log('\n📍 Testing Dashboard Endpoints...');
  
  await testEndpoint('GET', '/dashboard');
  await testEndpoint('GET', '/dashboard/stats');

  // Test AI Insights
  console.log('\n📍 Testing AI Endpoints...');
  
  await testEndpoint('POST', '/insights', {
    userId: USER_ID,
    period: 3
  });

  // Test File Upload (if mock data exists)
  console.log('\n📍 Testing File Upload...');
  
  const mockCsvPath = path.join(__dirname, '../../data/mock-transactions.csv');
  if (fs.existsSync(mockCsvPath)) {
    const form = new FormData();
    form.append('file', fs.createReadStream(mockCsvPath));
    
    await testEndpoint('POST', '/upload', form, {
      ...form.getHeaders()
    });
  } else {
    console.log('⚠️  Mock CSV file not found, skipping upload test');
  }

  // Print Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const avgResponseTime = results
    .filter(r => r.responseTime)
    .reduce((sum, r) => sum + (r.responseTime || 0), 0) / passed;

  console.log(`Total Tests: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Avg Response Time: ${avgResponseTime.toFixed(2)}ms`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - ${r.method} ${r.endpoint}: ${r.message}`);
      });
  }

  // Performance Warnings
  const slowEndpoints = results.filter(r => r.responseTime && r.responseTime > 500);
  if (slowEndpoints.length > 0) {
    console.log('\n⚠️  Slow Endpoints (>500ms):');
    slowEndpoints.forEach(r => {
      console.log(`  - ${r.method} ${r.endpoint}: ${r.responseTime}ms`);
    });
  }

  console.log('\n' + '='.repeat(50));
}

// Run tests
runTests().catch(console.error);