/**
 * Tests for application initialization system
 */

import {
  initializeApp,
  isStorageAvailable,
  getEmptyStorageData,
  sanitizeStorageData,
  cleanupApp,
  getAppHealth,
  resetApp,
  validateAppState
} from '../appInitialization';
import { StorageData, Todo } from '../types';
import { STORAGE_KEY } from '../constants';
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

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

describe('appInitialization', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Reset mock implementations to default behavior
    mockLocalStorage.getItem.mockImplementation((key: string) => {
      const store = (mockLocalStorage as any).store || {};
      return store[key] || null;
    });
    mockLocalStorage.setItem.mockImplementation((key: string, value: string) => {
      if (!(mockLocalStorage as any).store) {
        (mockLocalStorage as any).store = {};
      }
      (mockLocalStorage as any).store[key] = value;
    });
    mockLocalStorage.removeItem.mockImplementation((key: string) => {
      if ((mockLocalStorage as any).store) {
        delete (mockLocalStorage as any).store[key];
      }
    });
    
    // Mock global localStorage
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Mock console
    Object.assign(console, mockConsole);
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage throws an error', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('Storage not available');
      });
      
      expect(isStorageAvailable()).toBe(false);
    });
  });

  describe('getEmptyStorageData', () => {
    it('should return empty storage data with correct structure', () => {
      const emptyData = getEmptyStorageData();
      
      expect(emptyData).toEqual({
        version: CURRENT_SCHEMA_VERSION,
        todos: [],
        settings: {
          lastOpenedDrawer: false
        }
      });
    });
  });

  describe('initializeApp', () => {
    it('should initialize successfully with empty storage', async () => {
      const result = await initializeApp();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(getEmptyStorageData());
      expect(result.errors).toHaveLength(0);
      expect(result.migrated).toBe(false);
      expect(result.fallbackUsed).toBe(false);
    });

    it('should load existing valid data', async () => {
      const validData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [{
          id: 'test-1',
          title: 'Test Todo',
          description: 'Test description',
          priority: 'high',
          tags: ['test'],
          color: '#ff0000',
          createdDate: '2024-01-01T00:00:00.000Z',
          status: 'pending',
          order: 1
        }],
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.setItem(STORAGE_KEY, JSON.stringify(validData));
      
      const result = await initializeApp();
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle corrupted JSON data with fallback', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, 'invalid json');
      
      const result = await initializeApp({ enableFallback: true });
      
      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.errors).toContain('Failed to parse stored data: Invalid JSON format');
    });

    it('should fail without fallback on corrupted data', async () => {
      mockLocalStorage.setItem(STORAGE_KEY, 'invalid json');
      
      const result = await initializeApp({ enableFallback: false });
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to parse stored data: Invalid JSON format');
    });

    it('should handle localStorage unavailable', async () => {
      // Mock both setItem and getItem to throw errors to simulate unavailable storage
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });
      
      const result = await initializeApp();
      
      expect(result.success).toBe(true);
      expect(result.fallbackUsed).toBe(true);
      expect(result.warnings).toContain('localStorage is not available, using fallback storage');
    });

    it('should retry on storage read failures', async () => {
      let attempts = 0;
      mockLocalStorage.getItem.mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return null;
      });
      
      const result = await initializeApp({ maxRetries: 3 });
      
      expect(result.success).toBe(true);
      expect(result.warnings).toHaveLength(2); // Two failed attempts
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(3);
    });

    it('should handle migration from legacy data', async () => {
      // Reset mocks to default behavior for this test
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEY) {
          return JSON.stringify({
            todos: [{
              id: 'test-1',
              title: 'Legacy Todo',
              description: '',
              priority: 'high',
              tags: [],
              color: '#ff0000',
              createdDate: '2024-01-01T00:00:00.000Z',
              status: 'pending',
              order: 1
            }]
            // No version field - indicates legacy data
          });
        }
        return null;
      });
      
      const result = await initializeApp();
      
      expect(result.success).toBe(true);
      expect(result.migrated).toBe(true);
      expect(result.data.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.warnings.some(warning => warning.includes('Data migrated from version 0 to'))).toBe(true);
    });
  });

  describe('sanitizeStorageData', () => {
    it('should remove todos with invalid required fields', () => {
      const invalidData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [
          {
            id: '',
            title: 'Valid Todo',
            description: 'Test',
            priority: 'high',
            tags: [],
            color: '#ff0000',
            createdDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
            order: 1
          },
          {
            id: 'valid-id',
            title: '',
            description: 'Test',
            priority: 'high',
            tags: [],
            color: '#ff0000',
            createdDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
            order: 2
          },
          {
            id: 'valid-id-2',
            title: 'Valid Todo 2',
            description: 'Test',
            priority: 'high',
            tags: [],
            color: '#ff0000',
            createdDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
            order: 3
          }
        ],
        settings: {
          lastOpenedDrawer: false
        }
      };

      const sanitized = sanitizeStorageData(invalidData);
      
      expect(sanitized.todos).toHaveLength(1);
      expect(sanitized.todos[0].title).toBe('Valid Todo 2');
      expect(sanitized.todos[0].order).toBe(1); // Normalized order
    });

    it('should fix invalid field values', () => {
      const invalidData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [{
          id: 'test-1',
          title: '  Whitespace Title  ',
          description: '',
          priority: 'invalid' as any,
          tags: ['valid', '', 123 as any, 'another'],
          color: 'invalid-color',
          createdDate: 'invalid-date',
          status: 'invalid' as any,
          order: -1
        }],
        settings: {
          lastOpenedDrawer: false
        }
      };

      const sanitized = sanitizeStorageData(invalidData);
      const todo = sanitized.todos[0];
      
      expect(todo.title).toBe('Whitespace Title');
      expect(todo.priority).toBe('medium'); // Default priority
      expect(todo.tags).toEqual(['valid', 'another']);
      expect(todo.color).toBe('#6366f1'); // Default color
      expect(todo.status).toBe('pending'); // Default status
      expect(todo.order).toBe(1); // Normalized order
      expect(new Date(todo.createdDate).getTime()).not.toBeNaN();
    });

    it('should normalize order values', () => {
      const data: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [
          {
            id: 'test-1',
            title: 'Todo 1',
            description: '',
            priority: 'high',
            tags: [],
            color: '#ff0000',
            createdDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
            order: 5
          },
          {
            id: 'test-2',
            title: 'Todo 2',
            description: '',
            priority: 'high',
            tags: [],
            color: '#ff0000',
            createdDate: '2024-01-01T00:00:00.000Z',
            status: 'pending',
            order: 2
          }
        ],
        settings: {
          lastOpenedDrawer: false
        }
      };

      const sanitized = sanitizeStorageData(data);
      
      expect(sanitized.todos[0].order).toBe(1);
      expect(sanitized.todos[1].order).toBe(2);
      expect(sanitized.todos[0].title).toBe('Todo 2'); // Sorted by original order
      expect(sanitized.todos[1].title).toBe('Todo 1');
    });
  });

  describe('validateAppState', () => {
    it('should validate correct app state', () => {
      const todos: Todo[] = [
        {
          id: 'test-1',
          title: 'Todo 1',
          description: '',
          priority: 'high',
          tags: [],
          color: '#ff0000',
          createdDate: new Date('2024-01-01'),
          status: 'pending',
          order: 1
        },
        {
          id: 'test-2',
          title: 'Todo 2',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#00ff00',
          createdDate: new Date('2024-01-02'),
          status: 'completed',
          order: 2
        }
      ];

      const validation = validateAppState(todos);
      
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    it('should detect duplicate IDs', () => {
      const todos: Todo[] = [
        {
          id: 'duplicate',
          title: 'Todo 1',
          description: '',
          priority: 'high',
          tags: [],
          color: '#ff0000',
          createdDate: new Date('2024-01-01'),
          status: 'pending',
          order: 1
        },
        {
          id: 'duplicate',
          title: 'Todo 2',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#00ff00',
          createdDate: new Date('2024-01-02'),
          status: 'completed',
          order: 2
        }
      ];

      const validation = validateAppState(todos);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Duplicate todo IDs detected');
    });

    it('should detect invalid order sequence', () => {
      const todos: Todo[] = [
        {
          id: 'test-1',
          title: 'Todo 1',
          description: '',
          priority: 'high',
          tags: [],
          color: '#ff0000',
          createdDate: new Date('2024-01-01'),
          status: 'pending',
          order: 1
        },
        {
          id: 'test-2',
          title: 'Todo 2',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#00ff00',
          createdDate: new Date('2024-01-02'),
          status: 'completed',
          order: 5 // Invalid - should be 2
        }
      ];

      const validation = validateAppState(todos);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('Invalid todo order sequence detected');
    });

    it('should detect invalid dates', () => {
      const todos: Todo[] = [
        {
          id: 'test-1',
          title: 'Todo 1',
          description: '',
          priority: 'high',
          tags: [],
          color: '#ff0000',
          createdDate: new Date('invalid-date'),
          status: 'pending',
          order: 1
        }
      ];

      const validation = validateAppState(todos);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('1 todos have invalid creation dates');
    });

    it('should detect empty titles', () => {
      const todos: Todo[] = [
        {
          id: 'test-1',
          title: '',
          description: '',
          priority: 'high',
          tags: [],
          color: '#ff0000',
          createdDate: new Date('2024-01-01'),
          status: 'pending',
          order: 1
        },
        {
          id: 'test-2',
          title: '   ',
          description: '',
          priority: 'medium',
          tags: [],
          color: '#00ff00',
          createdDate: new Date('2024-01-02'),
          status: 'completed',
          order: 2
        }
      ];

      const validation = validateAppState(todos);
      
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContain('2 todos have empty titles');
    });
  });

  describe('getAppHealth', () => {
    it('should return healthy status with no data', () => {
      // Reset mocks to default behavior
      mockLocalStorage.getItem.mockImplementation(() => null);
      
      const health = getAppHealth();
      
      expect(health.storage).toBe(true);
      expect(health.dataIntegrity).toBe(true);
      expect(health.version).toBe(CURRENT_SCHEMA_VERSION);
      expect(health.lastCheck).toBeDefined();
    });

    it('should return healthy status with valid data', () => {
      const validData: StorageData = {
        version: CURRENT_SCHEMA_VERSION,
        todos: [],
        settings: {
          lastOpenedDrawer: false
        }
      };

      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEY) {
          return JSON.stringify(validData);
        }
        return null;
      });
      
      const health = getAppHealth();
      
      expect(health.storage).toBe(true);
      expect(health.dataIntegrity).toBe(true);
    });

    it('should detect data integrity issues', () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === STORAGE_KEY) {
          return 'invalid json';
        }
        return null;
      });
      
      const health = getAppHealth();
      
      expect(health.storage).toBe(true);
      expect(health.dataIntegrity).toBe(false);
    });
  });

  describe('resetApp', () => {
    it('should clear localStorage', async () => {
      // Reset mocks to default behavior
      mockLocalStorage.removeItem.mockImplementation(() => {});
      
      await resetApp();
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should handle errors gracefully', async () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });
      
      await expect(resetApp()).rejects.toThrow('Failed to reset application');
    });
  });

  describe('cleanupApp', () => {
    it('should complete without errors', () => {
      expect(() => cleanupApp()).not.toThrow();
      expect(mockConsole.log).toHaveBeenCalledWith('Application cleanup completed');
    });
  });
});