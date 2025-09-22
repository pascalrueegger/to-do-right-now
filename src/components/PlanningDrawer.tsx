/**
 * PlanningDrawer - Side drawer for managing todo list and planning tasks
 * Slides in from left side with backdrop, handles keyboard shortcuts
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, List, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodos } from '@/hooks/useTodos';

interface PlanningDrawerProps {
  className?: string;
}

export function PlanningDrawer({ className }: PlanningDrawerProps) {
  const { 
    todos, 
    isDrawerOpen, 
    toggleDrawer 
  } = useTodos();

  // Note: Escape key handling is built into the Radix Drawer component
  // No custom keyboard handler needed as it's handled by the drawer's onOpenChange

  // Determine if button should be highlighted (when no todos exist)
  const shouldHighlightButton = todos.length === 0;

  return (
    <div className={cn('', className)}>
      <Drawer open={isDrawerOpen} onOpenChange={toggleDrawer}>
        <DrawerTrigger asChild>
          <Button
            variant={shouldHighlightButton ? "default" : "outline"}
            size="lg"
            className={cn(
              'fixed top-4 left-4 z-40',
              'flex items-center gap-2',
              'shadow-lg',
              'transition-all duration-200',
              shouldHighlightButton && [
                'bg-primary text-primary-foreground',
                'hover:bg-primary/90',
                'animate-pulse',
                'ring-2 ring-primary/20'
              ]
            )}
            aria-label={shouldHighlightButton ? "Add your first task" : "Open planning view"}
          >
            {shouldHighlightButton ? (
              <>
                <Plus className="h-4 w-4" />
                Add Task
                <AlertCircle className="h-3 w-3 ml-1" />
              </>
            ) : (
              <>
                <List className="h-4 w-4" />
                Plan
              </>
            )}
          </Button>
        </DrawerTrigger>

        <DrawerContent className="h-full w-3/4 max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-2">
              <List className="h-5 w-5" />
              Planning
            </DrawerTitle>
            <DrawerDescription>
              Manage your tasks and organize your workflow
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-0">
            {/* Placeholder content - will be implemented in future tasks */}
            <div className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Task management interface will be implemented in upcoming tasks
                </p>
                <p className="text-xs mt-2">
                  This includes task list, add form, and sorting controls
                </p>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}