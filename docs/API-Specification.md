# AI Sprint Management App - API Specification

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.sprintmanager.com/api/v1
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

## 1. Authentication Endpoints

### POST /auth/register
Register a new user
```json
// Request
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": false
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  },
  "message": "Registration successful. Please verify your email."
}
```

### POST /auth/login
User login
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true
    },
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### POST /auth/refresh
Refresh JWT token
```json
// Request
{
  "refreshToken": "refresh_token_here"
}

// Response
{
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### POST /auth/logout
Logout user (invalidate refresh token)
```json
// Request
{
  "refreshToken": "refresh_token_here"
}

// Response
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/verify-email
Verify email address
```json
// Request
{
  "token": "verification_token"
}

// Response
{
  "success": true,
  "message": "Email verified successfully"
}
```

### POST /auth/forgot-password
Request password reset
```json
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Password reset email sent"
}
```

### POST /auth/reset-password
Reset password with token
```json
// Request
{
  "token": "reset_token",
  "newPassword": "newpassword123"
}

// Response
{
  "success": true,
  "message": "Password reset successfully"
}
```

## 2. User Endpoints

### GET /users/profile
Get current user profile
```json
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /users/profile
Update user profile
```json
// Request
{
  "firstName": "John",
  "lastName": "Smith",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  },
  "message": "Profile updated successfully"
}
```

### PUT /users/change-password
Change user password
```json
// Request
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

// Response
{
  "success": true,
  "message": "Password changed successfully"
}
```

## 3. Project Endpoints

### GET /projects
Get user's projects
```json
// Query Parameters: ?page=1&limit=20&search=project

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Project",
      "description": "Project description",
      "projectKey": "MP",
      "role": "Admin",
      "owner": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "memberCount": 5,
      "boardCount": 2,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /projects
Create new project
```json
// Request
{
  "name": "New Project",
  "description": "Project description",
  "projectKey": "NP"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "name": "New Project",
    "description": "Project description",
    "projectKey": "NP",
    "ownerId": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Project created successfully"
}
```

### GET /projects/:id
Get project details
```json
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "My Project",
    "description": "Project description",
    "projectKey": "MP",
    "owner": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "members": [
      {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe",
        "role": "Admin",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "boards": [
      {
        "id": 1,
        "name": "Main Board",
        "isDefault": true
      }
    ],
    "aiRequestsCount": 15,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### PUT /projects/:id
Update project
```json
// Request
{
  "name": "Updated Project Name",
  "description": "Updated description"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Project Name",
    "description": "Updated description",
    "projectKey": "MP"
  },
  "message": "Project updated successfully"
}
```

### DELETE /projects/:id
Delete project (Admin only)
```json
// Response
{
  "success": true,
  "message": "Project deleted successfully"
}
```

## 4. Project Members Endpoints

### POST /projects/:id/members
Invite user to project
```json
// Request
{
  "email": "newuser@example.com",
  "role": "Developer"
}

// Response
{
  "success": true,
  "message": "User invited successfully"
}
```

### PUT /projects/:id/members/:userId
Update member role
```json
// Request
{
  "role": "Project Manager"
}

