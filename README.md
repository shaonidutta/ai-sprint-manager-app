# AI Sprint Management App

An AI-powered sprint management tool that helps development teams plan, track, and optimize their agile workflows with intelligent insights and automation. Built with modern technologies and following Atlassian Design Guidelines for a familiar and intuitive user experience.

## 📋 Project Overview

Sprint2 is a comprehensive project management platform that combines traditional agile methodologies with AI-powered insights. The application provides teams with tools for project management, sprint planning, Kanban boards, issue tracking, and intelligent analytics to optimize development workflows.

### Key Features
- **Project Management**: Create and manage multiple projects with team collaboration
- **Kanban Boards**: Drag-and-drop issue management with customizable workflows
- **Sprint Planning**: Plan and track sprints with burndown charts and velocity metrics
- **AI-Powered Insights**:
  - Sprint planning suggestions
  - Scope creep detection
  - Risk assessment and heatmaps
  - Retrospective insights
- **Time Tracking**: Log and track time spent on issues
- **Team Collaboration**: Role-based permissions and team management
- **Email Notifications**: Automated email notifications for important events

## 🏗️ Project Structure

```
Sprint2/
├── backend/                    # Node.js Express API Server
│   ├── config/                # Configuration files
│   │   ├── database.js        # MySQL database connection
│   │   └── logger.js          # Winston logging configuration
│   ├── controllers/           # Route controllers (MVC)
│   ├── models/                # Data models (raw SQL)
│   ├── routes/                # API route definitions
│   ├── middleware/            # Custom middleware
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions and error classes
│   ├── scripts/               # Database migration and seed scripts
│   ├── tests/                 # Backend tests
│   ├── uploads/               # File upload directory
│   ├── logs/                  # Application logs
│   ├── .env.example           # Environment variables template
│   ├── package.json           # Backend dependencies
│   └── server.js              # Main server entry point
├── frontend/                  # React.js Client Application
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store configuration
│   │   ├── utils/             # Utility functions
│   │   ├── context/           # React context providers
│   │   ├── assets/            # Images, icons, etc.
│   │   ├── App.jsx            # Main App component
│   │   ├── main.jsx           # React entry point
│   │   └── index.css          # Global styles with Tailwind
│   ├── .env.example           # Frontend environment variables
│   ├── package.json           # Frontend dependencies
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   ├── postcss.config.js      # PostCSS configuration
│   └── vite.config.js         # Vite build configuration
├── docs/                      # Project documentation
│   ├── API-Specification.md   # Complete API documentation
│   ├── PRD.md                 # Product Requirements Document
│   ├── project-flow.md        # Development flow diagrams
│   └── project-dashboard.html # Project overview dashboard
├── database_dumps/            # Database backup files
├── logs/                      # Application logs
├── TODO.md                    # Development task tracking
└── README.md                  # This file
```

## 🚀 Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT with refresh tokens
- **Email**: NodeMailer with SMTP
- **AI Integration**: OpenAI GPT-3.5-turbo
- **Logging**: Winston
- **Testing**: Jest + Supertest
- **Architecture**: MVC pattern without ORM

### Frontend
- **Framework**: React.js 18+ with JavaScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.3.5 with Atlassian Design System
- **State Management**: Redux Toolkit + React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Drag & Drop**: @dnd-kit
- **Icons**: Heroicons
- **Animations**: Framer Motion
- **Testing**: React Testing Library + Jest

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your system:

### Required Software
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **MySQL**: Version 8.0 or higher
- **Git**: For version control

### Optional Tools
- **MySQL Workbench**: For database management (recommended)
- **Postman**: For API testing (recommended)
- **VS Code**: Recommended IDE with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - MySQL (for database management)

### System Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: At least 2GB free space

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Sprint2
```

### 2. Database Setup

#### Install MySQL
1. Download and install MySQL 8.0+ from [MySQL Official Website](https://dev.mysql.com/downloads/)
2. During installation, remember your root password
3. Start the MySQL service

#### Create Database User (Optional but Recommended)
```sql
-- Connect to MySQL as root
mysql -u root -p

