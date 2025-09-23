/**
 * PlanningDrawer - Side drawer for managing todo list and planning tasks
 * Slides in from left side with backdrop, handles keyboard shortcuts
 */

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Plus, List, AlertCircle, Download, Upload, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodos } from '@/hooks/useTodos';
import { useTodoContext } from '@/context/TodoContext';
import { TaskList } from './TaskList';
import { exportTodosData, downloadDataAsFile, importDataFromFile } from '@/lib/dataExport';
import { resetApp } from '@/lib/appInitialization';

interface PlanningDrawerProps {
  className?: string;
}

export function PlanningDrawer({ className }: PlanningDrawerProps) {
  const { 
    todos, 
    isDrawerOpen, 
    toggleDrawer 
  } = useTodos();
  const { state, dispatch } = useTodoContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Note: Escape key handling is built into the Radix Drawer component
  // No custom keyboard handler needed as it's handled by the drawer's onOpenChange

  // Determine if button should be highlighted (when no todos exist)
  const shouldHighlightButton = todos.length === 0;

  // Export data functionality
  const handleExport = async () => {
    try {
      setIsExporting(true);
      const storageData = {
        version: 1,
        todos: todos.map(todo => ({
          ...todo,
          createdDate: todo.createdDate.toISOString()
        })),
        settings: {
          lastOpenedDrawer: state.isDrawerOpen
        }
      };
      
      downloadDataAsFile(storageData);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Import data functionality
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const importedData = await importDataFromFile(file);
      
      // Convert imported todos back to Todo objects
      const importedTodos = importedData.todos.map(todo => ({
        ...todo,
        createdDate: new Date(todo.createdDate)
      }));

      // Load imported todos
      dispatch({ type: 'LOAD_TODOS', payload: importedTodos });
      
      alert(`Successfully imported ${importedTodos.length} tasks!`);
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Reset app functionality
  const handleReset = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the app? This will delete all your tasks and cannot be undone. Consider exporting your data first.'
    );
    
    if (confirmed) {
      try {
        await resetApp();
        window.location.reload();
      } catch (error) {
        console.error('Reset failed:', error);
        alert('Failed to reset the app. Please try refreshing the page.');
      }
    }
  };

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

          <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-6">
            <TaskList />
            
            {/* Settings and Actions Section */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Settings & Data</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              {showSettings && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      disabled={isExporting || todos.length === 0}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-3 w-3" />
                      {isExporting ? 'Exporting...' : 'Export'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleImport}
                      disabled={isImporting}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-3 w-3" />
                      {isImporting ? 'Importing...' : 'Import'}
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleReset}
                    className="w-full flex items-center gap-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    Reset App
                  </Button>

                  <p className="text-xs text-muted-foreground">
                    Export your data before resetting. Import will replace all current tasks.
                  </p>
                </div>
              )}
            </div>

            {/* Hidden file input for import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}