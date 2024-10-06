import { IResolvers } from "@graphql-tools/utils";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { Context } from "../context";
import { setCache, getCache } from "../utils/redis";

import { pubsub } from "../pubsub";
import redis from "../utils/redis";

const ALL_POSTS_CACHE_KEY = "posts:all";

const postResolver: IResolvers = {
  Query: {
    posts: async (_, { friendsOnly }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      let cacheKey = friendsOnly
        ? `posts:friends:${user.id}`
        : ALL_POSTS_CACHE_KEY;
      const cachedPosts = await getCache(cacheKey);

      if (cachedPosts) {
        return cachedPosts;
      }
      let posts;
      if (friendsOnly) {
        // Get the user's friend IDs
        const friendIds = await prisma.user
          .findUnique({ where: { id: user.id } })
          .friends()
          .then((friends) => friends.map((friend) => friend.id));

        // Include the user's own posts as well
        friendIds.push(user.id);

        posts = await prisma.post.findMany({
          where: {
            authorId: { in: friendIds },
          },
          include: { author: true, comments: true, likes: true },
          orderBy: { createdAt: "desc" },
        });
      } else {
        posts = await prisma.post.findMany({
          include: { author: true, comments: true, likes: true },
          orderBy: { createdAt: "desc" },
        });
      }
      await setCache(cacheKey, posts);
      return posts;
    },
    post: async (_, { id }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      const post = await prisma.post.findUnique({
        where: { id },
        include: { author: true, comments: true, likes: true },
      });
      return {
        ...post,
      };
    },
    userPosts: async (_, { userId }, { prisma, user }: Context) => {
      if (!user) throw new AuthenticationError("Not authenticated");
      return prisma.post.findMany({
        where: { authorId: userId },
        include: { author: true, comments: true, likes: true },
      });
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

        pubsub.publish("NEW_POST", { newPost });
        await invalidatePostCaches({ userId: user.id, allPosts: true });

        const friendIds = await prisma.user
          .findUnique({
            where: { id: user.id },
            select: { friends: { select: { id: true } } },
          })
          .then((data) => data?.friends.map((friend) => friend.id) || []);

        for (const friendId of friendIds) {
          let notification = await prisma.notification.create({
            data: {
              type: "NEW_POST",
              content: `${user.username} has created a new post`,
              userId: friendId,
              linkId: newPost.id,
            },
          });
          console.log(`Publishing notification for user ${friendId}`);
          console.log(notification);
          pubsub.publish(`NEW_NOTIFICATION_${friendId}`, {
            newNotification: notification,
          });
        }

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
      const post = await prisma.post.update({
        where: { id },
        data: { likes: { create: { userId: user.id } } },
        include: { author: true },
      });

      if (post.author.id !== user.id) {
        const notification = await prisma.notification.create({
          data: {
            content: `${user.username} liked your post`,
            userId: post.author.id,
            type: "NEW_LIKE",
            linkId: id,
          },
        });

        pubsub.publish(`NEW_NOTIFICATION_${post.author.id}`, {
          newNotification: notification,
        });
      }

      return post;
    },
  },

  Subscription: {
    newPost: {
      subscribe: () => {
        try {
          return pubsub.asyncIterator(["NEW_POST"]);
        } catch (error) {
          console.error("Error setting up newPost subscription:", error);
          throw new Error("Failed to set up subscription");
        }
      },
      resolve: (payload) => {
        return payload.newPost;
      },
    },
  },
};

async function invalidatePostCaches(invalidators: {
  userId: string;
  allPosts?: boolean;
}) {
  const cacheKeys = [
    `posts:friends:${invalidators.userId}`, // friends only posts for this user
  ];
  if (invalidators.allPosts) {
    console.log("resetting all posts");
    cacheKeys.push(ALL_POSTS_CACHE_KEY);
  }

  for (const key of cacheKeys) {
    await setCache(key, null, 1); // Set to null and expire immediately
  }
}
export default postResolver;
