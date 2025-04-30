// app/components/HeaderToggle.tsx
'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

export default function CalendarToggle() {
  const toggle = useUiStore((s) => s.toggleSidebar);
  return (
    <button
      onClick={toggle}
      className="p-2 text-white hover:bg-blue-500 rounded"
      aria-label="カレンダー開閉"
    >
      <CalendarIcon className="w-6 h-6" />
    </button>
  );
}