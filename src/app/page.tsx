'use client';

import { TodoProvider } from '@/context/TodoContext';
import { DoingView } from '@/components/DoingView';

export default function Home() {
  return (
    <TodoProvider>
      <main className="min-h-screen bg-background flex flex-col">
        <DoingView />
      </main>
    </TodoProvider>
  );
}
