/**
 * Unit tests for useLocalStorage hook
 * Tests storage operations, error handling, and validation
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocalStorage, StorageError, QuotaExceededError, SecurityError, ValidationError } from '../useLocalStorage';
import { StorageData, Todo } from '../../lib/types';
import { STORAGE_KEY } from '../../lib/constants';

// Test data
const createTestTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: 'test-id-1',
  title: 'Test Todo',
  description: 'Test description',
  priority: 'medium',
  tags: ['test'],
  color: '#6366f1',
  createdDate: new Date('2024-01-01T00:00:00.000Z'),
  status: 'pending',
  order: 1,
  ...overrides
});

const createTestStorageData = (todos: Todo[] = []): StorageData => ({
  todos: todos.map(todo => ({
    ...todo,
    createdDate: todo.createdDate.toISOString()
  })),
  settings: {
    lastOpenedDrawer: false
  }
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    
    // Reset console methods
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty data when no stored data exists', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        todos: [],
        settings: { lastOpenedDrawer: false }
      });
      expect(result.current.error).toBeNull();
      expect(result.current.isStorageAvailable).toBe(true);
    });

    it('should load existing valid data from localStorage', async () => {
      const testTodo = createTestTodo();
      const testData = createTestStorageData([testTodo]);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(testData));

      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(testData);
      expect(result.current.error).toBeNull();
    });

    it('should handle corrupted data gracefully', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        todos: [],
        settings: { lastOpenedDrawer: false }
      });
      expect(result.current.error).toBeInstanceOf(ValidationError);
      expect(result.current.error?.message).toContain('Corrupted data');
    });

    it('should validate data structure and reject invalid data', async () => {
      const invalidData = {
        todos: [{ invalid: 'todo' }],
        settings: { lastOpenedDrawer: false }
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(invalidData));

      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(ValidationError);
      expect(result.current.data).toEqual({
        todos: [],
        settings: { lastOpenedDrawer: false }
      });
    });
  });

  describe('setData', () => {
    it('should save valid data to localStorage', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const testTodo = createTestTodo();
      const testData = createTestStorageData([testTodo]);

      await act(async () => {
        await result.current.setData(testData);
      });

      expect(result.current.data).toEqual(testData);
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(testData));
      expect(result.current.error).toBeNull();
    });

    it('should reject invalid data structure', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const invalidData = { invalid: 'data' } as any;

      await act(async () => {
        try {
          await result.current.setData(invalidData);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
        }
      });

      expect(result.current.error).toBeInstanceOf(ValidationError);
    });
  });

  describe('updateTodos', () => {
    it('should update todos and preserve settings', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set initial data with custom settings
      const initialData: StorageData = {
        todos: [],
        settings: { lastOpenedDrawer: true }
      };

      await act(async () => {
        await result.current.setData(initialData);
      });

      // Update todos
      const testTodos = [createTestTodo(), createTestTodo({ id: 'test-id-2', title: 'Second Todo' })];

      await act(async () => {
        await result.current.updateTodos(testTodos);
      });

      expect(result.current.data?.todos).toHaveLength(2);
      expect(result.current.data?.settings.lastOpenedDrawer).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should throw error when no data is available', async () => {
      const { result } = renderHook(() => useLocalStorage());

      // Don't wait for loading to complete, try to update immediately
      const testTodos = [createTestTodo()];

      await act(async () => {
        try {
          await result.current.updateTodos(testTodos);
        } catch (error) {
          expect(error).toBeInstanceOf(StorageError);
          expect((error as StorageError).code).toBe('NO_DATA');
        }
      });
    });
  });

  describe('removeData', () => {
    it('should remove data from localStorage and reset to empty state', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set some initial data
      const testData = createTestStorageData([createTestTodo()]);
      await act(async () => {
        await result.current.setData(testData);
      });

      // Remove data
      await act(async () => {
        await result.current.removeData();
      });

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
      expect(result.current.data).toEqual({
        todos: [],
        settings: { lastOpenedDrawer: false }
      });
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear the current error', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Trigger an error
      const invalidData = { invalid: 'data' } as any;
      await act(async () => {
        try {
          await result.current.setData(invalidData);
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.error).not.toBeNull();

      // Clear error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('data validation', () => {
    it('should validate todo properties correctly', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test invalid todo properties
      const invalidTodos = [
        { ...createTestTodo(), title: '' }, // Empty title
        { ...createTestTodo(), priority: 'invalid' }, // Invalid priority
        { ...createTestTodo(), color: 'invalid' }, // Invalid color
        { ...createTestTodo(), tags: ['tag', 123] }, // Invalid tag type
        { ...createTestTodo(), status: 'invalid' }, // Invalid status
        { ...createTestTodo(), order: -1 }, // Invalid order
      ];

      for (const invalidTodo of invalidTodos) {
        const testData = createTestStorageData([invalidTodo as Todo]);
        
        await act(async () => {
          try {
            await result.current.setData(testData);
          } catch (error) {
            expect(error).toBeInstanceOf(ValidationError);
          }
        });
      }
    });

    it('should handle date serialization correctly', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const testTodo = createTestTodo({
        createdDate: new Date('2024-01-15T10:30:00.000Z')
      });
      const testData = createTestStorageData([testTodo]);

      await act(async () => {
        await result.current.setData(testData);
      });

      // Verify the date is stored as ISO string
      const storedData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(storedData.todos[0].createdDate).toBe('2024-01-15T10:30:00.000Z');

      // Verify the hook returns the correct data structure
      expect(result.current.data?.todos[0].createdDate).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('error scenarios', () => {
    it('should handle storage quota exceeded error', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const testData = createTestStorageData([createTestTodo()]);

      await act(async () => {
        try {
          await result.current.setData(testData);
        } catch (error) {
          expect(error).toBeInstanceOf(QuotaExceededError);
        }
      });

      expect(result.current.error).toBeInstanceOf(QuotaExceededError);

      // Restore original implementation
      Storage.prototype.setItem = originalSetItem;
    });

    it('should handle security error', async () => {
      const { result } = renderHook(() => useLocalStorage());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock localStorage.setItem to throw SecurityError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new Error('Security error');
        error.name = 'SecurityError';
        throw error;
      });

      const testData = createTestStorageData([createTestTodo()]);

      await act(async () => {
        try {
          await result.current.setData(testData);
        } catch (error) {
          expect(error).toBeInstanceOf(SecurityError);
        }
      });

      expect(result.current.error).toBeInstanceOf(SecurityError);

      // Restore original implementation
      Storage.prototype.setItem = originalSetItem;
    });
  });
});