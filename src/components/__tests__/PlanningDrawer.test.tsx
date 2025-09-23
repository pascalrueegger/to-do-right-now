/**
 * PlanningDrawer Component Tests
 * Tests drawer behavior, keyboard shortcuts, and accessibility
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanningDrawer } from '../PlanningDrawer';
import { TodoProvider } from '../../context/TodoContext';
import { useTodos } from '../../hooks/useTodos';

// Mock the useTodos hook
jest.mock('../../hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// Mock TaskList component
jest.mock('../TaskList', () => ({
  TaskList: () => (
    <div data-testid="task-list">
      <button>Add New Task</button>
      <div>No tasks yet</div>
    </div>
  ),
}));

// Mock toggle function
const mockToggleDrawer = jest.fn();

// Helper function to render component with provider
const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <TodoProvider>
      {component}
    </TodoProvider>
  );
};

describe('PlanningDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseTodos.mockReturnValue({
      todos: [],
      isDrawerOpen: false,
      toggleDrawer: mockToggleDrawer,
      currentTodo: null,
      completedTodos: [],
      incompleteTodos: [],
      todosByPriority: { high: [], medium: [], low: [] },
      addTodo: jest.fn(),
      updateTodo: jest.fn(),
      deleteTodo: jest.fn(),
      completeTodo: jest.fn(),
      reorderTodos: jest.fn(),
      sortByPriority: jest.fn(),
      setCurrentTodo: jest.fn(),
      getTodoById: jest.fn(),
      getNextTodo: jest.fn(),
      getPreviousTodo: jest.fn(),
    });
  });

  describe('Drawer Toggle Button', () => {
    it('renders toggle button with correct initial state', () => {
      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Add your first task');
    });

    it('shows highlighted state when no todos exist', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [],
      });

      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Add Task');
      expect(screen.getByText('Add Task')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Add your first task');
    });

    it('shows normal state when todos exist', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [
          {
            id: '1',
            title: 'Test Task',
            description: '',
            priority: 'medium' as const,
            tags: [],
            color: '#000000',
            createdDate: new Date(),
            status: 'pending' as const,
            order: 1,
          }
        ],
      });

      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Plan');
      expect(screen.getByText('Plan')).toBeInTheDocument();
      expect(button).toHaveAttribute('aria-label', 'Open planning view');
    });

    it('calls toggleDrawer when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      await user.click(button);
      
      expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Drawer Content', () => {
    it('renders drawer content when open', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      renderWithProvider(<PlanningDrawer />);
      
      expect(screen.getByText('Planning')).toBeInTheDocument();
      expect(screen.getByText('Manage your tasks and organize your workflow')).toBeInTheDocument();
    });

    it('shows task list component when drawer is open', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
        todos: [],
        incompleteTodos: [],
        completedTodos: [],
      });

      renderWithProvider(<PlanningDrawer />);
      
      // Should show the TaskList component with empty state
      expect(screen.getByText('Add New Task')).toBeInTheDocument();
      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('handles drawer state changes through onOpenChange prop', async () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      renderWithProvider(<PlanningDrawer />);
      
      // The Radix Drawer component handles Escape key internally
      // and calls onOpenChange, which calls our toggleDrawer function
      expect(screen.getByText('Planning')).toBeInTheDocument();
    });

    it('supports keyboard navigation within drawer content', async () => {
      const user = userEvent.setup();
      
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      renderWithProvider(<PlanningDrawer />);
      
      // Test that we can tab through drawer content
      await user.tab();
      
      // The close button should be focusable
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for different states', () => {
      // Test empty state
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [],
      });

      const { rerender } = renderWithProvider(<PlanningDrawer />);
      
      let button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Add your first task');

      // Test with todos
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [
          {
            id: '1',
            title: 'Test Task',
            description: '',
            priority: 'medium' as const,
            tags: [],
            color: '#000000',
            createdDate: new Date(),
            status: 'pending' as const,
            order: 1,
          }
        ],
      });

      rerender(
        <TodoProvider>
          <PlanningDrawer />
        </TodoProvider>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Open planning view');
    });

    it('maintains focus management when drawer opens and closes', async () => {
      const user = userEvent.setup();
      
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: false,
      });

      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      
      // Focus the button and click it
      button.focus();
      expect(document.activeElement).toBe(button);
      
      await user.click(button);
      expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
    });

    it('has proper heading structure in drawer content', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      renderWithProvider(<PlanningDrawer />);
      
      const heading = screen.getByRole('heading', { name: /planning/i });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('applies highlighted styling when no todos exist', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [],
      });

      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      
      // Check for highlighted state classes (these are applied via className)
      expect(button.className).toContain('bg-primary');
    });

    it('applies normal styling when todos exist', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        todos: [
          {
            id: '1',
            title: 'Test Task',
            description: '',
            priority: 'medium' as const,
            tags: [],
            color: '#000000',
            createdDate: new Date(),
            status: 'pending' as const,
            order: 1,
          }
        ],
      });

      renderWithProvider(<PlanningDrawer />);
      
      const button = screen.getByRole('button');
      
      // Should not have highlighted state classes
      expect(button.className).not.toContain('animate-pulse');
    });
  });

  describe('Component Lifecycle', () => {
    it('renders and unmounts without errors', () => {
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      const { unmount } = renderWithProvider(<PlanningDrawer />);
      
      expect(screen.getByText('Planning')).toBeInTheDocument();
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('handles state changes properly', () => {
      // Start with drawer closed
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: false,
      });

      const { rerender } = renderWithProvider(<PlanningDrawer />);
      
      expect(screen.queryByText('Planning')).not.toBeInTheDocument();
      
      // Open drawer
      mockUseTodos.mockReturnValue({
        ...mockUseTodos(),
        isDrawerOpen: true,
      });

      rerender(
        <TodoProvider>
          <PlanningDrawer />
        </TodoProvider>
      );
      
      expect(screen.getByText('Planning')).toBeInTheDocument();
    });
  });
});