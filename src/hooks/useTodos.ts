/**
 * useTodos hook - Convenient interface for todo operations
 * Combines TodoContext with localStorage persistence and provides helper functions
 */

import { useCallback, useMemo } from 'react';
import { useTodoContext } from '../context/TodoContext';
import { Todo } from '../lib/types';

export interface UseTodosReturn {
  // State
  todos: Todo[];
  currentTodo: Todo | null;
  isDrawerOpen: boolean;
  
  // Computed values
  completedTodos: Todo[];
  incompleteTodos: Todo[];
  todosByPriority: {
    high: Todo[];
    medium: Todo[];
    low: Todo[];
  };
  
  // Actions
  addTodo: (todo: Omit<Todo, 'id' | 'createdDate' | 'order'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  completeTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
  sortByPriority: () => void;
  toggleDrawer: () => void;
  setCurrentTodo: (id: string | null) => void;
  
  // Utility functions
  getTodoById: (id: string) => Todo | undefined;
  getNextTodo: (currentId?: string) => Todo | null;
  getPreviousTodo: (currentId?: string) => Todo | null;
}

export const useTodos = (): UseTodosReturn => {
  const { state, dispatch } = useTodoContext();

  // Memoized computed values
  const currentTodo = useMemo(() => {
    return state.currentTodoId 
      ? state.todos.find(todo => todo.id === state.currentTodoId) || null
      : null;
  }, [state.todos, state.currentTodoId]);

  const completedTodos = useMemo(() => {
    return state.todos.filter(todo => todo.status === 'completed');
  }, [state.todos]);

  const incompleteTodos = useMemo(() => {
    return state.todos
      .filter(todo => todo.status !== 'completed')
      .sort((a, b) => a.order - b.order);
  }, [state.todos]);

  const todosByPriority = useMemo(() => {
    return {
      high: state.todos.filter(todo => todo.priority === 'high'),
      medium: state.todos.filter(todo => todo.priority === 'medium'),
      low: state.todos.filter(todo => todo.priority === 'low'),
    };
  }, [state.todos]);

  // Action creators
  const addTodo = useCallback((todo: Omit<Todo, 'id' | 'createdDate' | 'order'>) => {
    dispatch({ type: 'ADD_TODO', payload: todo });
  }, [dispatch]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    dispatch({ type: 'UPDATE_TODO', payload: { id, updates } });
  }, [dispatch]);

  const deleteTodo = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TODO', payload: id });
  }, [dispatch]);

  const completeTodo = useCallback((id: string) => {
    dispatch({ type: 'COMPLETE_TODO', payload: id });
  }, [dispatch]);

  const reorderTodos = useCallback((todos: Todo[]) => {
    dispatch({ type: 'REORDER_TODOS', payload: todos });
  }, [dispatch]);

  const sortByPriority = useCallback(() => {
    dispatch({ type: 'SORT_BY_PRIORITY' });
  }, [dispatch]);

  const toggleDrawer = useCallback(() => {
    dispatch({ type: 'TOGGLE_DRAWER' });
  }, [dispatch]);

  const setCurrentTodo = useCallback((id: string | null) => {
    dispatch({ type: 'SET_CURRENT_TODO', payload: id });
  }, [dispatch]);

  // Utility functions
  const getTodoById = useCallback((id: string): Todo | undefined => {
    return state.todos.find(todo => todo.id === id);
  }, [state.todos]);

  const getNextTodo = useCallback((currentId?: string): Todo | null => {
    const targetId = currentId || state.currentTodoId;
    if (!targetId) return incompleteTodos[0] || null;

    const currentIndex = incompleteTodos.findIndex(todo => todo.id === targetId);
    if (currentIndex === -1) return incompleteTodos[0] || null;

    return incompleteTodos[currentIndex + 1] || null;
  }, [incompleteTodos, state.currentTodoId]);

  const getPreviousTodo = useCallback((currentId?: string): Todo | null => {
    const targetId = currentId || state.currentTodoId;
    if (!targetId) return null;

    const currentIndex = incompleteTodos.findIndex(todo => todo.id === targetId);
    if (currentIndex <= 0) return null;

    return incompleteTodos[currentIndex - 1];
  }, [incompleteTodos, state.currentTodoId]);

  return {
    // State
    todos: state.todos,
    currentTodo,
    isDrawerOpen: state.isDrawerOpen,
    
    // Computed values
    completedTodos,
    incompleteTodos,
    todosByPriority,
    
    // Actions
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    reorderTodos,
    sortByPriority,
    toggleDrawer,
    setCurrentTodo,
    
    // Utility functions
    getTodoById,
    getNextTodo,
    getPreviousTodo,
  };
};

export default useTodos;