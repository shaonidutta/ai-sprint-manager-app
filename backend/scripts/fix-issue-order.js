require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const fixIssueOrder = async () => {
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

// Run fix if called directly
if (require.main === module) {
  fixIssueOrder()
    .then(() => {
      logger.info('Fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixIssueOrder };
