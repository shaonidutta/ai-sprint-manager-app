const request = require('supertest');
const app = require('../app');
const database = require('../config/database');

describe('AI Features Bug Fixes', () => {
  let authToken;
  let projectId;
  let sprintId;

  beforeAll(async () => {
    // Setup test data
    await database.connect();
    
    // Login to get auth token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.data.token;
    
    // Get first project
    const projectsResponse = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${authToken}`);
    
    projectId = projectsResponse.body.data.projects[0].id;
    
    // Get first sprint
    const sprintsResponse = await request(app)
      .get(`/api/v1/boards/1/sprints`)
      .set('Authorization', `Bearer ${authToken}`);
    
    if (sprintsResponse.body.data.sprints.length > 0) {
      sprintId = sprintsResponse.body.data.sprints[0].id;
    }
  });

  afterAll(async () => {
    await database.close();
  });

  describe('Scope Creep Detection Bug Fixes', () => {
    test('should handle scope creep detection gracefully when AI service fails', async () => {
      const response = await request(app)
        .post(`/api/v1/ai/projects/${projectId}/scope-creep`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sprintId: sprintId || 1,
          originalScope: 'Test original scope for bug fix validation'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.scope_analysis).toBeDefined();
      
      // Should have fallback handling
      if (response.body.data.scope_analysis.is_fallback) {
        expect(response.body.data.scope_analysis.fallback_reason).toBeDefined();
        expect(response.body.data.scope_analysis.recommendations).toBeDefined();
        expect(Array.isArray(response.body.data.scope_analysis.recommendations)).toBe(true);
      }
    });

    test('should handle missing sprint gracefully', async () => {
      const response = await request(app)
        .post(`/api/v1/ai/projects/${projectId}/scope-creep`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sprintId: 99999, // Non-existent sprint
          originalScope: 'Test scope'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Sprint not found');
    });
  });

  describe('Priority P4 Bug Fixes', () => {
    test('should handle P4 priority in AI sprint planning', async () => {
      const response = await request(app)
        .post(`/api/v1/ai/projects/${projectId}/sprint-creation-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          boardId: 1,
          startDate: '2024-01-15',
          endDate: '2024-01-29',
          totalStoryPoints: 40,
          tasksList: [
            'High priority critical bug fix',
            'Medium priority feature enhancement',
            'Low priority documentation update',
            'P4 priority minor UI improvement'
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.sprint_plan).toBeDefined();
      
      // Check if P4 priorities are handled correctly
      const sprintPlan = response.body.data.sprint_plan;
      if (sprintPlan.issues && Array.isArray(sprintPlan.issues)) {
        sprintPlan.issues.forEach(issue => {
          expect(['P1', 'P2', 'P3', 'P4']).toContain(issue.priority);
        });
      }
      
      // Should have fallback handling if AI fails
      if (sprintPlan.is_fallback) {
        expect(sprintPlan.fallback_reason).toBeDefined();
        expect(sprintPlan.manual_review_required).toBe(true);
      }
    });

    test('should validate P4 priority in sprint creation', async () => {
      const testSprintData = {
        board_id: 1,
        name: 'Test Sprint with P4 Issues',
        goal: 'Test P4 priority handling',
        start_date: '2024-01-15',
        end_date: '2024-01-29',
        capacity_story_points: 40,
        status: 'Active',
        created_by: 1,
        issues: [
          {
            board_id: 1,
            title: 'P4 Priority Test Issue',
            description: 'Testing P4 priority validation',
            issue_type: 'Story',
            status: 'To Do',
            priority: 'P4', // This should be accepted now
            story_points: 3,
            reporter_id: 1
          }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/ai/projects/${projectId}/create-sprint-from-plan`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(testSprintData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.issues).toBeDefined();
      expect(response.body.data.issues[0].priority).toBe('P4');
    });
  });

  describe('Error Handling Requirements', () => {
    test('should provide meaningful error messages without exposing internal errors', async () => {
      // Test with invalid project ID
      const response = await request(app)
        .post('/api/v1/ai/projects/99999/scope-creep')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sprintId: 1,
          originalScope: 'Test scope'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied to project');
      expect(response.body.error).not.toContain('database');
      expect(response.body.error).not.toContain('SQL');
    });

    test('should maintain application functionality when AI features fail', async () => {
      // Test that the application still works even if AI quota is exceeded
      const response = await request(app)
        .get(`/api/v1/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.project).toBeDefined();
    });

    test('should handle malformed AI requests gracefully', async () => {
      const response = await request(app)
        .post(`/api/v1/ai/projects/${projectId}/scope-creep`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Comprehensive Priority Testing', () => {
    test('should handle all priority levels (P1, P2, P3, P4) correctly', async () => {
      const priorities = ['P1', 'P2', 'P3', 'P4'];
      
      for (const priority of priorities) {
        const testData = {
          boardId: 1,
          startDate: '2024-01-15',
          endDate: '2024-01-29',
          totalStoryPoints: 20,
          tasksList: [`${priority} priority test task`]
        };

        const response = await request(app)
          .post(`/api/v1/ai/projects/${projectId}/sprint-creation-plan`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(testData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        
        const sprintPlan = response.body.data.sprint_plan;
        if (sprintPlan.issues && sprintPlan.issues.length > 0) {
          expect(['P1', 'P2', 'P3', 'P4']).toContain(sprintPlan.issues[0].priority);
        }
      }
    });
  });
});
