import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";

const friendRequestResolver: IResolvers = {
  Query: {
    friendRequests: async (_, __, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return prisma.friendRequest.findMany({
        where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
        include: { sender: true, receiver: true },
      });
    },
  },
  Mutation: {
    sendFriendRequest: async (_, { receiverId }, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to send a friend request"
        );
      }

      if (user.id === receiverId) {
        throw new UserInputError(
          "You cannot send a friend request to yourself"
        );
      }

      const receiver = await prisma.user.findUnique({
        where: { id: receiverId },
      });
      if (!receiver) {
        throw new UserInputError("Receiver not found");
      }

      // Check if they are already friends
      const areFriends = await prisma.user.findFirst({
        where: {
          id: user.id,
          friends: {
            some: {
              id: receiverId,
            },
          },
        },
      });

      if (areFriends) {
        throw new UserInputError("You are already friends with this user");
      }

      // Check for existing friend requests
      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId },
            { senderId: receiverId, receiverId: user.id },
          ],
        },
      });

      if (existingRequest) {
        throw new UserInputError(
          "A friend request already exists between these users"
        );
      }

      // Create the friend request
      const friendRequest = await prisma.friendRequest.create({
        data: {
          sender: { connect: { id: user.id } },
          receiver: { connect: { id: receiverId } },
        },
        include: {
          sender: true,
          receiver: true,
        },
      });

      // Create a notification for the receiver
      const notification = await prisma.notification.create({
        data: {
          content: `${user.username} sent you a friend request`,
          userId: receiverId,
          type: "FRIEND_REQUEST",
          linkId: user.id,
        },
      });

      pubsub.publish(`NEW_NOTIFICATION_${receiverId}`, {
        newNotification: notification,
      });

      pubsub.publish(`NEW_FRIEND_REQUEST_${receiverId}`, {
        newFriendRequest: friendRequest,
      });

      return friendRequest;
    },
    respondToFriendRequest: async (
      _,
      { requestId, accept },
      { prisma, user }: Context
    ) => {
      if (!user) throw new AuthenticationError("Not authenticated");

      const request = await prisma.friendRequest.findUnique({
        where: { id: requestId },
        include: { sender: true, receiver: true },
      });

      if (!request || request.receiverId !== user.id) {
        throw new AuthenticationError("Not authorized");
      }

      if (accept) {
        await prisma.user.update({
          where: { id: user.id },
          data: { friends: { connect: { id: request.senderId } } },
        });
        await prisma.user.update({
          where: { id: request.senderId },
          data: { friends: { connect: { id: user.id } } },
        });

        const notification = await prisma.notification.create({
          data: {
            content: `${request.receiver.username} accepted your friend request`,
            userId: request.senderId,
            type: "FRIEND_REQUEST",
            linkId: request.receiver.username,
          },
        });

        pubsub.publish(`NEW_NOTIFICATION_${request.senderId}`, {
          newNotification: notification,
        });
      }

      return prisma.friendRequest.delete({
        where: { id: requestId },
      });
    },
  },
  Subscription: {
    newFriendRequest: {
      subscribe: (_, __, { user }: Context) => {
        if (!user) throw new AuthenticationError("Not authenticated");
        return pubsub.asyncIterator(`NEW_FRIEND_REQUEST_${user.id}`);
      },
    },
  },
};

export default friendRequestResolver;