// Response
{
  "success": true,
  "message": "Member role updated successfully"
}
```

### DELETE /projects/:id/members/:userId
Remove member from project
```json
// Response
{
  "success": true,
  "message": "Member removed successfully"
}
```

## 5. Board Endpoints

### GET /projects/:projectId/boards
Get project boards
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Board",
      "description": "Main development board",
      "isDefault": true,
      "createdBy": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "issueCount": 25,
      "activeSprintCount": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /projects/:projectId/boards
Create new board
```json
// Request
{
  "name": "Feature Board",
  "description": "Board for feature development"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Feature Board",
    "description": "Board for feature development",
    "isDefault": false,
    "projectId": 1,
    "createdBy": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Board created successfully"
}
```

### GET /boards/:id
Get board details with issues
```json
// Query Parameters: ?sprint=active&assignee=1&priority=P1,P2

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Main Board",
    "description": "Main development board",
    "project": {
      "id": 1,
      "name": "My Project",
      "projectKey": "MP"
    },
    "activeSprint": {
      "id": 1,
      "name": "Sprint 1",
      "startDate": "2024-01-01",
      "endDate": "2024-01-14",
      "status": "Active"
    },
    "columns": [
      {
        "status": "To Do",
        "issues": [
          {
            "id": 1,
            "title": "Implement user authentication",
            "issueType": "Story",
            "priority": "P1",
            "storyPoints": 5,
            "assignee": {
              "id": 2,
              "firstName": "Jane",
              "lastName": "Smith",
              "avatarUrl": "https://example.com/avatar.jpg"
            },
            "reporter": {
              "id": 1,
              "firstName": "John",
              "lastName": "Doe"
            },
            "createdAt": "2024-01-01T00:00:00Z"
          }
        ]
      },
      {
        "status": "In Progress",
        "issues": []
      },
      {
        "status": "Done",
        "issues": []
      },
      {
        "status": "Blocked",
        "issues": []
      }
    ]
  }
}
```

## 6. Sprint Endpoints

### GET /boards/:boardId/sprints
Get board sprints
```json
// Query Parameters: ?status=Active,Planning&page=1&limit=10

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Sprint 1",
      "goal": "Implement core authentication features",
      "startDate": "2024-01-01",
      "endDate": "2024-01-14",
      "capacityStoryPoints": 40,
      "status": "Active",
      "issueCount": 8,
      "completedStoryPoints": 15,
      "totalStoryPoints": 35,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /boards/:boardId/sprints
Create new sprint
```json
// Request
{
  "name": "Sprint 2",
  "goal": "Implement project management features",
  "startDate": "2024-01-15",
  "endDate": "2024-01-28",
  "capacityStoryPoints": 45
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Sprint 2",
    "goal": "Implement project management features",
    "startDate": "2024-01-15",
    "endDate": "2024-01-28",
    "capacityStoryPoints": 45,
    "status": "Planning",
    "boardId": 1,
    "createdBy": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Sprint created successfully"
}
```

### PUT /sprints/:id/start
Start sprint
```json
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Active",
    "startDate": "2024-01-01"
  },
  "message": "Sprint started successfully"
}
```

### PUT /sprints/:id/complete
Complete sprint
```json
// Request
{
  "moveIncompleteIssuesTo": "backlog" // or "nextSprint"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "status": "Completed",
    "completedAt": "2024-01-14T00:00:00Z",
    "completedStoryPoints": 32,
    "totalStoryPoints": 35
  },
  "message": "Sprint completed successfully"
}
```

## 7. Issue Endpoints

