const { dumpDatabase } = require('./dumpDatabase');
const logger = require('../config/logger');

/**
 * Create a backup of the current database before migration
 */
const main = async () => {
  try {
    logger.info('💾 Creating backup of current database...');
    await dumpDatabase();
    logger.info('✅ Backup completed successfully!');
    logger.info('📁 Backup files are stored in the database_dumps directory');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
};

main();
