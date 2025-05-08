// app/search/page.tsx
import FriendTodoContainer from '@/components/features/todo/FriendTodoContainer';
import Providers from '@/components/features/providers';
import { fetchMe } from '@/lib/fetchMe';

export default async function Page({
  params,
}: {
  params: { username: string };
}) {
  const caller = await fetchMe();

  const otherUser = await caller.user.search({
    targetUsername: params.username,
  });

  if (!otherUser) {
    return <p>ユーザーが見つかりません</p>;
  }

  return (
    <Providers>
      <FriendTodoContainer
        otherUserId={otherUser.id}
        otherUsername={otherUser.username}
      />
    </Providers>
  );
}
