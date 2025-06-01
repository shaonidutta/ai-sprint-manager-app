# AI Sprint Management App - API Integration Guide

## 📋 Overview

This guide provides comprehensive documentation for the AI Sprint Management App's API integration layer, including all services, error handling, and testing procedures.

## 🏗️ Architecture

### Backend API Structure
```
backend/
├── controllers/          # API endpoint handlers
├── routes/              # Route definitions
├── middleware/          # Authentication & validation
├── models/             # Database models
└── tests/              # API integration tests
```

### Frontend Service Structure
```
frontend/src/
├── services/           # API service layer
│   ├── auth/          # Authentication services
│   ├── project/       # Project management
│   ├── board/         # Board operations
│   ├── sprint/        # Sprint management
│   ├── issue/         # Issue tracking
│   ├── kanban/        # Kanban board features
│   ├── user/          # User management
│   └── ai/            # AI features
├── components/ai/     # AI React components
├── utils/            # Error handling utilities
└── api/              # API configuration
```

## 🔌 API Endpoints

### Authentication APIs (9 + 4 bonus)
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset
- `GET /api/v1/auth/me` - Get user profile
- `PUT /api/v1/auth/me` - Update user profile
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/upload-avatar` - Upload avatar
- `DELETE /api/v1/auth/delete-avatar` - Delete avatar

### Project Management APIs (9)
- `GET /api/v1/projects` - Get all projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects/:id` - Get project details
- `PUT /api/v1/projects/:id` - Update project
- `DELETE /api/v1/projects/:id` - Delete project
- `GET /api/v1/projects/:id/team` - Get team members
- `POST /api/v1/projects/:id/team` - Add team member
- `PUT /api/v1/projects/:id/team/:userId` - Update member role
- `DELETE /api/v1/projects/:id/team/:userId` - Remove team member

### Board Management APIs (5 + 5 bonus)
- `GET /api/v1/projects/:projectId/boards` - Get project boards
- `POST /api/v1/projects/:projectId/boards` - Create board
- `GET /api/v1/boards/:id` - Get board details
- `PUT /api/v1/boards/:id` - Update board
- `DELETE /api/v1/boards/:id` - Delete board
- `GET /api/v1/boards/:id/issues` - Get board issues
- `POST /api/v1/boards/:id/issues` - Create issue
- `GET /api/v1/boards/:id/sprints` - Get board sprints
- `POST /api/v1/boards/:id/sprints` - Create sprint
- `GET /api/v1/boards/:id/kanban` - Get kanban view

### Sprint Management APIs (8 + 2 bonus)
- `GET /api/v1/boards/:boardId/sprints` - Get sprints for board
- `POST /api/v1/boards/:boardId/sprints` - Create sprint
- `GET /api/v1/sprints/:id` - Get sprint details
- `PUT /api/v1/sprints/:id` - Update sprint
- `DELETE /api/v1/sprints/:id` - Delete sprint
- `POST /api/v1/sprints/:id/start` - Start sprint
- `POST /api/v1/sprints/:id/complete` - Complete sprint
- `GET /api/v1/sprints/:id/burndown` - Get burndown data
- `GET /api/v1/sprints/:id/issues` - Get sprint issues
- `GET /api/v1/sprints/:id/report` - Get sprint report

### Issue Management APIs (10 + 4 bonus)
- `GET /api/v1/boards/:boardId/issues` - Get board issues
- `POST /api/v1/boards/:boardId/issues` - Create issue
- `GET /api/v1/issues/:id` - Get issue details
- `PUT /api/v1/issues/:id` - Update issue
- `DELETE /api/v1/issues/:id` - Delete issue
- `POST /api/v1/issues/:id/comments` - Add comment
- `GET /api/v1/issues/:id/comments` - Get comments
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment
- `POST /api/v1/issues/:id/time-logs` - Log time
- `GET /api/v1/issues/:id/time-logs` - Get time logs
- `PUT /api/v1/time-logs/:id` - Update time log
- `DELETE /api/v1/time-logs/:id` - Delete time log
- `PATCH /api/v1/issues/:id/status` - Update issue status

### AI Features APIs (5)
- `GET /api/v1/ai/projects/:projectId/quota` - Get AI quota
- `POST /api/v1/ai/projects/:projectId/sprint-plan` - Sprint planning
- `POST /api/v1/ai/projects/:projectId/scope-creep` - Scope creep detection
- `POST /api/v1/ai/projects/:projectId/risk-assessment` - Risk assessment
- `POST /api/v1/ai/projects/:projectId/retrospective` - Sprint retrospective

### Kanban APIs (4 bonus)
- `GET /api/v1/kanban/board/:boardId` - Enhanced kanban view
- `PUT /api/v1/kanban/board/:boardId/issue-position` - Update issue position
- `GET /api/v1/kanban/board/:boardId/columns` - Get board columns
- `PUT /api/v1/kanban/board/:boardId/columns` - Update board columns

