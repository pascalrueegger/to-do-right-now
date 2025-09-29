'use client'

import { useState } from 'react'
import { X, Plus, Edit2, Trash2, GripVertical, Calendar, Tag } from 'lucide-react'
import { Todo } from '@/types/todo'
import { storage } from '@/lib/storage'
import TodoForm from './TodoForm'

interface PlanningDrawerProps {
  isOpen: boolean
  onClose: () => void
  todos: Todo[]
  onTodosChange: () => void
}

export default function PlanningDrawer({ isOpen, onClose, todos, onTodosChange }: PlanningDrawerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [draggedTodo, setDraggedTodo] = useState<Todo | null>(null)

  const incompleteTodos = todos.filter(todo => !todo.completed).sort((a, b) => a.order - b.order)
  const completedTodos = todos.filter(todo => todo.completed)

  const handleDeleteTodo = (id: string) => {
    storage.deleteTodo(id)
    onTodosChange()
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTodo(null)
    onTodosChange()
  }

  const handleDragStart = (todo: Todo) => {
    setDraggedTodo(todo)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetTodo: Todo) => {
    e.preventDefault()
    
    if (!draggedTodo || draggedTodo.id === targetTodo.id) return

    const reorderedTodos = [...incompleteTodos]
    const draggedIndex = reorderedTodos.findIndex(t => t.id === draggedTodo.id)
    const targetIndex = reorderedTodos.findIndex(t => t.id === targetTodo.id)

    reorderedTodos.splice(draggedIndex, 1)
    reorderedTodos.splice(targetIndex, 0, draggedTodo)

    storage.reorderTodos([...reorderedTodos, ...completedTodos])
    setDraggedTodo(null)
    onTodosChange()
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed left-0 top-0 h-full w-96 bg-surface z-[61] shadow-2xl transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-background">
            <h2 className="text-xl font-semibold">Planning</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Add Todo Button */}
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-6"
            >
              <Plus size={20} />
              Add New Todo
            </button>

            {/* Pending Todos */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-300">
                Pending ({incompleteTodos.length})
              </h3>
              <div className="space-y-2">
                {incompleteTodos.map((todo) => (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={() => handleDragStart(todo)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, todo)}
                    className="bg-background rounded-lg p-3 cursor-move hover:bg-purple-900 transition-colors border-l-4"
                    style={{ borderLeftColor: todo.color }}
                  >
                    <div className="flex items-start gap-3">
                      <GripVertical size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{todo.title}</h4>
                          <span className={`px-1.5 py-0.5 rounded text-xs ${
                            todo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            todo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {todo.priority[0].toUpperCase()}
                          </span>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                            {todo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          {todo.dueDate && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{formatDate(todo.dueDate)}</span>
                            </div>
                          )}
                          {todo.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Tag size={12} />
                              <span>{todo.tags.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTodo(todo)}
                          className="p-1.5 hover:bg-secondary rounded transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 hover:bg-secondary rounded transition-colors text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {incompleteTodos.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No pending todos</p>
                )}
              </div>
            </div>

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-300">
                  Completed ({completedTodos.length})
                </h3>
                <div className="space-y-2">
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="bg-background/50 rounded-lg p-3 opacity-60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium line-through">{todo.title}</h4>
                        </div>
                        <button
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-1.5 hover:bg-secondary rounded transition-colors text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Todo Form Modal */}
      {showForm && (
        <TodoForm
          todo={editingTodo}
          onClose={handleFormClose}
        />
      )}
    </>
  )
}