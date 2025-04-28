import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';

// リスト取得・作成時に受け取るスキーマを定義
const dateInputSchema = z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });
const todoCreateSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const todoRouter = router({
    list: publicProcedure
        .input(dateInputSchema)
        .query(({ ctx, input }) => {
          return ctx.prisma.todo.findMany({
            where: {
              userId: ctx.session.user?.id,
              date:    input.date,
            },
            orderBy: { createdAt: 'desc' },
          });
        }),

    create: publicProcedure
        .input(todoCreateSchema)
        .mutation(({ ctx, input }) => {
            return ctx.prisma.todo.create({
            data: {
                title:       input.title,
                description: input.description,
                date:        input.date,
                userId:      ctx.session.user!.id,
            },
        });
    }),
    update: publicProcedure
        .input(z.object({ id: z.number(), done: z.boolean() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.todo.update({
            where: { id: input.id },
            data:  { done: input.done },
            });
        }),


    // 4. delete: タスク削除
    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(({ ctx, input }) => {
            return ctx.prisma.todo.delete({ where: { id: input.id } });
    }),
});
