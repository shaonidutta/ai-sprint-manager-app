import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthContext.Provider value={mockAuthContext}>
      {children}
    </AuthContext.Provider>
  </BrowserRouter>
);

describe('Sidebar Mobile Responsiveness', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sidebar with full height styling', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveStyle({ minHeight: '100vh', height: '100vh' });
  });

  it('shows mobile backdrop when open on mobile', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check for backdrop overlay
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    expect(backdrop).toBeInTheDocument();
  });

  it('does not show backdrop when closed on mobile', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check for no backdrop overlay
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    expect(backdrop).not.toBeInTheDocument();
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const backdrop = document.querySelector('.bg-black.bg-opacity-50');
    fireEvent.click(backdrop);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows close button on mobile', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText('Close sidebar');
    expect(closeButton).toBeInTheDocument();
  });

  it('shows collapse button on desktop', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    expect(collapseButton).toBeInTheDocument();
  });

  it('displays navigation items with modern styling', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check for navigation items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Boards')).toBeInTheDocument();
    expect(screen.getByText('Sprints')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays user profile section', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    // Check for user initials
    expect(screen.getByText('J')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
  });

  it('handles escape key press on mobile', async () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    
    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('applies correct z-index hierarchy', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    const sidebar = screen.getByRole('complementary');
    const backdrop = document.querySelector('.bg-black.bg-opacity-50');

    expect(sidebar).toHaveClass('z-40');
    expect(backdrop).toHaveClass('z-30');
  });

  it('shows hover effects on navigation items', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveClass('hover:bg-gray-800', 'hover:text-white');
  });

  it('handles collapsed state properly', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    // In collapsed state, text should be hidden but icons visible
    const sidebar = screen.getByRole('complementary');
    expect(sidebar).toHaveClass('w-16');
  });
});

describe('Sidebar Accessibility', () => {
  const mockOnClose = vi.fn();

  it('has proper ARIA labels', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={true} isOpen={true} onClose={mockOnClose} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Close sidebar')).toBeInTheDocument();
  });

  it('provides tooltips in collapsed state', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    // Check for title attributes on navigation items
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('title');
  });

  it('maintains focus management', () => {
    render(
      <TestWrapper>
        <Sidebar isMobile={false} isOpen={false} onClose={mockOnClose} />
      </TestWrapper>
    );

    const firstNavItem = screen.getByText('Dashboard').closest('a');
    firstNavItem.focus();
    expect(document.activeElement).toBe(firstNavItem);
  });
});
