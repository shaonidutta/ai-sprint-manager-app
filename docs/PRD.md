# AI Sprint Management App - Product Requirements Document

## 1. Product Overview

### 1.1 Vision
An AI-powered sprint management tool that helps development teams plan, track, and optimize their agile workflows with intelligent insights and automation.

### 1.2 Target Users
- **Project Managers**: Plan and oversee sprints, track team progress
- **Development Team Members**: Manage tasks, log time, update issue status
- **Team Leads/Scrum Masters**: Facilitate sprint ceremonies, analyze team performance
- **Stakeholders**: View project progress and reports

### 1.3 Core Value Propositions
- AI-assisted sprint planning and risk assessment
- Simplified Kanban board management
- Automated scope creep detection
- Intelligent retrospective insights
- Cost-effective alternative to enterprise tools

## 2. User Stories & Functional Requirements

### 2.1 Authentication & User Management
**As a new user, I want to:**
- Register with email and password
- Verify my email using OTP (One-Time Password)
- Log in securely with JWT tokens
- Reset my password if forgotten
- Update my profile information

**Email Verification Flow:**
1. User registers → Account created with `email_verified = false`
2. System generates and sends 6-digit OTP via email
3. User enters OTP → Account verified on successful match
4. **Restrictions**: Unverified users have read-only access
5. **OTP Features**:
   - 6-digit numeric code
   - 10-minute expiry
   - 3 maximum attempts per OTP
   - 2-minute cooldown between resend requests
   - Auto-invalidation of previous OTPs on resend

**As a system admin, I want to:**
- Manage user roles and permissions
- View user activity logs
- Deactivate user accounts when needed

### 2.2 Project Management
**As a project manager, I want to:**
- Create new projects with unique keys
- Invite team members to projects
- Assign roles (Admin, Project Manager, Developer)
- Remove team members from projects
- View project overview and statistics

**As a team member, I want to:**
- View projects I'm assigned to
- See my role and permissions in each project
- Leave projects I no longer work on

### 2.3 Board & Sprint Management
**As a project manager, I want to:**
- Create multiple boards per project
- Start and end sprints on each board
- Set sprint goals and duration
- Plan sprint capacity based on story points
- View sprint burndown charts

**As a team member, I want to:**
- View active sprints across my projects
- See sprint progress and remaining work
- Understand sprint goals and deadlines

### 2.4 Issue Management
**As any user, I want to:**
- Create issues with title, description, priority
- Assign issues to team members
- Set story points and time estimates
- Move issues through workflow states
- Add comments and attachments to issues
- Filter and search issues
- Track time spent on issues

**As a developer, I want to:**
- View issues assigned to me
- Update issue status as I work
- Log time spent on tasks
- Mark issues as blocked with reasons

### 2.5 AI Features
**As a project manager, I want to:**
- Get AI suggestions for sprint planning
- Receive alerts about scope creep
- Get risk assessments for current sprint
- Generate retrospective insights automatically

## 3. Technical Architecture

### 3.1 Technology Stack
- **Backend**: Node.js with Express.js
- **Frontend**: React.js (JavaScript)
- **Database**: MySQL 8.0+
- **Authentication**: JWT with refresh tokens
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Email Service**: NodeMailer with SMTP

### 3.2 Environment Configuration
```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sprint_management
DB_USER=root
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.3

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@sprintmanager.com

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001
```

### 3.3 Frontend Technology Stack
- **Framework**: React.js 18+ with JavaScript
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Custom component library based on Atlassian Design Guidelines
- **State Management**: React Context API + useReducer
- **Routing**: React Router v6
- **HTTP Client**: Axios for API calls
- **Form Handling**: React Hook Form with validation
- **Drag & Drop**: React Beautiful DnD for Kanban board
- **Icons**: Custom icon library based on Atlaskit icons
- **Build Tool**: Vite for fast development and building

### 3.3 Frontend API Organization
```
frontend/src/api/
├── config/
│   └── axiosConfig.js         # Axios instance configuration
├── interceptors/
│   ├── authInterceptor.js     # Authentication and token refresh
│   └── errorInterceptor.js    # Global error handling
├── endpoints/
│   └── index.js              # API endpoint constants
└── index.js                  # Main API service with methods
```

#### API Configuration
- **Base URL**: `http://localhost:3000/api` (configurable via env)
- **Timeout**: 10 seconds (configurable)
- **Content Type**: application/json
- **Authorization**: Bearer token

#### Interceptors
1. **Auth Interceptor**
   - Adds JWT token to requests
   - Handles token refresh on 401
   - Redirects to login on auth failure

2. **Error Interceptor**
   - Standardizes error responses
   - Handles common HTTP status codes
   - Development logging
   - Validation error formatting

#### API Service Methods
Organized by domain:
- auth: Login, register, password reset
- users: Profile management
- projects: CRUD + team management
- boards: Kanban board operations
- sprints: Sprint lifecycle
- issues: Task management
- ai: AI-powered features

### 3.3 Frontend Services Organization
```
frontend/src/services/
├── api/
│   ├── config/
│   │   └── axiosConfig.js         # Axios instance configuration
│   ├── interceptors/
│   │   ├── authInterceptor.js     # Authentication and token refresh
│   │   └── errorInterceptor.js    # Global error handling
│   └── endpoints/
│       └── index.js               # API endpoint constants
├── auth/
│   ├── authService.js             # Authentication related operations
│   └── authUtils.js              # Token management, session handling
├── board/
│   ├── boardService.js           # Board operations
│   └── boardUtils.js             # Board helper functions
├── sprint/
│   ├── sprintService.js          # Sprint management
│   └── sprintUtils.js            # Sprint calculations, validations
├── issue/
│   ├── issueService.js           # Issue CRUD operations
│   └── issueUtils.js             # Issue helpers, formatters
├── project/
│   ├── projectService.js         # Project management
│   └── projectUtils.js           # Project helpers
├── user/
│   ├── userService.js            # User profile operations
│   └── userUtils.js              # User data helpers
└── ai/
    ├── aiService.js              # AI feature operations
    └── aiUtils.js                # AI helpers, prompt formatting
```

Each service module follows a consistent pattern:
- **Service Files**: Handle API calls and data operations
- **Utils Files**: Contain helper functions, formatters, and calculations
- **Clear Separation**: Each domain has its own service and utils

#### Service Module Example (boardService.js):
```javascript
import api from '../api/config/axiosConfig';
import { API_ENDPOINTS } from '../api/endpoints';

export const boardService = {
  // Get all boards for a project
  getBoards: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.BOARDS.LIST(projectId));
    return response.data;
  },

  // Get single board details
  getBoard: async (boardId) => {
    const response = await api.get(API_ENDPOINTS.BOARDS.DETAIL(boardId));
    return response.data;
  },

  // Create new board
  createBoard: async (projectId, data) => {
    const response = await api.post(API_ENDPOINTS.BOARDS.CREATE(projectId), data);
    return response.data;
  },

  // Update board
  updateBoard: async (boardId, data) => {
    const response = await api.put(API_ENDPOINTS.BOARDS.UPDATE(boardId), data);
    return response.data;
  },

  // Delete board
  deleteBoard: async (boardId) => {
    const response = await api.delete(API_ENDPOINTS.BOARDS.DELETE(boardId));
    return response.data;
  }
};
```

#### Utils Module Example (boardUtils.js):
```javascript
export const boardUtils = {
  // Calculate board statistics
  calculateBoardStats: (issues) => {
    return {
      totalIssues: issues.length,
      completedIssues: issues.filter(i => i.status === 'Done').length,
      blockedIssues: issues.filter(i => i.status === 'Blocked').length,
      totalStoryPoints: issues.reduce((sum, i) => sum + (i.storyPoints || 0), 0)
    };
  },

  // Format board data for display
  formatBoardData: (board) => {
    return {
      ...board,
      createdAt: new Date(board.createdAt).toLocaleDateString(),
      issuesByStatus: groupIssuesByStatus(board.issues)
    };
  },

  // Validate board data
  validateBoardData: (data) => {
    const errors = {};
    if (!data.name) errors.name = 'Board name is required';
    if (data.name?.length > 100) errors.name = 'Board name too long';
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
```

