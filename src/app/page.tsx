'use client';

import { TodoProvider } from '@/context/TodoContext';
import { MainLayout } from '@/components/MainLayout';

export default function Home() {
  return (
    <TodoProvider>
      <MainLayout />
    </TodoProvider>
  );
}
