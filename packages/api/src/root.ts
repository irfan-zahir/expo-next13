import { createTRPCRouter } from "./trpc";

import { exampleRouter } from "./router/example";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
});

export type AppRouter = typeof appRouter;
