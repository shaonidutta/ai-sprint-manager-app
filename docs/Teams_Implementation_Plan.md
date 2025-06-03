# Teams Functionality Implementation Plan

## Executive Summary

This document provides a comprehensive analysis and implementation plan for adding Teams functionality to the Sprint2 project management application. The analysis reveals that **significant team functionality already exists** in the current codebase, primarily focused on project-based team management. The implementation plan focuses on enhancing and extending this existing functionality rather than building from scratch.

## Current State Analysis

### Existing Team Functionality
The application already has substantial team management capabilities:

1. **Backend Infrastructure**:
   - `teamController.js` with full CRUD operations
   - Project-based team member management
   - Role-based access control (Admin, Project Manager, Developer)
   - Email invitation system
   - Team member capacity tracking

2. **Database Schema**:
   - `user_projects` table for team membership
   - `team_member_capacity` table for sprint capacity
   - `team_member_skills` table for skill tracking
   - Proper foreign key relationships

3. **Frontend Components**:
   - `TeamsPage.jsx` (basic implementation)
   - `ProjectTeamPage.jsx` (full project team management)
   - Team-related API services and endpoints

### Current Architecture Patterns
- **Project-centric team management**: Teams are managed within project contexts
- **Role-based permissions**: Three-tier role system
- **RESTful API design**: Consistent endpoint patterns
- **Modern React architecture**: Hooks, context, and component composition

---

# Phase 1: Database Schema Analysis & Documentation

## Current Database Schema

### Existing Team-Related Tables

#### 1. `user_projects` Table (Team Membership)
```sql
CREATE TABLE user_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  role ENUM('Admin', 'Project Manager', 'Developer') NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_active_user_project (user_id, project_id, deleted_at)
);
```

#### 2. `team_member_capacity` Table
```sql
CREATE TABLE team_member_capacity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  sprint_id INT NOT NULL,
  available_hours DECIMAL(5,2) DEFAULT 40.0,
  capacity_percentage DECIMAL(5,2) DEFAULT 100.0,
  story_points_capacity INT DEFAULT 10,
  skill_tags JSON,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3. `team_member_skills` Table
```sql
CREATE TABLE team_member_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  proficiency_level ENUM('Beginner', 'Intermediate', 'Advanced', 'Expert') NOT NULL,
  years_experience DECIMAL(3,1) DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Proposed Database Schema Enhancements

### Option A: Extend Current Project-Based Model (Recommended)
**Rationale**: Minimal changes, leverages existing infrastructure

**Enhancements Needed**:
1. Add `team_name` and `team_description` fields to projects table
2. Add team visibility settings
3. Enhance user profile with team-related fields

```sql
-- Extend projects table for team functionality
ALTER TABLE projects ADD COLUMN team_name VARCHAR(255) NULL;
ALTER TABLE projects ADD COLUMN team_description TEXT NULL;
ALTER TABLE projects ADD COLUMN team_visibility ENUM('Private', 'Organization', 'Public') DEFAULT 'Private';
ALTER TABLE projects ADD COLUMN team_avatar_url VARCHAR(500) NULL;

-- Extend user_projects for enhanced team roles
ALTER TABLE user_projects ADD COLUMN team_title VARCHAR(100) NULL;
ALTER TABLE user_projects ADD COLUMN team_bio TEXT NULL;
ALTER TABLE user_projects ADD COLUMN joined_at DATETIME DEFAULT CURRENT_TIMESTAMP;
```

### Option B: Dedicated Teams Model (Alternative)
**Rationale**: More flexible, supports cross-project teams

```sql
-- New teams table
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  team_key VARCHAR(10) UNIQUE NOT NULL,
  owner_id INT NOT NULL,
  avatar_url VARCHAR(500),
  visibility ENUM('Private', 'Organization', 'Public') DEFAULT 'Private',
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Team membership junction table
CREATE TABLE team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('Owner', 'Admin', 'Member') NOT NULL,
  title VARCHAR(100) NULL,
  bio TEXT NULL,
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_user (team_id, user_id)
);

-- Link teams to projects
CREATE TABLE team_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  project_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_project (team_id, project_id)
);
```

## Recommended Approach: Option A (Extended Project-Based)

**Benefits**:
- Minimal database changes
- Leverages existing codebase
- Maintains current user workflows
- Faster implementation
- Lower risk of breaking changes

