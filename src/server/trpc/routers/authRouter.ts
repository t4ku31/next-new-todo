// src/server/trpc/authRouter.ts
import { router, publicProcedure } from "@/server/trpc";
import { z }                     from "zod";
import { hash, compare }         from "bcrypt";
import { TRPCError }             from "@trpc/server";
import type { UserSession }      from "@/lib/session";

// Zod スキーマ
const registerSchema = z.object({
  username: z.string().min(3),
  email:    z.string().email(),
  password: z.string().min(6),
});
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

export const authRouter = router({
  // ユーザー登録
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // 重複チェック
      const conflict = await ctx.prisma.user.findUnique({ where: { email: input.email } });
      if (conflict) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'このメールアドレスは既に使われています',
        });
      }

      // パスワードハッシュ化 & ユーザー作成
      const passwordHash = await hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: { username: input.username, email: input.email, passwordHash },
      });

      // セッション保存
      const me: UserSession = { id: user.id, username: user.username, email: user.email };
      ctx.session.user = me;
      await ctx.session.save();

      return me;
    }),

  // ログイン
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        select: { id: true, username: true, email: true, passwordHash: true },
      });
      if (!user || !(await compare(input.password, user.passwordHash))) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'メールアドレスまたはパスワードが正しくありません',
        });
      }

      // セッションへ
      const me: UserSession = { id: user.id, username: user.username, email: user.email };
      ctx.session.user = me;
      await ctx.session.save();

      return me;
    }),

  // 認証済みユーザー情報取得
  me: publicProcedure.query(({ ctx }) => ctx.session.user ?? null),

  // ログアウト
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.session.destroy();
    return true;
  }),
});
