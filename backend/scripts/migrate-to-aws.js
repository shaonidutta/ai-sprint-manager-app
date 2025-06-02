const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
require('dotenv').config();

// AWS RDS Configuration
const AWS_DB_CONFIG = {
  host: 'ls-d157091fb9608cc702c3b9a33dec25bca625f14b.cstb7bwkbg8x.ap-south-1.rds.amazonaws.com',
  user: 'dbmasteruser',
  password: 'R8AR9z^_y|AP3+jABss?GN8<!|ta4<,f',
  dialect: 'mysql',
  port: 3306
};

// Current database configuration from .env
const CURRENT_DB_CONFIG = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

const TARGET_DB_NAME = 'sprint_management_aws';

/**
 * Test connection to AWS RDS
 */
const testAWSConnection = async () => {
  let connection;
  try {
    logger.info('Testing connection to AWS RDS...');
    connection = await mysql.createConnection(AWS_DB_CONFIG);
    await connection.ping();
    logger.info('✅ AWS RDS connection successful');
    return true;
  } catch (error) {
    logger.error('❌ AWS RDS connection failed:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Create database on AWS RDS
 */
const createAWSDatabase = async () => {
  let connection;
  try {
    logger.info(`Creating database '${TARGET_DB_NAME}' on AWS RDS...`);
    
    // Connect without specifying database
    connection = await mysql.createConnection(AWS_DB_CONFIG);
    
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${TARGET_DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    logger.info(`✅ Database '${TARGET_DB_NAME}' created successfully`);
    
    return true;
  } catch (error) {
    logger.error('❌ Failed to create AWS database:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Create tables on AWS RDS using the migration script
 */
const createAWSTables = async () => {
  let connection;
  try {
    logger.info('Creating tables on AWS RDS...');
    
    // Connect to the specific database
    connection = await mysql.createConnection({
      ...AWS_DB_CONFIG,
      database: TARGET_DB_NAME
    });

    // Import the table creation logic from migrate.js
    const { createDatabase } = require('./migrate');
    
    // Override the database connection for AWS
    const originalEnv = {
      DB_HOST: process.env.DB_HOST,
      DB_PORT: process.env.DB_PORT,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME
    };

    // Temporarily set AWS config
    process.env.DB_HOST = AWS_DB_CONFIG.host;
    process.env.DB_PORT = AWS_DB_CONFIG.port;
    process.env.DB_USER = AWS_DB_CONFIG.user;
    process.env.DB_PASSWORD = AWS_DB_CONFIG.password;
    process.env.DB_NAME = TARGET_DB_NAME;

    // Create tables using existing migration logic
    await createDatabase();
    
    // Restore original environment
    Object.assign(process.env, originalEnv);
    
    logger.info('✅ Tables created successfully on AWS RDS');
    return true;
  } catch (error) {
    logger.error('❌ Failed to create tables on AWS RDS:', error.message);
    return false;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Get table dependency order for data migration
 */
const getTableOrder = () => {
  // Tables in dependency order (no foreign key dependencies first)
  return [
    'users',
    'email_otps',
    'email_verifications', 
    'refresh_tokens',
    'projects',
    'user_projects',
    'boards',
    'board_columns',
    'sprints',
    'issues',
    'issue_comments',
    'time_logs',
    'ai_requests',
    'user_activities',
    'team_member_capacity',
    'risk_heatmap_data',
    'team_member_skills'
  ];
};

/**
 * Export data from current database
 */
const exportCurrentData = async () => {
  let connection;
  try {
    logger.info('Exporting data from current database...');
    
    connection = await mysql.createConnection(CURRENT_DB_CONFIG);
    const tableOrder = getTableOrder();
    const exportData = {};

    for (const tableName of tableOrder) {
      try {
        const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
        exportData[tableName] = rows;
        logger.info(`📊 Exported ${rows.length} records from ${tableName}`);
      } catch (error) {
        logger.warn(`⚠️  Table ${tableName} not found or empty: ${error.message}`);
        exportData[tableName] = [];
      }
    }

    // Save export data to file for backup
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const exportFile = path.join(__dirname, '..', '..', 'database_dumps', `export_${timestamp}.json`);
    
    await fs.mkdir(path.dirname(exportFile), { recursive: true });
    await fs.writeFile(exportFile, JSON.stringify(exportData, null, 2));
    
    logger.info(`✅ Data exported successfully to ${exportFile}`);
    return exportData;
  } catch (error) {
    logger.error('❌ Failed to export current data:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Import data to AWS RDS
 */
const importDataToAWS = async (exportData) => {
  let connection;
  try {
    logger.info('Importing data to AWS RDS...');

    connection = await mysql.createConnection({
      ...AWS_DB_CONFIG,
      database: TARGET_DB_NAME
    });

    // Disable foreign key checks for import
    await connection.execute('SET FOREIGN_KEY_CHECKS=0');

    const tableOrder = getTableOrder();
    let totalRecords = 0;

    for (const tableName of tableOrder) {
      const tableData = exportData[tableName] || [];

      if (tableData.length === 0) {
        logger.info(`⏭️  Skipping ${tableName} (no data)`);
        continue;
      }

      try {
        // Clear existing data in target table
        await connection.execute(`DELETE FROM \`${tableName}\``);

        // Get column names from first record
        const columns = Object.keys(tableData[0]);

        // Prepare insert statement
        const placeholders = columns.map(() => '?').join(', ');
        const insertQuery = `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${placeholders})`;

        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize);

          for (const row of batch) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null || value === undefined) return null;
              if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
              if (typeof value === 'object') return JSON.stringify(value);
              return value;
            });

            await connection.execute(insertQuery, values);
          }
        }

        totalRecords += tableData.length;
        logger.info(`✅ Imported ${tableData.length} records to ${tableName}`);

      } catch (error) {
        logger.error(`❌ Failed to import data to ${tableName}:`, error.message);
        throw error;
      }
    }

    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS=1');

    logger.info(`🎉 Successfully imported ${totalRecords} total records to AWS RDS`);
    return true;
  } catch (error) {
    logger.error('❌ Failed to import data to AWS RDS:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Verify data migration by comparing record counts
 */
const verifyMigration = async () => {
  let sourceConnection, targetConnection;
  try {
    logger.info('Verifying data migration...');

    sourceConnection = await mysql.createConnection(CURRENT_DB_CONFIG);
    targetConnection = await mysql.createConnection({
      ...AWS_DB_CONFIG,
      database: TARGET_DB_NAME
    });

    const tableOrder = getTableOrder();
    const verification = {};
    let allMatch = true;

    for (const tableName of tableOrder) {
      try {
        const [sourceCount] = await sourceConnection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const [targetCount] = await targetConnection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);

        const sourceRecords = sourceCount[0].count;
        const targetRecords = targetCount[0].count;
        const match = sourceRecords === targetRecords;

        verification[tableName] = {
          source: sourceRecords,
          target: targetRecords,
          match: match
        };

        if (match) {
          logger.info(`✅ ${tableName}: ${sourceRecords} records (match)`);
        } else {
          logger.error(`❌ ${tableName}: source=${sourceRecords}, target=${targetRecords} (mismatch)`);
          allMatch = false;
        }
      } catch (error) {
        logger.warn(`⚠️  Could not verify ${tableName}: ${error.message}`);
        verification[tableName] = { error: error.message };
        allMatch = false;
      }
    }

    logger.info(allMatch ? '🎉 All tables verified successfully!' : '⚠️  Some tables have mismatches');
    return { success: allMatch, details: verification };
  } catch (error) {
    logger.error('❌ Failed to verify migration:', error.message);
    throw error;
  } finally {
    if (sourceConnection) await sourceConnection.end();
    if (targetConnection) await targetConnection.end();
  }
};

/**
 * Complete migration process
 */
const runFullMigration = async () => {
  try {
    logger.info('🚀 Starting full database migration to AWS RDS...');

    // Step 1: Test AWS connection
    const connectionOk = await testAWSConnection();
    if (!connectionOk) {
      throw new Error('Cannot connect to AWS RDS');
    }

    // Step 2: Create database
    await createAWSDatabase();

    // Step 3: Create tables
    await createAWSTables();

    // Step 4: Export current data
    const exportData = await exportCurrentData();

    // Step 5: Import data to AWS
    await importDataToAWS(exportData);

    // Step 6: Verify migration
    const verification = await verifyMigration();

    if (verification.success) {
      logger.info('🎉 Database migration completed successfully!');
      logger.info(`📍 New database: ${AWS_DB_CONFIG.host}/${TARGET_DB_NAME}`);
    } else {
      logger.warn('⚠️  Migration completed with some issues. Check verification details.');
    }

    return verification;
  } catch (error) {
    logger.error('💥 Migration failed:', error.message);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  runFullMigration()
    .then((result) => {
      logger.info('Migration process completed');
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      logger.error('Migration process failed:', error);
      process.exit(1);
    });
}

module.exports = {
  testAWSConnection,
  createAWSDatabase,
  createAWSTables,
  exportCurrentData,
  importDataToAWS,
  verifyMigration,
  runFullMigration,
  getTableOrder,
  AWS_DB_CONFIG,
  TARGET_DB_NAME
};
