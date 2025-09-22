import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Todo, SerializableTodo, Priority, TodoStatus } from './types';
import { 
  MAX_TITLE_LENGTH, 
  MAX_DESCRIPTION_LENGTH, 
  MAX_TAG_LENGTH, 
  MAX_TAGS_COUNT,
  PRIORITIES,
  STATUSES,
  TASK_COLORS
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validation utilities
 */

export function validateTodoTitle(title: string): string | null {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
  }
  return null;
}

export function validateTodoDescription(description: string): string | null {
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`;
  }
  return null;
}

export function validatePriority(priority: string): priority is Priority {
  return PRIORITIES.includes(priority as Priority);
}

export function validateStatus(status: string): status is TodoStatus {
  return STATUSES.includes(status as TodoStatus);
}

export function validateColor(color: string): boolean {
  // Check if it's a valid hex color
  const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexColorRegex.test(color);
}

export function validateTags(tags: string[]): string | null {
  if (tags.length > MAX_TAGS_COUNT) {
    return `Maximum ${MAX_TAGS_COUNT} tags allowed`;
  }
  
  for (const tag of tags) {
    if (tag.length > MAX_TAG_LENGTH) {
      return `Tag "${tag}" is too long (max ${MAX_TAG_LENGTH} characters)`;
    }
  }
  
  return null;
}
/**
 * Formatting utilities
 */

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return formatDate(date);
  }
}

export function sanitizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/\s+/g, '-');
}

export function sanitizeTags(tags: string[]): string[] {
  return tags
    .map(sanitizeTag)
    .filter(tag => tag.length > 0)
    .filter((tag, index, array) => array.indexOf(tag) === index); // Remove duplicates
}

/**
 * Data transformation utilities
 */

export function serializeTodo(todo: Todo): SerializableTodo {
  return {
    ...todo,
    createdDate: todo.createdDate.toISOString()
  };
}

export function deserializeTodo(serializedTodo: SerializableTodo): Todo {
  return {
    ...serializedTodo,
    createdDate: new Date(serializedTodo.createdDate)
  };
}

export function generateTodoId(): string {
  return crypto.randomUUID();
}

export function getNextOrderValue(todos: Todo[]): number {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map(todo => todo.order)) + 1;
}

/**
 * Todo utility functions
 */

export function getCurrentTodo(todos: Todo[]): Todo | null {
  const incompleteTodos = todos
    .filter(todo => todo.status !== 'completed')
    .sort((a, b) => a.order - b.order);
  
  return incompleteTodos.length > 0 ? incompleteTodos[0] : null;
}

export function sortTodosByPriority(todos: Todo[]): Todo[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  
  return [...todos].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // If same priority, maintain original order
    return a.order - b.order;
  }).map((todo, index) => ({
    ...todo,
    order: index + 1
  }));
}

export function isValidTaskColor(color: string): boolean {
  return TASK_COLORS.includes(color) || validateColor(color);
}

/**
 * Error handling utilities
 */

export function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}