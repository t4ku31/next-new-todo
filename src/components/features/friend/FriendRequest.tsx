// src/components/features/friend/FriendRequest.tsx
'use client';

import { trpc } from '@/lib/trpc';

export default function FriendRequest() {
  const utils = trpc.useUtils();

  // 受信中のリクエスト一覧を取得
  const { data: requests = [], isLoading, error } =
    trpc.friend.listRequests.useQuery();

  // 承認／拒否ミューテーション
  const respond = trpc.friend.respondRequest.useMutation({
    onSuccess: () => {
      utils.friend.listRequests.invalidate();
      utils.friend.list.invalidate();
    },
  });

  if (isLoading) return <p className="text-gray-600">ロード中…</p>;
  if (error)     return <p className="text-red-500">エラーが発生しました</p>;

  return (
    <section className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Friend Requests</h2>
      {requests.length > 0 ? (
        <ul className="space-y-2">
          {requests.map((r: { id: string; username: string }) => (
            <li
              key={r.id}
              className="flex items-center justify-between bg-white p-3 rounded shadow-sm"
            >
              <span className="font-medium">{r.username} さんから</span>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    respond.mutate({ requestId: r.id, accept: true })
                  }
                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    respond.mutate({ requestId: r.id, accept: false })
                  }
                  className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">保留中のリクエストはありません。</p>
      )}
    </section>
}
