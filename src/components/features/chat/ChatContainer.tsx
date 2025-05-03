'use client';

import { useEffect, useState, FormEvent } from 'react';
import { trpc }                       from '@/lib/trpcClient';
import type { inferRouterOutputs }        from '@trpc/server';
import type { AppRouter }                 from '@/server/trpc/index';

import { createInnerContext }             from '@/server/context.server';

type Message = inferRouterOutputs<AppRouter>['chat']['listMessages'][number];

interface ChatContainerProps {
    otherUserId: number;
    otherUsername: string;
  }

export default async function ChatContainer({
    otherUserId,
    otherUsername,
  }: ChatContainerProps) {
    // サーバー側でのコンテキストを作成
    const ctx = await createInnerContext();
    // セッションからユーザー情報を取得
    const me = ctx.session?.user;
    if (!me) {
        throw new Error('ログインしてください');
    }
    const utils = trpc.useUtils();

    const getRoom = trpc.chat.getOrCreateRoom.useMutation({
        onSuccess(room) {
          setRoomId(room.id);
        },
      });
      const [roomId, setRoomId] = useState<string>('');

      useEffect(() => {
        if (otherUserId) {
          getRoom.mutate({ withUserId: otherUserId });
        }
      }, [otherUserId]);

      const { data: messages = [], isLoading } = trpc.chat.listMessages.useQuery(
        { roomId },
        { enabled: !!roomId }
      );

      trpc.chat.onMessage.useSubscription(
        { roomId },
        {
          enabled: !!roomId,
          onData(newMsg) {
            utils.chat.listMessages.setData({ roomId }, (prev: Message[] | undefined) => [
              ...(prev ?? []),
              newMsg as Message,
            ]);
          },
        }
      );

       // 4) 送信ミューテーション（成功後リスト再フェッチ）
    const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      utils.chat.listMessages.invalidate({ roomId });
    },
  });

  const [content, setContent] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!roomId || !text) return;
    await sendMessage.mutateAsync({ roomId, content: text });
    setContent('');
  };

  if (isLoading) {
    return <p className="p-4 text-center text-gray-600">Loading chat…</p>;
  }

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
        
        <header className="px-4 py-2 bg-gray-100 border-b">
            <h2 className="text-lg font-medium">{otherUsername}</h2>
      </header>

      {/* メッセージ一覧 */}
      <ul className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m: Message) => {
          const isMe = m.sender.id === me.id;
          return (
            <li
              key={m.id}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  isMe
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-200 text-gray-800 rounded-bl-none'
                }`}
              >
                {m.content}
              </div>
            </li>
          );
        })}
      </ul>

      {/* 入力フォーム */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-2 bg-white border-t flex items-center gap-2"
      >
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="メッセージを入力…"
          className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
        >
          送信
        </button>
      </form>
    </div>
  );
}





