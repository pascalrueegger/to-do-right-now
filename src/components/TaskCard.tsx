import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Todo, Priority } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Edit, Trash2, GripVertical } from 'lucide-react';

interface TaskCardProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  className?: string;
}

const priorityConfig: Record<Priority, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  high: { variant: 'destructive', color: 'text-red-600' },
  medium: { variant: 'default', color: 'text-yellow-600' },
  low: { variant: 'secondary', color: 'text-green-600' }
};

export function TaskCard({ 
  todo, 
  onEdit, 
  onDelete, 
  showActions = false,
  isDragging = false,
  dragHandleProps,
  className 
}: TaskCardProps) {
  const priorityStyle = priorityConfig[todo.priority];
  
  return (
    <Card 
      className={cn(
        'transition-all duration-200 hover:shadow-md',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        className
      )}
      style={{ borderLeftColor: todo.color, borderLeftWidth: '4px' }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            {showActions && dragHandleProps && (
              <div 
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold truncate">
                {todo.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={priorityStyle.variant} className="text-xs">
                  {todo.priority}
                </Badge>
                <div 
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: todo.color }}
                  aria-label={`Color: ${todo.color}`}
                />
              </div>
            </div>
          </div>
          
          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(todo)}
                  className="h-8 w-8"
                  aria-label="Edit task"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(todo.id)}
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      {todo.description && (
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 leading-relaxed">
            {todo.description}
          </p>
        </CardContent>
      )}
      
      {todo.tags.length > 0 && (
        <CardContent className="pt-0 pb-4">
          <div className="flex flex-wrap gap-1">
            {todo.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs px-2 py-0.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
      
      <CardContent className="pt-0 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Status: {todo.status}</span>
          <span>
            Created: {new Date(todo.createdDate).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}