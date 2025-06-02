require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const addIssueOrderColumn = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    // Check if issue_order column exists
    const checkColumnQuery = `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'issues' AND COLUMN_NAME = 'issue_order'
    `;
    
    const columnExists = await database.query(checkColumnQuery, [process.env.DB_NAME]);
    
    if (columnExists.length === 0) {
      logger.info('Adding issue_order column to issues table');
      
      // Add the column
      await database.query('ALTER TABLE issues ADD COLUMN issue_order INT DEFAULT 0');
      
      // Add index
      await database.query('CREATE INDEX idx_issue_order ON issues(issue_order)');
      
      logger.info('Successfully added issue_order column and index');
      
      // Update existing issues with proper order values
      logger.info('Updating existing issues with order values...');
      
      // Get all boards
      const boards = await database.query('SELECT DISTINCT board_id FROM issues');
      
      for (const board of boards) {
        const boardId = board.board_id;
        
        // Get all statuses for this board
        const statuses = await database.query(
          'SELECT DISTINCT status FROM issues WHERE board_id = ?', 
          [boardId]
        );
        
        for (const statusRow of statuses) {
          const status = statusRow.status;
          
          // Get all issues for this board and status, ordered by created_at
          const issues = await database.query(
            'SELECT id FROM issues WHERE board_id = ? AND status = ? ORDER BY created_at ASC',
            [boardId, status]
          );
          
          // Update each issue with its order
          for (let i = 0; i < issues.length; i++) {
            await database.query(
              'UPDATE issues SET issue_order = ? WHERE id = ?',
              [i + 1, issues[i].id]
            );
          }
          
          logger.info(`Updated ${issues.length} issues for board ${boardId}, status ${status}`);
        }
      }
      
      logger.info('Successfully updated all existing issues with order values');
    } else {
      logger.info('issue_order column already exists');
    }

    logger.info('Fix completed successfully');
  } catch (error) {
    logger.error('Fix failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the fix
addIssueOrderColumn()
  .then(() => {
    console.log('✅ Issue order column fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  });
