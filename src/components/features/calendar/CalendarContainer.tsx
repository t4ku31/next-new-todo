'use client';

import CalendarSidebar from './CalendarSidebar';

export default function CalendarContainer() {
  return (
    <div className="flex h-full">
      <CalendarSidebar />
      <main className="flex-1 p-4">
        {/* Calendar content will go here */}
      </main>
    </div>
  );
} 