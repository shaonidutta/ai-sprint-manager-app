require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const checkUsers = async () => {
  try {
    await database.connect();
    logger.info('Connected to database');

    console.log('\n=== CHECKING USERS ===');
    
    // Get all users
    const users = await database.query('SELECT id, email, first_name, last_name, is_active FROM users');
    console.log(`Found ${users.length} users:`);
    console.table(users);

    // Check if there are any boards
    console.log('\n=== CHECKING BOARDS ===');
    const boards = await database.query('SELECT id, name, project_id FROM boards');
    console.log(`Found ${boards.length} boards:`);
    console.table(boards);

    logger.info('Check completed successfully');
  } catch (error) {
    logger.error('Check failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the check
checkUsers()
  .then(() => {
    console.log('\n✅ Check completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error.message);
    process.exit(1);
  });
