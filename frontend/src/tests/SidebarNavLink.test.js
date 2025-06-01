import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Layout/Sidebar';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
    div: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }) => children
}));

// Mock user data
const mockUser = {
  id: 1,
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com'
};

// Mock AuthContext
const mockAuthContext = {
  user: mockUser
};

// Test wrapper component with specific route
const TestWrapper = ({ children, initialEntries = ['/dashboard'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </MemoryRouter>
);

describe('Sidebar NavLink isActive Fix', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without isActive reference error', () => {
    expect(() => {
      render(
        <TestWrapper>
          <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('displays navigation items correctly', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check that all navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Boards')).toBeInTheDocument();
    expect(screen.getByText('Sprints')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('applies active styles to current route', () => {
    render(
      <TestWrapper initialEntries={['/dashboard']}>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    // Check that the active link has the correct classes
    expect(dashboardLink).toHaveClass('bg-blue-600', 'text-white', 'shadow-sm');
  });

  it('applies inactive styles to non-current routes', () => {
    render(
      <TestWrapper initialEntries={['/dashboard']}>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const projectsLink = screen.getByText('Projects').closest('a');
    
    // Check that inactive links have the correct classes
    expect(projectsLink).toHaveClass('text-gray-300');
    expect(projectsLink).not.toHaveClass('bg-blue-600');
  });

  it('renders icons with correct styling based on active state', () => {
    render(
      <TestWrapper initialEntries={['/dashboard']}>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // The icons should be rendered without throwing errors
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const icon = dashboardLink.querySelector('svg');
    
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('h-5', 'w-5', 'flex-shrink-0', 'transition-colors', 'duration-150');
  });

  it('renders active indicator for current route when not collapsed', () => {
    render(
      <TestWrapper initialEntries={['/dashboard']}>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const indicator = dashboardLink.querySelector('.bg-blue-300');
    
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass('ml-auto', 'w-1', 'h-6', 'rounded-full');
  });

  it('handles different routes correctly', () => {
    const routes = ['/dashboard', '/projects', '/board', '/sprints', '/settings'];
    
    routes.forEach(route => {
      const { unmount } = render(
        <TestWrapper initialEntries={[route]}>
          <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
        </TestWrapper>
      );
      
      // Should render without errors for each route
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      
      unmount();
    });
  });

  it('works correctly in collapsed state', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Should render without errors even when collapsed
    expect(screen.getByRole('complementary')).toBeInTheDocument();
  });

  it('maintains hover effects on navigation items', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const projectsLink = screen.getByText('Projects').closest('a');
    
    // Check for hover classes
    expect(projectsLink).toHaveClass('hover:bg-gray-800', 'hover:text-white');
  });

  it('applies transition classes correctly', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    // Check for transition classes
    expect(dashboardLink).toHaveClass('transition-all', 'duration-150', 'ease-in-out');
  });
});

describe('Sidebar NavLink Accessibility', () => {
  const mockOnClose = vi.fn();

  it('provides proper titles for collapsed state', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // In collapsed state, links should have title attributes
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('title');
  });

  it('maintains proper link semantics', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // All navigation items should be proper links
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
    });
  });
});
