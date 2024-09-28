import { IFieldResolver } from "@graphql-tools/utils";
import { Context } from "../context";

export const applyRateLimiter = (
  resolver: IFieldResolver<any, Context>,
  options: { windowMs: number; max: number }
) => {
  return async (parent: any, args: any, context: Context, info: any) => {
    await context.rateLimiter(options);
    return resolver(parent, args, context, info);
  };
};
