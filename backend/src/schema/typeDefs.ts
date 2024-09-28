import { gql } from "apollo-server-express";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    profilePicture: String
    friends: [User!]!
    conversations: [Conversation]
    lastLoginTime: String
    isFriend: Boolean!
    bio: String
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    messages: [Message!]!
    lastMessage: Message
    updatedAt: String!
  }

  type Message {
    id: ID!
    conversation: Conversation!
    sender: User!
    content: String!
    createdAt: String!
  }
  type Friend {
    id: ID!
    user: User!
    friend: User!
  }

  type Post {
    id: ID!
    content: String!
    author: User!
    createdAt: String!
    updatedAt: String
    comments: [Comment]
    likes: [Like]
    likedByMe: Boolean!
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
    updatedAt: String
  }

  type FriendRequest {
    id: ID!
    sender: User!
    receiver: User!
    status: FriendRequestStatus!
    createdAt: String!
    updatedAt: String
  }
  type Like {
    id: ID!
    user: User!
    post: Post!
    createdAt: String!
  }

  enum FriendRequestStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type Notification {
    id: ID!
    content: String!
    user: User!
    read: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    user(id: ID!): User
    users(searchTerm: String): [User]
    posts: [Post]
    post(id: ID!): Post
    userPosts(userId: ID!): [Post]
    friendRequests: [FriendRequest]
    notifications: [Notification]
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!): [Message!]!
    friends: [User!]!
  }

  type Mutation {
    register(
      username: String!
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(firstName: String!, lastName: String!, bio: String!): User
    createPost(content: String!): Post
    updatePost(id: ID!, content: String!): Post
    deletePost(id: ID!): Boolean
    likePost(id: ID!): Post
    createComment(postId: ID!, content: String!): Comment
    sendFriendRequest(receiverId: ID!): FriendRequest
    respondToFriendRequest(requestId: ID!, accept: Boolean!): FriendRequest
    markNotificationAsRead(notificationId: ID!): Notification
    createConversation(participantIds: [ID!]!): Conversation!
    sendMessage(conversationId: ID!, content: String!): Message!
    updateProfilePicture(base64Image: String!): User
  }

  type Subscription {
    newPost: Post
    newFriendRequest: FriendRequest
    newMessage(conversationId: ID!): Message!
    newNotification: Notification
  }
`;

export default typeDefs;
