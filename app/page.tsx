'use client'

import { useState, useEffect } from 'react'
import { Menu, Plus, Check, Clock, Tag } from 'lucide-react'
import { Todo } from '@/types/todo'
import { storage } from '@/lib/storage'
import PlanningDrawer from '@/components/PlanningDrawer'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null)

  useEffect(() => {
    const loadedTodos = storage.getTodos()
    setTodos(loadedTodos)
    
    // Find the first incomplete todo as current
    const nextTodo = loadedTodos
      .filter(todo => !todo.completed)
      .sort((a, b) => a.order - b.order)[0]
    
    setCurrentTodo(nextTodo || null)
  }, [])

  const handleCompleteCurrentTodo = () => {
    if (!currentTodo) return
    
    storage.updateTodo(currentTodo.id, { completed: true })
    const updatedTodos = storage.getTodos()
    setTodos(updatedTodos)
    
    // Find next todo
    const nextTodo = updatedTodos
      .filter(todo => !todo.completed)
      .sort((a, b) => a.order - b.order)[0]
    
    setCurrentTodo(nextTodo || null)
  }

  const refreshTodos = () => {
    const updatedTodos = storage.getTodos()
    setTodos(updatedTodos)
    
    if (!currentTodo || currentTodo.completed) {
      const nextTodo = updatedTodos
        .filter(todo => !todo.completed)
        .sort((a, b) => a.order - b.order)[0]
      
      setCurrentTodo(nextTodo || null)
    }
  }

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`
    return `Due in ${diffDays} days`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold">Todo Right Now</h1>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {currentTodo ? (
          <div className="max-w-2xl w-full">
            <div 
              className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-l-4"
              style={{ borderLeftColor: currentTodo.color }}
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    currentTodo.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    currentTodo.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {currentTodo.priority.toUpperCase()}
                  </span>
                  {currentTodo.dueDate && (
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock size={14} />
                      <span>{formatDueDate(currentTodo.dueDate)}</span>
                    </div>
                  )}
                </div>
                <h2 className="text-3xl font-bold mb-4">{currentTodo.title}</h2>
                {currentTodo.description && (
                  <p className="text-gray-300 text-lg leading-relaxed mb-4">
                    {currentTodo.description}
                  </p>
                )}
                {currentTodo.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag size={16} className="text-gray-400" />
                    {currentTodo.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded text-sm text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCompleteCurrentTodo}
                className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Check size={20} />
                Mark as Complete
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={48} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">All done!</h2>
              <p className="text-gray-400">You have no pending tasks right now.</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add New Todo
            </button>
          </div>
        )}
      </main>

      {/* Planning Drawer */}
      <PlanningDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        todos={todos}
        onTodosChange={refreshTodos}
      />
    </div>
  )
}