// app/message/[id]/[username]/page.tsx
import Providers from '@/components/features/providers';
import ChatContainer  from '@/components/features/chat/ChatContainer';


export default async function MessagePage({ 
  params 
}: {
   params: { id: string; username: string };
}) {
  const { id, username } = params;
  return (
    <Providers>
      <p>message</p>
      <ChatContainer otherUserId={Number(id)} otherUsername={username} />
    </Providers>
  );
}