### GET /boards/:boardId/issues
Get board issues
```json
// Query Parameters: ?sprint=1&assignee=2&priority=P1,P2&status=To Do,In Progress&search=auth&page=1&limit=20

// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Implement user authentication",
      "description": "Create JWT-based authentication system",
      "issueType": "Story",
      "status": "To Do",
      "priority": "P1",
      "storyPoints": 5,
      "originalEstimate": 8,
      "timeSpent": 0,
      "timeRemaining": 8,
      "assignee": {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "reporter": {
        "id": 1,
        "firstName": "John",
        "lastName": "Doe"
      },
      "sprint": {
        "id": 1,
        "name": "Sprint 1"
      },
      "commentCount": 3,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### POST /boards/:boardId/issues
Create new issue
```json
// Request
{
  "title": "Fix login validation bug",
  "description": "Email validation is not working properly",
  "issueType": "Bug",
  "priority": "P2",
  "storyPoints": 3,
  "originalEstimate": 4,
  "assigneeId": 2,
  "sprintId": 1
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "title": "Fix login validation bug",
    "description": "Email validation is not working properly",
    "issueType": "Bug",
    "status": "To Do",
    "priority": "P2",
    "storyPoints": 3,
    "originalEstimate": 4,
    "timeSpent": 0,
    "timeRemaining": 4,
    "assigneeId": 2,
    "reporterId": 1,
    "boardId": 1,
    "sprintId": 1,
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Issue created successfully"
}
```

### GET /issues/:id
Get issue details
```json
// Response
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Implement user authentication",
    "description": "Create JWT-based authentication system with email verification",
    "issueType": "Story",
    "status": "In Progress",
    "priority": "P1",
    "storyPoints": 5,
    "originalEstimate": 8,
    "timeSpent": 3,
    "timeRemaining": 5,
    "assignee": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com",
      "avatarUrl": "https://example.com/avatar.jpg"
    },
    "reporter": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe"
    },
    "board": {
      "id": 1,
      "name": "Main Board",
      "project": {
        "id": 1,
        "name": "My Project",
        "projectKey": "MP"
      }
    },
    "sprint": {
      "id": 1,
      "name": "Sprint 1",
      "status": "Active"
    },
    "comments": [
      {
        "id": 1,
        "comment": "Started working on this issue",
        "user": {
          "id": 2,
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "createdAt": "2024-01-02T00:00:00Z"
      }
    ],
    "timeLogs": [
      {
        "id": 1,
        "hoursLogged": 3,
        "description": "Initial setup and research",
        "user": {
          "id": 2,
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "loggedDate": "2024-01-02",
        "createdAt": "2024-01-02T00:00:00Z"
      }
    ],
    "blockedReason": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

### PUT /issues/:id
Update issue
```json
// Request
{
  "title": "Implement user authentication with 2FA",
  "description": "Updated description",
  "status": "In Progress",
  "priority": "P1",
  "storyPoints": 8,
  "assigneeId": 3,
  "sprintId": 2,
  "blockedReason": null
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Implement user authentication with 2FA",
    "status": "In Progress",
    "updatedAt": "2024-01-03T00:00:00Z"
  },
  "message": "Issue updated successfully"
}
```

### DELETE /issues/:id
Delete issue
```json
// Response
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

## 8. Issue Comments Endpoints

### POST /issues/:issueId/comments
Add comment to issue
```json
// Request
{
  "comment": "This is working as expected now"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "comment": "This is working as expected now",
    "issueId": 1,
    "userId": 1,
    "createdAt": "2024-01-03T00:00:00Z"
  },
  "message": "Comment added successfully"
}
```

### PUT /comments/:id
Update comment
```json
// Request
{
  "comment": "Updated comment text"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "comment": "Updated comment text",
    "updatedAt": "2024-01-03T00:00:00Z"
  },
  "message": "Comment updated successfully"
}
```

### DELETE /comments/:id
Delete comment
```json
// Response
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## 9. Time Tracking Endpoints

### POST /issues/:issueId/time-logs
Log time for issue
```json
// Request
{
  "hoursLogged": 4,
  "description": "Implemented authentication middleware",
  "loggedDate": "2024-01-03"
}

// Response
{
  "success": true,
  "data": {
    "id": 2,
    "hoursLogged": 4,
    "description": "Implemented authentication middleware",
    "issueId": 1,
    "userId": 2,
    "loggedDate": "2024-01-03",
    "createdAt": "2024-01-03T00:00:00Z"
  },
  "message": "Time logged successfully"
}
```

### GET /issues/:issueId/time-logs
Get time logs for issue
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "hoursLogged": 3,
      "description": "Initial setup and research",
      "user": {
        "id": 2,
        "firstName": "Jane",
        "lastName": "Smith"
      },
      "loggedDate": "2024-01-02",
      "createdAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

### PUT /time-logs/:id
Update time log
```json
// Request
{
  "hoursLogged": 5,
  "description": "Updated description"
}

// Response
{
  "success": true,
  "data": {
    "id": 1,
    "hoursLogged": 5,
    "description": "Updated description",
    "updatedAt": "2024-01-03T00:00:00Z"
  },
  "message": "Time log updated successfully"
}
```