This organization provides:
1. **Domain Separation**: Clear boundaries between different features
2. **Code Reusability**: Utils can be shared across components
3. **Maintainability**: Easy to find and update related code
4. **Testing**: Isolated modules are easier to test
5. **Scalability**: New services can be added without affecting others

### 3.4 Frontend UI Components Organization

The frontend UI components are organized into reusable modules following atomic design principles:

```
frontend/src/components/
├── common/                  # Shared UI components
│   ├── Input.jsx           # Form input component
│   ├── Select.jsx          # Dropdown select component
│   ├── Card.jsx            # Card container component
│   ├── Modal.jsx           # Modal dialog component
│   ├── Avatar.jsx          # User avatar component
│   ├── Badge.jsx           # Status and priority badges
│   ├── Tooltip.jsx         # Tooltip component
│   └── index.js            # Common components barrel file
├── board/                  # Board-specific components
│   ├── KanbanBoard.jsx     # Main board component
│   ├── KanbanColumn.jsx    # Board column component
│   ├── IssueCard.jsx       # Issue card component
│   ├── IssueModal.jsx      # Issue details/edit modal
│   └── index.js            # Board components barrel file
└── layout/                 # Layout components
    ├── AppLayout.jsx       # Main application layout
    ├── Header.jsx          # App header with navigation
    └── Sidebar.jsx         # App sidebar with menu

```

#### Common Components

1. **Input**
   - Reusable form input component
   - Supports different types (text, email, password, etc.)
   - Includes error handling and validation
   - Supports different sizes and variants

2. **Select**
   - Dropdown select component
   - Supports single and multiple selection
   - Custom styling and error handling
   - Optional placeholder and helper text

3. **Card**
   - Container component for content
   - Different elevation levels
   - Optional header and footer
   - Interactive variant for clickable cards

4. **Modal**
   - Dialog component for forms and details
   - Different sizes and positions
   - Custom header and footer
   - Keyboard navigation support

5. **Avatar**
   - User avatar component
   - Fallback to initials
   - Different sizes and shapes
   - Optional status indicator

6. **Badge**
   - Status and priority indicators
   - Different variants and colors
   - Optional dot indicator
   - Removable variant

7. **Tooltip**
   - Information tooltip component
   - Different positions
   - Custom delay and animations
   - Arrow indicator

#### Board Components

1. **KanbanBoard**
   - Main board component
   - Drag and drop functionality
   - Swimlane support
   - Loading and error states

2. **KanbanColumn**
   - Board column component
   - Issue list container
   - Column header with count
   - Droppable area for issues

3. **IssueCard**
   - Issue representation
   - Different view modes (board, list, compact)
   - Priority and status indicators
   - Assignee and metadata display

4. **IssueModal**
   - Issue details and edit form
   - View and edit modes
   - Field validation
   - Activity timeline

#### Layout Components

1. **AppLayout**
   - Main application structure
   - Responsive design
   - Navigation integration
   - Content area management

2. **Header**
   - Application header
   - User menu
   - Global actions
   - Navigation items

3. **Sidebar**
   - Main navigation menu
   - Collapsible design
   - Active state handling
   - Icon and label display

### Component Guidelines

1. **Reusability**
   - Components should be modular and reusable
   - Props should be well-documented with PropTypes
   - Default props for common use cases
   - Consistent naming conventions

2. **Accessibility**
   - ARIA labels and roles
   - Keyboard navigation support
   - Color contrast compliance
   - Screen reader compatibility

3. **Performance**
   - Lazy loading for large components
   - Memoization for expensive calculations
   - Efficient re-rendering
   - Code splitting where appropriate

4. **State Management**
   - Local state for UI-specific logic
   - Redux for global application state
   - Context for theme and shared data
   - Proper prop drilling avoidance

5. **Styling**
   - Tailwind CSS for utility classes
   - Consistent color palette
   - Responsive design patterns
   - Dark mode support

6. **Testing**
   - Unit tests for components
   - Integration tests for features
   - Snapshot testing
   - Accessibility testing

## 4. Database Schema (MySQL)

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    password_reset_token VARCHAR(255),
    password_reset_expires DATETIME,
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_email_verified (email_verified),
    INDEX idx_is_active (is_active)
);

-- Email OTPs table
CREATE TABLE email_otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    attempts INT DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_email_otp (email, otp),
    INDEX idx_expires_at (expires_at)
);

-- Projects table
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_key VARCHAR(10) UNIQUE NOT NULL,
    owner_id INT NOT NULL,
    ai_requests_count INT DEFAULT 0,
    ai_requests_reset_date DATE DEFAULT (CURDATE()),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- User-Project relationship (many-to-many)
CREATE TABLE user_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    role ENUM('Admin', 'Project Manager', 'Developer') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id),
    UNIQUE KEY unique_active_user_project (user_id, project_id, deleted_at)
);

-- Boards table
CREATE TABLE boards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Sprints table
CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    start_date DATE,
    end_date DATE,
    capacity_story_points INT,
    status ENUM('Planning', 'Active', 'Completed') DEFAULT 'Planning',
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Issues table
CREATE TABLE issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    board_id INT NOT NULL,
    sprint_id INT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    issue_type ENUM('Story', 'Bug', 'Task', 'Epic') DEFAULT 'Story',
    status ENUM('To Do', 'In Progress', 'Done', 'Blocked') DEFAULT 'To Do',
    priority ENUM('P1', 'P2', 'P3', 'P4') DEFAULT 'P3',
    story_points INT NULL,
    original_estimate INT NULL, -- in hours
    time_spent INT DEFAULT 0, -- in hours
    time_remaining INT NULL, -- in hours
    assignee_id INT NULL,
    reporter_id INT NOT NULL,
    blocked_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (board_id) REFERENCES boards(id),
    FOREIGN KEY (sprint_id) REFERENCES sprints(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id),
    FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

### 4.2 Supporting Tables
```sql
-- Refresh tokens for JWT
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Issue comments
CREATE TABLE issue_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Time tracking logs
CREATE TABLE time_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    issue_id INT NOT NULL,
    user_id INT NOT NULL,
    hours_logged INT NOT NULL,
    description TEXT,
    logged_date DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- AI request tracking
CREATE TABLE ai_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    feature VARCHAR(50) NOT NULL,
    request_data JSON,
    response_data JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## 5. Frontend UI Design System

### 5.1 Design Philosophy
The UI follows **Atlassian Design Guidelines (ADG) v2**, providing a familiar and professional interface similar to Jira Cloud. This ensures:
- **Consistency** with industry-standard project management tools
- **Accessibility** and usability best practices
- **Scalability** for future feature additions
- **Professional appearance** that builds user trust

### 5.2 Color System

#### Brand Colors
```css
:root {
  /* Primary Colors */
  --color-primary: #0052CC;        /* Atlassian Blue - buttons, links, active states */
  --color-secondary: #4C9AFF;      /* Sky Blue - secondary buttons, highlights */
}
```

#### Neutral Colors (Background & Text)
```css
:root {
  /* Neutrals */
  --color-n900: #091E42;           /* Main text */
  --color-n800: #172B4D;           /* Headings, sub-headings */
  --color-n500: #6B778C;           /* Body text, captions */
  --color-n200: #EBECF0;           /* Borders, dividers */
  --color-n100: #F4F5F7;           /* Page background, cards */
}
```

#### Semantic Colors
```css
:root {
  /* Status Colors */
  --color-success: #36B37E;        /* Success tags, badges */
  --color-warning: #FFAB00;        /* Warnings, alerts */
  --color-error: #DE350B;          /* Error messages, blockers */
  --color-info: #00B8D9;           /* Info accents, links */
  --color-discovery: #6554C0;      /* Highlights, experimental features */
  --color-attention: #FF991F;      /* Emphasis, callouts */
}
```

#### Priority Color Mapping
```css
:root {
  /* Issue Priority Colors */
  --priority-p1: var(--color-error);      /* Critical - Red */
  --priority-p2: var(--color-attention);  /* High - Orange */
  --priority-p3: var(--color-warning);    /* Medium - Yellow */
  --priority-p4: var(--color-success);    /* Low - Green */
}
```

### 5.3 Typography System

#### Font Configuration
```css
:root {
  /* Font Family */
  --font-primary: 'Atlassian Sans', -apple-system, BlinkMacSystemFont,
                  'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
                  'Helvetica Neue', sans-serif;
}

