import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { prisma } from "@/server/db";
import { TRPCError } from "@trpc/server";

const createPostSchema = z.object({
  name: z.string().min(1, "Name must not be empty"),
});

export const postsRouter = router({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const posts = await prisma.post.findMany({
        where: {
          userId: ctx.auth.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      });

      return posts;
    } catch (error) {
      console.error("Failed to get posts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get posts",
        cause: error,
      });
    }
  }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await prisma.post.create({
          data: {
            name: input.name,
            userId: ctx.auth.userId,
          },
        });

        return post;
      } catch (error) {
        console.error("Failed to create post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post",
          cause: error,
        });
      }
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: input.id },
        });

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        if (post.userId !== ctx.auth.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to update this post",
          });
        }

        const updatedPost = await prisma.post.update({
          where: { id: input.id },
          data: { name: input.name },
        });

        return updatedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Failed to update post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update post",
          cause: error,
        });
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const post = await prisma.post.findUnique({
          where: { id: input.id },
        });

        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        if (post.userId !== ctx.auth.userId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized to delete this post",
          });
        }

        const deletedPost = await prisma.post.delete({
          where: { id: input.id },
        });

        return deletedPost;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        console.error("Failed to delete post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete post",
          cause: error,
        });
      }
    }),
}); 