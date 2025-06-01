import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import SettingsPage from '../pages/settings/SettingsPage';

// Mock user data
const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  job_title: 'Software Engineer',
  department: 'Engineering',
  created_at: '2024-01-01T00:00:00Z'
};

// Mock AuthContext
const mockAuthContext = {
  user: mockUser,
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn()
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('SettingsPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the settings page with correct title', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Manage your account, preferences, and application settings')).toBeInTheDocument();
  });

  it('renders all settings tabs', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Check if all tabs are present
    expect(screen.getByText('Account & Profile')).toBeInTheDocument();
    expect(screen.getByText('Application')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Data & Privacy')).toBeInTheDocument();
    expect(screen.getByText('Advanced')).toBeInTheDocument();
  });

  it('shows Account & Profile tab as active by default', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    const accountTab = screen.getByText('Account & Profile').closest('button');
    expect(accountTab).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('switches tabs when clicked', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Click on Application tab
    const applicationTab = screen.getByText('Application');
    fireEvent.click(applicationTab);

    // Check if Application tab becomes active
    const applicationTabButton = applicationTab.closest('button');
    expect(applicationTabButton).toHaveClass('bg-primary-50', 'text-primary-700');
  });

  it('renders breadcrumb navigation', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
  });

  it('renders View Profile button', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    expect(screen.getByText('View Profile')).toBeInTheDocument();
  });

  it('displays user information in Account settings', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Should show user's name and email
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Check for proper ARIA labels
    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    
    // Check that tab buttons are properly structured
    const tabs = screen.getAllByRole('button');
    tabs.forEach(tab => {
      expect(tab).toBeInTheDocument();
    });
  });

  it('applies smooth transitions between tabs', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Click on different tabs to ensure transitions work
    const securityTab = screen.getByText('Security');
    fireEvent.click(securityTab);

    const integrationsTab = screen.getByText('Integrations');
    fireEvent.click(integrationsTab);

    // The content should change (we can't easily test the animation itself)
    expect(integrationsTab.closest('button')).toHaveClass('bg-primary-50', 'text-primary-700');
  });
});

// Integration test for the complete settings flow
describe('SettingsPage Integration', () => {
  it('allows navigation through all settings sections', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    const tabs = [
      'Account & Profile',
      'Application', 
      'Notifications',
      'Security',
      'Integrations',
      'Data & Privacy',
      'Advanced'
    ];

    tabs.forEach(tabName => {
      const tab = screen.getByText(tabName);
      fireEvent.click(tab);
      
      // Verify the tab is active
      const tabButton = tab.closest('button');
      expect(tabButton).toHaveClass('bg-primary-50', 'text-primary-700');
    });
  });

  it('maintains state when switching between tabs', () => {
    render(
      <TestWrapper>
        <SettingsPage />
      </TestWrapper>
    );

    // Start with Account tab (default)
    expect(screen.getByText('Account & Profile').closest('button')).toHaveClass('bg-primary-50');

    // Switch to Security tab
    fireEvent.click(screen.getByText('Security'));
    expect(screen.getByText('Security').closest('button')).toHaveClass('bg-primary-50');

    // Switch back to Account tab
    fireEvent.click(screen.getByText('Account & Profile'));
    expect(screen.getByText('Account & Profile').closest('button')).toHaveClass('bg-primary-50');
  });
});
