import {router} from '@/server/trpc';
import { todoRouter } from '@/server/trpc/routers/todoRouter';
import { authRouter } from '@/server/trpc/routers/authRouter';
import { calendarRouter } from '@/server/trpc/routers/calendarRouter';
export const appRouter = router({
    todo:todoRouter,
    auth:authRouter,
    calendar:   calendarRouter, 
});

export type AppRouter = typeof appRouter;
