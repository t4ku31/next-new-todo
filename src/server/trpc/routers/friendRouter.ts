import { router, publicProcedure } from '@/server/trpc';
import { z }                      from 'zod';
import { TRPCError }              from '@trpc/server';

const sendRequestSchema = z.object({
    toId: z.number(),
  });
  // 承認・拒否用スキーマ
  const respondSchema = z.object({
    requestId: z.string(),
    accept:    z.boolean(),
  });

  export const friendRouter = router({
    /** 自分のフレンド一覧取得 */
    list: publicProcedure.query(({ ctx }) => {
      return ctx.prisma.friend.findMany({
        where: { userId: ctx.session.user!.id },
        include: { friend: { select: { id: true, username: true } } },
      });
    }),

    /** 自分へのリクエスト一覧取得 */
  listRequests: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.friendRequest.findMany({
      where: { toId: ctx.session.user!.id, status: 'PENDING' },
      include: { from: { select: { id: true, username: true } } },
    });
  }),

    /** フレンド申請を送信 */
    sendRequest: publicProcedure
    .input(sendRequestSchema)
    .mutation(async ({ input, ctx }) => {
      if (input.toId === ctx.session.user!.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: '自分自身には送れません' });
      }
      // 重複チェック
      const exists = await ctx.prisma.friendRequest.findFirst({
        where: { fromId: ctx.session.user!.id, toId: input.toId },
      });
      if (exists) {
        throw new TRPCError({ code: 'CONFLICT', message: '既にリクエスト済みです' });
      }
      return ctx.prisma.friendRequest.create({
        data: {
          fromId: ctx.session.user!.id,
          toId:   input.toId,
        },
      });
    }),

    respondRequest: publicProcedure
    .input(respondSchema)
    .mutation(async ({ input, ctx }) => {
      const req = await ctx.prisma.friendRequest.findUnique({
        where: { id: input.requestId },
      });
      if (!req || req.toId !== ctx.session.user!.id) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'リクエストが見つかりません' });
      }
      // ステータス更新
      await ctx.prisma.friendRequest.update({
        where: { id: input.requestId },
        data: { status: input.accept ? 'ACCEPTED' : 'REJECTED' },
      });
      if (input.accept) {
        // Friend テーブルにも登録
        await ctx.prisma.friend.create({
          data: {
            userId:   req.fromId,
            friendId: req.toId,
          },
        });
        await ctx.prisma.friend.create({
          data: {
            userId:   req.toId,
            friendId: req.fromId,
          },
        });
      }
      return { success: true };
    }),
});


