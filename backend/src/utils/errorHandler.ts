import { ApolloError } from "apollo-server-express";

export const handleError = (error: Error): ApolloError => {
  console.error("Error:", error);

  if (error instanceof ApolloError) {
    return error;
  }

  return new ApolloError("Internal server error", "INTERNAL_SERVER_ERROR");
};
