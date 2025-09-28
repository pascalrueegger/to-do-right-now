import { Todo } from '@/types/todo'

const STORAGE_KEY = 'todo-right-now-data'

export const storage = {
  getTodos(): Todo[] {
    if (typeof window === 'undefined') return []
    
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return []
      
      const todos = JSON.parse(data)
      return todos.map((todo: any) => ({
        ...todo,
        createdDate: new Date(todo.createdDate),
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
      }))
    } catch {
      return []
    }
  },

  saveTodos(todos: Todo[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch (error) {
      console.error('Failed to save todos:', error)
    }
  },

  addTodo(todo: Omit<Todo, 'id' | 'createdDate' | 'completed' | 'order'>): Todo {
    const todos = this.getTodos()
    const newTodo: Todo = {
      ...todo,
      id: crypto.randomUUID(),
      createdDate: new Date(),
      completed: false,
      order: todos.length
    }
    
    const updatedTodos = [...todos, newTodo]
    this.saveTodos(updatedTodos)
    return newTodo
  },

  updateTodo(id: string, updates: Partial<Todo>): void {
    const todos = this.getTodos()
    const index = todos.findIndex(todo => todo.id === id)
    
    if (index !== -1) {
      todos[index] = { ...todos[index], ...updates }
      this.saveTodos(todos)
    }
  },

  deleteTodo(id: string): void {
    const todos = this.getTodos()
    const filtered = todos.filter(todo => todo.id !== id)
    this.saveTodos(filtered)
  },

  reorderTodos(todos: Todo[]): void {
    const reordered = todos.map((todo, index) => ({ ...todo, order: index }))
    this.saveTodos(reordered)
  }
}