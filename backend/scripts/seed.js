require('dotenv').config();
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const logger = require('../config/logger');

const seedDatabase = async () => {
  try {
    await database.connect();
    logger.info('Connected to database for seeding');

    // Clear existing data (in reverse order of dependencies)
    await clearExistingData();

    // Seed data
    await seedUsers();
    await seedProjects();
    await seedUserProjects();
    await seedBoards();
    await seedSprints();
    await seedIssues();

    logger.info('Database seeding completed successfully');
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    await database.close();
  }
};

const clearExistingData = async () => {
  const tables = [
    'ai_requests',
    'time_logs',
    'issue_comments',
    'issues',
    'sprints',
    'boards',
    'user_projects',
    'projects',
    'email_verifications',
    'refresh_tokens',
    'users'
  ];

  for (const table of tables) {
    await database.query(`DELETE FROM ${table}`);
    await database.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
  }
  
  logger.info('Cleared existing data');
};

const seedUsers = async () => {
  const users = [
    {
      email: 'admin@sprintmanager.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      emailVerified: true
    },
    {
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      emailVerified: true
    },
    {
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      emailVerified: true
    },
    {
      email: 'mike.wilson@example.com',
      password: 'password123',
      firstName: 'Mike',
      lastName: 'Wilson',
      emailVerified: true
    },
    {
      email: 'sarah.johnson@example.com',
      password: 'password123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      emailVerified: false
    }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    
    await database.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, email_verified) 
       VALUES (?, ?, ?, ?, ?)`,
      [user.email, hashedPassword, user.firstName, user.lastName, user.emailVerified]
    );
  }

  logger.info(`Seeded ${users.length} users`);
};

const seedProjects = async () => {
  const projects = [
    {
      name: 'AI Sprint Management App',
      description: 'Main project for developing the AI-powered sprint management tool',
      projectKey: 'ASMA',
      ownerId: 1
    },
    {
      name: 'E-commerce Platform',
      description: 'Building a modern e-commerce platform with React and Node.js',
      projectKey: 'ECOM',
      ownerId: 2
    },
    {
      name: 'Mobile Banking App',
      description: 'Secure mobile banking application development',
      projectKey: 'MBA',
      ownerId: 3
    }
  ];

  for (const project of projects) {
    await database.query(
      `INSERT INTO projects (name, description, project_key, owner_id) 
       VALUES (?, ?, ?, ?)`,
      [project.name, project.description, project.projectKey, project.ownerId]
    );
  }

  logger.info(`Seeded ${projects.length} projects`);
};

const seedUserProjects = async () => {
  const userProjects = [
    { userId: 1, projectId: 1, role: 'Admin' },
    { userId: 2, projectId: 1, role: 'Project Manager' },
    { userId: 3, projectId: 1, role: 'Developer' },
    { userId: 4, projectId: 1, role: 'Developer' },
    { userId: 2, projectId: 2, role: 'Admin' },
    { userId: 3, projectId: 2, role: 'Developer' },
    { userId: 3, projectId: 3, role: 'Admin' },
    { userId: 4, projectId: 3, role: 'Developer' }
  ];

  for (const userProject of userProjects) {
    await database.query(
      `INSERT INTO user_projects (user_id, project_id, role) 
       VALUES (?, ?, ?)`,
      [userProject.userId, userProject.projectId, userProject.role]
    );
  }

  logger.info(`Seeded ${userProjects.length} user-project relationships`);
};

const seedBoards = async () => {
  const boards = [
    {
      projectId: 1,
      name: 'ASMA Development Board',
      description: 'Main development board for AI Sprint Management App',
      isDefault: true,
      createdBy: 1
    },
    {
      projectId: 2,
      name: 'E-commerce Main Board',
      description: 'Primary board for e-commerce platform development',
      isDefault: true,
      createdBy: 2
    },
    {
      projectId: 3,
      name: 'Banking App Board',
      description: 'Development board for mobile banking application',
      isDefault: true,
      createdBy: 3
    }
  ];

  for (const board of boards) {
    await database.query(
      `INSERT INTO boards (project_id, name, description, is_default, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [board.projectId, board.name, board.description, board.isDefault, board.createdBy]
    );
  }

  logger.info(`Seeded ${boards.length} boards`);
};

const seedSprints = async () => {
  const sprints = [
    {
      boardId: 1,
      name: 'Sprint 1 - Foundation',
      goal: 'Set up project foundation and basic authentication',
      startDate: '2024-01-01',
      endDate: '2024-01-14',
      capacityStoryPoints: 40,
      status: 'Active',
      createdBy: 1
    },
    {
      boardId: 1,
      name: 'Sprint 2 - Core Features',
      goal: 'Implement core project and board management features',
      startDate: '2024-01-15',
      endDate: '2024-01-28',
      capacityStoryPoints: 45,
      status: 'Planning',
      createdBy: 1
    }
  ];

  for (const sprint of sprints) {
    await database.query(
      `INSERT INTO sprints (board_id, name, goal, start_date, end_date, capacity_story_points, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sprint.boardId, sprint.name, sprint.goal, sprint.startDate, sprint.endDate, sprint.capacityStoryPoints, sprint.status, sprint.createdBy]
    );
  }

  logger.info(`Seeded ${sprints.length} sprints`);
};

const seedIssues = async () => {
  const issues = [
    {
      boardId: 1,
      sprintId: 1,
      title: 'Set up project structure and dependencies',
      description: 'Initialize Node.js backend and React frontend with all required dependencies',
      issueType: 'Task',
      status: 'Done',
      priority: 'P1',
      storyPoints: 5,
      originalEstimate: 8,
      timeSpent: 6,
      timeRemaining: 0,
      assigneeId: 2,
      reporterId: 1
    },
    {
      boardId: 1,
      sprintId: 1,
      title: 'Implement user authentication system',
      description: 'Create JWT-based authentication with registration, login, and email verification',
      issueType: 'Story',
      status: 'In Progress',
      priority: 'P1',
      storyPoints: 8,
      originalEstimate: 12,
      timeSpent: 4,
      timeRemaining: 8,
      assigneeId: 3,
      reporterId: 1
    },
    {
      boardId: 1,
      sprintId: 1,
      title: 'Design database schema',
      description: 'Create comprehensive database schema for all entities',
      issueType: 'Task',
      status: 'Done',
      priority: 'P2',
      storyPoints: 3,
      originalEstimate: 4,
      timeSpent: 4,
      timeRemaining: 0,
      assigneeId: 4,
      reporterId: 1
    },
    {
      boardId: 1,
      sprintId: 1,
      title: 'Set up CI/CD pipeline',
      description: 'Configure automated testing and deployment pipeline',
      issueType: 'Task',
      status: 'To Do',
      priority: 'P3',
      storyPoints: 5,
      originalEstimate: 6,
      timeSpent: 0,
      timeRemaining: 6,
      assigneeId: 2,
      reporterId: 1
    }
  ];

  for (const issue of issues) {
    await database.query(
      `INSERT INTO issues (board_id, sprint_id, title, description, issue_type, status, priority, story_points, original_estimate, time_spent, time_remaining, assignee_id, reporter_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [issue.boardId, issue.sprintId, issue.title, issue.description, issue.issueType, issue.status, issue.priority, issue.storyPoints, issue.originalEstimate, issue.timeSpent, issue.timeRemaining, issue.assigneeId, issue.reporterId]
    );
  }

  logger.info(`Seeded ${issues.length} issues`);
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
