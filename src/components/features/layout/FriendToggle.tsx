'use client';

import { User } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';

export default function FriendToggle() {
  const chattoggle = useUiStore((s) => s.toggleFriendbar);
  return (
    <button
      onClick={chattoggle}
      className="p-2 text-white hover:bg-blue-500 rounded"
      aria-label="カレンダー開閉"
    >
        <User className="w-6 h-6" />
    </button>
  );
}