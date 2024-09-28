import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError } from "apollo-server-express";
import { Context } from "../context";

const commentResolver: IResolvers = {
  Mutation: {
    createComment: async (
      parent,
      { postId, content },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const comment = await prisma.comment.create({
        data: {
          content,
          author: { connect: { id: user.id } },
          post: { connect: { id: postId } },
        },
        include: { author: true, post: true },
      });

      return comment;
    },
  },
  Comment: {
    author: (parent, _, { prisma }: Context) => {
      return prisma.user.findUnique({ where: { id: parent.authorId } });
    },
    post: (parent, _, { prisma }: Context) => {
      return prisma.post.findUnique({ where: { id: parent.postId } });
    },
  },
};

export default commentResolver;
