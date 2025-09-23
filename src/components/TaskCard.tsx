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
  dragHandleProps?: Record<string, unknown>;
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
        'modern-card group relative overflow-hidden',
        'transition-all duration-200 hover:shadow-medium',
        isDragging && 'opacity-50 rotate-2 shadow-strong scale-105',
        todo.status === 'completed' && 'opacity-75',
        className
      )}
    >
      {/* Color accent bar */}
      <div
        className="absolute left-0 top-0 w-1 h-full"
        style={{ backgroundColor: todo.color }}
      />

      <CardHeader className="pb-3 pl-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {showActions && dragHandleProps && (
              <div
                {...dragHandleProps}
                className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Drag to reorder"
              >
                <GripVertical className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <div className="flex-1 min-w-0 space-y-2">
              <CardTitle className={cn(
                "text-lg font-semibold leading-tight",
                todo.status === 'completed' && "line-through text-gray-500"
              )}>
                {todo.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={priorityStyle.variant}
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                    todo.status === 'completed' && "opacity-60"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    todo.priority === 'high' && "bg-red-400",
                    todo.priority === 'medium' && "bg-yellow-400",
                    todo.priority === 'low' && "bg-green-400"
                  )} />
                  {todo.priority}
                </Badge>
                <div
                  className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: todo.color }}
                  aria-label={`Color: ${todo.color}`}
                />
              </div>
            </div>
          </div>

          {showActions && (onEdit || onDelete) && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(todo)}
                  className="h-8 w-8 hover:bg-gray-100 rounded-lg"
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
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
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
        <CardContent className="pt-0 pl-6">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className={cn(
              "text-sm leading-relaxed",
              todo.status === 'completed' ? "text-gray-500" : "text-gray-700"
            )}>
              {todo.description}
            </p>
          </div>
        </CardContent>
      )}

      {todo.tags.length > 0 && (
        <CardContent className="pt-3 pb-4 pl-6">
          <div className="flex flex-wrap gap-1.5">
            {todo.tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full bg-white",
                  todo.status === 'completed' && "opacity-60"
                )}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0 pb-4 pl-6">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="capitalize">{todo.status}</span>
          <span>
            {new Date(todo.createdDate).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}