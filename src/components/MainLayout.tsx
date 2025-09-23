/**
 * MainLayout - Main application layout that combines DoingView and PlanningDrawer
 * Handles global keyboard shortcuts and application state transitions
 */

import React, { useEffect } from 'react';
import { DoingView } from './DoingView';
import { PlanningDrawer } from './PlanningDrawer';
import { useTodos } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  className?: string;
}

export function MainLayout({ className }: MainLayoutProps) {
  const { isDrawerOpen, toggleDrawer } = useTodos();

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
      'min-h-screen bg-background',
      'flex flex-col relative',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      {/* Main content area */}
      <main className={cn(
        'flex-1 flex flex-col',
        'transition-all duration-300 ease-in-out',
        isDrawerOpen && 'lg:ml-0' // Ensure proper spacing on larger screens
      )}>
        <DoingView />
      </main>

      {/* Planning drawer overlay */}
      <PlanningDrawer />

      {/* Backdrop for drawer on mobile */}
      {isDrawerOpen && (
        <div 
          className={cn(
            'fixed inset-0 bg-black/20 z-30',
            'transition-opacity duration-300',
            'lg:hidden' // Only show on mobile/tablet
          )}
          onClick={toggleDrawer}
          aria-hidden="true"
        />
      )}
    </div>
  );
}