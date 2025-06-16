import { Priority, TaskStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const taskRouter = createTRPCRouter({
  getAllTasks: protectedProcedure
    .input(z.object({ projectId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      try {
        const { projectId } = input;
        const tasks = await ctx.db.task.findMany({
          where: {
            ...(projectId && { projectId: projectId }),
            OR: [
              {
                creatorId: ctx.session.user.id,
              },
              {
                assigneeId: ctx.session.user.id,
              },
              {
                project: {
                  members: {
                    some: {
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            ],
          },
          include: {
            assignee: true,
            creator: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        return new TRPCError({
          message: "Something went wrong!",
          code: "INTERNAL_SERVER_ERROR",
          cause: error,
        });
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        projectId: z.string(),
        assigneeId: z.string().optional(),
        priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
        dueDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if user is a member or creator of the project
      const project = await ctx.db.project.findFirst({
        where: {
          id: input.projectId,
          OR: [{ creatorId: userId }, { members: { some: { userId } } }],
        },
        include: { members: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this project.",
        });
      }

      // If assigneeId is provided, check they're also a member
      if (
        input.assigneeId &&
        ![project.creatorId, ...project.members.map((m) => m.userId)].includes(
          input.assigneeId,
        )
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Assignee must be a member of the project.",
        });
      }

      return ctx.db.task.create({
        data: {
          ...input,
          creatorId: userId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.nativeEnum(TaskStatus).optional(),
        priority: z.nativeEnum(Priority).optional(),
        assigneeId: z.string().optional(),
        dueDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const task = await ctx.db.task.findUnique({
        where: { id },
        include: {
          project: {
            select: {
              creatorId: true,
              members: true,
            },
          }, // to get project.creatorId
        },
      });

      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found.",
        });
      }

      const sessionUserId = ctx.session.user.id;
      const isCreator = task.creatorId === sessionUserId;
      const isAssignee = task.assigneeId === sessionUserId;
      const isProjectCreator = task.project.creatorId === sessionUserId;

      if (!isCreator && !isAssignee && !isProjectCreator) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this task.",
        });
      }
      if (input.assigneeId) {
        const validAssigneeIds = [
          task.project.creatorId,
          ...task.project.members.map((m) => m.userId),
        ];

        if (!validAssigneeIds.includes(input.assigneeId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Assignee must be a member or the creator of the project.",
          });
        }
      }

      return ctx.db.task.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const task = await ctx.db.task.findUnique({
          where: { id: input.id, creatorId: ctx.session.user.id },
          select: { creatorId: true },
        });

        if (!task) {
          return new TRPCError({
            code: "BAD_REQUEST",
            message: "Task not found!",
          });
        }

        if (task.creatorId !== ctx.session.user.id) {
          return new TRPCError({
            code: "BAD_REQUEST",
            message: "You are not allowed to delete this task!",
          });
        }
      } catch (error) {
        return new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong!",
          cause: error,
        });
      }
    }),
});
