/**
 * DoingView - Main focused view for displaying and working on the current task
 * Shows current task details or appropriate empty state
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, Tag, Calendar, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodos } from '@/hooks/useTodos';
import { EmptyState } from './EmptyState';
import { PRIORITY_LABELS } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';

interface DoingViewProps {
  className?: string;
}

export function DoingView({ className }: DoingViewProps) {
  const { 
    currentTodo, 
    incompleteTodos, 
    completedTodos, 
    todos,
    completeTodo, 
    toggleDrawer 
  } = useTodos();

  // Handle task completion
  const handleCompleteTask = () => {
    if (currentTodo) {
      completeTodo(currentTodo.id);
    }
  };

  // Determine which empty state to show
  const getEmptyStateType = () => {
    if (todos.length === 0) {
      return 'no-tasks';
    }
    if (incompleteTodos.length === 0 && completedTodos.length > 0) {
      return 'all-completed';
    }
    return 'no-current-task';
  };

  // Show empty state if no current task
  if (!currentTodo) {
    return (
      <div className={cn('flex-1 flex items-center justify-center', className)}>
        <EmptyState 
          type={getEmptyStateType()}
          onAddTask={toggleDrawer}
        />
      </div>
    );
  }

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className={cn('flex-1 flex items-center justify-center p-4', className)}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2 break-words">
                {currentTodo.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Priority Badge */}
                <Badge 
                  variant={getPriorityVariant(currentTodo.priority)}
                  className="flex items-center gap-1"
                >
                  {PRIORITY_LABELS[currentTodo.priority]} Priority
                </Badge>
                
                {/* Created Date */}
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {formatRelativeDate(currentTodo.createdDate)}
                </div>
              </div>
            </div>
            
            {/* Color Indicator */}
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: currentTodo.color }}
              title="Task color"
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Description */}
          {currentTodo.description && (
            <div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {currentTodo.description}
              </p>
            </div>
          )}
          
          {/* Tags */}
          {currentTodo.tags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {currentTodo.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Complete Task Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleCompleteTask}
              size="lg"
              className="w-full flex items-center gap-2 text-base"
            >
              <CheckCircle className="h-5 w-5" />
              Mark Complete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}