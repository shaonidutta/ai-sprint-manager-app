require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const debugIssueTable = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    // Check the actual table structure
    console.log('\n=== ISSUES TABLE STRUCTURE ===');
    const tableStructure = await database.query('DESCRIBE issues');
    console.table(tableStructure);

    // Check if there are any issues in the table
    console.log('\n=== ISSUES COUNT ===');
    const issueCount = await database.query('SELECT COUNT(*) as count FROM issues');
    console.log(`Total issues: ${issueCount[0].count}`);

    // Try to select a few issues with issue_order
    console.log('\n=== SAMPLE ISSUES WITH ORDER ===');
    const sampleIssues = await database.query(
      'SELECT id, title, status, issue_order FROM issues LIMIT 5'
    );
    console.table(sampleIssues);

    // Test the exact query that's failing
    console.log('\n=== TESTING ISSUE CREATION QUERY ===');
    try {
      const testQuery = `
        SELECT COALESCE(MAX(issue_order), 0) + 1 as next_order
        FROM issues
        WHERE board_id = ? AND status = ?
      `;
      const testResult = await database.query(testQuery, [1, 'To Do']);
      console.log('Order query result:', testResult);
    } catch (error) {
      console.error('Order query failed:', error.message);
    }

    // Test a simple insert to see what fails
    console.log('\n=== TESTING SIMPLE INSERT ===');
    try {
      const insertQuery = `
        INSERT INTO issues (
          board_id, title, issue_type, status, priority, reporter_id, issue_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      // This is just a test - we'll rollback
      await database.query('START TRANSACTION');
      
      const insertResult = await database.query(insertQuery, [
        1, 'Test Issue', 'Story', 'To Do', 'P3', 1, 1
      ]);
      
      console.log('Insert successful, rolling back...');
      await database.query('ROLLBACK');
      
    } catch (error) {
      console.error('Insert failed:', error.message);
      await database.query('ROLLBACK');
    }

    logger.info('Debug completed successfully');
  } catch (error) {
    logger.error('Debug failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the debug
debugIssueTable()
  .then(() => {
    console.log('\n✅ Debug completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error.message);
    process.exit(1);
  });
