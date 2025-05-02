// src/components/features/search/SearchContainer.tsx
'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpcNext';

const inputSchema = z.object({
  targetUsername: z
    .string()
    .min(1, 'ユーザー名を1文字以上指定してください'),
});
type FormData = z.infer<typeof inputSchema>;

export default function SearchContainer() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(inputSchema),
  });

  const [foundUser, setFoundUser] = useState<{ id: number; username: string } | null>(null);
  const [reqSent, setReqSent] = useState(false);

  // userRouter の search を呼び出す
  const searchMutation = trpc.user.search.useMutation({
    onSuccess: (data) => {
      setFoundUser(data);
      setReqSent(false);
    },
    onError: () => {
      setFoundUser(null);
    },
  });

  // friendRouter の sendRequest を呼び出す
  const requestMutation = trpc.friend.sendRequest.useMutation({
    onSuccess: () => setReqSent(true),
  });

  const onSubmit: SubmitHandler<FormData> = ({ targetUsername }) => {
    setFoundUser(null);
    setReqSent(false);
    searchMutation.mutate({ targetUsername });
  };

  return (
    <div className="max-w-sm mx-auto mt-8 p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
        <input
          {...register('targetUsername')}
          placeholder="ユーザー名を入力"
          className="flex-1 px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
        >
          検索
        </button>
      </form>

      {errors.targetUsername && (
        <p className="text-red-500 mb-2">{errors.targetUsername.message}</p>
      )}
      {searchMutation.error && (
        <p className="text-red-500 mb-2">{searchMutation.error.message}</p>
      )}

      {foundUser && (
        <div className="p-4 border rounded flex items-center justify-between">
          <span className="font-medium">{foundUser.username}</span>
          {reqSent ? (
            <button disabled className="px-3 py-1 bg-gray-300 text-white rounded">
              送信済み
            </button>
          ) : (
            <button
              onClick={() => requestMutation.mutate({ toId: foundUser.id })}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              申請
            </button>
          )}
        </div>
      )}
    </div>
  );
}
