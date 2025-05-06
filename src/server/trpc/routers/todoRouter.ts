import { router, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/prisma";

/**
 * ユーザーがログインしていることを保証
 */
function ensureLogin(userId: number | undefined): asserts userId is number {
  if (userId == null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "ログインしてください",
    });
  }
}

/**
 * 日付文字列(YYYY-MM-DD)からその日の00:00:00 UTC Date を返す
 */
function parseTargetDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

// 入力スキーマ定義
const dateSchema = z.object({ date: z.string() });
const idDateSchema = z.object({ id: z.number(), date: z.string() });
const idDateIsDoneSchema = z.object({ id: z.number(), date: z.string(), isDone: z.boolean() });
const addSchema = z.object({ title: z.string().min(1, { message: "タスク名を入力してください" }), description: z.string().optional(), date: z.string() });
const updateSchema = z.object({ id: z.number(), todoId: z.number(), title: z.string() });

// ルーター定義
export const todoRouter = router({
  // タスク追加
  addTodo: publicProcedure
    .input(addSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const targetDate = parseTargetDate(input.date);

      // Todo テーブルに upsert
      const todo = await prisma.todo.upsert({
        where: { userId_targetDate: { userId, targetDate } },
        create: { userId, targetDate },
        update: {},
      });

      // TodoItem 作成
      await prisma.todoItem.create({
        data: { todoId: todo.id, title: input.title, description: input.description },
      });

      // 最新アイテム一覧を返却
      const result = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return result?.items ?? [];
    }),

  // 指定日のタスク一覧取得
  getTasksByDate: publicProcedure
    .input(dateSchema)
    .query(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);
      const targetDate = parseTargetDate(input.date);

      const result = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return result?.items ?? [];
    }),

  // 完了フラグのトグル
  clearTodo: publicProcedure
    .input(idDateIsDoneSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);
      const targetDate = parseTargetDate(input.date);

      const todo = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
      });
      if (!todo) throw new TRPCError({ code: "NOT_FOUND", message: "Todo が見つかりません" });

      // フラグ反転
      await prisma.todoItem.update({ where: { id: input.id }, data: { isDone: !input.isDone } });

      const result = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return result?.items ?? [];
    }),

  // タスク削除
  deleteTodo: publicProcedure
    .input(idDateSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);
      const targetDate = parseTargetDate(input.date);

      const todo = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
      });
      if (!todo) throw new TRPCError({ code: "NOT_FOUND", message: "Todo が見つかりません" });

      await prisma.todoItem.delete({ where: { id: input.id, todoId: todo.id } });

      const result = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return result?.items ?? [];
    }),

  // ユーザーID指定で取得（フレンド閲覧用）
  getTodoByUserId: publicProcedure
    .input(z.object({ userId: z.number(), targetDate: z.string() }))
    .query(async ({ input, ctx }) => {
      ensureLogin(ctx.session.user?.id);
      const targetDate = parseTargetDate(input.targetDate);
      const result = await prisma.todo.findUnique({
        where: { userId_targetDate: { userId: input.userId, targetDate } },
        include: { items: true },
      });
      return result?.items ?? [];
    }),

  // タスクタイトル更新
  updateTodo: publicProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      ensureLogin(ctx.session.user?.id);
      await prisma.todoItem.update({
        where: { id: input.id, todoId: input.todoId },
        data: { title: input.title },
      });
      return true;
    }),
});
