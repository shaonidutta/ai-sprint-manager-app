// Frontend Service Tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../services/auth/authService';
import { projectService } from '../services/project/projectService';
import { sprintService } from '../services/sprint/sprintService';
import { issueService } from '../services/issue/issueService';
import { aiService } from '../services/ai/aiService';
import { kanbanService } from '../services/kanban/kanbanService';

// Mock axios
vi.mock('../services/api/config/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn()
  }
}));

import api from '../services/api/config/axiosConfig';

describe('Frontend Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Auth Service', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            accessToken: 'mock-token',
            user: { id: 1, email: 'test@example.com' }
          }
        }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password'
      });
      
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password'
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should get user profile', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { user: { id: 1, email: 'test@example.com' } }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await authService.getProfile();
      
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Project Service', () => {
    it('should get all projects', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { projects: [{ id: 1, name: 'Test Project' }] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await projectService.getAll();
      
      expect(api.get).toHaveBeenCalledWith('/projects', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should create project', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { project: { id: 1, name: 'New Project' } }
        }
      };
      
      const projectData = { name: 'New Project', description: 'Test' };
      api.post.mockResolvedValue(mockResponse);
      
      const result = await projectService.create(projectData);
      
      expect(api.post).toHaveBeenCalledWith('/projects', projectData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get team members', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { members: [{ id: 1, name: 'John Doe' }] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await projectService.team.getMembers(1);
      
      expect(api.get).toHaveBeenCalledWith('/projects/1/team');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Sprint Service', () => {
    it('should get sprints by board', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { sprints: [{ id: 1, name: 'Sprint 1' }] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await sprintService.getByBoard(1);
      
      expect(api.get).toHaveBeenCalledWith('/boards/1/sprints', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should start sprint', async () => {
      const mockResponse = {
        data: { success: true, data: { sprint: { id: 1, status: 'Active' } } }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await sprintService.start(1);
      
      expect(api.post).toHaveBeenCalledWith('/sprints/1/start');
      expect(result).toEqual(mockResponse.data);
    });

    it('should get burndown data', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { burndown: { labels: [], data: [] } }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await sprintService.getBurndown(1);
      
      expect(api.get).toHaveBeenCalledWith('/sprints/1/burndown');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Issue Service', () => {
    it('should get issues by board', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { issues: [{ id: 1, title: 'Test Issue' }] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await issueService.getByBoard(1);
      
      expect(api.get).toHaveBeenCalledWith('/boards/1/issues', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update issue status', async () => {
      const mockResponse = {
        data: { success: true, data: { issue: { id: 1, status: 'Done' } } }
      };
      
      api.patch.mockResolvedValue(mockResponse);
      
      const result = await issueService.updateStatus(1, 'Done');
      
      expect(api.patch).toHaveBeenCalledWith('/issues/1/status', { status: 'Done' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should add comment', async () => {
      const mockResponse = {
        data: { success: true, data: { comment: { id: 1, content: 'Test comment' } } }
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await issueService.comments.create(1, 'Test comment');
      
      expect(api.post).toHaveBeenCalledWith('/issues/1/comments', { content: 'Test comment' });
      expect(result).toEqual(mockResponse.data);
    });

    it('should log time', async () => {
      const mockResponse = {
        data: { success: true, data: { timeLog: { id: 1, timeSpent: 2 } } }
      };
      
      const timeData = { timeSpent: 2, description: 'Work done' };
      api.post.mockResolvedValue(mockResponse);
      
      const result = await issueService.timeLogs.create(1, timeData);
      
      expect(api.post).toHaveBeenCalledWith('/issues/1/time-logs', timeData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('AI Service', () => {
    it('should get AI quota', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { requestsUsed: 5, resetDate: '2024-01-01' }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await aiService.getQuota(1);
      
      expect(api.get).toHaveBeenCalledWith('/ai/projects/1/quota');
      expect(result).toEqual(mockResponse.data);
    });

    it('should perform sprint planning', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { recommendations: ['Rec 1', 'Rec 2'] }
        }
      };
      
      const planningData = {
        sprintGoal: 'Test goal',
        teamCapacity: 40,
        sprintDuration: 2,
        backlogItems: ['Item 1']
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await aiService.sprintPlanning(1, planningData);
      
      expect(api.post).toHaveBeenCalledWith('/ai/projects/1/sprint-plan', planningData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should detect scope creep', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { creepDetected: true, creepPercentage: 15 }
        }
      };
      
      const creepData = {
        sprintId: 1,
        originalScope: 'Original scope',
        currentIssues: [{ id: 1, title: 'Issue 1' }]
      };
      
      api.post.mockResolvedValue(mockResponse);
      
      const result = await aiService.scopeCreepDetection(1, creepData);
      
      expect(api.post).toHaveBeenCalledWith('/ai/projects/1/scope-creep', creepData);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Kanban Service', () => {
    it('should get kanban view', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { columns: {}, issues: [] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await kanbanService.getKanbanView(1);
      
      expect(api.get).toHaveBeenCalledWith('/kanban/board/1', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should update issue position', async () => {
      const mockResponse = {
        data: { success: true, message: 'Position updated' }
      };
      
      const positionData = {
        issueId: 1,
        fromColumn: 'To Do',
        toColumn: 'In Progress',
        position: 0
      };
      
      api.put.mockResolvedValue(mockResponse);
      
      const result = await kanbanService.updateIssuePosition(1, positionData);
      
      expect(api.put).toHaveBeenCalledWith('/kanban/board/1/issue-position', positionData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should get board columns', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: { columns: [{ id: 1, name: 'To Do' }] }
        }
      };
      
      api.get.mockResolvedValue(mockResponse);
      
      const result = await kanbanService.getBoardColumns(1);
      
      expect(api.get).toHaveBeenCalledWith('/kanban/board/1/columns');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
