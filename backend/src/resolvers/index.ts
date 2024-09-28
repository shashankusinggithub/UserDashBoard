import { mergeResolvers } from "@graphql-tools/merge";
import { IResolvers, IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../context";
import { applyRateLimiter } from "../utils/applyRateLimiter";

import userResolver from "./userResolver";
import messageResolver from "./messageResolver";
import notificationResolver from "./notificationResolver";
import postResolver from "./postResolver";
import friendRequestResolver from "./friendRequestResolver";

// Function to apply rate limiter to all resolvers in an object
const applyRateLimiterToResolvers = (resolvers: IResolvers): IResolvers => {
  const wrappedResolvers: IResolvers = {};

  for (const type in resolvers) {
    wrappedResolvers[type] = {};
    for (const field in resolvers[type]) {
      if (typeof resolvers[type][field] === "function") {
        wrappedResolvers[type][field] = applyRateLimiter(
          resolvers[type][field] as IFieldResolver<any, Context>,
          { windowMs: 60000, max: 100 } // Global limit: 100 requests per minute
        );
      } else {
        wrappedResolvers[type][field] = resolvers[type][field];
      }
    }
  }

  return wrappedResolvers;
};

// Apply rate limiting to each resolver set
const rateListedResolvers = [
  applyRateLimiterToResolvers(userResolver),
  applyRateLimiterToResolvers(messageResolver),
  applyRateLimiterToResolvers(notificationResolver),
  applyRateLimiterToResolvers(postResolver),
  applyRateLimiterToResolvers(friendRequestResolver),
];

// Merge the rate-limited resolvers
const resolvers = mergeResolvers(rateListedResolvers);

export default resolvers;
