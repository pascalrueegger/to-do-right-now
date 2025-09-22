import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, CheckCircle, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  type: 'no-tasks' | 'all-completed' | 'no-current-task';
  onAddTask?: () => void;
  className?: string;
}

const emptyStateConfig = {
  'no-tasks': {
    icon: ListTodo,
    title: 'No tasks yet',
    description: 'Start by adding your first task to get organized and focused.',
    actionText: 'Add your first task',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  'all-completed': {
    icon: CheckCircle,
    title: 'All tasks completed!',
    description: 'Great job! You\'ve completed all your tasks. Time to add new ones or take a well-deserved break.',
    actionText: 'Add more tasks',
    iconColor: 'text-green-500',
    bgColor: 'bg-green-50'
  },
  'no-current-task': {
    icon: ListTodo,
    title: 'No current task',
    description: 'All your tasks are either completed or none are available. Add a new task to get started.',
    actionText: 'Add a task',
    iconColor: 'text-gray-500',
    bgColor: 'bg-gray-50'
  }
};

export function EmptyState({ type, onAddTask, className }: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const Icon = config.icon;
  
  return (
    <div className={cn('flex items-center justify-center min-h-[400px] p-4', className)}>
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className={cn(
            'rounded-full p-4 mb-4',
            config.bgColor
          )}>
            <Icon className={cn('h-12 w-12', config.iconColor)} />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {config.title}
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {config.description}
          </p>
          
          {onAddTask && (
            <Button 
              onClick={onAddTask}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-4 w-4" />
              {config.actionText}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}