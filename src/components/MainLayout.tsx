/**
 * MainLayout - Main application layout that combines DoingView and PlanningDrawer
 * Handles global keyboard shortcuts and application state transitions
 */

import React, { useEffect, useState } from 'react';
import { DoingView } from './DoingView';
import { PlanningDrawer } from './PlanningDrawer';
import { LoadingState } from './LoadingState';
import { InitializationStatus } from './InitializationStatus';
import { useTodos } from '@/hooks/useTodos';
import { useTodoContext } from '@/context/TodoContext';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  className?: string;
}

export function MainLayout({ className }: MainLayoutProps) {
  const { isDrawerOpen, toggleDrawer } = useTodos();
  const { 
    isInitialized, 
    isLoading, 
    initializationError, 
    initializationWarnings,
    storageError 
  } = useTodoContext();
  const [showInitStatus, setShowInitStatus] = useState(true);

  // Show loading state during initialization
  if (isLoading || !isInitialized) {
    return <LoadingState message="Initializing your workspace..." />;
  }

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-xl font-semibold text-destructive">
            Initialization Failed
          </h2>
          <p className="text-muted-foreground">
            {initializationError}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload App
          </button>
        </div>
      </div>
    );
  }

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key to close drawer
      if (event.key === 'Escape' && isDrawerOpen) {
        toggleDrawer();
        event.preventDefault();
      }
      
      // Ctrl/Cmd + P to toggle planning drawer
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        toggleDrawer();
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, toggleDrawer]);

  return (
    <div className={cn(
      'min-h-screen relative overflow-hidden',
      'flex flex-col',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
      </div>

      {/* Initialization status */}
      {showInitStatus && (initializationWarnings.length > 0 || storageError) && (
        <div className="relative z-10 p-4 animate-slide-up">
          <InitializationStatus
            errors={storageError ? [storageError.message || 'Storage error occurred'] : []}
            warnings={initializationWarnings}
            onDismiss={() => setShowInitStatus(false)}
          />
        </div>
      )}

      {/* Main content area */}
      <main className={cn(
        'relative z-10 flex-1 flex flex-col',
        'transition-all duration-300 ease-in-out',
        isDrawerOpen && 'lg:ml-0' // Ensure proper spacing on larger screens
      )}>
        <DoingView />
      </main>

      {/* Planning drawer overlay */}
      <PlanningDrawer />

      {/* Enhanced backdrop for drawer on mobile */}
      {isDrawerOpen && (
        <div 
          className={cn(
            'fixed inset-0 z-30',
            'bg-black/30 backdrop-blur-sm',
            'transition-all duration-300',
            'lg:hidden' // Only show on mobile/tablet
          )}
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
    </div>
  );
}