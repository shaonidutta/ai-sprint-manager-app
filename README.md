# AI Sprint Management App

An AI-powered sprint management tool that helps development teams plan, track, and optimize their agile workflows with intelligent insights and automation.

## 🏗️ Project Structure

```
ai-sprint-management-app/
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
│   ├── .gitignore             # Backend gitignore
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
- **Framework**: React.js 19+ with JavaScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.3.3 with Atlassian Design System
- **State Management**: Redux Toolkit + React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Drag & Drop**: @dnd-kit
- **Icons**: Heroicons
- **Testing**: React Testing Library + Jest

## 🎯 Key Features

- **Project Management**: Create and manage multiple projects with team collaboration
- **Kanban Boards**: Drag-and-drop issue management with customizable workflows
- **Sprint Planning**: Plan and track sprints with burndown charts and velocity metrics
- **AI-Powered Insights**: 
  - Sprint planning suggestions
  - Scope creep detection
  - Risk assessment
  - Retrospective insights
- **Time Tracking**: Log and track time spent on issues
- **Team Collaboration**: Role-based permissions and team management
- **Email Notifications**: Automated email notifications for important events

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables in .env
npm run dev
```

### Database Setup
```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 📋 Development Workflow

1. Follow the TODO.md for task progression
2. Complete one task at a time
3. Commit after each completed task
4. Update TODO.md progress
5. Test functionality before moving to next task

## 🎨 Design System

The frontend follows **Atlassian Design Guidelines** with:
- Atlassian Blue (#0052CC) primary color palette
- 4px spacing system
- Atlassian Sans typography
- Consistent component patterns
- Accessible color contrasts

## 📚 Documentation

- [API Specification](docs/API-Specification.md) - Complete REST API documentation
- [Product Requirements](docs/PRD.md) - Detailed feature specifications
- [Development Flow](docs/project-flow.md) - Project development diagrams
- [Task Tracking](TODO.md) - Current development progress

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
npm run test:watch
```

### Frontend Testing
```bash
cd frontend
npm test
npm run test:watch
```

## 🚀 Deployment

Deployment instructions will be added in Phase 9 of development.

## 📄 License

MIT License - see LICENSE file for details.

---

**Current Status**: Phase 1 - Foundation Setup
**Last Updated**: 2024-01-01