/* Typography Scale */
.text-display {    /* H1 */
  font-size: 36px;
  font-weight: 600;
  line-height: 40px;
}

.text-heading {    /* H2 */
  font-size: 28px;
  font-weight: 600;
  line-height: 32px;
}

.text-subheading { /* H3 */
  font-size: 20px;
  font-weight: 500;
  line-height: 24px;
}

.text-body {       /* Base Text */
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.text-small {      /* Caption */
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}
```

### 5.4 Spacing System

#### Base Unit: 4px
```css
:root {
  /* Spacing Scale (4px base unit) */
  --space-1: 4px;    /* 4px */
  --space-2: 8px;    /* 8px */
  --space-3: 12px;   /* 12px */
  --space-4: 16px;   /* 16px */
  --space-5: 20px;   /* 20px */
  --space-6: 24px;   /* 24px */
  --space-8: 32px;   /* 32px */
  --space-10: 40px;  /* 40px */
  --space-12: 48px;  /* 48px */
  --space-16: 64px;  /* 64px */
  --space-20: 80px;  /* 80px */
  --space-24: 96px;  /* 96px */
}
```

#### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    spacing: {
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
    }
  }
}
```

### 5.5 UI Components & Patterns

#### Button System
```css
/* Primary Button */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0 16px;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #0065FF;
}

/* Secondary Button */
.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  padding: 0 16px;
  height: 32px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background-color: var(--color-n100);
}
```

#### Card Component
```css
.card {
  background: white;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
  padding: var(--space-3); /* 12px */
  margin-bottom: var(--space-2); /* 8px */
  border: 1px solid var(--color-n200);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: 0 2px 4px rgba(9, 30, 66, 0.35);
}
```

#### Form Elements
```css
/* Input Fields */
.input {
  height: 32px;
  border: 1px solid #DFE1E6;
  border-radius: 3px;
  padding: 0 var(--space-2); /* 8px */
  font-size: 14px;
  font-family: var(--font-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-secondary);
  box-shadow: 0 0 0 2px rgba(76, 154, 255, 0.2);
}

/* Large Input (Textarea) */
.input-large {
  min-height: 80px;
  padding: var(--space-2); /* 8px */
  resize: vertical;
}
```

#### Modal System
```css
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 30, 66, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Modal Content */
.modal {
  background: white;
  border-radius: 3px;
  box-shadow: 0 8px 16px rgba(9, 30, 66, 0.25);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6); /* 24px */
}
```

### 5.6 Layout Patterns

#### Global Navigation (Sidebar)
```css
.sidebar {
  width: 240px;
  background: var(--color-n100);
  border-right: 1px solid var(--color-n200);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.sidebar-collapsed {
  width: 64px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: var(--space-2) var(--space-4); /* 8px 16px */
  color: var(--color-n800);
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.sidebar-item:hover {
  background-color: var(--color-n200);
}

.sidebar-item.active {
  background-color: var(--color-secondary);
  color: white;
  border-left: 3px solid var(--color-primary);
}
```

#### Board Header
```css
.board-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6); /* 16px 24px */
  background: white;
  border-bottom: 1px solid var(--color-n200);
  position: sticky;
  top: 0;
  z-index: 50;
}

.board-title {
  font-size: 20px;
  font-weight: 500;
  color: var(--color-n800);
}

.board-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2); /* 8px */
}
```

### 5.7 Icon System

#### Icon Configuration
- **Default Size**: 16px
- **Stroke Width**: 2px
- **Library**: Custom icons based on Atlaskit design
- **Format**: SVG for scalability and performance

#### Common Icons Needed
```javascript
// Icon mapping for the application
const ICONS = {
  // Issue Types
  story: 'bookmark',
  bug: 'bug',
  task: 'check-square',
  epic: 'zap',

  // Priority Levels
  p1: 'arrow-up', // Critical
  p2: 'arrow-up', // High
  p3: 'minus',    // Medium
  p4: 'arrow-down', // Low

  // Actions
  add: 'plus',
  edit: 'edit-2',
  delete: 'trash-2',
  search: 'search',
  filter: 'filter',

  // Navigation
  dashboard: 'grid',
  projects: 'folder',
  boards: 'trello',
  settings: 'settings',

  // User
  user: 'user',
  team: 'users',
  avatar: 'user-circle'
};
```

### 5.8 Kanban Board Specific Styling

#### Column Layout
```css
.kanban-board {
  display: flex;
  gap: var(--space-4); /* 16px */
  padding: var(--space-4); /* 16px */
  min-height: calc(100vh - 120px);
  overflow-x: auto;
}

.kanban-column {
  min-width: 280px;
  background: var(--color-n100);
  border-radius: 3px;
  padding: var(--space-3); /* 12px */
}

.kanban-column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3); /* 12px */
  font-weight: 500;
  color: var(--color-n800);
}

.kanban-column-count {
  background: var(--color-n200);
  color: var(--color-n500);
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
}
```

#### Issue Card Styling
```css
.issue-card {
  background: white;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
  padding: var(--space-3); /* 12px */
  margin-bottom: var(--space-2); /* 8px */
  cursor: pointer;
  transition: all 0.2s ease;
}

.issue-card:hover {
  box-shadow: 0 2px 4px rgba(9, 30, 66, 0.35);
  transform: translateY(-1px);
}

.issue-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2); /* 8px */
}

.issue-type-icon {
  width: 16px;
  height: 16px;
}

.issue-priority {
  width: 12px;
  height: 12px;
}

.issue-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-n800);
  margin-bottom: var(--space-1); /* 4px */
  line-height: 1.3;
}

.issue-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-n500);
}

.issue-assignee {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-n200);
}
```

### 5.9 Responsive Design

#### Breakpoints
```css
:root {
  /* Responsive Breakpoints */
  --breakpoint-sm: 640px;   /* Small devices */
  --breakpoint-md: 768px;   /* Medium devices */
  --breakpoint-lg: 1024px;  /* Large devices */
  --breakpoint-xl: 1280px;  /* Extra large devices */
}

/* Mobile-first responsive design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .kanban-board {
    flex-direction: column;
  }

  .kanban-column {
    min-width: 100%;
  }
}
```

### 5.10 Accessibility & Design References

#### Accessibility Standards
- **WCAG 2.1 AA Compliance**: Ensure color contrast ratios meet accessibility standards
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators and logical tab order

#### Design System References
- **Atlassian Design Guidelines**: [https://atlassian.design/](https://atlassian.design/)
- **Atlaskit Components**: [https://atlaskit.atlassian.com/](https://atlaskit.atlassian.com/)
- **Jira Cloud UI Reference**: [https://www.atlassian.com/software/jira](https://www.atlassian.com/software/jira)
- **Color Guidelines**: [https://atlassian.design/guidelines/product/colour](https://atlassian.design/guidelines/product/colour)
- **Typography Guidelines**: [https://atlassian.design/guidelines/product/typography](https://atlassian.design/guidelines/product/typography)

## 6. API Endpoints Specification

### 6.1 Authentication Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh-token
POST /api/auth/send-otp      # Send OTP for email verification
POST /api/auth/verify-otp    # Verify email with OTP
GET  /api/auth/otp-status    # Check OTP cooldown status
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PUT  /api/auth/profile
```

#### Email Verification Endpoints

**Send OTP**
```
POST /api/auth/send-otp
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "email": "user@example.com",
    "expiresAt": "2024-01-01T10:10:00Z",
    "cooldownMinutes": 2
  }
}
```

**Verify OTP**
```
POST /api/auth/verify-otp
Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response (200):
{
  "success": true,
  "message": "Email verified successfully. Welcome to AI Sprint Manager!",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "emailVerified": true,
      "avatarUrl": null
    }
  }
}
```

**Check OTP Status**
```
GET /api/auth/otp-status?email=user@example.com

Response (200):
{
  "success": true,
  "data": {
    "canResend": true,
    "remainingSeconds": 0
  }
}
```

### 5.2 Project Management Endpoints
```
GET    /api/projects                    # Get user's projects
POST   /api/projects                    # Create new project
GET    /api/projects/:id                # Get project details
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project
GET    /api/projects/:id/members        # Get project members
POST   /api/projects/:id/members        # Add member to project
PUT    /api/projects/:id/members/:userId # Update member role
DELETE /api/projects/:id/members/:userId # Remove member
```

### 5.3 Board Management Endpoints
```
GET    /api/projects/:projectId/boards  # Get project boards
POST   /api/projects/:projectId/boards  # Create new board
GET    /api/boards/:id                  # Get board details
PUT    /api/boards/:id                  # Update board
DELETE /api/boards/:id                  # Delete board
```

### 5.4 Sprint Management Endpoints
```
GET    /api/boards/:boardId/sprints     # Get board sprints
POST   /api/boards/:boardId/sprints     # Create new sprint
GET    /api/sprints/:id                 # Get sprint details
PUT    /api/sprints/:id                 # Update sprint
DELETE /api/sprints/:id                 # Delete sprint
POST   /api/sprints/:id/start           # Start sprint
POST   /api/sprints/:id/complete        # Complete sprint
GET    /api/sprints/:id/burndown        # Get burndown data
```

### 5.5 Issue Management Endpoints
```
GET    /api/boards/:boardId/issues      # Get board issues
POST   /api/boards/:boardId/issues      # Create new issue
GET    /api/issues/:id                  # Get issue details
PUT    /api/issues/:id                  # Update issue
DELETE /api/issues/:id                  # Delete issue
POST   /api/issues/:id/comments         # Add comment
GET    /api/issues/:id/comments         # Get comments
POST   /api/issues/:id/time-logs        # Log time
GET    /api/issues/:id/time-logs        # Get time logs
```

### 5.6 AI Features Endpoints
```
POST   /api/ai/sprint-plan              # Generate sprint plan
POST   /api/ai/scope-creep              # Analyze scope creep
POST   /api/ai/risk-assessment          # Assess sprint risks
POST   /api/ai/retrospective            # Generate retrospective
GET    /api/projects/:id/ai-quota       # Check AI quota
```

## 7. Authentication & Security Implementation

### 7.1 JWT Implementation
- **Library**: Use `jsonwebtoken` (Node.js)
- **Approach**: Store refresh tokens in database for security
- **Token Structure**:
  - Access Token: 15-minute expiry, contains user_id, roles
  - Refresh Token: 7-day expiry, stored in `refresh_tokens` table
- **Storage**: Access token in memory/localStorage, refresh token in httpOnly cookie

### 7.2 Password Requirements
- **Minimum**: 8 characters
- **Requirements**: At least one uppercase, lowercase, number, special character
- **Hashing**: bcrypt with 12 rounds
- **Validation**: Implement both client-side and server-side validation

### 7.3 Email Verification Flow
1. User registers → Account created with `email_verified = false`
2. Verification email sent with unique token
3. User clicks link → Token validated → Account verified
4. **Restrictions**: Unverified users have read-only access
5. **Cannot**: Create/edit issues, use AI features, create projects

### 7.4 Password Reset Flow
1. User requests reset → Email sent with reset token
2. Token valid for 1 hour
3. User sets new password → Token invalidated
4. All existing sessions invalidated

## 8. Project & Board Structure

### 8.1 Project Keys
- **Generation**: Auto-generated using project name
- **Format**: Take first 3-4 letters of project name + random 2-digit number
- **Example**: "Sprint Tool" → "SPRI01", "SPRI02" if collision
- **Uniqueness**: Check uniqueness and increment suffix

### 8.2 Board Management
- **Permissions**: Only Project Managers and Admins can create boards
- **Default**: Each project gets one default board on creation
- **Naming**: Simple text input, no special formatting required

### 8.3 Board-Sprint Relationship
- **Rule**: One active sprint per board (not per project)
- **Concurrent**: Multiple boards can have concurrent sprints
- **Isolation**: Each board manages its own sprint independently

## 9. Sprint & Issue Management

### 9.1 Sprint Lifecycle
1. **Planning Phase**: Create sprint, set goals, add issues
2. **Active Phase**: Team works on issues, daily updates
3. **Completion Phase**: Review, retrospective, close sprint

### 9.2 Issue ID Generation
- **Format**: Global auto-incrementing integer
- **Display**: "ISSUE-{id}" (e.g., ISSUE-1001)
- **Implementation**: Use database auto-increment primary key

### 9.3 Issue Status Workflow
- **To Do** → **In Progress** → **Done**
- **Blocked**: Can be set from any status except Done
- **Rule**: Issues in "Blocked" status cannot be moved to "Done"
- **UI**: Show blocked indicator on cards with reason

### 9.4 Time Tracking Implementation
- **Units**: Hours only
- **Format**: Whole numbers only (1, 2, 5, 8, 40)
- **Fields**: original_estimate, time_spent, time_remaining
- **Logging**: Users can log time with description and date
- **Auto-calculation**: time_remaining = original_estimate - time_spent

### 9.5 Story Points
- **Scale**: 1, 2, 3, 5, 8, 13, 21 (Fibonacci sequence)
- **Input**: Dropdown selection
- **Default**: null (no estimate)
- **Velocity**: Calculate team velocity based on completed story points

### 9.6 Priority Levels
- **Values**: P1 (Critical), P2 (High), P3 (Medium), P4 (Low)
- **Default**: P3 (Medium)
- **Color Coding**: P1-Red, P2-Orange, P3-Yellow, P4-Green

## 10. Kanban Board Specifics

### 10.1 Column Structure
- **Default Columns**: "To Do", "In Progress", "Done"
- **Order**: Fixed order, no reordering
- **Customization**: Not available in initial version

### 10.2 WIP Limits
- **Scope**: Global limits apply to all boards
- **Default Limits**: To Do (unlimited), In Progress (5), Done (unlimited)
- **Enforcement**: Frontend prevents drag-drop when limit reached
- **Override**: No override mechanism initially

### 10.3 Swimlane Implementation
- **Type**: Pure visual grouping
- **Options**: "By Priority" or "By Assignee"
- **No Assignee**: Issues without assignee show in "Unassigned" row
- **Switching**: Toggle between swimlane views without affecting data

## 11. AI Integration (Simple & Cost-Effective)

### 11.1 OpenAI Configuration
- **Model**: GPT-3.5-turbo (cost-effective)
- **Temperature**: 0.3 (consistent outputs)
- **Max Tokens**: 500 per request
- **Timeout**: 10 seconds

### 11.2 Rate Limiting & Quota Management
- **Quota**: 10 AI requests per project per day
- **Reset**: Daily at midnight UTC
- **Counter**: Track in projects.ai_requests_count field
- **Enforcement**: Check quota before each AI request
- **User Feedback**: Show remaining quota in UI

### 11.3 Prompt Templates (Hardcoded)
- **Sprint Negotiator**: "Based on these issues: {issue_list}, suggest a realistic sprint plan considering team capacity of {capacity} story points"
- **Scope Creep**: "Analyze if sprint scope has increased: Original: {original_issues}, Current: {current_issues}"
- **Risk Assessment**: "Identify risks in this sprint: {sprint_data}"
- **Retrospective**: "Generate retrospective insights from: {sprint_summary}"

### 11.4 AI Output Handling & Error Management
- **Sprint Plan**: Expect JSON array of issue IDs with story point allocation
- **Other Features**: Plain text responses, display as-is with basic formatting
- **Error Scenarios**:
  - API timeout: "AI service is taking longer than expected. Please try again."
  - Quota exceeded: "Daily AI quota reached. Resets at midnight UTC."
  - Invalid response: "AI generated invalid response. Please try again."
  - Network error: "Unable to connect to AI service. Check your connection."

## 12. Error Handling & User Experience

### 12.1 API Error Responses
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User-friendly error message",
    "details": "Technical details for debugging"
  }
}
```

### 12.2 Common Error Scenarios
- **Authentication**: Invalid credentials, expired tokens
- **Authorization**: Insufficient permissions for action
- **Validation**: Invalid input data, missing required fields
- **Business Logic**: Cannot move blocked issue to done
- **External Services**: AI API failures, email service down

### 12.3 User Feedback Mechanisms
- **Success Messages**: Clear confirmation of actions
- **Loading States**: Show progress for long operations
- **Validation**: Real-time form validation
- **Offline Handling**: Graceful degradation when offline

## 13. Implementation Phases & Priorities

### Phase 1: Foundation (Weeks 1-2)
- Database setup and migrations
- User authentication system
- Basic project and user management
- Email verification system

### Phase 2: Core Features (Weeks 3-4)
- Board and issue management
- Basic Kanban board UI
- Issue CRUD operations
- User role management

### Phase 3: Sprint Management (Weeks 5-6)
- Sprint lifecycle management
- Time tracking functionality
- Basic reporting and charts
- Sprint burndown visualization

### Phase 4: AI Integration (Weeks 7-8)
- OpenAI integration setup
- AI feature implementation
- Rate limiting and quota management
- Error handling and fallbacks

### Phase 5: Polish & Testing (Week 9)
- UI/UX improvements
- Comprehensive testing
- Performance optimization
- Documentation completion

## 14. Testing Strategy

### 14.1 Backend Testing
- **Unit Tests**: Individual functions and methods
- **Integration Tests**: API endpoints and database operations
- **Authentication Tests**: JWT token handling and security
- **AI Integration Tests**: Mock OpenAI responses

### 14.2 Frontend Testing
- **Component Tests**: React component functionality
- **Integration Tests**: User workflows and interactions
- **E2E Tests**: Complete user journeys
- **Accessibility Tests**: WCAG compliance

### 14.3 Performance Testing
- **Load Testing**: API performance under load
- **Database Performance**: Query optimization
- **Frontend Performance**: Bundle size and loading times

This comprehensive PRD provides a complete roadmap for implementing the AI Sprint Management App with clear specifications, error handling, a professional UI design system based on Atlassian Design Guidelines, and a phased approach to development.

## 14. Development Rules & Guidelines

### 14.1 Communication & Decision Making

#### Discussion Before Implementation
- **Always discuss before assuming**: Before implementing any feature or making architectural decisions, discuss the approach with the team/stakeholder
- **Document decisions**: All major technical decisions should be documented with reasoning
- **Seek clarification**: When requirements are unclear, ask for clarification rather than making assumptions

#### Multiple Approach Evaluation
- **Explain approach selection**: When multiple implementation approaches are possible, clearly explain:
  - What approaches were considered
  - Pros and cons of each approach
  - Why the selected approach was chosen
  - Trade-offs being made
- **Consider alternatives**: Always evaluate at least 2-3 different approaches before settling on one
- **Document rejected approaches**: Keep record of why certain approaches were not selected

### 14.2 Version Control & Code Management

#### Git Workflow Requirements
- **Feature-based commits**: After completion of each feature, perform a git commit and push
- **Atomic commits**: Each commit should represent a complete, working feature or fix
- **Descriptive commit messages**: Use clear, descriptive commit messages following conventional commit format:
  ```
  feat: add user authentication system
  fix: resolve issue with sprint date validation
  docs: update API documentation for issue endpoints
  refactor: optimize database queries for board loading
  ```

#### Commit Frequency
- **After each feature**: Mandatory commit and push after completing any feature, no matter how small
- **Before major changes**: Commit current work before starting major refactoring or new features
- **End of day**: Always commit and push work at the end of each development session
- **Before testing**: Commit stable code before running comprehensive tests

#### Branch Management
- **Feature branches**: Create separate branches for major features when appropriate
- **Main branch protection**: Keep main branch stable and deployable
- **Code review**: All significant changes should go through code review process

### 14.3 Code Quality Standards

#### Documentation Requirements
- **Inline comments**: Complex logic should be documented with clear comments
- **API documentation**: All endpoints must be documented with request/response examples
- **README updates**: Keep project README updated with setup and deployment instructions
- **Change logs**: Maintain changelog for significant updates

#### Testing Requirements
- **Unit tests**: Write unit tests for all business logic
- **Integration tests**: Test API endpoints and database interactions
- **Manual testing**: Perform manual testing before each commit
- **Regression testing**: Ensure new changes don't break existing functionality

### 14.4 Implementation Standards

#### Error Handling
- **Graceful degradation**: Handle errors gracefully with user-friendly messages
- **Logging**: Implement comprehensive logging for debugging and monitoring
- **Validation**: Validate all inputs on both frontend and backend
- **Fallback mechanisms**: Provide fallbacks for external service failures (especially AI features)

#### Performance Considerations
- **Database optimization**: Optimize queries and use appropriate indexes
- **Frontend optimization**: Minimize bundle size and optimize rendering
- **Caching strategies**: Implement appropriate caching for frequently accessed data
- **Rate limiting**: Implement rate limiting for API endpoints and AI features

### 14.5 Collaboration Guidelines

#### Communication Protocols
- **Daily updates**: Provide daily progress updates on current work
- **Blocker escalation**: Immediately communicate any blockers or issues
- **Knowledge sharing**: Share learnings and solutions with the team
- **Code reviews**: Participate actively in code review process

#### Documentation Maintenance
- **Keep PRD updated**: Update this PRD document when requirements change
- **API documentation**: Maintain up-to-date API documentation
- **Architecture decisions**: Document significant architectural changes
- **Deployment guides**: Keep deployment and setup documentation current

## 15. User Journey & Screen Flow Documentation

### 15.1 Complete User Navigation Flow

This section provides a detailed screen-by-screen user journey from authentication through AI features, including API mappings and complete request/response models.

#### Navigation Hierarchy
```
Landing Page → Auth Flow → Dashboard → Projects → Boards → Issues → AI Features
     ↓              ↓         ↓          ↓         ↓        ↓         ↓
  Marketing    Login/Register  My Projects  Project  Kanban   Issue    AI Tools
   Content     Email Verify   Overview     Boards   Board    Detail   & Insights
```

### 15.2 Screen-by-Screen User Journey

#### **SCREEN 1: Landing Page**
**Purpose**: Marketing page for unauthenticated users
**Components**: Hero section, features overview, pricing, CTA buttons
**Navigation**:
- "Sign Up" → Screen 2 (Registration)
- "Log In" → Screen 3 (Login)
- "Learn More" → Feature sections

**APIs**: None (static content)

---

#### **SCREEN 2: User Registration**
**Purpose**: New user account creation
**Components**: Registration form, email validation, password strength indicator
**Form Fields**:
- First Name (required)
- Last Name (required)
- Email (required, validated)
- Password (required, strength validation)
- Confirm Password (required)
- Terms acceptance checkbox

**API Mapping**: `POST /api/auth/register`

**Request Model**:
```json
{
  "firstName": "string (2-50 chars)",
  "lastName": "string (2-50 chars)",
  "email": "string (valid email format)",
  "password": "string (8+ chars, mixed case, number, special char)",
  "confirmPassword": "string (must match password)"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "userId": "integer",
    "email": "string",
    "emailVerified": false,
    "verificationEmailSent": true
  }
}
```

**Error Responses**:
```json
// 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["Email already exists"],
      "password": ["Password must contain at least one uppercase letter"]
    }
  }
}

// 409 - Conflict
{
  "success": false,
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "An account with this email already exists",
    "details": "Please use a different email or try logging in"
  }
}

// 500 - Server Error
{
  "success": false,
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "Registration failed due to server error",
    "details": "Please try again later"
  }
}
```

**Navigation**:
- Success → Screen 4 (Email Verification Pending)
- "Already have account?" → Screen 3 (Login)

---

#### **SCREEN 3: User Login**
**Purpose**: Existing user authentication
**Components**: Login form, forgot password link, remember me option
**Form Fields**:
- Email (required)
- Password (required)
- Remember Me (checkbox)

**API Mapping**: `POST /api/auth/login`

**Request Model**:
```json
{
  "email": "string (valid email)",
  "password": "string",
  "rememberMe": "boolean (optional, default: false)"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "integer",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "emailVerified": "boolean",
      "avatarUrl": "string|null"
    },
    "accessToken": "string (JWT)",
    "expiresIn": "string (15m)"
  }
}
```

**Error Responses**:
```json
// 401 - Invalid Credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": "Please check your credentials and try again"
  }
}

// 403 - Account Not Verified
{
  "success": false,
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Please verify your email before logging in",
    "details": "Check your inbox for verification email"
  }
}

// 423 - Account Locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to multiple failed attempts",
    "details": "Please try again in 15 minutes"
  }
}
```

**Navigation**:
- Success + Email Verified → Screen 6 (Dashboard)
- Success + Email Not Verified → Screen 4 (Email Verification Pending)
- "Forgot Password?" → Screen 5 (Password Reset)
- "Sign Up" → Screen 2 (Registration)

---

#### **SCREEN 4: Email Verification Pending**
**Purpose**: Inform user to check email and verify account
**Components**: Verification message, resend email button, logout option
**Features**:
- Countdown timer for resend button (60 seconds)
- Auto-refresh to check verification status
- Clear instructions with email provider links

**API Mappings**:
- `POST /api/auth/resend-verification` (Resend email)
- `GET /api/auth/me` (Check verification status)

**Resend Verification Request**:
```json
{
  "email": "string"
}
```

**Resend Verification Response (200)**:
```json
{
  "success": true,
  "message": "Verification email sent successfully",
  "data": {
    "emailSent": true,
    "nextResendAllowed": "2024-01-01T12:01:00Z"
  }
}
```

**Navigation**:
- Email Verified → Screen 6 (Dashboard)
- "Logout" → Screen 1 (Landing Page)

---

#### **SCREEN 5: Password Reset**
**Purpose**: Allow users to reset forgotten passwords
**Components**: Email input form, instructions, back to login link

**API Mapping**: `POST /api/auth/forgot-password`

**Request Model**:
```json
{
  "email": "string (valid email)"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "emailSent": true,
    "expiresIn": "1 hour"
  }
}
```

**Navigation**:
- Success → Screen 5b (Reset Email Sent)
- "Back to Login" → Screen 3 (Login)

---

#### **SCREEN 6: Dashboard (My Projects)**
**Purpose**: Main landing page showing user's projects and recent activity
**Components**:
- Header with user menu, notifications, search
- Project cards grid
- Recent activity feed
- Quick actions (Create Project, Join Project)
- AI usage summary widget

**API Mappings**:
- `GET /api/projects` (User's projects)
- `GET /api/auth/me` (User profile)
- `GET /api/dashboard/activity` (Recent activity)

**Get Projects Request**: `GET /api/projects`

**Get Projects Response (200)**:
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "integer",
        "name": "string",
        "description": "string|null",
        "projectKey": "string",
        "role": "Admin|Project Manager|Developer",
        "isOwner": "boolean",
        "memberCount": "integer",
        "activeSprintCount": "integer",
        "totalIssues": "integer",
        "createdAt": "ISO date string",
        "updatedAt": "ISO date string"
      }
    ],
    "totalCount": "integer",
    "userRole": "string"
  }
}
```

**Navigation**:
- Project Card Click → Screen 7 (Project Overview)
- "Create Project" → Screen 8 (Create Project)
- User Menu → Profile, Settings, Logout
- Search → Global search results

---

#### **SCREEN 7: Project Overview**
**Purpose**: Detailed view of a specific project with boards and team management
**Components**:
- Project header (name, key, description)
- Boards grid with sprint status
- Team members list with roles
- Project settings (for admins/PMs)
- Recent activity timeline

**API Mappings**:
- `GET /api/projects/:id` (Project details)
- `GET /api/projects/:id/boards` (Project boards)
- `GET /api/projects/:id/members` (Team members)

**Get Project Details Response (200)**:
```json
{
  "success": true,
  "data": {
    "project": {
      "id": "integer",
      "name": "string",
      "description": "string|null",
      "projectKey": "string",
      "ownerId": "integer",
      "userRole": "Admin|Project Manager|Developer",
      "aiRequestsCount": "integer",
      "aiRequestsLimit": 10,
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    },
    "boards": [
      {
        "id": "integer",
        "name": "string",
        "description": "string|null",
        "isDefault": "boolean",
        "activeSprint": {
          "id": "integer|null",
          "name": "string|null",
          "status": "Planning|Active|Completed",
          "startDate": "ISO date string|null",
          "endDate": "ISO date string|null"
        },
        "issueCount": "integer"
      }
    ],
    "members": [
      {
        "userId": "integer",
        "firstName": "string",
        "lastName": "string",
        "email": "string",
        "role": "Admin|Project Manager|Developer",
        "avatarUrl": "string|null",
        "joinedAt": "ISO date string"
      }
    ]
  }
}
```

**Navigation**:
- Board Card Click → Screen 9 (Kanban Board)
- "Create Board" → Screen 10 (Create Board)
- "Manage Team" → Screen 11 (Team Management)
- "Project Settings" → Screen 12 (Project Settings)

---

#### **SCREEN 8: Create Project**
**Purpose**: Form to create a new project
**Components**: Project creation form with validation
**Form Fields**:
- Project Name (required, 3-100 chars)
- Description (optional, max 500 chars)
- Project Key (auto-generated, editable)

**API Mapping**: `POST /api/projects`

**Request Model**:
```json
{
  "name": "string (3-100 chars)",
  "description": "string|null (max 500 chars)",
  "projectKey": "string (3-10 chars, uppercase, optional)"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "integer",
      "name": "string",
      "description": "string|null",
      "projectKey": "string",
      "ownerId": "integer",
      "userRole": "Admin",
      "createdAt": "ISO date string"
    },
    "defaultBoard": {
      "id": "integer",
      "name": "string",
      "isDefault": true
    }
  }
}
```

**Error Responses**:
```json
// 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project data",
    "details": {
      "name": ["Project name is required"],
      "projectKey": ["Project key already exists"]
    }
  }
}