**Implementation Steps**:
1. Create migration script for table alterations
2. Update existing models to support new fields
3. Maintain backward compatibility
4. Gradual feature rollout

---

# Phase 2: Backend Implementation Analysis

## Current Backend Structure Analysis

### Existing Controllers
- ✅ `teamController.js` - Full team management for projects
- ✅ `projectController.js` - Project CRUD with team integration
- ✅ `authController.js` - User authentication
- ✅ `dashboardController.js` - Statistics and insights

### Existing Models
- ✅ `User.js` - User management with team methods
- ✅ `Project.js` - Project model with team member methods
- ✅ `TeamMemberCapacity.js` - Sprint capacity management
- ❌ `Team.js` - **MISSING** (needs creation for enhanced functionality)

### Current API Endpoints (Already Implemented)
```
GET    /api/v1/projects/:id/team           # Get team members
POST   /api/v1/projects/:id/team           # Invite team member  
PUT    /api/v1/projects/:id/team/:user_id  # Update member role
DELETE /api/v1/projects/:id/team/:user_id  # Remove team member
```

## Required Backend Enhancements

### 1. New Team Model (`backend/models/Team.js`)
**File Path**: `backend/models/Team.js`

**Key Methods Needed**:
```javascript
class Team {
  // Static methods
  static async create(teamData)
  static async findById(id)
  static async findByUserId(userId)
  static async search(query, filters)
  
  // Instance methods
  async addMember(userId, role)
  async removeMember(userId)
  async updateMemberRole(userId, role)
  async getMembers()
  async getProjects()
  async updateSettings(settings)
}
```

### 2. Enhanced Team Controller
**File Path**: `backend/controllers/teamController.js` (extend existing)

**New Methods Needed**:
```javascript
// Global team management (beyond project scope)
const getAllTeams = async (req, res, next) => { /* ... */ }
const createTeam = async (req, res, next) => { /* ... */ }
const updateTeam = async (req, res, next) => { /* ... */ }
const deleteTeam = async (req, res, next) => { /* ... */ }
const getTeamById = async (req, res, next) => { /* ... */ }
const searchTeams = async (req, res, next) => { /* ... */ }
```

### 3. New API Routes
**File Path**: `backend/routes/teams.js` (new file)

**Required Endpoints**:
```javascript
// Global team management
GET    /api/v1/teams                    # List user's teams
POST   /api/v1/teams                    # Create new team
GET    /api/v1/teams/:id                # Get team details
PUT    /api/v1/teams/:id                # Update team
DELETE /api/v1/teams/:id                # Delete team

// Team member management
GET    /api/v1/teams/:id/members        # Get team members
POST   /api/v1/teams/:id/members        # Add team member
PUT    /api/v1/teams/:id/members/:userId # Update member
DELETE /api/v1/teams/:id/members/:userId # Remove member

// Team projects
GET    /api/v1/teams/:id/projects       # Get team projects
POST   /api/v1/teams/:id/projects       # Link project to team
DELETE /api/v1/teams/:id/projects/:projectId # Unlink project
```

### 4. Database Migration Script
**File Path**: `backend/scripts/add-teams-functionality.js`

### 5. Enhanced Validators
**File Path**: `backend/validators/teamValidator.js` (new file)

**Validation Schemas**:
- Team creation/update validation
- Member management validation
- Search and filter validation

### 6. Server Configuration Update
**File Path**: `backend/server.js`

**Required Changes**:
```javascript
// Add team routes
const teamRoutes = require('./routes/teams');
app.use('/api/v1/teams', teamRoutes);
```

## Implementation Priority

### High Priority (Core Functionality)
1. Database migration script
2. Team model creation
3. Basic CRUD endpoints for teams
4. Team member management endpoints

### Medium Priority (Enhanced Features)
1. Team search and filtering
2. Team statistics and insights
3. Team project linking
4. Enhanced permissions

### Low Priority (Advanced Features)
1. Team templates
2. Team analytics
3. Cross-team collaboration features
4. Team performance metrics

---

# Phase 3: Frontend Implementation Analysis

## Current Frontend Structure Analysis

