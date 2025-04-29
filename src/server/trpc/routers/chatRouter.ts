import { router, publicProcedure } from '@/server/trpc';
import { z }                      from 'zod';
import { TRPCError }              from '@trpc/server';
import { pub }                         from '@/lib/redis';
import { EventEmitter } from 'events';
import { prisma } from '@/lib/prisma';
import { observable } from '@trpc/server/observable';

export const ee = new EventEmitter();

export const chatRouter = router({
  getOrCreateRoom: publicProcedure
    .input(z.object({ withUserId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const me = ctx.session.user;
      if (!me) throw new TRPCError({ code: 'UNAUTHORIZED' });

      // --- 自分自身とのチャットを防止 ---
      if (input.withUserId === me.id) {
        throw new TRPCError({
          code:    'BAD_REQUEST',
          message: '自分とはチャットできません',
        });
      }

      const { withUserId } = input;
      let room = await prisma.chatRoom.findFirst({
        where: {
          OR: [
            { user1Id: me.id, user2Id: withUserId },
            { user1Id: withUserId, user2Id: me.id },
          ],
        },
      });

      if (!room) {
        room = await prisma.chatRoom.create({
          data: { user1Id: me.id, user2Id: withUserId },
        });
      }
      return room;
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const me = ctx.session.user;
      if (!me) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const msg = await prisma.chatMessage.create({
        data: {
          roomId: input.roomId,
          senderId: me.id,
          content: input.content,
        },
      });

      ee.emit(`msg:${input.roomId}`, msg);
      await pub.publish(
        `msg:${input.roomId}`,
        JSON.stringify(msg)
      );

      return msg;
    }),

  onMessage: publicProcedure
    .input(
      z.object({
        roomId: z.string(),
      })
    )
    .subscription(({ input }) => {
      return observable<any>((emit) => {
        const handler = (msg: any) => emit.next(msg);
        ee.on(`msg:${input.roomId}`, handler);
        return () => {
          ee.off(`msg:${input.roomId}`, handler);
        };
      });
    }),

  listMessages: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ input, ctx }) => {
      const me = ctx.session.user;
      if (!me) throw new TRPCError({ code: 'UNAUTHORIZED' });

      return await prisma.chatMessage.findMany({
        where: { roomId: input.roomId },
        include: { sender: true },
        orderBy: { createdAt: 'asc' },
      });
    }),
});
            
            
            
          