// src/components/layout/ChatToggle.tsx
'use client';

import { MessageCircle } from 'lucide-react';
import { useUiStore }    from '@/store/useUiStore';

export default function ChatToggle() {
  const toggle = useUiStore((s) => s.toggleFriendbar);
  return (
    <button
      onClick={toggle}
      className="p-2 text-white hover:bg-blue-500 rounded"
      aria-label="チャット開閉"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}