-- Create a dedicated user for the application
CREATE USER 'sprint_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON sprint_management.* TO 'sprint_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Backend Environment Variables
Edit the `.env` file with your specific configuration:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=sprint_management
DB_USER=sprint_user  # or 'root' if using root user
DB_PASSWORD=your_secure_password
DB_CONNECTION_LIMIT=10

# JWT Configuration (Generate secure keys for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# Email Configuration (Gmail SMTP example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password for Gmail
FROM_EMAIL=noreply@sprintmanager.com
FROM_NAME=AI Sprint Manager

# Frontend URL
FRONTEND_URL=http://localhost:3001

# OpenAI Configuration (Optional - for AI features)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.3

# File Upload Configuration
UPLOAD_PATH=uploads/
MAX_FILE_SIZE=5242880  # 5MB
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# AI Quota Configuration
AI_QUOTA_LIMIT=50
AI_QUOTA_RESET_DAYS=30
```

#### Run Database Migration and Seeding
```bash
# Create database and tables
npm run db:migrate

# Seed with sample data
npm run db:seed
```

#### Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:3000`

### 4. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Frontend Environment Variables
Edit the `frontend/.env` file:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_TIMEOUT=10000

# Application Configuration
VITE_APP_NAME=SprintFlow
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Modern AI Sprint Management Platform

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_TIME_TRACKING=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_DRAG_DROP=true

# UI Configuration
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
VITE_DEFAULT_LANGUAGE=en

# File Upload Configuration
VITE_MAX_FILE_SIZE=5242880  # 5MB
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx

# Development Configuration
VITE_ENABLE_REDUX_DEVTOOLS=true
VITE_ENABLE_CONSOLE_LOGS=true
VITE_ENABLE_ERROR_BOUNDARY=true
```

#### Start Frontend Development Server
```bash
# Development mode with hot reload
npm run dev
```

The frontend development server will start on `http://localhost:3001`

## 🚀 Running the Application

### Quick Start (Development)
1. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api/v1
   - API Documentation: http://localhost:3000/api/v1/docs (if available)

### Default Login Credentials
After running the seed script, you can use these test accounts:

```
Admin User:
Email: admin@sprintmanager.com
Password: admin123

Regular User:
Email: john.doe@example.com
Password: password123
```

## 📊 Database Schema

The application uses 11 main tables:

- **users**: User accounts and authentication
- **projects**: Project management
- **user_projects**: User-project relationships with roles
- **boards**: Kanban boards for projects
- **board_columns**: Board column configuration
- **sprints**: Sprint management
- **issues**: Tasks, stories, bugs, and epics
- **issue_comments**: Issue discussions
- **time_logs**: Time tracking
- **ai_requests**: AI feature usage tracking
- **refresh_tokens**: JWT refresh token management

## 📋 Available Scripts

### Backend Scripts
```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm test               # Run test suite
npm run test:watch     # Run tests in watch mode
npm run db:migrate     # Create database and tables
npm run db:seed        # Seed database with sample data
```

### Frontend Scripts
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

## 🎨 Design System

