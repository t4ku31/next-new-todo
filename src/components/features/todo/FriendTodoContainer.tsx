// src/components/features/friend/FriendTodoContainer.tsx
'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { trpc } from '@/lib/trpcClient';
import React from 'react';

interface FriendTodoContainerProps {
  otherUserId: number;
  otherUsername: string;
}

export default function FriendTodoContainer({
  otherUserId,
  otherUsername,
}: FriendTodoContainerProps) {
  const today = new Date().toISOString().split('T')[0];

  const { data: todos = [], isLoading, error } =
    trpc.todo.getTodoByUserId.useQuery({
      userId: otherUserId,
      targetDate: today,
    });

  // 完了／未完了でソート
  const sortedTodos = [...todos].sort((a, b) =>
    a.isDone === b.isDone ? 0 : a.isDone ? 1 : -1
  );

  // 集計値
  const totalCount = sortedTodos.length;
  const completedCount = sortedTodos.filter((t) => t.isDone).length;
  const ratio = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  if (isLoading) return <p className="text-gray-600 p-4">ロード中…</p>;
  if (error) return <p className="text-red-500 p-4">エラーが発生しました</p>;

  return (
    <>
      {/* ヘッダー */}
      <header className="relative flex items-center justify-center px-4 py-2 bg-blue-600 border-b">
        <Link href={`/`}>
          <button className="absolute top-1 left-4 text-white hover:text-gray-200">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </Link>
        <h2 className="text-lg font-medium text-white">
          {otherUsername}  To-Do
        </h2>
      </header>


      {/* カード化 + ゲージ＋カウンター */}
      <div className="max-w-xl mx-auto mt-10 mb-6 bg-white rounded-2xl shadow-xl p-6">
      <p className="px-4 py-2 text-center text-lg text-gray-500">{today}</p>

        {/* ゲージ & カウンター */}
        <div className="flex items-center mb-4 space-x-3">
          <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gray-400 h-1.5 rounded-full transition-all"
              style={{ width: `${ratio}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {completedCount}/{totalCount}
          </span>
        </div>

        {/* To-Do リスト */}
        {totalCount > 0 ? (
          <ul className="space-y-2">
            {sortedTodos.map((todo) => (
              <li
                key={todo.id}
                className={`
                  flex items-center gap-2 p-2 rounded
                  ${todo.isDone ? 'bg-gray-100' : ''}
                `}
              >
                <input
                  type="checkbox"
                  checked={todo.isDone}
                  disabled
                  className="w-4 h-4"
                />
                <span
                  className={`text-sm ${todo.isDone ? 'line-through text-gray-500' : 'text-gray-800'}`}
                >
                  {todo.title}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-4">Todoがありません</p>
        )}
      </div>
    </>
  );
}
