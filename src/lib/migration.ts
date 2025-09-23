/**
 * Data migration system for handling schema changes
 * Provides versioned data migration and backward compatibility
 */

import { StorageData, SerializableTodo } from './types';
import { DEFAULT_PRIORITY, DEFAULT_STATUS, DEFAULT_TODO_COLOR } from './constants';

// Current schema version
export const CURRENT_SCHEMA_VERSION = 1;

// Version history and migration functions
export interface MigrationFunction {
  (data: any): any;
}

export interface SchemaVersion {
  version: number;
  description: string;
  migrate: MigrationFunction;
}

// Migration from unversioned data (v0) to v1
const migrateV0ToV1: MigrationFunction = (data: any): StorageData => {
  // Handle legacy data structure or initialize new structure
  if (!data || typeof data !== 'object') {
    return {
      version: 1,
      todos: [],
      settings: {
        lastOpenedDrawer: false
      }
    };
  }

  // If data has todos array but no version, it's v0
  if (Array.isArray(data.todos) && !data.version) {
    const migratedTodos: SerializableTodo[] = data.todos.map((todo: any, index: number) => ({
      id: todo.id || `todo-${Date.now()}-${index}`,
      title: todo.title || 'Untitled Task',
      description: todo.description || '',
      priority: ['high', 'medium', 'low'].includes(todo.priority) ? todo.priority : DEFAULT_PRIORITY,
      tags: Array.isArray(todo.tags) ? todo.tags.filter((tag: any) => typeof tag === 'string') : [],
      color: typeof todo.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(todo.color) ? todo.color : DEFAULT_TODO_COLOR,
      createdDate: todo.createdDate || new Date().toISOString(),
      status: ['pending', 'in-progress', 'completed'].includes(todo.status) ? todo.status : DEFAULT_STATUS,
      order: typeof todo.order === 'number' ? todo.order : index + 1
    }));

    return {
      version: 1,
      todos: migratedTodos,
      settings: {
        lastOpenedDrawer: data.settings?.lastOpenedDrawer || false
      }
    };
  }

  // If data already has version 1 structure, return as-is
  if (data.version === 1) {
    return data;
  }

  // Fallback for unknown structure
  return {
    version: 1,
    todos: [],
    settings: {
      lastOpenedDrawer: false
    }
  };
};

// Schema versions registry
const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    description: 'Initial versioned schema with todos and settings',
    migrate: migrateV0ToV1
  }
];

/**
 * Migrate data to the current schema version
 */
export const migrateData = (data: any): StorageData => {
  if (!data) {
    return {
      version: CURRENT_SCHEMA_VERSION,
      todos: [],
      settings: {
        lastOpenedDrawer: false
      }
    };
  }

  let currentData = data;
  const dataVersion = currentData.version || 0;

  // Apply migrations sequentially from current version to latest
  for (const schema of SCHEMA_VERSIONS) {
    if (schema.version > dataVersion) {
      try {
        currentData = schema.migrate(currentData);
        console.log(`Migrated data to schema version ${schema.version}: ${schema.description}`);
      } catch (error) {
        console.error(`Failed to migrate to schema version ${schema.version}:`, error);
        // Return safe fallback data
        return {
          version: CURRENT_SCHEMA_VERSION,
          todos: [],
          settings: {
            lastOpenedDrawer: false
          }
        };
      }
    }
  }

  // Ensure version is set to current
  currentData.version = CURRENT_SCHEMA_VERSION;
  return currentData;
};

/**
 * Validate migrated data structure
 */
export const validateMigratedData = (data: StorageData): boolean => {
  try {
    return (
      typeof data === 'object' &&
      data !== null &&
      data.version === CURRENT_SCHEMA_VERSION &&
      Array.isArray(data.todos) &&
      typeof data.settings === 'object' &&
      data.settings !== null &&
      typeof data.settings.lastOpenedDrawer === 'boolean'
    );
  } catch {
    return false;
  }
};

/**
 * Get migration history for debugging
 */
export const getMigrationHistory = (): SchemaVersion[] => {
  return [...SCHEMA_VERSIONS];
};