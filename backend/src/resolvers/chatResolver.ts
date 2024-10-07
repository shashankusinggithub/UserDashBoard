import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";

const chatResolver: IResolvers = {
  Query: {
    getDirectMessages: async (
      _,
      { otherUserId },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const messages = await prisma.chatMessage.findMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: user.id },
          ],
        },
        orderBy: { createdAt: "asc" },
      });

      return messages;
    },
  },
  Mutation: {
    sendDirectMessage: async (
      _,
      { receiverId, content },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });
      if (!receiver) throw new UserInputError("Receiver not found");

      const message = await prisma.chatMessage.create({
        data: {
          senderId: user.id,
          receiverId,
          content,
        },
      });

      pubsub.publish(`NEW_DIRECT_MESSAGE_${receiverId}`, {
        newDirectMessage: message,
      });

      return message;
    },
  },
  Subscription: {
    newDirectMessage: {
      subscribe: (_, { userId }, { user }: Context) => {
        if (!user) throw new AuthenticationError("Not authenticated");
        return pubsub.asyncIterator(`NEW_DIRECT_MESSAGE_${userId}`);
      },
    },
  },
};

export default chatResolver;
