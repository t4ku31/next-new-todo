// src/server/trpc/routers/todoRouter.ts
import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

/* -------------------- 共通ユーティリティ -------------------- */
function ensureLogin  (userId: number | undefined): asserts userId is number {
  if (userId == null) {
    throw new TRPCError({ 
      code: "UNAUTHORIZED", 
      message: "ログインしてください" 
    });
  }
};

const startOfDay = (isoDate: string) => {
  const d = new Date(isoDate);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* -------------------- Zod スキーマ -------------------- */
const dateSchema   = z.object({ date: z.string() });
const idDateSchema = z.object({ id: z.number(), date: z.string() });
const addSchema    = z.object({
  date: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
});

/* -------------------- ルーター本体 -------------------- */
export const todoRouter = router({
  /* ① 追加 -------------------------------------------------- */
  addTodo: publicProcedure
    .input(addSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const targetDate = startOfDay(input.date);

      // Todo を upsert
      const todo = await prisma.todo.upsert({
        where:  { userId_targetDate: { userId, targetDate } },
        create: { userId, targetDate },
        update: {},
      });

      // TodoItem を作成
      await prisma.todoItem.create({
        data: {
          todoId:      todo.id,
          title:       input.title,
          description: input.description,
        },
      });

      // 最新一覧を返す
      const latest = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return latest?.items ?? [];
    }),

  /* ② 指定日のタスク取得 ---------------------------------- */
  getTasksByDate: publicProcedure
    .input(dateSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const targetDate = startOfDay(input.date);
      const todo = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return todo?.items ?? [];
    }),

  /* ③ 完了フラグのトグル ---------------------------------- */
  clearTodo: publicProcedure
    .input(idDateSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const targetDate = startOfDay(input.date);

      // Todo と TodoItem を取得
      const todo = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      if (!todo) throw new TRPCError({ code: "NOT_FOUND", message: "Todo が見つかりません" });

      const item = await prisma.todoItem.findUnique({
        where: { id: input.id, todoId: todo.id },
      });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "タスクが見つかりません" });

      // isDone を反転
      await prisma.todoItem.update({
        where: { id: item.id },
        data:  { isDone: !item.isDone },
      });

      const latest = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return latest?.items ?? [];
    }),

  /* ④ タスク削除 ------------------------------------------ */
  deleteTodo: publicProcedure
    .input(idDateSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const targetDate = startOfDay(input.date);

      const todo = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      if (!todo) throw new TRPCError({ code: "NOT_FOUND", message: "Todo が見つかりません" });

      await prisma.todoItem.delete({
        where: { id: input.id, todoId: todo.id },
      });

      const latest = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return latest?.items ?? [];
    }),
});
