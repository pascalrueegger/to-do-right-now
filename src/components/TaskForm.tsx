/**
 * TaskForm - Component for adding and editing todo items
 * Provides form validation, tag input, color picker, and error handling
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { X, Plus, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  validateTodoTitle, 
  validateTodoDescription, 
  validateTags, 
  sanitizeTags,
  validatePriority
} from '../lib/utils';
import { 
  PRIORITIES, 
  PRIORITY_LABELS, 
  TASK_COLORS, 
  DEFAULT_PRIORITY, 
  DEFAULT_TODO_COLOR,
  MAX_TITLE_LENGTH,
  MAX_DESCRIPTION_LENGTH
} from '../lib/constants';
import { Todo, Priority } from '../lib/types';

interface TaskFormProps {
  /** Existing todo to edit (undefined for new todo) */
  todo?: Todo;
  /** Callback when form is submitted successfully */
  onSubmit: (todoData: Omit<Todo, 'id' | 'createdDate' | 'order' | 'status'>) => void;
  /** Callback when form is cancelled */
  onCancel: () => void;
  /** Whether the form is in a loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

interface FormData {
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  color: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  tags?: string;
  general?: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  todo,
  onSubmit,
  onCancel,
  isLoading = false,
  className
}) => {
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: todo?.title || '',
    description: todo?.description || '',
    priority: todo?.priority || DEFAULT_PRIORITY,
    tags: todo?.tags || [],
    color: todo?.color || DEFAULT_TODO_COLOR
  });

  // Validation errors
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');
  
  // Form touched state for real-time validation
  const [touched, setTouched] = useState({
    title: false,
    description: false
  });

  // Reset form when todo prop changes
  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        tags: todo.tags,
        color: todo.color
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: DEFAULT_PRIORITY,
        tags: [],
        color: DEFAULT_TODO_COLOR
      });
    }
    setErrors({});
    setTouched({ title: false, description: false });
    setTagInput('');
  }, [todo]);

  // Validate form data
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Validate title
    const titleError = validateTodoTitle(formData.title);
    if (titleError) {
      newErrors.title = titleError;
    }

    // Validate description
    const descriptionError = validateTodoDescription(formData.description);
    if (descriptionError) {
      newErrors.description = descriptionError;
    }

    // Validate tags
    const tagsError = validateTags(formData.tags);
    if (tagsError) {
      newErrors.tags = tagsError;
    }

    return newErrors;
  }, [formData]);

  // Real-time validation
  useEffect(() => {
    const newErrors = validateForm();
    setErrors(newErrors);
  }, [validateForm]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string | Priority) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched for validation display
    if (field === 'title' || field === 'description') {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  // Handle input blur to trigger validation
  const handleInputBlur = (field: 'title' | 'description') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Handle tag input
  const handleTagInputChange = (value: string) => {
    setTagInput(value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && formData.tags.length > 0) {
      // Remove last tag if backspace is pressed on empty input
      removeTag(formData.tags.length - 1);
    }
  };

  const addTag = () => {
    if (tagInput.trim()) {
      const newTags = [...formData.tags, tagInput.trim()];
      const sanitizedTags = sanitizeTags(newTags);
      setFormData(prev => ({ ...prev, tags: sanitizedTags }));
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched and validate
    const newTouched = { title: true, description: true };
    setTouched(newTouched);
    
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    try {
      onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        tags: formData.tags,
        color: formData.color
      });
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : 'Failed to save task' 
      });
    }
  };

  // Check if form is valid
  const isFormValid = Object.keys(validateForm()).length === 0 && formData.title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {/* General error message */}
      {errors.general && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {errors.general}
        </div>
      )}

      {/* Title field */}
      <div className="space-y-2">
        <label htmlFor="task-title" className="text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <Input
          id="task-title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          onBlur={() => handleInputBlur('title')}
          placeholder="Enter task title..."
          maxLength={MAX_TITLE_LENGTH}
          className={cn(
            touched.title && errors.title && "border-red-500 focus-visible:ring-red-500"
          )}
          disabled={isLoading}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {(touched.title || Object.keys(errors).length > 0) && errors.title && (
              <span id="title-error" className="text-red-500">{errors.title}</span>
            )}
          </span>
          <span>{formData.title.length}/{MAX_TITLE_LENGTH}</span>
        </div>
      </div>

      {/* Description field */}
      <div className="space-y-2">
        <label htmlFor="task-description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea
          id="task-description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          onBlur={() => handleInputBlur('description')}
          placeholder="Enter task description..."
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={3}
          className={cn(
            touched.description && errors.description && "border-red-500 focus-visible:ring-red-500"
          )}
          disabled={isLoading}
          aria-describedby={errors.description ? "description-error" : undefined}
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {(touched.description || Object.keys(errors).length > 0) && errors.description && (
              <span id="description-error" className="text-red-500">{errors.description}</span>
            )}
          </span>
          <span>{formData.description.length}/{MAX_DESCRIPTION_LENGTH}</span>
        </div>
      </div>

      {/* Priority field */}
      <div className="space-y-2">
        <label htmlFor="task-priority" className="text-sm font-medium text-gray-700">
          Priority
        </label>
        <Select
          value={formData.priority}
          onValueChange={(value) => {
            if (validatePriority(value)) {
              handleInputChange('priority', value);
            }
          }}
          disabled={isLoading}
        >
          <SelectTrigger id="task-priority">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tags field */}
      <div className="space-y-2">
        <label htmlFor="task-tags" className="text-sm font-medium text-gray-700">
          Tags
        </label>
        <div className="space-y-2">
          {/* Tag display */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    disabled={isLoading}
                    aria-label={`Remove tag ${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          
          {/* Tag input */}
          <div className="flex gap-2">
            <Input
              id="task-tags"
              type="text"
              value={tagInput}
              onChange={(e) => handleTagInputChange(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags (press Enter or comma to add)..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim() || isLoading}
              aria-label="Add tag"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {errors.tags && (
            <p className="text-xs text-red-500">{errors.tags}</p>
          )}
        </div>
      </div>

      {/* Color picker */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Color
        </label>
        <div className="grid grid-cols-5 gap-2">
          {TASK_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleColorSelect(color)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                formData.color === color 
                  ? "border-gray-900 shadow-lg" 
                  : "border-gray-300 hover:border-gray-400"
              )}
              style={{ backgroundColor: color }}
              disabled={isLoading}
              aria-label={`Select color ${color}`}
            >
              {formData.color === color && (
                <Check className="h-4 w-4 text-white mx-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              {todo ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            todo ? 'Update Task' : 'Add Task'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;