import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  // Get logged-in user profile information
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // Exclude password for security
        // Include related data if needed
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        projects: {
          select: {
            id: true,
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            role: true,
          },
        },
        createdProjects: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Update user profile information
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").optional(),
        bio: z
          .string()
          .max(500, "Bio must be less than 500 characters")
          .optional(),
        image: z.string().url("Invalid image URL").optional(),
        email: z.string().email("Invalid email format").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Filter out undefined values
      const updateData = Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      );

      if (Object.keys(updateData).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid fields provided for update",
        });
      }

      // Check if email is being updated and if it's already taken
      if (updateData.email) {
        const existingUser = await ctx.db.user.findUnique({
          where: {
            email: updateData.email,
          },
          select: {
            id: true,
          },
        });

        // If email exists and belongs to a different user
        if (existingUser && existingUser.id !== ctx.session.user.id) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email is already in use by another account",
          });
        }
      }

      try {
        const updatedUser = await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
            image: true,
            updatedAt: true,
          },
        });

        return {
          success: true,
          message: "Profile updated successfully",
          user: updatedUser,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Change password
  changePassword: protectedProcedure
    .input(
      z
        .object({
          currentPassword: z.string().min(1, "Current password is required"),
          newPassword: z
            .string()
            .min(8, "New password must be at least 8 characters"),
          //   .regex(
          //     /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          //     "New password must contain at least one uppercase letter, one lowercase letter, and one number"
          //   ),
          confirmNewPassword: z
            .string()
            .min(1, "Please confirm your new password"),
        })
        .refine(
          (data: { newPassword: string; confirmNewPassword: string }) =>
            data.newPassword === data.confirmNewPassword,
          {
            message: "New passwords don't match",
            path: ["confirmNewPassword"],
          },
        ),
    )
    .mutation(async ({ ctx, input }) => {
      const { currentPassword, newPassword } = input;

      // Get user with password
      const user = await ctx.db.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          id: true,
          password: true,
          accounts: true,
        },

        //include account provider
      });

      if (!user?.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change the password",
        });
      }

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user?.password,
      );

      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        });
      }

      // Check if new password is different from current
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New password must be different from current password",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      try {
        // Update password
        await ctx.db.user.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            password: hashedNewPassword,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Password changed successfully",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to change password",
        });
      }
    }),
});

// Export type definitions for client-side usage
export type UserRouter = typeof userRouter;
