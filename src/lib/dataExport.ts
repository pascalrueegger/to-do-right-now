/**
 * Data export/import functionality for backup and restore
 * Provides JSON export/import with validation and error handling
 */

import { StorageData, Todo } from './types';
import { CURRENT_SCHEMA_VERSION } from './migration';

export interface ExportData {
  version: number;
  exportDate: string;
  appVersion: string;
  data: StorageData;
  checksum?: string;
}

export class ExportError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ExportError';
  }
}

export class ImportError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'ImportError';
  }
}

/**
 * Generate a simple checksum for data integrity
 */
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Export todos data as JSON
 */
export const exportTodosData = (data: StorageData): string => {
  try {
    const exportData: ExportData = {
      version: CURRENT_SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      data: {
        ...data,
        version: CURRENT_SCHEMA_VERSION
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    exportData.checksum = generateChecksum(jsonString);
    
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    throw new ExportError(
      `Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EXPORT_FAILED'
    );
  }
};

/**
 * Import todos data from JSON string
 */
export const importTodosData = (jsonString: string): StorageData => {
  try {
    const importData: ExportData = JSON.parse(jsonString);
    
    // Validate import data structure
    if (!isValidExportData(importData)) {
      throw new ImportError('Invalid export data structure', 'INVALID_STRUCTURE');
    }

    // Verify checksum if present
    if (importData.checksum) {
      const dataWithoutChecksum = { ...importData };
      delete dataWithoutChecksum.checksum;
      const expectedChecksum = generateChecksum(JSON.stringify(dataWithoutChecksum, null, 2));
      
      if (importData.checksum !== expectedChecksum) {
        console.warn('Checksum mismatch detected, data may be corrupted');
        // Don't throw error, just warn - data might still be usable
      }
    }

    // Validate the actual data
    if (!isValidStorageData(importData.data)) {
      throw new ImportError('Invalid todos data in import', 'INVALID_DATA');
    }

    return importData.data;
  } catch (error) {
    if (error instanceof ImportError) {
      throw error;
    }
    
    if (error instanceof SyntaxError) {
      throw new ImportError('Invalid JSON format', 'INVALID_JSON');
    }
    
    throw new ImportError(
      `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'IMPORT_FAILED'
    );
  }
};

/**
 * Download data as JSON file
 */
export const downloadDataAsFile = (data: StorageData, filename?: string): void => {
  try {
    const jsonString = exportTodosData(data);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `focus-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    throw new ExportError(
      `Failed to download data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'DOWNLOAD_FAILED'
    );
  }
};

/**
 * Read file and import data
 */
export const importDataFromFile = (file: File): Promise<StorageData> => {
  return new Promise((resolve, reject) => {
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      reject(new ImportError('File must be a JSON file', 'INVALID_FILE_TYPE'));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new ImportError('File size too large (max 10MB)', 'FILE_TOO_LARGE'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const jsonString = event.target?.result as string;
        const data = importTodosData(jsonString);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new ImportError('Failed to read file', 'FILE_READ_ERROR'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * Validate export data structure
 */
const isValidExportData = (data: any): data is ExportData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'number' &&
    typeof data.exportDate === 'string' &&
    typeof data.appVersion === 'string' &&
    typeof data.data === 'object' &&
    data.data !== null
  );
};

/**
 * Validate storage data structure
 */
const isValidStorageData = (data: any): data is StorageData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray(data.todos) &&
    typeof data.settings === 'object' &&
    data.settings !== null &&
    typeof data.settings.lastOpenedDrawer === 'boolean'
  );
};

/**
 * Get export statistics
 */
export const getExportStats = (data: StorageData) => {
  const todos = data.todos;
  const completedTodos = todos.filter(todo => todo.status === 'completed');
  const pendingTodos = todos.filter(todo => todo.status === 'pending');
  const inProgressTodos = todos.filter(todo => todo.status === 'in-progress');
  
  const priorityCounts = {
    high: todos.filter(todo => todo.priority === 'high').length,
    medium: todos.filter(todo => todo.priority === 'medium').length,
    low: todos.filter(todo => todo.priority === 'low').length
  };

  return {
    totalTodos: todos.length,
    completedTodos: completedTodos.length,
    pendingTodos: pendingTodos.length,
    inProgressTodos: inProgressTodos.length,
    priorityCounts,
    oldestTodo: todos.length > 0 ? new Date(Math.min(...todos.map(t => new Date(t.createdDate).getTime()))) : null,
    newestTodo: todos.length > 0 ? new Date(Math.max(...todos.map(t => new Date(t.createdDate).getTime()))) : null
  };
};