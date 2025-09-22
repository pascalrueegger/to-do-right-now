/**
 * Unit tests for useTodos hook
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useTodos } from '../useTodos';
import { TodoProvider } from '../../context/TodoContext';
import { Todo } from '../../lib/types';

// Mock useLocalStorage hook
jest.mock('../useLocalStorage', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: { todos: [], settings: { lastOpenedDrawer: false } },
    updateTodos: jest.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
    isStorageAvailable: true,
  })),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TodoProvider>{children}</TodoProvider>
);

// Helper function to create a test todo
const createTestTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: crypto.randomUUID(),
  title: 'Test Todo',
  description: 'Test description',
  priority: 'medium',
  tags: ['test'],
  color: '#6366f1',
  createdDate: new Date(),
  status: 'pending',
  order: 1,
  ...overrides,
});

describe('useTodos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial empty state', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      expect(result.current.todos).toEqual([]);
      expect(result.current.currentTodo).toBeNull();
      expect(result.current.isDrawerOpen).toBe(false);
      expect(result.current.completedTodos).toEqual([]);
      expect(result.current.incompleteTodos).toEqual([]);
    });

    it('should provide correct todosByPriority structure', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      expect(result.current.todosByPriority).toEqual({
        high: [],
        medium: [],
        low: [],
      });
    });
  });

  describe('Todo Operations', () => {
    it('should add a new todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.addTodo({
          title: 'New Todo',
          description: 'New description',
          priority: 'high',
          tags: ['work'],
          color: '#ff0000',
        });
      });

      expect(result.current.todos).toHaveLength(1);
      expect(result.current.todos[0]).toMatchObject({
        title: 'New Todo',
        description: 'New description',
        priority: 'high',
        tags: ['work'],
        color: '#ff0000',
      });
      expect(result.current.currentTodo).toBe(result.current.todos[0]);
    });

    it('should update an existing todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo first
      act(() => {
        result.current.addTodo({
          title: 'Original Todo',
          description: 'Original description',
          priority: 'medium',
          tags: ['original'],
          color: '#0000ff',
        });
      });

      const todoId = result.current.todos[0].id;

      // Update the todo
      act(() => {
        result.current.updateTodo(todoId, {
          title: 'Updated Todo',
          priority: 'high',
          tags: ['updated'],
        });
      });

      const updatedTodo = result.current.todos[0];
      expect(updatedTodo.title).toBe('Updated Todo');
      expect(updatedTodo.priority).toBe('high');
      expect(updatedTodo.tags).toEqual(['updated']);
      expect(updatedTodo.description).toBe('Original description'); // Should remain unchanged
    });

    it('should delete a todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo first
      act(() => {
        result.current.addTodo({
          title: 'Todo to Delete',
          description: 'Will be deleted',
          priority: 'low',
          tags: ['delete'],
          color: '#ff0000',
        });
      });

      expect(result.current.todos).toHaveLength(1);
      const todoId = result.current.todos[0].id;

      // Delete the todo
      act(() => {
        result.current.deleteTodo(todoId);
      });

      expect(result.current.todos).toHaveLength(0);
      expect(result.current.currentTodo).toBeNull();
    });

    it('should complete a todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo first
      act(() => {
        result.current.addTodo({
          title: 'Todo to Complete',
          description: 'Will be completed',
          priority: 'medium',
          tags: ['complete'],
          color: '#00ff00',
        });
      });

      const todoId = result.current.todos[0].id;
      expect(result.current.todos[0].status).toBe('pending');

      // Complete the todo
      act(() => {
        result.current.completeTodo(todoId);
      });

      expect(result.current.todos[0].status).toBe('completed');
      expect(result.current.currentTodo).toBeNull(); // No more incomplete todos
    });
  });

  describe('Computed Values', () => {
    it('should correctly compute completedTodos and incompleteTodos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add multiple todos with different statuses
      act(() => {
        result.current.addTodo({
          title: 'Pending Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'In Progress Todo',
          description: '',
          priority: 'high',
          tags: [],
          color: '#6366f1',
        });
      });

      // Update second todo to in-progress
      const secondTodoId = result.current.todos[1].id;
      act(() => {
        result.current.updateTodo(secondTodoId, { status: 'in-progress' });
      });

      // Complete first todo
      const firstTodoId = result.current.todos[0].id;
      act(() => {
        result.current.completeTodo(firstTodoId);
      });

      expect(result.current.completedTodos).toHaveLength(1);
      expect(result.current.completedTodos[0].title).toBe('Pending Todo');
      
      expect(result.current.incompleteTodos).toHaveLength(1);
      expect(result.current.incompleteTodos[0].title).toBe('In Progress Todo');
    });

    it('should correctly compute todosByPriority', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add todos with different priorities
      act(() => {
        result.current.addTodo({
          title: 'High Priority Todo',
          description: '',
          priority: 'high',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Medium Priority Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Low Priority Todo',
          description: '',
          priority: 'low',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Another High Priority Todo',
          description: '',
          priority: 'high',
          tags: [],
          color: '#6366f1',
        });
      });

      expect(result.current.todosByPriority.high).toHaveLength(2);
      expect(result.current.todosByPriority.medium).toHaveLength(1);
      expect(result.current.todosByPriority.low).toHaveLength(1);
      
      expect(result.current.todosByPriority.high[0].title).toBe('High Priority Todo');
      expect(result.current.todosByPriority.high[1].title).toBe('Another High Priority Todo');
    });

    it('should sort incompleteTodos by order', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add todos
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Second Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Third Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      // Reorder todos (move third to first)
      const todos = result.current.todos;
      const reorderedTodos = [todos[2], todos[0], todos[1]];
      
      act(() => {
        result.current.reorderTodos(reorderedTodos);
      });

      expect(result.current.incompleteTodos[0].title).toBe('Third Todo');
      expect(result.current.incompleteTodos[1].title).toBe('First Todo');
      expect(result.current.incompleteTodos[2].title).toBe('Second Todo');
    });
  });

  describe('Utility Functions', () => {
    it('should get todo by id', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.addTodo({
          title: 'Test Todo',
          description: 'Test description',
          priority: 'medium',
          tags: ['test'],
          color: '#6366f1',
        });
      });

      const todoId = result.current.todos[0].id;
      const foundTodo = result.current.getTodoById(todoId);

      expect(foundTodo).toBeDefined();
      expect(foundTodo?.title).toBe('Test Todo');
    });

    it('should return undefined for non-existent todo id', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      const foundTodo = result.current.getTodoById('non-existent-id');
      expect(foundTodo).toBeUndefined();
    });

    it('should get next todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add multiple todos
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Second Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Third Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const firstTodoId = result.current.todos[0].id;
      const nextTodo = result.current.getNextTodo(firstTodoId);

      expect(nextTodo).toBeDefined();
      expect(nextTodo?.title).toBe('Second Todo');
    });

    it('should return null for next todo when at the end', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a single todo
      act(() => {
        result.current.addTodo({
          title: 'Only Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const todoId = result.current.todos[0].id;
      const nextTodo = result.current.getNextTodo(todoId);

      expect(nextTodo).toBeNull();
    });

    it('should get previous todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add multiple todos
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Second Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const secondTodoId = result.current.todos[1].id;
      const previousTodo = result.current.getPreviousTodo(secondTodoId);

      expect(previousTodo).toBeDefined();
      expect(previousTodo?.title).toBe('First Todo');
    });

    it('should return null for previous todo when at the beginning', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const todoId = result.current.todos[0].id;
      const previousTodo = result.current.getPreviousTodo(todoId);

      expect(previousTodo).toBeNull();
    });
  });

  describe('Drawer Operations', () => {
    it('should toggle drawer state', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      expect(result.current.isDrawerOpen).toBe(false);

      act(() => {
        result.current.toggleDrawer();
      });

      expect(result.current.isDrawerOpen).toBe(true);

      act(() => {
        result.current.toggleDrawer();
      });

      expect(result.current.isDrawerOpen).toBe(false);
    });
  });

  describe('Sorting and Reordering', () => {
    it('should sort todos by priority', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add todos with different priorities
      act(() => {
        result.current.addTodo({
          title: 'Low Priority Todo',
          description: '',
          priority: 'low',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'High Priority Todo',
          description: '',
          priority: 'high',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Medium Priority Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      // Sort by priority
      act(() => {
        result.current.sortByPriority();
      });

      expect(result.current.todos[0].title).toBe('High Priority Todo');
      expect(result.current.todos[1].title).toBe('Medium Priority Todo');
      expect(result.current.todos[2].title).toBe('Low Priority Todo');
    });

    it('should reorder todos', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add todos
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Second Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Third Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      // Reorder: move third to first position
      const todos = result.current.todos;
      const reorderedTodos = [todos[2], todos[0], todos[1]];

      act(() => {
        result.current.reorderTodos(reorderedTodos);
      });

      expect(result.current.todos[0].title).toBe('Third Todo');
      expect(result.current.todos[0].order).toBe(1);
      expect(result.current.todos[1].title).toBe('First Todo');
      expect(result.current.todos[1].order).toBe(2);
      expect(result.current.todos[2].title).toBe('Second Todo');
      expect(result.current.todos[2].order).toBe(3);
    });
  });

  describe('Current Todo Management', () => {
    it('should set current todo', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.addTodo({
          title: 'Test Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const todoId = result.current.todos[0].id;

      // Set current todo (should already be set, but test explicit setting)
      act(() => {
        result.current.setCurrentTodo(todoId);
      });

      expect(result.current.currentTodo?.id).toBe(todoId);
    });

    it('should handle current todo when completing tasks', () => {
      const { result } = renderHook(() => useTodos(), {
        wrapper: TestWrapper,
      });

      // Add multiple todos
      act(() => {
        result.current.addTodo({
          title: 'First Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      act(() => {
        result.current.addTodo({
          title: 'Second Todo',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#6366f1',
        });
      });

      const firstTodoId = result.current.todos[0].id;
      const secondTodoId = result.current.todos[1].id;

      // Current todo should be the first one
      expect(result.current.currentTodo?.id).toBe(firstTodoId);

      // Complete the first todo
      act(() => {
        result.current.completeTodo(firstTodoId);
      });

      // Current todo should now be the second one
      expect(result.current.currentTodo?.id).toBe(secondTodoId);
    });
  });
});