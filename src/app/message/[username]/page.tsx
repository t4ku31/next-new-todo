// src/app/message/[otherUserId]/page.tsx
import { redirect } from 'next/navigation';
import ChatContainer from '@/components/features/chat/ChatContainer';
import { fetchMe } from '@/lib/fetchMe'; // 後述



interface PageProps {
  params: { username: string };
}

export default async function Page({ params }: PageProps) {
  // ① セッションから自分のユーザー情報を取得
  
  const caller = await fetchMe();
  const me = await caller.user.me();
  if (!me) {
    // 未ログインならログインページへリダイレクト
    redirect('/login');
  }

  // ② 他ユーザーの情報をサーバーサイドで取得
  const otherUser     = await caller.user.search({targetUsername: params.username});
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
