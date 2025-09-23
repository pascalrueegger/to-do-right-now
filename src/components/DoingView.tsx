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
    <div className={cn('flex-1 flex items-center justify-center p-6', className)}>
      <div className="w-full max-w-2xl">
        <Card className="modern-card border-0">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-8 rounded-full shadow-sm flex-shrink-0"
                    style={{ backgroundColor: currentTodo.color }}
                    title="Task color"
                  />
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent break-words leading-tight">
                    {currentTodo.title}
                  </h1>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  {/* Priority Badge */}
                  <Badge 
                    variant={getPriorityVariant(currentTodo.priority)}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      currentTodo.priority === 'high' && "bg-red-400",
                      currentTodo.priority === 'medium' && "bg-yellow-400", 
                      currentTodo.priority === 'low' && "bg-green-400"
                    )} />
                    {PRIORITY_LABELS[currentTodo.priority]} Priority
                  </Badge>
                  
                  {/* Created Date */}
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatRelativeDate(currentTodo.createdDate)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Description */}
            {currentTodo.description && (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
                  {currentTodo.description}
                </p>
              </div>
            )}
            
            {/* Tags */}
            {currentTodo.tags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentTodo.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-sm px-3 py-1 rounded-full bg-white hover:bg-gray-50 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Complete Task Button */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={handleCompleteTask}
                size="lg"
                className="w-full flex items-center gap-3 text-base py-4 rounded-xl gradient-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle className="h-5 w-5" />
                Mark Complete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}