/**
 * useLocalStorage hook with comprehensive error handling and validation
 * Provides get, set, and remove operations with fallback mechanisms
 */

import { useCallback, useEffect, useState } from 'react';
import { StorageData, SerializableTodo, Todo } from '../lib/types';
import { STORAGE_KEY } from '../lib/constants';

// Error types for better error handling
export class StorageError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'StorageError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor() {
    super('Storage quota exceeded. Please free up space or clear old data.', 'QUOTA_EXCEEDED');
  }
}

export class SecurityError extends StorageError {
  constructor() {
    super('Storage access denied. This may occur in private browsing mode.', 'SECURITY_ERROR');
  }
}

export class ValidationError extends StorageError {
  constructor(message: string) {
    super(`Data validation failed: ${message}`, 'VALIDATION_ERROR');
  }
}

// In-memory fallback storage
class MemoryStorage {
  private data: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.data.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

// Validation functions
const isValidTodo = (todo: any): todo is SerializableTodo => {
  return (
    typeof todo === 'object' &&
    todo !== null &&
    typeof todo.id === 'string' &&
    typeof todo.title === 'string' &&
    todo.title.trim().length > 0 &&
    typeof todo.description === 'string' &&
    ['high', 'medium', 'low'].includes(todo.priority) &&
    Array.isArray(todo.tags) &&
    todo.tags.every((tag: any) => typeof tag === 'string') &&
    typeof todo.color === 'string' &&
    /^#[0-9A-Fa-f]{6}$/.test(todo.color) &&
    typeof todo.createdDate === 'string' &&
    !isNaN(Date.parse(todo.createdDate)) &&
    ['pending', 'in-progress', 'completed'].includes(todo.status) &&
    typeof todo.order === 'number' &&
    todo.order >= 0
  );
};

const isValidStorageData = (data: any): data is StorageData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.todos) &&
    data.todos.every(isValidTodo) &&
    typeof data.settings === 'object' &&
    data.settings !== null &&
    typeof data.settings.lastOpenedDrawer === 'boolean'
  );
};

// Convert between Todo and SerializableTodo
const serializeTodo = (todo: Todo): SerializableTodo => ({
  ...todo,
  createdDate: todo.createdDate.toISOString()
});

const deserializeTodo = (todo: SerializableTodo): Todo => ({
  ...todo,
  createdDate: new Date(todo.createdDate)
});

export interface UseLocalStorageReturn {
  data: StorageData | null;
  error: StorageError | null;
  isLoading: boolean;
  isStorageAvailable: boolean;
  setData: (data: StorageData) => Promise<void>;
  updateTodos: (todos: Todo[]) => Promise<void>;
  removeData: () => Promise<void>;
  clearError: () => void;
}

export const useLocalStorage = (): UseLocalStorageReturn => {
  const [data, setDataState] = useState<StorageData | null>(null);
  const [error, setError] = useState<StorageError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storage, setStorage] = useState<Storage | MemoryStorage | null>(null);
  const [isStorageAvailable, setIsStorageAvailable] = useState(false);

  // Initialize storage and check availability
  useEffect(() => {
    const initializeStorage = () => {
      try {
        // Test localStorage availability
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        setStorage(localStorage);
        setIsStorageAvailable(true);
      } catch (err) {
        console.warn('localStorage not available, falling back to memory storage:', err);
        
        if (err instanceof Error) {
          if (err.name === 'SecurityError') {
            setError(new SecurityError());
          } else {
            setError(new StorageError('localStorage unavailable', 'STORAGE_UNAVAILABLE'));
          }
        }
        
        // Fallback to memory storage
        setStorage(new MemoryStorage());
        setIsStorageAvailable(false);
      }
    };

    initializeStorage();
  }, []);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      if (!storage) return;

      try {
        setIsLoading(true);
        setError(null);

        const storedData = storage.getItem(STORAGE_KEY);
        
        if (!storedData) {
          // Initialize with empty data
          const initialData: StorageData = {
            todos: [],
            settings: {
              lastOpenedDrawer: false
            }
          };
          setDataState(initialData);
          return;
        }

        const parsedData = JSON.parse(storedData);
        
        if (!isValidStorageData(parsedData)) {
          throw new ValidationError('Invalid data structure in storage');
        }

        // Convert serializable todos back to Todo objects
        const deserializedData: StorageData = {
          ...parsedData,
          todos: parsedData.todos.map(deserializeTodo).map(serializeTodo) // Ensure consistency
        };

        setDataState(deserializedData);
      } catch (err) {
        console.error('Failed to load data from storage:', err);
        
        if (err instanceof StorageError) {
          setError(err);
        } else if (err instanceof SyntaxError) {
          setError(new ValidationError('Corrupted data in storage'));
        } else {
          setError(new StorageError('Failed to load data', 'LOAD_ERROR'));
        }

        // Initialize with empty data on error
        const fallbackData: StorageData = {
          todos: [],
          settings: {
            lastOpenedDrawer: false
          }
        };
        setDataState(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [storage]);

  // Set data with error handling
  const setData = useCallback(async (newData: StorageData): Promise<void> => {
    if (!storage) {
      throw new StorageError('Storage not available', 'STORAGE_UNAVAILABLE');
    }

    try {
      setError(null);

      // Validate data before storing
      if (!isValidStorageData(newData)) {
        throw new ValidationError('Invalid data structure');
      }

      const serializedData = JSON.stringify(newData);
      storage.setItem(STORAGE_KEY, serializedData);
      setDataState(newData);
    } catch (err) {
      console.error('Failed to save data to storage:', err);
      
      if (err instanceof Error) {
        if (err.name === 'QuotaExceededError') {
          const quotaError = new QuotaExceededError();
          setError(quotaError);
          throw quotaError;
        } else if (err.name === 'SecurityError') {
          const securityError = new SecurityError();
          setError(securityError);
          throw securityError;
        } else if (err instanceof StorageError) {
          setError(err);
          throw err;
        }
      }
      
      const storageError = new StorageError('Failed to save data', 'SAVE_ERROR');
      setError(storageError);
      throw storageError;
    }
  }, [storage]);

  // Update todos specifically (convenience method)
  const updateTodos = useCallback(async (todos: Todo[]): Promise<void> => {
    const serializedTodos = todos.map(serializeTodo);
    const updatedData: StorageData = {
      todos: serializedTodos,
      settings: {
        lastOpenedDrawer: false
      }
    };

    await setData(updatedData);
  }, [setData]);

  // Remove data
  const removeData = useCallback(async (): Promise<void> => {
    if (!storage) {
      throw new StorageError('Storage not available', 'STORAGE_UNAVAILABLE');
    }

    try {
      setError(null);
      storage.removeItem(STORAGE_KEY);
      
      const emptyData: StorageData = {
        todos: [],
        settings: {
          lastOpenedDrawer: false
        }
      };
      setDataState(emptyData);
    } catch (err) {
      console.error('Failed to remove data from storage:', err);
      const storageError = new StorageError('Failed to remove data', 'REMOVE_ERROR');
      setError(storageError);
      throw storageError;
    }
  }, [storage]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    data,
    error,
    isLoading,
    isStorageAvailable,
    setData,
    updateTodos,
    removeData,
    clearError
  };
};

export default useLocalStorage;