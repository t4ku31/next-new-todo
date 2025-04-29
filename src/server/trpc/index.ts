import {router} from '@/server/trpc';
import { todoRouter } from '@/server/trpc/routers/todoRouter';
import { authRouter } from '@/server/trpc/routers/authRouter';
import { calendarRouter } from '@/server/trpc/routers/calendarRouter';
import { friendRouter } from '@/server/trpc/routers/friendRouter';

export const appRouter = router({
    todo:todoRouter,
    auth:authRouter,
    calendar:   calendarRouter, 
    friend:     friendRouter,
});

export type AppRouter = typeof appRouter;
