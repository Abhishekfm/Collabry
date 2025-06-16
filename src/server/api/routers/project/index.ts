import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const projectRouter = createTRPCRouter({
  // ─── Project CRUD ──────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          ...input,
          creatorId: ctx.session.user.id,
          members: {
            create: {
              userId: ctx.session.user.id,
              role: "OWNER",
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { creatorId: true },
      });

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not allowed." });
      }

      return ctx.db.project.update({
        where: { id: input.id },
        data: { name: input.name, description: input.description },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { creatorId: true },
      });

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not allowed." });
      }

      return ctx.db.project.delete({ where: { id: input.id } });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        members: {
          some: {
            userId: ctx.session.user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });
  }),

  // ─── Member Management ─────────────────────────────────────────
  getMembers: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          members: {
            some: { userId: ctx.session.user.id },
          },
        },
        include: { members: { include: { user: true } } },
      });

      if (!project) throw new TRPCError({ code: "NOT_FOUND" });
      return project.members;
    }),

  addMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        //   role: z.enum(["MEMBER", "MANAGER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { creatorId: true },
      });

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not allowed." });
      }

      const alreadyMember = await ctx.db.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });

      if (alreadyMember) {
        throw new TRPCError({ code: "CONFLICT", message: "Already a member." });
      }

      return ctx.db.projectMember.create({
        data: {
          projectId: input.projectId,
          userId: input.userId,
          //   role: input.role,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
        select: { creatorId: true },
      });

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const hasTasks = await ctx.db.task.findFirst({
        where: {
          projectId: input.projectId,
          OR: [{ creatorId: input.userId }, { assigneeId: input.userId }],
        },
      });

      if (hasTasks) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot remove a member with assigned or created tasks.",
        });
      }

      return ctx.db.projectMember.delete({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: input.userId,
          },
        },
      });
    }),

  //   updateMemberRole: protectedProcedure
  //     .input(z.object({
  //       projectId: z.string(),
  //       userId: z.string(),
  //       role: z.enum(["MEMBER", "MANAGER"]),
  //     }))
  //     .mutation(async ({ ctx, input }) => {
  //       const project = await ctx.db.project.findUnique({
  //         where: { id: input.projectId },
  //         select: { creatorId: true },
  //       });

  //       if (!project || project.creatorId !== ctx.session.user.id) {
  //         throw new TRPCError({ code: "UNAUTHORIZED" });
  //       }

  //       return ctx.db.projectMember.update({
  //         where: {
  //           projectId_userId: {
  //             projectId: input.projectId,
  //             userId: input.userId,
  //           },
  //         },
  //         data: { role: input.role },
  //       });
  //     }),
});
