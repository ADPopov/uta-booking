import { postRouter } from "~/server/api/routers/post";
import { courtRouter } from "./routers/court";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { trainerRouter } from "./routers/trainer";
import { adminRouter } from "./routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  court: courtRouter,
  trainer: trainerRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
