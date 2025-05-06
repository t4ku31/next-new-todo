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
const updateSchema = z.object({ id: z.number(), title: z.string() ,todoId:z.number()});
const idDateIsDoneSchema = z.object({ id: z.number(), date: z.string(), isDone: z.boolean() });
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

      const [year, month, day] = input.date.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day));
     
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

      const [year, month, day] = input.date.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day));

      const todo = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      return todo?.items ?? [];
    }),

  /* ③ 完了フラグのトグル ---------------------------------- */
  clearTodo: publicProcedure
    .input(idDateIsDoneSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);

      const [year, month, day] = input.date.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day));

      // Todo と TodoItem を取得
      const todo = await prisma.todo.findUnique({
        where:   { userId_targetDate: { userId, targetDate } },
        include: { items: true },
      });
      if (!todo) throw new TRPCError({ code: "NOT_FOUND", message: "Todo が見つかりません" });

      // isDone を反転
      await prisma.todoItem.update({
        where: { id: input.id },
        data:  { isDone: !input.isDone },
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

      const [year, month, day] = input.date.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day));

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

    getTodoByUserId:publicProcedure
    .input(z.object({
      userId:z.number(),
      targetDate:z.string(),
    }))
    .query(async({input,ctx})=>{
      const userId = ctx.session.user?.id;
      ensureLogin(userId);
      console.log("getTodoByUserId", input);
      const [year, month, day] = input.targetDate.split('-').map(Number);
      const targetDate = new Date(Date.UTC(year, month - 1, day));

      const todos = await prisma.todo.findUnique({
        where:{
          userId_targetDate:{
            userId:input.userId,
            targetDate:targetDate,
          },
        },
        include:{
          items:true,
        },
      });
      return todos?.items ?? [];
    }),

  updateTodo: publicProcedure
    .input(updateSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user?.id;
      ensureLogin(userId);
      console.log("updateTodo=====", input);
      await prisma.todoItem.update({
        where: { id: input.id, todoId: input.todoId },
        data: { title: input.title },
      });

      return true;
    }),
});
