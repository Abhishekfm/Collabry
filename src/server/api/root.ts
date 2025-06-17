import { postRouter } from "~/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { signupRouter } from "./routers/auth/signup";
import { taskRouter } from "./routers/project/task";
import { projectRouter } from "./routers/project";
import { userRouter } from "./routers/auth/profile";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: signupRouter,
  post: postRouter,
  project: projectRouter,
  projectTasks: taskRouter,
  userRouter: userRouter,
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
