// src/components/features/auth/RegisterContainer.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/trpcClient';

// フォーム入力のスキーマ
const registerSchema = z.object({
  username: z.string().min(3, 'ユーザー名は3文字以上です'),
  email:    z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(6, 'パスワードは6文字以上です'),
});
type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterContainer() {
  const router = useRouter();
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      router.push('/');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (input: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync(input);
    } catch (e) {
      console.error('登録エラー:', e);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded-lg">

      <h2 className="text-2xl font-semibold mb-4 text-center">新規登録</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('username')}
            type="text"
            placeholder="ユーザー名"
            className="w-full px-4 py-2 border rounded"
          />
      
          {errors.username && (
            <p className="text-red-500 text-sm">{errors.username.message}</p>
          )} 
        </div>
      
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
          登録
        </button>
      
      </form>
      
      <p className="text-center text-sm mt-4">
        すでにアカウントをお持ちの方は{' '}
        <a href="/login" className="text-blue-600 hover:underline">
          ログイン
        </a>
      </p>
    </div>
  );
}