### Existing Components
- ✅ `TeamsPage.jsx` - Basic teams page (needs enhancement)
- ✅ `ProjectTeamPage.jsx` - Project team management
- ✅ `Sidebar.jsx` - Navigation with Teams button
- ✅ Team-related API services in `api/index.js`

### Current Navigation Structure
The Teams button already exists in the sidebar navigation:
```javascript
// frontend/src/components/Layout/Sidebar.jsx
const navItems = [
  { id: 'teams', path: '/teams', icon: TeamsIcon, label: 'Teams' },
  // ... other items
];
```

### Current Routing
Teams route already configured:
```javascript
// frontend/src/routes/index.jsx
{
  path: '/teams',
  element: <TeamsPage />,
}
```

## Required Frontend Enhancements

### 1. Enhanced TeamsPage Component
**File Path**: `frontend/src/pages/teams/TeamsPage.jsx` (enhance existing)

**Current State**: Basic placeholder with mock data
**Required Enhancements**:
- Real API integration
- Team creation modal
- Team search and filtering
- Team cards with member avatars
- Team management actions

### 2. New Team Management Components

#### Team Detail Page
**File Path**: `frontend/src/pages/teams/TeamDetailPage.jsx` (new)
**Features**:
- Team overview and statistics
- Member management interface
- Project associations
- Team settings

#### Team Creation Modal
**File Path**: `frontend/src/components/teams/CreateTeamModal.jsx` (new)
**Features**:
- Team name and description
- Initial member invitations
- Visibility settings
- Team avatar upload

#### Team Member Card
**File Path**: `frontend/src/components/teams/TeamMemberCard.jsx` (new)
**Features**:
- Member profile display
- Role indicators
- Quick actions (message, view profile)
- Skill tags

### 3. Enhanced API Services
**File Path**: `frontend/src/api/index.js` (extend existing)

**New Team Endpoints**:
```javascript
teams: {
  getAll: (params) => axiosInstance.get('/teams', { params }),
  getById: (id) => axiosInstance.get(`/teams/${id}`),
  create: (data) => axiosInstance.post('/teams', data),
  update: (id, data) => axiosInstance.put(`/teams/${id}`, data),
  delete: (id) => axiosInstance.delete(`/teams/${id}`),
  
  // Member management
  getMembers: (teamId) => axiosInstance.get(`/teams/${teamId}/members`),
  addMember: (teamId, data) => axiosInstance.post(`/teams/${teamId}/members`, data),
  updateMember: (teamId, userId, data) => axiosInstance.put(`/teams/${teamId}/members/${userId}`, data),
  removeMember: (teamId, userId) => axiosInstance.delete(`/teams/${teamId}/members/${userId}`),
  
  // Project associations
  getProjects: (teamId) => axiosInstance.get(`/teams/${teamId}/projects`),
  linkProject: (teamId, projectId) => axiosInstance.post(`/teams/${teamId}/projects`, { projectId }),
  unlinkProject: (teamId, projectId) => axiosInstance.delete(`/teams/${teamId}/projects/${projectId}`)
}
```

### 4. New Route Definitions
**File Path**: `frontend/src/routes/index.jsx` (extend existing)

**Additional Routes**:
```javascript
{
  path: '/teams/:id',
  element: <TeamDetailPage />,
},
{
  path: '/teams/:id/settings',
  element: <TeamSettingsPage />,
},
{
  path: '/teams/:id/members',
  element: <TeamMembersPage />,
}
```

### 5. State Management Enhancements
**File Path**: `frontend/src/context/TeamsContext.jsx` (new)

**Context Features**:
- Team list management
- Current team state
- Member management state
- Team creation/update state

### 6. UI/UX Integration Points

#### Sidebar Enhancement
**Current**: Teams button exists but leads to basic page
**Enhancement**: Add team count badge, recent teams dropdown

#### Project Integration
**Enhancement**: Show team association in project cards
**Location**: `frontend/src/components/projects/ProjectCard.jsx`

#### Dashboard Integration
**Enhancement**: Team statistics and recent activity
**Location**: `frontend/src/pages/Dashboard.jsx`

## Implementation Approach

### Phase 3A: Core Team Management (Week 1-2)
1. Enhance `TeamsPage.jsx` with real API integration
2. Create `TeamDetailPage.jsx` component
3. Implement team CRUD operations
4. Add team creation modal

