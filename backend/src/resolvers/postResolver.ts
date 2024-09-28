import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";
import { pubsub } from "../pubsub";
import redis from "../utils/redis";

const postResolver: IResolvers = {
  Query: {
    posts: async (_, __, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const cachedPosts = await redis.get("all_posts");
      if (cachedPosts) {
        return JSON.parse(cachedPosts);
      }

      const posts = await prisma.post.findMany({
        include: { author: true, comments: true, likes: true },
      });
      const modifiedPosts = posts.map((post) => ({
        ...post,
        likedByMe: post.likes.some((like) => like.userId === user.id), // Check if the current user liked the post
      }));
      await redis.set("all_posts", JSON.stringify(modifiedPosts), "EX", 3600);
      return modifiedPosts;
    },
    post: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const post = await prisma.post.findUnique({
        where: { id },
        include: { author: true, comments: true, likes: true },
      });
      return {
        ...post,
        likedByMe: post?.likes.some((like) => like.userId === user.id),
      };
    },
    userPosts: async (_, { userId }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const posts = await prisma.post.findMany({
        where: { authorId: userId },
        include: { author: true, comments: true, likes: true },
      });
      return posts.map((post) => ({
        ...post,
        likedByMe: post.likes.some((like) => like.userId === user.id),
      }));
    },
  },
  Mutation: {
    createPost: async (_, { content }, { prisma, user }: Context) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to create a post");
      }

      if (!content) {
        throw new UserInputError("A post must have either content or an image");
      }

      if (content && content.length > 500) {
        throw new UserInputError("Post content must be 500 characters or less");
      }
      console.log(user);

      try {
        const newPost = await prisma.post.create({
          data: {
            content,

            author: { connect: { id: user.id } },
          },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profilePicture: true,
              },
            },
          },
        });

        // Publish the new post event for subscriptions
        pubsub.publish("NEW_POST", { newPost });

        // Create notifications for the author's friends
        const friendIds = await prisma.user
          .findUnique({
            where: { id: user.id },
            select: { friends: { select: { id: true } } },
          })
          .then((data) => data?.friends.map((friend) => friend.id) || []);

        await prisma.notification.createMany({
          data: friendIds.map((friendId) => ({
            type: "NEW_POST",
            content: `${user.username} has created a new post`,
            userId: friendId,
          })),
        });

        return newPost;
      } catch (error) {
        console.error("Error creating post:", error);
        throw new Error("Failed to create post. Please try again.");
      }
    },
    updatePost: async (_, { id, content }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const post = await prisma.post.findUnique({ where: { id } });
      if (post?.authorId !== user.id)
        throw new AuthenticationError("Not authorized");
      return prisma.post.update({
        where: { id },
        data: { content },
        include: { author: true },
      });
    },
    deletePost: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const post = await prisma.post.findUnique({ where: { id } });
      if (post?.authorId !== user.id)
        throw new AuthenticationError("Not authorized");
      await prisma.post.delete({ where: { id } });
      return true;
    },
    likePost: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return prisma.post.update({
        where: { id },
        data: { likes: { create: { userId: user.id } } },
        include: { author: true },
      });
    },
  },
};

export default postResolver;