### DELETE /time-logs/:id
Delete time log
```json
// Response
{
  "success": true,
  "message": "Time log deleted successfully"
}
```

## 10. AI Integration Endpoints

### POST /projects/:projectId/ai/sprint-planning
Get AI sprint planning suggestions
```json
// Request
{
  "sprintGoal": "Implement user authentication features",
  "teamCapacity": 40,
  "availableIssues": [1, 2, 3, 4, 5]
}

// Response
{
  "success": true,
  "data": {
    "suggestions": {
      "recommendedIssues": [1, 2, 3],
      "totalStoryPoints": 35,
      "reasoning": "Based on team capacity and issue complexity, these issues form a cohesive sprint focused on authentication.",
      "risks": [
        "Issue #1 has dependencies that might cause delays"
      ],
      "alternatives": [
        {
          "issues": [1, 2, 4],
          "storyPoints": 38,
          "reasoning": "Alternative focusing on core features first"
        }
      ]
    },
    "quotaUsed": 1,
    "quotaRemaining": 49
  },
  "message": "AI suggestions generated successfully"
}
```

### POST /projects/:projectId/ai/scope-creep-detection
Detect scope creep in current sprint
```json
// Request
{
  "sprintId": 1
}

// Response
{
  "success": true,
  "data": {
    "scopeCreepDetected": true,
    "analysis": {
      "originalStoryPoints": 35,
      "currentStoryPoints": 42,
      "addedIssues": [
        {
          "id": 6,
          "title": "Add password strength indicator",
          "storyPoints": 3,
          "addedDate": "2024-01-05"
        }
      ],
      "riskLevel": "Medium",
      "recommendations": [
        "Consider moving non-critical issues to next sprint",
        "Re-evaluate sprint goal alignment"
      ]
    },
    "quotaUsed": 1,
    "quotaRemaining": 48
  },
  "message": "Scope creep analysis completed"
}
```

### POST /projects/:projectId/ai/risk-assessment
Get sprint risk assessment
```json
// Request
{
  "sprintId": 1
}

// Response
{
  "success": true,
  "data": {
    "overallRisk": "Medium",
    "riskFactors": [
      {
        "type": "Timeline",
        "level": "High",
        "description": "Sprint is 60% complete with 70% of work remaining",
        "impact": "Sprint goals may not be achieved"
      },
      {
        "type": "Dependencies",
        "level": "Medium",
        "description": "2 issues have external dependencies",
        "impact": "Potential delays if dependencies are not resolved"
      }
    ],
    "recommendations": [
      "Focus on completing high-priority issues first",
      "Consider reducing sprint scope",
      "Schedule dependency resolution meetings"
    ],
    "quotaUsed": 1,
    "quotaRemaining": 47
  },
  "message": "Risk assessment completed"
}
```

### POST /projects/:projectId/ai/retrospective
Generate AI retrospective insights
```json
// Request
{
  "sprintId": 1
}

// Response
{
  "success": true,
  "data": {
    "insights": {
      "whatWentWell": [
        "Team completed authentication features ahead of schedule",
        "Good collaboration on complex issues"
      ],
      "whatCouldImprove": [
        "Better estimation needed for UI tasks",
        "More frequent communication on blockers"
      ],
      "actionItems": [
        "Implement story point calibration session",
        "Set up daily blocker check-ins"
      ],
      "metrics": {
        "velocityTrend": "Increasing",
        "burndownHealth": "Good",
        "teamSatisfaction": "High"
      }
    },
    "quotaUsed": 1,
    "quotaRemaining": 46
  },
  "message": "Retrospective insights generated"
}
```

### GET /projects/:projectId/ai/quota
Get AI quota status
```json
// Response
{
  "success": true,
  "data": {
    "quotaUsed": 15,
    "quotaLimit": 50,
    "quotaRemaining": 35,
    "resetDate": "2024-02-01",
    "daysUntilReset": 12
  }
}
```
