// src/app/message/[otherUserId]/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChatContainer from '@/components/features/chat/ChatContainer';
import { fetchMe } from '@/lib/fetchMe'; // 後述
import { useEffect, useState } from 'react';

interface PageProps {
  params: { otherUserId: string };
}

export default async function Page({ params }: PageProps) {
  // ① セッションから自分のユーザー情報を取得
  const me = await fetchMe(cookies());
  if (!me) {
    // 未ログインならログインページへリダイレクト
    redirect('/login');
  }

  // ② 他ユーザーの情報をサーバーサイドで取得
  const otherUserId   = Number(params.otherUserId);
  const otherUser     = await fetch(`/api/user/${otherUserId}`).then(res => res.json());
  if (!otherUser) {
    return <p>ユーザーが見つかりません</p>;
  }

  // ③ クライアントへ必要な props を渡してレンダリング
  return (
    <ChatContainer
      otherUserId={otherUser.id}
      otherUsername={otherUser.username}
    />
  );
}