// 409 - Conflict
{
  "success": false,
  "error": {
    "code": "PROJECT_KEY_EXISTS",
    "message": "Project key already exists",
    "details": "Please choose a different project key"
  }
}
```

**Navigation**:
- Success → Screen 7 (Project Overview)
- Cancel → Screen 6 (Dashboard)

---

#### **SCREEN 9: Kanban Board**
**Purpose**: Main board view with drag-and-drop issue management
**Components**:
- Board header with sprint info and controls
- Three columns: To Do, In Progress, Done
- Issue cards with drag-and-drop
- Swimlanes toggle (By Priority/Assignee)
- Quick add issue button
- Sprint controls (Start/Complete Sprint)

**API Mappings**:
- `GET /api/boards/:id` (Board details)
- `GET /api/boards/:boardId/issues` (Board issues)
- `GET /api/boards/:boardId/sprints` (Board sprints)
- `PUT /api/issues/:id` (Update issue status via drag-drop)

**Get Board Issues Response (200)**:
```json
{
  "success": true,
  "data": {
    "board": {
      "id": "integer",
      "name": "string",
      "projectId": "integer",
      "projectName": "string",
      "projectKey": "string"
    },
    "activeSprint": {
      "id": "integer|null",
      "name": "string|null",
      "goal": "string|null",
      "status": "Planning|Active|Completed",
      "startDate": "ISO date string|null",
      "endDate": "ISO date string|null",
      "capacityStoryPoints": "integer|null"
    },
    "issues": [
      {
        "id": "integer",
        "title": "string",
        "description": "string|null",
        "issueType": "Story|Bug|Task|Epic",
        "status": "To Do|In Progress|Done|Blocked",
        "priority": "P1|P2|P3|P4",
        "storyPoints": "integer|null",
        "originalEstimate": "integer|null",
        "timeSpent": "integer",
        "timeRemaining": "integer|null",
        "assignee": {
          "id": "integer|null",
          "firstName": "string|null",
          "lastName": "string|null",
          "avatarUrl": "string|null"
        },
        "reporter": {
          "id": "integer",
          "firstName": "string",
          "lastName": "string"
        },
        "blockedReason": "string|null",
        "createdAt": "ISO date string",
        "updatedAt": "ISO date string"
      }
    ],
    "columnCounts": {
      "toDo": "integer",
      "inProgress": "integer",
      "done": "integer",
      "blocked": "integer"
    },
    "wipLimits": {
      "toDo": null,
      "inProgress": 5,
      "done": null
    }
  }
}
```

**Navigation**:
- Issue Card Click → Screen 13 (Issue Detail)
- "Create Issue" → Screen 14 (Create Issue)
- "Sprint Settings" → Screen 15 (Sprint Management)
- "AI Insights" → Screen 16 (AI Features)

---

#### **SCREEN 10: Create Board**
**Purpose**: Form to create a new board within a project
**Components**: Simple form with board name and description

**API Mapping**: `POST /api/projects/:projectId/boards`

**Request Model**:
```json
{
  "name": "string (3-100 chars)",
  "description": "string|null (max 500 chars)"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Board created successfully",
  "data": {
    "board": {
      "id": "integer",
      "name": "string",
      "description": "string|null",
      "projectId": "integer",
      "isDefault": false,
      "createdAt": "ISO date string"
    }
  }
}
```

**Navigation**:
- Success → Screen 9 (Kanban Board)
- Cancel → Screen 7 (Project Overview)

---

#### **SCREEN 11: Team Management**
**Purpose**: Manage project team members and their roles
**Components**: Team members list, invite form, role management

**API Mappings**:
- `GET /api/projects/:id/members` (Get team members)
- `POST /api/projects/:id/members` (Invite member)
- `PUT /api/projects/:id/members/:userId` (Update role)
- `DELETE /api/projects/:id/members/:userId` (Remove member)

**Invite Member Request**:
```json
{
  "email": "string (valid email)",
  "role": "Project Manager|Developer"
}
```

**Invite Member Response (201)**:
```json
{
  "success": true,
  "message": "Team member invited successfully",
  "data": {
    "invitation": {
      "email": "string",
      "role": "string",
      "invitedBy": "string",
      "expiresAt": "ISO date string"
    }
  }
}
```

---

#### **SCREEN 12: Project Settings**
**Purpose**: Configure project settings (Admin/PM only)
**Components**: Project details form, danger zone (delete project)

**API Mappings**:
- `PUT /api/projects/:id` (Update project)
- `DELETE /api/projects/:id` (Delete project)

---

#### **SCREEN 13: Issue Detail**
**Purpose**: Detailed view and editing of a specific issue
**Components**:
- Issue header (title, type, priority, status)
- Description editor
- Comments section
- Time tracking widget
- Assignee and reporter info
- Activity timeline

**API Mappings**:
- `GET /api/issues/:id` (Issue details)
- `PUT /api/issues/:id` (Update issue)
- `GET /api/issues/:id/comments` (Get comments)
- `POST /api/issues/:id/comments` (Add comment)
- `POST /api/issues/:id/time-logs` (Log time)

**Get Issue Details Response (200)**:
```json
{
  "success": true,
  "data": {
    "issue": {
      "id": "integer",
      "title": "string",
      "description": "string|null",
      "issueType": "Story|Bug|Task|Epic",
      "status": "To Do|In Progress|Done|Blocked",
      "priority": "P1|P2|P3|P4",
      "storyPoints": "integer|null",
      "originalEstimate": "integer|null",
      "timeSpent": "integer",
      "timeRemaining": "integer|null",
      "assignee": {
        "id": "integer|null",
        "firstName": "string|null",
        "lastName": "string|null",
        "email": "string|null",
        "avatarUrl": "string|null"
      },
      "reporter": {
        "id": "integer",
        "firstName": "string",
        "lastName": "string",
        "email": "string"
      },
      "board": {
        "id": "integer",
        "name": "string",
        "projectId": "integer",
        "projectName": "string",
        "projectKey": "string"
      },
      "sprint": {
        "id": "integer|null",
        "name": "string|null"
      },
      "blockedReason": "string|null",
      "createdAt": "ISO date string",
      "updatedAt": "ISO date string"
    },
    "comments": [
      {
        "id": "integer",
        "comment": "string",
        "user": {
          "id": "integer",
          "firstName": "string",
          "lastName": "string",
          "avatarUrl": "string|null"
        },
        "createdAt": "ISO date string",
        "updatedAt": "ISO date string"
      }
    ],
    "timeLogs": [
      {
        "id": "integer",
        "hoursLogged": "integer",
        "description": "string|null",
        "loggedDate": "ISO date string",
        "user": {
          "firstName": "string",
          "lastName": "string"
        },
        "createdAt": "ISO date string"
      }
    ]
  }
}
```

**Navigation**:
- "Back to Board" → Screen 9 (Kanban Board)
- "Edit Issue" → Inline editing mode
- Related issues → Other issue detail screens

---

#### **SCREEN 14: Create Issue**
**Purpose**: Form to create a new issue
**Components**: Comprehensive issue creation form

**Form Fields**:
- Title (required, max 500 chars)
- Description (optional, rich text)
- Issue Type (Story/Bug/Task/Epic)
- Priority (P1/P2/P3/P4)
- Assignee (dropdown of team members)
- Story Points (Fibonacci scale)
- Original Estimate (hours)
- Sprint (optional, current sprint default)

**API Mapping**: `POST /api/boards/:boardId/issues`

**Request Model**:
```json
{
  "title": "string (required, max 500 chars)",
  "description": "string|null",
  "issueType": "Story|Bug|Task|Epic",
  "priority": "P1|P2|P3|P4",
  "assigneeId": "integer|null",
  "storyPoints": "integer|null",
  "originalEstimate": "integer|null",
  "sprintId": "integer|null"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "issue": {
      "id": "integer",
      "title": "string",
      "issueType": "string",
      "priority": "string",
      "status": "To Do",
      "assignee": {
        "id": "integer|null",
        "firstName": "string|null",
        "lastName": "string|null"
      },
      "createdAt": "ISO date string"
    }
  }
}
```

**Navigation**:
- Success → Screen 9 (Kanban Board) or Screen 13 (Issue Detail)
- Cancel → Screen 9 (Kanban Board)

---

#### **SCREEN 15: Sprint Management**
**Purpose**: Create, start, and manage sprints
**Components**:
- Sprint creation/edit form
- Sprint planning interface
- Issue assignment to sprint
- Sprint goal setting
- Capacity planning

**API Mappings**:
- `GET /api/boards/:boardId/sprints` (Get sprints)
- `POST /api/boards/:boardId/sprints` (Create sprint)
- `PUT /api/sprints/:id` (Update sprint)
- `POST /api/sprints/:id/start` (Start sprint)
- `POST /api/sprints/:id/complete` (Complete sprint)

**Create Sprint Request**:
```json
{
  "name": "string (required, max 100 chars)",
  "goal": "string|null (max 500 chars)",
  "startDate": "ISO date string",
  "endDate": "ISO date string",
  "capacityStoryPoints": "integer|null"
}
```

**Create Sprint Response (201)**:
```json
{
  "success": true,
  "message": "Sprint created successfully",
  "data": {
    "sprint": {
      "id": "integer",
      "name": "string",
      "goal": "string|null",
      "status": "Planning",
      "startDate": "ISO date string",
      "endDate": "ISO date string",
      "capacityStoryPoints": "integer|null",
      "boardId": "integer",
      "createdAt": "ISO date string"
    }
  }
}
```

**Start Sprint Response (200)**:
```json
{
  "success": true,
  "message": "Sprint started successfully",
  "data": {
    "sprint": {
      "id": "integer",
      "status": "Active",
      "startDate": "ISO date string",
      "issueCount": "integer",
      "totalStoryPoints": "integer"
    }
  }
}
```

**Navigation**:
- "Back to Board" → Screen 9 (Kanban Board)
- "AI Sprint Planning" → Screen 16 (AI Features)

---

#### **SCREEN 16: AI Features Dashboard**
**Purpose**: Access all AI-powered features and insights
**Components**:
- AI quota usage indicator
- Feature cards for each AI tool
- Recent AI insights history
- Quick access buttons

**Subscreens**:
- **16a**: Sprint Planning AI
- **16b**: Scope Creep Analysis
- **16c**: Risk Assessment
- **16d**: Retrospective Insights

**API Mappings**:
- `GET /api/projects/:id/ai-quota` (Check quota)
- `POST /api/ai/sprint-plan` (Generate sprint plan)
- `POST /api/ai/scope-creep` (Analyze scope creep)
- `POST /api/ai/risk-assessment` (Assess risks)
- `POST /api/ai/retrospective` (Generate retrospective)

**Check AI Quota Response (200)**:
```json
{
  "success": true,
  "data": {
    "quota": {
      "used": "integer",
      "limit": 10,
      "remaining": "integer",
      "resetDate": "ISO date string",
      "resetTime": "string (HH:MM UTC)"
    },
    "recentRequests": [
      {
        "feature": "sprint-plan|scope-creep|risk-assessment|retrospective",
        "timestamp": "ISO date string",
        "status": "success|error"
      }
    ]
  }
}
```

---

#### **SCREEN 16a: AI Sprint Planning**
**Purpose**: Get AI suggestions for sprint planning
**Components**:
- Current backlog issues display
- Team capacity input
- AI-generated sprint plan
- Accept/modify suggestions interface

**API Mapping**: `POST /api/ai/sprint-plan`

**Request Model**:
```json
{
  "projectId": "integer",
  "boardId": "integer",
  "teamCapacity": "integer (story points)",
  "sprintDuration": "integer (days)",
  "issueIds": ["array of issue IDs to consider"]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "sprintPlan": {
      "recommendedIssues": [
        {
          "issueId": "integer",
          "title": "string",
          "storyPoints": "integer",
          "priority": "string",
          "reasoning": "string"
        }
      ],
      "totalStoryPoints": "integer",
      "capacityUtilization": "number (0-1)",
      "recommendations": [
        "string (AI recommendations)"
      ],
      "risks": [
        "string (potential risks identified)"
      ]
    },
    "quotaRemaining": "integer"
  }
}
```

**Error Responses**:
```json
// 429 - Quota Exceeded
{
  "success": false,
  "error": {
    "code": "AI_QUOTA_EXCEEDED",
    "message": "Daily AI quota reached. Resets at midnight UTC.",
    "details": "You have used all 10 AI requests for today"
  }
}

