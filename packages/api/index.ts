import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { type AppRouter, appRouter } from "./src/root";

export { createTRPCRouter, createTRPCContext } from "./src/trpc";

export { AppRouter, appRouter };
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
