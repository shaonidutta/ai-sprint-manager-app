import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import * as projectsApi from '../api/endpoints/projects';
import * as boardsApi from '../api/endpoints/boards';

// Mock the API modules
vi.mock('../api/endpoints/projects');
vi.mock('../api/endpoints/boards');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '5' }),
  };
});

const mockProject = {
  id: 5,
  name: 'Customer Portal - V1',
  project_key: 'CUSTOM',
  description: 'Self-service customer portal redesign',
  created_at: '2025-06-02T00:00:00Z',
  updated_at: '2025-06-02T00:00:00Z',
};

const mockBoards = [
  {
    id: 1,
    name: 'Main Board',
    description: 'Primary project board',
    is_default: true,
  },
  {
    id: 2,
    name: 'Development Board',
    description: 'Development tasks board',
    is_default: false,
  },
];

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('ProjectDetailPage Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectsApi.getById.mockResolvedValue({ data: mockProject });
    boardsApi.getAll.mockResolvedValue({ data: mockBoards });
  });

  describe('Navigation Enhancement', () => {
    test('renders back navigation button', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /back to projects/i })).toBeInTheDocument();
      });
    });

    test('back navigation button navigates to projects page', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to projects/i });
        fireEvent.click(backButton);
        expect(mockNavigate).toHaveBeenCalledWith('/projects');
      });
    });

    test('back button has proper hover animation classes', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to projects/i });
        expect(backButton).toHaveClass('transition-colors', 'duration-150', 'group');
      });
    });
  });

  describe('UI/UX Improvements', () => {
    test('renders enhanced project header with gradient avatar', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Customer Portal - V1')).toBeInTheDocument();
        expect(screen.getByText('CUSTOM')).toBeInTheDocument();
        expect(screen.getByText('Self-service customer portal redesign')).toBeInTheDocument();
      });
    });

    test('renders enhanced tab navigation with proper styling', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const overviewTab = screen.getByRole('button', { name: /overview/i });
        expect(overviewTab).toHaveClass('transition-all', 'duration-150');
      });
    });

    test('renders enhanced overview cards with icons and improved spacing', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Project Details')).toBeInTheDocument();
        expect(screen.getByText('Quick Stats')).toBeInTheDocument();
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });
    });

    test('buttons have proper minimum touch target size for mobile', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const createBoardButton = screen.getByRole('button', { name: /create first board/i });
        expect(createBoardButton).toHaveClass('min-h-[44px]');
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders responsive grid classes for overview cards', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const overviewSection = screen.getByText('Project Details').closest('.grid');
        expect(overviewSection).toHaveClass('grid-cols-1', 'lg:grid-cols-3');
      });
    });

    test('renders responsive header layout', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const headerSection = screen.getByText('Customer Portal - V1').closest('.flex');
        expect(headerSection).toHaveClass('flex-col', 'lg:flex-row');
      });
    });

    test('renders responsive tab navigation', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const tabButton = screen.getByRole('button', { name: /overview/i });
        expect(tabButton).toHaveClass('flex-1');
      });
    });
  });

  describe('Boards Section Enhancement', () => {
    test('renders enhanced boards header with description', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      // Switch to boards tab
      await waitFor(() => {
        const boardsTab = screen.getByRole('button', { name: /boards/i });
        fireEvent.click(boardsTab);
      });

      await waitFor(() => {
        expect(screen.getByText('Project Boards')).toBeInTheDocument();
        expect(screen.getByText('Manage and organize your project work with boards')).toBeInTheDocument();
      });
    });

    test('renders enhanced board list with hover effects', async () => {
      renderWithRouter(<ProjectDetailPage />);

      // Switch to boards tab
      await waitFor(() => {
        const boardsTab = screen.getByRole('button', { name: /boards/i });
        fireEvent.click(boardsTab);
      });

      await waitFor(() => {
        const boardItem = screen.getByText('Main Board').closest('.group');
        expect(boardItem).toHaveClass('hover:bg-neutral-50', 'transition-all', 'duration-150');
      });
    });

    test('board list items have proper accessibility attributes', async () => {
      renderWithRouter(<ProjectDetailPage />);

      // Switch to boards tab
      await waitFor(() => {
        const boardsTab = screen.getByRole('button', { name: /boards/i });
        fireEvent.click(boardsTab);
      });

      await waitFor(() => {
        const boardItem = screen.getByText('Main Board').closest('[role="button"]');
        expect(boardItem).toHaveAttribute('role', 'button');
        expect(boardItem).toHaveAttribute('tabIndex', '0');
        expect(boardItem).toHaveAttribute('aria-label', 'Open Main Board board');
      });
    });

    test('board list has proper responsive design', async () => {
      renderWithRouter(<ProjectDetailPage />);

      // Switch to boards tab
      await waitFor(() => {
        const boardsTab = screen.getByRole('button', { name: /boards/i });
        fireEvent.click(boardsTab);
      });

      await waitFor(() => {
        const boardItem = screen.getByText('Main Board').closest('.group');
        expect(boardItem).toHaveClass('min-h-[44px]'); // Mobile touch target

        const boardContent = boardItem.querySelector('.flex');
        expect(boardContent).toHaveClass('flex-col', 'sm:flex-row', 'sm:items-center', 'sm:justify-between');
      });
    });
  });

  describe('AI Features Enhancement', () => {
    test('renders enhanced AI features section', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      // Switch to AI tab
      await waitFor(() => {
        const aiTab = screen.getByRole('button', { name: /ai features/i });
        fireEvent.click(aiTab);
      });

      await waitFor(() => {
        expect(screen.getByText('AI-Powered Features')).toBeInTheDocument();
        expect(screen.getByText('Sprint Planning Assistant')).toBeInTheDocument();
        expect(screen.getByText('Scope Creep Detection')).toBeInTheDocument();
        expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
        expect(screen.getByText('Sprint Retrospective Insights')).toBeInTheDocument();
      });
    });

    test('AI feature cards have proper hover animations', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      // Switch to AI tab
      await waitFor(() => {
        const aiTab = screen.getByRole('button', { name: /ai features/i });
        fireEvent.click(aiTab);
      });

      await waitFor(() => {
        const sprintPlanningCard = screen.getByText('Sprint Planning Assistant').closest('.group');
        expect(sprintPlanningCard).toHaveClass('hover:shadow-lg', 'transition-all', 'duration-300', 'hover:scale-105');
      });
    });
  });

  describe('Loading State Enhancement', () => {
    test('renders enhanced loading skeleton with proper structure', async () => {
      projectsApi.getById.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithRouter(<ProjectDetailPage />);
      
      // Check for enhanced loading skeleton elements
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      // Check for responsive container
      const loadingContainer = document.querySelector('.max-w-7xl');
      expect(loadingContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('back navigation button has proper aria-label', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: /back to projects/i });
        expect(backButton).toHaveAttribute('aria-label', 'Back to Projects');
      });
    });

    test('breadcrumb navigation has proper aria-label', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
        expect(breadcrumb).toBeInTheDocument();
      });
    });

    test('buttons have sufficient contrast and focus states', async () => {
      renderWithRouter(<ProjectDetailPage />);
      
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          // Check that buttons have transition classes for focus states
          expect(button.className).toMatch(/transition/);
        });
      });
    });
  });
});
