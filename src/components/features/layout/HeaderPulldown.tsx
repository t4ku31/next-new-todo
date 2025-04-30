'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';

export default function HeaderPulldown() {
  const utils = trpc.useUtils();
  // ① userRouter.me を呼び出してユーザー情報を取得
  const { data: user, isLoading, error } = trpc.user.me.useQuery();

  // ② ログアウト
  const router = useRouter();
  const logoutMutation = trpc.auth.logout.useMutation({
    async onSuccess() {
      await utils.user.me.invalidate(); 
      router.push('/');
      setOpen(false);
    },
  });

  // ③ ドロップダウン開閉用
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ④ クリック外で閉じる
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // ⑤ ローディング／エラー処理
  if (isLoading) return <p className="text-white">読み込み中…</p>;
  if (error)     return <p className="text-white">エラーが発生しました</p>;

  // ⑥ ユーザー名取得（未ログイン時は 'unknown'）
  const username = user?.username ?? 'unknown';

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {user ? (
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
      ):(
        <button
        onClick={() => router.push('/login')}
        className="
          bg-blue-900 text-white font-medium 
          px-3 py-1 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-white
        ">
          Login
        </button>
      )}

      {open && (
        <ul
          className="
            absolute right-0 mt-2 w-40 
            bg-white border border-gray-200 
            rounded-md shadow-lg 
            overflow-hidden
          "
        >
            <li
              onClick={() => logoutMutation.mutateAsync()}
              className="
                px-4 py-2 text-gray-700 
                hover:bg-gray-100 cursor-pointer
              "
            >
             <button
                  onClick={() => logoutMutation.mutateAsync()}
                  disabled={logoutMutation.status === 'pending'}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Logout
                </button>
            </li>
        
        </ul>
      )}
    </div>
  );
}
