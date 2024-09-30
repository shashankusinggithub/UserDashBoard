// src/types/index.ts

// User-related types
export interface User {
  isFriend: any;
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  friends: User[];
  conversations: Conversation[];
  lastLoginTime: string;
  bio: string;
  role: "USER" | "ADMIN";
  twoFactorEnabled: boolean;
}

export interface AuthPayload {
  token: string;
  user: User;
}

// Post-related types
export interface Post {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  likes: User[];
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
  createdAt: string;
  updatedAt: string;
}

// Message and Conversation types
export interface Message {
  id: string;
  conversation: Conversation;
  sender: User;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  updatedAt: string;
}

// Friend request types
export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: FriendRequestStatus;
  createdAt: string;
  updatedAt: string;
}

export enum FriendRequestStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
}

// Notification type
export interface Notification {
  id: string;
  content: string;
  user: User;
  read: boolean;
  createdAt: string;
}

// Input types for mutations
export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface CreatePostInput {
  content: string;
}

export interface UpdatePostInput {
  id: string;
  content: string;
}

export interface CreateCommentInput {
  postId: string;
  content: string;
}

export interface UpdateProfilePictureMutationVariables {
  base64Image: string;
}

export interface UpdateProfilePictureMutationResult {
  updateProfilePicture: {
    id: string;
    profilePicture: string;
  };
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface CreateConversationInput {
  participantIds: string[];
}

// Query result types
export interface MeQueryResult {
  me: User;
}

export interface UserQueryResult {
  user: User;
}

export interface UsersQueryResult {
  users: User[];
}

export interface PostsQueryResult {
  posts: Post[];
}

export interface PostQueryResult {
  post: Post;
}

export interface UserPostsQueryResult {
  userPosts: Post[];
}

export interface FriendRequestsQueryResult {
  friendRequests: FriendRequest[];
}

export interface NotificationsQueryResult {
  notifications: Notification[];
}

export interface ConversationsQueryResult {
  conversations: Conversation[];
}

export interface ConversationQueryResult {
  conversation: Conversation;
}

export interface MessagesQueryResult {
  messages: Message[];
}

// Mutation result types
export interface AuthMutationResult {
  token: string;
  user: User;
}

export interface PostMutationResult {
  post: Post;
}

export interface CommentMutationResult {
  comment: Comment;
}

export interface FriendRequestMutationResult {
  friendRequest: FriendRequest;
}

export interface NotificationMutationResult {
  notification: Notification;
}

export interface MessageMutationResult {
  message: Message;
}

export interface ConversationMutationResult {
  conversation: Conversation;
}

// Subscription types
export interface NewPostSubscription {
  newPost: Post;
}

export interface RemoveFriendMutationResult {
  removeFriend: User;
}

export interface NewFriendRequestSubscription {
  newFriendRequest: FriendRequest;
}

export interface NewMessageSubscription {
  newMessage: Message;
}

export interface NewNotificationSubscription {
  newNotification: Notification;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  bio?: string;
}

// Add new query result type
export interface UserProfileQueryResult {
  userProfile: User;
}

// Add new mutation result types
export interface UpdateProfileMutationResult {
  updateProfile: User;
}

export interface MarkNotificationAsReadMutationResult {
  markNotificationAsRead: {
    id: string;
    read: boolean;
  };
}

export interface SearchUsersQueryResult {
  users: User[];
}

export interface SendFriendRequestMutationResult {
  sendFriendRequest: FriendRequest;
}

export interface FriendRequest {
  id: string;
  sender: User;
  status: FriendRequestStatus;
  createdAt: string;
}

export interface GetFriendRequestsQueryResult {
  friendRequests: FriendRequest[];
}

export interface AcceptFriendRequestMutationResult {
  acceptFriendRequest: {
    id: string;
    status: FriendRequestStatus;
  };
}

export interface RejectFriendRequestMutationResult {
  rejectFriendRequest: {
    id: string;
    status: FriendRequestStatus;
  };
}

export interface CreateOrGetConversationMutationResult {
  createOrGetConversation: {
    id: string;
    participants: {
      id: string;
      username: string;
    }[];
  };
}
