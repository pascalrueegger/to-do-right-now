/**
 * TaskList - Component for displaying and managing the list of todos
 * Renders all todos in current order with edit/delete functionality
 */

import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/lib/types';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  className?: string;
}

export function TaskList({ className }: TaskListProps) {
  const { 
    todos, 
    incompleteTodos, 
    completedTodos, 
    updateTodo, 
    deleteTodo,
    addTodo 
  } = useTodos();
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle edit todo
  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
    setShowAddForm(false);
    setError(null);
  };

  // Handle delete todo with error handling
  const handleDeleteTodo = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      deleteTodo(id);
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error('Delete todo error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for both add and edit
  const handleFormSubmit = async (todoData: Partial<Omit<Todo, 'id' | 'createdDate' | 'order'>> & { title: string }) => {
    try {
      setIsLoading(true);
      setError(null);

      if (editingTodo) {
        // Update existing todo
        updateTodo(editingTodo.id, todoData);
        setEditingTodo(null);
      } else {
        // Add new todo
        addTodo(todoData);
        setShowAddForm(false);
      }
    } catch (err) {
      setError(editingTodo ? 'Failed to update task. Please try again.' : 'Failed to add task. Please try again.');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setEditingTodo(null);
    setShowAddForm(false);
    setError(null);
  };

  // Show add form
  const handleShowAddForm = () => {
    setShowAddForm(true);
    setEditingTodo(null);
    setError(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Add Task Button */}
      {!showAddForm && !editingTodo && (
        <Button
          onClick={handleShowAddForm}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add New Task
        </Button>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingTodo) && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <TaskForm
            initialData={editingTodo || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
            submitLabel={editingTodo ? 'Update Task' : 'Add Task'}
          />
        </div>
      )}

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Incomplete Tasks */}
        {incompleteTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Active Tasks ({incompleteTodos.length})
            </h3>
            <div className="space-y-3">
              {incompleteTodos.map((todo) => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                  showActions={true}
                  className="transition-all duration-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTodos.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Completed Tasks ({completedTodos.length})
            </h3>
            <div className="space-y-3">
              {completedTodos.map((todo) => (
                <TaskCard
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
                  showActions={true}
                  className="opacity-75 transition-all duration-200"
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && !showAddForm && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto mb-2" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No tasks yet
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Create your first task to get started with focused productivity
            </p>
            <Button onClick={handleShowAddForm} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Task
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}