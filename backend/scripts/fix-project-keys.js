require('dotenv').config();
const database = require('../config/database');
const logger = require('../config/logger');

const fixProjectKeys = async () => {
  try {
    await database.connect();
    logger.info('Connected to database for fixing project keys');

    // Check current projects and their keys
    const projects = await database.query('SELECT id, name, project_key FROM projects');
    logger.info('Current projects:', projects);

    for (const project of projects) {
      if (!project.project_key || project.project_key === 'undefined' || project.project_key === null) {
        // Generate a proper project key
        let baseKey = project.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 6);
        
        if (baseKey.length < 2) {
          baseKey = 'PROJ';
        }

        // Check if key exists and add number if needed
        let projectKey = baseKey;
        let counter = 1;
        
        while (true) {
          const existing = await database.query(
            'SELECT id FROM projects WHERE project_key = ? AND id != ?', 
            [projectKey, project.id]
          );
          
          if (existing.length === 0) {
            break;
          }
          
          projectKey = baseKey + counter;
          counter++;
          
          // Ensure key doesn't exceed 10 characters
          if (projectKey.length > 10) {
            baseKey = baseKey.substring(0, 8);
            projectKey = baseKey + counter;
          }
        }

        // Update the project with the new key
        await database.query(
          'UPDATE projects SET project_key = ? WHERE id = ?',
          [projectKey, project.id]
        );
        
        logger.info(`Updated project "${project.name}" (ID: ${project.id}) with key: ${projectKey}`);
      } else {
        logger.info(`Project "${project.name}" already has key: ${project.project_key}`);
      }
    }

    // Verify all projects now have keys
    const updatedProjects = await database.query('SELECT id, name, project_key FROM projects');
    logger.info('Updated projects:', updatedProjects);

    logger.info('Project key fix completed successfully');
  } catch (error) {
    logger.error('Project key fix failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

// Run the fix if called directly
if (require.main === module) {
  fixProjectKeys()
    .then(() => {
      logger.info('Fix completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixProjectKeys };
