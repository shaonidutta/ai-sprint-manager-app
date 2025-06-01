const axios = require('axios');
const { expect } = require('chai');

const BASE_URL = 'http://localhost:3000/api/v1';
let authToken = '';
let testProjectId = '';
let testBoardId = '';
let testSprintId = '';
let testIssueId = '';

describe('API Integration Tests', function() {
  this.timeout(30000);

  before(async function() {
    console.log('🚀 Starting API Integration Tests...');
    
    // Register and login test user
    const registerData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.${Date.now()}@example.com`,
      password: 'Password123!'
    };

    try {
      await axios.post(`${BASE_URL}/auth/register`, registerData);
      
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: registerData.email,
        password: registerData.password
      });
      
      authToken = loginResponse.data.data.accessToken;
      console.log('✅ Test user authenticated');
    } catch (error) {
      console.error('❌ Authentication failed:', error.response?.data || error.message);
      throw error;
    }
  });

  const authHeaders = () => ({
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  });

  describe('Authentication APIs', function() {
    it('should get user profile', async function() {
      const response = await axios.get(`${BASE_URL}/auth/me`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.user).to.have.property('email');
    });

    it('should update user profile', async function() {
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const response = await axios.put(`${BASE_URL}/auth/me`, updateData, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });

  describe('Project APIs', function() {
    it('should create a project', async function() {
      const projectData = {
        name: 'Test Project',
        description: 'A test project for API integration'
      };
      
      const response = await axios.post(`${BASE_URL}/projects`, projectData, { headers: authHeaders() });
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data.project).to.have.property('id');
      
      testProjectId = response.data.data.project.id;
      console.log(`✅ Created test project: ${testProjectId}`);
    });

    it('should get all projects', async function() {
      const response = await axios.get(`${BASE_URL}/projects`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.projects).to.be.an('array');
    });

    it('should get project by ID', async function() {
      const response = await axios.get(`${BASE_URL}/projects/${testProjectId}`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.project.id).to.equal(testProjectId);
    });

    it('should update project', async function() {
      const updateData = { name: 'Updated Test Project' };
      const response = await axios.put(`${BASE_URL}/projects/${testProjectId}`, updateData, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });

  describe('Board APIs', function() {
    it('should create a board', async function() {
      const boardData = {
        name: 'Test Board',
        description: 'A test board for API integration'
      };
      
      const response = await axios.post(`${BASE_URL}/projects/${testProjectId}/boards`, boardData, { headers: authHeaders() });
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data.board).to.have.property('id');
      
      testBoardId = response.data.data.board.id;
      console.log(`✅ Created test board: ${testBoardId}`);
    });

    it('should get project boards', async function() {
      const response = await axios.get(`${BASE_URL}/projects/${testProjectId}/boards`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.boards).to.be.an('array');
    });

    it('should get board by ID', async function() {
      const response = await axios.get(`${BASE_URL}/boards/${testBoardId}`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.board.id).to.equal(testBoardId);
    });
  });

  describe('Sprint APIs', function() {
    it('should create a sprint', async function() {
      const sprintData = {
        name: 'Test Sprint',
        goal: 'Test sprint goal',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const response = await axios.post(`${BASE_URL}/boards/${testBoardId}/sprints`, sprintData, { headers: authHeaders() });
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data.sprint).to.have.property('id');
      
      testSprintId = response.data.data.sprint.id;
      console.log(`✅ Created test sprint: ${testSprintId}`);
    });

    it('should get board sprints', async function() {
      const response = await axios.get(`${BASE_URL}/boards/${testBoardId}/sprints`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.sprints).to.be.an('array');
    });

    it('should get sprint by ID', async function() {
      const response = await axios.get(`${BASE_URL}/sprints/${testSprintId}`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.sprint.id).to.equal(testSprintId);
    });

    it('should start sprint', async function() {
      const response = await axios.post(`${BASE_URL}/sprints/${testSprintId}/start`, {}, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });

  describe('Issue APIs', function() {
    it('should create an issue', async function() {
      const issueData = {
        title: 'Test Issue',
        description: 'A test issue for API integration',
        issueType: 'Story',
        priority: 'P2',
        storyPoints: 5
      };
      
      const response = await axios.post(`${BASE_URL}/boards/${testBoardId}/issues`, issueData, { headers: authHeaders() });
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data.issue).to.have.property('id');
      
      testIssueId = response.data.data.issue.id;
      console.log(`✅ Created test issue: ${testIssueId}`);
    });

    it('should get board issues', async function() {
      const response = await axios.get(`${BASE_URL}/boards/${testBoardId}/issues`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.issues).to.be.an('array');
    });

    it('should get issue by ID', async function() {
      const response = await axios.get(`${BASE_URL}/issues/${testIssueId}`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.issue.id).to.equal(testIssueId);
    });

    it('should update issue status', async function() {
      const response = await axios.patch(`${BASE_URL}/issues/${testIssueId}/status`, 
        { status: 'In Progress' }, 
        { headers: authHeaders() }
      );
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });

    it('should add comment to issue', async function() {
      const response = await axios.post(`${BASE_URL}/issues/${testIssueId}/comments`, 
        { content: 'Test comment' }, 
        { headers: authHeaders() }
      );
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
    });

    it('should log time on issue', async function() {
      const response = await axios.post(`${BASE_URL}/issues/${testIssueId}/time-logs`, 
        { timeSpent: 2, description: 'Test work' }, 
        { headers: authHeaders() }
      );
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
    });
  });

  describe('AI APIs', function() {
    it('should get AI quota', async function() {
      const response = await axios.get(`${BASE_URL}/ai/projects/${testProjectId}/quota`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('requestsUsed');
    });

    it('should perform sprint planning', async function() {
      const planningData = {
        sprintGoal: 'Test sprint planning',
        teamCapacity: 40,
        sprintDuration: 2,
        backlogItems: ['Item 1', 'Item 2', 'Item 3']
      };
      
      const response = await axios.post(`${BASE_URL}/ai/projects/${testProjectId}/sprint-plan`, planningData, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });

  describe('Kanban APIs', function() {
    it('should get kanban view', async function() {
      const response = await axios.get(`${BASE_URL}/kanban/board/${testBoardId}`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });

    it('should get board columns', async function() {
      const response = await axios.get(`${BASE_URL}/kanban/board/${testBoardId}/columns`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
    });
  });

  describe('Dashboard APIs', function() {
    it('should get dashboard stats', async function() {
      const response = await axios.get(`${BASE_URL}/dashboard/stats`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('totalProjects');
    });

    it('should get dashboard activity', async function() {
      const response = await axios.get(`${BASE_URL}/dashboard/activity`, { headers: authHeaders() });
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
    });
  });

  after(async function() {
    // Cleanup: Delete test data
    try {
      if (testProjectId) {
        await axios.delete(`${BASE_URL}/projects/${testProjectId}`, { headers: authHeaders() });
        console.log('✅ Cleaned up test project');
      }
    } catch (error) {
      console.warn('⚠️ Cleanup warning:', error.message);
    }
    
    console.log('🎉 API Integration Tests completed!');
  });
});
