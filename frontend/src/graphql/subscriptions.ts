import { gql } from "@apollo/client";

export const NEW_MESSAGE_SUBSCRIPTION = gql`
  subscription OnNewMessage {
    newMessage {
      id
      content
      sender {
        id
        username
      }
      conversation {
        id
      }
      createdAt
    }
  }
`;

export const NEW_DIRECT_MESSAGE_SUBSCRIPTION = gql`
  subscription NewDirectMessage($userId: ID!) {
    newDirectMessage(userId: $userId) {
      id
      senderId
      receiverId
      content
      createdAt
    }
  }
`;

export const NEW_NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNewNotification {
    newNotification {
      id
      content
      createdAt
      read
      linkId
    }
  }
`;

export const NEW_POST_SUBSCRIPTION = gql`
  subscription OnNewPost {
    newPost {
      id
      content
      author {
        id
        username
      }
      createdAt
    }
  }
`;

export const NEW_FRIEND_REQUEST_SUBSCRIPTION = gql`
  subscription OnNewFriendRequest {
    newFriendRequest {
      id
      sender {
        id
        username
      }
    }
  }
`;
