/**
 * Constants for the Focus Todo App
 */

import { Priority, TodoStatus } from './types';

// Priority levels
export const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high: '#ef4444', // red-500
  medium: '#f59e0b', // amber-500
  low: '#10b981' // emerald-500
};

// Status levels
export const STATUSES: TodoStatus[] = ['pending', 'in-progress', 'completed'];

export const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed'
};

// Default values
export const DEFAULT_TODO_COLOR = '#6366f1'; // indigo-500
export const DEFAULT_PRIORITY: Priority = 'medium';
export const DEFAULT_STATUS: TodoStatus = 'pending';

// Validation constants
export const MAX_TITLE_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_TAG_LENGTH = 30;
export const MAX_TAGS_COUNT = 10;

// Local storage key
export const STORAGE_KEY = 'to-do-right-now';

// Color palette for task categorization
export const TASK_COLORS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#ef4444', // red-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
  '#84cc16', // lime-500
  '#f97316'  // orange-500
];

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  CLOSE_DRAWER: 'Escape',
  COMPLETE_TASK: 'Enter',
  OPEN_DRAWER: 'KeyP' // 'p' for planning
} as const;