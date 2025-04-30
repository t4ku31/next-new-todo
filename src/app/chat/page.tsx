// app/message/[id]/[username]/page.tsx
import Providers from '@/components/features/providers';
import ChatContainer  from '@/components/features/chat/ChatContainer';

type PageProps = {
  params: { id: string; username: string };
};

export default async function MessagePage({ params }: PageProps) {
  const { id, username } = params;
  return (
    <Providers>
      <p>message</p>
      <ChatContainer otherUserId={Number(id)} otherUsername={username} />
    </Providers>
  );
}
