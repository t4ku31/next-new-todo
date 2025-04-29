// src/components/layout/HeaderPulldown.tsx
'use client';

import Link               from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useUserStore }   from '@/store/useUserStore';
import { useRouter }      from 'next/navigation';
import { trpc }           from '@/lib/trpc';

export default function HeaderPulldown() {
  const { data, isLoading, error } = trpc.auth.me.useQuery();
  const user = useUserStore((s) => s.user);
  const setUser   = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) setUser(data);
  }, [data, setUser]);

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', outside);
    return () => document.removeEventListener('mousedown', outside);
  }, []);

  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      clearUser();
      router.push('/');
      setOpen(false);
    },
  });

  if (isLoading) return <p className="text-white">読み込み中…</p>;
  if (error)     return <p className="text-white">エラーが発生しました</p>;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-blue-900 text-white font-medium px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        {user?.username ?? 'unknown'} <span className="inline-block rotate-90">▶</span>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
          {user == null ? (
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
            </li>
          ) : (
            <li
              onClick={() => logout.mutate()}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              Logout
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
