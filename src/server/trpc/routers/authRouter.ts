import { router, publicProcedure } from '@/server/trpc';
import { z } from 'zod';
import { hash, compare } from 'bcrypt';
import type { UserSession } from '@/lib/session';
import { sessionOptions } from '@/lib/session';
import { getIronSession } from 'iron-session';
import type { IronSession } from 'iron-session';

// 登録用スキーマ
const registerSchema = z.object({
  username: z.string().min(3),
  email:    z.string().email(),
  password: z.string().min(6),
});
// ログイン用スキーマ
const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

export const authRouter = router({
  // ユーザー登録
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (existing) {
        throw new Error('このメールアドレスは既に使われています');
      }
      const passwordHash = await hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: {
          username:     input.username,
          email:        input.email,
          passwordHash,
        },
      });
      // セッションに保存
      const session = await getIronSession(
        ctx.req,
        ctx.res,
        sessionOptions
      ) as IronSession<UserSession> & { user?: UserSession };
      const userSession: UserSession = { id: user.id, username: user.username, email: user.email };
      session.user = userSession;
      await session.save();
      return { id: user.id, username: user.username, email: user.email };
    }),

  // ログイン
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
      });
      if (!user || !(await compare(input.password, user.passwordHash))) {
        throw new Error('メールアドレスまたはパスワードが正しくありません');
      }
      // セッションに保存
      const session = await getIronSession(
        ctx.req,
        ctx.res,
        sessionOptions
      ) as IronSession<UserSession> & { user?: UserSession };
      const userSession: UserSession = { id: user.id, username: user.username, email: user.email };
      session.user = userSession;
      await session.save();
      return { id: user.id, username: user.username, email: user.email };
    }),

  // 現在ログイン中のユーザー取得
  me: publicProcedure.query(({ ctx }) => {
    return ctx.session.user ?? null;
  }),

  // ログアウト
  logout: publicProcedure.mutation(async ({ ctx }) => {
    const session = await getIronSession(
      ctx.req,
      ctx.res,
      sessionOptions
    );
    session.destroy();
    return true;
  }),
});
