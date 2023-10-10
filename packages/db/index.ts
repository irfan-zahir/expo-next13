import { PrismaClient } from "@prisma/client";

export type * from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query"],
});
