// src/app/todo/page.tsx
'use client';

import CalendarSidebar from '@/components/features/calendar/CalendarSidebar';
import TodoContainer   from '@/components/features/todo/TodoContainer';

export default function TodoPage() {
  return (
    <div className="flex h-screen">
      {/* 左側：カレンダーサイドバー */}
      <CalendarSidebar />

      {/* 右側：TODO リスト */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6">TODO リスト</h1>
        <TodoContainer />
      </main>
    </div>
  );
}
