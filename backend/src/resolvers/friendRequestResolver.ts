import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";

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
      if (!user) throw new AuthenticationError("Not authenticated");
      if (user.id === receiverId)
        throw new UserInputError("Cannot send friend request to yourself");

      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: user.id, receiverId },
            { senderId: receiverId, receiverId: user.id },
          ],
        },
      });

      if (existingRequest)
        throw new UserInputError("Friend request already exists");

      return prisma.friendRequest.create({
        data: { senderId: user.id, receiverId },
        include: { sender: true, receiver: true },
      });
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
      }

      return prisma.friendRequest.update({
        where: { id: requestId },
        data: { status: accept ? "ACCEPTED" : "REJECTED" },
        include: { sender: true, receiver: true },
      });
    },
  },
};

export default friendRequestResolver;
