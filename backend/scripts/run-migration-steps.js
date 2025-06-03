const {
  testAWSConnection,
  createAWSDatabase,
  createAWSTables,
  exportCurrentData,
  importDataToAWS,
  verifyMigration,
  runFullMigration
} = require('./migrate-to-aws');
const logger = require('../config/logger');

/**
 * Interactive migration script with step-by-step execution
 */
const main = async () => {
  const args = process.argv.slice(2);
  const step = args[0];

  try {
    switch (step) {
      case 'test':
        logger.info('🔍 Step 1: Testing AWS RDS connection...');
        const success = await testAWSConnection();
        if (!success) throw new Error('Connection test failed');
        break;

      case 'create-db':
        logger.info('🏗️  Step 2: Creating database on AWS RDS...');
        await createAWSDatabase();
        break;

      case 'create-tables':
        logger.info('📋 Step 3: Creating tables on AWS RDS...');
        await createAWSTables();
        break;

      case 'export':
        logger.info('📤 Step 4: Exporting data from current database...');
        await exportCurrentData();
        break;

      case 'import':
        logger.info('📥 Step 5: Importing data to AWS RDS...');
        // First export data, then import
        const exportData = await exportCurrentData();
        await importDataToAWS(exportData);
        break;

      case 'verify':
        logger.info('✅ Step 6: Verifying migration...');
        const verification = await verifyMigration();
        console.log('\n📊 Verification Results:');
        console.table(verification.details);
        break;

      case 'full':
        logger.info('🚀 Running full migration...');
        const result = await runFullMigration();
        console.log('\n📊 Final Results:');
        console.table(result.details);
        break;

      default:
        console.log(`
🔧 AWS RDS Migration Tool

Usage: node run-migration-steps.js <step>

Available steps:
  test         - Test AWS RDS connection
  create-db    - Create database on AWS RDS
  create-tables- Create tables on AWS RDS
  export       - Export data from current database
  import       - Export and import data to AWS RDS
  verify       - Verify migration by comparing record counts
  full         - Run complete migration process

Examples:
  node run-migration-steps.js test
  node run-migration-steps.js full
        `);
        process.exit(0);
    }

    logger.info('✅ Step completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Step failed: ${error.message}`);
    process.exit(1);
  }
};

main();