// 503 - AI Service Unavailable
{
  "success": false,
  "error": {
    "code": "AI_SERVICE_UNAVAILABLE",
    "message": "AI service is temporarily unavailable",
    "details": "Please try again in a few minutes"
  }
}
```

---

#### **SCREEN 16b: Scope Creep Analysis**
**Purpose**: Analyze if sprint scope has increased beyond original plan
**Components**:
- Original sprint plan display
- Current sprint status
- AI analysis of scope changes
- Recommendations for action

**API Mapping**: `POST /api/ai/scope-creep`

**Request Model**:
```json
{
  "sprintId": "integer",
  "originalIssues": ["array of original issue IDs"],
  "currentIssues": ["array of current issue IDs"]
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "analysis": {
      "scopeIncreased": "boolean",
      "percentageIncrease": "number",
      "addedIssues": [
        {
          "issueId": "integer",
          "title": "string",
          "storyPoints": "integer",
          "addedDate": "ISO date string"
        }
      ],
      "removedIssues": [
        {
          "issueId": "integer",
          "title": "string",
          "storyPoints": "integer"
        }
      ],
      "impact": "Low|Medium|High",
      "recommendations": [
        "string (AI recommendations)"
      ]
    },
    "quotaRemaining": "integer"
  }
}
```

---

#### **SCREEN 16c: Risk Assessment**
**Purpose**: AI analysis of current sprint risks
**Components**:
- Sprint overview
- Risk factors identified
- Risk severity levels
- Mitigation suggestions

**API Mapping**: `POST /api/ai/risk-assessment`

**Request Model**:
```json
{
  "sprintId": "integer",
  "includeTeamVelocity": "boolean",
  "includeBlockedIssues": "boolean"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "riskAssessment": {
      "overallRisk": "Low|Medium|High|Critical",
      "risks": [
        {
          "category": "Timeline|Capacity|Dependencies|Quality",
          "severity": "Low|Medium|High",
          "description": "string",
          "mitigation": "string"
        }
      ],
      "sprintHealth": {
        "completionProbability": "number (0-1)",
        "velocityTrend": "Improving|Stable|Declining",
        "blockerCount": "integer"
      },
      "recommendations": [
        "string (AI recommendations)"
      ]
    },
    "quotaRemaining": "integer"
  }
}
```

---

#### **SCREEN 16d: Retrospective Insights**
**Purpose**: AI-generated retrospective insights and suggestions
**Components**:
- Sprint summary
- AI-generated insights
- Improvement suggestions
- Team performance analysis

**API Mapping**: `POST /api/ai/retrospective`

**Request Model**:
```json
{
  "sprintId": "integer",
  "includeVelocityData": "boolean",
  "includeIssueMetrics": "boolean"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "data": {
    "retrospective": {
      "sprintSummary": {
        "completedStoryPoints": "integer",
        "plannedStoryPoints": "integer",
        "completionRate": "number (0-1)",
        "averageCycleTime": "number (days)"
      },
      "insights": [
        {
          "category": "Velocity|Quality|Process|Team",
          "insight": "string",
          "evidence": "string"
        }
      ],
      "improvements": [
        {
          "area": "string",
          "suggestion": "string",
          "priority": "High|Medium|Low"
        }
      ],
      "celebrations": [
        "string (positive achievements to celebrate)"
      ]
    },
    "quotaRemaining": "integer"
  }
}
```

**Navigation for all AI screens**:
- "Back to Board" → Screen 9 (Kanban Board)
- "AI Dashboard" → Screen 16 (AI Features Dashboard)
- Other AI features → Screens 16a-16d

### 15.3 Mobile-Specific Considerations

#### Responsive Navigation
- **Mobile Menu**: Hamburger menu for sidebar navigation
- **Swipe Gestures**: Swipe between Kanban columns
- **Touch Optimization**: Larger touch targets for mobile devices
- **Simplified Forms**: Streamlined forms for mobile input

#### Mobile-Specific Screens
- **Mobile Dashboard**: Simplified project cards in list view
- **Mobile Kanban**: Single column view with swipe navigation
- **Mobile Issue Detail**: Full-screen modal with optimized layout

### 15.4 Error Handling Flows

#### Network Connectivity
- **Offline Mode**: Show offline indicator and queue actions
- **Retry Mechanism**: Automatic retry for failed requests
- **Data Sync**: Sync queued actions when connection restored

#### Authentication Errors
- **Token Expiry**: Automatic token refresh or redirect to login
- **Permission Denied**: Clear error messages with suggested actions
- **Account Issues**: Redirect to appropriate resolution screens

This comprehensive user journey documentation provides complete screen flows, API mappings, and detailed request/response models for the entire AI Sprint Management App.

### 3.4 Frontend Route Structure
```
/
├── /login                       # Login page
├── /register                    # Registration page
├── /forgot-password            # Forgot password page
├── /reset-password             # Reset password page
├── /verify-email               # Email verification page
├── /                          # Dashboard (protected)
├── /profile                   # User profile (protected)
├── /settings                  # App settings (protected)
├── /projects                  # Projects list (protected)
│   ├── /:projectId           # Project details
│   ├── /:projectId/settings  # Project settings
│   └── /:projectId/team      # Project team management
├── /boards                    # Boards list (protected)
│   ├── /:boardId             # Board details/Kanban view
│   └── /:boardId/settings    # Board settings
├── /sprints                  # Sprints list (protected)
│   ├── /:sprintId           # Sprint details
│   ├── /:sprintId/planning  # Sprint planning
│   └── /:sprintId/retro     # Sprint retrospective
└── /ai-features             # AI features (protected)
    ├── /sprint-planning     # AI-assisted sprint planning
    ├── /risk-assessment    # Sprint risk assessment
    └── /insights           # AI-generated insights
```

Each route is protected by the authentication system except for:
- /login
- /register
- /forgot-password
- /reset-password
- /verify-email

The route structure follows these principles:
1. RESTful URL patterns for resource identification
2. Clear hierarchy for nested resources
3. Consistent naming conventions
4. Logical grouping of related features
5. Separation of public and protected routes