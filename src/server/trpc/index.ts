import { router } from '@/server/trpc';
import { authRouter } from './routers/authRouter';
import { userRouter } from './routers/userRouter';
import { chatRouter } from './routers/chatRouter';
import { todoRouter } from './routers/todoRouter';
import { calendarRouter } from './routers/calendarRouter';
import { friendRouter } from './routers/friendRouter';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  chat: chatRouter,
  todo: todoRouter,
  calendar: calendarRouter,
  friend: friendRouter,
});

export type AppRouter = typeof appRouter;
