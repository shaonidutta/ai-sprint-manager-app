const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../config/logger');
require('dotenv').config();

const getDependencyOrder = async (connection, dbName) => {
  // Get foreign key constraints
  const [constraints] = await connection.query(`
    SELECT 
      TABLE_NAME,
      REFERENCED_TABLE_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE 
      CONSTRAINT_SCHEMA = ? AND 
      REFERENCED_TABLE_NAME IS NOT NULL
  `, [dbName]);

  // Build dependency graph
  const graph = {};
  const [tables] = await connection.query('SHOW TABLES');
  tables.forEach(row => {
    const tableName = row[`Tables_in_${dbName}`];
    graph[tableName] = [];
  });

  constraints.forEach(constraint => {
    const { TABLE_NAME, REFERENCED_TABLE_NAME } = constraint;
    if (!graph[TABLE_NAME].includes(REFERENCED_TABLE_NAME)) {
      graph[TABLE_NAME].push(REFERENCED_TABLE_NAME);
    }
  });

  // Topological sort function
  const topologicalSort = (graph) => {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    const visit = (node) => {
      if (temp.has(node)) {
        throw new Error('Circular dependency detected');
      }
      if (!visited.has(node)) {
        temp.add(node);
        (graph[node] || []).forEach(dep => visit(dep));
        temp.delete(node);
        visited.add(node);
        order.unshift(node);
      }
    };

    Object.keys(graph).forEach(node => {
      if (!visited.has(node)) {
        visit(node);
      }
    });

    return order;
  };

  // Get sorted table order
  return topologicalSort(graph);
};

const dumpDatabase = async () => {
  let connection;
  try {
    // Connect to the database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    logger.info('Connected to database');

    // Get the database name
    const dbName = process.env.DB_NAME;

    // Get tables in dependency order
    const orderedTables = await getDependencyOrder(connection, dbName);
    logger.info('Table order for dump:', orderedTables);

    // Start building the SQL dump content
    let dumpContent = '';

    // Add create database statement
    dumpContent += `-- Create database\n`;
    dumpContent += `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    dumpContent += `USE \`${dbName}\`;\n\n`;

    // Add SET FOREIGN_KEY_CHECKS
    dumpContent += `-- Disable foreign key checks\n`;
    dumpContent += `SET FOREIGN_KEY_CHECKS=0;\n\n`;
    
    // For each table in the correct order
    for (const tableName of orderedTables) {
      logger.info(`Processing table: ${tableName}`);

      // Get create table statement
      const [createTableResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createTableStatement = createTableResult[0]['Create Table'];
      
      // Add drop table statement
      dumpContent += `-- Drop table if exists \`${tableName}\`\n`;
      dumpContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n\n`;
      
      // Add create table statement
      dumpContent += `-- Create table \`${tableName}\`\n`;
      dumpContent += `${createTableStatement};\n\n`;

      // Get all data from the table
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      
      if (rows.length > 0) {
        // Generate insert statements
        dumpContent += `-- Inserting data into \`${tableName}\`\n`;
        
        // Split inserts into chunks to handle large datasets
        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const columns = Object.keys(chunk[0]);
          
          dumpContent += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES\n`;
          
          const values = chunk.map(row => {
            const rowValues = columns.map(column => {
              const value = row[column];
              if (value === null) return 'NULL';
              if (typeof value === 'number') return value;
              if (typeof value === 'boolean') return value ? 1 : 0;
              if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
              return `'${value.toString().replace(/'/g, "''")}'`;
            });
            return `(${rowValues.join(', ')})`;
          }).join(',\n');
          
          dumpContent += values + ';\n\n';
        }
      }
    }

    // Re-enable foreign key checks
    dumpContent += `-- Re-enable foreign key checks\n`;
    dumpContent += `SET FOREIGN_KEY_CHECKS=1;\n`;

    // Write the dump to a file
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const dumpFileName = path.join(__dirname, '..', '..', 'database_dumps', `${dbName}_dump_${timestamp}.sql`);
    
    // Create the database_dumps directory if it doesn't exist
    await fs.mkdir(path.join(__dirname, '..', '..', 'database_dumps'), { recursive: true });
    
    // Write the dump file
    await fs.writeFile(dumpFileName, dumpContent, 'utf8');
    
    logger.info(`Database dump created successfully at: ${dumpFileName}`);
    
  } catch (error) {
    logger.error('Error creating database dump:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run the dump if called directly
if (require.main === module) {
  dumpDatabase()
    .then(() => {
      logger.info('Database dump completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Database dump failed:', error);
      process.exit(1);
    });
}

module.exports = { dumpDatabase }; 