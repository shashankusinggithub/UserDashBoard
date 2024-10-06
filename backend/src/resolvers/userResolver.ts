import { IResolvers } from "@graphql-tools/utils";
import { Context } from "../context";
import { verifyGoogleToken, generateJwtToken } from "../utils/googleAuth";
import { generateSecret, verifyToken } from "../utils/twoFactor";
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-express";
import {
  comparePasswords,
  generateToken,
  hashPassword,
} from "../services/authService";

const userResolvers: IResolvers<any, Context> = {
  Query: {
    me: async (parent, args, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("User not authenticated");
      }
      return prisma.user.findUnique({ where: { id: user.id } });
    },

    user: async (parent, { id }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new UserInputError("User not found");
      }
      return user;
    },
    users: async (_, { searchTerm }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      if (!searchTerm) {
        return prisma.user.findMany({ take: 20 });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: searchTerm, mode: "insensitive" } },
            { firstName: { contains: searchTerm, mode: "insensitive" } },
            { lastName: { contains: searchTerm, mode: "insensitive" } },
          ],
        },
        take: 20,
      });
      const friends = await prisma.user.findUnique({
        where: { id: user.id },
        select: { friends: true },
      });

      const filteredUsers = users.filter((u) => u.id !== user.id);
      return filteredUsers.map((u) => {
        return {
          ...u,
          isFriend: friends?.friends.some((friend) => friend.id === u.id),
        };
      });
    },
    getFriendsList: async (_, __, { prisma, user }: Context) => {
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to view your friends"
        );

      const usersData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          friends: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              firstName: true,
              lastName: true,
              bio: true,
            },
          },
        },
      });

      return usersData?.friends || [];
    },
    getUserAnalytics: async (_, __, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          friends: true,
          posts: {
            include: {
              likes: true,
            },
          },
        },
      });

      if (!userData) {
        throw new Error("User not found");
      }

      const totalLikes = userData.posts.reduce(
        (sum, post) => sum + post.likes.length,
        0
      );

      return {
        fullname: userData.firstName + userData.lastName,
        lastLoginTime: userData.lastLoginTime.toISOString(),
        totalFriends: userData.friends.length,
        totalPosts: userData.posts.length,
        totalLikes,
      };
    },
  },
  User: {
    friends: async (parent, _, { prisma }: Context) => {
      const userData = await prisma.user.findUnique({
        where: { id: parent.id },
        include: {
          friends: {
            select: {
              id: true,
              username: true,
              profilePicture: true,
              firstName: true,
              lastName: true,
              bio: true,
            },
          },
        },
      });

      return userData?.friends || [];
    },
  },
  Mutation: {
    register: async (
      parent,
      { username, email, password, firstName, lastName },
      { prisma }
    ) => {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
      });
      if (existingUser) {
        throw new UserInputError("Username or email already taken");
      }
      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
      });
      const token = generateToken(user.id, user.username);
      return { token, user };
    },
    googleSignIn: async (parent, { accessToken }, { prisma }) => {
      const user = await verifyGoogleToken(accessToken);
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existingUser) {
        const token = generateJwtToken(existingUser);
        return { token, user: existingUser };
      }
      const newUser = await prisma.user.create({
        data: {
          username: user.email,
          email: user.email,
          firstName: user.name ? user.name.split(" ")[0] : "",
          lastName: user.name ? user.name.split(" ").slice(1).join(" ") : "",
          password: "", // Add a default empty password
          profilePicture: user.picture,
        },
      });
      const token = generateJwtToken(newUser);
      return { token, user: newUser };
    },
    login: async (parent, { email, password }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new UserInputError("Invalid credentials");
      }
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        throw new UserInputError("Invalid credentials");
      }
      if (user.twoFactorEnabled) {
        return {
          requiresTwoFactor: true,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          },
          token: null,
        };
      }
      const token = generateToken(user.id, user.username);
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginTime: new Date() },
      });
      return { token, user, requiresTwoFactor: false };
    },
    updateProfile: async (
      parent,
      { firstName, lastName, bio },
      { prisma, user }
    ) => {
      if (!user) {
        throw new AuthenticationError("User not authenticated");
      }
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { firstName, lastName, bio },
      });
      return updatedUser;
    },
    updateProfilePicture: async (parent, { base64Image }, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("User not authenticated");
      }
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: base64Image }, // Assuming base64Image is stored directly
      });
      return updatedUser;
    },
    removeFriend: async (_, { friendId }, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to remove a friend"
        );
      }

      const friend = await prisma.user.findUnique({ where: { id: friendId } });
      if (!friend) {
        throw new UserInputError("Friend not found");
      }

      // Check if they are actually friends
      const areFriends = await prisma.user.findFirst({
        where: {
          id: user.id,
          friends: {
            some: {
              id: friendId,
            },
          },
        },
      });

      if (!areFriends) {
        throw new UserInputError("You are not friends with this user");
      }

      // Remove the friend connection
      await prisma.user.update({
        where: { id: user.id },
        data: {
          friends: {
            disconnect: { id: friendId },
          },
        },
      });

      // Remove the reverse friend connection
      await prisma.user.update({
        where: { id: friendId },
        data: {
          friends: {
            disconnect: { id: user.id },
          },
        },
      });

      // Remove any existing FriendRequest records between these users
      await prisma.friendRequest.deleteMany({
        where: {
          OR: [
            { senderId: user.id, receiverId: friendId },
            { senderId: friendId, receiverId: user.id },
          ],
        },
      });

      // Fetch and return the updated user
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { friends: true },
      });

      return updatedUser;
    },
    updateUserRole: async (_, { userId, role }, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }
      const userDetails = await prisma.user.findUnique({
        where: { id: user.id },
      });
      if (userDetails.role !== "ADMIN") {
        throw new ForbiddenError("Only admins can update user roles");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      return updatedUser;
    },
    generateTwoFactorSecret: async (_, __, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      const { secret, otpauthUrl } = await generateSecret(user.email);

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: secret },
      });

      return { secret, otpauthUrl };
    },

    enableTwoFactor: async (_, { token }, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !dbUser.twoFactorSecret) {
        throw new Error("Two-factor secret not found");
      }

      const isValid = verifyToken(dbUser.twoFactorSecret, token);
      if (!isValid) {
        throw new Error("Invalid token");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true },
      });

      return true;
    },

    disableTwoFactor: async (_, { password }, { prisma, user }) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser) {
        throw new ForbiddenError("User not found");
      }

      const isPasswordValid = await comparePasswords(password, dbUser.password);
      if (!isPasswordValid) {
        throw new ForbiddenError("Invalid password");
      }

      if (!dbUser.twoFactorEnabled) {
        throw new ForbiddenError("Two-factor authentication is not enabled");
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });

      return true;
    },

    verifyTwoFactor: async (_, { email, token }, { prisma }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.twoFactorSecret || !user.twoFactorEnabled) {
        throw new AuthenticationError("Invalid credentials or 2FA not enabled");
      }

      const isValid = verifyToken(user.twoFactorSecret, token);
      if (!isValid) {
        throw new AuthenticationError("Invalid 2FA token");
      }

      const jwtToken = generateToken(user.id, user.username);
      return { token: jwtToken, user };
    },
  },
};

export default userResolvers;
