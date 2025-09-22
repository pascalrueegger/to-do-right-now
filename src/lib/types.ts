/**
 * Core TypeScript interfaces and types for the Focus Todo App
 */

export interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  color: string;
  createdDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  order: number;
}

export interface TodoState {
  todos: Todo[];
  currentTodoId: string | null;
  isDrawerOpen: boolean;
}

export type TodoAction = 
  | { type: 'ADD_TODO'; payload: Partial<Omit<Todo, 'id' | 'createdDate' | 'order'>> & { title: string } }
  | { type: 'UPDATE_TODO'; payload: { id: string; updates: Partial<Todo> } }
  | { type: 'DELETE_TODO'; payload: string }
  | { type: 'COMPLETE_TODO'; payload: string }
  | { type: 'REORDER_TODOS'; payload: Todo[] }
  | { type: 'SORT_BY_PRIORITY' }
  | { type: 'TOGGLE_DRAWER' }
  | { type: 'SET_CURRENT_TODO'; payload: string | null }
  | { type: 'LOAD_TODOS'; payload: Todo[] };

export type Priority = 'high' | 'medium' | 'low';
export type TodoStatus = 'pending' | 'in-progress' | 'completed';

// Serializable version of Todo for localStorage
export interface SerializableTodo extends Omit<Todo, 'createdDate'> {
  createdDate: string; // ISO string format
}

// Local storage data structure
export interface StorageData {
  todos: SerializableTodo[];
  settings: {
    lastOpenedDrawer: boolean;
  };
}