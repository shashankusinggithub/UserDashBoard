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
    role: Role!
    twoFactorSecret: String
    twoFactorEnabled: Boolean!
  }

  type UnreadCounts {
    notifications: Int!
    friendRequests: Int!
    messages: Int!
  }

  type LoginResult {
    token: String
    user: User
    requiresTwoFactor: Boolean!
  }
  enum Role {
    USER
    ADMIN
  }

  type Conversation {
    id: ID!
    participants: [ConversationParticipant!]!
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
  }

  type Comment {
    id: ID!
    content: String!
    author: User!
    post: Post!
    createdAt: String!
    updatedAt: String
  }
  type ChatMessage {
    id: ID!
    senderId: ID!
    receiverId: ID!
    content: String!
    createdAt: String!
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
    linkId: String
  }

  type ConversationParticipant {
    id: ID!
    user: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    user(id: ID!): User
    users(searchTerm: String): [User]
    posts(friendsOnly: Boolean!): [Post!]!
    post(id: ID!): Post
    userPosts(userId: ID!): [Post]
    friendRequests: [FriendRequest]
    notifications: [Notification]
    conversations: [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!): [Message!]!
    getUserAnalytics: Analytics!
    getFriendsList: [User!]!
    getUnreadCounts: UnreadCounts!
    getDirectMessages(otherUserId: ID!): [ChatMessage!]!
  }

  type Mutation {
    sendDirectMessage(receiverId: ID!, content: String!): ChatMessage!
    removeFriend(friendId: ID!): User!
    markNotificationAsRead(id: ID!): Notification!
    testNotification: Boolean!
    register(
      username: String!
      email: String!
      password: String!
      firstName: String!
      lastName: String!
    ): AuthPayload
    login(email: String!, password: String!): LoginResult!
    verifyTwoFactor(email: String!, token: String!): AuthPayload!
    updateProfile(firstName: String!, lastName: String!, bio: String!): User
    createPost(content: String!): Post
    updatePost(id: ID!, content: String!): Post
    deletePost(id: ID!): Boolean
    likePost(id: ID!): Post
    createComment(postId: ID!, content: String!): Comment
    sendFriendRequest(receiverId: ID!): FriendRequest
    respondToFriendRequest(requestId: ID!, accept: Boolean!): FriendRequest
    createConversation(participantIds: [ID!]!): Conversation!
    sendMessage(conversationId: ID!, content: String!): Message!
    updateProfilePicture(base64Image: String!): User
    googleSignIn(accessToken: String!): AuthPayload!
    updateUserRole(userId: ID!, role: Role!): User
    generateTwoFactorSecret: TwoFactorSecret!
    enableTwoFactor(token: String!): Boolean!
    disableTwoFactor(password: String!): Boolean!
  }
  type TwoFactorSecret {
    secret: String!
    otpauthUrl: String!
  }

  type Subscription {
    newPost: Post
    newMessage: Message!
    newNotification: Notification!
    newFriendRequest: FriendRequest!
    newDirectMessage(userId: ID!): ChatMessage!
  }
  type Analytics {
    fullname: String
    lastLoginTime: String
    totalFriends: Int
    totalPosts: Int
    totalLikes: Int
  }
`;

export default typeDefs;
