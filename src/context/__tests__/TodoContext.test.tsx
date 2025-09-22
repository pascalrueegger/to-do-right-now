/**
 * Unit tests for TodoContext and reducer functions
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TodoProvider, useTodoContext } from '../TodoContext';
import { Todo, TodoAction } from '../../lib/types';
import { DEFAULT_STATUS, DEFAULT_PRIORITY, DEFAULT_TODO_COLOR } from '../../lib/constants';

// Mock useLocalStorage hook
jest.mock('../../hooks/useLocalStorage', () => ({
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

describe('TodoContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should provide initial state with empty todos', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      expect(result.current.state.todos).toEqual([]);
      expect(result.current.state.currentTodoId).toBeNull();
      expect(result.current.state.isDrawerOpen).toBe(false);
    });

    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      expect(() => {
        renderHook(() => useTodoContext());
      }).toThrow('useTodoContext must be used within a TodoProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('ADD_TODO Action', () => {
    it('should add a new todo with generated id and defaults', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: {
            title: 'New Todo',
            description: 'New description',
            priority: 'high',
            tags: ['work'],
            color: '#ff0000',
          },
        });
      });

      const addedTodo = result.current.state.todos[0];
      expect(addedTodo).toMatchObject({
        title: 'New Todo',
        description: 'New description',
        priority: 'high',
        tags: ['work'],
        color: '#ff0000',
        status: DEFAULT_STATUS,
        order: 1,
      });
      expect(addedTodo.id).toBeDefined();
      expect(addedTodo.createdDate).toBeInstanceOf(Date);
      expect(result.current.state.currentTodoId).toBe(addedTodo.id);
    });

    it('should apply defaults for missing properties', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: {
            title: 'Minimal Todo',
          },
        });
      });

      const addedTodo = result.current.state.todos[0];
      expect(addedTodo.priority).toBe(DEFAULT_PRIORITY);
      expect(addedTodo.color).toBe(DEFAULT_TODO_COLOR);
      expect(addedTodo.tags).toEqual([]);
      expect(addedTodo.description).toBe('');
    });

    it('should assign correct order to multiple todos', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second Todo' },
        });
      });

      expect(result.current.state.todos[0].order).toBe(1);
      expect(result.current.state.todos[1].order).toBe(2);
    });
  });

  describe('UPDATE_TODO Action', () => {
    it('should update existing todo properties', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add a todo first
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Original Todo' },
        });
      });

      const todoId = result.current.state.todos[0].id;

      // Update the todo
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_TODO',
          payload: {
            id: todoId,
            updates: {
              title: 'Updated Todo',
              priority: 'high',
              tags: ['updated'],
            },
          },
        });
      });

      const updatedTodo = result.current.state.todos[0];
      expect(updatedTodo.title).toBe('Updated Todo');
      expect(updatedTodo.priority).toBe('high');
      expect(updatedTodo.tags).toEqual(['updated']);
    });

    it('should not affect other todos', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add two todos
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second Todo' },
        });
      });

      const firstTodoId = result.current.state.todos[0].id;

      // Update only the first todo
      act(() => {
        result.current.dispatch({
          type: 'UPDATE_TODO',
          payload: {
            id: firstTodoId,
            updates: { title: 'Updated First Todo' },
          },
        });
      });

      expect(result.current.state.todos[0].title).toBe('Updated First Todo');
      expect(result.current.state.todos[1].title).toBe('Second Todo');
    });
  });

  describe('DELETE_TODO Action', () => {
    it('should remove todo from the list', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Todo to Delete' },
        });
      });

      const todoId = result.current.state.todos[0].id;
      expect(result.current.state.todos).toHaveLength(1);

      // Delete the todo
      act(() => {
        result.current.dispatch({
          type: 'DELETE_TODO',
          payload: todoId,
        });
      });

      expect(result.current.state.todos).toHaveLength(0);
      expect(result.current.state.currentTodoId).toBeNull();
    });

    it('should update currentTodoId when current todo is deleted', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add two todos
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second Todo' },
        });
      });

      const firstTodoId = result.current.state.todos[0].id;
      const secondTodoId = result.current.state.todos[1].id;

      // Current todo should be the first one
      expect(result.current.state.currentTodoId).toBe(firstTodoId);

      // Delete the first todo
      act(() => {
        result.current.dispatch({
          type: 'DELETE_TODO',
          payload: firstTodoId,
        });
      });

      // Current todo should now be the second one
      expect(result.current.state.currentTodoId).toBe(secondTodoId);
    });
  });

  describe('COMPLETE_TODO Action', () => {
    it('should mark todo as completed', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Todo to Complete' },
        });
      });

      const todoId = result.current.state.todos[0].id;
      expect(result.current.state.todos[0].status).toBe('pending');

      // Complete the todo
      act(() => {
        result.current.dispatch({
          type: 'COMPLETE_TODO',
          payload: todoId,
        });
      });

      expect(result.current.state.todos[0].status).toBe('completed');
    });

    it('should update currentTodoId to next incomplete todo', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add two todos
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second Todo' },
        });
      });

      const firstTodoId = result.current.state.todos[0].id;
      const secondTodoId = result.current.state.todos[1].id;

      // Current todo should be the first one
      expect(result.current.state.currentTodoId).toBe(firstTodoId);

      // Complete the first todo
      act(() => {
        result.current.dispatch({
          type: 'COMPLETE_TODO',
          payload: firstTodoId,
        });
      });

      // Current todo should now be the second one
      expect(result.current.state.currentTodoId).toBe(secondTodoId);
    });

    it('should set currentTodoId to null when all todos are completed', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add a todo
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Only Todo' },
        });
      });

      const todoId = result.current.state.todos[0].id;

      // Complete the todo
      act(() => {
        result.current.dispatch({
          type: 'COMPLETE_TODO',
          payload: todoId,
        });
      });

      expect(result.current.state.currentTodoId).toBeNull();
    });
  });

  describe('REORDER_TODOS Action', () => {
    it('should reorder todos and update order property', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add three todos
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second Todo' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Third Todo' },
        });
      });

      const todos = result.current.state.todos;
      const reorderedTodos = [todos[2], todos[0], todos[1]]; // Move third to first

      // Reorder todos
      act(() => {
        result.current.dispatch({
          type: 'REORDER_TODOS',
          payload: reorderedTodos,
        });
      });

      const newTodos = result.current.state.todos;
      expect(newTodos[0].title).toBe('Third Todo');
      expect(newTodos[0].order).toBe(1);
      expect(newTodos[1].title).toBe('First Todo');
      expect(newTodos[1].order).toBe(2);
      expect(newTodos[2].title).toBe('Second Todo');
      expect(newTodos[2].order).toBe(3);
    });
  });

  describe('SORT_BY_PRIORITY Action', () => {
    it('should sort todos by priority (high, medium, low)', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add todos with different priorities
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Low Priority', priority: 'low' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'High Priority', priority: 'high' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Medium Priority', priority: 'medium' },
        });
      });

      // Sort by priority
      act(() => {
        result.current.dispatch({
          type: 'SORT_BY_PRIORITY',
        });
      });

      const sortedTodos = result.current.state.todos;
      expect(sortedTodos[0].title).toBe('High Priority');
      expect(sortedTodos[0].order).toBe(1);
      expect(sortedTodos[1].title).toBe('Medium Priority');
      expect(sortedTodos[1].order).toBe(2);
      expect(sortedTodos[2].title).toBe('Low Priority');
      expect(sortedTodos[2].order).toBe(3);
    });

    it('should maintain relative order for same priority todos', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // Add todos with same priority
      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'First High', priority: 'high' },
        });
      });

      act(() => {
        result.current.dispatch({
          type: 'ADD_TODO',
          payload: { title: 'Second High', priority: 'high' },
        });
      });

      // Sort by priority
      act(() => {
        result.current.dispatch({
          type: 'SORT_BY_PRIORITY',
        });
      });

      const sortedTodos = result.current.state.todos;
      expect(sortedTodos[0].title).toBe('First High');
      expect(sortedTodos[1].title).toBe('Second High');
    });
  });

  describe('TOGGLE_DRAWER Action', () => {
    it('should toggle drawer open state', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      expect(result.current.state.isDrawerOpen).toBe(false);

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_DRAWER' });
      });

      expect(result.current.state.isDrawerOpen).toBe(true);

      act(() => {
        result.current.dispatch({ type: 'TOGGLE_DRAWER' });
      });

      expect(result.current.state.isDrawerOpen).toBe(false);
    });
  });

  describe('SET_CURRENT_TODO Action', () => {
    it('should set current todo id', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      const testId = 'test-todo-id';

      act(() => {
        result.current.dispatch({
          type: 'SET_CURRENT_TODO',
          payload: testId,
        });
      });

      expect(result.current.state.currentTodoId).toBe(testId);
    });

    it('should set current todo id to null', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      // First set a todo id
      act(() => {
        result.current.dispatch({
          type: 'SET_CURRENT_TODO',
          payload: 'test-id',
        });
      });

      // Then set it to null
      act(() => {
        result.current.dispatch({
          type: 'SET_CURRENT_TODO',
          payload: null,
        });
      });

      expect(result.current.state.currentTodoId).toBeNull();
    });
  });

  describe('LOAD_TODOS Action', () => {
    it('should load todos and set current todo', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      const testTodos = [
        createTestTodo({ title: 'First Todo', order: 1, status: 'completed' }),
        createTestTodo({ title: 'Second Todo', order: 2, status: 'pending' }),
        createTestTodo({ title: 'Third Todo', order: 3, status: 'pending' }),
      ];

      act(() => {
        result.current.dispatch({
          type: 'LOAD_TODOS',
          payload: testTodos,
        });
      });

      expect(result.current.state.todos).toEqual(testTodos);
      // Current todo should be the first incomplete todo (Second Todo)
      expect(result.current.state.currentTodoId).toBe(testTodos[1].id);
    });

    it('should set currentTodoId to null when all todos are completed', () => {
      const { result } = renderHook(() => useTodoContext(), {
        wrapper: TestWrapper,
      });

      const completedTodos = [
        createTestTodo({ title: 'Completed Todo 1', status: 'completed' }),
        createTestTodo({ title: 'Completed Todo 2', status: 'completed' }),
      ];

      act(() => {
        result.current.dispatch({
          type: 'LOAD_TODOS',
          payload: completedTodos,
        });
      });

      expect(result.current.state.currentTodoId).toBeNull();
    });
  });
});