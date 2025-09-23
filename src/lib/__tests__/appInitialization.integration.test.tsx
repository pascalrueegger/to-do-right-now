/**
 * Integration tests for application initialization with various data states
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TodoProvider } from '../../context/TodoContext';
import { MainLayout } from '../../components/MainLayout';
import { STORAGE_KEY } from '../constants';
import { StorageData } from '../types';
import { CURRENT_SCHEMA_VERSION } from '../migration';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Test component that uses TodoProvider
const TestApp = () => (
  <TodoProvider>
    <MainLayout />
  </TodoProvider>
);

describe('Application Initialization Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Mock console to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Empty State Initialization', () => {
    it('should initialize with empty state when no data exists', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
      });
      
      // Should show empty state message
      expect(screen.getByText(/add your first task/i)).toBeInTheDocument();
    });

    it('should highlight planning button when no tasks exist', async () => {
      render(<TestApp />);
      
      await waitFor(() => {
        const planningButton = screen.getByRole('button', { name: /planning/i });
        expect(planningButton).toHaveClass('bg-primary'); // Highlighted state
      });
    });
  });

  describe('Populated State Initialization', () => {
    it('should load existing todos and display current task', async () => {
      const existingData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [
          {
            id: 'todo-1',
            title: 'First Task',
            description: 'This is the first task',
            priority: 'high',
            tags: ['work', 'urgent'],
            color: '#ff6b6b',
            createdDate: '2024-01-01T10:00:00.000Z',
            status: 'pending',
            order: 1
          },
          {
            id: 'todo-2',
            title: 'Second Task',
            description: 'This is the second task',
            priority: 'medium',
            tags: ['personal'],
            color: '#4ecdc4',
            createdDate: '2024-01-01T11:00:00.000Z',
            status: 'pending',
            order: 2
          }
        ],
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('First Task')).toBeInTheDocument();
      });
      
      // Should display the first task as current
      expect(screen.getByText('This is the first task')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument(); // Priority badge
      expect(screen.getByText('work')).toBeInTheDocument(); // Tag
      expect(screen.getByText('urgent')).toBeInTheDocument(); // Tag
    });

    it('should skip completed tasks and show next pending task', async () => {
      const existingData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [
          {
            id: 'todo-1',
            title: 'Completed Task',
            description: 'This task is done',
            priority: 'high',
            tags: [],
            color: '#ff6b6b',
            createdDate: '2024-01-01T10:00:00.000Z',
            status: 'completed',
            order: 1
          },
          {
            id: 'todo-2',
            title: 'Current Task',
            description: 'This is the current task',
            priority: 'medium',
            tags: [],
            color: '#4ecdc4',
            createdDate: '2024-01-01T11:00:00.000Z',
            status: 'pending',
            order: 2
          }
        ],
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('Current Task')).toBeInTheDocument();
      });
      
      // Should not show the completed task
      expect(screen.queryByText('Completed Task')).not.toBeInTheDocument();
    });
  });

  describe('Corrupted Data Recovery', () => {
    it('should recover from invalid JSON and show empty state', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, 'invalid json data');
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
      });
      
      // Should show empty state after recovery
      expect(screen.getByText(/add your first task/i)).toBeInTheDocument();
    });

    it('should recover from corrupted todo data', async () => {
      const corruptedData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [
          {
            // Missing required fields
            title: '',
            description: 'Corrupted todo',
            priority: 'invalid-priority',
            tags: 'not-an-array',
            color: 'invalid-color',
            createdDate: 'invalid-date',
            status: 'invalid-status',
            order: 'not-a-number'
          },
          {
            id: 'valid-todo',
            title: 'Valid Task',
            description: 'This todo is valid',
            priority: 'medium',
            tags: ['test'],
            color: '#4ecdc4',
            createdDate: '2024-01-01T12:00:00.000Z',
            status: 'pending',
            order: 1
          }
        ],
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(corruptedData));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('Valid Task')).toBeInTheDocument();
      });
      
      // Should only show the valid todo after sanitization
      expect(screen.queryByText('Corrupted todo')).not.toBeInTheDocument();
    });
  });

  describe('Data Migration', () => {
    it('should migrate legacy data format', async () => {
      const legacyData = {
        // No version field indicates legacy format
        todos: [
          {
            id: 'legacy-todo',
            title: 'Legacy Task',
            description: 'From old version',
            priority: 'high',
            tags: ['legacy'],
            color: '#ff6b6b',
            createdDate: '2024-01-01T10:00:00.000Z',
            status: 'pending',
            order: 1
          }
        ],
        settings: {
          lastOpenedDrawer: true
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(legacyData));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('Legacy Task')).toBeInTheDocument();
      });
      
      // Should display migrated data correctly
      expect(screen.getByText('From old version')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('legacy')).toBeInTheDocument();
    });

    it('should handle completely invalid legacy data', async () => {
      const invalidLegacyData = {
        someOldField: 'old value',
        todos: 'not an array',
        settings: null
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(invalidLegacyData));
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
      });
      
      // Should fall back to empty state
      expect(screen.getByText(/add your first task/i)).toBeInTheDocument();
    });
  });

  describe('Storage Unavailable Scenarios', () => {
    it('should handle localStorage access denied (private browsing)', async () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new DOMException('Access denied', 'SecurityError');
      });
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
      });
      
      // Should still function with in-memory storage
      expect(screen.getByText(/add your first task/i)).toBeInTheDocument();
    });

    it('should handle storage quota exceeded', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });
      
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
      });
      
      // Should still render the app
      expect(screen.getByText(/add your first task/i)).toBeInTheDocument();
    });
  });

  describe('Performance with Large Datasets', () => {
    it('should handle initialization with many todos efficiently', async () => {
      const largeTodoSet: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: Array.from({ length: 1000 }, (_, index) => ({
          id: `todo-${index}`,
          title: `Task ${index + 1}`,
          description: `Description for task ${index + 1}`,
          priority: ['high', 'medium', 'low'][index % 3] as any,
          tags: [`tag-${index % 5}`],
          color: '#4ecdc4',
          createdDate: new Date(2024, 0, 1, 10, index % 60).toISOString(),
          status: index < 10 ? 'completed' : 'pending',
          order: index + 1
        })),
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(largeTodoSet));
      
      const startTime = performance.now();
      render(<TestApp />);
      
      await waitFor(() => {
        expect(screen.getByText('Task 11')).toBeInTheDocument(); // First non-completed task
      });
      
      const endTime = performance.now();
      const initTime = endTime - startTime;
      
      // Should initialize within reasonable time (less than 1 second)
      expect(initTime).toBeLessThan(1000);
    });
  });

  describe('Memory Management', () => {
    it('should not leak memory during multiple initializations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<TestApp />);
        
        await waitFor(() => {
          expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
        });
        
        unmount();
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory usage should not grow significantly (allow for some variance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryGrowth = finalMemory - initialMemory;
        const growthPercentage = (memoryGrowth / initialMemory) * 100;
        
        // Should not grow by more than 50%
        expect(growthPercentage).toBeLessThan(50);
      }
    });
  });
});