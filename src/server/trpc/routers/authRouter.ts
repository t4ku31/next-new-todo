// src/server/trpc/authRouter.ts
import { router, publicProcedure } from "@/server/trpc";
import { z }                     from "zod";
import { hash, compare }         from "bcrypt";
import type { UserSession }      from "@/lib/session";

// 👇 Zod スキーマはそのまま
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
  // ────────────────────────────────
  // 1) ユーザー登録
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      // Prisma で重複チェック
    
      const conflict = await ctx.prisma.user.findUnique({
        where: {
          email:    input.email    
        },
      });
     
      if (conflict) {
        if (conflict.email === input.email) {
          throw new Error("このメールアドレスは既に使われています");
        }
        throw new Error("このユーザー名は既に使われています");
      }
      
      // ハッシュ化してユーザー作成
      const passwordHash = await hash(input.password, 10);
      const user = await ctx.prisma.user.create({
        data: { username: input.username, email: input.email, passwordHash },
      });

      // セッションに書き込んで保存（fetchAdapter 用の shim が Set-Cookie を回収）
      const me: UserSession = {
        id:       user.id,
        username: user.username,
        email:    user.email,
      };
      ctx.session.user = me;
      await ctx.session.save();

      // クライアントには userSession 情報だけ返す
      return me;
    }),

  // ────────────────────────────────
  // 2) ログイン
  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { email: input.email },
        select: {
          id:           true,
          username:     true,
          email:        true,
          passwordHash: true,
        },
      });
      if (!user || !(await compare(input.password, user.passwordHash))) {
        throw new Error("メールアドレスまたはパスワードが正しくありません");
      }

      // セッションへ
      const me: UserSession = {
        id:       user.id,
        username: user.username,
        email:    user.email,
      };
      ctx.session.user = me;
      await ctx.session.save();

      return me;
    }),

  // ────────────────────────────────
  // 3) 認証済みユーザー情報取得
  me: publicProcedure.query(({ ctx }) => {
    return ctx.session.user ?? null;
  }),

  // ────────────────────────────────
  // 4) ログアウト
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.session.destroy();
    return true;
  }),
});
