'use client';

import { trpc } from '@/lib/trpcClient';
import { Mail,ListChecks } from 'lucide-react';
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
          {friends.map((f: any) => (
            <li
              key={f.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
            >
            <span className="font-medium">{f.friend.username}</span>
            <div className="flex items-center gap-2 ml-auto">
            
            <button className="flex items-center justify-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
              <ListChecks className="w-4 h-4" />
            </button>
            
            <Link href={`/message/${f.friend.username}`}>
              <button className="flex items-center justify-center px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">
                <Mail className="w-4 h-4" />
              </button>
            </Link>
            
            </div>
          </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">まだフレンドがいません。</p>
      )}
    </section>
    );
}