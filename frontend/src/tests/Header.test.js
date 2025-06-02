import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../hooks/useAuth';
import Header from '../components/Layout/Header';

// Mock user data
const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com'
};

// Mock AuthContext
const mockAuthContext = {
  user: mockUser,
  logout: vi.fn()
};

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Header Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the header with user initials instead of avatar image', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Check that user initials are displayed
    expect(screen.getByText('J')).toBeInTheDocument();
    
    // Check that no img tag with avatar is present
    const avatarImages = screen.queryAllByAltText('User avatar');
    expect(avatarImages).toHaveLength(0);
  });

  it('displays correct user initials', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    // Should show first letter of first name
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('shows create button with dropdown', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    expect(createButton).toBeInTheDocument();
    
    // Click to open dropdown
    fireEvent.click(createButton);
    
    // Check dropdown items
    expect(screen.getByText('Create project')).toBeInTheDocument();
    expect(screen.getByText('Create issue')).toBeInTheDocument();
  });

  it('closes create dropdown when clicking outside', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    
    // Open dropdown
    fireEvent.click(createButton);
    expect(screen.getByText('Create project')).toBeInTheDocument();
    
    // Click outside (on document body)
    fireEvent.mouseDown(document.body);
    
    await waitFor(() => {
      expect(screen.queryByText('Create project')).not.toBeInTheDocument();
    });
  });

  it('closes create dropdown when pressing Escape key', async () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    
    // Open dropdown
    fireEvent.click(createButton);
    expect(screen.getByText('Create project')).toBeInTheDocument();
    
    // Press Escape key
    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(screen.queryByText('Create project')).not.toBeInTheDocument();
    });
  });

  it('opens Create Project modal when clicking Create project', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    const createProjectButton = screen.getByText('Create project');
    fireEvent.click(createProjectButton);
    
    // Modal should be opened (we can't easily test the modal content without mocking it)
    // But the dropdown should be closed
    expect(screen.queryByText('Create project')).not.toBeInTheDocument();
  });



  it('opens Create Issue modal when clicking Create issue', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    const createIssueButton = screen.getByText('Create issue');
    fireEvent.click(createIssueButton);
    
    // Dropdown should be closed
    expect(screen.queryByText('Create issue')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    expect(createButton).toHaveAttribute('aria-haspopup', 'true');
    expect(createButton).toHaveAttribute('aria-expanded', 'false');
    
    // Open dropdown
    fireEvent.click(createButton);
    expect(createButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('handles user with no first name gracefully', () => {
    const userWithoutFirstName = {
      id: 1,
      email: 'test@example.com'
    };

    const contextWithoutFirstName = {
      user: userWithoutFirstName,
      logout: vi.fn()
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={contextWithoutFirstName}>
          <Header />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Should show first letter of email
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('shows fallback initial when no user data available', () => {
    const contextWithoutUser = {
      user: null,
      logout: vi.fn()
    };

    render(
      <BrowserRouter>
        <AuthContext.Provider value={contextWithoutUser}>
          <Header />
        </AuthContext.Provider>
      </BrowserRouter>
    );

    // Should show fallback 'U'
    expect(screen.getByText('U')).toBeInTheDocument();
  });
});

describe('Header Dropdown Behavior', () => {
  it('maintains proper focus management', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    
    // Focus and open dropdown
    createButton.focus();
    fireEvent.click(createButton);
    
    expect(createButton).toHaveFocus();
    expect(screen.getByText('Create project')).toBeInTheDocument();
  });

  it('closes dropdown when selecting an option', () => {
    render(
      <TestWrapper>
        <Header />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create');
    fireEvent.click(createButton);
    
    const createProjectOption = screen.getByText('Create project');
    fireEvent.click(createProjectOption);
    
    // Dropdown should be closed
    expect(screen.queryByText('Create project')).not.toBeInTheDocument();
  });
});
