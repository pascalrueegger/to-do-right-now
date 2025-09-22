/**
 * DoingView Component Tests
 * Tests for the main focused view component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DoingView } from '../DoingView';
import { useTodos } from '../../hooks/useTodos';
import { Todo } from '../../lib/types';

// Mock the useTodos hook
jest.mock('../../hooks/useTodos');
const mockUseTodos = useTodos as jest.MockedFunction<typeof useTodos>;

// Mock data
const mockTodo: Todo = {
  id: '1',
  title: 'Test Task',
  description: 'This is a test task description',
  priority: 'high',
  tags: ['work', 'urgent'],
  color: '#ff6b6b',
  createdDate: new Date('2024-01-01T10:00:00Z'),
  status: 'pending',
  order: 1
};

const mockTodoWithoutDescription: Todo = {
  ...mockTodo,
  id: '2',
  title: 'Task without description',
  description: '',
  tags: [],
  priority: 'medium'
};

const mockTodoLowPriority: Todo = {
  ...mockTodo,
  id: '3',
  priority: 'low'
};

const defaultMockReturn = {
  currentTodo: null,
  incompleteTodos: [],
  completedTodos: [],
  todos: [],
  completeTodo: jest.fn(),
  toggleDrawer: jest.fn(),
};

describe('DoingView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty States', () => {
    it('renders no-tasks empty state when no todos exist', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todos: [],
      });

      render(<DoingView />);

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Start by adding your first task to get organized and focused.')).toBeInTheDocument();
      expect(screen.getByText('Add your first task')).toBeInTheDocument();
    });

    it('renders all-completed empty state when all tasks are completed', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todos: [{ ...mockTodo, status: 'completed' }],
        completedTodos: [{ ...mockTodo, status: 'completed' }],
        incompleteTodos: [],
      });

      render(<DoingView />);

      expect(screen.getByText('All tasks completed!')).toBeInTheDocument();
      expect(screen.getByText('Great job! You\'ve completed all your tasks. Time to add new ones or take a well-deserved break.')).toBeInTheDocument();
      expect(screen.getByText('Add more tasks')).toBeInTheDocument();
    });

    it('renders no-current-task empty state when tasks exist but none are current', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        todos: [mockTodo],
        currentTodo: null,
        incompleteTodos: [],
        completedTodos: [],
      });

      render(<DoingView />);

      expect(screen.getByText('No current task')).toBeInTheDocument();
      expect(screen.getByText('All your tasks are either completed or none are available. Add a new task to get started.')).toBeInTheDocument();
    });

    it('calls toggleDrawer when add task button is clicked in empty state', () => {
      const mockToggleDrawer = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        toggleDrawer: mockToggleDrawer,
      });

      render(<DoingView />);

      const addButton = screen.getByText('Add your first task');
      fireEvent.click(addButton);

      expect(mockToggleDrawer).toHaveBeenCalledTimes(1);
    });
  });

  describe('Current Task Display', () => {
    it('renders current task with all details', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      // Check title
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      
      // Check description
      expect(screen.getByText('This is a test task description')).toBeInTheDocument();
      
      // Check priority badge
      expect(screen.getByText('High Priority')).toBeInTheDocument();
      
      // Check tags
      expect(screen.getByText('Tags')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      
      // Check complete button
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    });

    it('renders task without description correctly', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodoWithoutDescription,
        todos: [mockTodoWithoutDescription],
        incompleteTodos: [mockTodoWithoutDescription],
      });

      render(<DoingView />);

      expect(screen.getByText('Task without description')).toBeInTheDocument();
      expect(screen.queryByText('This is a test task description')).not.toBeInTheDocument();
      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('renders task without tags correctly', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodoWithoutDescription,
        todos: [mockTodoWithoutDescription],
        incompleteTodos: [mockTodoWithoutDescription],
      });

      render(<DoingView />);

      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
      expect(screen.queryByText('work')).not.toBeInTheDocument();
    });

    it('displays correct priority badge variants', () => {
      // Test high priority
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      const { rerender } = render(<DoingView />);
      expect(screen.getByText('High Priority')).toBeInTheDocument();

      // Test medium priority
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodoWithoutDescription,
        todos: [mockTodoWithoutDescription],
        incompleteTodos: [mockTodoWithoutDescription],
      });

      rerender(<DoingView />);
      expect(screen.getByText('Medium Priority')).toBeInTheDocument();

      // Test low priority
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodoLowPriority,
        todos: [mockTodoLowPriority],
        incompleteTodos: [mockTodoLowPriority],
      });

      rerender(<DoingView />);
      expect(screen.getByText('Low Priority')).toBeInTheDocument();
    });

    it('displays color indicator with correct background color', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      const colorIndicator = screen.getByTitle('Task color');
      expect(colorIndicator).toHaveStyle({ backgroundColor: '#ff6b6b' });
    });

    it('displays created date', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      // Check that some date is displayed (the exact format may vary)
      expect(screen.getByText(/Jan 1, 2024/)).toBeInTheDocument();
    });
  });

  describe('Task Completion', () => {
    it('calls completeTodo when Mark Complete button is clicked', () => {
      const mockCompleteTodo = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
        completeTodo: mockCompleteTodo,
      });

      render(<DoingView />);

      const completeButton = screen.getByText('Mark Complete');
      fireEvent.click(completeButton);

      expect(mockCompleteTodo).toHaveBeenCalledWith('1');
      expect(mockCompleteTodo).toHaveBeenCalledTimes(1);
    });

    it('does not call completeTodo when no current task exists', () => {
      const mockCompleteTodo = jest.fn();
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        completeTodo: mockCompleteTodo,
      });

      render(<DoingView />);

      // Complete button should not be visible in empty state
      expect(screen.queryByText('Mark Complete')).not.toBeInTheDocument();
      expect(mockCompleteTodo).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Task');
    });

    it('has accessible button for task completion', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      const completeButton = screen.getByRole('button', { name: /mark complete/i });
      expect(completeButton).toBeInTheDocument();
      expect(completeButton).toBeEnabled();
    });

    it('has proper color indicator with title attribute', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      render(<DoingView />);

      const colorIndicator = screen.getByTitle('Task color');
      expect(colorIndicator).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies custom className when provided', () => {
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: mockTodo,
        todos: [mockTodo],
        incompleteTodos: [mockTodo],
      });

      const { container } = render(<DoingView className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('handles long task titles with proper word breaking', () => {
      const longTitleTodo = {
        ...mockTodo,
        title: 'This is a very long task title that should break properly on smaller screens and not overflow the container'
      };

      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: longTitleTodo,
        todos: [longTitleTodo],
        incompleteTodos: [longTitleTodo],
      });

      render(<DoingView />);

      const title = screen.getByText(longTitleTodo.title);
      expect(title).toHaveClass('break-words');
    });

    it('handles multiline descriptions with proper whitespace preservation', () => {
      const multilineDescriptionTodo = {
        ...mockTodo,
        description: 'Line 1\nLine 2\nLine 3'
      };

      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: multilineDescriptionTodo,
        todos: [multilineDescriptionTodo],
        incompleteTodos: [multilineDescriptionTodo],
      });

      render(<DoingView />);

      // Find the paragraph element that contains the description
      const descriptionElement = screen.getByText(/Line 1/);
      expect(descriptionElement).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('Edge Cases', () => {
    it('handles task with empty tags array', () => {
      const noTagsTodo = { ...mockTodo, tags: [] };
      
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: noTagsTodo,
        todos: [noTagsTodo],
        incompleteTodos: [noTagsTodo],
      });

      render(<DoingView />);

      expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    });

    it('handles task with invalid priority gracefully', () => {
      const invalidPriorityTodo = { ...mockTodo, priority: 'invalid' as any };
      
      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: invalidPriorityTodo,
        todos: [invalidPriorityTodo],
        incompleteTodos: [invalidPriorityTodo],
      });

      render(<DoingView />);

      // Should still render the task, just with default badge styling
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('handles very old task dates', () => {
      const oldTodo = {
        ...mockTodo,
        createdDate: new Date('2020-01-01T10:00:00Z')
      };

      mockUseTodos.mockReturnValue({
        ...defaultMockReturn,
        currentTodo: oldTodo,
        todos: [oldTodo],
        incompleteTodos: [oldTodo],
      });

      render(<DoingView />);

      // Should display formatted date for old tasks
      expect(screen.getByText(/Jan 1, 2020/)).toBeInTheDocument();
    });
  });
});