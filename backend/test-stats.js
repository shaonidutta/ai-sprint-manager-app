require('dotenv').config();
const Project = require('./models/Project');
const database = require('./config/database');

async function testProjectStats() {
  try {
    console.log('Starting test...');

    // Connect to database
    await database.connect();
    console.log('Database connected successfully');

    // Test with project ID 1 (from seed data)
    console.log('Finding project with ID 1...');
    const project = await Project.findById(1);
    if (!project) {
      console.log('Project not found');
      return;
    }

    console.log('Project found:', project.name);

    // Test the getStats method
    console.log('Getting project stats...');
    const stats = await project.getStats();
    console.log('Project stats:', JSON.stringify(stats, null, 2));

  } catch (error) {
    console.error('Error testing project stats:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testProjectStats();
