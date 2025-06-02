require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');
const Issue = require('../models/Issue');

const testIssueCreation = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    console.log('\n=== TESTING ISSUE CREATION ===');
    
    // Test data for creating an issue
    const testIssueData = {
      board_id: 1,
      title: 'Test Issue Creation',
      description: 'This is a test issue to verify the creation process',
      issue_type: 'Story',
      status: 'To Do',
      priority: 'P3',
      reporter_id: 1,
      assignee_id: null,
      story_points: 3,
      original_estimate: 5,
      sprint_id: null
    };

    console.log('Creating issue with data:', testIssueData);

    try {
      const createdIssue = await Issue.create(testIssueData);
      console.log('✅ Issue created successfully!');
      console.log('Created issue:', {
        id: createdIssue.id,
        title: createdIssue.title,
        issue_order: createdIssue.issue_order,
        status: createdIssue.status
      });

      // Clean up - delete the test issue
      await database.query('DELETE FROM issues WHERE id = ?', [createdIssue.id]);
      console.log('🧹 Test issue cleaned up');

    } catch (error) {
      console.error('❌ Issue creation failed:', error.message);
      console.error('Error details:', error);
      
      // Let's check what the exact SQL error is
      if (error.code) {
        console.error('SQL Error Code:', error.code);
        console.error('SQL Message:', error.sqlMessage);
      }
    }

    // Also test the order calculation separately
    console.log('\n=== TESTING ORDER CALCULATION ===');
    try {
      const orderQuery = `
        SELECT COALESCE(MAX(issue_order), 0) + 1 as next_order
        FROM issues
        WHERE board_id = ? AND status = ?
      `;
      const orderResult = await database.query(orderQuery, [1, 'To Do']);
      console.log('Next order for board 1, status "To Do":', orderResult[0].next_order);
    } catch (error) {
      console.error('Order calculation failed:', error.message);
    }

    logger.info('Test completed');
  } catch (error) {
    logger.error('Test failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the test
testIssueCreation()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  });
