/**
 * TodoContext - Global state management for todos using React Context and useReducer
 * Provides centralized state management with localStorage persistence
 */

import React, { createContext, useContext, useReducer, useEffect, useState, ReactNode } from 'react';
import { Todo, TodoState, TodoAction } from '../lib/types';
import { DEFAULT_STATUS, DEFAULT_PRIORITY, DEFAULT_TODO_COLOR } from '../lib/constants';
import { generateTodoId } from '../lib/utils';
import useLocalStorage from '../hooks/useLocalStorage';
import { initializeApp, validateAppState, cleanupApp } from '../lib/appInitialization';

// Initial state
const initialState: TodoState = {
  todos: [],
  currentTodoId: null,
  isDrawerOpen: false,
};

// Helper function to determine current task (first non-completed task in order)
const getCurrentTodoId = (todos: Todo[]): string | null => {
  const incompleteTodos = todos
    .filter(todo => todo.status !== 'completed')
    .sort((a, b) => a.order - b.order);
  
  return incompleteTodos.length > 0 ? incompleteTodos[0].id : null;
};

// Helper function to generate next order value
const getNextOrder = (todos: Todo[]): number => {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map(todo => todo.order)) + 1;
};

// Helper function to sort todos by priority
const sortTodosByPriority = (todos: Todo[]): Todo[] => {
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
};

// Reducer function
const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'LOAD_TODOS': {
      const todos = action.payload;
      return {
        ...state,
        todos,
        currentTodoId: getCurrentTodoId(todos),
      };
    }

    case 'ADD_TODO': {
      const newTodo: Todo = {
        ...action.payload,
        id: generateTodoId(),
        createdDate: new Date(),
        order: getNextOrder(state.todos),
        status: DEFAULT_STATUS,
        priority: action.payload.priority || DEFAULT_PRIORITY,
        color: action.payload.color || DEFAULT_TODO_COLOR,
        tags: action.payload.tags || [],
        description: action.payload.description || '',
      };

      const updatedTodos = [...state.todos, newTodo];
      
      return {
        ...state,
        todos: updatedTodos,
        currentTodoId: getCurrentTodoId(updatedTodos),
      };
    }

    case 'UPDATE_TODO': {
      const { id, updates } = action.payload;
      const updatedTodos = state.todos.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      );

      return {
        ...state,
        todos: updatedTodos,
        currentTodoId: getCurrentTodoId(updatedTodos),
      };
    }

    case 'DELETE_TODO': {
      const todoId = action.payload;
      const updatedTodos = state.todos.filter(todo => todo.id !== todoId);

      return {
        ...state,
        todos: updatedTodos,
        currentTodoId: getCurrentTodoId(updatedTodos),
      };
    }

    case 'COMPLETE_TODO': {
      const todoId = action.payload;
      const updatedTodos = state.todos.map(todo =>
        todo.id === todoId 
          ? { ...todo, status: 'completed' as const }
          : todo
      );

      return {
        ...state,
        todos: updatedTodos,
        currentTodoId: getCurrentTodoId(updatedTodos),
      };
    }

    case 'REORDER_TODOS': {
      const reorderedTodos = action.payload.map((todo, index) => ({
        ...todo,
        order: index + 1
      }));

      return {
        ...state,
        todos: reorderedTodos,
        currentTodoId: getCurrentTodoId(reorderedTodos),
      };
    }

    case 'SORT_BY_PRIORITY': {
      const sortedTodos = sortTodosByPriority(state.todos);

      return {
        ...state,
        todos: sortedTodos,
        currentTodoId: getCurrentTodoId(sortedTodos),
      };
    }

    case 'TOGGLE_DRAWER': {
      return {
        ...state,
        isDrawerOpen: !state.isDrawerOpen,
      };
    }

    case 'SET_CURRENT_TODO': {
      return {
        ...state,
        currentTodoId: action.payload,
      };
    }

    default:
      return state;
  }
};

// Context type
interface TodoContextType {
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
  isInitialized: boolean;
  isLoading: boolean;
  initializationError: string | null;
  initializationWarnings: string[];
  storageError: any;
}

// Create context
const TodoContext = createContext<TodoContextType | null>(null);

// Provider component
interface TodoProviderProps {
  children: ReactNode;
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { data: storageData, updateTodos, isLoading, error: storageError } = useLocalStorage();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [initializationWarnings, setInitializationWarnings] = useState<string[]>([]);

  // Initialize app and load todos from localStorage on mount
  useEffect(() => {
    const initializeApplication = async () => {
      if (isLoading || isInitialized) return;

      try {
        const initResult = await initializeApp({
          enableMigration: true,
          enableValidation: true,
          enableFallback: true,
          maxRetries: 3
        });

        if (!initResult.success) {
          setInitializationError(`Initialization failed: ${initResult.errors.join(', ')}`);
          return;
        }

        if (initResult.warnings.length > 0) {
          setInitializationWarnings(initResult.warnings);
          console.warn('Initialization warnings:', initResult.warnings);
        }

        if (initResult.migrated) {
          console.log('Data successfully migrated to current schema version');
        }

        if (initResult.fallbackUsed) {
          console.warn('Using fallback storage due to localStorage issues');
        }

        // Load todos if available
        if (storageData?.todos) {
          // Convert serializable todos to Todo objects
          const todos: Todo[] = storageData.todos.map(todo => ({
            ...todo,
            createdDate: new Date(todo.createdDate)
          }));

          // Validate app state consistency
          const validation = validateAppState(todos);
          if (!validation.isValid) {
            console.warn('App state validation issues:', validation.issues);
            setInitializationWarnings(prev => [...prev, ...validation.issues]);
          }
          
          dispatch({ type: 'LOAD_TODOS', payload: todos });
        }

        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitializationError(errorMessage);
        console.error('App initialization failed:', error);
      }
    };

    initializeApplication();
  }, [storageData, isLoading, isInitialized]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupApp();
    };
  }, []);

  // Persist todos to localStorage whenever they change (but not during initial load)
  useEffect(() => {
    if (!isLoading && isInitialized) {
      updateTodos(state.todos).catch(error => {
        console.error('Failed to persist todos:', error);
        // TODO: Show user-friendly error message
      });
    }
  }, [state.todos, isLoading, isInitialized]);

  const contextValue: TodoContextType = {
    state,
    dispatch,
    isInitialized,
    isLoading,
    initializationError,
    initializationWarnings,
    storageError,
  };

  return (
    <TodoContext.Provider value={contextValue}>
      {children}
    </TodoContext.Provider>
  );
};

// Custom hook to use the TodoContext
export const useTodoContext = (): TodoContextType => {
  const context = useContext(TodoContext);
  
  if (!context) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  
  return context;
};

export default TodoContext;