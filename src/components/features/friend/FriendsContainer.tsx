'use client';

import { trpc } from '@/lib/trpcNext';
import Link from 'next/link';

export default function FriendsContainer() {

    const { data: friends = [], isLoading, error } =
    trpc.friend.list.useQuery();

    if (isLoading) return <p className="text-gray-600">ロード中…</p>;
    if (error)     return <p className="text-red-500">エラーが発生しました</p>;

    return (
        <section className="bg-gray-100 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Friends</h2>
      {friends.length > 0 ? (
        <ul className="space-y-2">
          {friends.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
            >
              <span className="font-medium">{f.friend.username}</span>
              <Link href={`/message/${f.friend.username}`}>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
                  Message
                </button>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">まだフレンドがいません。</p>
      )}
    </section>
    );
}