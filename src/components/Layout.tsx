import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn(
      'min-h-screen bg-background',
      'flex flex-col',
      'w-full max-w-7xl mx-auto',
      'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  );
}

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn(
      'flex-1',
      'flex flex-col',
      'py-4 sm:py-6 lg:py-8',
      className
    )}>
      {children}
    </main>
  );
}

interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const containerSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full'
};

export function Container({ children, size = 'full', className }: ContainerProps) {
  return (
    <div className={cn(
      'w-full mx-auto',
      containerSizes[size],
      className
    )}>
      {children}
    </div>
  );
}

interface GridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
};

const gridGaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
};

export function Grid({ children, cols = 1, gap = 'md', className }: GridProps) {
  return (
    <div className={cn(
      'grid',
      gridCols[cols],
      gridGaps[gap],
      className
    )}>
      {children}
    </div>
  );
}

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const flexDirections = {
  row: 'flex-row',
  col: 'flex-col'
};

const alignItems = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch'
};

const justifyContent = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around'
};

const flexGaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
};

export function Flex({ 
  children, 
  direction = 'row', 
  align = 'start', 
  justify = 'start',
  wrap = false,
  gap = 'md',
  className 
}: FlexProps) {
  return (
    <div className={cn(
      'flex',
      flexDirections[direction],
      alignItems[align],
      justifyContent[justify],
      wrap && 'flex-wrap',
      flexGaps[gap],
      className
    )}>
      {children}
    </div>
  );
}