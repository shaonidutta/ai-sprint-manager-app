require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const fixExistingIssueOrders = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    console.log('\n=== FIXING EXISTING ISSUE ORDERS ===');
    
    // Get all boards
    const boards = await database.query('SELECT DISTINCT board_id FROM issues');
    console.log(`Found ${boards.length} boards with issues`);
    
    let totalUpdated = 0;
    
    for (const board of boards) {
      const boardId = board.board_id;
      console.log(`\nProcessing board ${boardId}...`);
      
      // Get all statuses for this board
      const statuses = await database.query(
        'SELECT DISTINCT status FROM issues WHERE board_id = ?', 
        [boardId]
      );
      
      for (const statusRow of statuses) {
        const status = statusRow.status;
        
        // Get all issues for this board and status, ordered by created_at
        const issues = await database.query(
          'SELECT id, title FROM issues WHERE board_id = ? AND status = ? ORDER BY created_at ASC',
          [boardId, status]
        );
        
        console.log(`  Status "${status}": ${issues.length} issues`);
        
        // Update each issue with its order
        for (let i = 0; i < issues.length; i++) {
          const newOrder = i + 1;
          await database.query(
            'UPDATE issues SET issue_order = ? WHERE id = ?',
            [newOrder, issues[i].id]
          );
          
          console.log(`    Updated issue ${issues[i].id} ("${issues[i].title.substring(0, 30)}...") to order ${newOrder}`);
          totalUpdated++;
        }
      }
    }
    
    console.log(`\n✅ Successfully updated ${totalUpdated} issues with proper order values`);
    
    // Verify the update
    console.log('\n=== VERIFICATION ===');
    const sampleIssues = await database.query(
      'SELECT id, title, status, issue_order, board_id FROM issues ORDER BY board_id, status, issue_order LIMIT 10'
    );
    console.table(sampleIssues);

    logger.info('Fix completed successfully');
  } catch (error) {
    logger.error('Fix failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the fix
fixExistingIssueOrders()
  .then(() => {
    console.log('\n✅ Fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fix failed:', error.message);
    process.exit(1);
  });