### Phase 3B: Member Management (Week 3)
1. Enhanced member management interface
2. Member invitation system
3. Role management UI
4. Member profile integration

### Phase 3C: Project Integration (Week 4)
1. Team-project association UI
2. Project team display enhancements
3. Cross-navigation between teams and projects
4. Dashboard team widgets

---

# Phase 4: Implementation Priority & Dependencies

## Implementation Order

### Stage 1: Foundation (Week 1)
**Dependencies**: None
**Risk Level**: Low

1. **Database Migration**
   - Create migration script for table alterations
   - Test migration on development database
   - Backup and rollback procedures

2. **Backend Model Enhancement**
   - Extend existing models with new fields
   - Maintain backward compatibility
   - Unit tests for model methods

### Stage 2: Backend API (Week 2)
**Dependencies**: Stage 1 complete
**Risk Level**: Medium

1. **Enhanced Team Controller**
   - Extend existing `teamController.js`
   - Add global team management methods
   - Implement proper error handling

2. **New API Routes**
   - Create `routes/teams.js`
   - Add validation middleware
   - Update server configuration

3. **API Testing**
   - Integration tests for new endpoints
   - Postman collection updates
   - API documentation

### Stage 3: Frontend Core (Week 3)
**Dependencies**: Stage 2 complete
**Risk Level**: Medium

1. **Enhanced TeamsPage**
   - Replace mock data with real API calls
   - Implement team listing and search
   - Add loading and error states

2. **Team Creation Flow**
   - Create team modal component
   - Form validation and submission
   - Success/error feedback

3. **API Service Integration**
   - Extend frontend API services
   - Error handling and retry logic
   - Loading state management

### Stage 4: Advanced Features (Week 4)
**Dependencies**: Stage 3 complete
**Risk Level**: Low

1. **Team Detail Management**
   - Team detail page
   - Member management interface
   - Settings and configuration

2. **Project Integration**
   - Team-project associations
   - Enhanced project team displays
   - Cross-navigation improvements

## Risk Assessment & Mitigation

### High Risk Areas

#### 1. Database Migration
**Risk**: Data loss or corruption during migration
**Mitigation**: 
- Comprehensive backup procedures
- Test migrations on staging environment
- Rollback scripts prepared
- Gradual rollout with feature flags

#### 2. API Backward Compatibility
**Risk**: Breaking existing project team functionality
**Mitigation**:
- Maintain existing API endpoints
- Extensive regression testing
- Gradual deprecation of old patterns
- Version-controlled API changes

#### 3. Frontend State Management
**Risk**: Complex state synchronization between teams and projects
**Mitigation**:
- Clear separation of concerns
- Centralized state management
- Comprehensive error boundaries
- Progressive enhancement approach

### Medium Risk Areas

#### 1. Performance Impact
**Risk**: Additional database queries affecting performance
**Mitigation**:
- Database query optimization
- Proper indexing strategy
- Caching implementation
- Performance monitoring

#### 2. User Experience Disruption
**Risk**: Changes confusing existing users
**Mitigation**:
- Gradual feature introduction
- User onboarding flows
- Comprehensive documentation
- Feedback collection system

## Testing Strategy

### Backend Testing
1. **Unit Tests**: Model methods and controller functions
2. **Integration Tests**: API endpoint functionality
3. **Database Tests**: Migration and data integrity
4. **Performance Tests**: Query optimization validation

### Frontend Testing
1. **Component Tests**: Individual component functionality
2. **Integration Tests**: API service integration
3. **E2E Tests**: Complete user workflows
4. **Accessibility Tests**: WCAG compliance

### User Acceptance Testing
1. **Alpha Testing**: Internal team validation
2. **Beta Testing**: Selected user group feedback
3. **Performance Testing**: Load and stress testing
4. **Security Testing**: Authentication and authorization

## Deployment Strategy

### Development Environment
- Feature branch development
- Continuous integration testing
- Automated deployment to staging

### Staging Environment
- Full feature testing
- Performance validation
- User acceptance testing
- Security audit

### Production Deployment
- Blue-green deployment strategy
- Feature flag controlled rollout
- Real-time monitoring
- Immediate rollback capability

## Success Metrics

### Technical Metrics
- API response times < 200ms
- Database query performance maintained
- Zero critical bugs in production
- 99.9% uptime during rollout

