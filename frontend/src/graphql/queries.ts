import { gql } from "@apollo/client";

export const GET_POSTS = gql`
  query GetPosts {
    posts {
      id
      content
      author {
        username
        profilePicture
      }
      createdAt
      likes {
        id
      }
    }
  }
`;

export const GET_CONVERSATIONS = gql`
  query GetConversations {
    conversations {
      id
      participants {
        id
        user {
          id
          username
          profilePicture
        }
      }
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          username
        }
      }
      updatedAt
    }
  }
`;

export const GET_CONVERSATION = gql`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      participants {
        id
        user {
          id
          username
          profilePicture
        }
      }
      messages {
        id
        content
        createdAt
        sender {
          id
          username
          profilePicture
        }
      }
      updatedAt
    }
  }
`;
export const NEW_POST_SUBSCRIPTION = gql`
  subscription NewPostSubscription {
    newPost {
      id
      content
      author {
        id
        username
        profilePicture
      }
      createdAt
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      sender {
        id
        username
      }
      createdAt
    }
  }
`;

export const GET_USER_ANALYTICS = gql`
  query GetUserAnalytics {
    getUserAnalytics {
      fullname
      lastLoginTime
      totalFriends
      totalPosts
      totalLikes
    }
  }
`;

export const GET_FRIENDS_LIST = gql`
  query GetFriendsList {
    getFriendsList {
      id
      username
      profilePicture
    }
  }
`;

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      id
      content
      createdAt
      read
    }
  }
`;

export const GET_FRIEND_REQUESTS = gql`
  query GetFriendRequests {
    friendRequests {
      id
      sender {
        id
        username
      }
      receiver {
        id
        username
      }
      status
    }
  }
`;

export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      username
      email
      firstName
      lastName
      profilePicture
      bio
      twoFactorEnabled
    }
  }
`;
export const SEARCH_USERS = gql`
  query SearchUsers($searchTerm: String!) {
    users(searchTerm: $searchTerm) {
      id
      username
      firstName
      lastName
      profilePicture
      isFriend
    }
  }
`;
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      email
      role
    }
  }
`;
