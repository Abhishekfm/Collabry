import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  type Prisma,
  Project,
  ProjectRole,
  type Task,
  TaskStatus,
} from "@prisma/client";
type ProjectWithTasks = Prisma.ProjectGetPayload<{
  include: { tasks: true };
}>;

export const projectRouter = createTRPCRouter({
  // ─── Project CRUD ──────────────────────────────────────────────
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        members: z.array(z.string().email()).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, description, members, color } = input;
      const creatorId = ctx.session.user.id;

      // Step 1: Create the Project
      const project = await ctx.db.project.create({
        data: {
          name,
          description,
          creatorId,
          color,
        },
      });

      if (members && members?.length > 0) {
        // Step 2: Get users for the given emails
        const users = await ctx.db.user.findMany({
          where: {
            email: {
              in: members,
            },
          },
        });

        console.log("user", users, members);

        // Step 3: Filter out creator from members (optional but usually useful)
        const membersToAdd = users.filter((user) => user.id !== creatorId);

        // Step 4: Add members to the project
        if (membersToAdd.length > 0) {
          await ctx.db.projectMember.createMany({
            data: membersToAdd.map((user) => ({
              projectId: project.id,
              userId: user.id,
              role: ProjectRole.MEMBER, // default
              userEmail: user.email,
            })),
            skipDuplicates: true, // in case you re-add the same user
          });
        }
      }

      return project;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        members: z.array(z.string().email()).optional(),
        color: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, description, members, color } = input;

      // Step 1: Check if user has permission to update this project
      const project = await ctx.db.project.findUnique({
        where: { id },
        select: { creatorId: true },
      });

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not allowed." });
      }

      // Step 2: Update the project basic details
      const updatedProject = await ctx.db.project.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(color && { color }),
        },
      });

      // Step 3: Handle members update if provided
      if (members !== undefined) {
        // Remove all existing members first (except creator)
        await ctx.db.projectMember.deleteMany({
          where: {
            projectId: id,
            userId: {
              not: ctx.session.user.id, // Don't remove creator
            },
          },
        });

        // Add new members if any (members could be empty array to remove all)
        if (members.length > 0) {
          // Get users for the given emails
          const users = await ctx.db.user.findMany({
            where: {
              email: {
                in: members,
              },
            },
          });

          console.log("users found for update:", users, members);

          // Filter out creator from members (optional but usually useful)
          const membersToAdd = users.filter(
            (user) => user.id !== ctx.session.user.id,
          );

          // Add new members to the project
          if (membersToAdd.length > 0) {
            await ctx.db.projectMember.createMany({
              data: membersToAdd.map((user) => ({
                projectId: id,
                userId: user.id,
                role: ProjectRole.MEMBER, // default role
                userEmail: user.email,
              })),
              skipDuplicates: true,
            });
          }
        }
        // If members is empty array [], we just removed all members above and don't add any back
      }

      return updatedProject;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        select: { creatorId: true },
      });

      console.log("delete api called");

      if (!project || project.creatorId !== ctx.session.user.id) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Not allowed." });
      }

      return ctx.db.project.delete({ where: { id: input.id } });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const projects = await ctx.db.project.findMany({
      where: {
        OR: [
          {
            members: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
          { creatorId: ctx.session.user.id },
        ],
      },
      include: {
        tasks: true, // fetch tasks to count TODO/COMPLETED manually
        members: true,
        creator: true,
        // _count: {
        //     select: {
        //       tasks: true, // total task count
        //     },
        //   },
      },
    });
    const enrichedProjects = projects.map(({ tasks, ...project }) => {
      const notCompletedTask = tasks.filter(
        (t: Task) => t.status !== TaskStatus.DONE,
      ).length;
      const completedTask = tasks.filter(
        (t: Task) => t.status === TaskStatus.DONE,
      ).length;

      return {
        ...project,
        totalTask: tasks?.length,
        notCompletedTask,
        completedTask,
        isCreator: project.creatorId === userId,
      };
    });
    // const todoCount = project.reduce(
    //   (acc, p) => acc + p.tasks.filter((t) => t.status === "TODO").length,
    //   0,
    // );
    // const completedCount = project.reduce(
    //   (acc, p) => acc + p.tasks.filter((t) => t.status === "DONE").length,
    //   0,
    // );

    return enrichedProjects;
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid("Invalid project ID"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const project = await ctx.db.project.findFirst({
        where: {
          id: input.id,
          OR: [
            {
              members: {
                some: {
                  userId: ctx.session.user.id,
                },
              },
            },
            { creatorId: ctx.session.user.id },
          ],
        },
        include: {
          tasks: {
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              creator: true,
            },
          }, // fetch tasks to count TODO/COMPLETED manually
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or you don't have access to it",
        });
      }

      const { tasks, ...projectWithoutTasks } = project;

      const notCompletedTask = tasks.filter(
        (t: Task) => t.status !== TaskStatus.DONE,
      ).length;
      const completedTask = tasks.filter(
        (t: Task) => t.status === TaskStatus.DONE,
      ).length;

      return {
        ...projectWithoutTasks,
        tasks,
        totalTask: tasks?.length,
        notCompletedTask,
        completedTask,
        isCreator: project.creatorId === userId,
      };
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
        email: z.string(),
        //   role: z.enum(["MEMBER", "MANAGER"]).default("MEMBER"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

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
            userId: user.id,
          },
        },
      });

      if (alreadyMember) {
        throw new TRPCError({ code: "CONFLICT", message: "Already a member." });
      }

      return ctx.db.projectMember.create({
        data: {
          projectId: input.projectId,
          userId: user.id,
          //   role: input.role,
        },
      });
    }),

  removeMember: protectedProcedure
    .input(z.object({ projectId: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
      }

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
          OR: [{ creatorId: user.id }, { assigneeId: user.id }],
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
            userId: user.id,
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
