import { ApolloError } from "@apollo/client";

export const handleError = (error: ApolloError | Error): string => {
  console.error(error);
  if (error instanceof ApolloError) {
    return (
      error.graphQLErrors.map((e) => e.message).join(", ") ||
      "An unexpected error occurred"
    );
  }
  return error.message || "An unexpected error occurred";
};

// src/types/index.ts
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
}

export interface Notification {
  id: string;
  content: string;
  createdAt: string;
  read: boolean;
}
