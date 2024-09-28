import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";

const messageResolver: IResolvers = {
  Query: {
    conversations: async (_, __, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      return prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      });
    },
    conversation: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 30,
          },
        },
      });

      if (!conversation) throw new UserInputError("Conversation not found");

      // Check if the user is a participant in this conversation
      const isParticipant = conversation.participants.some(
        (p) => p.userId === user.id
      );
      if (!isParticipant)
        throw new AuthenticationError(
          "Not authorized to view this conversation"
        );

      return conversation;
    },
    messages: async (_, { conversationId }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      console.log(conversationId);
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });

      if (!conversation) throw new UserInputError("Conversation not found");

      const isParticipant = conversation.participants.some(
        (p) => p.userId === user.id
      );
      if (!isParticipant)
        throw new AuthenticationError(
          "Not authorized to view messages in this conversation"
        );

      return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      });
    },
  },
  Mutation: {
    createConversation: async (
      _,
      { participantIds },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      // Ensure the current user is included in the participants
      if (!participantIds.includes(user.id)) {
        participantIds.push(user.id);
      }

      // Remove duplicates
      const uniqueParticipantIds = [...new Set(participantIds)];
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: uniqueParticipantIds as string[] },
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (existingConversation) {
        return existingConversation; // Return the existing conversation
      }

      const conversation = await prisma.conversation.create({
        data: {
          participants: {
            create: uniqueParticipantIds.map((id) => ({
              userId: id as string,
            })),
          },
        },
        include: {
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return conversation;
    },
    sendMessage: async (
      _,
      { conversationId, content },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { participants: true },
      });

      if (!conversation) throw new UserInputError("Conversation not found");

      const isParticipant = conversation.participants.some(
        (p) => p.userId === user.id
      );
      if (!isParticipant)
        throw new AuthenticationError(
          "Not authorized to send messages in this conversation"
        );

      const message = await prisma.message.create({
        data: {
          content,
          senderId: user.id,
          conversationId,
        },
        include: { sender: true, conversation: true },
      });

      pubsub.publish(`NEW_MESSAGE_${conversationId}`, { newMessage: message });

      return message;
    },
  },
  Subscription: {
    newMessage: {
      subscribe: (_, { conversationId }, { user }: Context) => {
        if (!user) throw new AuthenticationError("Not authenticated");
        return pubsub.asyncIterator(`NEW_MESSAGE_${conversationId}`);
      },
    },
  },
  Conversation: {
    lastMessage: async (parent, _, { prisma }: Context) => {
      const messages = await prisma.message.findMany({
        where: { conversationId: parent.id },
        orderBy: { createdAt: "desc" },
        take: 1,
      });
      return messages[0] || null;
    },
  },
};

export default messageResolver;