The frontend follows **Atlassian Design Guidelines** with:
- **Color Palette**: Atlassian Blue (#0052CC) primary colors
- **Spacing**: 4px grid system
- **Typography**: System fonts with consistent hierarchy
- **Components**: Reusable UI components following Atlassian patterns
- **Accessibility**: WCAG AA compliance with proper contrast ratios
- **Responsive**: Mobile-first design with breakpoints at 768px and 1024px

## 🔧 Environment Configuration

### Required Environment Variables

#### Backend (.env)
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`: Database connection
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: Authentication secrets
- `SMTP_USER`, `SMTP_PASS`: Email configuration (optional)
- `OPENAI_API_KEY`: AI features (optional)

#### Frontend (.env)
- `VITE_API_BASE_URL`: Backend API URL
- Feature flags for enabling/disabling functionality

### Optional Configuration
- **Email**: Configure SMTP for email notifications
- **AI Features**: Add OpenAI API key for AI-powered insights
- **File Uploads**: Adjust file size limits and allowed types

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="auth"
```

### Frontend Testing
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Manual Testing
1. **Authentication Flow**: Register → Email verification → Login → Logout
2. **Project Management**: Create project → Add team members → Manage roles
3. **Board Operations**: Create board → Add issues → Drag and drop
4. **Sprint Management**: Create sprint → Add issues → Start sprint → Complete sprint

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Error: ER_ACCESS_DENIED_ERROR
# Solution: Check database credentials in .env file
# Verify MySQL service is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS
```

#### Port Already in Use
```bash
# Error: EADDRINUSE :::3000
# Solution: Kill process using the port
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install correct version using nvm
nvm install 18
nvm use 18
```

#### Frontend Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### Database Migration Fails
```bash
# Reset database
mysql -u root -p
DROP DATABASE IF EXISTS sprint_management;
exit

# Re-run migration
npm run db:migrate
npm run db:seed
```

### Environment-Specific Issues

#### Windows
- Use Git Bash or PowerShell for commands
- Ensure MySQL service is running in Services
- Use `copy` instead of `cp` for copying files

#### macOS
- Install MySQL using Homebrew: `brew install mysql`
- Start MySQL: `brew services start mysql`

#### Linux
- Install MySQL: `sudo apt-get install mysql-server`
- Start MySQL: `sudo systemctl start mysql`

## 📚 Documentation

### API Documentation
- [Complete API Specification](docs/API-Specification.md) - All endpoints with examples
- [Product Requirements Document](docs/PRD.md) - Feature specifications
- [Development Flow](docs/project-flow.md) - Architecture diagrams

### Development Guides
- [AI Features Documentation](docs/AI_Features_Documentation.md)
- [Email Notification Guide](docs/EMAIL_NOTIFICATION_IMPLEMENTATION_GUIDE.md)
- [Sprint Planning Enhancement](docs/Enhanced_Sprint_Planning_Technical_Documentation.md)

### Project Status
- [TODO.md](TODO.md) - Current development progress and task tracking
- [Phase 1 Completion Summary](docs/PHASE_1_COMPLETION_SUMMARY.md)

## 🤝 Contributing Guidelines

### Development Workflow
1. **Follow TODO.md**: Complete tasks in the specified order
2. **One Task at a Time**: Focus on completing one task before moving to the next
3. **Commit Frequently**: Commit after each completed task with descriptive messages
4. **Update Documentation**: Update TODO.md progress after each task
5. **Test Before Proceeding**: Ensure functionality works before moving to next task

### Code Standards
- **Backend**: Follow MVC pattern, use proper error handling
- **Frontend**: Use functional components with hooks, follow Atlassian Design Guidelines
- **Database**: Use proper indexing, maintain referential integrity
- **API**: RESTful design with consistent response formats

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/task-description

# Make changes and commit
git add .
git commit -m "feat: implement task description"

# Push and create pull request
git push origin feature/task-description
```

### Testing Requirements
- Write unit tests for new functionality
- Ensure all existing tests pass
- Test manually before submitting changes
- Include integration tests for API endpoints

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Error handling is implemented
- [ ] Security best practices are followed

## 🚀 Deployment

### Development Deployment
The application is currently in development phase. Deployment instructions will be added in Phase 6 of the development plan.

### Production Considerations
- Use environment-specific configuration files
- Implement proper logging and monitoring
- Set up SSL certificates for HTTPS
- Configure database backups
- Implement CI/CD pipeline
- Set up error tracking (Sentry)

## 📄 License

MIT License - see LICENSE file for details.

## 📞 Support

For questions or issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [Documentation](#-documentation)
3. Check existing issues in the repository
4. Create a new issue with detailed description

---

**Current Status**: Backend 95% Complete | Frontend 80% Complete | Overall 87% Complete
**Current Phase**: Phase 1 - Board Management Implementation
**Last Updated**: January 2025

## 🎯 Next Steps

1. **Complete Phase 1**: Board Management Implementation (6 tasks remaining)
2. **Phase 2**: Issue/Task Management (8 tasks)
3. **Phase 3**: Sprint Management (7 tasks)
4. **Phase 4**: Advanced Features (6 tasks)
5. **Phase 5**: UI/UX Polish (5 tasks)
6. **Phase 6**: Testing & Deployment (4 tasks)

See [TODO.md](TODO.md) for detailed task breakdown and current progress.
