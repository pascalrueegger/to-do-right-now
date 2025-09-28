export interface Todo {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  color: string
  tags: string[]
  dueDate?: Date
  createdDate: Date
  completed: boolean
  order: number
}

export type TodoInput = Omit<Todo, 'id' | 'createdDate' | 'completed' | 'order'>