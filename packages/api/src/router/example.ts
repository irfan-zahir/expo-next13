import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure.input(z.string()).query(({ input }) => {
    return `Hello ${input}, from TRPC server`;
  }),
  private: protectedProcedure.query(
    async ({
      ctx: {
        prisma,
        user: { uid },
      },
    }) => {
      return prisma.user.findFirst({
        where: { uid },
      });
    }
  ),
});
