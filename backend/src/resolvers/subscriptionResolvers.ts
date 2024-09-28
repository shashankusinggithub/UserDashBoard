import { IResolvers } from "@graphql-tools/utils";
import { withFilter } from "graphql-subscriptions";
import { Context } from "../context";
import { pubsub } from "../pubsub";

const subscriptionResolvers: IResolvers = {
  Subscription: {
    newPost: {
      subscribe: () => pubsub.asyncIterator(["NEW_POST"]),
    },
    newFriendRequest: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["NEW_FRIEND_REQUEST"]),
        (payload, _, { user }: Context) => {
          return payload.newFriendRequest.receiverId === user.id;
        }
      ),
    },
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["NEW_MESSAGE"]),
        (payload, variables, { user }: Context) => {
          return payload.newMessage.receiverId === user.id;
        }
      ),
    },
    newNotification: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(["NEW_NOTIFICATION"]),
        (payload, _, { user }: Context) => {
          return payload.newNotification.userId === user.id;
        }
      ),
    },
  },
};

export default subscriptionResolvers;
