/**
 * Application initialization system
 * Handles app startup, data loading, migration, and error recovery
 */

import { StorageData, Todo } from './types';
import { STORAGE_KEY, DEFAULT_STATUS, DEFAULT_PRIORITY, DEFAULT_TODO_COLOR } from './constants';
import { migrateData, validateMigratedData, CURRENT_SCHEMA_VERSION } from './migration';

export interface InitializationResult {
  success: boolean;
  data: StorageData;
  errors: string[];
  warnings: string[];
  migrated: boolean;
  fallbackUsed: boolean;
}

export interface InitializationOptions {
  enableMigration?: boolean;
  enableValidation?: boolean;
  enableFallback?: boolean;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: Required<InitializationOptions> = {
  enableMigration: true,
  enableValidation: true,
  enableFallback: true,
  maxRetries: 3
};

/**
 * Initialize the application with data loading and migration
 */
export const initializeApp = async (options: InitializationOptions = {}): Promise<InitializationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const result: InitializationResult = {
    success: false,
    data: getEmptyStorageData(),
    errors: [],
    warnings: [],
    migrated: false,
    fallbackUsed: false
  };

  try {
    // Attempt to load data with retries
    let rawData: string | null = null;
    let attempts = 0;
    let storageUnavailable = false;

    while (attempts < opts.maxRetries && rawData === null && !storageUnavailable) {
      try {
        rawData = localStorage.getItem(STORAGE_KEY);
        break;
      } catch (error) {
        attempts++;
        result.warnings.push(`Storage read attempt ${attempts} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        // If it's a security error or storage is completely unavailable, don't retry
        if (error instanceof Error && (error.name === 'SecurityError' || error.message.includes('not available'))) {
          storageUnavailable = true;
          break;
        }
        
        if (attempts < opts.maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 100));
        }
      }
    }

    // Handle storage unavailable
    if (storageUnavailable) {
      result.warnings.push('localStorage is not available, using fallback storage');
      result.fallbackUsed = true;
      result.success = true;
      return result;
    }

    // If no data exists, initialize with empty state
    if (!rawData) {
      result.success = true;
      return result;
    }

    // Parse the stored data
    let parsedData: any;
    try {
      parsedData = JSON.parse(rawData);
    } catch (error) {
      result.errors.push('Failed to parse stored data: Invalid JSON format');
      
      if (opts.enableFallback) {
        result.fallbackUsed = true;
        result.success = true;
        return result;
      } else {
        return result;
      }
    }

    // Migrate data if needed
    let migratedData = parsedData;
    if (opts.enableMigration) {
      try {
        migratedData = migrateData(parsedData);
        
        // Check if migration occurred
        const originalVersion = parsedData.version || 0;
        if (originalVersion < CURRENT_SCHEMA_VERSION) {
          result.migrated = true;
          result.warnings.push(`Data migrated from version ${originalVersion} to ${CURRENT_SCHEMA_VERSION}`);
        }
      } catch (error) {
        result.errors.push(`Data migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        if (opts.enableFallback) {
          result.fallbackUsed = true;
          result.success = true;
          return result;
        } else {
          return result;
        }
      }
    }

    // Validate migrated data
    if (opts.enableValidation) {
      if (!validateMigratedData(migratedData)) {
        result.errors.push('Data validation failed after migration');
        
        if (opts.enableFallback) {
          result.fallbackUsed = true;
          result.success = true;
          return result;
        } else {
          return result;
        }
      }
    }

    // Additional data sanitization and cleanup
    const sanitizedData = sanitizeStorageData(migratedData);
    
    // Save migrated/sanitized data back to storage if changes were made
    if (result.migrated || JSON.stringify(sanitizedData) !== JSON.stringify(migratedData)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedData));
      } catch (error) {
        result.warnings.push(`Failed to save migrated data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.data = sanitizedData;
    result.success = true;
    
    return result;

  } catch (error) {
    result.errors.push(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (opts.enableFallback) {
      result.fallbackUsed = true;
      result.success = true;
    }
    
    return result;
  }
};

/**
 * Check if localStorage is available and functional
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get empty storage data structure
 */
export const getEmptyStorageData = (): StorageData => ({
  version: CURRENT_SCHEMA_VERSION,
  todos: [],
  settings: {
    lastOpenedDrawer: false
  }
});

/**
 * Sanitize and clean up storage data
 */
export const sanitizeStorageData = (data: StorageData): StorageData => {
  const sanitizedTodos = data.todos
    .filter(todo => {
      // Remove todos with invalid required fields
      return (
        todo.id &&
        typeof todo.id === 'string' &&
        todo.title &&
        typeof todo.title === 'string' &&
        todo.title.trim().length > 0
      );
    })
    .map((todo, index) => ({
      ...todo,
      // Ensure all fields have valid values
      title: todo.title.trim(),
      description: todo.description || '',
      priority: ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : DEFAULT_PRIORITY,
      tags: Array.isArray(todo.tags) ? todo.tags.filter(tag => typeof tag === 'string' && tag.trim().length > 0) : [],
      color: (typeof todo.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(todo.color)) ? todo.color : DEFAULT_TODO_COLOR,
      createdDate: todo.createdDate && !isNaN(Date.parse(todo.createdDate)) ? todo.createdDate : new Date().toISOString(),
      status: ['pending', 'in-progress', 'completed'].includes(todo.status) ? todo.status : DEFAULT_STATUS,
      order: typeof todo.order === 'number' && todo.order >= 0 ? todo.order : index + 1
    }))
    .sort((a, b) => a.order - b.order) // Ensure proper ordering
    .map((todo, index) => ({ ...todo, order: index + 1 })); // Normalize order values

  return {
    version: CURRENT_SCHEMA_VERSION,
    todos: sanitizedTodos,
    settings: {
      lastOpenedDrawer: typeof data.settings?.lastOpenedDrawer === 'boolean' ? data.settings.lastOpenedDrawer : false
    }
  };
};

/**
 * Perform application cleanup on shutdown
 */
export const cleanupApp = (): void => {
  try {
    // Clear any temporary data or event listeners
    // This is a placeholder for future cleanup needs
    
    // Log cleanup completion
    console.log('Application cleanup completed');
  } catch (error) {
    console.error('Error during application cleanup:', error);
  }
};

/**
 * Get application health status
 */
export const getAppHealth = (): {
  storage: boolean;
  dataIntegrity: boolean;
  version: number;
  lastCheck: string;
} => {
  const health = {
    storage: isStorageAvailable(),
    dataIntegrity: false,
    version: CURRENT_SCHEMA_VERSION,
    lastCheck: new Date().toISOString()
  };

  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (rawData) {
      const parsedData = JSON.parse(rawData);
      health.dataIntegrity = validateMigratedData(parsedData);
    } else {
      health.dataIntegrity = true; // No data is valid
    }
  } catch {
    health.dataIntegrity = false;
  }

  return health;
};

/**
 * Reset application to initial state
 */
export const resetApp = async (): Promise<void> => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    
    // Clear any cached data or state
    // This would be expanded based on future caching needs
    
    console.log('Application reset completed');
  } catch (error) {
    console.error('Error during application reset:', error);
    throw new Error('Failed to reset application');
  }
};

/**
 * Validate application state consistency
 */
export const validateAppState = (todos: Todo[]): {
  isValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for duplicate IDs
  const ids = todos.map(todo => todo.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    issues.push('Duplicate todo IDs detected');
  }
  
  // Check for invalid order values
  const orders = todos.map(todo => todo.order).sort((a, b) => a - b);
  for (let i = 0; i < orders.length; i++) {
    if (orders[i] !== i + 1) {
      issues.push('Invalid todo order sequence detected');
      break;
    }
  }
  
  // Check for invalid dates
  const invalidDates = todos.filter(todo => isNaN(todo.createdDate.getTime()));
  if (invalidDates.length > 0) {
    issues.push(`${invalidDates.length} todos have invalid creation dates`);
  }
  
  // Check for empty titles
  const emptyTitles = todos.filter(todo => !todo.title || todo.title.trim().length === 0);
  if (emptyTitles.length > 0) {
    issues.push(`${emptyTitles.length} todos have empty titles`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};