'use client';

import { TodoProvider } from '@/context/TodoContext';
import { DoingView } from '@/components/DoingView';
import { PlanningDrawer } from '@/components/PlanningDrawer';

export default function Home() {
  return (
    <TodoProvider>
      <main className="min-h-screen bg-background flex flex-col relative">
        <DoingView />
        <PlanningDrawer />
      </main>
    </TodoProvider>
  );
}
