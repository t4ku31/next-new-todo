// app/components/HeaderToggle.tsx
'use client';

import {  MessageCircle } from 'lucide-react';
import { useUiStore } from '@/src/store/useUiStore';

export default function CalendarToggle() {
  const chattoggle = useUiStore((s) => s.toggleFriendbar);
  return (
    <button
      onClick={chattoggle}
      className="p-2 text-white hover:bg-blue-500 rounded"
      aria-label="カレンダー開閉"
    >
        <MessageCircle className="w-6 h-6" />
    </button>
  );
}