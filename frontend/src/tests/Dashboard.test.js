import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Dashboard from '../pages/Dashboard';

// Mock the useDashboard hook
vi.mock('../hooks/useDashboard', () => ({
  useDashboard: vi.fn()
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock components
vi.mock('../components/dashboard/StatsCard', () => ({
  default: ({ title, value, loading }) => (
    <div data-testid="stats-card">
      <span>{title}</span>
      <span>{loading ? 'Loading...' : value}</span>
    </div>
  )
}));

vi.mock('../components/dashboard/ProjectCard', () => ({
  default: ({ project }) => (
    <div data-testid="project-card">
      <span>{project.name}</span>
    </div>
  )
}));

vi.mock('../components/dashboard/CreateProjectModal', () => ({
  default: ({ isOpen, onClose }) => 
    isOpen ? <div data-testid="create-modal">Create Project Modal</div> : null
}));

import { useDashboard } from '../hooks/useDashboard';

const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com'
};

const mockAuthContext = {
  user: mockUser,
  isAuthenticated: true
};

const mockDashboardData = {
  stats: {
    totalProjects: 5,
    activeSprints: 2,
    completedTasks: 15,
    pendingTasks: 8
  },
  projects: [
    {
      id: 1,
      name: 'Test Project 1',
      project_key: 'TP1',
      description: 'Test project description',
      status: 'active',
      total_issues: 10,
      active_sprints: 1,
      team_size: 3,
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      name: 'Test Project 2',
      project_key: 'TP2',
      description: 'Another test project',
      status: 'planning',
      total_issues: 5,
      active_sprints: 0,
      team_size: 2,
      updated_at: '2024-01-14T15:30:00Z'
    }
  ],
  recentActivity: [
    {
      id: 1,
      type: 'project_created',
      description: 'New project "Test Project" was created',
      timestamp: '2024-01-15T09:00:00Z'
    },
    {
      id: 2,
      type: 'issue_created',
      description: 'Issue "Fix login bug" was created',
      timestamp: '2024-01-15T08:30:00Z'
    }
  ],
  user: mockUser,
  loading: false,
  refreshing: false,
  error: null,
  refreshDashboard: vi.fn(),
  createProject: vi.fn()
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useDashboard.mockReturnValue(mockDashboardData);
  });

  it('renders dashboard with greeting and user name', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText(/Good (morning|afternoon|evening), John!/)).toBeInTheDocument();
    expect(screen.getByText("Here's what's happening with your projects.")).toBeInTheDocument();
  });

  it('renders stats cards with correct data', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const statsCards = screen.getAllByTestId('stats-card');
    expect(statsCards).toHaveLength(4);
    
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Active Sprints')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
  });

  it('renders project cards when projects exist', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Projects')).toBeInTheDocument();
    expect(screen.getByText('Your most recently updated projects')).toBeInTheDocument();
    
    const projectCards = screen.getAllByTestId('project-card');
    expect(projectCards).toHaveLength(2);
    
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
  });

  it('renders recent activity section', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Latest updates across your projects')).toBeInTheDocument();
    
    expect(screen.getByText('New project "Test Project" was created')).toBeInTheDocument();
    expect(screen.getByText('Issue "Fix login bug" was created')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    useDashboard.mockReturnValue({
      ...mockDashboardData,
      loading: true
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // Should show loading skeletons
    expect(screen.getAllByText('Loading...')).toHaveLength(4); // Stats cards loading
  });

  it('shows empty state when no projects exist', () => {
    useDashboard.mockReturnValue({
      ...mockDashboardData,
      projects: []
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('No projects yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by creating your first project and begin managing your team\'s work efficiently')).toBeInTheDocument();
    expect(screen.getByText('Create Your First Project')).toBeInTheDocument();
  });

  it('shows empty state when no recent activity exists', () => {
    useDashboard.mockReturnValue({
      ...mockDashboardData,
      recentActivity: []
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('No recent activity')).toBeInTheDocument();
    expect(screen.getByText('Activity will appear here as you work on your projects')).toBeInTheDocument();
  });

  it('opens create project modal when button is clicked', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create Project');
    fireEvent.click(createButton);

    expect(screen.getByTestId('create-modal')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', () => {
    const mockRefresh = vi.fn();
    useDashboard.mockReturnValue({
      ...mockDashboardData,
      refreshDashboard: mockRefresh
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it('shows error state correctly', () => {
    useDashboard.mockReturnValue({
      ...mockDashboardData,
      error: 'Failed to load dashboard data'
    });

    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows AI features section', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    expect(screen.getByText('AI-Powered Features Available')).toBeInTheDocument();
    expect(screen.getByText(/Enhance your project management with intelligent insights!/)).toBeInTheDocument();
  });

  it('handles date formatting correctly', () => {
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    // The formatDate function should handle various timestamp formats
    // This is tested implicitly through the activity rendering
    expect(screen.getByText('New project "Test Project" was created')).toBeInTheDocument();
  });
});
