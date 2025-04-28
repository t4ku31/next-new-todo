// src/server/trpc/routers/calendarRouter.ts
import { router, publicProcedure } from '@/server/trpc';
import { z }                      from 'zod';
import { prisma }                 from '@/lib/prisma';

export const calendarRouter = router({
  getTasksInRange: publicProcedure
    .input(
      z.object({
        start: z.string(), // 例: "2025-04-01"
        end:   z.string(), // 例: "2025-04-30"
      })
    )
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user!.id;
      const start  = new Date(input.start);
      const end    = new Date(input.end);
      const todos  = await prisma.todo.findMany({
        where: {
          userId,
          targetDate: { gte: start, lte: end },
        },
        include: { items: true },
      });
      return todos.map((t: { targetDate: Date; items: any[] }) => ({
        date:  t.targetDate.toISOString().slice(0, 10),
        items: t.items,
      }));
    }),
});
