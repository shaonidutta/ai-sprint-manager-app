# AI Sprint Management App - Project Flow Diagrams

## Development Phase Flow

```mermaid
graph TD
    A[Phase 1: Foundation] --> B[Phase 2: Authentication]
    B --> C[Phase 3: User & Project Management]
    C --> D[Phase 4: Board & Issue Foundation]
    D --> E[Phase 5: Kanban Board Implementation]
    E --> F[Phase 6: Sprint Management]
    F --> G[Phase 7: AI Integration]
    G --> H[Phase 8: Testing & QA]
    H --> I[Phase 9: Deployment]
    
    A1[Project Setup<br/>Database Schema<br/>Environment Config] --> A
    B1[JWT Authentication<br/>Email Verification<br/>Password Reset] --> B
    C1[User Profiles<br/>Project CRUD<br/>Team Management] --> C
    D1[Board Management<br/>Issue CRUD<br/>Comments & Time] --> D
    E1[Kanban UI<br/>Drag & Drop<br/>Swimlanes] --> E
    F1[Sprint Lifecycle<br/>Planning<br/>Reporting] --> F
    G1[OpenAI Integration<br/>AI Features<br/>Quota Management] --> G
    H1[Unit Tests<br/>Integration Tests<br/>Performance] --> H
    I1[Production Deploy<br/>Documentation<br/>Monitoring] --> I
    
    style A fill:#e3f2fd
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#fce4ec
    style F fill:#f1f8e9
    style G fill:#e0f2f1
    style H fill:#fff8e1
    style I fill:#fafafa
```

## MoSCoW Priority Distribution

```mermaid
pie title Task Distribution by MoSCoW Priority
    "Must Have (142)" : 142
    "Should Have (43)" : 43
    "Could Have (12)" : 12
    "Won't Have (0)" : 0
```

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React.js Frontend]
        Mobile[Mobile Responsive]
    end
    
    subgraph "API Layer"
        Gateway[API Gateway]
        Auth[Authentication Middleware]
        Routes[Express Routes]
    end
    
    subgraph "Business Logic"
        UserService[User Management]
        ProjectService[Project Management]
        BoardService[Board Management]
        SprintService[Sprint Management]
        AIService[AI Integration]
    end
    
    subgraph "Data Layer"
        MySQL[(MySQL Database)]
        Redis[(Redis Cache)]
    end
    
    subgraph "External Services"
        OpenAI[OpenAI API]
        SMTP[Email Service]
    end
    
    UI --> Gateway
    Mobile --> Gateway
    Gateway --> Auth
    Auth --> Routes
    Routes --> UserService
    Routes --> ProjectService
    Routes --> BoardService
    Routes --> SprintService
    Routes --> AIService
    
    UserService --> MySQL
    ProjectService --> MySQL
    BoardService --> MySQL
    SprintService --> MySQL
    AIService --> OpenAI
    UserService --> SMTP
    
    UserService --> Redis
    ProjectService --> Redis
    
    style UI fill:#e3f2fd
    style Gateway fill:#f3e5f5
    style MySQL fill:#e8f5e8
    style OpenAI fill:#fff3e0
    style SMTP fill:#fce4ec
```

## Database Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ USER_PROJECTS : "belongs to"
    PROJECTS ||--o{ USER_PROJECTS : "has"
    PROJECTS ||--o{ BOARDS : "contains"
    BOARDS ||--o{ SPRINTS : "has"
    BOARDS ||--o{ ISSUES : "contains"
    SPRINTS ||--o{ ISSUES : "includes"
    USERS ||--o{ ISSUES : "assigned to"
    USERS ||--o{ ISSUES : "reported by"
    ISSUES ||--o{ ISSUE_COMMENTS : "has"
    ISSUES ||--o{ TIME_LOGS : "tracks"
    USERS ||--o{ TIME_LOGS : "logs"
    USERS ||--o{ AI_REQUESTS : "makes"
    PROJECTS ||--o{ AI_REQUESTS : "for"
    
    USERS {
        int id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        boolean email_verified
        datetime created_at
    }
    
    PROJECTS {
        int id PK
        string name
        string project_key UK
        int owner_id FK
        int ai_requests_count
        datetime created_at
    }
    
    USER_PROJECTS {
        int id PK
        int user_id FK
        int project_id FK
        enum role
        datetime created_at
    }
    
    BOARDS {
        int id PK
        int project_id FK
        string name
        boolean is_default
        datetime created_at
    }
    
    SPRINTS {
        int id PK
        int board_id FK
        string name
        date start_date
        date end_date
        enum status
        datetime created_at
    }
    
    ISSUES {
        int id PK
        int board_id FK
        int sprint_id FK
        string title
        enum issue_type
        enum status
        enum priority
        int story_points
        int assignee_id FK
        int reporter_id FK
        datetime created_at
    }
```

