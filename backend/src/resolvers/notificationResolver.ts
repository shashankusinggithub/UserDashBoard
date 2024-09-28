import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError } from "apollo-server-express";
import { PubSub } from "graphql-subscriptions";
import { Context } from "../context";

const pubsub = new PubSub();

const notificationResolvers: IResolvers<any, Context> = {
  Query: {
    notifications: async (parent, args, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("User not authenticated");
      }
      return prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    },
  },

  Mutation: {
    markNotificationAsRead: async (
      parent,
      { notificationId },
      { prisma, user }
    ) => {
      if (!user) {
        throw new AuthenticationError("User not authenticated");
      }
      const notification = await prisma.notification.update({
        where: { id: notificationId, userId: user.id },
        data: { read: true },
      });
      return prisma.notification.findUnique({
        where: { id: notificationId },
        include: { user: true },
      });
    },
  },
  Subscription: {
    newNotification: {
      subscribe: (parent, args, { prisma, user }) => {
        if (!user) {
          throw new AuthenticationError("User not authenticated");
        }
        return pubsub.asyncIterator(`NEW_NOTIFICATION_${user.id}`);
      },
    },
  },
};

export default notificationResolvers;