### User Experience Metrics
- Team creation completion rate > 90%
- User adoption rate > 70% within 30 days
- Support ticket reduction for team management
- User satisfaction score > 4.5/5

### Business Metrics
- Increased user engagement
- Improved collaboration efficiency
- Reduced project setup time
- Enhanced user retention

---

---

# Implementation Examples

## Phase 1: Database Migration Example

### Migration Script (`backend/scripts/add-teams-functionality.js`)
```javascript
require('dotenv').config();
const mysql = require('mysql2/promise');
const logger = require('../config/logger');

const addTeamsfunctionality = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    logger.info('Starting teams functionality migration...');

    // Add team-related fields to projects table
    const alterProjectsTable = `
      ALTER TABLE projects
      ADD COLUMN team_name VARCHAR(255) NULL AFTER description,
      ADD COLUMN team_description TEXT NULL AFTER team_name,
      ADD COLUMN team_visibility ENUM('Private', 'Organization', 'Public') DEFAULT 'Private' AFTER team_description,
      ADD COLUMN team_avatar_url VARCHAR(500) NULL AFTER team_visibility
    `;

    await connection.execute(alterProjectsTable);
    logger.info('Projects table updated with team fields');

    // Add enhanced fields to user_projects table
    const alterUserProjectsTable = `
      ALTER TABLE user_projects
      ADD COLUMN team_title VARCHAR(100) NULL AFTER role,
      ADD COLUMN team_bio TEXT NULL AFTER team_title,
      ADD COLUMN joined_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER team_bio
    `;

    await connection.execute(alterUserProjectsTable);
    logger.info('User_projects table updated with enhanced team fields');

    // Create indexes for better performance
    const createIndexes = [
      'CREATE INDEX idx_team_visibility ON projects(team_visibility)',
      'CREATE INDEX idx_joined_at ON user_projects(joined_at)'
    ];

    for (const indexSQL of createIndexes) {
      await connection.execute(indexSQL);
    }
    logger.info('Team-related indexes created');

    logger.info('Teams functionality migration completed successfully');
  } catch (error) {
    logger.error('Teams functionality migration failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

if (require.main === module) {
  addTeamsfunction()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addTeamsfunction };
```

## Phase 2: Backend Implementation Examples