## User Journey Flow

```mermaid
graph TD
    Start[User Visits App] --> Landing[Landing Page]
    Landing --> Register[Registration]
    Landing --> Login[Login]
    
    Register --> EmailVerify[Email Verification]
    EmailVerify --> Dashboard[Dashboard]
    Login --> Dashboard
    
    Dashboard --> CreateProject[Create Project]
    Dashboard --> JoinProject[Join Project]
    Dashboard --> ViewProject[View Project]
    
    ViewProject --> ProjectOverview[Project Overview]
    ProjectOverview --> CreateBoard[Create Board]
    ProjectOverview --> ViewBoard[View Board]
    
    ViewBoard --> KanbanBoard[Kanban Board]
    KanbanBoard --> CreateIssue[Create Issue]
    KanbanBoard --> EditIssue[Edit Issue]
    KanbanBoard --> MoveIssue[Move Issue]
    
    KanbanBoard --> SprintPlanning[Sprint Planning]
    SprintPlanning --> StartSprint[Start Sprint]
    StartSprint --> SprintActive[Active Sprint]
    SprintActive --> CompleteSprint[Complete Sprint]
    
    SprintActive --> AIFeatures[AI Features]
    AIFeatures --> SprintPlan[AI Sprint Planning]
    AIFeatures --> ScopeCreep[Scope Creep Detection]
    AIFeatures --> RiskAssess[Risk Assessment]
    AIFeatures --> Retrospective[AI Retrospective]
    
    style Start fill:#e3f2fd
    style Dashboard fill:#e8f5e8
    style KanbanBoard fill:#fff3e0
    style AIFeatures fill:#f3e5f5
```

## AI Integration Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant AIService
    participant OpenAI
    participant Database
    
    User->>Frontend: Request AI Feature
    Frontend->>Backend: API Call with Auth
    Backend->>Database: Check AI Quota
    
    alt Quota Available
        Backend->>AIService: Process Request
        AIService->>OpenAI: Send Prompt
        OpenAI->>AIService: Return Response
        AIService->>Backend: Processed Result
        Backend->>Database: Log AI Request
        Backend->>Database: Update Quota
        Backend->>Frontend: Return AI Insights
        Frontend->>User: Display Results
    else Quota Exceeded
        Backend->>Frontend: Quota Exceeded Error
        Frontend->>User: Show Quota Message
    end
```

## Testing Strategy Flow

```mermaid
graph TD
    Dev[Development] --> UnitTests[Unit Tests]
    UnitTests --> IntegrationTests[Integration Tests]
    IntegrationTests --> E2ETests[E2E Tests]
    E2ETests --> SecurityTests[Security Tests]
    SecurityTests --> PerformanceTests[Performance Tests]
    PerformanceTests --> UAT[User Acceptance Testing]
    UAT --> Production[Production Deployment]
    
    UnitTests --> |Fail| Dev
    IntegrationTests --> |Fail| Dev
    E2ETests --> |Fail| Dev
    SecurityTests --> |Fail| Dev
    PerformanceTests --> |Fail| Dev
    UAT --> |Fail| Dev
    
    style Dev fill:#e3f2fd
    style Production fill:#e8f5e8
```

## Deployment Pipeline

```mermaid
graph LR
    Code[Code Commit] --> Build[Build Process]
    Build --> Test[Automated Tests]
    Test --> Security[Security Scan]
    Security --> Deploy[Deploy to Staging]
    Deploy --> Validate[Validation Tests]
    Validate --> Prod[Deploy to Production]
    Prod --> Monitor[Monitoring & Alerts]
    
    Test --> |Fail| Code
    Security --> |Fail| Code
    Validate --> |Fail| Code
    
    style Code fill:#e3f2fd
    style Prod fill:#e8f5e8
    style Monitor fill:#fff3e0
```

## Feature Dependencies

```mermaid
graph TD
    Foundation[Project Foundation] --> Auth[Authentication System]
    Auth --> UserMgmt[User Management]
    UserMgmt --> ProjectMgmt[Project Management]
    ProjectMgmt --> BoardMgmt[Board Management]
    BoardMgmt --> IssueMgmt[Issue Management]
    IssueMgmt --> Kanban[Kanban Board]
    Kanban --> Sprint[Sprint Management]
    Sprint --> AI[AI Integration]
    
    Auth --> Email[Email System]
    UserMgmt --> Roles[Role Management]
    IssueMgmt --> Comments[Comments System]
    IssueMgmt --> TimeTrack[Time Tracking]
    Sprint --> Reports[Reporting]
    AI --> Quota[Quota Management]
    
    style Foundation fill:#e3f2fd
    style Auth fill:#f3e5f5
    style Kanban fill:#e8f5e8
    style AI fill:#fff3e0
```

---

*Last Updated: 2024-01-01*
*Generated from AI Sprint Management App PRD*
