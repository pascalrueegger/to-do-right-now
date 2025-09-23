'use client';

import { TodoProvider } from '@/context/TodoContext';
import { MainLayout } from '@/components/MainLayout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <TodoProvider>
        <MainLayout />
      </TodoProvider>
    </ErrorBoundary>
  );
}
