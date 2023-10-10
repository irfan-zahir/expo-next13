import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@runchit/api";
export const api = createTRPCReact<AppRouter>();
export { type RouterInputs, type RouterOutputs } from "@runchit/api";