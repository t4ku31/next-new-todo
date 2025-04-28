import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

export const todoRouter = router({
  list: publicProcedure
    .query(({ ctx }) => {
      return ctx.prisma.todo.findMany({
        where: { userId: ctx.session.user?.id },
        orderBy: { createdAt: 'desc' },
      });
    }),
  create: publicProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: {
          title: input.title,
          userId: ctx.session.user!.id,
        },
      });
    }),
  update: publicProcedure
    .input(z.object({ id: z.number(), done: z.boolean() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.update({
        where: { id: input.id },
        data: { done: input.done },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.todo.delete({ where: { id: input.id } });
    }),
});
