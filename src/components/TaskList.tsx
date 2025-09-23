/**
 * TaskList - Component for displaying and managing the list of todos
 * Renders all todos in current order with edit/delete functionality and drag-and-drop reordering
 */

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DndContextProps,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/hooks/useTodos';
import { Todo } from '@/lib/types';
import { Plus, Loader2, AlertCircle, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  className?: string;
}

// Sortable wrapper for TaskCard
interface SortableTaskCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  isDisabled?: boolean;
}

function SortableTaskCard({ todo, onEdit, onDelete, isDisabled }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: todo.id,
    disabled: isDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        todo={todo}
        onEdit={onEdit}
        onDelete={onDelete}
        showActions={true}
        isDragging={isDragging}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
        className="transition-all duration-200"
      />
    </div>
  );
}

export function TaskList({ className }: TaskListProps) {
  const { 
    todos, 
    incompleteTodos, 
    completedTodos, 
    updateTodo, 
    deleteTodo,
    addTodo,
    reorderTodos,
    sortByPriority
  } = useTodos();
  
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);



  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    try {
      // Find the todos being reordered (only incomplete todos can be reordered)
      const oldIndex = incompleteTodos.findIndex((todo) => todo.id === active.id);
      const newIndex = incompleteTodos.findIndex((todo) => todo.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder the incomplete todos
        const reorderedIncompleteTodos = arrayMove(incompleteTodos, oldIndex, newIndex);
        
        // Combine with completed todos (which maintain their original order)
        const allTodos = [...reorderedIncompleteTodos, ...completedTodos];
        
        // Update the order property and persist to localStorage
        reorderTodos(allTodos);
      }
    } catch (err) {
      setError('Failed to reorder tasks. Please try again.');
      console.error('Drag and drop error:', err);
    }
  };

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
  const handleFormSubmit = async (todoData: Omit<Todo, 'id' | 'createdDate' | 'order' | 'status'>) => {
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

  // Handle priority sorting
  const handleSortByPriority = async () => {
    try {
      setIsSorting(true);
      setError(null);
      sortByPriority();
      
      // Provide visual feedback that sorting was applied
      setTimeout(() => {
        setIsSorting(false);
      }, 500);
    } catch (err) {
      setError('Failed to sort tasks. Please try again.');
      console.error('Sort by priority error:', err);
      setIsSorting(false);
    }
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
          className="w-full gradient-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl py-3"
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
        <div className="modern-card p-6 animate-slide-up">
          <TaskForm
            todo={editingTodo || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Task Lists */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6">
          {/* Incomplete Tasks */}
          {incompleteTodos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Active Tasks ({incompleteTodos.length})
                </h3>
                {incompleteTodos.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortByPriority}
                    disabled={isLoading || isSorting || !!editingTodo || showAddForm}
                    className="flex items-center gap-1.5 h-8 px-3 text-xs rounded-lg hover:bg-gray-100 transition-colors"
                    title="Sort tasks by priority (High → Medium → Low)"
                  >
                    {isSorting ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3" />
                    )}
                    {isSorting ? 'Sorting...' : 'Sort'}
                  </Button>
                )}
              </div>
              <SortableContext 
                items={incompleteTodos.map(todo => todo.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {incompleteTodos.map((todo) => (
                    <SortableTaskCard
                      key={todo.id}
                      todo={todo}
                      onEdit={handleEditTodo}
                      onDelete={handleDeleteTodo}
                      isDisabled={isLoading || !!editingTodo || showAddForm}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTodos.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
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
            <div className="text-center py-12 animate-fade-in">
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-sm text-gray-600 mb-6 max-w-xs mx-auto">
                Create your first task to get started with focused productivity
              </p>
              <Button 
                onClick={handleShowAddForm} 
                disabled={isLoading}
                className="gradient-primary transition-all duration-200 hover:scale-105 rounded-xl px-6"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Task
              </Button>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <TaskCard
              todo={incompleteTodos.find(todo => todo.id === activeId)!}
              onEdit={() => {}}
              onDelete={() => {}}
              showActions={true}
              isDragging={true}
              className="rotate-2 shadow-lg"
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}