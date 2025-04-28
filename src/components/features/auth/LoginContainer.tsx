// src/components/features/auth/LoginContainer.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpc';
import { useUserStore } from '@/store/useUserStore';

// フォーム入力のスキーマ
const loginSchema = z.object({
  email:    z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上です'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginContainer() {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      if (data) {
        setUser({ id: data.id, username: data.username });
        router.push('/');
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (input: LoginFormData) => {
    try {
      await loginMutation.mutateAsync(input);
    } catch (e) {
      console.error('ログインエラー:', e);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">ログイン</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('email')}
            type="email"
            placeholder="メールアドレス"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <input
            {...register('password')}
            type="password"
            placeholder="パスワード"
            className="w-full px-4 py-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          ログイン
        </button>
      </form>
      <p className="text-center text-sm mt-4">
        アカウントがない方は{' '}
        <a href="/register" className="text-blue-600 hover:underline">
          登録ページ
        </a>
      </p>
    </div>
  );
}
