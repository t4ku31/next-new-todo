'use client';

import { useEffect, useState, FormEvent } from 'react';
import { trpc }                       from '@/lib/trpcClient';
import type { inferRouterOutputs }        from '@trpc/server';
import type { AppRouter }                 from '@/server/trpc/index';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
type Message = inferRouterOutputs<AppRouter>['chat']['listMessages'][number];

interface ChatContainerProps {
    otherUserId: number;
    otherUsername: string;
  }

export default function ChatContainer({
    otherUserId,
    otherUsername,
  }: ChatContainerProps) {

    const utils = trpc.useUtils();
    // 1) ルームIDを管理するためのステート
    const [roomId, setRoomId] = useState<string>('');

    // 2) ルームを作成するミューテーション
    const getRoom = trpc.chat.getOrCreateRoom.useMutation({
      onSuccess(room) {
        setRoomId(room.id);
      },
    });

    // 3) ユーザーが選択されたらルームを作成
    useEffect(() => {
      if (otherUserId) {
        getRoom.mutate({ withUserId: otherUserId });
      }
    }, [otherUserId]);

    // 4) メッセージを取得するクエリ
    const { data: messages = [], isLoading:isLoadingMessages } = trpc.chat.listMessages.useQuery(
        { roomId },
        { enabled: !!roomId }
    
    );  

    // 5) 新しいメッセージをリアルタイムで取得するサブスクリプション
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

    // 6) ログインユーザーの情報を取得するクエリ
    const { data: me, isLoading:isLoadingMe } = trpc.user.me.useQuery();
   
    // 7) 送信ミューテーション（成功後リスト再フェッチ）
    const sendMessage = trpc.chat.sendMessage.useMutation({
      onSuccess: () => {
      utils.chat.listMessages.invalidate({ roomId });
      },
    });

  // 8) メッセージを入力するためのステート
  const [content, setContent] = useState('');

  // 9) メッセージを送信するためのフォームのハンドラー
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = content.trim();
    if (!roomId || !text) return;
    await sendMessage.mutateAsync({ roomId, content: text });
    setContent('');
  };


  if (isLoadingMessages) {
    return <p className="p-4 text-center text-gray-600">Loading chat…</p>;
  }

  if (isLoadingMe) {
    return <p className="p-4 text-center text-gray-600">Loading chat…</p>;
  }
  

  return (
    <div className="relative flex flex-col h-screen border rounded-lg overflow-hidden">
    <header className="relative flex items-center justify-center px-4 py-2 bg-gray-100 border-b">
      <Link href={`/`}>
        <button className="absolute left-4 text-gray-600 hover:text-gray-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </Link>
      <h2 className="text-lg font-medium">{otherUsername}</h2>
    </header>

      {/* メッセージ一覧 */}
      <ul className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
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
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-2 bg-white border-t px-4 py-2"
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