### Enhanced Team Model (`backend/models/Team.js`)
```javascript
const database = require('../config/database');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class Team {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || data.team_name || null;
    this.description = data.description || data.team_description || null;
    this.project_id = data.project_id || null;
    this.visibility = data.visibility || data.team_visibility || 'Private';
    this.avatar_url = data.avatar_url || data.team_avatar_url || null;
    this.owner_id = data.owner_id || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  // Validation
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Team name is required');
    }

    if (this.name && this.name.length > 255) {
      errors.push('Team name must be less than 255 characters');
    }

    const validVisibilities = ['Private', 'Organization', 'Public'];
    if (!validVisibilities.includes(this.visibility)) {
      errors.push('Invalid visibility. Must be one of: ' + validVisibilities.join(', '));
    }

    return errors;
  }

  // Static methods
  static async findByProjectId(projectId) {
    try {
      const query = `
        SELECT p.id, p.name, p.team_name as name, p.team_description as description,
               p.team_visibility as visibility, p.team_avatar_url as avatar_url,
               p.owner_id, p.created_at, p.updated_at,
               COUNT(up.user_id) as member_count
        FROM projects p
        LEFT JOIN user_projects up ON p.id = up.project_id AND up.deleted_at IS NULL
        WHERE p.id = ? AND p.is_active = true
        GROUP BY p.id
      `;

      const rows = await database.query(query, [projectId]);
      return rows.length > 0 ? new Team(rows[0]) : null;
    } catch (error) {
      logger.error('Error finding team by project ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const query = `
        SELECT p.id, p.name, p.team_name as name, p.team_description as description,
               p.team_visibility as visibility, p.team_avatar_url as avatar_url,
               p.owner_id, p.created_at, p.updated_at,
               up.role, up.team_title, up.joined_at,
               COUNT(up2.user_id) as member_count
        FROM projects p
        INNER JOIN user_projects up ON p.id = up.project_id
        LEFT JOIN user_projects up2 ON p.id = up2.project_id AND up2.deleted_at IS NULL
        WHERE up.user_id = ? AND up.deleted_at IS NULL AND p.is_active = true
        GROUP BY p.id, up.role, up.team_title, up.joined_at
        ORDER BY up.joined_at DESC
      `;

      const rows = await database.query(query, [userId]);
      return rows.map(row => {
        const team = new Team(row);
        team.user_role = row.role;
        team.user_title = row.team_title;
        team.user_joined_at = row.joined_at;
        team.member_count = row.member_count;
        return team;
      });
    } catch (error) {
      logger.error('Error finding teams by user ID:', error);
      throw error;
    }
  }

  static async updateTeamInfo(projectId, teamData) {
    try {
      const team = new Team(teamData);
      const errors = team.validate();

      if (errors.length > 0) {
        throw new ValidationError(errors.join(', '));
      }

      const query = `
        UPDATE projects SET
          team_name = ?, team_description = ?, team_visibility = ?,
          team_avatar_url = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const values = [
        team.name.trim(),
        team.description ? team.description.trim() : null,
        team.visibility,
        team.avatar_url,
        projectId
      ];

      await database.query(query, values);
      return await Team.findByProjectId(projectId);
    } catch (error) {
      logger.error('Error updating team info:', error);
      throw error;
    }
  }

  async getMembers() {
    try {
      const query = `
        SELECT u.id, u.email, u.first_name, u.last_name, u.avatar_url,
               up.role, up.team_title, up.team_bio, up.joined_at,
               up.created_at as member_since
        FROM users u
        INNER JOIN user_projects up ON u.id = up.user_id
        WHERE up.project_id = ? AND up.deleted_at IS NULL AND u.is_active = true
        ORDER BY up.created_at ASC
      `;

      const rows = await database.query(query, [this.project_id]);
      return rows.map(row => ({
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
        role: row.role,
        team_title: row.team_title,
        team_bio: row.team_bio,
        joined_at: row.joined_at,
        member_since: row.member_since
      }));
    } catch (error) {
      logger.error('Error getting team members:', error);
      throw error;
    }
  }

  async updateMemberProfile(userId, profileData) {
    try {
      const query = `
        UPDATE user_projects SET
          team_title = ?, team_bio = ?, updated_at = NOW()
        WHERE project_id = ? AND user_id = ? AND deleted_at IS NULL
      `;

      const values = [
        profileData.team_title || null,
        profileData.team_bio || null,
        this.project_id,
        userId
      ];

      await database.query(query, values);
      return true;
    } catch (error) {
      logger.error('Error updating member profile:', error);
      throw error;
    }
  }
}

module.exports = Team;
```

### Enhanced Team Controller (`backend/controllers/teamController.js` - additions)
```javascript
// Add these methods to the existing teamController.js

// Get all teams for current user
const getUserTeams = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { search, visibility } = req.query;

    let teams = await Team.findByUserId(userId);

    // Apply filters
    if (search) {
      teams = teams.filter(team =>
        team.name.toLowerCase().includes(search.toLowerCase()) ||
        (team.description && team.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (visibility) {
      teams = teams.filter(team => team.visibility === visibility);
    }

    res.json({
      success: true,
      data: {
        teams: teams,
        total: teams.length
      }
    });

  } catch (error) {
    logger.error('Get user teams error:', error);
    next(new AppError('Failed to retrieve teams. Please try again.', 500));
  }
};

// Get team details
const getTeamDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find team (project-based)
    const team = await Team.findByProjectId(id);
    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    // Check if user has access to this team
    const project = await Project.findById(id);
    const hasAccess = await project.hasUserAccess(userId);
    if (!hasAccess) {
      return next(new AppError('Access denied to this team', 403));
    }

    // Get team members
    const members = await team.getMembers();

    // Get user's role in this team
    const userRole = await project.getUserRole(userId);

    res.json({
      success: true,
      data: {
        team: {
          ...team,
          member_count: members.length
        },
        members: members,
        user_role: userRole
      }
    });

  } catch (error) {
    logger.error('Get team details error:', error);
    next(new AppError('Failed to retrieve team details. Please try again.', 500));
  }
};

