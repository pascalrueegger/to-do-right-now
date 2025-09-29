'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import PlanningDrawer from '@/components/PlanningDrawer'
import { storage } from '@/lib/storage'
import { Todo } from '@/types/todo'

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [currentTodo, setCurrentTodo] = useState<Todo | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = () => {
    const allTodos = storage.getTodos()
    setTodos(allTodos)
    const incompleteTodos = allTodos.filter(t => !t.completed).sort((a, b) => a.order - b.order)
    setCurrentTodo(incompleteTodos[0] || null)
  }

  const handleCompleteTodo = () => {
    if (!currentTodo) return

    storage.updateTodo(currentTodo.id, { completed: true, completedDate: new Date() })
    loadTodos()
  }

  const handleSkipTodo = () => {
    if (!currentTodo) return
    // Move to end of the list
    const incompleteTodos = todos.filter(t => !t.completed).sort((a, b) => a.order - b.order)
    const maxOrder = incompleteTodos.length > 0 ? Math.max(...incompleteTodos.map(t => t.order)) : 0
    storage.updateTodo(currentTodo.id, { order: maxOrder + 1 })
    loadTodos()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8 relative overflow-hidden">
      <div className="absolute top-5 right-5">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-3 bg-surface rounded-full shadow-lg hover:bg-secondary transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {currentTodo ? (
          <motion.div
            key={currentTodo.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-surface rounded-2xl shadow-2xl p-8 text-center"
          >
            <h1 className="text-4xl font-bold mb-2">{currentTodo.title}</h1>
            {currentTodo.description && (
              <p className="text-lg text-gray-400 mb-6">{currentTodo.description}</p>
            )}
            
            <div className="flex justify-center gap-4 mt-8">
              <button 
                onClick={handleCompleteTodo}
                className="bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Done
              </button>
              <button 
                onClick={handleSkipTodo}
                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Skip
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">All done!</h1>
            <p className="text-lg text-gray-400">You've completed all your tasks for now.</p>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="mt-8 bg-primary hover:bg-secondary text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Add More Todos
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <PlanningDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        todos={todos}
        onTodosChange={loadTodos}
      />
    </main>
  )
}