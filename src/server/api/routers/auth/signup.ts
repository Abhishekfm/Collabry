import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { hash } from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const signupRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { name, email, password } = input;
        const hashedPassword = await hash(password, 10);
        const existingUser = await ctx.db.user.findUnique({
          where: {
            email: email,
          },
        });
        console.log("existing user", existingUser);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists",
          });
        }
        const user = await ctx.db.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        });
        console.log("user", user);
        return user;
      } catch (error) {
        console.dir("error listed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error as string,
        });
      }
    }),
});