// Update team information
const updateTeamInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, visibility, avatar_url } = req.body;
    const userId = req.user.id;

    // Find project and check permissions
    const project = await Project.findById(id);
    if (!project) {
      return next(new AppError('Team not found', 404));
    }

    // Check if user has admin/manager access
    const userRole = await project.getUserRole(userId);
    if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
      return next(new AppError('Insufficient permissions to update team information', 403));
    }

    // Update team information
    const updatedTeam = await Team.updateTeamInfo(id, {
      name,
      description,
      visibility,
      avatar_url
    });

    logger.info(`Team information updated: ${id}`, {
      teamId: id,
      updatedBy: userId
    });

    res.json({
      success: true,
      message: 'Team information updated successfully.',
      data: {
        team: updatedTeam
      }
    });

  } catch (error) {
    logger.error('Update team info error:', error);

    if (error instanceof ValidationError) {
      return next(new AppError(error.message, 400));
    }

    next(new AppError('Failed to update team information. Please try again.', 500));
  }
};

// Update team member profile
const updateMemberProfile = async (req, res, next) => {
  try {
    const { id, user_id } = req.params;
    const { team_title, team_bio } = req.body;
    const userId = req.user.id;

    // Users can only update their own profile, or admins can update any profile
    if (parseInt(user_id) !== userId) {
      const project = await Project.findById(id);
      const userRole = await project.getUserRole(userId);
      if (!userRole || !['Admin', 'Project Manager'].includes(userRole)) {
        return next(new AppError('Insufficient permissions to update member profile', 403));
      }
    }

    const team = await Team.findByProjectId(id);
    if (!team) {
      return next(new AppError('Team not found', 404));
    }

    await team.updateMemberProfile(user_id, {
      team_title,
      team_bio
    });

    logger.info(`Team member profile updated: ${user_id}`, {
      teamId: id,
      updatedBy: userId
    });

    res.json({
      success: true,
      message: 'Member profile updated successfully.'
    });

  } catch (error) {
    logger.error('Update member profile error:', error);
    next(new AppError('Failed to update member profile. Please try again.', 500));
  }
};

// Export new methods along with existing ones
module.exports = {
  // Existing methods
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,

  // New methods
  getUserTeams,
  getTeamDetails,
  updateTeamInfo,
  updateMemberProfile
};
```

## Phase 3: Frontend Implementation Examples

### Enhanced TeamsPage Component
```javascript
// frontend/src/pages/teams/TeamsPage.jsx (enhanced version)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, PlusIcon, UsersIcon } from '../../components/common/Icons';
import { Button, Card, Input, Select, Avatar } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api';
import CreateTeamModal from '../../components/teams/CreateTeamModal';
import TeamCard from '../../components/teams/TeamCard';

const TeamsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user's teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.teams.getUserTeams({
        search: searchTerm,
        visibility: visibilityFilter
      });
      setTeams(response.data.teams || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [searchTerm, visibilityFilter]);

  const handleCreateTeam = async (teamData) => {
    try {
      await api.teams.create(teamData);
      setShowCreateModal(false);
      fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Failed to create team:', error);
      throw error; // Let modal handle the error
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-600 mt-1">Manage your teams and collaboration</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center space-x-2 min-h-[44px] transition-all duration-150 hover:shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Team</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Search and Filters */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              )}
            </div>
            <Select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="md:w-48"
            >
              <option value="">All Teams</option>
              <option value="Private">Private</option>
              <option value="Organization">Organization</option>
              <option value="Public">Public</option>
            </Select>
          </div>
        </Card>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <UsersIcon className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Teams</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchTeams}>Try Again</Button>
          </Card>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={() => navigate(`/teams/${team.id}`)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
              <UsersIcon className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || visibilityFilter ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || visibilityFilter
                ? 'No teams match your search criteria.'
                : 'Create your first team to start collaborating.'
              }
            </p>
            {!searchTerm && !visibilityFilter && (
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Team
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
        />
      )}
    </div>
  );
};

export default TeamsPage;
```

---

## Conclusion

The Teams functionality implementation leverages substantial existing infrastructure, making it a lower-risk, high-value enhancement. The phased approach ensures minimal disruption while providing immediate value to users. The recommended project-based extension approach maintains consistency with current patterns while providing room for future enhancements.

**Estimated Timeline**: 4 weeks
**Resource Requirements**: 1-2 developers
**Risk Level**: Medium (due to existing infrastructure)
**Business Impact**: High (improved collaboration and user experience)
