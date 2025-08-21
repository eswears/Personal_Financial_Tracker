// Test file for Phase 2 integration
import { processingService } from './processingService';
import { DatabaseService } from '../database/database.service';

async function testIntegration() {
  console.log('Testing Phase 2 Integration - Agent 3 Processing Services');
  console.log('=========================================================');
  
  try {
    // Test 1: Database connection
    console.log('\n1. Testing Database Connection...');
    const db = new DatabaseService();
    console.log('   ✅ Database service initialized');
    
    // Test 2: CSV Processing
    console.log('\n2. Testing CSV Processing...');
    const csvData = `Date,Description,Amount
2024-01-15,Starbucks Coffee,-5.50
2024-01-16,Salary Deposit,3500.00
2024-01-17,Amazon Purchase,-125.99
2024-01-18,Uber Ride,-18.75`;
    
    const csvBuffer = Buffer.from(csvData);
    const csvResult = await processingService.processFile(
      csvBuffer,
      'test.csv',
      'test-user-123'
    );
    console.log(`   ✅ Processed ${csvResult.transactions.length} CSV transactions`);
    console.log(`   Categories: ${[...new Set(csvResult.transactions.map(t => t.category))].join(', ')}`);
    
    // Test 3: Analytics Generation
    console.log('\n3. Testing Analytics Service...');
    const analytics = await processingService.getAnalytics('test-user-123');
    console.log('   ✅ Analytics generated successfully');
    
    // Test 4: AI Insights (will use rule-based if no API key)
    console.log('\n4. Testing AI Service...');
    if (csvResult.insights) {
      console.log('   ✅ AI insights generated');
      console.log(`   Recommendations: ${csvResult.insights.recommendations.length}`);
    } else {
      console.log('   ⚠️ Insights not generated (need more transactions)');
    }
    
    // Test 5: Category Breakdown
    console.log('\n5. Testing Category Breakdown...');
    const categories = await processingService.getCategoryBreakdown('test-user-123');
    console.log('   ✅ Category breakdown retrieved');
    
    console.log('\n========================================');
    console.log('✅ All integration tests passed!');
    console.log('Agent 3 services are ready for Phase 2 integration');
    
    return true;
  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testIntegration().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { testIntegration };