import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { DecodedIdToken } from "firebase-admin/lib/auth/token-verifier";
import { adminAuth } from "../configs/firebase";
import { prisma } from "@acme/db";

interface User extends DecodedIdToken {
  phone_number: string;
}

interface CreateContextOptions {
  user: User | null;
  prisma: typeof prisma;
}

const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    prisma: opts.prisma,
  };
};

export const createTRPCContext = async (_opts: { req: Request }) => {
  const source = _opts.req.headers.get("x-trpc-source") ?? "unknown";
  console.warn(">>> tRPC Request from", source);

  const authorization = _opts.req.headers.get("authorization");
  if (authorization) {
    const token = authorization.split(" ")[1];
    if (!!token && token !== "undefined") {
      const { phone_number, ...decodedIdToken } = await adminAuth.verifyIdToken(
        token
      );
      if (phone_number) {
        return createInnerTRPCContext({
          user: { phone_number, ...decodedIdToken },
          prisma,
        });
      }
    }
  }

  return createInnerTRPCContext({ user: null, prisma });
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx: { user, prisma, ...ctx }, next }) => {
  if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
  const db = prisma.$extends({
    query: {
      // This extends will help to automate database record audit
      $allOperations: async ({ model, args, operation, query }) => {
        if (operation === "create") {
          args.data = { createdBy: user?.uid, ...args.data };
        }

        if (operation === "update") {
          args.data = { modBy: user?.uid, ...args.data };
        }

        if (operation === "findMany") {
          args.orderBy = { name: "asc" };
        }

        if (operation.includes("find")) {
          args.where = { ...args.where, recordStatus: "ACTIVE" };
        }

        return query(args);
      },
    },
  });
  return next({ ctx: { prisma: db, user, ...ctx } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
