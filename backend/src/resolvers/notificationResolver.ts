import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError } from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";

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
    markNotificationAsRead: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const notification = await prisma.notification.update({
        where: { id, userId: user.id },
        data: { read: true },
      });

      return notification;
    },

    testNotification: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const notification = {
        id: "test-id",
        content: "This is a test notification",
        createdAt: new Date().toISOString(),
        read: false,
        linkId: "null",
      };
      await pubsub.publish(`NEW_NOTIFICATION_${user.id}`, {
        newNotification: notification,
      });
      console.log(`Test notification sent to user ${user.id}`);
      return true;
    },
  },
  Subscription: {
    newNotification: {
      subscribe: (parent, args, { user }) => {
        if (!user) {
          throw new AuthenticationError("User not authenticated");
        }
        console.log(`User ${user.id} subscribed to notifications`);
        return pubsub.asyncIterator(`NEW_NOTIFICATION_${user.id}`);
      },
      resolve: (payload) => {
        return payload.newNotification;
      },
    },
  },
};

export default notificationResolvers;
