import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/lib/prisma';

export const userRouter = router({
  /* -------------------------------------------------- */
  /* 自分のユーザー情報                                 */
  /* -------------------------------------------------- */
  me: publicProcedure.query(({ ctx }) => {
    // 未ログインなら null を返すだけ
    return ctx.session.user ?? null;
  }),

  /* -------------------------------------------------- */
  /* ユーザー名検索（部分一致ではなく完全一致）         */
  /* -------------------------------------------------- */
  search: publicProcedure
    .input(
      z.object({
        targetUsername: z
          .string()
          .min(1, 'ユーザー名を１文字以上で指定してください'),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. ログインチェック
      const me = ctx.session.user;
      if (!me) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'ログインが必要です' });
      }

      // 2. DB 検索
      const userInfo = await prisma.user.findUnique({
        where: { username: input.targetUsername },
        select: {
          id: true,
          username: true,
          // 公開してよいカラムだけ選択
        },
      });

      // 3. 見つからない場合
      if (!userInfo) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'ユーザーが見つかりません' });
      }

      // 4. 成功
      return userInfo;
    }),
});
