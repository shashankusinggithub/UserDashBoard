import { IResolvers } from "@graphql-tools/utils";
import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";

const messageResolver: IResolvers = {
  Query: {
    conversations: async (_: any, __: any, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to view conversations"
        );
      }

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
            include: {
              sender: true,
            },
          },
        },
      });
    },

    conversation: async (
      _: any,
      { id }: { id: string },
      { prisma, user }: Context
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to view a conversation"
        );
      }

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
            include: {
              sender: true,
            },
          },
        },
      });

      if (!conversation) {
        throw new Error("Conversation not found");
      }

      const isParticipant = conversation.participants.some(
        (p) => p.user.id === user.id
      );
      if (!isParticipant) {
        throw new AuthenticationError(
          "You do not have permission to view this conversation"
        );
      }

      return conversation;
    },
    messages: async (_, { conversationId }, { prisma, user }: Context) => {
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
          "Not authorized to view messages in this conversation"
        );

      return prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: { sender: true },
      });
    },
  },
  Conversation: {
    lastMessage: (parent: any) => {
      return parent.messages[0] || null;
    },
  },
  Mutation: {
    createConversation: async (
      _,
      { participantIds },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const uniqueParticipantIds = [...new Set([...participantIds, user.id])];

      // Check for existing conversation with the same participants
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          participants: {
            every: {
              userId: { in: uniqueParticipantIds },
            },
          },
        },
        include: { participants: true },
      });

      if (existingConversation) return existingConversation;
      console.log("Creating new conversation", uniqueParticipantIds);
      // Create new conversation if it doesn't exist
      return prisma.conversation.create({
        data: {
          participants: {
            create: uniqueParticipantIds.map((id) => ({ userId: id })),
          },
        },
        include: {
          participants: { include: { user: true } },
        },
      });
    },

    sendMessage: async (
      _,
      { conversationId, content },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      try {
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
            sender: { connect: { id: user.id } },
            conversation: { connect: { id: conversationId } },
          },
          include: {
            sender: true,
            conversation: {
              include: {
                participants: {
                  include: { user: true },
                },
              },
            },
          },
        });

        console.log("Message created:", message); // Log the created message

        pubsub.publish(`NEW_MESSAGE_${conversationId}`, {
          newMessage: message,
        });
        console.log("Message published to pubsub"); // Log pubsub publication

        return message;
      } catch (error) {
        console.error("Error in sendMessage mutation:", error);
        throw new ApolloError("Failed to send message", "MESSAGE_SEND_FAILED");
      }
    },
  },

  Subscription: {
    newMessage: {
      subscribe: (_, { conversationId }, { user }: Context) => {
        if (!user) throw new AuthenticationError("Not authenticated");
        console.log(
          `User ${user.id} subscribed to NEW_MESSAGE_${conversationId}`
        ); // Log subscription
        return pubsub.asyncIterator(`NEW_MESSAGE_${conversationId}`);
      },
    },
  },
};

export default messageResolver;
