'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Tag, Palette } from 'lucide-react'
import { Todo, TodoInput } from '@/types/todo'
import { storage } from '@/lib/storage'

interface TodoFormProps {
  todo?: Todo | null
  onClose: () => void
}

const COLORS = [
  '#0b429aff', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
]

export default function TodoForm({ todo, onClose }: TodoFormProps) {
  const [formData, setFormData] = useState<TodoInput>({
    title: '',
    description: '',
    priority: 'medium',
    color: COLORS[0],
    tags: [],
    dueDate: undefined
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        color: todo.color,
        tags: [...todo.tags],
        dueDate: todo.dueDate
      })
    }
  }, [todo])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) return

    if (todo) {
      storage.updateTodo(todo.id, formData)
    } else {
      storage.addTodo(formData)
    }

    onClose()
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-surface rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative z-[71]">
        <div className="flex items-center justify-between p-4 border-b border-background">
          <h3 className="text-lg font-semibold">
            {todo ? 'Edit Todo' : 'Add New Todo'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-background border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="What needs to be done?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-background border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
              placeholder="Add more details..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="w-full bg-background border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Palette size={16} />
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${formData.color === color ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar size={16} />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate ? formData.dueDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                dueDate: e.target.value ? new Date(e.target.value) : undefined
              }))}
              className="w-full bg-background border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
              <Tag size={16} />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="flex-1 bg-background border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-background rounded text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 rounded-lg hover:bg-background transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary hover:bg-secondary rounded-lg transition-colors"
            >
              {todo ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
