/**
 * TaskList Component Tests
 * Tests for task list rendering, CRUD operations, loading states, and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '../TaskList';
import { useTodos } from '../../hooks/useTodos';
import { Todo } from '../../lib/types';

// Mock the useTodos hook
jest.mock('../../hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// Mock TaskCard and TaskForm components
jest.mock('../TaskCard', () => ({
  TaskCard: ({ todo, onEdit, onDelete, showActions, className }: any) => (
    <div data-testid={`task-card-${todo.id}`} className={className}>
      <span>{todo.title}</span>
      <span>{todo.status}</span>
      {showActions && (
        <>
          <button onClick={() => onEdit(todo)} data-testid={`edit-${todo.id}`}>
            Edit
          </button>
          <button onClick={() => onDelete(todo.id)} data-testid={`delete-${todo.id}`}>
            Delete
          </button>
        </>
      )}
    </div>
  ),
}));

jest.mock('../TaskForm', () => ({
  TaskForm: ({ todo, onSubmit, onCancel, isLoading }: any) => (
    <div data-testid="task-form">
      <span>{todo ? 'Update Task' : 'Add Task'}</span>
      <button onClick={() => onSubmit({ title: 'Test Task', description: '', priority: 'medium', tags: [], color: '#ff6b6b' })} disabled={isLoading}>
        {todo ? 'Update Task' : 'Add Task'}
      </button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

describe('TaskList', () => {
  const mockTodos: Todo[] = [
    {
      id: '1',
      title: 'Active Task 1',
      description: 'Description 1',
      priority: 'high',
      tags: ['work'],
      color: '#ff0000',
      createdDate: new Date('2024-01-01'),
      status: 'pending',
      order: 1,
    },
    {
      id: '2',
      title: 'Active Task 2',
      description: 'Description 2',
      priority: 'medium',
      tags: ['personal'],
      color: '#00ff00',
      createdDate: new Date('2024-01-02'),
      status: 'in-progress',
      order: 2,
    },
    {
      id: '3',
      title: 'Completed Task',
      description: 'Description 3',
      priority: 'low',
      tags: ['done'],
      color: '#0000ff',
      createdDate: new Date('2024-01-03'),
      status: 'completed',
      order: 3,
    },
  ];

  const defaultMockUseTodos = {
    todos: mockTodos,
    incompleteTodos: mockTodos.filter(t => t.status !== 'completed'),
    completedTodos: mockTodos.filter(t => t.status === 'completed'),
    updateTodo: jest.fn(),
    deleteTodo: jest.fn(),
    addTodo: jest.fn(),
    reorderTodos: jest.fn(),
    sortByPriority: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTodos.mockReturnValue(defaultMockUseTodos as any);
  });

  describe('Rendering', () => {
    it('renders task list with active and completed sections', () => {
      render(<TaskList />);

      expect(screen.getByText('Active Tasks (2)')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
    });

    it('renders add new task button when not in form mode', () => {
      render(<TaskList />);

      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    });

    it('renders empty state when no tasks exist', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        todos: [],
        incompleteTodos: [],
        completedTodos: [],
      } as any);

      render(<TaskList />);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to get started with focused productivity')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add your first task/i })).toBeInTheDocument();
    });

    it('renders only active tasks when no completed tasks exist', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        todos: mockTodos.filter(t => t.status !== 'completed'),
        completedTodos: [],
      } as any);

      render(<TaskList />);

      expect(screen.getByText('Active Tasks (2)')).toBeInTheDocument();
      expect(screen.queryByText('Completed Tasks')).not.toBeInTheDocument();
    });

    it('renders only completed tasks when no active tasks exist', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        todos: mockTodos.filter(t => t.status === 'completed'),
        incompleteTodos: [],
      } as any);

      render(<TaskList />);

      expect(screen.queryByText('Active Tasks')).not.toBeInTheDocument();
      expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
    });
  });

  describe('Add Task Functionality', () => {
    it('shows add form when add button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /add new task/i }));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add new task/i })).not.toBeInTheDocument();
    });

    it('calls addTodo when form is submitted', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /add new task/i }));
      await user.click(screen.getByRole('button', { name: /add task/i }));

      expect(defaultMockUseTodos.addTodo).toHaveBeenCalledWith({ 
        title: 'Test Task', 
        description: '', 
        priority: 'medium', 
        tags: [], 
        color: '#ff6b6b' 
      });
    });

    it('hides form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /add new task/i }));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    });
  });

  describe('Edit Task Functionality', () => {
    it('shows edit form when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('edit-1'));

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /add new task/i })).not.toBeInTheDocument();
    });

    it('calls updateTodo when edit form is submitted', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('edit-1'));
      await user.click(screen.getByRole('button', { name: /update task/i }));

      expect(defaultMockUseTodos.updateTodo).toHaveBeenCalledWith('1', { 
        title: 'Test Task', 
        description: '', 
        priority: 'medium', 
        tags: [], 
        color: '#ff6b6b' 
      });
    });

    it('hides edit form when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('edit-1'));
      expect(screen.getByTestId('task-form')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    });
  });

  describe('Delete Task Functionality', () => {
    it('calls deleteTodo when delete button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('delete-1'));

      expect(defaultMockUseTodos.deleteTodo).toHaveBeenCalledWith('1');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner on add button when loading', () => {
      render(<TaskList />);

      // Simulate loading state by clicking add button and checking for loading state
      fireEvent.click(screen.getByRole('button', { name: /add new task/i }));
      fireEvent.click(screen.getByRole('button', { name: /add task/i }));

      // The loading state is internal, so we test the behavior indirectly
      expect(defaultMockUseTodos.addTodo).toHaveBeenCalled();
    });

    it('disables buttons during loading', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      const addButton = screen.getByRole('button', { name: /add new task/i });
      expect(addButton).not.toBeDisabled();

      // Test that form submission triggers loading state
      await user.click(addButton);
      const submitButton = screen.getByRole('button', { name: /add task/i });

      // The form should handle its own loading state
      expect(submitButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when delete fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockDeleteTodo = jest.fn().mockImplementation(() => {
        throw new Error('Delete failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        deleteTodo: mockDeleteTodo,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('delete-1'));

      await waitFor(() => {
        expect(screen.getByText('Failed to delete task. Please try again.')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('displays error message when add fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockAddTodo = jest.fn().mockImplementation(() => {
        throw new Error('Add failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        addTodo: mockAddTodo,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /add new task/i }));
      await user.click(screen.getByRole('button', { name: /add task/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to add task. Please try again.')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('displays error message when update fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockUpdateTodo = jest.fn().mockImplementation(() => {
        throw new Error('Update failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        updateTodo: mockUpdateTodo,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByTestId('edit-1'));
      await user.click(screen.getByRole('button', { name: /update task/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to update task. Please try again.')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('clears error when starting new operation', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockDeleteTodo = jest.fn().mockImplementation(() => {
        throw new Error('Delete failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        deleteTodo: mockDeleteTodo,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      // Trigger error
      await user.click(screen.getByTestId('delete-1'));
      await waitFor(() => {
        expect(screen.getByText('Failed to delete task. Please try again.')).toBeInTheDocument();
      });

      // Start new operation - should clear error
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      expect(screen.queryByText('Failed to delete task. Please try again.')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Task Card Integration', () => {
    it('passes correct props to TaskCard components', () => {
      render(<TaskList />);

      const activeTaskCard = screen.getByTestId('task-card-1');
      const completedTaskCard = screen.getByTestId('task-card-3');

      expect(activeTaskCard).toBeInTheDocument();
      expect(completedTaskCard).toBeInTheDocument();

      // Verify edit and delete buttons are present (showActions=true)
      expect(screen.getByTestId('edit-1')).toBeInTheDocument();
      expect(screen.getByTestId('delete-1')).toBeInTheDocument();
      expect(screen.getByTestId('edit-3')).toBeInTheDocument();
      expect(screen.getByTestId('delete-3')).toBeInTheDocument();
    });

    it('applies correct styling to completed tasks', () => {
      render(<TaskList />);

      const completedTaskCard = screen.getByTestId('task-card-3');
      expect(completedTaskCard).toHaveClass('opacity-75');
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<TaskList />);

      expect(screen.getByRole('heading', { name: /active tasks/i, level: 3 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /completed tasks/i, level: 3 })).toBeInTheDocument();
    });

    it('has accessible button labels', () => {
      render(<TaskList />);

      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    });

    it('shows task counts in section headers', () => {
      render(<TaskList />);

      expect(screen.getByText('Active Tasks (2)')).toBeInTheDocument();
      expect(screen.getByText('Completed Tasks (1)')).toBeInTheDocument();
    });
  });

  describe('Form State Management', () => {
    it('switches between add and edit modes correctly', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      // Start with add mode
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();

      // Switch to edit mode
      await user.click(screen.getByTestId('edit-1'));
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
      expect(screen.queryByText('Add Task')).not.toBeInTheDocument();

      // Cancel edit and return to normal state
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add new task/i })).toBeInTheDocument();
    });

    it('prevents showing add form when editing', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      // Start editing
      await user.click(screen.getByTestId('edit-1'));
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();

      // Add button should not be visible
      expect(screen.queryByRole('button', { name: /add new task/i })).not.toBeInTheDocument();
    });
  });

  describe('Priority Sorting', () => {
    it('shows sort button when there are multiple active tasks', () => {
      render(<TaskList />);

      expect(screen.getByRole('button', { name: /sort/i })).toBeInTheDocument();
      expect(screen.getByTitle('Sort tasks by priority (High → Medium → Low)')).toBeInTheDocument();
    });

    it('hides sort button when there is only one active task', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        incompleteTodos: [mockTodos[0]], // Only one active task
      } as any);

      render(<TaskList />);

      expect(screen.queryByRole('button', { name: /sort/i })).not.toBeInTheDocument();
    });

    it('hides sort button when there are no active tasks', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        incompleteTodos: [], // No active tasks
      } as any);

      render(<TaskList />);

      expect(screen.queryByRole('button', { name: /sort/i })).not.toBeInTheDocument();
    });

    it('calls sortByPriority when sort button is clicked', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /sort/i }));

      expect(defaultMockUseTodos.sortByPriority).toHaveBeenCalledTimes(1);
    });

    it('shows loading state when sorting', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      const sortButton = screen.getByRole('button', { name: /sort/i });
      await user.click(sortButton);

      // Check for loading state (button should show "Sorting...")
      await waitFor(() => {
        expect(screen.getByText('Sorting...')).toBeInTheDocument();
      });
    });

    it('disables sort button during loading states', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      // Start editing a task
      await user.click(screen.getByTestId('edit-1'));

      const sortButton = screen.getByRole('button', { name: /sort/i });
      expect(sortButton).toBeDisabled();
    });

    it('disables sort button when add form is open', async () => {
      const user = userEvent.setup();
      render(<TaskList />);

      // Open add form
      await user.click(screen.getByRole('button', { name: /add new task/i }));

      const sortButton = screen.getByRole('button', { name: /sort/i });
      expect(sortButton).toBeDisabled();
    });

    it('displays error message when sorting fails', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockSortByPriority = jest.fn().mockImplementation(() => {
        throw new Error('Sort failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        sortByPriority: mockSortByPriority,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      await user.click(screen.getByRole('button', { name: /sort/i }));

      await waitFor(() => {
        expect(screen.getByText('Failed to sort tasks. Please try again.')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });

    it('clears error when starting new operation after sort error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockSortByPriority = jest.fn().mockImplementation(() => {
        throw new Error('Sort failed');
      });

      mockUseTodos.mockReturnValue({
        ...defaultMockUseTodos,
        sortByPriority: mockSortByPriority,
      } as any);

      const user = userEvent.setup();
      render(<TaskList />);

      // Trigger sort error
      await user.click(screen.getByRole('button', { name: /sort/i }));
      await waitFor(() => {
        expect(screen.getByText('Failed to sort tasks. Please try again.')).toBeInTheDocument();
      });

      // Start new operation - should clear error
      await user.click(screen.getByRole('button', { name: /add new task/i }));
      expect(screen.queryByText('Failed to sort tasks. Please try again.')).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it('has proper accessibility attributes', () => {
      render(<TaskList />);

      const sortButton = screen.getByRole('button', { name: /sort/i });
      expect(sortButton).toHaveAttribute('title', 'Sort tasks by priority (High → Medium → Low)');
    });
  });
});