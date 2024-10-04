import { ApolloError } from "@apollo/client";

export const handleError = (error: ApolloError | Error): string => {
  if (error instanceof ApolloError) {
    console.log(error);
    return (
      error.graphQLErrors.map((e) => e.message).join(", ") ||
      "An unexpected error occurred"
    );
  }
  return error.message || "An unexpected error occurred";
};
