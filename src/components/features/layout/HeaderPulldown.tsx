'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';

export default function HeaderPulldown() {
  const { data, isLoading, error } = trpc.user.me.useQuery();
  const username = useUserStore((s) => s.username);
  const setUsername = useUserStore((s) => s.setUsername);
  const clearUsername = useUserStore((s) => s.clearUsername);
  const logoutMutation = trpc.auth.logout.useMutation({
    async onSuccess(){
      clearUsername();
      router.push('/');
      setOpen(false);
    }
  });
  const router = useRouter();

  // メニュー開閉用 state
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // セッション取得後に Zustand にセット
  useEffect(() => {
    if (data?.username) setUsername(data.username);
  }, [data, setUsername]);

  // メニュー外クリックで close
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  if (isLoading) return <p className="text-white">読み込み中…</p>;
  if (error) return <p className="text-white">エラーが発生しました</p>;
  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          bg-blue-900 text-white font-medium 
          px-3 py-1 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-white
        "
      >
        {username} <span className="inline-block transform rotate-90">▶</span>
      </button>

      {open && (
        <ul
          className="
            absolute right-0 mt-2 w-40 
            bg-white border border-gray-200 
            rounded-md shadow-lg 
            overflow-hidden
          "
        >
          {username === 'unknown' ? (
            <li>
              <a
                href="/Login"
                className="
                  block w-full text-left px-4 py-2 
                  text-gray-700 hover:bg-gray-100
                "
                onClick={() => setOpen(false)}
              >
                Login
              </a>
            </li>
          ) : (
            <li
              onClick={handleLogout}
              className="
                px-4 py-2 text-gray-700 
                hover:bg-gray-100 cursor-pointer
              "
            >
              Logout
            </li>
          )}
        </ul>
      )}
    </div>
  );
}