### Dashboard APIs (3 bonus)
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/dashboard/activity` - Recent activity
- `GET /api/v1/dashboard/ai-insights` - AI insights

### Activities APIs (4 bonus)
- `GET /api/v1/activities/user` - User activities
- `GET /api/v1/activities/user/stats` - User activity stats
- `GET /api/v1/activities/project/:projectId` - Project activities
- `POST /api/v1/activities/cleanup` - Cleanup old activities

## 🛠️ Frontend Services

### Service Usage Examples

#### Authentication Service
```javascript
import { authService } from '../services/auth/authService';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password'
});

// Get profile
const profile = await authService.getProfile();
```

#### Project Service
```javascript
import { projectService } from '../services/project/projectService';

// Get all projects
const projects = await projectService.getAll();

// Create project
const newProject = await projectService.create({
  name: 'My Project',
  description: 'Project description'
});

// Manage team
const members = await projectService.team.getMembers(projectId);
await projectService.team.addMember(projectId, { email: 'user@example.com', role: 'Developer' });
```

#### AI Service
```javascript
import { aiService } from '../services/ai/aiService';

// Check quota
const quota = await aiService.getQuota(projectId);

// Sprint planning
const plan = await aiService.sprintPlanning(projectId, {
  sprintGoal: 'Complete user authentication',
  teamCapacity: 40,
  sprintDuration: 2,
  backlogItems: ['Login page', 'Registration', 'Password reset']
});
```

## 🎨 AI Components

### Available Components

#### AIQuotaWidget
```jsx
import { AIQuotaWidget } from '../components/ai';

<AIQuotaWidget projectId={projectId} className="mb-4" />
```

#### SprintPlanningAI
```jsx
import { SprintPlanningAI } from '../components/ai';

<SprintPlanningAI 
  projectId={projectId}
  onPlanGenerated={(plan) => console.log(plan)}
/>
```

#### ScopeCreepDetection
```jsx
import { ScopeCreepDetection } from '../components/ai';

<ScopeCreepDetection 
  projectId={projectId}
  sprintId={sprintId}
/>
```

#### RiskAssessment
```jsx
import { RiskAssessment } from '../components/ai';

<RiskAssessment projectId={projectId} />
```

#### RetrospectiveAI
```jsx
import { RetrospectiveAI } from '../components/ai';

<RetrospectiveAI 
  projectId={projectId}
  sprintId={sprintId}
/>
```

#### AIInsightsDashboard
```jsx
import { AIInsightsDashboard } from '../components/ai';

<AIInsightsDashboard projectId={projectId} />
```

## 🚨 Error Handling

### Error Types

The application uses a centralized error handling system with specific error types:

- **APIError**: Server-side errors with status codes
- **ValidationError**: Client-side validation failures
- **NetworkError**: Connection and network issues

### Usage Example

```javascript
import { errorHandler, APIError } from '../utils/errorHandler';

try {
  const result = await apiCall();
} catch (error) {
  if (error instanceof APIError) {
    if (error.status === 401) {
      // Handle authentication error
      errorHandler.handleAuthError(error);
    } else if (error.code === 'AI_QUOTA_EXCEEDED') {
      // Handle quota error
      errorHandler.handleQuotaError(error);
    }
  }
  
  // Log error for monitoring
  errorHandler.logError(error, { context: 'component_name' });
  
  // Display user-friendly message
  const message = errorHandler.formatErrorMessage(error);
  showNotification(message);
}
```

### Retry Mechanism

```javascript
import { withRetry } from '../utils/errorHandler';

const result = await withRetry(
  () => apiService.someMethod(),
  3, // max retries
  1000 // delay in ms
);
```

## 🧪 Testing

### Running Backend Tests

```bash
# Install dependencies
cd backend
npm install

# Run integration tests
npm run test:integration

# Or use the test runner
node tests/run-integration-tests.js
```

### Running Frontend Tests

```bash
# Install dependencies
cd frontend
npm install

# Run service tests
npm run test

# Run specific test file
npm run test services.test.js
```

### Test Coverage

The test suite covers:
- ✅ All authentication flows
- ✅ CRUD operations for all entities
- ✅ AI feature integrations
- ✅ Error handling scenarios
- ✅ Token refresh mechanisms
- ✅ Service layer functionality

## 📊 API Status Summary

| **Category** | **PRD Required** | **Implemented** | **Status** |
|--------------|------------------|-----------------|------------|
| **Authentication** | 9 | 13 | ✅ Complete + Bonus |
| **Projects** | 9 | 9 | ✅ Complete |
| **Boards** | 5 | 10 | ✅ Complete + Bonus |
| **Sprints** | 8 | 10 | ✅ Complete + Bonus |
| **Issues** | 10 | 14 | ✅ Complete + Bonus |
| **AI Features** | 5 | 5 | ✅ Complete |
| **Kanban** | 0 | 4 | 🆕 Bonus |
| **Dashboard** | 0 | 3 | 🆕 Bonus |
| **Activities** | 0 | 4 | 🆕 Bonus |
| **TOTAL** | **45** | **72** | **✅ 100% + 60% Bonus** |

## 🚀 Next Steps

1. **UI Integration**: Integrate AI components into main application
2. **Performance Testing**: Load testing for API endpoints
3. **Monitoring**: Set up error monitoring and analytics
4. **Documentation**: API documentation with Swagger/OpenAPI

---

*Last Updated: December 2024*
*Status: API Integration Complete*
