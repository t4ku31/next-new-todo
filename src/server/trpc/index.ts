import { router } from '@/server/trpc';
import { authRouter } from './routers/authRouter';
import { userRouter } from './routers/userRouter';
import { chatRouter } from './routers/chatRouter';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
});

export type AppRouter = typeof appRouter;
